import { useChannelStateContext } from "stream-chat-react";

export default function CustomChannelHeader(): JSX.Element {
  const { channel } = useChannelStateContext();
  const { name } = channel?.data || {};
  return (
    <div className="flex items-center space-x-3 p-3 border-b border-t dark:border-b-[var(--border-color)] dark:border-t-[var(--border-color)]">
      <span className="text-3xl text-gray-500 dark:text-gray-400">#</span>
      <span className="font-bold lowercase text-black dark:text-white">
        {name}
      </span>
    </div>
  );
}
