create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  entity_label text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_logs_entity_idx on public.admin_audit_logs (entity_type, entity_id);
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_actor_idx on public.admin_audit_logs (actor_email);

alter table public.admin_audit_logs enable row level security;

grant select, insert on table public.admin_audit_logs to authenticated, service_role;

drop policy if exists "admin users can read audit logs" on public.admin_audit_logs;
create policy "admin users can read audit logs"
  on public.admin_audit_logs for select
  to authenticated
  using (public.is_morrow_admin());

drop policy if exists "admin users can insert audit logs" on public.admin_audit_logs;
create policy "admin users can insert audit logs"
  on public.admin_audit_logs for insert
  to authenticated
  with check (public.is_morrow_admin());

notify pgrst, 'reload schema';
