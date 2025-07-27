import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

type UploadResult = {
  url: string | null;
  error: Error | null;
};

export function useSupabaseUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<UploadResult> => {
    if (!file) {
      return { url: null, error: new Error('No file provided') };
    }

    setIsUploading(true);
    
    // Inicializar el cliente de Supabase
    const supabase = createClient();

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        // Check if it's an RLS policy error
        if (error.message && error.message.includes('row-level security policy')) {
          console.error('RLS policy error detected. Attempting to fix...');
          
          // Try to call the setup-storage-policy endpoint to fix the issue
          try {
            const policyResponse = await fetch('/api/supabase/setup-storage-policy');
            if (policyResponse.ok) {
              // If policy setup was successful, try uploading again
              const retryUpload = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: false
                });
                
              if (retryUpload.error) {
                throw retryUpload.error;
              }
              
              // If retry was successful, continue with the function
              const publicUrl = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath).data.publicUrl;
                
              return { url: publicUrl, error: null };
            } else {
              // If policy setup failed, throw the original error
              throw new Error(`RLS policy error: ${error.message}. Please check SUPABASE_SETUP.md for manual configuration instructions.`);
            }
          } catch (policyError) {
            throw new Error(`Failed to fix RLS policy: ${error.message}. Please check SUPABASE_SETUP.md for manual configuration instructions.`);
          }
        }
        
        // Check if it's a bucket not found error or other bucket-related error
        if (error.message && (error.message.includes('bucket') || (error as any).statusCode === '404')) {
          console.error('Bucket error detected. Attempting to create bucket...');
          
          // Try to call the create-bucket endpoint to fix the issue
          try {
            const bucketResponse = await fetch('/api/supabase/create-bucket');
            if (bucketResponse.ok) {
              // If bucket creation was successful, try uploading again
              const retryUpload = await supabase.storage
                .from(bucket)
                .upload(filePath, file, {
                  cacheControl: '3600',
                  upsert: false
                });
                
              if (retryUpload.error) {
                throw retryUpload.error;
              }
              
              // If retry was successful, continue with the function
              const publicUrl = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath).data.publicUrl;
                
              return { url: publicUrl, error: null };
            } else {
              // If bucket creation failed, throw a more helpful error
              throw new Error(`Failed to create bucket: ${error.message}. Please check SUPABASE_SETUP.md for manual configuration instructions.`);
            }
          } catch (bucketError) {
            throw new Error(`Failed to create bucket: ${error.message}. Please check SUPABASE_SETUP.md for manual configuration instructions.`);
          }
        }
        
        throw error;
      }

      // Get public URL
      const publicUrl = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath).data.publicUrl;

      return { url: publicUrl, error: null };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { url: null, error: error as Error };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}