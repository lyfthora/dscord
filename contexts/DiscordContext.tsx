"use client";

import { DiscordServer } from "@/app/page";
import { supabase } from "@/lib/supabase";
import { Call, MemberRequest, StreamVideoClient } from "@stream-io/video-client";
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
  calls: Call[];
  channelsByCategories: Map<string, Array<Channel<DefaultStreamChatGenerics>>>;
  serverMembers: string[];
  changeServer: (
    server: DiscordServer | undefined,
    client: StreamChat,
    videoClient: StreamVideoClient
  ) => void;
  createDirectMessage: (
    client: StreamChat,
    videoClient: StreamVideoClient,
    otherUserId: string
  ) => Promise<Channel>;
  createServer: (
    client: StreamChat,
    videoClient: StreamVideoClient,
    name: string,
    imageFile: File,
    userIds: string[]
  ) => Promise<DiscordServer>;
  createChannel: (
    client: StreamChat,
    videoClient: StreamVideoClient,
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
  calls: [],
  channelsByCategories: new Map(),
  serverMembers: [],
  changeServer: () => {},
  createServer: async () => ({} as DiscordServer),
  createChannel: () => {},
  createCall: async () => {},
  setCall: () => {},
  createDirectMessage: async () => ({} as Channel),
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
  const getImageUrl = async (serverName: string): Promise<string> => {
    const { data } = supabase.storage
      .from("servers")
      .getPublicUrl(`${serverName}.jpg`);
    return data?.publicUrl || '';
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
    async (
      server: DiscordServer | undefined,
      client: StreamChat,
      videoClient: StreamVideoClient
    ) => {
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
        let image = server.image;
        if (!image) {
          const fetchedImage = await getImageUrl(server.name);
          image = fetchedImage;
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

        const members = Array.from(
          new Set(
            channels
              .filter(
                (channel) =>
                  (channel.data?.data as ChannelData)?.server === server.name
              )
              .flatMap((channel) => Object.keys(channel.state.members))
          )
        );

        const updatedServer: DiscordServer = {
          ...server,
          image: image,
          members: members.length > 0 ? members : server.members || [],
        };

        const callsRequest = await videoClient.queryCalls({
          filter_conditions: {
            "custom.serverName": server.name,
          },
          sort: [{ field: "created_at", direction: 1 }],
          watch: true,
        });

        setMyState((prev) => ({
          ...prev,
          server: updatedServer,
          channelsByCategories,
          serverMembers: members,
          calls: callsRequest.calls,
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
          serverMembers: [],
          calls: [],
        }));
      }
    },
    []
  );

  const createDirectMessage = useCallback(
    async (
      client: StreamChat,
      videoClient: StreamVideoClient,
      otherUserId: string
    ) => {
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
      await changeServer(undefined, client, videoClient);
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
      console.log('Starting server creation...');
      console.log('Server name:', name);
      console.log('Image file:', imageFile);
      console.log('User IDs:', userIds);

      try {
        // Subir la imagen a Supabase
        let imageUrl = '';
        if (imageFile && imageFile.size > 0) {
          console.log('Uploading image...');
          const fileName = `${uuid()}.jpg`;
          console.log('Generated filename:', fileName);
          
          const { error: uploadError } = await supabase.storage
            .from('servers')
            .upload(fileName, imageFile, {
              cacheControl: '3600',
              upsert: true,
            });

          if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
          }
          console.log('Image uploaded successfully');

          // Obtener la URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('servers')
            .getPublicUrl(fileName);
          
          imageUrl = publicUrl;
          console.log('Image public URL:', imageUrl);
        } else {
          console.log('No image provided or empty file, using default');
        }

        // Incluir al usuario actual en los miembros y eliminar duplicados
        const allMembers = Array.from(new Set([client.userID as string, ...userIds]));
        console.log('All members (deduplicated):', allMembers);

        // Crear el canal general del servidor
        console.log('Creating general channel...');
        const channel = client.channel('messaging', {
          name: 'general',
          data: {
            name: 'general',
            category: 'Text Channels',
            server: name,
            image: imageUrl,
          },
          members: allMembers,
        });

        console.log('Saving channel...');
        await channel.create();
        await channel.addMembers(allMembers);
        console.log('Channel created successfully');

        // Crear el servidor con los miembros
        const newServer: DiscordServer = {
          name,
          image: imageUrl,
          members: allMembers,
        };
        console.log('New server object:', newServer);

        // Actualizar el estado con el nuevo servidor y sus miembros
        console.log('Updating state...');
        setMyState(prev => ({
          ...prev,
          server: newServer,
          serverMembers: allMembers,
          channelsByCategories: new Map([
            ['Text Channels', [channel as unknown as Channel<DefaultStreamChatGenerics>]]
          ])
        }));
        console.log('State updated');

        // Crear un canal de voz por defecto
        console.log('Creating voice channel...');
        await createCall(videoClient, newServer, 'General Voice', userIds);
        console.log('Voice channel created');
        
        console.log('Server creation completed successfully');
        return newServer;
      } catch (error) {
        console.error('Error in createServer:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
        throw error;
      }
    },
    [createCall]
  );

  const createChannel = useCallback(
    async (
      client: StreamChat,
      videoClient: StreamVideoClient,
      name: string,
      category: string,
      userIds: string[]
    ) => {
      if (!myState.server) return;

      const channel = client.channel("messaging", uuid(), {
        name,
        members: userIds,
        data: {
          server: myState.server.name,
          category,
          image: myState.server.image || '',
        },
      });

      try {
        await channel.create();
        await changeServer(myState.server, client, videoClient);
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
    calls: myState.calls,
    channelsByCategories: myState.channelsByCategories,
    serverMembers: myState.serverMembers,
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