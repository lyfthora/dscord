# Discord Clone

Un clon de Discord construido con Next.js, Stream Chat y Clerk para autenticación. Ahora con soporte para almacenamiento de imágenes usando Supabase.

## Características

- Autenticación de usuarios con Clerk
- Chat en tiempo real con Stream Chat
- Almacenamiento de imágenes de avatar con Supabase
- Interfaz de usuario moderna y responsive

## Tecnologías utilizadas

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Clerk](https://clerk.dev/) para autenticación
- [Stream Chat](https://getstream.io/chat/) para chat en tiempo real
- [Supabase](https://supabase.com/) para almacenamiento de imágenes

## Configuración

### Requisitos previos

- Node.js (versión 14 o superior)
- npm o yarn
- Cuenta en Clerk
- Cuenta en Stream Chat
- Cuenta en Supabase

### Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/discord-clone.git
   cd discord-clone
   ```

2. Instala las dependencias:

   ```bash
   npm install
   # o
   yarn install
   ```

3. Configura las variables de entorno:

   ```bash
   cp .env.local.example .env.local
   ```

   Edita el archivo `.env.local` y añade tus credenciales de Clerk, Stream Chat y Supabase.

4. Configura Supabase para el almacenamiento de imágenes:
   - Sigue las instrucciones detalladas en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - **Importante**: Debes crear manualmente un bucket llamado "avatars" en Supabase y configurar las políticas de seguridad como se describe en la documentación.

### Ejecución

```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

### Solución de problemas

Si encuentras errores relacionados con Supabase, como "Failed to create bucket" o "new row violates row-level security policy", consulta la sección de solución de problemas en [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

Problemas comunes:

1. **Error de inicialización de Supabase**: Asegúrate de haber creado manualmente el bucket "avatars" en Supabase y configurado las políticas de seguridad correctamente.

2. **Las imágenes no se cargan**: Verifica que el bucket sea público y que las políticas de seguridad estén configuradas correctamente.

3. **Error de política de seguridad**: Configura manualmente las políticas de seguridad en Supabase como se describe en la documentación.

## Licencia

MIT
