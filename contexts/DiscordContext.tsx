"use client";

import { DiscordServer } from "@/app/page";
import { MemberRequest, StreamVideoClient } from "@stream-io/video-client";
import { createContext, useCallback, useContext, useState } from "react";
import { Channel, ChannelFilters, StreamChat } from "stream-chat";
import { DefaultStreamChatGenerics } from "stream-chat-react";
import { v4 as uuid } from "uuid";

type ChannelData = {
  server?: string;
  category?: string;
  image?: string;
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
    imageUrl: string,
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

const DiscordContext = createContext<DiscordState>(initialValue);

export const DiscordContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [myState, setMyState] = useState<DiscordState>(initialValue);

  const changeServer = useCallback(
    async (server: DiscordServer | undefined, client: StreamChat) => {
      // Define filtros básicos
      let filters: ChannelFilters = {
        type: "messaging",
        members: { $in: [client.userID as string] },
      };

      if (!server) {
        // Filtramos solo canales con exactamente 2 miembros para DMs
        filters = {
          type: "messaging",
          member_count: 2,
          members: { $in: [client.userID as string] },
        };
      }

      const channels = await client.queryChannels(filters);
      console.log(channels);

      const channelsByCategories = new Map<
        string,
        Array<Channel<DefaultStreamChatGenerics>>
      >();

      if (server) {
        // Filtra canales que pertenecen al servidor seleccionado y agrupa por categorías
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
      } else {
        // Aquí filtramos para que solo queden DMs reales, que no tengan server ni category
        const dmChannels = channels.filter((channel) => {
          const data = channel.data?.data as ChannelData | undefined;
          return !data?.server && !data?.category;
        });

        // Cambiamos el nombre para mostrar el nombre del otro usuario en el DM
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
      }

      setMyState((prev) => ({ ...prev, server, channelsByCategories }));
    },
    [setMyState]
  );

  const createDirectMessage = useCallback(
    async (client: StreamChat, otherUserId: string) => {
      const userIds = [client.userID, otherUserId].filter(
        (id): id is string => typeof id === "string"
      ).sort();

      if (userIds.length !== 2) {
        throw new Error("Missing user IDs for direct message");
      }

      // Tomar una parte de los IDs de usuario para mantener el ID del canal corto
      const channelId = `dm-${userIds[0].substring(0, 20)}-${userIds[1].substring(0, 20)}`;

      let channel = client.channel("messaging", channelId, {
        members: userIds,
      });

      await channel.create();

      // Actualiza la lista de canales para que aparezca el nuevo DM
      changeServer(undefined, client);

      return channel;
    },
    [changeServer]
  );

  const createCall = useCallback(
    async (
      client: StreamVideoClient,
      server: DiscordServer,
      channelName: string,
      userIds: string[]
    ) => {
      const callId = uuid();
      const audioCall = client.call("default", callId);
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
      imageUrl: string,
      userIds: string[]
    ) => {
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

        if (myState.server) {
          await createCall(
            videoClient,
            myState.server,
            "General Voice Channel",
            userIds
          );
        }

        changeServer({ name, image: imageUrl }, client);
      } catch (err) {
        console.error(err);
      }
    },
    [changeServer, createCall, myState.server]
  );

  const createChannel = useCallback(
    async (
      client: StreamChat,
      name: string,
      category: string,
      userIds: string[]
    ) => {
      if (client.userID) {
        const channel = client.channel("messaging", {
          name,
          members: userIds,
          data: {
            server: myState.server?.name,
            category,
          },
        });

        try {
          await channel.create();
          changeServer(myState.server, client);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [myState.server?.name, myState.server, changeServer]
  );

  const setCall = useCallback((callId: string | undefined) => {
    setMyState((prev) => ({ ...prev, callId }));
  }, []);

  const store: DiscordState = {
    server: myState.server,
    callId: myState.callId,
    channelsByCategories: myState.channelsByCategories,
    changeServer: changeServer,
    createServer: createServer,
    createDirectMessage: createDirectMessage,
    createChannel: createChannel,
    createCall: createCall,
    setCall: setCall,
  };

  return (
    <DiscordContext.Provider value={store}>{children}</DiscordContext.Provider>
  );
};

export const useDiscordContext = () => useContext(DiscordContext);
