"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PartnerRequestActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  async function act(action: "approve" | "decline") {
    if (action === "decline" && !window.confirm("Decline this booking request?")) return;
    setBusy(action);
    const response = await fetch(`/api/partner/booking-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    setBusy("");
    setMessage(response.ok ? `Request ${data.status.replaceAll("_", " ")}.` : data.error);
    if (response.ok) router.refresh();
  }

  return <div><div className="action-row"><button className="mini-btn approve" disabled={Boolean(busy)} onClick={() => act("approve")}>{busy === "approve" ? "Approving…" : "Approve and hold dates"}</button><button className="mini-btn" disabled={Boolean(busy)} onClick={() => act("decline")}>{busy === "decline" ? "Declining…" : "Decline"}</button></div>{message && <div className="notice" style={{marginTop:12}}>{message}</div>}</div>;
}
