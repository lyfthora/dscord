import { useDiscordContext } from "@/contexts/DiscordContext";
import { useChatContext } from "stream-chat-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

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

      // ⚠️ Usar un ID único para forzar la creación
      const channel = client.channel("messaging", uuidv4(), {
        members: [client.userID!, targetUser.id],
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
    <div className="p-4">
      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />
      <button
        onClick={handleCreateDM}
        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
      >
        Crear mensaje directo
      </button>
    </div>
  );
};

export default CreateDirectMessage;
