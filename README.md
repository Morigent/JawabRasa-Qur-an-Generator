# JawabRasa — Qur'an Reflection Generator

> **"Verily, in the remembrance of Allah do hearts find rest."** — Ar-Ra'd 13:28

JawabRasa is a spiritual web application that delivers personalised Qur'anic verse reflections based on a user's current mood. Users can journal their emotional state, receive AI-generated verse insights powered by Google Gemini, connect with Islamic consultants, and build a personal archive of their reflections.

---

## ? Features

| Area | Description |
|---|---|
| **Mood ? Verse** | Select your mood; the app surfaces a relevant Qur'anic verse with a Gemini-generated reflection |
| **Reflection Journal** | Save, browse, and revisit past reflections in a personal dashboard |
| **Inbox / Consultations** | Message-style inbox for connecting with verified Islamic consultants |
| **Consultant Portal** | Consultants apply, admins approve/reject via the Admin Suite |
| **Admin Suite** | Full administrative dashboard — consultant approvals, user management, audit log, image templates |
| **Subscription Tiers** | Free and paid plans gating access to deeper features |
| **Authentication** | Email/password + magic link via Supabase Auth |

---

## ??? Monorepo Structure

```
JawabRasa/
+-- packages/
¦   +-- app/          # React 19 + Vite frontend (main user-facing SPA)
¦   +-- api/          # Next.js 15 API server (Gemini, Supabase admin calls)
¦   +-- shared/       # Shared TypeScript types & Supabase client
+-- schema.sql                # Full Supabase database schema
+-- supabase_migration.sql    # Migration scripts
+-- dml_dummy_data.sql        # Seed data for development
+-- fix_rls_recursion.sql     # RLS policy fixes
```

### `packages/app` — Frontend SPA

Built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS v4**.

| Route | Page | Guard |
|---|---|---|
| `/` | Landing page with verse carousel | Public |
| `/login` | Email / magic-link sign-in | Public |
| `/signup` | Account registration | Public |
| `/forgot-password` | Password reset flow | Public |
| `/dashboard` | Mood picker, daily verse, reflections | Auth required |
| `/reflect` | Detailed reflection view | Auth required |
| `/inbox` | Consultation inbox | Auth required |
| `/subscription` | Plan selection & billing | Auth required |
| `/admin` | Administrative suite | Admin / Superadmin only |
| `/auth/callback` | Supabase OAuth callback | — |

### `packages/api` — Backend API (Next.js)

Runs on port **3001**. Exposes the following API routes:

| Endpoint | Purpose |
|---|---|
| `POST /api/generate` | Calls Google Gemini to generate a Qur'anic verse reflection |
| `GET /api/ayat` | Fetches verse data |
| `GET/POST /api/admin` | Admin-scoped operations (service-role key) |
| `POST /api/seed` | Development seeding utilities |

### `packages/shared` — Shared Library

- `supabase.ts` — initialises the Supabase JS client (used by both `app` and `api`)
- `types.ts` — shared TypeScript interfaces
- `index.ts` — barrel export

---

## ?? Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- A [Supabase](https://supabase.com) project
- A [Google Gemini](https://aistudio.google.com) API key

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Supabase — Settings ? API
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Google Gemini
GEMINI_API_KEY=<your-gemini-api-key>
```

### 3. Set up the database

Run the SQL files in your Supabase SQL editor in this order:

```
1. schema.sql              — tables, enums, indexes
2. supabase_migration.sql  — migrations & RLS policies
3. fix_rls_recursion.sql   — patches recursive RLS issues
4. dml_dummy_data.sql      — (optional) seed dev data
```

### 4. Run the development server

```bash
# Start the frontend (Vite dev server on port 5173)
pnpm dev

# Start the API server separately (Next.js on port 3001)
cd packages/api && pnpm dev
```

---

## ??? Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS v4 |
| Backend API | Next.js 15 (App Router) |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (email/password, magic link) |
| AI | Google Gemini (`@google/generative-ai`) |
| Package manager | pnpm workspaces |
| UI Icons | Google Material Symbols |

---

## ?? Roles & Permissions

| Role | Access |
|---|---|
| `user` | Dashboard, reflections, inbox, subscription |
| `admin` | All user access + Admin Suite |
| `superadmin` | Full admin access + user role management |

Admin access is verified server-side via a Supabase `SECURITY DEFINER` RPC (`is_admin()`) to avoid RLS recursion.

---

## ?? Key SQL Files

| File | Purpose |
|---|---|
| `schema.sql` | Full DDL — tables, enums, foreign keys, indexes |
| `supabase_migration.sql` | Incremental migrations and RLS policy setup |
| `fix_rls_recursion.sql` | Fixes infinite recursion in user-role RLS policies |
| `dml_dummy_data.sql` | Dummy consultant, user, and reflection data |
| `seed_dummy_data.sql` | Extended seed dataset |
| `seed_mood_tags.sql` | Mood tag reference data |

---

## ?? License

Private repository — all rights reserved.
