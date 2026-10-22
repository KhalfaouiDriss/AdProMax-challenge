"use client";

import React, { useEffect, useRef, useState } from "react";
import { DeliveryZone, Order } from "@/lib/supabase/types";
import { Search, MapPin, LocateFixed, AlertCircle } from "lucide-react";

interface InteractiveMapProps {
  zones: DeliveryZone[];
  orders?: Order[];
  selectedZoneId?: string | null;
  onSelectLocation?: (lat: number, lng: number, address?: string) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  previewZone?: { lat: number; lng: number; radiusKm: number; color: string } | null;
  isSelectingLocation?: boolean;
  isPickingZoneCenter?: boolean;
  height?: string;
  zoom?: number;
}

export default function InteractiveMap({
  zones,
  orders = [],
  selectedZoneId,
  onSelectLocation,
  selectedLocation,
  previewZone,
  isSelectingLocation = false,
  isPickingZoneCenter = false,
  height,
  zoom = 12,
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const zonesLayerRef = useRef<any>(null);
  const ordersLayerRef = useRef<any>(null);
  const previewLayerRef = useRef<any>(null);
  const locationMarkerRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialLat = zones[0]?.center_lat || 48.8566;
      const initialLng = zones[0]?.center_lng || 2.3522;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      zonesLayerRef.current = L.layerGroup().addTo(map);
      ordersLayerRef.current = L.layerGroup().addTo(map);
      previewLayerRef.current = L.layerGroup().addTo(map);

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        if (onSelectLocation) {
          let resolvedAddress = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          try {
            const resp = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              { headers: { "Accept-Language": "en" } }
            );
            if (resp.ok) {
              const data = await resp.json();
              if (data.display_name) {
                resolvedAddress = data.display_name.split(",").slice(0, 3).join(",");
              }
            }
          } catch {
            // ignore network failure
          }
          onSelectLocation(lat, lng, resolvedAddress);
        }
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Zones Layer
  useEffect(() => {
    async function renderZones() {
      if (!mapInstanceRef.current || !zonesLayerRef.current) return;
      const L = (await import("leaflet")).default;

      zonesLayerRef.current.clearLayers();

      zones.forEach((zone) => {
        if (!zone.is_active) return;
        const isSelected = selectedZoneId === zone.id;

        const circle = L.circle([zone.center_lat, zone.center_lng], {
          radius: zone.radius_km * 1000,
          color: zone.color || "#7a3dff",
          fillColor: zone.color || "#7a3dff",
          fillOpacity: isSelected ? 0.35 : 0.18,
          weight: isSelected ? 3 : 1.5,
          dashArray: isSelected ? undefined : "4, 6",
        });

        const popupContent = `
          <div style="padding: 2px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
              <span style="display:inline-block; width:9px; height:9px; border-radius:50%; background-color:${zone.color};"></span>
              <strong style="font-size: 13px; color: #080808;">${zone.name}</strong>
            </div>
            <p style="margin: 0 0 4px 0; color: #5a5a5a; font-size: 11px;">${zone.description || "Active Delivery Sector"}</p>
            <div style="font-size: 11px; color: #222; font-weight: 500;">
              Radius: <strong>${zone.radius_km} km</strong>
            </div>
          </div>
        `;

        circle.bindPopup(popupContent);
        circle.addTo(zonesLayerRef.current);

        const centerMarker = L.circleMarker([zone.center_lat, zone.center_lng], {
          radius: 5,
          color: "#ffffff",
          fillColor: zone.color || "#7a3dff",
          fillOpacity: 1,
          weight: 2,
        });
        centerMarker.bindPopup(`<strong>${zone.name}</strong>`);
        centerMarker.addTo(zonesLayerRef.current);
      });
    }

    renderZones();
  }, [zones, selectedZoneId]);

  // Update Preview Zone
  useEffect(() => {
    async function renderPreview() {
      if (!mapInstanceRef.current || !previewLayerRef.current) return;
      const L = (await import("leaflet")).default;

      previewLayerRef.current.clearLayers();

      if (previewZone) {
        const previewCircle = L.circle([previewZone.lat, previewZone.lng], {
          radius: previewZone.radiusKm * 1000,
          color: previewZone.color || "#7a3dff",
          fillColor: previewZone.color || "#7a3dff",
          fillOpacity: 0.28,
          weight: 2,
        });

        const previewMarker = L.circleMarker([previewZone.lat, previewZone.lng], {
          radius: 7,
          color: "#080808",
          fillColor: previewZone.color || "#7a3dff",
          fillOpacity: 1,
          weight: 2,
        });

        previewCircle.addTo(previewLayerRef.current);
        previewMarker.addTo(previewLayerRef.current);
      }
    }

    renderPreview();
  }, [previewZone]);

  // Update Selected Customer Location Pin
  useEffect(() => {
    async function updatePin() {
      if (!mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;

      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current = null;
      }

      if (selectedLocation) {
        const customIcon = L.divIcon({
          className: "custom-delivery-pin",
          html: `
            <div style="
              background-color: #080808;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              border: 2px solid white;
            ">
              <div style="transform: rotate(45deg); font-size: 13px;">📍</div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });

        const marker = L.marker([selectedLocation.lat, selectedLocation.lng], {
          icon: customIcon,
          zIndexOffset: 1000,
        }).addTo(mapInstanceRef.current);

        marker.bindPopup("<strong>Delivery Address</strong>").openPopup();
        locationMarkerRef.current = marker;
      }
    }

    updatePin();
  }, [selectedLocation]);

  // Update Orders Layer
  useEffect(() => {
    async function renderOrders() {
      if (!mapInstanceRef.current || !ordersLayerRef.current) return;
      const L = (await import("leaflet")).default;

      ordersLayerRef.current.clearLayers();

      orders.slice(0, 15).forEach((order) => {
        const statusColors: Record<string, string> = {
          delivered: "#00d722",
          out_for_delivery: "#ff6b00",
          confirmed: "#3b89ff",
          pending: "#7a3dff",
          cancelled: "#ee1d36",
        };
        const color = statusColors[order.status] || "#080808";

        const orderMarker = L.circleMarker([order.delivery_lat, order.delivery_lng], {
          radius: 5,
          color: "#ffffff",
          fillColor: color,
          fillOpacity: 1,
          weight: 2,
        });

        orderMarker.bindPopup(`
          <div style="padding: 2px;">
            <div style="font-weight: 600; color: #080808; font-size: 12px;">${order.customer_name}</div>
            <div style="color: #5a5a5a; font-size: 11px;">${order.customer_address}</div>
            <div style="font-weight: 700; font-size: 12px; margin-top: 2px;">$${order.total_amount.toFixed(2)}</div>
          </div>
        `);

        orderMarker.addTo(ordersLayerRef.current);
      });
    }

    renderOrders();
  }, [orders]);

  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await resp.json();

      if (data && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        mapInstanceRef.current.setView([lat, lng], 14, { animate: true });

        if (onSelectLocation) {
          const cleanAddress = item.display_name.split(",").slice(0, 3).join(",");
          onSelectLocation(lat, lng, cleanAddress);
        }
      } else {
        setSearchError("No geographic matches found.");
      }
    } catch {
      setSearchError("Search temporarily unavailable.");
    } finally {
      setIsSearching(false);
    }
  };

  const locateUser = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.setView([latitude, longitude], 14, { animate: true });
        if (onSelectLocation) {
          onSelectLocation(latitude, longitude, "Current Location");
        }
      },
      (err) => {
        console.warn("Geolocation error:", err);
      }
    );
  };

  return (
    <div className="relative w-full rounded-md overflow-hidden border border-[#d8d8d8] bg-neutral-100 shadow-sm">
      {/* Top Search & Action Bar */}
      <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-[400] flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        <form
          onSubmit={handleAddressSearch}
          className="flex-1 flex items-center bg-white border border-[#d8d8d8] rounded-[4px] px-2.5 py-1.5 shadow-md focus-within:border-[#080808]"
        >
          <Search className="w-3.5 h-3.5 text-[#898989] mr-1.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or district..."
            className="w-full text-xs sm:text-sm bg-transparent outline-none text-[#080808] placeholder:text-[#ababab]"
          />
          {isSearching && (
            <span className="text-[10px] text-[#898989] animate-pulse">Searching...</span>
          )}
        </form>

        <button
          type="button"
          onClick={locateUser}
          title="Locate my position"
          className="p-2 bg-white text-[#080808] border border-[#d8d8d8] rounded-[4px] shadow-md hover:bg-neutral-50 flex items-center justify-center shrink-0"
        >
          <LocateFixed className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Instruction Pill */}
      {(isSelectingLocation || isPickingZoneCenter) && (
        <div className="absolute top-12 sm:top-14 left-2 right-2 z-[400] pointer-events-none flex justify-center">
          <div className="bg-[#080808] text-white text-[11px] sm:text-xs px-3 py-1 rounded-[4px] shadow-lg flex items-center gap-1.5 border border-neutral-700 max-w-[90%] truncate">
            <MapPin className="w-3 h-3 text-[#3b89ff] shrink-0" />
            <span className="truncate">
              {isPickingZoneCenter
                ? "Tap map to set zone center coordinate"
                : "Tap map to pick delivery address pin"}
            </span>
          </div>
        </div>
      )}

      {/* Search Error Alert */}
      {searchError && (
        <div className="absolute top-12 left-2 right-2 z-[400] flex justify-center">
          <div className="bg-[#fff0f1] text-[#ee1d36] border border-[#ffd0d5] text-[11px] px-2.5 py-1 rounded-[4px] shadow flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{searchError}</span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height: height || undefined }}
        className={height ? "" : "h-[300px] sm:h-[420px] lg:h-[500px] w-full"}
      />

      {/* Bottom Legend */}
      <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 z-[400] flex items-center justify-between gap-2 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-sm border border-[#d8d8d8] rounded-[4px] px-2.5 py-1 shadow-sm text-[11px] flex items-center gap-2.5 pointer-events-auto">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#7a3dff]" />
            <span className="text-[#363636] font-medium">{zones.length} Zones</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00d722]" />
            <span className="text-[#363636] font-medium">{orders.length} Orders</span>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm border border-[#d8d8d8] rounded-[4px] px-2 py-0.5 text-[10px] text-[#5a5a5a] shadow-sm pointer-events-auto">
          OSM &bull; Leaflet
        </div>
      </div>
    </div>
  );
}
