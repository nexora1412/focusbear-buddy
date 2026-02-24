import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

const chartConfig = {
  tasks: { label: 'Tasks', color: 'hsl(var(--chart-1))' },
  habits: { label: 'Habits', color: 'hsl(var(--chart-2))' },
  courses: { label: 'Courses', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

interface DayData {
  date: string;
  label: string;
  tasks: number;
  habits: number;
  courses: number;
}

export function CompletionGraphs() {
  const { user } = useAuth();
  const [data, setData] = useState<DayData[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;

    const days = 14;
    const since = subDays(new Date(), days).toISOString();

    const [tasksRes, habitsRes, coursesRes] = await Promise.all([
      supabase
        .from('tasks')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', since),
      supabase
        .from('habits')
        .select('last_completed_date, total_completions')
        .eq('user_id', user.id),
      supabase
        .from('courses')
        .select('updated_at, completed_lessons')
        .eq('user_id', user.id),
    ]);

    // Build day buckets
    const buckets: DayData[] = [];
    for (let i = days; i >= 0; i--) {
      const d = subDays(new Date(), i);
      buckets.push({
        date: format(d, 'yyyy-MM-dd'),
        label: format(d, 'MMM d'),
        tasks: 0,
        habits: 0,
        courses: 0,
      });
    }

    // Count tasks by completed_at date
    (tasksRes.data || []).forEach((t) => {
      if (!t.completed_at) return;
      const day = format(new Date(t.completed_at), 'yyyy-MM-dd');
      const bucket = buckets.find((b) => b.date === day);
      if (bucket) bucket.tasks++;
    });

    // Count habits by last_completed_date
    (habitsRes.data || []).forEach((h) => {
      if (!h.last_completed_date) return;
      const bucket = buckets.find((b) => b.date === h.last_completed_date);
      if (bucket) bucket.habits++;
    });

    // Count course lesson updates by updated_at date
    (coursesRes.data || []).forEach((c) => {
      if (!c.completed_lessons || c.completed_lessons === 0) return;
      const day = format(new Date(c.updated_at), 'yyyy-MM-dd');
      const bucket = buckets.find((b) => b.date === day);
      if (bucket) bucket.courses += c.completed_lessons;
    });

    setData(buckets);
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasAnyData = data.some((d) => d.tasks > 0 || d.habits > 0 || d.courses > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Combined Area Chart */}
      <Card className="p-6 col-span-1 lg:col-span-2">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">📊 Completion Over Time</h3>
        <p className="text-sm text-muted-foreground mb-4">Last 14 days activity</p>
        {!hasAnyData ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            🐻‍❄️ No activity yet. Complete tasks, habits, or courses to see your progress!
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart data={data}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={30} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area type="monotone" dataKey="tasks" stackId="1" fill="hsl(var(--chart-1))" stroke="hsl(var(--chart-1))" fillOpacity={0.4} />
              <Area type="monotone" dataKey="habits" stackId="1" fill="hsl(var(--chart-2))" stroke="hsl(var(--chart-2))" fillOpacity={0.4} />
              <Area type="monotone" dataKey="courses" stackId="1" fill="hsl(var(--chart-3))" stroke="hsl(var(--chart-3))" fillOpacity={0.4} />
            </AreaChart>
          </ChartContainer>
        )}
      </Card>

      {/* Tasks Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">✅ Tasks Completed</h3>
        <p className="text-sm text-muted-foreground mb-4">Daily task completions</p>
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={25} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="tasks" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Card>

      {/* Habits Bar Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">📅 Habits Tracked</h3>
        <p className="text-sm text-muted-foreground mb-4">Daily habit completions</p>
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={25} />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="habits" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </Card>
    </div>
  );
}
