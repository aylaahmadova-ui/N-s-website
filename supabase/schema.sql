-- Kindora schema: Next.js + Supabase MVP
-- Run in Supabase SQL editor (or via supabase db push).

create extension if not exists "pgcrypto";

-- Enums
create type public.app_role as enum ('admin', 'organization', 'supporter');
create type public.approval_status as enum ('pending', 'approved', 'rejected');
create type public.publish_status as enum ('draft', 'pending', 'approved', 'rejected', 'published');
create type public.member_role as enum ('owner', 'manager', 'staff');
create type public.donation_target as enum ('campaign', 'project');

-- Common updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.app_role not null default 'supporter',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

-- Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  display_name text not null,
  description text not null,
  website text,
  contact_email text not null,
  status public.approval_status not null default 'pending',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_organizations_updated_at
before update on public.organizations
for each row execute procedure public.handle_updated_at();

-- Organization members
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- Child profiles (anonymized only)
create table if not exists public.child_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  alias_name text not null,
  age_range text not null,
  talents text not null,
  story_summary text not null,
  photo_url text,
  status public.publish_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_child_profiles_updated_at
before update on public.child_profiles
for each row execute procedure public.handle_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  summary text not null,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  stripe_price_id text,
  status public.publish_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_products_updated_at
before update on public.products
for each row execute procedure public.handle_updated_at();

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  summary text not null,
  amount_needed numeric(12,2) not null check (amount_needed >= 0),
  amount_raised numeric(12,2) not null default 0 check (amount_raised >= 0),
  stripe_product_id text,
  status public.publish_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_campaigns_updated_at
before update on public.campaigns
for each row execute procedure public.handle_updated_at();

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  summary text not null,
  amount_needed numeric(12,2) not null check (amount_needed >= 0),
  amount_raised numeric(12,2) not null default 0 check (amount_raised >= 0),
  stripe_product_id text,
  status public.publish_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_projects_updated_at
before update on public.projects
for each row execute procedure public.handle_updated_at();

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  details text not null,
  related_campaign_id uuid references public.campaigns(id) on delete set null,
  related_project_id uuid references public.projects(id) on delete set null,
  status public.publish_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_updates_updated_at
before update on public.updates
for each row execute procedure public.handle_updated_at();

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.donation_target not null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric(12,2) not null check (amount > 0),
  stripe_payment_intent_id text,
  status text not null default 'succeeded',
  created_at timestamptz not null default now(),
  check (
    (target_type = 'campaign' and campaign_id is not null and project_id is null)
    or
    (target_type = 'project' and project_id is not null and campaign_id is null)
  )
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid not null references public.profiles(id) on delete cascade,
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  stripe_checkout_session_id text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id uuid not null,
  action text not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Helper functions for RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.organization_members m
    where m.organization_id = org_id and m.user_id = auth.uid()
  );
$$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.child_profiles enable row level security;
alter table public.products enable row level security;
alter table public.campaigns enable row level security;
alter table public.projects enable row level security;
alter table public.updates enable row level security;
alter table public.donations enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.moderation_logs enable row level security;

-- Profiles
create policy "profiles_select_self_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_insert_self"
on public.profiles for insert
with check (id = auth.uid());

create policy "profiles_update_self_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Organizations
create policy "organizations_select_public_or_member_or_admin"
on public.organizations for select
using (
  status = 'approved'
  or public.is_org_member(id)
  or public.is_admin()
);

create policy "organizations_insert_member_or_admin"
on public.organizations for insert
with check (auth.uid() is not null);

create policy "organizations_update_member_or_admin"
on public.organizations for update
using (public.is_org_member(id) or public.is_admin())
with check (public.is_org_member(id) or public.is_admin());

-- Organization members
create policy "organization_members_select_self_or_admin"
on public.organization_members for select
using (user_id = auth.uid() or public.is_admin());

create policy "organization_members_insert_owner_or_admin"
on public.organization_members for insert
with check (
  user_id = auth.uid()
  or public.is_admin()
  or public.is_org_member(organization_id)
);

-- Child profiles
create policy "child_profiles_select_published_or_member_or_admin"
on public.child_profiles for select
using (
  status = 'published'
  or public.is_org_member(organization_id)
  or public.is_admin()
);

create policy "child_profiles_insert_member_or_admin"
on public.child_profiles for insert
with check (public.is_org_member(organization_id) or public.is_admin());

create policy "child_profiles_update_member_or_admin"
on public.child_profiles for update
using (public.is_org_member(organization_id) or public.is_admin())
with check (public.is_org_member(organization_id) or public.is_admin());

-- Shared policies for moderated content
create policy "products_select_published_or_member_or_admin"
on public.products for select
using (status = 'published' or public.is_org_member(organization_id) or public.is_admin());

create policy "products_insert_member_or_admin"
on public.products for insert
with check (public.is_org_member(organization_id) or public.is_admin());

create policy "products_update_member_or_admin"
on public.products for update
using (public.is_org_member(organization_id) or public.is_admin())
with check (public.is_org_member(organization_id) or public.is_admin());

create policy "campaigns_select_published_or_member_or_admin"
on public.campaigns for select
using (status = 'published' or public.is_org_member(organization_id) or public.is_admin());

create policy "campaigns_insert_member_or_admin"
on public.campaigns for insert
with check (public.is_org_member(organization_id) or public.is_admin());

create policy "campaigns_update_member_or_admin"
on public.campaigns for update
using (public.is_org_member(organization_id) or public.is_admin())
with check (public.is_org_member(organization_id) or public.is_admin());

create policy "projects_select_published_or_member_or_admin"
on public.projects for select
using (status = 'published' or public.is_org_member(organization_id) or public.is_admin());

create policy "projects_insert_member_or_admin"
on public.projects for insert
with check (public.is_org_member(organization_id) or public.is_admin());

create policy "projects_update_member_or_admin"
on public.projects for update
using (public.is_org_member(organization_id) or public.is_admin())
with check (public.is_org_member(organization_id) or public.is_admin());

create policy "updates_select_published_or_member_or_admin"
on public.updates for select
using (status = 'published' or public.is_org_member(organization_id) or public.is_admin());

create policy "updates_insert_member_or_admin"
on public.updates for insert
with check (public.is_org_member(organization_id) or public.is_admin());

create policy "updates_update_member_or_admin"
on public.updates for update
using (public.is_org_member(organization_id) or public.is_admin())
with check (public.is_org_member(organization_id) or public.is_admin());

-- Donations and orders
create policy "donations_select_self_or_admin"
on public.donations for select
using (supporter_id = auth.uid() or public.is_admin());

create policy "donations_insert_supporter"
on public.donations for insert
with check (supporter_id = auth.uid() or public.is_admin());

create policy "orders_select_self_or_admin"
on public.orders for select
using (supporter_id = auth.uid() or public.is_admin());

create policy "orders_insert_supporter"
on public.orders for insert
with check (supporter_id = auth.uid() or public.is_admin());

create policy "order_items_select_related_order_owner_or_admin"
on public.order_items for select
using (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (o.supporter_id = auth.uid() or public.is_admin())
  )
);

create policy "order_items_insert_related_order_owner_or_admin"
on public.order_items for insert
with check (
  exists (
    select 1 from public.orders o
    where o.id = order_id and (o.supporter_id = auth.uid() or public.is_admin())
  )
);

-- Moderation logs
create policy "moderation_logs_admin_only"
on public.moderation_logs for all
using (public.is_admin())
with check (public.is_admin());

-- Useful indexes
create index if not exists idx_org_members_user on public.organization_members(user_id);
create index if not exists idx_child_profiles_org on public.child_profiles(organization_id);
create index if not exists idx_products_org_status on public.products(organization_id, status);
create index if not exists idx_campaigns_org_status on public.campaigns(organization_id, status);
create index if not exists idx_projects_org_status on public.projects(organization_id, status);
create index if not exists idx_updates_org_status on public.updates(organization_id, status);
create index if not exists idx_orders_supporter on public.orders(supporter_id);
create index if not exists idx_donations_supporter on public.donations(supporter_id);
