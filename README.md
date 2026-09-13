# MemoryOS Web

Frontend web application for MemoryOS - marketing site, authentication, dashboard, and settings.

## Features

- Landing page with product overview
- Authentication (Google, GitHub, Email via NextAuth)
- Dashboard with memory timeline
- Settings for database connection and AI configuration
- MCP configuration generator
- Billing integration (Stripe)

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth.js
- Stripe

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Configure `.env.local`:

```env
AUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

DATABASE_URL=postgresql://user:password@localhost:5432/memoryos_auth

NEXT_PUBLIC_API_URL=http://localhost:3001

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
```

4. Run the development server:

```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── (auth)/         # Authentication pages
│   └── login/
├── (dashboard)/    # Protected dashboard pages
│   ├── dashboard/
│   └── settings/
├── api/            # API routes
│   └── auth/
├── pricing/        # Pricing page
└── page.tsx        # Landing page
```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your publishable and secret keys
3. Set up webhook endpoint: `http://localhost:3000/api/webhooks/stripe`
4. Configure products and prices in Stripe Dashboard

## Development

```bash
# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

## License

MIT
# memory-web
