# Destekly MVP

Destekly is a supervised support platform for foster homes and NGOs to safely:

- create anonymized child profiles (no sensitive data)
- sell handmade products made by children
- run verified donation campaigns for real needs
- publish project funding ideas
- post impact updates after support is received

This MVP uses:

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth, Postgres, RLS)
- React Hook Form + Zod
- Stripe placeholders for checkout/donations

## Roles and Safety Rules

- `admin`: approves organizations and moderates content
- `organization`: creates and manages child-related content
- `supporter`: browses public content and supports financially

Safety constraints implemented:

- children cannot sign up directly
- only organizations manage child-related content
- organization approval required for trusted publishing flow
- no direct child-public messaging feature
- status + moderation model (`pending`, `approved`, `rejected`, `published`)

## Quick Start

1. Install deps:

```bash
npm install
```

2. Configure env:

```bash
cp .env.example .env.local
```

3. Create Supabase schema + seed data:

- Open Supabase SQL editor
- Run [`supabase/schema.sql`](supabase/schema.sql)
- Run [`supabase/seed.sql`](supabase/seed.sql)

Seed login accounts:

- admin: `admin@destekly.org` / `Passw0rd!`
- organization: `org@destekly.org` / `Passw0rd!`
- supporter: `supporter@destekly.org` / `Passw0rd!`

4. Run locally:

```bash
npm run dev
```

## Folder Structure

```text
src/
  app/
    api/
      auth/login
      auth/signup
      organizations/apply
      dashboard/{children,products,campaigns,projects,updates}
      admin/organizations/[id]/status
      admin/moderation
    admin/
    apply/
    auth/{login,signup}
    campaigns/
    dashboard/{children,products,campaigns,projects,updates}
    marketplace/
    projects/
    updates/
  components/
    admin/
    forms/
    layout/
    ui/
  lib/
    api.ts
    auth.ts
    dashboard.ts
    stripe.ts
    supabase/{client,server,middleware}.ts
    validation.ts
supabase/
  schema.sql
  seed.sql
```

## Main Database Tables

- `profiles`
- `organizations`
- `organization_members`
- `child_profiles`
- `products`
- `campaigns`
- `projects`
- `updates`
- `donations`
- `orders`
- `order_items`
- `moderation_logs`

## Route Protection and Role Checks

- `middleware.ts` refreshes auth session and protects `dashboard`, `admin`, `apply`
- dashboard pages require `organization` role
- admin pages require `admin` role
- server-side helpers:
  - `requireAuth`
  - `requireRole`
  - `getOrganizationContext`

## Publishing and Moderation Flow

1. Organization submits content (`pending`)
2. Admin reviews in dashboard and updates status
3. Public pages query only `published` rows
4. Actions are recorded in `moderation_logs`

## Stripe Placeholder Integration Points

Public pages include placeholder CTA buttons:

- marketplace: “Stripe Checkout (placeholder)”
- campaigns/projects: “Donate/Fund via Stripe (placeholder)”

Use `src/lib/stripe.ts` to wire real keys/flows later.

## Accessibility and Responsiveness

- semantic headings and labels
- forms with visible labels and error states
- responsive layout for mobile and desktop
- color palette optimized for calm, trustworthy contrast
