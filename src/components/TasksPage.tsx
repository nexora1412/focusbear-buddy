import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStudyData, Task } from '@/hooks/useStudyData';
import { useNotifications } from '@/hooks/useNotifications';

interface Props {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export function TasksPage({ theme, setCurrentPage }: Props) {
  const { tasks, addTask, completeTask, deleteTask } = useStudyData();
  const { requestPermission, scheduleReminder } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', scheduled_time: '', estimated_minutes: 30, priority: 'medium' });

  useEffect(() => { requestPermission(); }, [requestPermission]);

  // Schedule reminders for tasks with scheduled_time
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    tasks.filter(t => t.status === 'pending' && t.scheduled_time).forEach(task => {
      const now = new Date();
      const [hours, minutes] = (task.scheduled_time || '09:00').split(':').map(Number);
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      const diff = target.getTime() - now.getTime();
      if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        cleanups.push(scheduleReminder(`📋 Task Reminder`, `Time to work on: ${task.title}`, diff));
      }
    });
    return () => cleanups.forEach(fn => fn());
  }, [tasks, scheduleReminder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addTask(form);
    setForm({ title: '', description: '', due_date: '', scheduled_time: '', estimated_minutes: 30, priority: 'medium' });
    setShowForm(false);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} variant="outline" className="mb-6">← Back</Button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">✅ Tasks</h1>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Task'}</Button>
        </div>

        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Task title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Due Date</label>
                  <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Daily Reminder Time</label>
                  <Input type="time" value={form.scheduled_time} onChange={e => setForm({ ...form, scheduled_time: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Estimated Minutes</label>
                  <Input type="number" min={5} max={480} value={form.estimated_minutes} onChange={e => setForm({ ...form, estimated_minutes: parseInt(e.target.value) || 30 })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full">Add Task (+{Math.floor((form.estimated_minutes || 30) * 2)} 🪙 on completion)</Button>
            </form>
          </Card>
        )}

        {pendingTasks.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-muted-foreground">No pending tasks! Add one to earn coins.</p>
          </Card>
        )}

        <div className="space-y-3">
          {pendingTasks.map(task => (
            <Card key={task.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-destructive/10 text-destructive' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-muted text-muted-foreground'}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && <p className="text-sm text-muted-foreground mb-1">{task.description}</p>}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {task.due_date && <span>📅 {new Date(task.due_date).toLocaleDateString()}</span>}
                    {task.scheduled_time && <span>⏰ {task.scheduled_time}</span>}
                    <span>⏱️ {task.estimated_minutes}min</span>
                    <span>🪙 {task.coins_earned}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => completeTask(task.id)}>✓ Done</Button>
                  <Button size="sm" variant="outline" onClick={() => deleteTask(task.id)}>✕</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {completedTasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-muted-foreground mb-3">Completed ({completedTasks.length})</h2>
            <div className="space-y-2 opacity-60">
              {completedTasks.slice(0, 5).map(task => (
                <Card key={task.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="line-through text-sm">{task.title}</span>
                    <span className="text-xs text-muted-foreground">+{task.coins_earned} 🪙</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
