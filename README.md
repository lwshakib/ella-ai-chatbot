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

## Production Deployment

### 1. Clerk Setup

1. **Create Clerk Account and Add Billing Plan**

   - Go to [clerk.com](https://clerk.com) and create an account
   - Choose a billing plan that fits your needs
   - Set up your application

2. **Add JWT Templates**

   - In your Clerk dashboard, go to JWT Templates
   - Create custom templates if needed for your application

3. **Copy Clerk Frontend URL**
   - Get your Clerk Frontend API URL from the dashboard
   - Add it to your environment variables as `CLERK_FRONTEND_API_URL`

### 2. Convex Database Setup

1. **Create Convex Database**

   - Go to [convex.dev](https://convex.dev) and create an account
   - Create a new project/database
   - Get your deployment URL

2. **Add Frontend URL on Convex**
   - In your Convex dashboard, add your production frontend URL
   - This allows your frontend to communicate with the database

**How to go to Convex deployment:**

- Search on Google: "How to deploy Convex database"
- Follow the official Convex deployment documentation
- Use `npx convex deploy` to deploy your functions

### 3. Inngest Setup

1. **Create Inngest Account**

   - Go to [inngest.com](https://inngest.com) and create an account
   - Set up your project

2. **Add using Manual Deployment**
   - Configure Inngest for manual deployment
   - Set up your event handlers and functions

**How to go to Inngest manual deployment:**

- Search on Google: "How to deploy Inngest manually"
- Follow the Inngest manual deployment guide
- Configure your production environment variables

### 4. Production Environment Variables

Update your production environment with the actual keys and URLs:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_clerk_key
CLERK_SECRET_KEY=your_production_clerk_secret
CONVEX_DEPLOYMENT=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CLERK_FRONTEND_API_URL=your_clerk_frontend_url
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
NEXT_PUBLIC_TAVILY_API_KEY=your_tavily_api_key
NEXT_PUBLIC_NEBIUS_API_KEY=your_nebius_api_key
```

### 5. Deploy to Production

```bash
# Build the application
npm run build:pro


```

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
