'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const initializeSupabase = async () => {
    try {
      setIsRetrying(true);
      
      // Verificar si el bucket existe, pero no intentar crearlo automáticamente
      // ya que esto requiere permisos que la clave anónima no tiene
      const bucketResponse = await fetch('/api/supabase/create-bucket');
      const bucketData = await bucketResponse.json();
      
      if (!bucketResponse.ok) {
        // Si hay un error, podría ser debido a permisos insuficientes
        // Registramos el error pero no bloqueamos la inicialización
        console.warn('Bucket verification warning:', bucketData.error);
        console.info('Para resolver este problema, configura manualmente el bucket "avatars" en el panel de Supabase como se indica en SUPABASE_SETUP.md');
        // No lanzamos error aquí para permitir que la aplicación siga funcionando
      } else {
        console.log('Bucket verification successful:', bucketData.message);
      }
      
      // No intentamos configurar políticas automáticamente
      // ya que esto también requiere permisos elevados
      
      // Consideramos que Supabase está inicializado incluso si hay advertencias
      setIsInitialized(true);
      setError(null);
      console.log('Supabase initialized with possible limitations');
    } catch (err) {
      console.error('Error checking Supabase configuration:', err);
      // Registramos el error pero no bloqueamos la inicialización
      setError(err instanceof Error ? err.message : 'Unknown error');
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
    console.warn('Supabase initialization warning:', error);
    console.info('La aplicación funcionará con limitaciones. Para habilitar todas las funciones, configura manualmente el bucket "avatars" en el panel de Supabase.');
  }

  return <>{children}</>;
}