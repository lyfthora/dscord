import { clerkClient } from "@clerk/nextjs";
import { StreamChat } from "stream-chat";

export async function POST(request: Request) {
  const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY as string,
    process.env.STREAM_CHAT_SECRET
  );
  const body = await request.json();
  console.log("[/api/register-user] Body:", body);

  const userId = body?.userId;
  const username = body?.username;

  const imageUrl = body?.imageUrl;

  if (!userId || !username) {
    return Response.error();
  }

  const user = await serverClient.upsertUser({
    id: userId,
    role: "user",
    name: username,
    image: imageUrl,
  });

  // Fetch existing user to merge metadata
  const existingUser = await clerkClient.users.getUser(userId);
  const existingMetadata = existingUser.publicMetadata || {};

  const params = {
    publicMetadata: {
      ...existingMetadata,
      streamRegistered: true,
      username: username,
    },
  };
  const updatedUser = await clerkClient.users.updateUser(userId, params);

  console.log("[/api/register-user] User:", updatedUser);
  const response = {
    userId: userId,
    userName: username,
  };

  return Response.json(response);
}
