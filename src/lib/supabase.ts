import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function uploadPortfolio(file: File, userId: string) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('artist-portfolios')
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function getPortfolioUrl(path: string) {
  try {
    const { data } = supabase.storage
      .from('artist-portfolios')
      .getPublicUrl(path);

    return data.publicUrl;
  } catch (error) {
    console.error('Error getting public URL:', error);
    throw error;
  }
}
