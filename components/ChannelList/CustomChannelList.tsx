import { useDiscordContext } from "@/contexts/DiscordContext";
import CreateChannelForm from "./CreateChannelForm/CreateChannelForm";
import DirectMessage from "./DirectMessage/DirectMessage";
import CategoryItem from "./CategoryItem/CategoryItem";
import CallList from "./CallList/CallList";
import React from "react";

// This is a "dumb" component. It receives its width and the resize handler from its parent.
// It also receives other props from the Stream ChannelList component, which are passed down.
const CustomChannelList: React.FC<any> = ({
  width,
  handleMouseDown,
  ...props
}) => {
  const { server, channelsByCategories } = useDiscordContext();

  return (
    <div
      style={{ width: `${width}px` }}
      className="h-full relative flex-shrink-0"
    >
      <div className="bg-medium-gray dark:bg-black h-full w-full flex flex-col items-start rounded-bl-none rounded-r-none custom-thin-border ">
        <DirectMessage />

        <div className="w-full">
          {server ? (
            Array.from(channelsByCategories.keys()).map((category, index) => (
              <CategoryItem
                key={`${category}-${index}`}
                category={category}
                serverName={server?.name || "Direct Messages"}
                channels={channelsByCategories.get(category) || []}
                {...props}
              />
            ))
          ) : (
            <CategoryItem
              key="Direct-Messages"
              category="Direct Messages"
              serverName="Direct Messages"
              channels={channelsByCategories.get("Direct Messages") || []}
              {...props}
            />
          )}
        </div>

        {server ? (
          <>
            <CallList />
            <CreateChannelForm />
          </>
        ) : null}
      </div>
      <div
        onMouseDown={handleMouseDown}
        className="custom-thin-border cursor-col-resize absolute top-0 right-0 h-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors duration-200 z-10"
      />
    </div>
  );
};

export default CustomChannelList;
