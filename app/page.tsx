"use client";

import { User } from "stream-chat";
import AsciiLoader from "@/components/Ascii/AsciiLoader";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import MyChat from "@/components/MyChat";
import { useRouter } from "next/navigation";
import { StreamChat } from "stream-chat";

const apiKey = "c9xtdzvv8faw";

export type DiscordServer = {
  name: string;
  image: string | undefined;
};

export type Homestate = {
  apiKey: string;
  user: User;
  token: string;
  client: StreamChat;
};

export default function Home() {
  const [myState, setMyState] = useState<Homestate | undefined>(undefined);
  const { user: myUser, isLoaded } = useUser();
  const router = useRouter();
  const [isStreamSetupComplete, setStreamSetupComplete] = useState(false);

  // Effect 1: One-time setup. Stable dependencies.
  useEffect(() => {
    if (isLoaded && !isStreamSetupComplete) {
      const setupStream = async () => {
        // We need the user object to proceed, but it's not a dependency
        // to prevent re-runs.
        if (!myUser) {
          return;
        }

        if (myUser.publicMetadata?.username === undefined) {
          console.log("Waiting for Clerk publicMetadata to be hydrated...");
          return;
        }

        console.log("[Effect 1] Performing one-time Stream setup...");

        const username =
          (myUser.publicMetadata.username as string) || "Unknown";
        const imageUrl =
          (myUser.publicMetadata?.imageUrl as string) || myUser.imageUrl;

        // 1. Register user on our backend if they aren't already
        if (!myUser.publicMetadata.streamRegistered) {
          if (!myUser.publicMetadata.username) {
            router.push("/register");
            return;
          }
          await fetch("/api/register-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: myUser.id,
              email: myUser.primaryEmailAddress?.emailAddress,
              username: username,
              imageUrl: imageUrl,
            }),
          });
        }

        // 2. Get Stream token
        const response = await fetch("/api/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: myUser.id }),
        });
        const { token } = await response.json();
        if (!token) {
          console.error("Failed to get Stream token.");
          return;
        }

        // 3. Connect to Stream
        const client = new StreamChat(apiKey);
        const userToConnect: User = {
          id: myUser.id,
          name: username,
          image: imageUrl,
        };
        await client.connectUser(userToConnect, token);

        setMyState({
          apiKey: apiKey,
          user: userToConnect,
          token: token,
          client: client,
        });
        setStreamSetupComplete(true);
      };

      setupStream();
    }
  }, [isLoaded, isStreamSetupComplete, router, myUser]);

  useEffect(() => {
    if (myUser && myState && isStreamSetupComplete) {
      const username = (myUser.publicMetadata.username as string) || "Unknown";
      const imageUrl =
        (myUser.publicMetadata?.imageUrl as string) || myUser.imageUrl;
      const currentUser = myState.user;

      if (currentUser.name !== username || currentUser.image !== imageUrl) {
        console.log(
          "[Effect 2] Detected user data change, calling update-profile API to sync..."
        );
        const updateUserProfile = async () => {
          await fetch("/api/update-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: myUser.id,
              username: username,
              avatarUrl: imageUrl,
            }),
          });
          // Also update local state immediately for better UX
          const updatedUser = {
            ...currentUser,
            name: username,
            image: imageUrl,
          };
          setMyState((prevState) => ({ ...prevState!, user: updatedUser }));
        };
        updateUserProfile();
      }
    }
  }, [myUser, myState, isStreamSetupComplete]); // This effect runs whenever the user object from Clerk changes.

  if (!myState) {
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

  return <MyChat {...myState} />;
}
