create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('guest', 'owner', 'experience')),
  status text not null default 'Neu',
  name text,
  email text,
  phone text,
  package_slug text,
  source text,
  campaign text,
  payload jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_type_idx on public.leads (type);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_package_slug_idx on public.leads (package_slug);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  primary_lead_id uuid references public.leads(id) on delete set null,
  name text not null,
  email text,
  phone text,
  customer_type text not null default 'guest',
  notes text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.properties (
  id text primary key,
  name text not null,
  location text not null,
  sleeps integer,
  bedrooms integer,
  bathrooms integer,
  check_in_type text,
  support_type text,
  support_name text,
  image_rights_confirmed boolean not null default false,
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packages (
  id text primary key,
  slug text not null unique,
  name text not null,
  audience text not null check (audience in ('families', 'couples')),
  location text not null,
  status text not null default 'draft',
  property_id text references public.properties(id) on delete set null,
  price_from text,
  concrete_price text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.package_dates (
  id uuid primary key default gen_random_uuid(),
  package_id text not null references public.packages(id) on delete cascade,
  label text not null,
  starts_on date,
  ends_on date,
  capacity integer,
  status text not null default 'available',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  package_id text references public.packages(id) on delete set null,
  package_date_id uuid references public.package_dates(id) on delete set null,
  status text not null default 'Reserviert',
  payment_status text not null default 'offen',
  guest_access_code text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience_providers (
  id text primary key,
  name text not null,
  location text,
  category text,
  status text not null default 'lead',
  website text,
  email text,
  phone text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience_blocks (
  id text primary key,
  package_id text references public.packages(id) on delete cascade,
  provider_id text references public.experience_providers(id) on delete set null,
  title text not null,
  role text not null default 'planned',
  included_in_price boolean not null default false,
  confirmation_status text not null default 'planned',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.local_places (
  id text primary key,
  name text not null,
  category text not null,
  status text not null default 'candidate',
  lat double precision,
  lng double precision,
  address text,
  website text,
  reservation_url text,
  menu_url text,
  rating numeric(2, 1),
  opening_hours jsonb,
  package_fit text[] not null default '{}',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_tasks (
  id text primary key,
  title text not null,
  reference_type text not null,
  reference_id text not null,
  reference_label text,
  due_at date,
  status text not null default 'open',
  priority text not null default 'medium',
  note text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id text primary key,
  lead_id uuid references public.leads(id) on delete set null,
  category text not null default 'general',
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;
alter table public.customers enable row level security;
alter table public.properties enable row level security;
alter table public.packages enable row level security;
alter table public.package_dates enable row level security;
alter table public.bookings enable row level security;
alter table public.experience_providers enable row level security;
alter table public.experience_blocks enable row level security;
alter table public.local_places enable row level security;
alter table public.admin_tasks enable row level security;
alter table public.support_messages enable row level security;

create policy "public can insert phase1 leads"
  on public.leads for insert
  to anon
  with check (true);

create policy "public can insert support messages"
  on public.support_messages for insert
  to anon
  with check (true);

create policy "authenticated morrow team can manage leads"
  on public.leads for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage customers"
  on public.customers for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage properties"
  on public.properties for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage packages"
  on public.packages for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage package dates"
  on public.package_dates for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage bookings"
  on public.bookings for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage experience providers"
  on public.experience_providers for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage experience blocks"
  on public.experience_blocks for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage local places"
  on public.local_places for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage tasks"
  on public.admin_tasks for all
  to authenticated
  using (true)
  with check (true);

create policy "authenticated morrow team can manage support messages"
  on public.support_messages for all
  to authenticated
  using (true)
  with check (true);

