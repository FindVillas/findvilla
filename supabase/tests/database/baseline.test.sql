begin;
select plan(23);

select has_table('public', 'villas', 'villas table exists');
select has_table('public', 'booking_requests', 'booking requests table exists');
select has_table('public', 'payment_attempts', 'payment attempts table exists');
select has_table('public', 'email_outbox', 'email outbox exists');
select has_table('public', 'partner_applications', 'partner applications table exists');
select has_table('public', 'property_compliance_cases', 'property compliance cases table exists');
select has_table('public', 'evidence_documents', 'private evidence metadata table exists');
select has_function('public', 'submit_booking_request', 'booking submission RPC exists');
select has_function('public', 'approve_booking_request', 'approval RPC exists');
select has_function('public', 'confirm_test_payment', 'payment confirmation RPC exists');
select has_function('public', 'submit_partner_application', 'partner application submission RPC exists');
select has_function('public', 'approve_partner_application', 'partner approval RPC exists');
select has_function('public', 'submit_property_compliance', 'property compliance submission RPC exists');
select has_function('public', 'approve_property_compliance', 'property compliance approval RPC exists');
select has_function('public', 'expire_verification_evidence', 'verification expiry RPC exists');
select has_trigger('public', 'verification_events', 'verification_events_append_only', 'verification audit is append-only');
select ok((select count(*) from public.destinations where published) >= 4, 'reference destinations are present');
select ok((select count(*) from public.villas where status = 'published') >= 5, 'reference villas are present');
select results_eq('select count(*)::bigint from public.role_grants', array[3::bigint], 'three local roles are seeded');
select results_eq('select relrowsecurity from pg_class where oid = ''public.booking_requests''::regclass', array[true], 'booking request RLS is enabled');
select results_eq('select count(*)::bigint from pg_policies where schemaname = ''public'' and tablename = ''audit_events'' and policyname = ''audits_authenticated_insert''', array[1::bigint], 'authenticated audit policy exists');
select results_eq('select count(*)::bigint from pg_policies where schemaname = ''public'' and tablename = ''villas'' and policyname = ''villas_partner_update_unpublished''', array[1::bigint], 'partners cannot use the legacy unrestricted villa update policy');
select ok(not has_table_privilege('authenticated', 'public.evidence_documents', 'INSERT'), 'authenticated clients cannot forge evidence metadata');

select * from finish();
rollback;
