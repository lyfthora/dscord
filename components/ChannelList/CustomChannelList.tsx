import { useChatContext } from "stream-chat-react";
import { useDiscordContext } from "@/contexts/DiscordContext";
import CreateChannelForm from "./CreateChannelForm/CreateChannelForm";
import UserBar from "./BottomBar/ChannelListBottomBar";
import DirectMessage from "./DirectMessage/DirectMessage";
import CategoryItem from "./CategoryItem/CategoryItem";
import CallList from "./CallList/CallList";
import Link from "next/link";
import React from "react";

const CustomChannelList: React.FC = () => {
  const { server, channelsByCategories, changeServer } = useDiscordContext();
  const { client } = useChatContext();

  return (
    <div className="w-72 bg-medium-gray dark:bg-black h-full flex flex-col items-start rounded-tl-2xl rounded-bl-none rounded-r-none custom-thin-border">
      {/* Botón para mostrar mensajes directos */}
      <DirectMessage />

      <div className="w-full">
        {server ? (
          Array.from(channelsByCategories.keys()).map((category, index) => (
            <CategoryItem
              key={`${category}-${index}`}
              category={category}
              serverName={server?.name || "Direct Messages"}
              channels={channelsByCategories.get(category) || []}
            />
          ))
        ) : (
          <CategoryItem
            key="Direct-Messages"
            category="Direct Messages"
            serverName="Direct Messages"
            channels={channelsByCategories.get("Direct Messages") || []}
          />
        )}
      </div>

      {server ? (
        <>
          <CallList />
          <CreateChannelForm />
        </>
      ) : null}

      <UserBar />
    </div>
  );
};

export default CustomChannelList;
