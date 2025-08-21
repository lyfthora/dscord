import { useClient } from "@/hooks/useClient";
import { User } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelList,
  ChannelHeader,
  MessageList,
  MessageInput,
  Thread,
  Window,
} from "stream-chat-react";

import CustomChannelList from "@/components/ChannelList/CustomChannelList";
import ServerList from "@/components/ServerList/ServerList";
import MessageComposer from "@/components/MessageList/MessageComposer/MessageComposer";
import CustomDateSeparator from "@/components/MessageList/CustomDateSeparator/CustomDateSeparator";
import CustomMessage from "@/components/MessageList/CustomMessage/CustomMessage";
import { customReactionOptions } from "@/components/MessageList/CustomReactions/CustomReactionsSelector";
import { useVideoClient } from "@/hooks/useVideoClient";
import { StreamVideo } from "@stream-io/video-react-sdk";
import { useDiscordContext } from "@/contexts/DiscordContext";
import MyCall from "@/components/MyCall/MyCall";
import CustomChannelHeader from "./MessageList/CustomChannelHeader/CustomChannelHeader";
import AsciiLoader from "@/components/Ascii/AsciiLoader";

import { useTheme } from "next-themes";

export default function MyChat({
  apiKey,
  user,
  token,
}: {
  apiKey: string;
  user: User;
  token: string;
}) {
  const { theme } = useTheme();
  const chatClient = useClient({
    apiKey,
    user,
    tokenOrProvider: token,
  });
  const videoClient = useVideoClient({
    apiKey,
    user,
    tokenOrProvider: token,
  });
  const { callId } = useDiscordContext();

  if (!chatClient || !videoClient) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#313338",
        }}
      >
        <AsciiLoader />
      </div>
    );
  }

  return (
    <StreamVideo client={videoClient}>
      <Chat
        client={chatClient}
        theme={
          theme === "dark" ? "str-chat__theme-dark" : "str-chat__theme-light"
        }
      >
        <div className="flex flex-col h-screen w-screen">
          <div className="p-1 text-center text-sm font-bold bg-black text-white">
            Discord
          </div>
          <section className="flex flex-grow layout bg-white dark:bg-gray-800 gap-y-4">
            <ServerList />
            <ChannelList List={CustomChannelList} sendChannelsToList={true} />
            {callId && <MyCall callId={callId} />}
            {!callId && (
              <Channel
                Message={CustomMessage}
                Input={MessageComposer}
                DateSeparator={CustomDateSeparator}
                reactionOptions={customReactionOptions}
                HeaderComponent={CustomChannelHeader}
              >
                <Window>
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            )}
          </section>
        </div>
      </Chat>
    </StreamVideo>
  );
}
