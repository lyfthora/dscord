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
    <div className="w-72 bg-medium-gray h-full flex flex-col items-start">
      {/* Botón para mostrar mensajes directos */}
      <DirectMessage />
      <button
        className={`w-full py-3 px-4 text-left font-semibold cursor-pointer
          ${!server ? "bg-gray-700 text-white" : "hover:bg-gray-600"}`}
        onClick={() => changeServer(undefined, client)}
      >
        📬 Direct Messages
      </button>

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
      ) : (
        <Link
          href={`/?createChannel=true&isDM=true`}
          className="flex items-center justify-center rounded-icon bg-white text-green-500 hover:bg-green-500 hover:text-white hover:rounded-xl transition-all duration-200 p-2 my-2 text-2xl font-light h-12 w-12"
        >
          <span className="inline-block">+ DM</span>
        </Link>
      )}

      <UserBar />
    </div>
  );
};

export default CustomChannelList;
