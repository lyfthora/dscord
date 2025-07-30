"use client";

import { DiscordServer } from "@/app/page";
import { supabase } from "@/lib/supabase";
import { MemberRequest, StreamVideoClient } from "@stream-io/video-client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Channel, ChannelFilters, StreamChat } from "stream-chat";
import { DefaultStreamChatGenerics } from "stream-chat-react";
import { v4 as uuid } from "uuid";

type ChannelData = {
  server?: string;
  category?: string;
  image?: string;
  isDM?: boolean;
};

type DiscordState = {
  server?: DiscordServer;
  callId: string | undefined;
  channelsByCategories: Map<string, Array<Channel<DefaultStreamChatGenerics>>>;
  changeServer: (server: DiscordServer | undefined, client: StreamChat) => void;
  createDirectMessage: (
    client: StreamChat,
    otherUserId: string
  ) => Promise<Channel>;
  createServer: (
    client: StreamChat,
    videoClient: StreamVideoClient,
    name: string,
    imageFile: File,
    userIds: string[]
  ) => void;
  createChannel: (
    client: StreamChat,
    name: string,
    category: string,
    userIds: string[]
  ) => void;
  createCall: (
    client: StreamVideoClient,
    server: DiscordServer,
    channelName: string,
    userIds: string[]
  ) => Promise<void>;
  setCall: (callId: string | undefined) => void;
};

const initialValue: DiscordState = {
  server: undefined,
  callId: undefined,
  channelsByCategories: new Map(),
  changeServer: () => {},
  createServer: () => {},
  createChannel: () => {},
  createCall: async () => {},
  setCall: () => {},
  createDirectMessage: async () => {
    throw new Error("createDirectMessage not implemented");
  },
};

const DISCORD_SERVER_STORAGE_KEY = "discord_current_server";

const DiscordContext = createContext<DiscordState>(initialValue);

export const DiscordContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [myState, setMyState] = useState<DiscordState>(initialValue);

  // Función para obtener URL pública desde supabase
  const getImageUrl = async (
    serverName: string
  ): Promise<string | undefined> => {
    const { data } = supabase.storage
      .from("servers")
      .getPublicUrl(`${serverName}.jpg`);
    return data?.publicUrl;
  };

  // Al montar el provider, recuperar servidor guardado en localStorage
  useEffect(() => {
    const stored = localStorage.getItem(DISCORD_SERVER_STORAGE_KEY);
    if (stored) {
      try {
        const parsed: DiscordServer = JSON.parse(stored);
        setMyState((prev) => ({ ...prev, server: parsed }));
      } catch {
        // ignore parsing error
      }
    }
  }, []);

  // Guardar servidor en localStorage
  const persistServer = (server?: DiscordServer) => {
    if (server) {
      localStorage.setItem(DISCORD_SERVER_STORAGE_KEY, JSON.stringify(server));
    } else {
      localStorage.removeItem(DISCORD_SERVER_STORAGE_KEY);
    }
  };

  const changeServer = useCallback(
    async (server: DiscordServer | undefined, client: StreamChat) => {
      const filters: ChannelFilters = {
        type: "messaging",
        members: { $in: [client.userID as string] },
      };

      const channels = await client.queryChannels(filters);
      const channelsByCategories = new Map<
        string,
        Array<Channel<DefaultStreamChatGenerics>>
      >();

      if (server) {
        // Verifica que la imagen esté presente
        let image = server.image;
        if (!image) {
          image = await getImageUrl(server.name);
        }

        const categories = new Set(
          channels
            .filter(
              (channel) =>
                (channel.data?.data as ChannelData)?.server === server.name
            )
            .map((channel) => (channel.data?.data as ChannelData)?.category)
        );

        for (const category of categories) {
          const key = category ?? "Uncategorized";
          channelsByCategories.set(
            key,
            channels.filter(
              (channel) =>
                (channel.data?.data as ChannelData)?.server === server.name &&
                (channel.data?.data as ChannelData)?.category === category
            )
          );
        }

        const newServer = { name: server.name, image };
        persistServer(newServer);

        setMyState((prev) => ({
          ...prev,
          server: newServer,
          channelsByCategories,
        }));
      } else {
        // Si no hay servidor, borramos localStorage también
        persistServer(undefined);

        const dmChannels = channels.filter((channel) => {
          const members = Object.keys(channel.state.members);
          return (
            members.length === 2 &&
            members.includes(client.userID as string) &&
            ((channel.data?.data as ChannelData)?.isDM === true ||
              !(channel.data?.data as ChannelData)?.server)
          );
        });

        const renamedDMs = dmChannels.map((channel) => {
          const otherUser = Object.values(channel.state.members).find(
            (member) => member.user?.id !== client.userID
          );
          channel.data = {
            ...channel.data,
            name: otherUser?.user?.name || "Unknown User",
          };
          return channel;
        });

        channelsByCategories.set("Direct Messages", renamedDMs);
        setMyState((prev) => ({
          ...prev,
          server: undefined,
          channelsByCategories,
        }));
      }
    },
    []
  );

  const createDirectMessage = useCallback(
    async (client: StreamChat, otherUserId: string) => {
      const userIds = [client.userID, otherUserId]
        .filter((id): id is string => !!id)
        .sort();

      const channelId = `dm-${userIds[0].substring(
        0,
        20
      )}-${userIds[1].substring(0, 20)}`;
      const channel = client.channel("messaging", channelId, {
        members: userIds,
        data: { isDM: true },
      });

      await channel.create();
      await changeServer(undefined, client);
      return channel;
    },
    [changeServer]
  );

  const createCall = useCallback(
    async (
      videoClient: StreamVideoClient,
      server: DiscordServer,
      channelName: string,
      userIds: string[]
    ) => {
      const callId = uuid();
      const audioCall = videoClient.call("default", callId);
      const members: MemberRequest[] = userIds.map((user_id) => ({ user_id }));

      try {
        const createdAudioCall = await audioCall.create({
          data: {
            custom: {
              serverName: server.name,
              callName: channelName,
            },
            members,
          },
        });

        console.log(
          `[DiscordContext] Created Call with id: ${createdAudioCall.call.id}`
        );
      } catch (err) {
        console.error(err);
      }
    },
    []
  );

  const createServer = useCallback(
    async (
      client: StreamChat,
      videoClient: StreamVideoClient,
      name: string,
      imageFile: File,
      userIds: string[]
    ) => {
      // Subir la imagen y obtener URL pública
      const { data, error } = await supabase.storage
        .from("servers")
        .upload(`${name}.jpg`, imageFile, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error) {
        console.error("Image upload failed", error);
        return;
      }

      const imageUrl = supabase.storage
        .from("servers")
        .getPublicUrl(`${name}.jpg`).data.publicUrl;

      const messagingChannel = client.channel("messaging", uuid(), {
        name: "Welcome",
        members: userIds,
        data: {
          image: imageUrl,
          server: name,
          category: "Text Channels",
        },
      });

      try {
        await messagingChannel.create();

        const server: DiscordServer = { name, image: imageUrl };

        await createCall(videoClient, server, "General Voice Channel", userIds);
        changeServer(server, client);
      } catch (err) {
        console.error(err);
      }
    },
    [changeServer, createCall]
  );

  const createChannel = useCallback(
    async (
      client: StreamChat,
      name: string,
      category: string,
      userIds: string[]
    ) => {
      if (!myState.server) return;

      const channel = client.channel("messaging", {
        name,
        members: userIds,
        data: {
          server: myState.server.name,
          category,
          image: myState.server.image,
        },
      });

      try {
        await channel.create();
        await changeServer(myState.server, client);
      } catch (err) {
        console.error(err);
      }
    },
    [myState.server, changeServer]
  );

  const setCall = useCallback((callId: string | undefined) => {
    setMyState((prev) => ({ ...prev, callId }));
  }, []);

  const store: DiscordState = {
    server: myState.server,
    callId: myState.callId,
    channelsByCategories: myState.channelsByCategories,
    changeServer,
    createServer,
    createDirectMessage,
    createChannel,
    createCall,
    setCall,
  };

  return (
    <DiscordContext.Provider value={store}>{children}</DiscordContext.Provider>
  );
};

export const useDiscordContext = () => useContext(DiscordContext);
