"use client";

import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Villa } from "@/lib/types";

export default function RealMap({ villas, token }: { villas: Villa[]; token: string }) {
  return <Map mapboxAccessToken={token} initialViewState={{longitude: 99.2, latitude: 9.5, zoom: 5.3}} mapStyle="mapbox://styles/mapbox/streets-v12" style={{width:"100%",height:"100%"}}>
    <NavigationControl position="top-right"/>
    {villas.map(v => <Marker longitude={v.lng} latitude={v.lat} anchor="bottom" key={v.id}><span className="map-pin" style={{position:"relative", left:0, top:0}}>฿{Math.round(v.baseRateThb / 1000)}k</span></Marker>)}
  </Map>;
}
