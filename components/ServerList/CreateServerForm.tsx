import { useDiscordContext } from '@/contexts/DiscordContext';
import { UserObject } from '@/model/UserObject';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useChatContext } from 'stream-chat-react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { CloseMark } from '../ChannelList/Icons';
import UserRow from '../ChannelList/CreateChannelForm/UserRow';
import { useSupabaseUpload } from '@/hooks/useSupabaseUpload';

type FormState = {
  serverName: string;
  serverImage: string;
  users: UserObject[];
};

const CreateServerForm = () => {
  // Check if we are shown
  const params = useSearchParams();
  const showCreateServerForm = params.get('createServer');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  // Data
  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();
  const { createServer } = useDiscordContext();
  const { uploadFile, isUploading } = useSupabaseUpload();

  const initialState: FormState = {
    serverName: '',
    serverImage: '',
    users: [],
  };

  const [formData, setFormData] = useState<FormState>(initialState);
  const [users, setUsers] = useState<UserObject[]>([]);

  const loadUsers = useCallback(async () => {
    const response = await client.queryUsers({});
    const users: UserObject[] = response.users
      .filter((user) => user.role !== 'admin')
      .map((user) => {
        return {
          id: user.id,
          name: user.name ?? user.id,
          image: user.image as string,
          online: user.online,
          lastOnline: user.last_active,
        };
      });
    if (users) setUsers(users);
  }, [client]);

  useEffect(() => {
    if (showCreateServerForm && dialogRef.current) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [showCreateServerForm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.serverName || !client || !videoClient) return;

    try {
      const selectedUserIds = formData.users.map(user => user.id);
      
      // Si hay una imagen seleccionada, la subimos primero
      let imageFileToUse = imageFile || new File([], 'default-icon.png');
      
      await createServer(
        client,
        videoClient,
        formData.serverName,
        imageFileToUse,
        selectedUserIds
      );
      
      // Reset form
      setFormData(initialState);
      setImageFile(null);
      
      // Cerrar el diálogo
      const url = new URL(window.location.href);
      url.searchParams.delete('createServer');
      router.push(url.toString());
    } catch (error) {
      console.error('Error al crear el servidor:', error);
    }
  };

  return (
    <dialog className='absolute z-10 space-y-2 rounded-xl bg-white dark:bg-gray-800' ref={dialogRef}>
      <div className='w-full flex items-center justify-between py-8 px-6'>
        <h2 className='text-3xl font-semibold text-gray-600 dark:text-gray-200'>
          Create new server
        </h2>
        <Link href='/'>
          <CloseMark className='w-10 h-10 text-gray-400 dark:text-gray-500' />
        </Link>
      </div>
      <form onSubmit={handleSubmit} className='flex flex-col space-y-2 px-6 pb-6'>
        <label className='labelTitle dark:text-gray-200' htmlFor='serverName'>
          Server Name
        </label>
        <div className='flex items-center bg-gray-100 dark:bg-gray-700'>
          <span className='text-2xl p-2 text-gray-500 dark:text-gray-400'>#</span>
          <input
            type='text'
            id='serverName'
            name='serverName'
            value={formData.serverName}
            onChange={(e) =>
              setFormData({ ...formData, serverName: e.target.value })
            }
            required
            className='bg-transparent w-full text-black dark:text-white p-2'
          />
        </div>
        <label className='labelTitle dark:text-gray-200' htmlFor='serverImage'>
          Server Image
        </label>
        <div className='flex items-center bg-gray-100 dark:bg-gray-700 p-2 rounded'>
          <input
            type='file'
            id='serverImage'
            name='serverImage'
            onChange={handleFileChange}
            accept='image/*'
            disabled={isUploading}
            className='w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-600 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800'
          />
          {isUploading && <p className='text-sm text-gray-500 dark:text-gray-400 ml-2'>Uploading...</p>}
          {imageFile && !isUploading && (
            <p className='text-sm text-gray-500 dark:text-gray-400 ml-2'>Image selected</p>
          )}
        </div>
        <h2 className='mb-2 labelTitle dark:text-gray-200'>Add Users</h2>
        <div className='max-h-64 overflow-y-scroll mb-4'>
          {users.map((user) => (
            <UserRow 
              user={user} 
              userChanged={(user, checked) => {
                if (checked) {
                  setFormData({
                    ...formData,
                    users: [...formData.users, user],
                  });
                } else {
                  setFormData({
                    ...formData,
                    users: formData.users.filter((thisUser) => thisUser.id !== user.id),
                  });
                }
              }} 
              key={user.id} 
            />
          ))}
        </div>
        
        <div className='flex space-x-6 items-center justify-end pt-4 border-t border-gray-200 dark:border-gray-700'>
          <Link 
            href='/' 
            className='font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          >
            Cancel
          </Link>
          <button
            type='submit'
            disabled={!formData.serverName || !client || !videoClient || isUploading}
            className={`bg-discord rounded py-2 px-4 text-white font-bold uppercase ${
              (!formData.serverName || !client || !videoClient || isUploading) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-indigo-600 transition-colors'
            }`}
          >
            {isUploading ? 'Creating...' : 'Create Server'}
          </button>
        </div>
      </form>
    </dialog>
  );
};
export default CreateServerForm;
