"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type * as Leaflet from "leaflet";

export type GuestMapPlace = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
};

type MarkerGroup = {
  id: string;
  places: GuestMapPlace[];
  lat: number;
  lng: number;
  expanded?: boolean;
  order?: number;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function markerTitle(place: GuestMapPlace) {
  if (place.id === "stay") return "Auszeit";
  return place.name
    .replace(/^Strandabschnitt\s+/i, "")
    .replace(/\s+am\s+Strandabschnitt\s+/i, " ");
}

function distanceKm(a: GuestMapPlace, b: GuestMapPlace) {
  const latKm = (a.lat - b.lat) * 111;
  const lngKm = (a.lng - b.lng) * 111 * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.sqrt(latKm * latKm + lngKm * lngKm);
}

function buildGroups(places: GuestMapPlace[], compact: boolean, expandedClusterId: string | null): MarkerGroup[] {
  if (!compact) {
    return places.map((place) => ({ id: place.id, places: [place], lat: place.lat, lng: place.lng }));
  }

  const stayPlaces = places.filter((place) => place.id === "stay");
  const clusterablePlaces = places.filter((place) => place.id !== "stay");
  const groupedPlaces: MarkerGroup[] = [];

  clusterablePlaces.forEach((place) => {
    const matchingGroup = groupedPlaces.find((group) => distanceKm(group.places[0], place) <= 0.5);

    if (!matchingGroup) {
      groupedPlaces.push({ id: place.id, places: [place], lat: place.lat, lng: place.lng });
      return;
    }

    matchingGroup.places.push(place);
    matchingGroup.lat = matchingGroup.places.reduce((sum, item) => sum + item.lat, 0) / matchingGroup.places.length;
    matchingGroup.lng = matchingGroup.places.reduce((sum, item) => sum + item.lng, 0) / matchingGroup.places.length;
    matchingGroup.id = `cluster:${matchingGroup.places.map((item) => item.id).join(",")}`;
  });

  let order = 0;
  return [
    ...stayPlaces.map((place): MarkerGroup => ({ id: place.id, places: [place], lat: place.lat, lng: place.lng })),
    ...groupedPlaces.map((group) => {
      order += 1;
      if (group.id !== expandedClusterId || group.places.length <= 1) return { ...group, order };
      return group.places.map((place) => ({
        id: place.id,
        places: [place],
        lat: place.lat,
        lng: place.lng,
        expanded: true,
        order,
      }));
    }),
  ].flat();
}

export function GuestLocalMap({
  places,
  compactMarkers,
  onSelectPlace,
}: {
  places: GuestMapPlace[];
  compactMarkers: boolean;
  onSelectPlace: (placeId: string) => void;
}) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Leaflet.Map | null>(null);
  const markerLayerRef = useRef<Leaflet.LayerGroup | null>(null);
  const leafletRef = useRef<typeof Leaflet | null>(null);
  const lastFitKeyRef = useRef("");
  const [currentZoom, setCurrentZoom] = useState(13);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const validPlaces = useMemo(
    () => places.filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lng)),
    [places],
  );

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      if (!mapNode.current || mapRef.current) return;

      const leaflet = await import("leaflet");
      if (disposed || !mapNode.current) return;

      leafletRef.current = leaflet;
      const map = leaflet.map(mapNode.current, {
        attributionControl: false,
        scrollWheelZoom: false,
        zoomControl: false,
      }).setView([54.303, 8.641], 13);

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);
      leaflet.control.zoom({ position: "topright" }).addTo(map);
      leaflet.control.attribution({ position: "bottomleft", prefix: false }).addAttribution("© OpenStreetMap").addTo(map);

      markerLayerRef.current = leaflet.layerGroup().addTo(map);
      mapRef.current = map;
      setCurrentZoom(map.getZoom());
      setMapReady(true);

      const updateZoom = () => setCurrentZoom(map.getZoom());
      map.on("zoomend", updateZoom);
    }

    void initMap();

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerLayerRef.current = null;
        setMapReady(false);
      }
    };
  }, []);

  useEffect(() => {
    setExpandedClusterId(null);
  }, [compactMarkers, validPlaces]);

  useEffect(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    if (!mapReady) return;
    if (!leaflet || !map || !markerLayer) return;

    markerLayer.clearLayers();

    const useExpandedOffsets = compactMarkers && currentZoom >= 14;
    const compactOffsets = useExpandedOffsets
      ? [[-46, -22], [46, 24], [54, -42], [-52, 42], [0, -66], [68, 0], [-68, 0], [22, 66], [-22, 66]]
      : [[-34, -16], [34, 18], [38, -30], [-36, 30], [0, -46], [48, 4], [-48, 4], [18, 46], [-18, 46]];
    const labelOffsets = [[-46, -18], [44, 14], [0, -48], [-54, 36], [54, 36], [0, 58], [-70, 0], [70, -30]];
    const markerGroups = buildGroups(validPlaces, compactMarkers, expandedClusterId);

    function handleSelect(group: MarkerGroup) {
      if (compactMarkers && group.places.length > 1) {
        setExpandedClusterId(group.id);
        const bounds = leaflet!.latLngBounds(group.places.map((place) => [place.lat, place.lng] as [number, number]));
        if (bounds.isValid()) {
          map!.fitBounds(bounds.pad(0.45), {
            animate: true,
            maxZoom: 15,
            padding: [72, 72],
          });
        }
        return;
      }

      const place = group.places[0];
      map!.setView([place.lat, place.lng], Math.max(map!.getZoom(), 14), { animate: true });
      onSelectPlace(place.id);
    }

    let compactIndex = 0;
    markerGroups.forEach((group) => {
      const place = group.places[0];
      const isCluster = group.places.length > 1;
      const isCompact = compactMarkers && !group.expanded;
      if (isCompact && place.id !== "stay") compactIndex = group.order ?? compactIndex + 1;

      const markerLabel = isCompact ? (place.id === "stay" ? "Auszeit" : String(compactIndex)) : markerTitle(place);
      const labelIndex = markerGroups.filter((item) => item.places[0].id !== "stay").findIndex((item) => item.id === group.id);
      const compactOffset = isCompact
        ? place.id === "stay"
          ? (useExpandedOffsets ? [54, 34] : [42, 26])
          : compactOffsets[(Math.max(compactIndex, 1) - 1) % compactOffsets.length]
        : [0, 0];
      const compactSize: [number, number] = place.id === "stay" ? [68, 30] : useExpandedOffsets ? [34, 34] : [30, 30];
      const compactAnchor: [number, number] = place.id === "stay"
        ? [34 - compactOffset[0], 15 - compactOffset[1]]
        : [(useExpandedOffsets ? 17 : 15) - compactOffset[0], (useExpandedOffsets ? 17 : 15) - compactOffset[1]];
      const labelWidth = Math.min(Math.max(markerLabel.length * 7.2 + 32, 86), 170);
      const labelOffset = !isCompact && place.id !== "stay"
        ? labelOffsets[Math.max(labelIndex, 0) % labelOffsets.length]
        : [0, 0];
      const labelAnchor: [number, number] = [labelWidth / 2 - labelOffset[0], 15 - labelOffset[1]];

      const icon = leaflet.divIcon({
        className: `morrow-map-marker morrow-map-marker-${place.category}${place.id === "stay" ? " is-stay" : ""}${isCompact ? " is-compact" : ""}${isCluster ? " is-cluster" : ""}${useExpandedOffsets && isCompact && place.id !== "stay" ? " is-expanded-compact" : ""}${group.expanded ? " is-expanded-place" : ""}`,
        html: `<button type="button" aria-label="${escapeHtml(isCluster ? `${group.places.length} Orte öffnen` : `${place.name} öffnen`)}"><span></span><strong>${escapeHtml(markerLabel)}</strong></button>`,
        iconSize: isCompact ? compactSize : [labelWidth, 30],
        iconAnchor: isCompact ? compactAnchor : labelAnchor,
      });

      const marker = leaflet.marker([group.lat, group.lng], {
        icon,
        keyboard: true,
        zIndexOffset: place.id === "stay" ? -600 : compactIndex,
      });

      marker.on("add", () => {
        const element = marker.getElement();
        if (!element) return;
        element.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          handleSelect(group);
        });
        element.addEventListener("touchend", (event) => {
          event.preventDefault();
          event.stopPropagation();
          handleSelect(group);
        }, { passive: false });
      });

      marker
        .bindTooltip(isCluster ? `${group.places.length} Orte` : place.name, { direction: "top", offset: [0, -12] })
        .on("click", () => handleSelect(group))
        .addTo(markerLayer);
    });

    function fitVisiblePlaces(animate = true) {
      if (!map || !leaflet) return;
      if (validPlaces.length === 0) {
        map.setView([54.303, 8.641], 13, { animate });
        return;
      }

      if (validPlaces.length === 1) {
        map.setView([validPlaces[0].lat, validPlaces[0].lng], 14, { animate });
        return;
      }

      const bounds = leaflet.latLngBounds(validPlaces.map((place) => [place.lat, place.lng] as [number, number]));
      const isNarrow = map.getContainer().clientWidth < 520;
      map.fitBounds(bounds.pad(compactMarkers ? 0.42 : 0.18), {
        animate,
        maxZoom: compactMarkers ? (isNarrow ? 11 : 13) : 15,
        paddingTopLeft: isNarrow ? [36, 88] : [44, 72],
        paddingBottomRight: isNarrow ? [52, 76] : [72, 72],
      });
    }

    const fitKey = validPlaces.map((place) => `${place.id}:${place.lat}:${place.lng}`).join("|");
    if (lastFitKeyRef.current !== fitKey) {
      lastFitKeyRef.current = fitKey;
      fitVisiblePlaces();
    }

    const refitTimer = window.setTimeout(() => {
      map.invalidateSize();
      fitVisiblePlaces(false);
    }, 150);

    return () => window.clearTimeout(refitTimer);
  }, [compactMarkers, currentZoom, expandedClusterId, mapReady, onSelectPlace, validPlaces]);

  return <div ref={mapNode} className="guest-leaflet-map" aria-label="Interaktive Karte in Sankt Peter-Ording" />;
}
