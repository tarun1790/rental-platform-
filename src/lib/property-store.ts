// =========================================================================
// HOUSE INTELLIGENCE - Dynamic Property Registry & Storage Service
// Maintains unified access to static catalog and live crawled properties
// =========================================================================

import { ShikaakPropertyListing } from '../types/property';
import { CHICAGO_LISTINGS } from '../data/chicago-listings';

// In-memory registry for fast access
const dynamicPropertiesMap = new Map<string, ShikaakPropertyListing>();

const STORAGE_KEY_PREFIX = 'shikaak_dyn_prop_';
const REGISTRY_INDEX_KEY = 'shikaak_dyn_prop_ids';

/**
 * Registers newly crawled or generated listings into memory and session storage
 */
export function registerDynamicProperties(properties: ShikaakPropertyListing[]): void {
  if (!properties || properties.length === 0) return;

  const storedIds: string[] = [];

  for (const prop of properties) {
    dynamicPropertiesMap.set(prop.id, prop);
    storedIds.push(prop.id);

    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem(`${STORAGE_KEY_PREFIX}${prop.id}`, JSON.stringify(prop));
      } catch (e) {
        // Storage quota protection
      }
    }
  }

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const existingRaw = window.sessionStorage.getItem(REGISTRY_INDEX_KEY);
      const existing: string[] = existingRaw ? JSON.parse(existingRaw) : [];
      const merged = Array.from(new Set([...existing, ...storedIds]));
      window.sessionStorage.setItem(REGISTRY_INDEX_KEY, JSON.stringify(merged));
    } catch (e) {
      // Storage quota protection
    }
  }
}

/**
 * Retrieves a property by its ID across static listings, memory, and session storage
 */
export function getPropertyById(id: string): ShikaakPropertyListing | undefined {
  if (!id) return undefined;

  // 1. Check in-memory dynamic registry
  if (dynamicPropertiesMap.has(id)) {
    return dynamicPropertiesMap.get(id);
  }

  // 2. Check static Chicago listings
  const staticMatch = CHICAGO_LISTINGS.find((p) => p.id === id);
  if (staticMatch) return staticMatch;

  // 3. Check browser sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const raw = window.sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
      if (raw) {
        const parsed = JSON.parse(raw) as ShikaakPropertyListing;
        dynamicPropertiesMap.set(id, parsed);
        return parsed;
      }
    } catch (e) {
      // JSON parse fallback
    }
  }

  return undefined;
}

/**
 * Returns all active properties (static + dynamic)
 */
export function getAllProperties(): ShikaakPropertyListing[] {
  const dynamicList: ShikaakPropertyListing[] = [];

  if (typeof window !== 'undefined' && window.sessionStorage) {
    try {
      const indexRaw = window.sessionStorage.getItem(REGISTRY_INDEX_KEY);
      if (indexRaw) {
        const ids: string[] = JSON.parse(indexRaw);
        for (const id of ids) {
          const prop = getPropertyById(id);
          if (prop) dynamicList.push(prop);
        }
      }
    } catch (e) {
      // Fallback
    }
  }

  // Deduplicate against static listings
  const existingIds = new Set(CHICAGO_LISTINGS.map((p) => p.id));
  const uniqueDynamic = dynamicList.filter((p) => !existingIds.has(p.id));

  return [...uniqueDynamic, ...CHICAGO_LISTINGS];
}
