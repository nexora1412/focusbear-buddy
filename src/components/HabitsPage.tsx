import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStudyData } from '@/hooks/useStudyData';

interface Props {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export function HabitsPage({ theme, setCurrentPage }: Props) {
  const { habits, addHabit, completeHabit, deleteHabit } = useStudyData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', frequency: 'daily' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addHabit(form.title, form.description, form.frequency);
    setForm({ title: '', description: '', frequency: 'daily' });
    setShowForm(false);
  };

  const today = new Date().toDateString();

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} variant="outline" className="mb-6">← Back</Button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">📅 Habits</h1>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Habit'}</Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder="Habit name (e.g. Read 20 pages)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <Button type="submit" className="w-full">Add Habit (+5 🪙 per completion)</Button>
            </form>
          </Card>
        )}

        {habits.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-4xl mb-4">🌱</p>
            <p className="text-muted-foreground">No habits yet. Build good routines!</p>
          </Card>
        )}

        <div className="space-y-3">
          {habits.map(habit => {
            const doneToday = habit.last_completed_date === today;
            return (
              <Card key={habit.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{habit.title}</h3>
                      {doneToday && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Done today ✓</span>}
                    </div>
                    {habit.description && <p className="text-sm text-muted-foreground mb-1">{habit.description}</p>}
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>🔥 {habit.current_streak} streak</span>
                      <span>🏆 Best: {habit.best_streak}</span>
                      <span>✅ {habit.total_completions} total</span>
                      <span>📅 {habit.frequency}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!doneToday && <Button size="sm" onClick={() => completeHabit(habit.id)}>✓ Done</Button>}
                    <Button size="sm" variant="outline" onClick={() => deleteHabit(habit.id)}>✕</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
