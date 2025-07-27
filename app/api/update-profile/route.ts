import { clerkClient } from "@clerk/nextjs";
import { StreamChat } from "stream-chat";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const serverClient = StreamChat.getInstance(
    "jewc2e8wxrtk",
    process.env.STREAM_CHAT_SECRET
  );
  const body = await request.json();
  console.log("[/api/update-profile] Body:", body);

  // Inicializar el cliente de Supabase
  const supabase = createClient(cookies());

  const userId = body?.userId;
  const username = body?.username;
  const avatarUrl = body?.avatarUrl;

  if (!userId || !username) {
    return Response.error();
  }

  const user = await serverClient.upsertUser({
    id: userId,
    role: "user",
    name: username,
    image: avatarUrl, // Add this line
    imageUrl: avatarUrl,
  });

  const params = {
    publicMetadata: {
      username: username,
      imageUrl: avatarUrl,
    },
  };
  const updatedUser = await clerkClient.users.updateUser(userId, params);

  console.log("[/api/update-profile] User:", updatedUser);
  const response = {
    userId: userId,
    userName: username,
    avatarUrl: avatarUrl,
  };

  return Response.json(response);
}
