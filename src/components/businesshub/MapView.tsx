'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useApp, type Business } from '@/store/app'
import { useI18n } from '@/store/i18n'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Navigation, ShieldCheck, Crown, Crosshair } from 'lucide-react'

// Custom premium marker
function createMarker(color: string, emoji: string, premium: boolean) {
  const pulse = premium ? 'premium-marker' : ''
  return L.divIcon({
    html: `
      <div class="relative ${pulse}">
        <div style="background: ${color}; width: 44px; height: 44px; border-radius: 50% 50% 50% 4px; transform: rotate(-45deg); box-shadow: 0 4px 12px -2px ${color}80, 0 2px 4px rgba(0,0,0,0.1); border: 3px solid white; display: flex; align-items: center; justify-content: center;">
          <span style="transform: rotate(45deg); font-size: 18px; line-height: 1;">${emoji}</span>
        </div>
      </div>
    `,
    className: 'custom-business-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -44]
  })
}

const USER_LOC_ICON = L.divIcon({
  html: `<div style="background: #1e40af; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 0 8px rgba(30,64,175,0.2), 0 2px 6px rgba(0,0,0,0.2); animation: pulse-marker 2s ease-in-out infinite;"></div>`,
  className: 'user-loc-marker',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
})

function FlyToUser() {
  const { userLat, userLng, radius } = useApp()
  const map = useMap()
  useEffect(() => {
    if (userLat && userLng) {
      map.flyTo([userLat, userLng], 12, { duration: 1.2 })
    }
  }, [userLat, userLng, map])
  return userLat && userLng ? (
    <>
      <Marker position={[userLat, userLng]} icon={USER_LOC_ICON}>
        <Popup>
          <div className="text-sm font-medium text-blue-700">📍 You are here</div>
        </Popup>
      </Marker>
      <Circle
        center={[userLat, userLng]}
        radius={radius * 1000}
        pathOptions={{ color: '#1e40af', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 1.5, dashArray: '6 4' }}
      />
    </>
  ) : null
}

interface Props {
  businesses: Business[]
  onPickLocation?: (lat: number, lng: number) => void
  pickMode?: boolean
  height?: string
}

export function MapView({ businesses, onPickLocation, pickMode = false, height = '600px' }: Props) {
  const { userLat, userLng, setLocation, setSelectedBusinessId, isLocating, setIsLocating } = useApp()
  const { t } = useI18n()
  const mapRef = useRef<L.Map | null>(null)
  const [located, setLocated] = useState(false)

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude)
        setIsLocating(false)
        setLocated(true)
      },
      (err) => {
        // Fallback to Mumbai centre
        setLocation(19.0760, 72.8777)
        setIsLocating(false)
        setLocated(true)
        console.warn('Geolocation error:', err.message)
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    )
  }

  // Auto-locate on first mount if not in pickMode
  useEffect(() => {
    if (!pickMode && !userLat && !isLocating && !located) {
      getUserLocation()
    }
  }, [])

  const center: [number, number] = userLat && userLng ? [userLat, userLng] : [19.0760, 72.8777]

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm relative">
      <div style={{ height }} className="relative">
        <MapContainer
          center={center}
          zoom={userLat ? 12 : 5}
          className="w-full h-full"
          ref={(m) => { if (m) mapRef.current = m }}
          click={(e: any) => {
            if (pickMode && onPickLocation) {
              onPickLocation(e.latlng.lat, e.latlng.lng)
            }
          }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {pickMode && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution=""
              opacity={0.5}
            />
          )}
          <FlyToUser />
          {businesses.map((biz) => (
            <Marker
              key={biz.id}
              position={[biz.lat, biz.lng]}
              icon={createMarker(biz.imageColor, biz.emoji, biz.premium)}
            >
              <Popup minWidth={260} maxWidth={300}>
                <div className="space-y-2 min-w-[220px]">
                  <div className="flex items-start gap-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${biz.imageColor}20` }}
                    >
                      {biz.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm leading-tight flex items-center gap-1">
                        {biz.name}
                        {biz.verified && <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
                        {biz.premium && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{biz.category}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="text-xs font-medium">{biz.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({biz.reviewCount})</span>
                        {biz.distance !== undefined && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            · {biz.distance.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{biz.description}</div>
                  <div className="text-xs flex items-start gap-1 text-foreground/80">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-brand" />
                    {biz.address}, {biz.city}
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-8 bg-brand hover:bg-brand/90 text-brand-foreground text-xs mt-1"
                    onClick={() => setSelectedBusinessId(biz.id)}
                  >
                    {t('card_viewDetails')}
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating location button */}
        {!pickMode && (
          <Button
            onClick={getUserLocation}
            disabled={isLocating}
            className="absolute top-4 right-4 z-[1000] bg-white text-brand hover:bg-white shadow-md border border-border/40 h-10 w-10 p-0 rounded-lg"
            title={t('hero_useLocation')}
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          </Button>
        )}

        {/* Pick mode hint */}
        {pickMode && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-brand text-brand-foreground px-4 py-2 rounded-full shadow-lg text-xs font-medium flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5" />
            {t('list_pickLocationHint')}
          </div>
        )}

        {/* Map stats overlay */}
        {!pickMode && businesses.length > 0 && (
          <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-border/40">
            <div className="text-xs text-muted-foreground">Showing</div>
            <div className="text-lg font-serif font-semibold text-brand leading-tight">{businesses.length} businesses</div>
          </div>
        )}
      </div>
    </Card>
  )
}
