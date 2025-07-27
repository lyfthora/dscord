'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { useSupabaseUpload } from '@/hooks/useSupabaseUpload';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user } = useUser();
  const { uploadFile, isUploading } = useSupabaseUpload();
  const [username, setUsername] = useState(user?.publicMetadata.username as string || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUploadError(null);
    let avatarUrl = user.imageUrl;

    // Upload avatar file to Supabase if a new file was selected
    if (avatarFile) {
      const { url, error } = await uploadFile(avatarFile, 'avatars', 'profiles');
      
      if (error) {
        // Check if it's an RLS policy error
        if (error.message && error.message.includes('row-level security policy')) {
          setUploadError(
            'Error de permisos en Supabase: ' + error.message + 
            '\n\nPor favor, consulta el archivo SUPABASE_SETUP.md para instrucciones sobre cómo configurar las políticas de seguridad.'
          );
        } else {
          setUploadError('Error al subir la imagen: ' + error.message);
        }
        return;
      }
      
      if (url) {
        avatarUrl = url;
      }
    }

    const res = await fetch('/api/update-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        username: username,
        avatarUrl: avatarUrl,
      }),
    });

    if (res.ok) {
      await user.reload();
      onClose();
    } else {
      setUploadError('Error updating profile');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
              Avatar
            </label>
            <input
              id="avatar"
              type="file"
              onChange={(e) => setAvatarFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>
          {uploadError && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
              {uploadError}
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isUploading}
              className={`px-4 py-2 text-white bg-indigo-600 rounded-md ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? 'Uploading...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
