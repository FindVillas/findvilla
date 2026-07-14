import { NextResponse } from "next/server";

// Operator approval is only available through approve_partner_application,
// which enforces the complete verified-evidence checklist and audit trail.
export async function PATCH() {
  return NextResponse.json(
    { error: "Direct partner approval is disabled. Review the partner application." },
    { status: 410 },
  );
}
