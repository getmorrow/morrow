import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { LocalPlace } from './data/localPlaces'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function mapMarkerTitle(place: LocalPlace) {
  if (place.id === 'stay') return 'Auszeit'
  if (place.id === 'experience-exp-couple-wellness') return 'Wellness/Yoga'
  if (place.id === 'experience-exp-couple-cooking') return 'Kochen'
  if (place.id === 'wattwandern-spo') return 'Wattwanderung'
  if (place.id === 'wochenmarkt-dorf') return 'Wochenmarkt'
  return place.title
    .replace(/^Strandabschnitt\s+/i, '')
    .replace(/\s+am\s+(Südstrand|Ordinger Strand|Böhler Strand|Strandabschnitt Bad)$/i, '')
    .replace(/\s+im\s+Erlebnis-Hus$/i, '')
}

type LocalMapMarkerGroup = {
  id: string
  places: LocalPlace[]
  lat: number
  lng: number
  expanded?: boolean
  order?: number
}

function localPlaceDistanceKm(a: LocalPlace, b: LocalPlace) {
  const latKm = (a.lat - b.lat) * 111
  const lngKm = (a.lng - b.lng) * 111 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180)
  return Math.sqrt(latKm * latKm + lngKm * lngKm)
}

export default function GuestLocalMap({
  places,
  compactMarkers = false,
  zoomOnSelect = false,
  onSelectPlace,
}: {
  places: LocalPlace[]
  compactMarkers?: boolean
  zoomOnSelect?: boolean
  onSelectPlace?: (placeId: string) => void
}) {
  const mapNode = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerLayerRef = useRef<L.LayerGroup | null>(null)
  const lastFitKeyRef = useRef('')
  const [currentZoom, setCurrentZoom] = useState(13)
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null)

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return

    const map = L.map(mapNode.current, {
      attributionControl: false,
      scrollWheelZoom: false,
      zoomControl: false,
    }).setView([54.303, 8.641], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    L.control.attribution({ position: 'bottomleft', prefix: false }).addAttribution('© OpenStreetMap').addTo(map)

    markerLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    setCurrentZoom(map.getZoom())

    const updateZoom = () => setCurrentZoom(map.getZoom())
    map.on('zoomend', updateZoom)

    return () => {
      map.off('zoomend', updateZoom)
      map.remove()
      mapRef.current = null
      markerLayerRef.current = null
    }
  }, [])

  useEffect(() => {
    setExpandedClusterId(null)
  }, [compactMarkers, places])

  useEffect(() => {
    const map = mapRef.current
    const markerLayer = markerLayerRef.current
    if (!map || !markerLayer) return

    markerLayer.clearLayers()
    const useCompactMarkers = compactMarkers
    const useExpandedCompactOffsets = useCompactMarkers && currentZoom >= 14
    const handleSelectPlace = (group: LocalMapMarkerGroup) => {
      if (useCompactMarkers && group.places.length > 1) {
        setExpandedClusterId(group.id)
        const bounds = L.latLngBounds(group.places.map((place) => [place.lat, place.lng] as [number, number]))
        if (bounds.isValid()) {
          map.fitBounds(bounds.pad(0.45), {
            animate: true,
            maxZoom: 15,
            padding: [72, 72],
          })
        }
        return
      }

      if (zoomOnSelect) {
        const nextZoom = Math.max(map.getZoom() + 2, 14)
        map.setView([group.lat, group.lng], Math.min(nextZoom, 16), { animate: true })
      }
      onSelectPlace?.(group.id)
    }
    let compactPlaceIndex = 0
    const overviewCompactOffsets = [
      [-34, -16],
      [34, 18],
      [38, -30],
      [-36, 30],
      [0, -46],
      [48, 4],
      [-48, 4],
      [18, 46],
      [-18, 46],
      [56, -14],
      [-56, -14],
      [12, -62],
      [-12, -62],
      [64, 32],
      [-64, 32],
      [42, 54],
      [-42, 54],
      [0, 68],
    ] as const
    const expandedCompactOffsets = [
      [-46, -22],
      [46, 24],
      [54, -42],
      [-52, 42],
      [0, -66],
      [68, 0],
      [-68, 0],
      [22, 66],
      [-22, 66],
      [80, -18],
      [-80, -18],
      [16, -86],
      [-16, -86],
      [90, 42],
      [-90, 42],
      [56, 76],
      [-56, 76],
      [0, 96],
    ] as const
    const compactOffsets = useExpandedCompactOffsets ? expandedCompactOffsets : overviewCompactOffsets
    const labelOffsets = [
      [-46, -18],
      [44, 14],
      [0, -48],
      [-54, 36],
      [54, 36],
      [0, 58],
      [-70, 0],
      [70, -30],
    ] as const

    const buildCompactMarkerGroups = () => {
      const groupedPlaces: LocalMapMarkerGroup[] = []
      const stayPlaces = places.filter((place) => place.id === 'stay')
      const clusterablePlaces = places.filter((place) => place.id !== 'stay')

      clusterablePlaces.forEach((place) => {
        const matchingGroup = groupedPlaces.find((group) => {
          const anchorPlace = group.places[0]
          return localPlaceDistanceKm(anchorPlace, place) <= 0.32
        })

        if (!matchingGroup) {
          groupedPlaces.push({
            id: place.id,
            places: [place],
            lat: place.lat,
            lng: place.lng,
          })
          return
        }

        matchingGroup.places.push(place)
        matchingGroup.lat = matchingGroup.places.reduce((sum, item) => sum + item.lat, 0) / matchingGroup.places.length
        matchingGroup.lng = matchingGroup.places.reduce((sum, item) => sum + item.lng, 0) / matchingGroup.places.length
        matchingGroup.id = `cluster:${matchingGroup.places.map((item) => item.id).join(',')}`
      })

      return [
        ...stayPlaces.map((place) => ({ id: place.id, places: [place], lat: place.lat, lng: place.lng })),
        ...groupedPlaces,
      ]
    }

    const rawMarkerGroups = useCompactMarkers
      ? buildCompactMarkerGroups()
      : places.map((place) => ({ id: place.id, places: [place], lat: place.lat, lng: place.lng }))
    let groupOrder = 0
    const compactMarkerGroups = rawMarkerGroups.map((group) => {
      if (!useCompactMarkers || group.places[0].id === 'stay') return group
      groupOrder += 1
      return { ...group, order: groupOrder }
    })

    const markerGroups: LocalMapMarkerGroup[] = compactMarkerGroups.flatMap((group) => {
      if (!useCompactMarkers || group.id !== expandedClusterId || group.places.length <= 1) return [group]

      return group.places.map((place) => ({
        id: place.id,
        places: [place],
        lat: place.lat,
        lng: place.lng,
        expanded: true,
      }))
    })

    markerGroups.forEach((group) => {
      const place = group.places[0]
      const isCluster = group.places.length > 1
      const renderAsCompact = useCompactMarkers && !group.expanded
      if (renderAsCompact && place.id !== 'stay') compactPlaceIndex = group.order ?? compactPlaceIndex + 1
      const labelPlaceIndex = markerGroups
        .filter((item) => item.places[0].id !== 'stay')
        .findIndex((item) => item.id === group.id)
      const markerLabel = renderAsCompact
        ? place.id === 'stay' ? 'Auszeit' : String(compactPlaceIndex)
        : mapMarkerTitle(place)
      const compactIconSize = place.id === 'stay'
        ? [68, 30] as [number, number]
        : useExpandedCompactOffsets ? [34, 34] as [number, number] : [30, 30] as [number, number]
      const compactOffset = !renderAsCompact
        ? [0, 0] as const
        : place.id === 'stay'
          ? useExpandedCompactOffsets ? [54, 34] as const : [42, 26] as const
          : compactOffsets[(compactPlaceIndex - 1) % compactOffsets.length]
      const compactIconAnchor = place.id === 'stay'
        ? [34 - compactOffset[0], 15 - compactOffset[1]] as [number, number]
        : [
            (useExpandedCompactOffsets ? 17 : 15) - compactOffset[0],
            (useExpandedCompactOffsets ? 17 : 15) - compactOffset[1],
          ] as [number, number]
      const labelWidth = Math.min(Math.max(markerLabel.length * 7.2 + 32, 86), 170)
      const labelIconSize = [labelWidth, 30] as [number, number]
      const labelOffset = !renderAsCompact && place.id !== 'stay'
        ? labelOffsets[Math.max(labelPlaceIndex, 0) % labelOffsets.length]
        : [0, 0] as const
      const labelIconAnchor = [labelWidth / 2 - labelOffset[0], 15 - labelOffset[1]] as [number, number]
      const icon = L.divIcon({
        className: `morrow-map-marker morrow-map-marker-${place.category}${place.id === 'stay' ? ' is-stay' : ''}${renderAsCompact ? ' is-compact' : ''}${renderAsCompact && place.id !== 'stay' && !isCluster ? ' is-single-compact' : ''}${isCluster ? ' is-cluster' : ''}${useExpandedCompactOffsets && renderAsCompact && place.id !== 'stay' ? ' is-expanded-compact' : ''}${group.expanded ? ' is-expanded-place' : ''}`,
        html: `<button type="button" data-place-id="${escapeHtml(group.id)}" aria-label="${escapeHtml(isCluster ? `${group.places.length} Orte öffnen` : `${place.title} öffnen`)}"><span></span><strong>${escapeHtml(markerLabel)}</strong></button>`,
        iconSize: renderAsCompact ? compactIconSize : labelIconSize,
        iconAnchor: renderAsCompact ? compactIconAnchor : labelIconAnchor,
      })
      const marker = L.marker([group.lat, group.lng], {
        icon,
        keyboard: true,
        zIndexOffset: place.id === 'stay' && useCompactMarkers ? -600 : compactPlaceIndex,
      })
      marker.on('add', () => {
        const element = marker.getElement()
        if (!element) return

        element.setAttribute('data-place-id', place.id)
        element.addEventListener('click', (event) => {
          event.preventDefault()
          event.stopPropagation()
          handleSelectPlace(group)
        })
        element.addEventListener('touchend', (event) => {
          event.preventDefault()
          event.stopPropagation()
          handleSelectPlace(group)
        }, { passive: false })
      })
      marker
        .bindTooltip(isCluster ? `${group.places.length} Orte` : place.title, { direction: 'top', offset: [0, -12] })
        .on('click', () => handleSelectPlace(group))
        .addTo(markerLayer)
    })

    const fitVisiblePlaces = (animate = true) => {
      if (places.length === 0) {
        map.setView([54.303, 8.641], 13, { animate })
        return
      }

      if (places.length === 1) {
        map.setView([places[0].lat, places[0].lng], 14, { animate })
        return
      }

      const bounds = L.latLngBounds(places.map((place) => [place.lat, place.lng] as [number, number]))
      const isNarrow = map.getContainer().clientWidth < 520
      if (useCompactMarkers && isNarrow) {
        map.setView([54.318, 8.585], 10, { animate })
        return
      }
      const markerPadding = useCompactMarkers
        ? isNarrow ? [72, 72] as [number, number] : [96, 72] as [number, number]
        : isNarrow ? [104, 72] as [number, number] : [128, 86] as [number, number]
      const overlayPaddingTopLeft = isNarrow && useCompactMarkers
        ? [138, 86] as [number, number]
        : isNarrow ? [18, 74] as [number, number] : [34, 72] as [number, number]
      const controlPaddingBottomRight = isNarrow ? [58, 62] as [number, number] : [72, 72] as [number, number]

      map.fitBounds(bounds.pad(useCompactMarkers ? 0.5 : 0.18), {
        animate,
        maxZoom: useCompactMarkers ? isNarrow ? 7 : 10 : 15,
        padding: markerPadding,
        paddingTopLeft: overlayPaddingTopLeft,
        paddingBottomRight: controlPaddingBottomRight,
      })
    }

    const fitKey = places.map((place) => `${place.id}:${place.lat}:${place.lng}`).join('|')
    if (lastFitKeyRef.current !== fitKey) {
      lastFitKeyRef.current = fitKey
      fitVisiblePlaces()
    }

    const refitTimer = window.setTimeout(() => {
      map.invalidateSize()
      if (useCompactMarkers && map.getContainer().clientWidth < 520) {
        fitVisiblePlaces(false)
        return
      }
      if (lastFitKeyRef.current !== fitKey) {
        lastFitKeyRef.current = fitKey
        fitVisiblePlaces(false)
      }
    }, 120)

    return () => window.clearTimeout(refitTimer)
  }, [places, compactMarkers, currentZoom, zoomOnSelect, onSelectPlace, expandedClusterId])

  return <div ref={mapNode} className="guest-leaflet-map" aria-label="Interaktive Karte in Sankt Peter-Ording" />
}
