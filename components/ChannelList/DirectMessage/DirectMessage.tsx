import { useDiscordContext } from "@/contexts/DiscordContext";
import { useChatContext } from "stream-chat-react";
import { useState } from "react";

const CreateDirectMessage = () => {
  const { createDirectMessage } = useDiscordContext();
  const { client, setActiveChannel } = useChatContext();
  const [otherUserId, setOtherUserId] = useState("");

  const handleCreateDM = async () => {
    if (!otherUserId) return;

    try {
      const channel = await createDirectMessage(client, otherUserId);
      setActiveChannel(channel);
      // Aquí podrías cerrar el modal o limpiar el input
    } catch (error) {
      console.error("Error creando DM:", error);
    }
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="ID de usuario"
        value={otherUserId}
        onChange={(e) => setOtherUserId(e.target.value)}
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
