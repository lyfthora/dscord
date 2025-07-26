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
      let filters: ChannelFilters = {
        type: "messaging",
        members: { $in: [client.userID as string] },
      };

      if (!server) {
        filters.member_count = 2;
      }

      const channels = await client.queryChannels(filters);
      const channelsByCategories = new Map<
        string,
        Array<Channel<DefaultStreamChatGenerics>>
      >();

      if (server) {
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
        channelsByCategories.set("Direct Messages", channels);
      }

      setMyState((prev) => ({ ...prev, server, channelsByCategories }));
    },
    []
  );

  const createDirectMessage = useCallback(
    async (client: StreamChat, otherUserId: string) => {
      const userIds = [client.userID, otherUserId].filter(
        (id): id is string => typeof id === "string"
      );
      console.log("Client userID:", client.userID);
      if (userIds.length !== 2) {
        throw new Error("Missing user IDs for direct message");
      }

      const existing = await client.queryChannels({
        type: "messaging",
        member_count: 2,
        members: { $eq: userIds },
      });
      console.log("Existing channels:", existing);
      let channel: Channel;

      if (existing.length > 0) {
        channel = existing[0];
      } else {
        channel = client.channel("messaging", {
          members: userIds,
        });
        await channel.create();
      }

      return channel;
    },
    []
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
        } catch (err) {
          console.error(err);
        }
      }
    },
    [myState.server?.name]
  );

  const setCall = useCallback((callId: string | undefined) => {
    setMyState((prev) => ({ ...prev, callId }));
  }, []);

  const store: DiscordState = {
    server: myState.server,
    callId: myState.callId,
    createDirectMessage,
    channelsByCategories: myState.channelsByCategories,
    changeServer,
    createServer,
    createChannel,
    createCall,
    setCall,
  };

  return (
    <DiscordContext.Provider value={store}>{children}</DiscordContext.Provider>
  );
};

export const useDiscordContext = () => useContext(DiscordContext);
