
-- Create storage bucket for user uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('user-uploads', 'user-uploads', true);

-- Storage policies
CREATE POLICY "Users can view own uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Public read access for user-uploads bucket
CREATE POLICY "Public read access for user uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-uploads');

-- Create library table
CREATE TABLE public.library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT DEFAULT 'pdf',
  category TEXT DEFAULT 'book',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own library" ON public.library FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own library" ON public.library FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own library" ON public.library FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own library" ON public.library FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_library_updated_at BEFORE UPDATE ON public.library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
