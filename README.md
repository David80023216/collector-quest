# Collector Quest

A mobile-first collector rewards app for sports card collectors. Earn entries, complete missions, open digital reward packs, build streaks, contribute to community progress, and help unlock bigger prizes.

## Features

- **Daily Rewards** — Claim daily bonuses and build your streak
- **Missions** — Complete daily and weekly missions for entries, points, and packs
- **Digital Reward Packs** — Open packs with weighted random rewards
- **Community Progress** — Collective engagement unlocks milestone rewards
- **Auto-Scaling Grand Prize** — Prize pool grows as Pro membership grows
- **Points Store** — Redeem points for bonus entries, packs, and more
- **Trivia & Polls** — Sports card trivia and community polls
- **Badges & Leaderboards** — Track achievements and compete
- **Sweepstakes-Compliant** — Free entry path, official rules, legal pages

## Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth.js (email/password)
- **Payments:** Stripe (subscription-ready)
- **Validation:** Zod

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- (Optional) Stripe account for subscriptions

### Setup

```bash
# Clone the repo
git clone https://github.com/David80023216/collector-quest.git
cd collector-quest

# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database (180 missions, 30+ trivia, 20+ polls, store items, badges, etc.)
npx prisma db seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for session encryption |
| `NEXTAUTH_URL` | Your app URL (http://localhost:3000 for dev) |
| `STRIPE_SECRET_KEY` | Stripe secret key (optional for dev) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (optional for dev) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret (optional for dev) |
| `STRIPE_PRO_PRICE_ID` | Stripe Price ID for Pro plan |

### Creating an Admin User

After seeding, register a new account through the app, then promote it to admin:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, password reset
│   ├── (main)/          # Dashboard, missions, rewards, store, etc.
│   ├── admin/           # Admin dashboard and management
│   ├── api/             # API routes (30+ endpoints)
│   └── ...              # Landing, pricing, legal pages
├── components/          # Reusable UI components
├── lib/                 # Business logic (economy, missions, packs, etc.)
└── types/               # TypeScript type definitions
prisma/
├── schema.prisma        # Database schema (30+ models)
├── seed.ts              # Main seed entry point
└── seed/                # Seed data modules
```

## Business Model

- **Free Plan** — Daily rewards, basic missions, community participation, free entry path
- **Pro Plan ($10/mo)** — More missions, more packs, better tracking, premium features
- **Grand Prize** — Auto-scales from $100 to $2,500 based on Pro subscriber count

## Legal Compliance

- Structured as a sweepstakes (not gambling)
- "No purchase necessary to enter or win"
- Free entry submission form
- Official rules, terms of service, privacy policy included
- Membership provides app access and convenience, not direct entry purchase

## License

Private — All rights reserved.
