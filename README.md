# Box Hub

Official web interface for the **Box** ecosystem. Package registry, user dashboard and administration.

---

## Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL via Neon + Prisma ORM
- **Auth**: Auth.js (GitHub OAuth, Google OAuth, OTP email)
- **Storage**: Cloudflare R2
- **Payments**: Paystack
- **Emails**: Resend

---

## Running locally

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in .env with your keys

# 3. Apply database schema
npx prisma db push

# 4. Start the development server
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

---

## Environment variables

All required variables are documented in [`.env.example`](.env.example).

---

## Links

- Box CLI: [github.com/tanguykonan/box](https://github.com/tanguykonan/box)
- Android Runner: [github.com/tanguykonan/box-runner](https://github.com/tanguykonan/box-runner)
