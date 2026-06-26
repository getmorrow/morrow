alter table public.support_messages
  add column if not exists status text not null default 'open',
  add column if not exists urgency text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists support_messages_status_idx
  on public.support_messages (status);

create index if not exists support_messages_created_at_idx
  on public.support_messages (created_at desc);

notify pgrst, 'reload schema';
