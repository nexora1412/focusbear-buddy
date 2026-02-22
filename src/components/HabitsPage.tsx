import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStudyData } from '@/hooks/useStudyData';
import { useFocusData } from '@/hooks/useFocusData';
import { iceBear, renderProgressBar } from '@/lib/iceBearMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from '@/hooks/use-toast';

interface Props {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export function HabitsPage({ theme, setCurrentPage }: Props) {
  const { habits, addHabit, completeHabit, deleteHabit } = useStudyData();
  const { stats } = useFocusData();
  const { sendNotification } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [bearMessage, setBearMessage] = useState('');
  const [form, setForm] = useState({ title: '', description: '', frequency: 'daily', target_days: 21 });
  const [showDurationChoice, setShowDurationChoice] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    
    if (form.target_days > 30 && !showDurationChoice) {
      setShowDurationChoice(true);
      setBearMessage(iceBear.habitCreated(form.title, form.target_days));
      return;
    }

    await addHabit(form.title, form.description, form.frequency);
    setBearMessage(iceBear.habitCreated(form.title, form.target_days));
    toast({ title: '🧊 Habit Tracked', description: `Ice Bear monitors "${form.title}" for ${form.target_days} days.` });
    setForm({ title: '', description: '', frequency: 'daily', target_days: 21 });
    setShowForm(false);
    setShowDurationChoice(false);
  };

  const handleComplete = async (habitId: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const newStreak = (habit.current_streak || 0) + 1;
    const coins = habit.coins_per_completion || 5;
    setBearMessage(iceBear.habitCompleted(newStreak, coins, stats.daily_coins + coins));
    sendNotification('🧊 Habit Done!', `+${coins} coins. Streak: ${newStreak} 🔥`);
    await completeHabit(habitId);
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

        {/* Ice Bear Message */}
        {bearMessage && (
          <Card className="p-4 mb-6 border-2 bg-muted/30">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🐻‍❄️</span>
              <p className="text-sm whitespace-pre-line text-foreground">{bearMessage}</p>
            </div>
            <Button size="sm" variant="ghost" className="mt-2 text-xs" onClick={() => setBearMessage('')}>Dismiss</Button>
          </Card>
        )}

        {/* Coin Ledger */}
        <Card className="p-4 mb-6 bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <span className="text-sm font-semibold">Ice Bear's Coin Ledger</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <span>✅ Complete: +1 🪙</span>
            <span>❌ Fail: -2 🪙</span>
            <span>🚫 Quit: -10 🪙</span>
          </div>
        </Card>

        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder="Habit name (e.g. Push-ups)" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Input placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Duration (days)</label>
                  <Input type="number" min={7} max={365} value={form.target_days} onChange={e => setForm({ ...form, target_days: parseInt(e.target.value) || 21 })} />
                </div>
              </div>

              {showDurationChoice && (
                <Card className="p-4 bg-muted/30 border-2">
                  <p className="text-sm mb-3">🧊 Ice Bear asks: Are you sure about {form.target_days} days?</p>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => { setForm({ ...form, target_days: 21 }); setShowDurationChoice(false); }}>
                      [1] Switch to 21 Days (recommended)
                    </Button>
                    <Button type="button" size="sm" onClick={() => setShowDurationChoice(false)}>
                      [2] Keep {form.target_days} Days (pain incoming)
                    </Button>
                  </div>
                </Card>
              )}

              <Button type="submit" className="w-full">Add Habit ({form.target_days}-day challenge)</Button>
            </form>
          </Card>
        )}

        {habits.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-2xl mb-2">🐻‍❄️</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line">{iceBear.habitEmpty()}</p>
          </Card>
        )}

        <div className="space-y-4">
          {habits.map(habit => {
            const doneToday = habit.last_completed_date === today;
            const targetDays = 21; // default since we can't read target_days from DB type yet
            const progress = Math.min(habit.total_completions || 0, targetDays);
            
            return (
              <Card key={habit.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{habit.title}</h3>
                      {doneToday && <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Done today ✓</span>}
                    </div>
                    {habit.description && <p className="text-sm text-muted-foreground mb-1">{habit.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    {!doneToday && <Button size="sm" onClick={() => handleComplete(habit.id)}>✓ Done</Button>}
                    {!doneToday && (
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => {
                        setBearMessage(iceBear.habitFailed(2, stats.daily_coins - 2));
                      }}>✗ Failed</Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => deleteHabit(habit.id)}>🗑</Button>
                  </div>
                </div>

                {/* Progress Grid */}
                <div className="mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>Day {progress}/{targetDays}</span>
                    <span>⏳ {renderProgressBar(progress, targetDays)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.round((progress / targetDays) * 100)}%` }}></div>
                  </div>
                </div>

                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>🔥 {habit.current_streak} streak</span>
                  <span>🏆 Best: {habit.best_streak}</span>
                  <span>✅ {habit.total_completions} total</span>
                  <span>📅 {habit.frequency}</span>
                  <span>🪙 {habit.coins_per_completion}/completion</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
