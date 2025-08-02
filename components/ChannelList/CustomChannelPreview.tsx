import {
  ChannelPreviewUIComponentProps,
  useChatContext,
} from "stream-chat-react";

const CustomChannelPreview = (props: ChannelPreviewUIComponentProps) => {
  const { channel } = props;
  const { setActiveChannel } = useChatContext();
  return (
    <div
      className={`flex items-center mx-2 ${
        props.channel.countUnread() > 0 ? "channel-container" : ""
      }`}
    >
      <button
        className="w-full flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md group"
        onClick={() => setActiveChannel(channel)}
      >
        <span className="text-gray-400 dark:text-gray-500 text-xl font-semibold mr-2 group-hover:text-gray-500 dark:group-hover:text-gray-400">
          #
        </span>
        <span className="text-sm font-medium text-black dark:text-gray-200 group-hover:text-gray-800 dark:group-hover:text-white">
          {channel.data?.name || "Channel Preview"}
        </span>
      </button>
    </div>
  );
};

export default CustomChannelPreview;
