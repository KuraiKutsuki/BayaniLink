'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'

// ── Constants ─────────────────────────────────────────────────────────────────
// Ligao City Hall, Albay approximate center
const LIGAO_CENTER: [number, number] = [13.2167, 123.5167]
const DEFAULT_ZOOM = 14
const GPS_ZOOM = 17

// ── Custom red map pin using divIcon (avoids Next.js/webpack image issues) ────
function createPinIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="position:relative;width:32px;height:42px">
        <div style="
          width:26px;height:26px;
          background:#dc2626;
          border:3.5px solid white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 3px 14px rgba(220,38,38,0.55);
          position:absolute;
          top:0;left:3px;
        "></div>
        <div style="
          width:10px;height:5px;
          background:rgba(0,0,0,0.18);
          border-radius:50%;
          position:absolute;
          bottom:0;left:50%;
          transform:translateX(-50%);
          filter:blur(2.5px);
        "></div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    className: '',
  })
}

// ── Map click handler (places / moves the pin) ─────────────────────────────
function MapClickHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ── Map controller: flies to GPS coords when gpsTrigger increments ──────────
function MapController({
  lat,
  lng,
  trigger,
}: {
  lat: number
  lng: number
  trigger: number
}) {
  const map = useMap()

  useEffect(() => {
    if (trigger > 0) {
      map.flyTo([lat, lng], GPS_ZOOM, { animate: true, duration: 1.2 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger])

  return null
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ReportMapProps {
  latitude: number | null
  longitude: number | null
  /** Increment this counter each time GPS sets new coords to trigger map fly */
  gpsTrigger: number
  onLocationChange: (lat: number, lng: number) => void
  fullHeight?: boolean
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ReportMap({
  latitude,
  longitude,
  gpsTrigger,
  onLocationChange,
  fullHeight = false,
}: ReportMapProps) {
  const markerRef = useRef<L.Marker | null>(null)
  const pinIcon = useRef<L.DivIcon | null>(null)

  // Create icon once on the client (L is not available during SSR)
  useEffect(() => {
    pinIcon.current = createPinIcon()
  }, [])

  const hasLocation = latitude !== null && longitude !== null

  return (
    <div
      className={`relative overflow-hidden ${
        fullHeight 
          ? 'w-full h-full' 
          : 'rounded-xl border border-gray-200 dark:border-gray-700 h-[260px]'
      }`}
    >
      <MapContainer
        center={LIGAO_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl
        scrollWheelZoom={false}
        attributionControl={false}
      >
        {/* OpenStreetMap tiles — free, no API key needed */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        />

        {/* Handle map clicks to place/move pin */}
        <MapClickHandler onLocationChange={onLocationChange} />

        {/* Fly to GPS location when gpsTrigger changes */}
        {hasLocation && (
          <MapController lat={latitude} lng={longitude} trigger={gpsTrigger} />
        )}

        {/* Draggable marker pin */}
        {hasLocation && pinIcon.current && (
          <Marker
            position={[latitude, longitude]}
            icon={pinIcon.current}
            draggable
            ref={markerRef}
            eventHandlers={{
              dragend() {
                const pos = markerRef.current?.getLatLng()
                if (pos) onLocationChange(pos.lat, pos.lng)
              },
            }}
          />
        )}
      </MapContainer>

      {/* Overlay hint — shown before any location is set */}
      {!hasLocation && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none z-[400]">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-lg">
            <MapPin size={14} className="text-red-500 shrink-0" />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
              Tap the map or use GPS to place your pin
            </span>
          </div>
        </div>
      )}

      {/* Attribution badge */}
      <div className="absolute bottom-1 right-1 z-[400] text-[10px] text-gray-400 bg-white/70 dark:bg-gray-900/70 px-1.5 rounded pointer-events-none">
        © OpenStreetMap
      </div>
    </div>
  )
}
