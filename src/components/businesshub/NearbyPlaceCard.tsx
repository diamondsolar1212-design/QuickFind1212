'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin, Phone, Globe, Navigation, ExternalLink, Database
} from 'lucide-react'
import type { NearbyPlace } from '@/store/app'

interface Props {
  place: NearbyPlace
  index?: number
}

export function NearbyPlaceCard({ place, index = 0 }: Props) {
  return (
    <div
      className="group bg-card rounded-xl border border-border/60 border-l-4 overflow-hidden hover:shadow-md hover:border-brand/30 transition-all cursor-pointer animate-fadeInUp flex"
      style={{
        animationDelay: `${index * 30}ms`,
        borderLeftColor: place.imageColor
      }}
      onClick={() => {
        if (place.website) {
          window.open(place.website, '_blank')
        } else {
          window.open(`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=18/${place.lat}/${place.lng}`, '_blank')
        }
      }}
    >
      {/* Image / Logo area */}
      <div
        className="relative w-24 sm:w-28 h-24 sm:h-auto flex-shrink-0 overflow-hidden flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${place.imageColor} 0%, ${place.imageColor}dd 100%)`
        }}
      >
        <div className="text-3xl sm:text-4xl drop-shadow-md group-hover:scale-110 transition-transform duration-300">
          {place.emoji}
        </div>
        {/* Source badge */}
        <div className="absolute top-1.5 left-1.5">
          <span className="text-[8px] font-bold bg-black/40 text-white backdrop-blur-sm px-1.5 py-0.5 rounded">
            OSM
          </span>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 p-3 flex flex-col min-w-0">
        {/* Top row: name + distance */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-bold text-sm text-navy leading-snug line-clamp-1 group-hover:text-brand transition-colors flex-1">
            {place.name}
          </h3>
          <span className="text-[11px] font-bold text-brand bg-brand-soft/50 px-1.5 py-0.5 rounded flex-shrink-0">
            {place.distance} km
          </span>
        </div>

        {/* Category */}
        <div className="text-[11px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
          <span className="text-blue-700 font-semibold">{place.category}</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="capitalize">{place.type.replace(/_/g, ' ')}</span>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1 text-[11px] text-muted-foreground mb-2 flex-1">
          <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-brand" />
          <span className="line-clamp-2">{place.address}</span>
        </div>

        {/* Source attribution */}
        <div className="text-[10px] text-muted-foreground/70 mb-2 flex items-center gap-1">
          <Database className="w-2.5 h-2.5" />
          <span>via OpenStreetMap</span>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/50 mt-auto">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px] border-blue-500/30 text-blue-700 hover:bg-blue-50 font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              window.open(`https://www.openstreetmap.org/directions?from=&to=${place.lat}%2C${place.lng}`, '_blank')
            }}
          >
            <Navigation className="w-3 h-3 mr-1" />
            Directions
          </Button>
          {place.phone && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 border-border text-foreground hover:bg-muted hover:text-emerald-600 hover:border-emerald-500/40"
              onClick={(e) => {
                e.stopPropagation()
                window.location.href = `tel:${place.phone}`
              }}
            >
              <Phone className="w-3.5 h-3.5" />
            </Button>
          )}
          {place.website && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 border-border text-foreground hover:bg-muted hover:text-blue-600 hover:border-blue-500/40"
              onClick={(e) => {
                e.stopPropagation()
                window.open(place.website, '_blank')
              }}
            >
              <Globe className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-brand ml-auto"
            onClick={(e) => {
              e.stopPropagation()
              window.open(`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=18/${place.lat}/${place.lng}`, '_blank')
            }}
            title="View on OpenStreetMap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
