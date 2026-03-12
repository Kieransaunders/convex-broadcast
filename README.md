# Org Comms

[![GitHub Repo](https://img.shields.io/badge/GitHub-convex--broadcast-blue)](https://github.com/Kieransaunders/convex-broadcast)

An open-source boilerplate for building **organisation communication Progressive Web Apps (PWA)**. Designed for broadcast messaging from administrators to members — perfect for charities, staff communications, university announcements, community groups, and member organisations.

## ✨ Features

- **Broadcast Messaging** — One-way communication from admins to targeted groups
- **PWA with Push Notifications** — Messages delivered in-app and as push notifications
- **Group Targeting** — Organise users into groups for precise audience targeting
- **Event Integration** — Link messages to events for better context
- **Message Scheduling** — Schedule messages to be sent at a future time
- **Simple Role System** — Member, Admin, and Super Admin roles
- **Invitation System** — Invite users via email
- **Admin Impersonation** — Test user experiences as different roles

## 🚀 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | [TanStack Start](https://tanstack.com/start) (React + SSR) |
| **Backend** | [Convex](https://convex.dev) (serverless database + functions) |
| **Auth** | [Better Auth](https://www.better-auth.com/) with Convex adapter |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Base UI + shadcn/ui |
| **Email** | Resend |
| **Push Notifications** | Web Push API |

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- A [Convex](https://convex.dev) account
- (Optional) [Vercel](https://vercel.com) account for deployment

### 1. Clone the Repository

```bash
git clone https://github.com/Kieransaunders/convex-broadcast.git
cd convex-broadcast
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Convex

```bash
# Install Convex CLI globally (if not already installed)
npm install -g convex

# Log in to Convex
npx convex login

# Initialize your Convex project (creates a new deployment)
npx convex dev
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Convex Configuration (auto-populated after `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_SITE_URL=https://your-deployment.convex.site

# Push Notifications - Frontend (optional)
# Generate VAPID keys: npx web-push generate-vapid-keys
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 5. Configure Convex Environment Variables

Set these in your [Convex Dashboard](https://dashboard.convex.dev) or via CLI:

```bash
# Better Auth Configuration (required)
npx convex env set BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
npx convex env set SITE_URL="http://localhost:3000"

# Super Admin Setup (optional)
npx convex env set SUPER_ADMIN_EMAIL="admin@example.com"

# Email Configuration (optional - for sending invites)
npx convex env set RESEND_API_KEY="re_xxx"

# Push Notifications (optional)
npx convex env set VAPID_PUBLIC_KEY="xxx"
npx convex env set VAPID_PRIVATE_KEY="xxx"
```

### 6. Run the Development Server

```bash
# Start both Convex dev server and Vite frontend
npm run dev
```

Your app will be available at `http://localhost:3000` (or similar).

### 7. Access the App

- Open your browser to the local URL shown in the terminal
- The first user to sign up with `SUPER_ADMIN_EMAIL` will automatically become a Super Admin
- Other users can be invited via the admin dashboard

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both Convex and Vite dev servers |
| `npm run dev:web` | Start Vite dev server only |
| `npm run dev:convex` | Start Convex dev server only |
| `npm run dev:ts` | Type checking in watch mode |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run format` | Format code with Prettier |
| `npm run lint` | Run ESLint |

## 📁 Project Structure

```
├── convex/              # Convex backend functions and schema
│   ├── schema.ts        # Database schema
│   ├── auth.ts          # Authentication configuration
│   ├── messages.ts      # Message CRUD and scheduling
│   ├── events.ts        # Event management
│   ├── groups.ts        # Group management
│   └── ...
├── src/
│   ├── components/ui/   # shadcn/ui components
│   ├── routes/          # TanStack Start file-based routes
│   ├── lib/             # Utilities and auth clients
│   └── styles/          # Tailwind CSS
├── public/              # Static assets (PWA manifest, service worker)
└── docs/                # Additional documentation
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy!

The included `vercel.json` handles the Convex deployment during the build:

```json
{
  "buildCommand": "npx convex deploy --cmd 'npm run build'"
}
```

### Production Environment Setup

1. Create a Convex production deployment:
   ```bash
   npx convex deploy
   ```

2. Set production environment variables in Convex dashboard:
   - `SITE_URL` — Your production domain
   - `BETTER_AUTH_SECRET` — Generate a new secret
   - `RESEND_API_KEY` — For production email sending
   - `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — For push notifications

## 📖 Documentation

- [Full Specification](./docs/org-comms-pwa-spec.md) — Complete project specification
- [Better Auth + Convex Notes](./docs/Better%20auth%20convex.md) — Auth integration details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📄 License

[MIT License](./LICENSE)

---

Built with ❤️ using [TanStack](https://tanstack.com), [Convex](https://convex.dev), and [Better Auth](https://www.better-auth.com/).
