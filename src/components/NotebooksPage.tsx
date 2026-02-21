import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStudyData, Notebook } from '@/hooks/useStudyData';

interface Props {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export function NotebooksPage({ theme, setCurrentPage }: Props) {
  const { notebooks, addNotebook, updateNotebook, deleteNotebook } = useStudyData();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'general' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addNotebook(form.title, form.content, form.category);
    setForm({ title: '', content: '', category: 'general' });
    setShowForm(false);
  };

  const handleUpdate = async (id: string) => {
    await updateNotebook(id, { title: form.title, content: form.content, category: form.category });
    setEditing(null);
    setForm({ title: '', content: '', category: 'general' });
  };

  const startEdit = (nb: Notebook) => {
    setEditing(nb.id);
    setForm({ title: nb.title, content: nb.content, category: nb.category });
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} variant="outline" className="mb-6">← Back</Button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">📓 Notebooks</h1>
          <Button onClick={() => { setShowForm(!showForm); setEditing(null); }}>{showForm ? 'Cancel' : '+ New Notebook'}</Button>
        </div>

        {(showForm || editing) && (
          <Card className="p-6 mb-6">
            <form onSubmit={editing ? (e) => { e.preventDefault(); handleUpdate(editing); } : handleAdd} className="space-y-4">
              <Input placeholder="Notebook title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Write your notes here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="min-h-[200px]" />
              <Input placeholder="Category (e.g. math, science)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
              <Button type="submit" className="w-full">{editing ? 'Update' : 'Create'} Notebook</Button>
            </form>
          </Card>
        )}

        {notebooks.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-muted-foreground">No notebooks yet. Create one to start taking notes!</p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notebooks.map(nb => (
            <Card key={nb.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{nb.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{nb.category}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{nb.content || 'Empty notebook'}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(nb)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => deleteNotebook(nb.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
