import { NextResponse } from "next/server";

// Listing publication is deliberately unavailable here. A villa may only be
// published by approve_property_compliance after all required evidence passes.
export async function PATCH() {
  return NextResponse.json(
    { error: "Direct publication is disabled. Review the property compliance case." },
    { status: 410 },
  );
}
