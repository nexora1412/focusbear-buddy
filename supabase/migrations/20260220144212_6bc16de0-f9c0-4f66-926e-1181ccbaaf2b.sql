
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Focus sessions table
CREATE TABLE public.focus_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL, -- minutes
  session_type TEXT NOT NULL DEFAULT 'quick' CHECK (session_type IN ('quick', 'deep', 'power')),
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  completed BOOLEAN NOT NULL DEFAULT false,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.focus_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.focus_sessions FOR DELETE USING (auth.uid() = user_id);

-- Focus stats table (one per user)
CREATE TABLE public.focus_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_coins INTEGER NOT NULL DEFAULT 0,
  weekly_coins INTEGER NOT NULL DEFAULT 0,
  monthly_coins INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  daily_screen_time_saved INTEGER NOT NULL DEFAULT 0,
  today_sessions INTEGER NOT NULL DEFAULT 0,
  last_activity_date TEXT NOT NULL DEFAULT '',
  break_glass_used INTEGER NOT NULL DEFAULT 0,
  break_glass_reset_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stats" ON public.focus_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own stats" ON public.focus_stats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stats" ON public.focus_stats FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Whitelist table
CREATE TABLE public.focus_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'url' CHECK (item_type IN ('url', 'app')),
  value TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'educational' CHECK (category IN ('educational', 'library', 'emergency')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_whitelist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own whitelist" ON public.focus_whitelist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own whitelist" ON public.focus_whitelist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own whitelist" ON public.focus_whitelist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own whitelist" ON public.focus_whitelist FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile and stats on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Student'));
  
  INSERT INTO public.focus_stats (user_id)
  VALUES (NEW.id);

  -- Seed default whitelist
  INSERT INTO public.focus_whitelist (user_id, item_type, value, description, category) VALUES
    (NEW.id, 'url', 'coursera.org', 'Coursera', 'educational'),
    (NEW.id, 'url', 'edx.org', 'EdX', 'educational'),
    (NEW.id, 'url', 'khanacademy.org', 'Khan Academy', 'educational'),
    (NEW.id, 'url', 'scholar.google.com', 'Google Scholar', 'educational'),
    (NEW.id, 'url', 'wikipedia.org', 'Wikipedia', 'educational');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_focus_stats_updated_at BEFORE UPDATE ON public.focus_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
