import { supabase } from '@/integrations/supabase/client';

export async function uploadFile(userId: string, file: File, folder: string = 'general'): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const fileName = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const { error } = await supabase.storage
    .from('user-uploads')
    .upload(fileName, file, { upsert: true });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  const { data } = supabase.storage
    .from('user-uploads')
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export function getFileType(file: File): 'pdf' | 'image' | 'other' {
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type.startsWith('image/')) return 'image';
  return 'other';
}
