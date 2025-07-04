import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'tisorah';

export async function uploadImage(file: File, folder: string = 'products') {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload the file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function deleteImage(url: string) {
  try {
    // Extract the file path from the URL
    const filePathMatch = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    if (!filePathMatch || !filePathMatch[1]) {
      throw new Error('Invalid file URL');
    }

    const filePath = filePathMatch[1];

    // Delete the file from Supabase Storage
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}

export async function uploadMultipleImages(files: File[], folder: string = 'products') {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map(file => uploadImage(file, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
} 