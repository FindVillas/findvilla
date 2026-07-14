create type public.partner_application_status as enum ('draft','submitted','under_review','changes_requested','approved','rejected','withdrawn');
create type public.applicant_type as enum ('individual','legal_entity');
create type public.applicant_relationship as enum ('owner_operator','manager_agent');
create type public.compliance_status as enum ('draft','submitted','under_review','changes_requested','approved','rejected','suspended');
create type public.accommodation_legal_path as enum ('hotel_license','non_hotel_notification');
create type public.evidence_status as enum ('pending','verified','rejected','expired','superseded','purged');
create type public.requirement_source as enum ('statutory','findvillas_policy');

create table public.partner_applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid references public.partner_organizations(id),
  applicant_type public.applicant_type not null,
  relationship public.applicant_relationship not null,
  proposed_name text not null,
  legal_name_th text,
  legal_name_en text not null,
  registration_number text,
  tax_id text,
  nationality text not null default 'TH',
  phone text not null,
  legal_address jsonb not null default '{}'::jsonb,
  vat_registered boolean not null default false,
  has_foreign_involvement boolean not null default false,
  declarations jsonb not null default '{}'::jsonb,
  policy_version text not null default 'th-partner-v1-2026-07',
  status public.partner_application_status not null default 'draft',
  reviewer_id uuid references public.profiles(id),
  decision_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  retention_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (applicant_type <> 'legal_entity' or registration_number is not null)
);
create unique index one_open_partner_application_per_user on public.partner_applications(applicant_user_id) where status not in ('rejected','withdrawn');

create table public.property_compliance_cases (
  id uuid primary key default gen_random_uuid(),
  villa_id uuid not null unique references public.villas(id) on delete cascade,
  partner_id uuid not null references public.partner_organizations(id) on delete cascade,
  legal_path public.accommodation_legal_path not null,
  licensed_name text not null,
  exact_address jsonb not null,
  room_count integer not null check (room_count > 0),
  guest_capacity integer not null check (guest_capacity > 0),
  declarations jsonb not null default '{}'::jsonb,
  policy_version text not null default 'th-property-v1-2026-07',
  status public.compliance_status not null default 'draft',
  reviewer_id uuid references public.profiles(id),
  decision_note text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (legal_path <> 'non_hotel_notification' or (room_count <= 8 and guest_capacity <= 30))
);

create table public.evidence_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.partner_applications(id) on delete cascade,
  compliance_case_id uuid references public.property_compliance_cases(id) on delete cascade,
  requirement_code text not null,
  requirement_source public.requirement_source not null,
  storage_path text,
  original_name text not null,
  mime_type text not null check (mime_type in ('application/pdf','image/jpeg','image/png','image/webp')),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 20971520),
  sha256 text not null,
  document_number text,
  issuing_authority text,
  issued_on date,
  expires_on date,
  version integer not null default 1 check (version > 0),
  status public.evidence_status not null default 'pending',
  scan_status text not null default 'accepted' check (scan_status in ('accepted','rejected')),
  uploaded_by uuid not null references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text,
  supersedes_id uuid references public.evidence_documents(id),
  purged_at timestamptz,
  created_at timestamptz not null default now(),
  check ((application_id is not null)::integer + (compliance_case_id is not null)::integer = 1)
);
create unique index evidence_version_unique on public.evidence_documents(coalesce(application_id, compliance_case_id), requirement_code, version);
create index evidence_application_idx on public.evidence_documents(application_id, requirement_code, created_at desc);
create index evidence_compliance_idx on public.evidence_documents(compliance_case_id, requirement_code, created_at desc);
create index evidence_expiry_idx on public.evidence_documents(expires_on) where status = 'verified';

create table public.verification_events (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.partner_applications(id) on delete cascade,
  compliance_case_id uuid references public.property_compliance_cases(id) on delete cascade,
  evidence_id uuid references public.evidence_documents(id) on delete set null,
  actor_id uuid references public.profiles(id),
  action text not null,
  note text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check ((application_id is not null)::integer + (compliance_case_id is not null)::integer >= 1)
);

create table public.evidence_access_events (
  id uuid primary key default gen_random_uuid(),
  evidence_id uuid not null references public.evidence_documents(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  purpose text not null,
  created_at timestamptz not null default now()
);

alter table public.partner_organizations add column source_application_id uuid unique references public.partner_applications(id);

create trigger partner_applications_touch before update on public.partner_applications for each row execute function public.touch_updated_at();
create trigger compliance_cases_touch before update on public.property_compliance_cases for each row execute function public.touch_updated_at();

create or replace function public.prevent_verification_audit_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'verification_audit_is_append_only';
end $$;
create trigger verification_events_append_only before update or delete on public.verification_events for each row execute function public.prevent_verification_audit_mutation();
create trigger evidence_access_events_append_only before update or delete on public.evidence_access_events for each row execute function public.prevent_verification_audit_mutation();

create or replace function public.has_current_verified_evidence(p_application_id uuid, p_case_id uuid, p_code text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.evidence_documents d
    where d.application_id is not distinct from p_application_id
      and d.compliance_case_id is not distinct from p_case_id
      and d.requirement_code = p_code and d.status = 'verified'
      and d.scan_status = 'accepted' and d.storage_path is not null
      and (d.expires_on is null or d.expires_on >= current_date)
      and not exists(select 1 from public.evidence_documents newer where newer.supersedes_id = d.id)
  )
$$;

create or replace function public.has_submittable_evidence(p_application_id uuid, p_case_id uuid, p_code text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(
    select 1 from public.evidence_documents d
    where d.application_id is not distinct from p_application_id
      and d.compliance_case_id is not distinct from p_case_id
      and d.requirement_code = p_code and d.status in ('pending','verified')
      and d.scan_status = 'accepted' and d.storage_path is not null
      and (d.expires_on is null or d.expires_on >= current_date)
      and not exists(select 1 from public.evidence_documents newer where newer.supersedes_id = d.id)
  )
$$;

create or replace function public.submit_partner_application(p_application_id uuid)
returns public.partner_applications language plpgsql security definer set search_path = '' as $$
declare app public.partner_applications%rowtype; missing text;
begin
  select * into app from public.partner_applications where id = p_application_id for update;
  if not found or app.applicant_user_id <> auth.uid() or app.status not in ('draft','changes_requested') then raise exception 'application_not_submittable'; end if;
  if not coalesce((app.declarations->>'truthful')::boolean,false) or not coalesce((app.declarations->>'privacy')::boolean,false) then raise exception 'declarations_required'; end if;
  select code into missing from unnest(array['IDENTITY']::text[] ||
    case when app.applicant_type='legal_entity' then array['DBD_CERTIFICATE','AUTHORIZED_SIGNATORY_ID','SHAREHOLDER_LIST']::text[] else array[]::text[] end ||
    case when app.relationship='manager_agent' then array['MANAGEMENT_AUTHORITY']::text[] else array[]::text[] end ||
    case when app.vat_registered then array['VAT_CERTIFICATE']::text[] else array[]::text[] end ||
    case when app.has_foreign_involvement then array['FOREIGN_BUSINESS_AUTHORITY']::text[] else array[]::text[] end
  ) code where not public.has_submittable_evidence(app.id,null,code) limit 1;
  if missing is not null then raise exception 'missing_evidence:%',missing; end if;
  update public.partner_applications set status='submitted', submitted_at=now(), reviewer_id=null, decision_note=null where id=app.id returning * into app;
  insert into public.verification_events(application_id,actor_id,action) values(app.id,auth.uid(),'application.submitted');
  return app;
end $$;

create or replace function public.approve_partner_application(p_application_id uuid, p_note text)
returns public.partner_applications language plpgsql security definer set search_path = '' as $$
declare app public.partner_applications%rowtype; org_id uuid; missing text;
begin
  if not public.is_staff() then raise exception 'forbidden'; end if;
  select * into app from public.partner_applications where id=p_application_id for update;
  if not found or app.status <> 'under_review' or app.reviewer_id is distinct from auth.uid() then raise exception 'application_not_approvable_by_reviewer'; end if;
  select code into missing from unnest(array['IDENTITY']::text[] ||
    case when app.applicant_type='legal_entity' then array['DBD_CERTIFICATE','AUTHORIZED_SIGNATORY_ID','SHAREHOLDER_LIST']::text[] else array[]::text[] end ||
    case when app.relationship='manager_agent' then array['MANAGEMENT_AUTHORITY']::text[] else array[]::text[] end ||
    case when app.vat_registered then array['VAT_CERTIFICATE']::text[] else array[]::text[] end ||
    case when app.has_foreign_involvement then array['FOREIGN_BUSINESS_AUTHORITY']::text[] else array[]::text[] end
  ) code where not public.has_current_verified_evidence(app.id,null,code) limit 1;
  if missing is not null then raise exception 'missing_verified_evidence:%',missing; end if;
  insert into public.partner_organizations(name,status,application,reviewed_at,source_application_id)
    values(app.proposed_name,'approved',jsonb_build_object('legalName',app.legal_name_en,'registrationNumber',app.registration_number,'policyVersion',app.policy_version),now(),app.id)
    returning id into org_id;
  insert into public.partner_memberships(partner_id,user_id,permission) values(org_id,app.applicant_user_id,'owner');
  update public.profiles set role='partner' where id=app.applicant_user_id and role='guest';
  update public.partner_applications set status='approved',organization_id=org_id,reviewer_id=auth.uid(),reviewed_at=now(),decision_note=p_note where id=app.id returning * into app;
  insert into public.verification_events(application_id,actor_id,action,note) values(app.id,auth.uid(),'application.approved',p_note);
  insert into public.notifications(user_id,type,locale,payload,dedupe_key) values(app.applicant_user_id,'partner_application.approved','en',jsonb_build_object('applicationId',app.id),'partner-approved:'||app.id) on conflict do nothing;
  return app;
end $$;

create or replace function public.submit_property_compliance(p_case_id uuid)
returns public.property_compliance_cases language plpgsql security definer set search_path = '' as $$
declare c public.property_compliance_cases%rowtype; missing text;
begin
  select * into c from public.property_compliance_cases where id=p_case_id for update;
  if not found or not public.is_partner_member(c.partner_id) or c.status not in ('draft','changes_requested') then raise exception 'case_not_submittable'; end if;
  if c.legal_path='non_hotel_notification' and (c.room_count>8 or c.guest_capacity>30) then raise exception 'non_hotel_capacity_exceeded'; end if;
  select code into missing from unnest(array['PROPERTY_RIGHT','FLOOR_PLAN','PROPERTY_PHOTOS','FIRE_SAFETY','LIABILITY_INSURANCE']::text[] ||
    case when c.legal_path='hotel_license' then array['HOTEL_LICENSE','BUILDING_HOTEL_USE']::text[]
         else array['NON_HOTEL_NOTIFICATION','MAIN_INCOME_EVIDENCE']::text[] end
  ) code where not public.has_submittable_evidence(null,c.id,code) limit 1;
  if missing is not null then raise exception 'missing_evidence:%',missing; end if;
  update public.property_compliance_cases set status='submitted',submitted_at=now(),reviewer_id=null,decision_note=null where id=c.id returning * into c;
  insert into public.verification_events(compliance_case_id,actor_id,action) values(c.id,auth.uid(),'compliance.submitted');
  return c;
end $$;

create or replace function public.approve_property_compliance(p_case_id uuid, p_note text)
returns public.property_compliance_cases language plpgsql security definer set search_path = '' as $$
declare c public.property_compliance_cases%rowtype; missing text;
begin
  if not public.is_staff() then raise exception 'forbidden'; end if;
  select * into c from public.property_compliance_cases where id=p_case_id for update;
  if not found or c.status <> 'under_review' or c.reviewer_id is distinct from auth.uid() then raise exception 'case_not_approvable_by_reviewer'; end if;
  select code into missing from unnest(array['PROPERTY_RIGHT','FLOOR_PLAN','PROPERTY_PHOTOS','FIRE_SAFETY','LIABILITY_INSURANCE']::text[] ||
    case when c.legal_path='hotel_license' then array['HOTEL_LICENSE','BUILDING_HOTEL_USE']::text[]
         else array['NON_HOTEL_NOTIFICATION','MAIN_INCOME_EVIDENCE']::text[] end
  ) code where not public.has_current_verified_evidence(null,c.id,code) limit 1;
  if missing is not null then raise exception 'missing_verified_evidence:%',missing; end if;
  update public.property_compliance_cases set status='approved',reviewer_id=auth.uid(),reviewed_at=now(),decision_note=p_note where id=c.id returning * into c;
  update public.villa_revisions set status='published' where id=(select current_revision_id from public.villas where id=c.villa_id);
  update public.villas set status='published' where id=c.villa_id;
  insert into public.verification_events(compliance_case_id,actor_id,action,note) values(c.id,auth.uid(),'compliance.approved',p_note);
  return c;
end $$;

create or replace function public.expire_verification_evidence()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare docs integer; cases integer;
begin
  update public.evidence_documents set status='expired' where status='verified' and expires_on<current_date; get diagnostics docs=row_count;
  update public.property_compliance_cases c set status='suspended',decision_note='Required evidence expired'
  where c.status='approved' and exists(select 1 from public.evidence_documents d where d.compliance_case_id=c.id and d.status='expired'); get diagnostics cases=row_count;
  update public.villas v set status='suspended' from public.property_compliance_cases c where c.villa_id=v.id and c.status='suspended' and v.status='published';
  return jsonb_build_object('documents',docs,'cases',cases);
end $$;

alter table public.partner_applications enable row level security;
alter table public.property_compliance_cases enable row level security;
alter table public.evidence_documents enable row level security;
alter table public.verification_events enable row level security;
alter table public.evidence_access_events enable row level security;

create policy application_owner_staff_select on public.partner_applications for select using(applicant_user_id=auth.uid() or public.is_staff());
create policy application_owner_insert on public.partner_applications for insert with check(applicant_user_id=auth.uid() and status='draft' and organization_id is null and reviewer_id is null);
create policy application_owner_update on public.partner_applications for update using(applicant_user_id=auth.uid() and status in ('draft','changes_requested')) with check(applicant_user_id=auth.uid() and status in ('draft','changes_requested'));
create policy application_staff_update on public.partner_applications for update using(public.is_staff()) with check(public.is_staff());
create policy compliance_member_staff_select on public.property_compliance_cases for select using(public.is_partner_member(partner_id) or public.is_staff());
create policy compliance_member_insert on public.property_compliance_cases for insert with check(public.is_partner_member(partner_id) and status='draft' and reviewer_id is null);
create policy compliance_member_update on public.property_compliance_cases for update using(public.is_partner_member(partner_id) and status in ('draft','changes_requested')) with check(public.is_partner_member(partner_id) and status in ('draft','changes_requested'));
create policy compliance_staff_update on public.property_compliance_cases for update using(public.is_staff()) with check(public.is_staff());
create policy evidence_related_select on public.evidence_documents for select using(public.is_staff() or exists(select 1 from public.partner_applications a where a.id=application_id and a.applicant_user_id=auth.uid()) or exists(select 1 from public.property_compliance_cases c where c.id=compliance_case_id and public.is_partner_member(c.partner_id)));
create policy evidence_related_insert on public.evidence_documents for insert with check(uploaded_by=auth.uid() and (exists(select 1 from public.partner_applications a where a.id=application_id and a.applicant_user_id=auth.uid() and a.status in ('draft','changes_requested')) or exists(select 1 from public.property_compliance_cases c where c.id=compliance_case_id and public.is_partner_member(c.partner_id) and c.status in ('draft','changes_requested'))));
create policy evidence_staff_update on public.evidence_documents for update using(public.is_staff()) with check(public.is_staff());
create policy verification_events_related_select on public.verification_events for select using(public.is_staff() or exists(select 1 from public.partner_applications a where a.id=application_id and a.applicant_user_id=auth.uid()) or exists(select 1 from public.property_compliance_cases c where c.id=compliance_case_id and public.is_partner_member(c.partner_id)));
create policy verification_events_authenticated_insert on public.verification_events for insert to authenticated with check(actor_id=auth.uid());
create policy evidence_access_staff on public.evidence_access_events for select using(public.is_staff());
create policy evidence_access_staff_insert on public.evidence_access_events for insert with check(public.is_staff() and actor_id=auth.uid());

drop policy villas_partner_write on public.villas;
create policy villas_partner_insert on public.villas for insert with check(public.is_partner_member(partner_id) and status in ('draft','submitted'));
create policy villas_partner_update_unpublished on public.villas for update using(public.is_partner_member(partner_id) and status in ('draft','submitted','changes_requested')) with check(public.is_partner_member(partner_id) and status in ('draft','submitted','changes_requested'));
create policy villas_staff_write on public.villas for all using(public.is_staff()) with check(public.is_staff());
drop policy revisions_partner_write on public.villa_revisions;
create policy revisions_partner_insert on public.villa_revisions for insert with check(exists(select 1 from public.villas v where v.id=villa_id and public.is_partner_member(v.partner_id)) and status in ('draft','submitted'));
create policy revisions_partner_update_unpublished on public.villa_revisions for update using(status in ('draft','submitted','changes_requested') and exists(select 1 from public.villas v where v.id=villa_id and public.is_partner_member(v.partner_id))) with check(status in ('draft','submitted','changes_requested') and exists(select 1 from public.villas v where v.id=villa_id and public.is_partner_member(v.partner_id)));
create policy revisions_staff_write on public.villa_revisions for all using(public.is_staff()) with check(public.is_staff());

grant select,insert,update on public.partner_applications,public.property_compliance_cases to authenticated;
grant select on public.evidence_documents,public.verification_events,public.evidence_access_events to authenticated;
revoke all on function public.prevent_verification_audit_mutation(),public.has_current_verified_evidence(uuid,uuid,text),public.has_submittable_evidence(uuid,uuid,text),public.submit_partner_application(uuid),public.approve_partner_application(uuid,text),public.submit_property_compliance(uuid),public.approve_property_compliance(uuid,text),public.expire_verification_evidence() from public,anon,authenticated;
grant execute on function public.submit_partner_application(uuid),public.submit_property_compliance(uuid) to authenticated;
grant execute on function public.approve_partner_application(uuid,text),public.approve_property_compliance(uuid,text) to authenticated;
grant execute on function public.expire_verification_evidence() to service_role;

insert into public.system_settings(key,value) values('partner_verification_policy_v1',jsonb_build_object(
  'version','th-partner-v1-2026-07','legalReviewRequired',true,'rejectedRetentionDays',90,'approvedRetentionYears',5,
  'sources',jsonb_build_array('Thailand Hotel Act B.E. 2547','Ministerial Regulation B.E. 2566','DOPA','DBD','PDPA'))
) on conflict(key) do update set value=excluded.value;
