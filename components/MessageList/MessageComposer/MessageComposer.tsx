import {
  Emoji,
  GIF,
  PlusCircle,
  Present,
} from '@/components/ChannelList/Icons';
import { useState } from 'react';
import { SendButton, useChatContext } from 'stream-chat-react';
import { plusItems } from './plusItems';
import ChannelListMenuRow from '@/components/ChannelList/TopBar/ChannelListMenuRow';

export default function MessageComposer(): JSX.Element {
  const [plusMenuOpen, setPlusMenuOpen] = useState(false);
  const { channel } = useChatContext();
  const [message, setMessage] = useState('');
  return (
    <div className='flex mx-6 my-6 px-4 py-1 bg-composer-gray dark:bg-gray-700 items-center justify-center space-x-4 rounded-md text-gray-600 dark:text-gray-400 relative'>
      <button onClick={() => setPlusMenuOpen((menuOpen) => !menuOpen)}>
        <PlusCircle className='w-8 h-8 hover:text-gray-800 dark:hover:text-gray-200' />
      </button>
      {plusMenuOpen && (
        <div className='absolute p-2 z-10 -left-6 bottom-12'>
          <div className='bg-white dark:bg-gray-800 p-2 shadow-lg rounded-md w-40 flex flex-col'>
            {plusItems.map((option) => (
              <button
                key={option.name}
                className=''
                onClick={() => setPlusMenuOpen(false)}
              >
                <ChannelListMenuRow {...option} />
              </button>
            ))}
          </div>
        </div>
      )}
      <input
        className='border-transparent bg-transparent outline-none text-sm font-semibold m-0 text-gray-normal dark:text-gray-200'
        type='text'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='Message #general'
      />
      <Present className='w-8 h-8 hover:text-gray-800 dark:hover:text-gray-200' />
      <GIF className='w-8 h-8 hover:text-gray-800 dark:hover:text-gray-200' />
      <Emoji className='w-8 h-8 hover:text-gray-800 dark:hover:text-gray-200' />
      <SendButton
        sendMessage={() => {
          channel?.sendMessage({ text: message });
          setMessage('');
        }}
      />
    </div>
  );
}
