import { DeliveryZone, ZoneVerificationResult } from "./supabase/types";

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula in kilometers.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Verifies if a given coordinate falls inside any active delivery zone.
 */
export function verifyDeliveryLocation(
  lat: number,
  lng: number,
  zones: DeliveryZone[]
): ZoneVerificationResult {
  const activeZones = zones.filter((z) => z.is_active);

  if (activeZones.length === 0) {
    return {
      isValid: false,
      zone: null,
      distanceKm: 0,
      errorMessage: "No active delivery zones are currently operational.",
    };
  }

  let matchingZone: DeliveryZone | null = null;
  let minDistanceKm = Infinity;

  // Track the nearest zone regardless of whether the point is inside
  let nearestZone: DeliveryZone = activeZones[0];
  let distanceToNearestCenterKm = Infinity;

  for (const zone of activeZones) {
    const distanceKm = calculateHaversineDistance(
      lat,
      lng,
      zone.center_lat,
      zone.center_lng
    );

    if (distanceKm < distanceToNearestCenterKm) {
      distanceToNearestCenterKm = distanceKm;
      nearestZone = zone;
    }

    if (distanceKm <= zone.radius_km) {
      if (!matchingZone || distanceKm < minDistanceKm) {
        matchingZone = zone;
        minDistanceKm = distanceKm;
      }
    }
  }

  if (matchingZone) {
    return {
      isValid: true,
      zone: matchingZone,
      distanceKm: Number(minDistanceKm.toFixed(2)),
    };
  }

  const excessDistance = distanceToNearestCenterKm - nearestZone.radius_km;
  const outsideBy = Math.max(0.1, Number(excessDistance.toFixed(2)));

  return {
    isValid: false,
    zone: null,
    distanceKm: Number(distanceToNearestCenterKm.toFixed(2)),
    nearestZone,
    distanceToNearestKm: outsideBy,
    errorMessage: `Selected location is outside all delivery zones (${outsideBy} km outside "${nearestZone.name}"). Order cannot be accepted.`,
  };
}

/**
 * Formats distance with appropriate unit (m or km)
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(2)} km`;
}
