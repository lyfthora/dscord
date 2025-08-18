import {
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";
import { useMemo } from "react";

const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => {
  const { channel } = props;
  const { setActiveChannel, client } = useChatContext();

  const isDirectMessage = useMemo(() => {
    return channel.data?.isDirectMessage || channel.id?.startsWith("dm-");
  }, [channel]);

  const otherUser = useMemo(() => {
    if (!isDirectMessage) return null;
    const members = Object.values(channel.state.members);
    return members.find((member) => member.user?.id !== client.userID);
  }, [channel, client.userID, isDirectMessage]);

  return (
    <div
      className={`flex items-center mx-2 ${props.channel.countUnread() > 0 ? "channel-container" : ""}`}
    >
      <button
        className="w-full flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
        onClick={() => setActiveChannel(channel)}
      >
        {isDirectMessage && otherUser ? (
          <>
            <img
              src={otherUser.user?.image as string}
              alt={otherUser.user?.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm font-medium text-black dark:text-gray-200 group-hover:text-gray-800 dark:group-hover:text-white">
              {otherUser.user?.name}
            </span>
          </>
        ) : (
          <>
            <span className="text-gray-400 dark:text-gray-500 text-xl font-semibold mr-2 group-hover:text-gray-500 dark:group-hover:text-gray-400">
              #
            </span>
            <span className="text-sm font-medium text-black dark:text-gray-200 group-hover:text-gray-800 dark:group-hover:text-white">
              {channel.data?.name || "Channel Preview"}
            </span>
          </>
        )}
      </button>
    </div>
  );
};

export default CustomChannelPreview;


