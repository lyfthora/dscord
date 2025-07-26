import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import ChannelListMenuRow from '@/components/ChannelList/TopBar/ChannelListMenuRow';
import { Gear } from '@/components/ChannelList/Icons';

export default function UpdateUsernameForm() {
  const { user } = useUser();
  const [username, setUsername] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const res = await fetch('/api/update-username', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        username: username,
      }),
    });

    if (res.ok) {
      setShowForm(false);
    }
  };

  if (!showForm) {
    return (
      <button onClick={() => setShowForm(true)} className="w-full">
        <ChannelListMenuRow
          name="Change Username"
          icon={<Gear />}
          bottomBorder={true}
        />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="New username"
        className="w-full p-2 border rounded-md"
      />
      <div className="flex justify-end mt-2 space-x-2">
        <button type="submit" className="px-4 py-2 text-white bg-indigo-600 rounded-md">
          Update
        </button>
        <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">
          Cancel
        </button>
      </div>
    </form>
  );
}

