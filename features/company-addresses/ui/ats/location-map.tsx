"use client";

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

// Leaflet's default marker images resolve relative to its own CSS, which
// breaks once bundled — pull them from the same CDN version instead of
// importing the package's PNGs directly (Turbopack doesn't give those a
// `.src` the way Webpack's asset loader does).
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/** Metro Manila — a sane default center when no coordinates are set yet. */
const DEFAULT_CENTER: [number, number] = [14.5995, 120.9842];

function ClickToPick({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Disables pan/zoom interaction — for the read-only detail view. */
function DisableInteraction() {
  const map = useMap();
  useEffect(() => {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
  }, [map]);
  return null;
}

/** Recenters (and zooms in on) the map when `position` changes from outside
 * (typed fields, geolocation, search select). */
function Recenter({
  position,
  zoom,
}: {
  position: [number, number] | null;
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, Math.max(map.getZoom(), zoom));
  }, [position, zoom, map]);
  return null;
}

export function LocationMap({
  lat,
  lng,
  onPick,
  className,
  zoom = 16,
}: {
  lat: number | null;
  lng: number | null;
  /** Omit for a read-only map (e.g. a details view) — disables interaction too. */
  onPick?: (lat: number, lng: number) => void;
  className?: string;
  /** Zoom level once a pin is placed — closer to street level by default. */
  zoom?: number;
}) {
  const position: [number, number] | null =
    lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)
      ? [lat, lng]
      : null;

  return (
    <div className={className ?? "h-64 w-full overflow-hidden rounded-lg border"}>
      <MapContainer
        center={position ?? DEFAULT_CENTER}
        zoom={position ? zoom : 11}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {position ? <Marker position={position} icon={markerIcon} /> : null}
        {onPick ? <ClickToPick onPick={onPick} /> : <DisableInteraction />}
        <Recenter position={position} zoom={zoom} />
      </MapContainer>
    </div>
  );
}
