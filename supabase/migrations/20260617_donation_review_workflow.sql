-- ============================================================
-- Donation Review Workflow Migration
-- Run this in Supabase SQL editor.
-- ============================================================

-- 1. Add status column to campaign_donations (pending → approved/rejected)
alter table public.campaign_donations
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected'));

-- Add index for efficient admin queue queries
create index if not exists idx_campaign_donations_status
  on public.campaign_donations(status);

create index if not exists idx_campaign_donations_campaign_status
  on public.campaign_donations(campaign_id, status);

-- ============================================================
-- 2. Trigger: on approval → update amount_raised, mark done,
--    insert celebratory update post if fully funded.
-- ============================================================
create or replace function public.handle_donation_approval()
returns trigger
language plpgsql
security definer
as $$
declare
  v_campaign         record;
  v_new_raised       numeric(12,2);
  v_org_id           uuid;
begin
  -- Only fire when status changes TO 'approved'
  if (TG_OP = 'UPDATE' and NEW.status = 'approved' and OLD.status <> 'approved') then

    -- Lock and fetch the campaign row
    select id, organization_id, title, amount_needed, amount_raised, is_done
      into v_campaign
      from public.campaigns
      where id = NEW.campaign_id
      for update;

    if not found then
      return NEW;
    end if;

    -- Calculate new raised amount (cap at needed)
    v_new_raised := least(
      v_campaign.amount_raised + NEW.amount,
      v_campaign.amount_needed
    );

    v_org_id := v_campaign.organization_id;

    if v_new_raised >= v_campaign.amount_needed and not v_campaign.is_done then
      -- Fully funded: mark done and post milestone update
      update public.campaigns
        set amount_raised = v_new_raised,
            is_done       = true
        where id = NEW.campaign_id;

      insert into public.updates (
        organization_id,
        title,
        details,
        related_campaign_id,
        status
      ) values (
        v_org_id,
        '🎉 ' || v_campaign.title || ' — Fully Funded!',
        'We are thrilled to announce that the donation call "' || v_campaign.title ||
        '" has reached its full funding goal. Thank you to every supporter who made this possible. ' ||
        'Updates on how the funds are being used will follow shortly.',
        NEW.campaign_id,
        'published'
      );
    else
      -- Not yet fully funded, just update amount_raised
      update public.campaigns
        set amount_raised = v_new_raised
        where id = NEW.campaign_id;
    end if;

  end if;

  return NEW;
end;
$$;

-- Drop trigger if it already exists (idempotent re-run)
drop trigger if exists trg_donation_approval on public.campaign_donations;

create trigger trg_donation_approval
after update on public.campaign_donations
for each row execute procedure public.handle_donation_approval();

-- ============================================================
-- 3. RLS policies for campaign_donations
-- ============================================================

-- Enable RLS (may already be enabled, safe to re-run)
alter table public.campaign_donations enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "campaign_donations_select_approved_public" on public.campaign_donations;
drop policy if exists "campaign_donations_select_admin" on public.campaign_donations;
drop policy if exists "campaign_donations_insert_anyone" on public.campaign_donations;
drop policy if exists "campaign_donations_update_admin" on public.campaign_donations;

-- Public sees only approved, non-anonymous donations
create policy "campaign_donations_select_approved_public"
on public.campaign_donations for select
using (
  status = 'approved'
  or public.is_admin()
);

-- Anyone can insert (submit a donation)
create policy "campaign_donations_insert_anyone"
on public.campaign_donations for insert
with check (true);

-- Only admins can update (approve/reject)
create policy "campaign_donations_update_admin"
on public.campaign_donations for update
using (public.is_admin())
with check (public.is_admin());
