# Discord

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

### Ejecución

```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.
