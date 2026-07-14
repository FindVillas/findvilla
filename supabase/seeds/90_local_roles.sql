-- Disposable local personas; never apply this seed to production.
insert into public.role_grants(email, role, partner_id, permission, note) values
  ('staff@findvillas.local', 'staff', null, null, 'Automated local staff account'),
  ('partner@findvillas.local', 'partner', '20000000-0000-0000-0000-000000000001', 'owner', 'Automated local partner account'),
  ('guest@findvillas.local', 'guest', null, null, 'Automated local guest account')
on conflict (email) do update set role = excluded.role, partner_id = excluded.partner_id, permission = excluded.permission;
