import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Gear, LeaveServer, Mic, Speaker } from '../Icons';
import { useChatContext } from 'stream-chat-react';
import { useClerk } from '@clerk/nextjs';
import ChannelListMenuRow from '../TopBar/ChannelListMenuRow';
import EditProfileModal from '@/components/modals/EditProfileModal';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export default function ChannelListBottomBar(): JSX.Element {
  const { client } = useChatContext();
  const [micActive, setMicActive] = useState(false);
  const [audioActive, setAudioActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { signOut } = useClerk();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className='mt-auto p-2 bg-light-gray dark:bg-gray-800 w-full flex items-center space-x-3 relative'>
      <button
        className='flex flex-1 items-center space-x-2 p-1 pr-2 rounded-md hover:bg-hover-gray dark:hover:bg-gray-700'
        onClick={() => setMenuOpen((currentValue) => !currentValue)}
      >
        {client.user?.image && (
          <div
            className={`relative ${client.user?.online ? 'online-icon' : ''}`}
          >
            <Image
              src={client.user?.image ?? 'https://thispersondoesnotexist.com/'}
              alt='User image'
              width={36}
              height={36}
              className='rounded-full'
            />
          </div>
        )}
        <p className='flex flex-col items-start space-y-1'>
          <span className='block max-w-24 text-gray-700 dark:text-gray-200 text-sm font-medium -mb-1.5 tracking-tight text-ellipsis overflow-x-clip'>
            {client.user?.name}
          </span>
          <span className='text-xs text-gray-500 dark:text-gray-400 inline-block'>
            {client.user?.online ? 'Online' : 'Offline'}
          </span>
        </p>
      </button>
      <button
        className={`w-7 h-7 p-1 flex items-center justify-center relative rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-100 ease-in-out ${
          !micActive ? 'inactive-icon text-red-400' : 'text-gray-700 dark:text-gray-200'
        }`}
        onClick={() => setMicActive((currentValue) => !currentValue)}
      >
        <Mic />
      </button>
      <button
        className={`w-7 h-7 p-1 flex items-center justify-center relative rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-100 ease-in-out ${
          !audioActive ? 'inactive-icon text-red-400' : 'text-gray-700 dark:text-gray-200'
        }`}
        onClick={() => setAudioActive((currentValue) => !currentValue)}
      >
        <Speaker />
      </button>
      <ThemeSwitcher />
      <button className='w-7 h-7 p-1 flex items-center justify-center relative rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-100 ease-in-out text-gray-700 dark:text-gray-200'>
        <Gear className='w-full h-full' />
      </button>
      {menuOpen && (
        <div
          ref={menuRef}
          className='absolute bottom-full mb-2 -left-1 w-52 p-2 bg-white rounded-md shadow-md'
        >
          <button onClick={() => { setIsModalOpen(true); setMenuOpen(false); }} className="w-full">
            <ChannelListMenuRow
              name="Edit Profile"
              icon={<Gear />}
              bottomBorder={true}
            />
          </button>
          <button
            className='w-full'
            onClick={() => signOut()}
          >
            <ChannelListMenuRow
              name='Sign out'
              icon={<LeaveServer />}
              bottomBorder={false}
              red
            />
          </button>
        </div>
      )}
      <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
