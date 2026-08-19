// =========================================================================
// Shikaak Platform - Geospatial & Scribble Polygon Utility
// =========================================================================

import { GeoCoordinate } from '../types/property';

/**
 * Evaluates whether a target coordinate point lies strictly within a closed polygon boundary.
 * Implements the standard Jordan Curve / Ray-casting algorithm for OGC EPSG:4326.
 */
export function isPointInsidePolygon(point: GeoCoordinate, polygon: GeoCoordinate[]): boolean {
  if (polygon.length < 3) return false;

  let inside = false;
  const x = point.longitude;
  const y = point.latitude;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].longitude;
    const yi = polygon[i].latitude;
    const xj = polygon[j].longitude;
    const yj = polygon[j].latitude;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculates distance in miles between two coordinates via Haversine formula
 */
export function calculateDistanceMiles(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Generates an isochrone travel boundary polygon for a given commute mode & minutes
 */
export function generateIsochroneRing(
  center: GeoCoordinate,
  minutes: number,
  mode: 'DRIVING' | 'TRANSIT' | 'BICYCLING' | 'WALKING'
): GeoCoordinate[] {
  // Approximate average speeds in MPH for Chicago urban grid
  const speedMphMap = {
    DRIVING: 18,     // Urban traffic
    TRANSIT: 14,     // CTA Bus / L train with stops
    BICYCLING: 10,   // Chicago Lakefront / bike lanes
    WALKING: 3.1,    // Pedestrian average
  };

  const speedMph = speedMphMap[mode] || 15;
  const maxMiles = (speedMph * minutes) / 60;

  // Approximate miles to degrees lat/lon in Chicago (~41.9° N)
  const latRadiusDeg = maxMiles / 69.0;
  const lonRadiusDeg = maxMiles / 51.5;

  const points: GeoCoordinate[] = [];
  const segments = 32;

  for (let i = 0; i <= segments; i++) {
    const angle = (i * 2 * Math.PI) / segments;
    // Add realistic urban asymmetry & Lake Michigan barrier (east of longitude -87.61 is water)
    const wave = 1 + 0.12 * Math.sin(angle * 4);
    let lat = center.latitude + latRadiusDeg * Math.sin(angle) * wave;
    let lon = center.longitude + lonRadiusDeg * Math.cos(angle) * wave;

    // Lake Michigan cutoff clamp
    if (lon > -87.60) {
      lon = -87.60;
    }

    points.push({ latitude: lat, longitude: lon });
  }

  return points;
}
