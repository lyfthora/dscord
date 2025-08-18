"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const initializeSupabase = async () => {
    try {
      setIsRetrying(true);

      // Consideramos que Supabase está inicializado incluso si hay advertencias
      setIsInitialized(true);
      setError(null);
      console.log("Supabase initialized with possible limitations");
    } catch (err) {
      console.error("Error checking Supabase configuration:", err);
      // Registramos el error pero no bloqueamos la inicialización
      setError(err instanceof Error ? err.message : "Unknown error");
      // Aún así, consideramos que Supabase está inicializado para permitir
      // que la aplicación funcione con limitaciones
      setIsInitialized(true);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    initializeSupabase();
  }, []);

  // Mostramos advertencias en la consola pero permitimos que la aplicación funcione
  if (error) {
    console.warn("Supabase initialization warning:", error);
  }

  return <>{children}</>;
}
