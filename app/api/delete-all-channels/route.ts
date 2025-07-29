import { NextRequest, NextResponse } from "next/server";
import { StreamChat } from "stream-chat";

// Función para inicializar el cliente de Stream en el servidor
const getStreamClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const apiSecret = process.env.STREAM_CHAT_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Stream API key or secret is not set in environment variables."
    );
  }

  return new StreamChat(apiKey, apiSecret);
};

export async function POST(req: NextRequest) {
  // ¡¡¡IMPORTANTE: Medida de seguridad para evitar el borrado accidental en producción!!!
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This action is only available in development mode." },
      { status: 403 }
    );
  }

  try {
    const client = getStreamClient();

    // 1. Obtener todos los canales. Usamos un filtro vacío para obtenerlos todos.
    const channels = await client.queryChannels({}, [], {
      watch: false, // No necesitamos observar cambios
      state: false, // No necesitamos el estado del canal
      limit: 100, // Ajusta el límite si tienes más de 100 canales
    });

    if (channels.length === 0) {
      return NextResponse.json({ message: "No channels found to delete." });
    }

    // 2. Extraer los IDs de los canales (cids)
    const channelIds = channels.map((channel) => channel.cid);

    // 3. Borrar los canales de forma permanente
    await client.deleteChannels(channelIds, { hard_delete: true });

    return NextResponse.json({
      message: `Successfully deleted ${channels.length} channels and their messages.`,
    });
  } catch (error) {
    console.error("Error deleting channels:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: "Failed to delete channels.", details: errorMessage },
      { status: 500 }
    );
  }
}
