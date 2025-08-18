import { useChannelStateContext } from 'stream-chat-react';

export default function CustomChannelHeader(): JSX.Element {
  const { channel } = useChannelStateContext();
  const { name } = channel?.data || {};
  return (
    <div className='flex items-center space-x-3 p-3 border-b-2 border-b-gray-200 dark:border-b-gray-700'>
      <span className='text-3xl text-gray-500 dark:text-gray-400'>#</span>
      <span className='font-bold lowercase text-black dark:text-white'>{name}</span>
    </div>
  );
}
