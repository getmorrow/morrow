alter table public.experience_blocks
  add column if not exists guest_note text,
  add column if not exists price_note text,
  add column if not exists capacity_note text,
  add column if not exists availability_note text,
  add column if not exists quality_score integer,
  add column if not exists quality_note text;

update public.experience_blocks
set
  guest_note = coalesce(
    guest_note,
    nullif(coalesce(payload->>'guestNote', payload->>'guestNotes', payload->>'description'), '')
  ),
  price_note = coalesce(
    price_note,
    nullif(coalesce(payload->>'priceNote', payload->>'price', payload->>'cost'), '')
  ),
  capacity_note = coalesce(
    capacity_note,
    nullif(coalesce(payload->>'capacityNote', payload->>'capacity'), '')
  ),
  availability_note = coalesce(
    availability_note,
    nullif(coalesce(payload->>'availabilityNote', payload->>'availability'), '')
  ),
  quality_score = coalesce(
    quality_score,
    case
      when coalesce(payload->>'qualityScore', payload->>'quality_score') ~ '^[0-9]+$'
        then coalesce(payload->>'qualityScore', payload->>'quality_score')::integer
      else null
    end
  ),
  quality_note = coalesce(
    quality_note,
    nullif(coalesce(payload->>'qualityNote', payload->>'quality_note'), '')
  )
where payload is not null;

create index if not exists experience_blocks_package_idx
  on public.experience_blocks (package_id);

create index if not exists experience_blocks_provider_idx
  on public.experience_blocks (provider_id);

notify pgrst, 'reload schema';
