'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import { Database } from '@/types/database.types'

type ReportRow = Database['public']['Tables']['reports']['Row']

// ── Constants ─────────────────────────────────────────────────────────────────
const LIGAO_CENTER: [number, number] = [13.2167, 123.5167]
const DEFAULT_ZOOM = 14
const GPS_ZOOM = 17

// ── Colored pins based on status ──────────────────────────────────────────────
const STATUS_COLORS = {
  Submitted: '#dc2626',   // Emergency Red
  'In Progress': '#ea580c', // Warning Orange
  Resolved: '#16a34a'     // Operational Green
}

function createPinIcon(color: string, isSelected: boolean): L.DivIcon {
  const width = isSelected ? '28px' : '24px'
  const height = isSelected ? '28px' : '24px'
  const borderSize = isSelected ? '4px' : '3px'
  const shadowBlur = isSelected ? '18px' : '10px'
  const shadowOpacity = isSelected ? '0.6' : '0.4'

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 42px;
        transition: transform 0.2s ease-out;
        transform: ${isSelected ? 'scale(1.2) translateY(-4px)' : 'scale(1)'};
        z-index: ${isSelected ? 999 : 1};
      ">
        <div style="
          width: ${width};
          height: ${height};
          background: ${color};
          border: ${borderSize} solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px ${shadowBlur} rgba(0,0,0,${shadowOpacity}), 0 0 10px ${color}80;
          position: absolute;
          top: 0;
          left: 4px;
        "></div>
        <div style="
          width: 12px;
          height: 6px;
          background: rgba(0,0,0,0.2);
          border-radius: 50%;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          filter: blur(2px);
        "></div>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
    className: '',
  })
}

// ── Map click handler (places / moves the pin in Citizen Mode) ────────────────
function MapClickHandler({
  onLocationChange,
  readOnly,
}: {
  onLocationChange?: (lat: number, lng: number) => void
  readOnly: boolean
}) {
  useMapEvents({
    click(e) {
      if (!readOnly && onLocationChange) {
        onLocationChange(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

// ── Invalidate size when container resizes (e.g. unhidden on mobile tabs) ─────
function MapResizer() {
  const map = useMap()
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 100)
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    const container = map.getContainer()
    resizeObserver.observe(container)
    return () => {
      clearTimeout(timeout)
      resizeObserver.disconnect()
    }
  }, [map])
  return null
}

// ── Map controller: handles panning, zooming and fitting bounds ───────────────
function MapController({
  lat,
  lng,
  trigger,
  readOnly,
  reports,
  selectedReportId,
}: {
  lat?: number | null
  lng?: number | null
  trigger?: number
  readOnly: boolean
  reports?: ReportRow[]
  selectedReportId?: string | null
}) {
  const map = useMap()

  // Fly to user coordinates in Citizen Mode when GPS trigger changes
  useEffect(() => {
    if (!readOnly && trigger && trigger > 0 && lat !== null && lng !== null && lat !== undefined && lng !== undefined) {
      map.flyTo([lat, lng], GPS_ZOOM, { animate: true, duration: 1.2 })
    }
  }, [trigger, lat, lng, readOnly, map])

  // Fit bounds to show all markers in Admin Mode when reports list changes
  useEffect(() => {
    if (readOnly && reports && reports.length > 0 && !selectedReportId) {
      const validCoords = reports.filter(r => r.latitude != null && r.longitude != null && !isNaN(Number(r.latitude)) && !isNaN(Number(r.longitude)))
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(
          validCoords.map(r => [Number(r.latitude), Number(r.longitude)])
        )
        // Only fit bounds with padding if map is visible
        if (map.getSize().x > 0 && map.getSize().y > 0) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
        } else {
          // If hidden (mobile list view), just set center silently
          map.setView(bounds.getCenter(), 13, { animate: false })
        }
      }
    }
  }, [reports, readOnly, selectedReportId, map])

  // Fly to selected report in Admin Mode when selectedReportId changes
  useEffect(() => {
    if (readOnly && selectedReportId && reports) {
      const selected = reports.find(r => r.id === selectedReportId)
      if (selected && selected.latitude != null && selected.longitude != null) {
        const lat = Number(selected.latitude)
        const lng = Number(selected.longitude)
        if (!isNaN(lat) && !isNaN(lng)) {
          if (map.getSize().x > 0 && map.getSize().y > 0) {
            map.flyTo([lat, lng], GPS_ZOOM, {
              animate: true,
              duration: 1.0,
            })
          } else {
            // If hidden, just set view silently to avoid NaN animation crash
            map.setView([lat, lng], GPS_ZOOM, { animate: false })
          }
        }
      }
    }
  }, [selectedReportId, reports, readOnly, map])

  return null
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ReportMapProps {
  // Citizen form mode (interactive, single pin)
  latitude?: number | null
  longitude?: number | null
  gpsTrigger?: number
  onLocationChange?: (lat: number, lng: number) => void

  // Admin dashboard mode (read-only, multiple pins)
  readOnly?: boolean
  reports?: ReportRow[]
  selectedReportId?: string | null
  onSelectReport?: (reportId: string) => void

  fullHeight?: boolean
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ReportMap({
  latitude = null,
  longitude = null,
  gpsTrigger = 0,
  onLocationChange,
  readOnly = false,
  reports = [],
  selectedReportId = null,
  onSelectReport,
  fullHeight = false,
}: ReportMapProps) {
  const markerRef = useRef<L.Marker | null>(null)
  
  const hasLocation = latitude !== null && longitude !== null

  return (
    <div
      className={`relative z-10 overflow-hidden ${
        fullHeight 
          ? 'w-full h-full' 
          : 'rounded-xl border border-gray-200 dark:border-gray-800 h-[280px] lg:h-[350px]'
      }`}
    >
      <MapContainer
        center={LIGAO_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl
        scrollWheelZoom={readOnly} // Enable scrolling scroll zoom on admin dashboard, keep disabled on citizen form
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        />

        <MapResizer />

        {/* Handle map clicks to place/move pin */}
        <MapClickHandler onLocationChange={onLocationChange} readOnly={readOnly} />

        {/* Center/adjust zoom dynamically */}
        <MapController 
          lat={latitude} 
          lng={longitude} 
          trigger={gpsTrigger} 
          readOnly={readOnly}
          reports={reports}
          selectedReportId={selectedReportId}
        />

        {/* 1. Citizen Form Mode Marker */}
        {!readOnly && hasLocation && (
          <Marker
            position={[latitude, longitude]}
            icon={createPinIcon(STATUS_COLORS.Submitted, false)}
            draggable
            ref={markerRef}
            eventHandlers={{
              dragend() {
                const pos = markerRef.current?.getLatLng()
                if (pos && onLocationChange) {
                  onLocationChange(pos.lat, pos.lng)
                }
              },
            }}
          />
        )}

        {/* 2. Admin Dashboard Mode Markers */}
        {readOnly && reports.map((report) => {
          if (report.latitude == null || report.longitude == null || isNaN(Number(report.latitude)) || isNaN(Number(report.longitude))) {
            return null;
          }

          const lat = Number(report.latitude)
          const lng = Number(report.longitude)
          const isSelected = report.id === selectedReportId
          const color = STATUS_COLORS[report.status] || STATUS_COLORS.Submitted
          
          return (
            <Marker
              key={report.id}
              position={[lat, lng]}
              icon={createPinIcon(color, isSelected)}
              eventHandlers={{
                click() {
                  if (onSelectReport) {
                    onSelectReport(report.id)
                  }
                },
              }}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      {report.category}
                    </span>
                    <span 
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                        report.status === 'Resolved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                          : report.status === 'In Progress'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Brgy. {report.barangay}
                  </p>
                  <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2">
                    {report.description}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Citizen Mode overlay instructions */}
      {!readOnly && !hasLocation && (
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none z-[400]">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm animate-fade-in">
            <MapPin size={14} className="text-red-500 shrink-0 animate-pulse" />
            <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
              Tap map or click GPS to position your pin
            </span>
          </div>
        </div>
      )}

      {/* Attribution badge */}
      <div className="absolute bottom-1 left-1 z-[400] text-[10px] text-gray-400 bg-white/70 dark:bg-gray-900/70 px-1.5 rounded pointer-events-none border border-gray-200/50 dark:border-gray-800/50">
        © OpenStreetMap
      </div>
    </div>
  )
}
