# Deploy HipStaff PM

## Prerequisites

- A PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), Railway, etc.)
- A hosting platform (Vercel recommended)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL of your deployment (e.g. `https://your-app.vercel.app`) |
| `NEXT_PUBLIC_APP_URL` | Same as `NEXTAUTH_URL` (used in invite links) |

## Database Setup

Run the Prisma migrations to create all tables:

```bash
pnpm prisma migrate deploy
```

This applies all migrations from `prisma/migrations/` to your database. It's safe to run on every deploy.

## Deploy to Vercel

1. Push the repository to GitHub.
2. Create a new Vercel project and link it to the repo.
3. Add environment variables in **Settings > Environment Variables**:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — your Vercel deployment URL (e.g. `https://hipstaff-pm.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` — same as `NEXTAUTH_URL`
4. Add a build command override if needed:
   ```bash
   pnpm prisma migrate deploy && pnpm build
   ```
5. Deploy.

## Local Development

```bash
# Clone the repository
git clone https://github.com/jcyrus/hipstaff-pm.git
cd hipstaff-pm

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local — set DATABASE_URL and NEXTAUTH_SECRET

# Apply schema to local database
pnpm prisma migrate dev

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Creating the First Admin User

After running migrations, seed an initial superadmin user:

```bash
pnpm prisma studio
```

Or use a direct INSERT with a bcrypt-hashed password (12 rounds):

```sql
INSERT INTO users (id, email, username, password, role, is_active)
VALUES (gen_random_uuid(), 'admin@example.com', 'admin', '<bcrypt-hash>', 'SuperAdmin', true);
```

