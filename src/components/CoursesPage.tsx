import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStudyData } from '@/hooks/useStudyData';
import { iceBear, renderProgressBar } from '@/lib/iceBearMessages';
import { toast } from '@/hooks/use-toast';

interface Props {
  theme: string;
  setCurrentPage: (page: string) => void;
}

export function CoursesPage({ theme, setCurrentPage }: Props) {
  const { courses, addCourse, updateCourse, deleteCourse } = useStudyData();
  const [showForm, setShowForm] = useState(false);
  const [bearMessage, setBearMessage] = useState('');
  const [form, setForm] = useState({ title: '', description: '', instructor: '', schedule: '', total_lessons: 0 });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await addCourse(form);
    setBearMessage(`🧊 Ice Bear logs course: "${form.title}". Ice Bear approves structured suffering. Begin.`);
    toast({ title: '🧊 Course Added', description: `Ice Bear tracks "${form.title}".` });
    setForm({ title: '', description: '', instructor: '', schedule: '', total_lessons: 0 });
    setShowForm(false);
  };

  const completeLesson = async (id: string, completed: number, total: number) => {
    const newCompleted = Math.min(completed + 1, total);
    const progress = total > 0 ? Math.round((newCompleted / total) * 100) : 0;
    const status = newCompleted >= total ? 'completed' : 'active';
    setBearMessage(iceBear.courseProgress(newCompleted, total));
    await updateCourse(id, { completed_lessons: newCompleted, progress, status });
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button onClick={() => setCurrentPage('dashboard')} variant="outline" className="mb-6">← Back</Button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-semibold">📕 Courses</h1>
          <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Course'}</Button>
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
              <Input placeholder="Course title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Instructor" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} />
                <Input placeholder="Schedule (e.g. MWF 9am)" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Total Lessons</label>
                <Input type="number" min={0} value={form.total_lessons} onChange={e => setForm({ ...form, total_lessons: parseInt(e.target.value) || 0 })} />
              </div>
              <Button type="submit" className="w-full">Add Course</Button>
            </form>
          </Card>
        )}

        {/* Coin Rules */}
        <Card className="p-4 mb-6 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            🧊 <strong>Ice Bear's Rules:</strong> Each ✅ lesson = +3 coins. Empty lesson = -1 coin + Ice Bear's silent glare.
          </div>
        </Card>

        {courses.length === 0 && !showForm && (
          <Card className="p-8 text-center">
            <p className="text-2xl mb-2">🐻‍❄️</p>
            <p className="text-sm text-muted-foreground">No courses yet. Ice Bear demands purpose. Add your classes.</p>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <Card key={course.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{course.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${course.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {course.status}
                </span>
              </div>
              {course.description && <p className="text-sm text-muted-foreground mb-2">{course.description}</p>}
              <div className="text-xs text-muted-foreground mb-3 space-y-1">
                {course.instructor && <p>👤 {course.instructor}</p>}
                {course.schedule && <p>🗓️ {course.schedule}</p>}
              </div>
              {course.total_lessons > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{course.completed_lessons}/{course.total_lessons} lessons</span>
                    <span>{renderProgressBar(course.completed_lessons, course.total_lessons)} {course.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {course.status !== 'completed' && course.total_lessons > 0 && (
                  <Button size="sm" onClick={() => completeLesson(course.id, course.completed_lessons, course.total_lessons)}>+ Lesson</Button>
                )}
                <Button size="sm" variant="outline" onClick={() => deleteCourse(course.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
