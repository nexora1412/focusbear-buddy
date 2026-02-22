
-- Add target_days to habits for 21/60 day challenges
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS target_days integer DEFAULT 21;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS start_date text DEFAULT '';

-- Create vision_board table
CREATE TABLE public.vision_board (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  category TEXT DEFAULT 'thought',
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vision_board ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own vision board" ON public.vision_board FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vision board" ON public.vision_board FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vision board" ON public.vision_board FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vision board" ON public.vision_board FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_vision_board_updated_at BEFORE UPDATE ON public.vision_board FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
