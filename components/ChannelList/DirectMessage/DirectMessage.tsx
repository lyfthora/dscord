import { useDiscordContext } from "@/contexts/DiscordContext";
import { useChatContext } from "stream-chat-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const CreateDirectMessage = () => {
  const { client, setActiveChannel } = useChatContext();
  const [username, setUsername] = useState("");

  const handleCreateDM = async () => {
    if (!username) return;

    try {
      // Buscar usuario por nombre
      const response = await client.queryUsers({ name: { $eq: username } });
      if (!response.users.length) {
        alert("Usuario no encontrado");
        return;
      }

      const targetUser = response.users[0];

      // Generar un ID de canal determinista para DMs
      const members = [client.userID!, targetUser.id].sort();
      // Tomar una parte de los IDs de usuario para mantener el ID del canal corto
      const channelId = `dm-${members[0].substring(
        0,
        20
      )}-${members[1].substring(0, 20)}`;

      const channel = client.channel("messaging", channelId, {
        members: members,
        data: {
          isDirectMessage: true,
        },
      });

      await channel.create();
      setActiveChannel(channel);
      setUsername("");
    } catch (error) {
      console.error("Error creando DM:", error);
      alert("Error al crear mensaje directo");
    }
  };

  return (
    <div className="p-4 ">
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border dark:border-[var(--border-color)] dark:bg-[var(--gray-normal)] rounded px-2 py-1 w-full mr-14 "
      />
      <div className="flex justify-center mt-3">
        <button
          onClick={handleCreateDM}
          className="w-full bg-discord dark:bg-[var(--gray-normal)] border dark:border-[var(--border-color)] text-white font-bold py-1 rounded uppercase hover:bg-dark-discord text-center "
        >
          DM
        </button>
      </div>
    </div>
  );
};

export default CreateDirectMessage;
