# Discord Clone

This project is a feature-rich clone of Discord built with a modern tech stack, including Next.js, TypeScript, and Tailwind CSS. It leverages third-party services like Clerk for authentication, Stream for real-time chat and video, and Supabase for data storage.

## Features

- **Complete Authentication**: Secure user registration and login handled by Clerk.
- **Server Management**: Create and switch between different servers (guilds).
- **Channel Organization**: Create and manage text and voice/video channels within servers.
- **Real-Time Chat**: Instant messaging in channels, powered by Stream Chat. Includes custom message components, date separators, and emoji reactions.
- **Video and Voice Calls**: High-quality, real-time video and voice communication within channels, powered by Stream's Video SDK.
- **User Profiles**: Users have profiles with customizable usernames and avatars. Profile changes are synced across the application.
- **File Uploads**: Avatar images are uploaded to and served from Supabase Storage.
- **Responsive UI**: A modern, responsive interface built with Tailwind CSS, featuring resizable sidebars for a customizable user experience.
- **Theming**: Supports both Light and Dark modes.

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Authentication**: [Clerk](https://clerk.dev/)
- **Real-Time Chat**: [Stream Chat](https://getstream.io/chat/)
- **Video & Voice**: [Stream Video SDK](https://getstream.io/video/)
- **Database & Storage**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Library**: [React](https://reactjs.org/)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A [Clerk](https://clerk.dev/) account
- A [Stream](https://getstream.io/) account
- A [Supabase](https://supabase.com/) project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/discord-clone.git
    cd discord-clone
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add your credentials from Clerk, Stream, and Supabase. You can use `.env.local.example` as a template.

    ```
    # Clerk
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    # Stream
    STREAM_API_KEY=
    STREAM_CHAT_SECRET=

    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=
    NEXT_PUBLIC_SUPABASE_ANON_KEY=
    ```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application in action.