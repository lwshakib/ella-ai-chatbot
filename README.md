# Ella AI Chatbot

**Ella AI** is your intelligent AI assistant, designed to help you with conversations, tasks, and insights. Built with Next.js, Convex, Clerk authentication, and Inngest for background jobs, Ella AI delivers a modern, scalable, and secure chat experience.

---

## Features

- ✨ **AI-powered chat** with support for advanced tools (Pro plan required for some features)
- 🔒 **Authentication** via Clerk
- 💾 **Convex** for real-time data and backend logic
- ⚡ **Inngest** for background job processing (AI response generation, etc.)
- 🎨 **Modern UI** with Tailwind CSS and custom theming (light/dark mode)
- 📊 **Markdown & Mermaid** rendering for rich content
- 🧩 Modular, scalable codebase

---

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Convex** (Database & Functions)
- **Clerk** (Authentication)
- **Inngest** (Background Jobs)
- **Tailwind CSS** (Styling)
- **Zustand** (State Management)
- **Mermaid** (Diagrams)
- **Sonner** (Toasts/Notifications)

---

## Project Structure

```
ella-ai-chatbot/
│
├── app/                  # Next.js app directory (routing, layouts, API routes)
│   ├── (auth)/           # Auth pages (sign-in, sign-up)
│   ├── (main)/           # Main app pages (account, billing, chat, etc.)
│   ├── api/              # API routes (chat, inngest)
│   ├── globals.css       # Global styles (Tailwind, custom themes)
│   └── layout.tsx        # Root layout (providers, metadata)
│
├── components/           # Reusable React components (UI, navigation, charts, etc.)
│
├── constants/            # App-wide constants (e.g., prompt templates)
│
├── convex/               # Convex backend (functions, schema, config)
│
├── hooks/                # Custom React hooks
│
├── inngest/              # Inngest event handlers and client
│
├── lib/                  # Utility functions and Zustand store
│
├── public/               # Static assets (icons, manifest, images)
│
├── middleware.ts         # Clerk middleware for route protection
│
├── package.json          # Project dependencies and scripts
└── README.md             # Project documentation (this file)
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/ella-ai-chatbot.git
cd ella-ai-chatbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root and add the following (replace with your actual keys):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=


NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/


CONVEX_DEPLOYMENT=

NEXT_PUBLIC_CONVEX_URL

CLERK_FRONTEND_API_URL=

NEXT_PUBLIC_GOOGLE_API_KEY=""
NEXT_PUBLIC_TAVILY_API_KEY=""

NEXT_PUBLIC_NEBIUS_API_KEY=""
```

### 4. Development

```bash
npm run dev
npx convex dev
npx inngest-cli@latest dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---

## Authentication

- Uses **Clerk** for user authentication.
- Public routes: `/sign-in`, `/sign-up`, `/api/inngest`
- All other routes are protected via `middleware.ts`.

---

## AI Chat & Pro Plan

- The `/api/chat/route.ts` endpoint handles chat requests.
- Some tools/features require a Pro plan. Users without Pro are prompted to upgrade on restricted actions.

---

## Background Jobs

- **Inngest** is used for background processing (e.g., generating AI responses).
- See `inngest/functions.ts` for event handlers.

---

## Styling & Theming

- **Tailwind CSS** for utility-first styling.
- Custom themes and dark mode support via `ThemeProvider` and `globals.css`.

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

[MIT](LICENSE)

---

## Credits

- [Convex](https://convex.dev/)
- [Clerk](https://clerk.com/)
- [Inngest](https://www.inngest.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js](https://nextjs.org/)

---

> _Ella AI - Experience the future of AI-powered productivity._
