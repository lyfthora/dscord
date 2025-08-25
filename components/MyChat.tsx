import { useClient } from "@/hooks/useClient";
import { User } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelList,
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
import ChannelListBottomBar from "@/components/ChannelList/BottomBar/ChannelListBottomBar";
import React, { useState, useRef, useEffect, useCallback } from "react";

import { useTheme } from "next-themes";

const SERVER_LIST_WIDTH = 84; // Estimated width of the ServerList component in pixels

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

  // --- Resizing Logic --- //
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const isResizingRef = useRef(false);
  const dragInfo = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isResizingRef.current = true;
    dragInfo.current = {
      startX: e.clientX,
      startWidth: sidebarRef.current ? sidebarRef.current.offsetWidth : sidebarWidth,
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = useCallback(() => {
    isResizingRef.current = false;
    dragInfo.current = null;
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    if (sidebarRef.current) {
      setSidebarWidth(sidebarRef.current.offsetWidth);
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizingRef.current && dragInfo.current && sidebarRef.current) {
      const deltaX = e.clientX - dragInfo.current.startX;
      const newWidth = dragInfo.current.startWidth + deltaX;

      if (newWidth >= 178 && newWidth <= 300) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
    }
  }, []);

  const isCollapsed = sidebarWidth <= 248;
  // --- End Resizing Logic --- //

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
          <section className="flex flex-grow layout bg-white dark:bg-gray-800 gap-y-4 relative">
            <ServerList />
            <div ref={sidebarRef} style={{ width: sidebarWidth }}>
              <ChannelList
                List={(props) => (
                  <CustomChannelList
                    {...props}
                    handleMouseDown={handleMouseDown}
                  />
                )}
                sendChannelsToList={true}
              />
            </div>
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
            <ChannelListBottomBar
              isCollapsed={isCollapsed}
              style={{ width: SERVER_LIST_WIDTH + sidebarWidth - 32, left: 16 }}
            />
          </section>
        </div>
      </Chat>
    </StreamVideo>
  );
}
