import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { uploadFile, getFileType } from '@/lib/fileUpload';
import { toast } from '@/hooks/use-toast';

interface LibraryItem {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string;
  category: string;
  created_at: string;
}

interface Props {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export function LibraryPage({ theme, setCurrentPage }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'book' });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filter, setFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('library')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setItems(data as unknown as LibraryItem[]);
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    setUploading(true);

    let fileUrl: string | null = null;
    let fileType = 'other';

    if (selectedFile) {
      fileUrl = await uploadFile(user.id, selectedFile, 'library');
      fileType = getFileType(selectedFile);
    }

    await supabase.from('library').insert({
      user_id: user.id,
      title: form.title,
      description: form.description || null,
      file_url: fileUrl,
      file_type: fileType,
      category: form.category,
    });

    toast({ title: '🧊 Library Updated', description: `Ice Bear files "${form.title}". Ice Bear approves organization.` });
    setForm({ title: '', description: '', category: 'book' });
    setSelectedFile(null);
    setShowForm(false);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('library').delete().eq('id', id);
    await fetchItems();
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.file_type === filter || i.category === filter);

  const categoryEmoji: Record<string, string> = {
    book: '📚',
    reference: '📖',
    notes: '📝',
    other: '📁',
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} variant="outline" className="mb-6">← Back</Button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">📚 Library</h1>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Resource'}</Button>
        </div>

        <Card className="p-4 mb-6 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            🧊 <strong>Ice Bear's Library Rules:</strong> Upload PDFs, images, books. Ice Bear organizes. Ice Bear judges messy file names. Silently.
          </div>
        </Card>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pdf', 'image', 'book', 'reference'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)} className="text-xs capitalize">
              {f === 'all' ? '📋 All' : f === 'pdf' ? '📄 PDFs' : f === 'image' ? '🖼️ Images' : f === 'book' ? '📚 Books' : '📖 Reference'}
            </Button>
          ))}
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder="Title (e.g. 'Calculus Textbook')" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description or notes..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="book">📚 Book</option>
                <option value="reference">📖 Reference</option>
                <option value="notes">📝 Notes</option>
                <option value="other">📁 Other</option>
              </select>
              <div className="border-2 border-dashed border-input rounded-md p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="library-upload"
                />
                <label htmlFor="library-upload" className="cursor-pointer">
                  <p className="text-2xl mb-2">📎</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedFile ? `✅ ${selectedFile.name}` : 'Click to upload PDF or Image'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG, WebP (max 20MB)</p>
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? '🧊 Ice Bear is uploading...' : 'Add to Library'}
              </Button>
            </form>
          </Card>
        )}

        {filtered.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-2xl mb-2">🐻‍❄️</p>
            <p className="text-sm text-muted-foreground">Library is empty. Ice Bear suggests adding study materials. Knowledge is power... and also good for fixing refrigerators.</p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <Card key={item.id} className="p-5 overflow-hidden">
              {/* Preview */}
              {item.file_url && item.file_type === 'image' && (
                <div className="mb-3 rounded-md overflow-hidden bg-muted aspect-video">
                  <img src={item.file_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              {item.file_url && item.file_type === 'pdf' && (
                <div className="mb-3 rounded-md bg-muted p-4 text-center">
                  <span className="text-4xl">📄</span>
                  <p className="text-xs text-muted-foreground mt-1">PDF Document</p>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span>{categoryEmoji[item.category] || '📁'}</span>
                <h3 className="font-semibold text-sm truncate">{item.title}</h3>
              </div>
              {item.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>}
              <div className="flex gap-2">
                {item.file_url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={item.file_url} target="_blank" rel="noopener noreferrer">
                      {item.file_type === 'pdf' ? '📄 Open' : '🖼️ View'}
                    </a>
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
