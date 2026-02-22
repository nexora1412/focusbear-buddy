import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { iceBear } from '@/lib/iceBearMessages';

interface VisionItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface Props {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export function VisionBoardPage({ theme, setCurrentPage }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<VisionItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [bearMessage, setBearMessage] = useState('');
  const [form, setForm] = useState({ title: '', content: '', category: 'thought' });

  const fetchItems = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('vision_board')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setItems(data as unknown as VisionItem[]);
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.title.trim()) return;
    await supabase.from('vision_board').insert({
      user_id: user.id,
      title: form.title,
      content: form.content,
      category: form.category,
    });
    setBearMessage(iceBear.visionBoardReply(form.title + ' ' + form.content));
    setForm({ title: '', content: '', category: 'thought' });
    setShowForm(false);
    await fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('vision_board').delete().eq('id', id);
    await fetchItems();
  };

  const categoryEmoji: Record<string, string> = {
    thought: '💭',
    dream: '✨',
    goal: '🎯',
    quote: '💬',
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} variant="outline" className="mb-6">← Back</Button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">🧠 Vision Board</h1>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Entry'}</Button>
        </div>

        {bearMessage && (
          <Card className="p-4 mb-6 border-2 bg-muted/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐻‍❄️</span>
              <p className="text-sm whitespace-pre-line text-foreground">{bearMessage}</p>
            </div>
            <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setBearMessage('')}>Dismiss</Button>
          </Card>
        )}

        <Card className="p-4 mb-6 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            🧊 <strong>Ice Bear allows creativity. Barely.</strong> Random thoughts, dreams, goals, motivational quotes — Ice Bear will comment on all of them. Board updates daily. Ice Bear occasionally adds frozen memes for "inspiration."
          </div>
        </Card>

        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder="Title (e.g. 'Build a robot')" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Details, thoughts, dreams..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="thought">💭 Random Thought</option>
                <option value="dream">✨ Dream</option>
                <option value="goal">🎯 Goal</option>
                <option value="quote">💬 Quote</option>
              </select>
              <Button type="submit" className="w-full">Add to Vision Board</Button>
            </form>
          </Card>
        )}

        {items.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-2xl mb-2">🐻‍❄️</p>
            <p className="text-sm text-muted-foreground">Vision Board is empty. Dreams are good. Plans are better. Ice Bear prefers spreadsheets.</p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <Card key={item.id} className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{categoryEmoji[item.category] || '💭'}</span>
                <h3 className="font-semibold text-sm">{item.title}</h3>
              </div>
              {item.content && <p className="text-sm text-muted-foreground mb-3 line-clamp-4">{item.content}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
