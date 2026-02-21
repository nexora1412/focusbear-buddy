import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useFocusData } from './useFocusData';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  scheduled_time: string | null;
  estimated_minutes: number;
  priority: string;
  status: string;
  completed_at: string | null;
  coins_earned: number;
  reminder_enabled: boolean;
  created_at: string;
}

export interface Notebook {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  title: string;
  description: string | null;
  frequency: string;
  current_streak: number;
  best_streak: number;
  last_completed_date: string;
  total_completions: number;
  coins_per_completion: number;
  created_at: string;
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  tags: string[];
  status: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  due_date: string | null;
  status: string;
  priority: string;
  estimated_minutes: number;
  completed_at: string | null;
  coins_earned: number;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  schedule: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  status: string;
  created_at: string;
}

export function useStudyData() {
  const { user } = useAuth();
  const { stats, refreshStats } = useFocusData();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) return;
    const [t, n, h, i, a, c] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('notebooks').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('habits').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('ideas').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('assignments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('courses').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (t.data) setTasks(t.data as unknown as Task[]);
    if (n.data) setNotebooks(n.data as unknown as Notebook[]);
    if (h.data) setHabits(h.data as unknown as Habit[]);
    if (i.data) setIdeas(i.data as unknown as Idea[]);
    if (a.data) setAssignments(a.data as unknown as Assignment[]);
    if (c.data) setCourses(c.data as unknown as Course[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Calculate coins based on estimated time (2 coins per minute)
  const calcCoins = (minutes: number) => Math.floor(minutes * 2);

  // TASKS
  const addTask = async (data: { title: string; description?: string; due_date?: string; scheduled_time?: string; estimated_minutes?: number; priority?: string }) => {
    if (!user) return;
    const est = data.estimated_minutes || 30;
    const { error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      due_date: data.due_date || null,
      scheduled_time: data.scheduled_time || null,
      estimated_minutes: est,
      priority: data.priority || 'medium',
      coins_earned: calcCoins(est),
    });
    if (!error) await fetchAll();
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', taskId);
    // Award coins
    const coins = task.coins_earned;
    const today = new Date().toDateString();
    const isNewDay = stats.last_activity_date !== today;
    await supabase.from('focus_stats').update({
      daily_coins: isNewDay ? coins : stats.daily_coins + coins,
      weekly_coins: stats.weekly_coins + coins,
      monthly_coins: stats.monthly_coins + coins,
      last_activity_date: today,
    }).eq('user_id', user.id);
    await Promise.all([fetchAll(), refreshStats()]);
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    await supabase.from('tasks').delete().eq('id', id);
    await fetchAll();
  };

  // NOTEBOOKS
  const addNotebook = async (title: string, content: string = '', category: string = 'general') => {
    if (!user) return;
    await supabase.from('notebooks').insert({ user_id: user.id, title, content, category });
    await fetchAll();
  };

  const updateNotebook = async (id: string, data: { title?: string; content?: string; category?: string }) => {
    if (!user) return;
    await supabase.from('notebooks').update(data).eq('id', id);
    await fetchAll();
  };

  const deleteNotebook = async (id: string) => {
    if (!user) return;
    await supabase.from('notebooks').delete().eq('id', id);
    await fetchAll();
  };

  // HABITS
  const addHabit = async (title: string, description?: string, frequency: string = 'daily') => {
    if (!user) return;
    await supabase.from('habits').insert({ user_id: user.id, title, description: description || null, frequency });
    await fetchAll();
  };

  const completeHabit = async (habitId: string) => {
    if (!user) return;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const today = new Date().toDateString();
    if (habit.last_completed_date === today) return; // already done today
    const newStreak = habit.current_streak + 1;
    await supabase.from('habits').update({
      current_streak: newStreak,
      best_streak: Math.max(newStreak, habit.best_streak),
      last_completed_date: today,
      total_completions: habit.total_completions + 1,
    }).eq('id', habitId);
    // Award coins
    const coins = habit.coins_per_completion;
    const isNewDay = stats.last_activity_date !== today;
    await supabase.from('focus_stats').update({
      daily_coins: isNewDay ? coins : stats.daily_coins + coins,
      weekly_coins: stats.weekly_coins + coins,
      monthly_coins: stats.monthly_coins + coins,
      last_activity_date: today,
    }).eq('user_id', user.id);
    await Promise.all([fetchAll(), refreshStats()]);
  };

  const deleteHabit = async (id: string) => {
    if (!user) return;
    await supabase.from('habits').delete().eq('id', id);
    await fetchAll();
  };

  // IDEAS
  const addIdea = async (title: string, content: string = '', tags: string[] = []) => {
    if (!user) return;
    await supabase.from('ideas').insert({ user_id: user.id, title, content, tags });
    await fetchAll();
  };

  const updateIdea = async (id: string, data: { title?: string; content?: string; tags?: string[]; status?: string }) => {
    if (!user) return;
    await supabase.from('ideas').update(data).eq('id', id);
    await fetchAll();
  };

  const deleteIdea = async (id: string) => {
    if (!user) return;
    await supabase.from('ideas').delete().eq('id', id);
    await fetchAll();
  };

  // ASSIGNMENTS
  const addAssignment = async (data: { title: string; description?: string; subject?: string; due_date?: string; priority?: string; estimated_minutes?: number }) => {
    if (!user) return;
    const est = data.estimated_minutes || 60;
    await supabase.from('assignments').insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      subject: data.subject || '',
      due_date: data.due_date || null,
      priority: data.priority || 'medium',
      estimated_minutes: est,
      coins_earned: calcCoins(est),
    });
    await fetchAll();
  };

  const completeAssignment = async (id: string) => {
    if (!user) return;
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;
    await supabase.from('assignments').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);
    const coins = assignment.coins_earned;
    const today = new Date().toDateString();
    const isNewDay = stats.last_activity_date !== today;
    await supabase.from('focus_stats').update({
      daily_coins: isNewDay ? coins : stats.daily_coins + coins,
      weekly_coins: stats.weekly_coins + coins,
      monthly_coins: stats.monthly_coins + coins,
      last_activity_date: today,
    }).eq('user_id', user.id);
    await Promise.all([fetchAll(), refreshStats()]);
  };

  const deleteAssignment = async (id: string) => {
    if (!user) return;
    await supabase.from('assignments').delete().eq('id', id);
    await fetchAll();
  };

  // COURSES
  const addCourse = async (data: { title: string; description?: string; instructor?: string; schedule?: string; total_lessons?: number }) => {
    if (!user) return;
    await supabase.from('courses').insert({
      user_id: user.id,
      title: data.title,
      description: data.description || null,
      instructor: data.instructor || '',
      schedule: data.schedule || '',
      total_lessons: data.total_lessons || 0,
    });
    await fetchAll();
  };

  const updateCourse = async (id: string, data: { completed_lessons?: number; progress?: number; status?: string }) => {
    if (!user) return;
    await supabase.from('courses').update(data).eq('id', id);
    await fetchAll();
  };

  const deleteCourse = async (id: string) => {
    if (!user) return;
    await supabase.from('courses').delete().eq('id', id);
    await fetchAll();
  };

  return {
    tasks, notebooks, habits, ideas, assignments, courses, loading,
    addTask, completeTask, deleteTask,
    addNotebook, updateNotebook, deleteNotebook,
    addHabit, completeHabit, deleteHabit,
    addIdea, updateIdea, deleteIdea,
    addAssignment, completeAssignment, deleteAssignment,
    addCourse, updateCourse, deleteCourse,
    refresh: fetchAll,
  };
}
