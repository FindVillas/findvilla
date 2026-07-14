import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function purgeExpiredApplicationEvidence() {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { data: applications, error } = await admin
    .from("partner_applications")
    .select("id")
    .in("status", ["rejected", "withdrawn"])
    .lte("retention_due_at", now);
  if (error) throw error;

  let documentsPurged = 0;
  for (const application of applications) {
    const { data: documents, error: documentError } = await admin
      .from("evidence_documents")
      .select("id,storage_path")
      .eq("application_id", application.id)
      .not("storage_path", "is", null);
    if (documentError) throw documentError;
    if (!documents.length) continue;

    const paths = documents.flatMap(document => document.storage_path ? [document.storage_path] : []);
    if (paths.length) {
      const { error: storageError } = await admin.storage.from("partner-evidence").remove(paths);
      if (storageError) throw storageError;
    }
    const ids = documents.map(document => document.id);
    const { error: updateError } = await admin.from("evidence_documents").update({
      status: "purged",
      storage_path: null,
      purged_at: now,
    }).in("id", ids);
    if (updateError) throw updateError;
    documentsPurged += ids.length;
    await admin.from("verification_events").insert({
      application_id: application.id,
      action: "evidence.retention_purged",
      note: "Private evidence deleted after the application retention period.",
      payload: { documentsPurged: ids.length },
    });
  }
  return { applications: applications.length, documents: documentsPurged };
}
