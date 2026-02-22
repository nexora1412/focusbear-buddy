import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStudyData } from '@/hooks/useStudyData';
import { iceBear, renderProgressBar, getAssignmentPhases } from '@/lib/iceBearMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from '@/hooks/use-toast';

interface Props {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export function AssignmentsPage({ theme, setCurrentPage }: Props) {
  const { assignments, addAssignment, completeAssignment, deleteAssignment } = useStudyData();
  const { sendNotification } = useNotifications();
  const [showForm, setShowForm] = useState(false);
  const [bearMessage, setBearMessage] = useState('');
  const [form, setForm] = useState({ title: '', description: '', subject: '', due_date: '', priority: 'medium', estimated_minutes: 60 });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addAssignment(form);
    
    if (form.due_date) {
      const daysLeft = Math.ceil((new Date(form.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      setBearMessage(iceBear.assignmentCreated(form.title, daysLeft));
    }
    toast({ title: '🧊 Assignment Logged', description: `Ice Bear tracks "${form.title}".` });
    setForm({ title: '', description: '', subject: '', due_date: '', priority: 'medium', estimated_minutes: 60 });
    setShowForm(false);
  };

  const handleComplete = async (id: string) => {
    const a = assignments.find(x => x.id === id);
    if (!a) return;
    const isLate = a.due_date && new Date() > new Date(a.due_date);
    if (isLate) {
      setBearMessage(iceBear.taskLate(3));
      sendNotification('🧊 Late!', 'Ice Bear deducts coins for late submission.');
    } else {
      setBearMessage(iceBear.taskCompleted(true, a.coins_earned));
      sendNotification('🧊 Assignment Done!', `+${a.coins_earned} coins!`);
    }
    await completeAssignment(id);
  };

  const pending = assignments.filter(a => a.status === 'pending');
  const completed = assignments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} variant="outline" className="mb-6">← Back</Button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">📝 Assignments</h1>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Assignment'}</Button>
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

        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleAdd} className="space-y-4">
              <Input placeholder="Assignment title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Due Date</label>
                  <Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Estimated Minutes</label>
                  <Input type="number" min={5} value={form.estimated_minutes} onChange={e => setForm({ ...form, estimated_minutes: parseInt(e.target.value) || 60 })} />
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
              <Button type="submit" className="w-full">Add Assignment (+{Math.floor((form.estimated_minutes || 60) * 2)} 🪙)</Button>
            </form>
          </Card>
        )}

        {pending.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-2xl mb-2">🐻‍❄️</p>
            <p className="text-sm text-muted-foreground">Ice Bear sees no pending assignments. Ice Bear approves... for now.</p>
          </Card>
        )}

        <div className="space-y-4">
          {pending.map(a => {
            const phases = a.due_date ? getAssignmentPhases(a.due_date, a.created_at) : null;
            const isOverdue = a.due_date && new Date() > new Date(a.due_date);

            return (
              <Card key={a.id} className={`p-4 ${isOverdue ? 'border-destructive/50' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{a.title}</h3>
                      {a.subject && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{a.subject}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${a.priority === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>{a.priority}</span>
                      {isOverdue && <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">⚠️ OVERDUE</span>}
                    </div>
                    {a.description && <p className="text-sm text-muted-foreground mb-2">{a.description}</p>}
                    
                    {/* Phase Breakdown */}
                    {phases && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">📋 Ice Bear's Phase Plan ({phases.daysRemaining} days remaining)</p>
                        <div className="flex gap-2">
                          {phases.phases.map((phase, i) => (
                            <div key={i} className={`flex-1 p-2 rounded text-xs text-center border ${phase.active ? 'bg-primary/10 border-primary font-semibold' : 'bg-muted/30 border-transparent'}`}>
                              <div>{phase.name}</div>
                              <div className="text-muted-foreground">{phase.days}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">
                            ⏳ {renderProgressBar(phases.daysElapsed, phases.totalDays)} Day {phases.daysElapsed}/{phases.totalDays}
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all ${isOverdue ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${Math.min(Math.round((phases.daysElapsed / phases.totalDays) * 100), 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {a.due_date && <span>📅 {new Date(a.due_date).toLocaleDateString()}</span>}
                      <span>⏱️ {a.estimated_minutes}min</span>
                      <span>🪙 {a.coins_earned}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleComplete(a.id)}>✓ Done</Button>
                    <Button size="sm" variant="outline" onClick={() => deleteAssignment(a.id)}>✕</Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {completed.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-muted-foreground mb-3">Completed ({completed.length})</h2>
            <div className="space-y-2 opacity-60">
              {completed.slice(0, 5).map(a => (
                <Card key={a.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="line-through text-sm">{a.title}</span>
                    <span className="text-xs text-muted-foreground">+{a.coins_earned} 🪙</span>
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
