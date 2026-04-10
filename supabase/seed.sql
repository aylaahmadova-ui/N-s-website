-- Kindora seed data
-- This script creates 3 users: admin, organization, supporter.
-- Password for all seeded users: Passw0rd!

-- Fixed IDs for predictable local development
do $$
begin
  -- auth.users
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  ) values
    (
      '00000000-0000-0000-0000-000000000000',
      '11111111-1111-1111-1111-111111111111',
      'authenticated',
      'authenticated',
      'admin@kindora.org',
      crypt('Passw0rd!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Kindora Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      '22222222-2222-2222-2222-222222222222',
      'authenticated',
      'authenticated',
      'org@kindora.org',
      crypt('Passw0rd!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Hope Home Org"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      '33333333-3333-3333-3333-333333333333',
      'authenticated',
      'authenticated',
      'supporter@kindora.org',
      crypt('Passw0rd!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Mina Supporter"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
  on conflict (id) do nothing;

  -- auth.identities
  insert into auth.identities (
    id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  ) values
    (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111111',
      '11111111-1111-1111-1111-111111111111',
      '{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@kindora.org"}',
      'email',
      now(),
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      '22222222-2222-2222-2222-222222222222',
      '22222222-2222-2222-2222-222222222222',
      '{"sub":"22222222-2222-2222-2222-222222222222","email":"org@kindora.org"}',
      'email',
      now(),
      now(),
      now()
    ),
    (
      gen_random_uuid(),
      '33333333-3333-3333-3333-333333333333',
      '33333333-3333-3333-3333-333333333333',
      '{"sub":"33333333-3333-3333-3333-333333333333","email":"supporter@kindora.org"}',
      'email',
      now(),
      now(),
      now()
    )
  on conflict do nothing;
end $$;

insert into public.profiles (id, full_name, role)
values
  ('11111111-1111-1111-1111-111111111111', 'Kindora Admin', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'Hope Home Org', 'organization'),
  ('33333333-3333-3333-3333-333333333333', 'Mina Supporter', 'supporter')
on conflict (id) do update set
  full_name = excluded.full_name,
  role = excluded.role;

insert into public.organizations (
  id, legal_name, display_name, description, website, contact_email, status, created_by
) values
  (
    '44444444-4444-4444-4444-444444444444',
    'Hope Home Foundation',
    'Hope Home',
    'Provides supervised creative workshops and education support for children in foster care.',
    'https://example.org/hope-home',
    'contact@hopehome.org',
    'approved',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Sunrise Youth Center',
    'Sunrise Center',
    'Pending verification organization example.',
    'https://example.org/sunrise',
    'team@sunrise.org',
    'pending',
    '22222222-2222-2222-2222-222222222222'
  )
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role)
values
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'owner')
on conflict (organization_id, user_id) do nothing;

insert into public.child_profiles (
  id, organization_id, alias_name, age_range, talents, story_summary, status
) values
  (
    '66666666-6666-6666-6666-666666666666',
    '44444444-4444-4444-4444-444444444444',
    'Aria',
    '10-12',
    'Painting, beadwork',
    'Aria enjoys creating handmade bead bracelets during supervised art sessions.',
    'published'
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '44444444-4444-4444-4444-444444444444',
    'Noah',
    '13-15',
    'Woodcraft, sketching',
    'Noah is part of a mentoring group focused on practical craft skills and teamwork.',
    'published'
  )
on conflict (id) do nothing;

insert into public.products (id, organization_id, title, summary, price, status)
values
  (
    '88888888-8888-8888-8888-888888888888',
    '44444444-4444-4444-4444-444444444444',
    'Handwoven Friendship Bracelets',
    'Set of 3 bracelets made in supervised workshops.',
    18.00,
    'published'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    '44444444-4444-4444-4444-444444444444',
    'Painted Greeting Cards',
    'Five eco paper cards with child-created designs.',
    12.50,
    'pending'
  )
on conflict (id) do nothing;

insert into public.campaigns (
  id, organization_id, title, summary, amount_needed, amount_raised, status
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '44444444-4444-4444-4444-444444444444',
    'Winter School Kits',
    'Fund notebooks, warm clothing, and school bags for 40 children.',
    3000.00,
    1250.00,
    'published'
  )
on conflict (id) do nothing;

insert into public.projects (
  id, organization_id, title, summary, amount_needed, amount_raised, status
) values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '44444444-4444-4444-4444-444444444444',
    'Community Craft Studio',
    'A child-safe studio for supervised design, crafting, and life-skills workshops.',
    10000.00,
    2200.00,
    'published'
  )
on conflict (id) do nothing;

insert into public.updates (
  id, organization_id, title, details, related_campaign_id, status
) values
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '44444444-4444-4444-4444-444444444444',
    'First 20 school kits delivered',
    'We completed and distributed the first batch of school kits through supervised partner homes.',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'published'
  )
on conflict (id) do nothing;

insert into public.donations (
  supporter_id, target_type, campaign_id, amount, status
) values
  (
    '33333333-3333-3333-3333-333333333333',
    'campaign',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    100.00,
    'succeeded'
  )
on conflict do nothing;

insert into public.orders (
  id, supporter_id, total_amount, status
) values
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '33333333-3333-3333-3333-333333333333',
    18.00,
    'paid'
  )
on conflict (id) do nothing;

insert into public.order_items (
  order_id, product_id, quantity, unit_price
) values
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '88888888-8888-8888-8888-888888888888',
    1,
    18.00
  )
on conflict do nothing;

insert into public.moderation_logs (
  actor_id, target_type, target_id, action, notes
) values
  (
    '11111111-1111-1111-1111-111111111111',
    'organization',
    '44444444-4444-4444-4444-444444444444',
    'approved',
    'Seed: approved initial organization'
  )
on conflict do nothing;
