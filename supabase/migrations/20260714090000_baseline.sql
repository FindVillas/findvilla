create extension if not exists btree_gist;
create extension if not exists citext;

create type public.user_role as enum ('guest', 'partner', 'staff');
create type public.partner_status as enum ('pending', 'approved', 'declined', 'suspended');
create type public.listing_status as enum ('draft', 'submitted', 'changes_requested', 'approved', 'published', 'suspended');
create type public.request_status as enum ('submitted', 'approved_payment_pending', 'declined', 'expired', 'confirmed', 'cancelled');
create type public.reservation_status as enum ('hold', 'confirmed', 'expired', 'cancelled');
create type public.payment_status as enum ('created', 'pending', 'successful', 'failed', 'expired', 'refunded');
create type public.booking_status as enum ('confirmed', 'cancelled', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  display_name text,
  avatar_url text,
  locale text not null default 'en' check (locale in ('en', 'th')),
  role public.user_role not null default 'guest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.partner_organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status public.partner_status not null default 'pending',
  commission_bps integer not null default 1500 check (commission_bps between 0 and 10000),
  application jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.partner_memberships (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.partner_organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  permission text not null default 'member' check (permission in ('owner', 'manager', 'member')),
  created_at timestamptz not null default now(),
  unique (partner_id, user_id)
);

create table public.role_grants (
  email citext primary key,
  role public.user_role not null,
  partner_id uuid references public.partner_organizations(id) on delete cascade,
  permission text check (permission in ('owner', 'manager', 'member')),
  note text,
  created_at timestamptz not null default now(),
  check ((role = 'partner' and partner_id is not null) or (role <> 'partner' and partner_id is null))
);

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null,
  tagline jsonb not null,
  content jsonb not null default '{}'::jsonb,
  hero_image_url text,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.villas (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.partner_organizations(id),
  destination_id uuid not null references public.destinations(id),
  slug text not null unique,
  name text not null,
  status public.listing_status not null default 'draft',
  managed boolean not null default false,
  featured boolean not null default false,
  bedrooms integer not null check (bedrooms > 0),
  bathrooms integer not null check (bathrooms > 0),
  max_guests integer not null check (max_guests > 0),
  base_rate_thb integer not null check (base_rate_thb > 0),
  latitude double precision not null,
  longitude double precision not null,
  current_revision_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.villa_revisions (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas(id) on delete cascade,
  status public.listing_status not null default 'draft',
  content jsonb not null,
  submitted_by uuid references public.profiles(id),
  review_note text,
  created_at timestamptz not null default now()
);
alter table public.villas add constraint villas_current_revision_fk foreign key (current_revision_id) references public.villa_revisions(id);

create table public.villa_media (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas(id) on delete cascade,
  storage_path text,
  external_url text,
  alt_text jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  check ((storage_path is not null)::integer + (external_url is not null)::integer = 1)
);

create table public.seasonal_rates (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas(id) on delete cascade,
  name jsonb not null,
  period daterange not null,
  nightly_thb integer not null check (nightly_thb > 0),
  minimum_nights integer not null default 1 check (minimum_nights > 0),
  exclude using gist (villa_id with =, period with &&)
);

create table public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null references public.villas(id) on delete cascade,
  period daterange not null,
  reason text not null default 'partner_block',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  villa_id uuid not null references public.villas(id),
  guest_id uuid not null references public.profiles(id),
  status public.request_status not null default 'submitted',
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests > 0),
  locale text not null default 'en' check (locale in ('en', 'th')),
  quote_snapshot jsonb not null,
  response_due_at timestamptz not null,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.booking_requests(id) on delete cascade,
  villa_id uuid not null references public.villas(id),
  stay daterange not null,
  status public.reservation_status not null default 'hold',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'hold' and expires_at is not null) or status <> 'hold')
);
alter table public.reservations add constraint no_overlapping_active_reservations
  exclude using gist (villa_id with =, stay with &&) where (status in ('hold', 'confirmed'));

create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.booking_requests(id),
  provider text not null default 'omise',
  provider_charge_id text unique,
  provider_source_id text,
  idempotency_key text not null unique,
  method text not null check (method in ('card', 'promptpay')),
  status public.payment_status not null default 'created',
  amount_thb integer not null check (amount_thb > 0),
  test_mode boolean not null default true,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  request_id uuid not null unique references public.booking_requests(id),
  payment_attempt_id uuid not null unique references public.payment_attempts(id),
  status public.booking_status not null default 'confirmed',
  test_mode boolean not null default true,
  confirmed_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  locale text not null check (locale in ('en', 'th')),
  payload jsonb not null,
  dedupe_key text not null unique,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  recipient citext not null,
  template text not null,
  locale text not null check (locale in ('en', 'th')),
  payload jsonb not null,
  dedupe_key text not null unique,
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create index villas_destination_idx on public.villas(destination_id, status);
create index villas_partner_idx on public.villas(partner_id);
create index booking_requests_guest_idx on public.booking_requests(guest_id, created_at desc);
create index booking_requests_villa_status_idx on public.booking_requests(villa_id, status);
create index reservations_villa_idx on public.reservations(villa_id);
create index payment_attempts_request_idx on public.payment_attempts(request_id, created_at desc);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
create index email_outbox_pending_idx on public.email_outbox(next_attempt_at) where delivered_at is null;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger destinations_touch before update on public.destinations for each row execute function public.touch_updated_at();
create trigger villas_touch before update on public.villas for each row execute function public.touch_updated_at();
create trigger booking_requests_touch before update on public.booking_requests for each row execute function public.touch_updated_at();
create trigger reservations_touch before update on public.reservations for each row execute function public.touch_updated_at();
create trigger payment_attempts_touch before update on public.payment_attempts for each row execute function public.touch_updated_at();

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'staff')
$$;
create or replace function public.is_partner_member(org_id uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.partner_memberships where partner_id = org_id and user_id = auth.uid())
$$;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
declare grant_row public.role_grants%rowtype;
begin
  select * into grant_row from public.role_grants where email = new.email;
  insert into public.profiles(id, email, display_name, avatar_url, role)
  values(new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.raw_user_meta_data->>'avatar_url', coalesce(grant_row.role, 'guest'));
  if grant_row.role = 'partner' then
    insert into public.partner_memberships(partner_id, user_id, permission)
    values(grant_row.partner_id, new.id, coalesce(grant_row.permission, 'member')) on conflict do nothing;
  end if;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.submit_booking_request(p_villa_id uuid, p_check_in date, p_check_out date, p_guests integer, p_locale text default 'en')
returns public.booking_requests language plpgsql security invoker set search_path = '' as $$
declare v public.villas%rowtype; nights integer; subtotal integer; service_fee integer; vat integer; result public.booking_requests;
begin
  if auth.uid() is null then raise exception 'authentication_required'; end if;
  select * into v from public.villas where id = p_villa_id and status = 'published';
  if not found then raise exception 'villa_not_found'; end if;
  nights := p_check_out - p_check_in;
  if nights < 1 then raise exception 'invalid_dates'; end if;
  if p_guests < 1 or p_guests > v.max_guests then raise exception 'invalid_guest_count'; end if;
  if exists(select 1 from public.availability_blocks where villa_id = v.id and period && daterange(p_check_in, p_check_out, '[)')) then raise exception 'dates_unavailable'; end if;
  select coalesce(sum(coalesce((select sr.nightly_thb from public.seasonal_rates sr where sr.villa_id = v.id and sr.period @> d::date limit 1), v.base_rate_thb)), 0)::integer
    into subtotal from generate_series(p_check_in, p_check_out - 1, interval '1 day') d;
  service_fee := round(subtotal * 0.08); vat := round((subtotal + service_fee) * 0.07);
  insert into public.booking_requests(reference, villa_id, guest_id, check_in, check_out, guests, locale, quote_snapshot, response_due_at)
  values('REQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), v.id, auth.uid(), p_check_in, p_check_out, p_guests,
    case when p_locale = 'th' then 'th' else 'en' end,
    jsonb_build_object('nights', nights, 'nightlySubtotal', subtotal, 'serviceFee', service_fee, 'tax', vat, 'total', subtotal + service_fee + vat, 'currency', 'THB'), now() + interval '24 hours')
  returning * into result;
  insert into public.audit_events(actor_id, action, entity_type, entity_id) values(auth.uid(), 'booking_request.submitted', 'booking_request', result.id::text);
  return result;
end $$;

create or replace function public.approve_booking_request(p_request_id uuid) returns public.booking_requests
language plpgsql security definer set search_path = '' as $$
declare req public.booking_requests%rowtype; v public.villas%rowtype;
begin
  select * into req from public.booking_requests where id = p_request_id for update;
  if not found or req.status <> 'submitted' then raise exception 'request_not_approvable'; end if;
  select * into v from public.villas where id = req.villa_id;
  if not (public.is_staff() or public.is_partner_member(v.partner_id)) then raise exception 'forbidden'; end if;
  if req.response_due_at <= now() then raise exception 'request_expired'; end if;
  insert into public.reservations(request_id, villa_id, stay, status, expires_at)
    values(req.id, req.villa_id, daterange(req.check_in, req.check_out, '[)'), 'hold', now() + interval '24 hours');
  update public.booking_requests set status = 'approved_payment_pending', responded_at = now() where id = req.id returning * into req;
  insert into public.notifications(user_id, type, locale, payload, dedupe_key)
    values(req.guest_id, 'booking_request.approved', req.locale, jsonb_build_object('requestId', req.id), 'request-approved:' || req.id) on conflict do nothing;
  insert into public.email_outbox(recipient, template, locale, payload, dedupe_key)
    select p.email, 'booking-approved', req.locale, jsonb_build_object('requestId', req.id), 'email-request-approved:' || req.id from public.profiles p where p.id = req.guest_id on conflict do nothing;
  insert into public.audit_events(actor_id, action, entity_type, entity_id) values(auth.uid(), 'booking_request.approved', 'booking_request', req.id::text);
  return req;
end $$;

create or replace function public.decline_booking_request(p_request_id uuid) returns public.booking_requests
language plpgsql security definer set search_path = '' as $$
declare req public.booking_requests%rowtype; v public.villas%rowtype;
begin
  select * into req from public.booking_requests where id = p_request_id for update;
  select * into v from public.villas where id = req.villa_id;
  if req.status <> 'submitted' or not (public.is_staff() or public.is_partner_member(v.partner_id)) then raise exception 'request_not_declinable'; end if;
  update public.booking_requests set status = 'declined', responded_at = now() where id = req.id returning * into req;
  insert into public.notifications(user_id, type, locale, payload, dedupe_key) values(req.guest_id, 'booking_request.declined', req.locale, jsonb_build_object('requestId', req.id), 'request-declined:' || req.id) on conflict do nothing;
  insert into public.email_outbox(recipient, template, locale, payload, dedupe_key)
    select p.email, 'booking-declined', req.locale, jsonb_build_object('requestId', req.id, 'reference', req.reference), 'email-request-declined:' || req.id from public.profiles p where p.id = req.guest_id on conflict do nothing;
  insert into public.audit_events(actor_id, action, entity_type, entity_id) values(auth.uid(), 'booking_request.declined', 'booking_request', req.id::text);
  return req;
end $$;

create or replace function public.confirm_test_payment(p_attempt_id uuid, p_provider_charge_id text, p_raw jsonb default '{}'::jsonb)
returns public.bookings language plpgsql security definer set search_path = '' as $$
declare attempt public.payment_attempts%rowtype; req public.booking_requests%rowtype; result public.bookings;
begin
  if coalesce(auth.role(), '') <> 'service_role' then raise exception 'service_role_required'; end if;
  select * into attempt from public.payment_attempts where id = p_attempt_id for update;
  if not found then raise exception 'payment_not_found'; end if;
  select * into req from public.booking_requests where id = attempt.request_id for update;
  if attempt.status = 'successful' then select * into result from public.bookings where payment_attempt_id = attempt.id; return result; end if;
  if req.status <> 'approved_payment_pending' or not exists(select 1 from public.reservations where request_id = req.id and status = 'hold' and expires_at > now()) then raise exception 'hold_not_payable'; end if;
  update public.payment_attempts set status = 'successful', provider_charge_id = p_provider_charge_id, raw = p_raw where id = attempt.id;
  update public.reservations set status = 'confirmed', expires_at = null where request_id = req.id;
  update public.booking_requests set status = 'confirmed' where id = req.id;
  insert into public.bookings(reference, request_id, payment_attempt_id, test_mode)
    values('BKG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)), req.id, attempt.id, attempt.test_mode) returning * into result;
  insert into public.notifications(user_id, type, locale, payload, dedupe_key) values(req.guest_id, 'booking.confirmed', req.locale, jsonb_build_object('bookingId', result.id), 'booking-confirmed:' || result.id) on conflict do nothing;
  insert into public.email_outbox(recipient, template, locale, payload, dedupe_key)
    select p.email, 'booking-confirmed', req.locale, jsonb_build_object('bookingId', result.id, 'reference', result.reference), 'email-booking-confirmed:' || result.id from public.profiles p where p.id = req.guest_id on conflict do nothing;
  insert into public.audit_events(action, entity_type, entity_id, payload) values('payment.confirmed', 'booking', result.id::text, jsonb_build_object('testMode', result.test_mode));
  return result;
end $$;

create or replace function public.expire_due_work() returns jsonb language plpgsql security definer set search_path = '' as $$
declare expired_requests integer; expired_holds integer;
begin
  update public.booking_requests set status = 'expired' where status = 'submitted' and response_due_at <= now(); get diagnostics expired_requests = row_count;
  update public.reservations set status = 'expired' where status = 'hold' and expires_at <= now(); get diagnostics expired_holds = row_count;
  update public.booking_requests r set status = 'expired' from public.reservations h where h.request_id = r.id and h.status = 'expired' and r.status = 'approved_payment_pending';
  return jsonb_build_object('requests', expired_requests, 'holds', expired_holds);
end $$;

alter table public.profiles enable row level security;
alter table public.partner_organizations enable row level security;
alter table public.partner_memberships enable row level security;
alter table public.role_grants enable row level security;
alter table public.destinations enable row level security;
alter table public.villas enable row level security;
alter table public.villa_revisions enable row level security;
alter table public.villa_media enable row level security;
alter table public.seasonal_rates enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.booking_requests enable row level security;
alter table public.reservations enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.bookings enable row level security;
alter table public.notifications enable row level security;
alter table public.email_outbox enable row level security;
alter table public.audit_events enable row level security;
alter table public.system_settings enable row level security;

create policy profiles_self_select on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy profiles_partner_guest_select on public.profiles for select using (
  exists(select 1 from public.booking_requests r join public.villas v on v.id = r.villa_id where r.guest_id = profiles.id and public.is_partner_member(v.partner_id))
);
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy partner_org_member_select on public.partner_organizations for select using (public.is_partner_member(id) or public.is_staff());
create policy partner_org_staff_write on public.partner_organizations for all using (public.is_staff()) with check (public.is_staff());
create policy partner_member_select on public.partner_memberships for select using (user_id = auth.uid() or public.is_partner_member(partner_id) or public.is_staff());
create policy role_grants_staff_access on public.role_grants for all using (public.is_staff()) with check (public.is_staff());
create policy destinations_public_select on public.destinations for select using (published or public.is_staff());
create policy destinations_staff_write on public.destinations for all using (public.is_staff()) with check (public.is_staff());
create policy villas_public_select on public.villas for select using (status = 'published' or public.is_partner_member(partner_id) or public.is_staff());
create policy villas_partner_write on public.villas for all using (public.is_partner_member(partner_id) or public.is_staff()) with check (public.is_partner_member(partner_id) or public.is_staff());
create policy revisions_visible on public.villa_revisions for select using (exists(select 1 from public.villas v where v.id = villa_id and (v.current_revision_id = villa_revisions.id or public.is_partner_member(v.partner_id) or public.is_staff())));
create policy revisions_partner_write on public.villa_revisions for all using (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff()))) with check (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff())));
create policy media_visible on public.villa_media for select using (exists(select 1 from public.villas v where v.id = villa_id and (v.status = 'published' or public.is_partner_member(v.partner_id) or public.is_staff())));
create policy media_partner_write on public.villa_media for all using (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff()))) with check (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff())));
create policy rates_visible on public.seasonal_rates for select using (exists(select 1 from public.villas v where v.id = villa_id and (v.status = 'published' or public.is_partner_member(v.partner_id) or public.is_staff())));
create policy rates_partner_write on public.seasonal_rates for all using (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff()))) with check (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff())));
create policy blocks_partner_access on public.availability_blocks for all using (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff()))) with check (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff())));
create policy requests_guest_select on public.booking_requests for select using (guest_id = auth.uid());
create policy requests_guest_insert on public.booking_requests for insert with check (guest_id = auth.uid());
create policy requests_partner_select on public.booking_requests for select using (exists(select 1 from public.villas v where v.id = villa_id and (public.is_partner_member(v.partner_id) or public.is_staff())));
create policy reservations_related_select on public.reservations for select using (exists(select 1 from public.booking_requests r join public.villas v on v.id = r.villa_id where r.id = request_id and (r.guest_id = auth.uid() or public.is_partner_member(v.partner_id) or public.is_staff())));
create policy payments_related_select on public.payment_attempts for select using (exists(select 1 from public.booking_requests r join public.villas v on v.id = r.villa_id where r.id = request_id and (r.guest_id = auth.uid() or public.is_partner_member(v.partner_id) or public.is_staff())));
create policy bookings_related_select on public.bookings for select using (exists(select 1 from public.booking_requests r join public.villas v on v.id = r.villa_id where r.id = request_id and (r.guest_id = auth.uid() or public.is_partner_member(v.partner_id) or public.is_staff())));
create policy notifications_self on public.notifications for select using (user_id = auth.uid());
create policy notifications_self_update on public.notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy audits_staff_select on public.audit_events for select using (public.is_staff());
create policy audits_authenticated_insert on public.audit_events for insert to authenticated with check (actor_id = auth.uid());
create policy settings_public_select on public.system_settings for select using (true);
create policy settings_staff_write on public.system_settings for all using (public.is_staff()) with check (public.is_staff());

create policy storage_partner_select on storage.objects for select to authenticated using (
  bucket_id = 'villa-media' and exists(select 1 from public.partner_memberships m where m.user_id = auth.uid() and m.partner_id::text = (storage.foldername(name))[1])
);
create policy storage_partner_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'villa-media' and exists(select 1 from public.partner_memberships m where m.user_id = auth.uid() and m.partner_id::text = (storage.foldername(name))[1])
);
create policy storage_partner_update on storage.objects for update to authenticated using (
  bucket_id = 'villa-media' and exists(select 1 from public.partner_memberships m where m.user_id = auth.uid() and m.partner_id::text = (storage.foldername(name))[1])
) with check (
  bucket_id = 'villa-media' and exists(select 1 from public.partner_memberships m where m.user_id = auth.uid() and m.partner_id::text = (storage.foldername(name))[1])
);
create policy storage_partner_delete on storage.objects for delete to authenticated using (
  bucket_id = 'villa-media' and exists(select 1 from public.partner_memberships m where m.user_id = auth.uid() and m.partner_id::text = (storage.foldername(name))[1])
);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.destinations, public.villas, public.villa_revisions, public.villa_media, public.seasonal_rates, public.system_settings to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant execute on function public.submit_booking_request(uuid,date,date,integer,text) to authenticated;
grant execute on function public.approve_booking_request(uuid), public.decline_booking_request(uuid) to authenticated;
revoke all on function public.confirm_test_payment(uuid,text,jsonb), public.expire_due_work() from public, anon, authenticated;
grant execute on function public.confirm_test_payment(uuid,text,jsonb), public.expire_due_work() to service_role;

insert into public.system_settings(key, value) values
  ('fees', '{"serviceFeeBps":800,"vatBps":700}'::jsonb),
  ('displayCurrency', '{"thbPerUsd":34.6,"updatedAt":"2026-07-14"}'::jsonb),
  ('bookingTiming', '{"responseHours":24,"paymentHours":24}'::jsonb);
