# Deploy HipStaff PM

One-click deploy to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjcyrus%2Fhipstaff-pm&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&envDescription=Supabase%20credentials%20required&envLink=https%3A%2F%2Fsupabase.com%2Fdocs&project-name=hipstaff-pm&repository-name=hipstaff-pm)

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Create a new Supabase project**

## Setup Steps

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration

### 2. Get Your Credentials

From your Supabase project dashboard:

1. Go to **Project Settings** > **API**
2. Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy the **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Deploy to Vercel

Click the **Deploy with Vercel** button above and enter your Supabase credentials when prompted.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key |

## Local Development

```bash
# Clone the repository
git clone https://github.com/jcyrus/hipstaff-pm.git
cd hipstaff-pm

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.
