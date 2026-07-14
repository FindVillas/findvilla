"use client";

import dynamic from "next/dynamic";
import type { Villa } from "@/lib/types";

const RealMap = dynamic(() => import("./real-map"), { ssr: false, loading: () => <Fallback/> });

function Fallback({ villas = [] }: { villas?: Villa[] }) {
  return <div className="map-fallback" aria-label="Villa map preview">{villas.slice(0,5).map((villa, index) => <span className="map-pin" key={villa.id} style={{left:`${22 + (index * 17) % 68}%`, top:`${24 + (index * 19) % 60}%`}}>฿{Math.round(villa.baseRateThb / 1000)}k</span>)}</div>;
}

export function MapPanel({ villas }: { villas: Villa[] }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  return <div className="map-panel">{token ? <RealMap villas={villas} token={token}/> : <Fallback villas={villas}/>}</div>;
}
