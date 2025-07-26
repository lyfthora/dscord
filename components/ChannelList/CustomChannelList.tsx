import { useChatContext } from "stream-chat-react";
import { useDiscordContext } from "@/contexts/DiscordContext";
import CreateChannelForm from "./CreateChannelForm/CreateChannelForm";
import UserBar from "./BottomBar/ChannelListBottomBar";
import DirectMessage from "./DirectMessage/DirectMessage";
import CategoryItem from "./CategoryItem/CategoryItem";
import CallList from "./CallList/CallList";

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

      {/* Solo mostrar el listado si hay servidor seleccionado */}
      {server && (
        <>
          <div className="w-full">
            {Array.from(channelsByCategories.keys()).map((category, index) => (
              <CategoryItem
                key={`${category}-${index}`}
                category={category}
                serverName={server?.name || "Direct Messages"}
                channels={channelsByCategories.get(category) || []}
              />
            ))}
          </div>

          <CallList />
          <CreateChannelForm />
        </>
      )}

      <UserBar />
    </div>
  );
};

export default CustomChannelList;
