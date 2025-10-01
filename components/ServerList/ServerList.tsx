import { useChatContext } from "stream-chat-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { DiscordServer } from "@/app/page";
import { useDiscordContext } from "@/contexts/DiscordContext";
import CreateServerForm from "./CreateServerForm";
import Link from "next/link";
import { Channel } from "stream-chat";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";

const ServerList = () => {
  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();
  const { server: activeServer, changeServer } = useDiscordContext();
  const [serverList, setServerList] = useState<DiscordServer[]>([]);

  interface ChannelData {
    server?: string;
    image?: string;
  }

  const loadServerList = useCallback(async (): Promise<void> => {
    if (!videoClient) return;
    const channels = await client.queryChannels({
      type: "messaging",
      members: { $in: [client.userID as string] },
    });
    
    const serverMap = new Map<string, DiscordServer>();
    
    channels.forEach((channel: Channel) => {
      const data = channel.data?.data as ChannelData;
      if (!data?.server) return;
      
      const members = Array.from(
        new Set([...Object.keys(channel.state.members)])
      );
      
      if (serverMap.has(data.server)) {
        // Update members if needed
        const existingServer = serverMap.get(data.server)!;
        const uniqueMembers = new Set([...existingServer.members, ...members]);
        serverMap.set(data.server, {
          ...existingServer,
          members: Array.from(uniqueMembers)
        });
      } else {
        serverMap.set(data.server, {
          name: data.server,
          image: data.image || '',
          members
        });
      }
    });
    
    const serverArray = Array.from(serverMap.values());
    setServerList(serverArray);
    changeServer(undefined, client, videoClient);
  }, [client, changeServer, videoClient]);

  useEffect(() => {
    loadServerList();
  }, [loadServerList]);

  return (
    <div className="bg-dark-gray dark:bg-black h-full flex flex-col items-center">
      <button
        className={`block p-3 aspect-square sidebar-icon partial-bottom-border-server-list ${
          activeServer === undefined ? "selected-icon" : ""
        }`}
        onClick={() => {
          if (!videoClient) return;
          changeServer(undefined, client, videoClient);
        }}
      >
        <div className="rounded-icon discord-icon"></div>
      </button>
      <div className="server-list">
        {serverList.map((server) => {
          return (
            <button
              key={server.name}
              className={`p-4 sidebar-icon  ${
                server === activeServer ? "selected-icon" : ""
              }`}
              onClick={() => {
                if (!videoClient) return;
                changeServer(server, client, videoClient);
              }}
            >
              {server.image && checkIfUrl(server.image) ? (
                <Image
                  className="rounded-icon"
                  src={server.image}
                  width={50}
                  height={50}
                  alt="Server Icon"
                />
              ) : (
                <span className="rounded-icon bg-gray-600 dark:bg-gray-700 w-[50px] flex items-center justify-center text-sm">
                  {server.name.charAt(0)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <Link
        href={"/?createServer=true"}
        className="flex items-center justify-center rounded-icon bg-white dark:bg-gray-700 text-green-500 dark:text-green-400 hover:bg-green-500 dark:hover:bg-green-600 hover:text-white dark:hover:text-white hover:rounded-xl transition-all duration-200 p-2 my-2 text-2xl font-light h-12 w-12"
      >
        <span className="inline-block">+</span>
      </Link>
      <CreateServerForm />
    </div>
  );

  function checkIfUrl(path: string): Boolean {
    try {
      const _ = new URL(path);
      return true;
    } catch (_) {
      return false;
    }
  }
};

export default ServerList;