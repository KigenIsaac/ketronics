import { supabase } from '@/lib/supabase';

export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, { upsert: false });

  if (uploadError) {
    throw uploadError;
  }

  const { data: urlData } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

export const deleteImage = async (publicUrl: string) => {
  try {
    const url = new URL(publicUrl);
    // expected path: /storage/v1/object/public/product-images/products/...
    const parts = url.pathname.split('/').filter(Boolean); // removes empty segments
    const publicIndex = parts.indexOf('public');
    if (publicIndex === -1) {
      throw new Error('Invalid public URL format for storage object');
    }
    // bucket is parts[publicIndex + 1], path is the rest
    const filePath = parts.slice(publicIndex + 2).join('/');
    if (!filePath) {
      throw new Error('Could not derive file path from public URL');
    }

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (err) {
    console.error('Error deleting image:', err);
    throw err;
  }
};