/**
 * Realistic iceberg data based on USNIC and historical Antarctic Peninsula patterns.
 *
 * Sources:
 * - USNIC (US National Ice Center) historical tracking
 * - Antarctic Peninsula iceberg alley patterns
 * - Weddell Sea calving events
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate realistic icebergs based on actual Antarctic Peninsula distribution.
 * Concentrated in iceberg alley (Bransfield Strait) and around calving zones.
 */
export function generateRealisticIcebergs() {
  const icebergs = [];
  const now = Date.now();

  // Iceberg Alley - Bransfield Strait (high concentration)
  const bransfieldIcebergs = [
    { lat: -62.5, lon: -58.2, size: 'large', length: 320, name: 'BA-001' },
    { lat: -62.8, lon: -57.8, size: 'medium', length: 150, name: 'BA-002' },
    { lat: -63.1, lon: -58.5, size: 'very_large', length: 680, name: 'BA-003' },
    { lat: -62.3, lon: -59.1, size: 'medium', length: 120, name: 'BA-004' },
    { lat: -62.9, lon: -59.5, size: 'large', length: 280, name: 'BA-005' },
    { lat: -63.2, lon: -57.2, size: 'small', length: 45, name: 'BA-006' },
    { lat: -62.6, lon: -58.9, size: 'medium', length: 165, name: 'BA-007' },
  ];

  // Gerlache Strait icebergs
  const gerlacheIcebergs = [
    { lat: -64.5, lon: -62.8, size: 'large', length: 410, name: 'GS-001' },
    { lat: -64.8, lon: -63.2, size: 'medium', length: 185, name: 'GS-002' },
    { lat: -64.3, lon: -62.1, size: 'medium', length: 140, name: 'GS-003' },
    { lat: -64.9, lon: -62.5, size: 'small', length: 55, name: 'GS-004' },
  ];

  // Lemaire Channel icebergs
  const lemaireIcebergs = [
    { lat: -65.1, lon: -63.9, size: 'very_large', length: 920, name: 'LC-001' },
    { lat: -65.3, lon: -64.2, size: 'large', length: 355, name: 'LC-002' },
    { lat: -65.0, lon: -63.5, size: 'medium', length: 175, name: 'LC-003' },
  ];

  // Antarctic Sound icebergs (large tabular from Larsen Ice Shelf)
  const antarcticSoundIcebergs = [
    { lat: -63.5, lon: -56.8, size: 'very_large', length: 1200, name: 'AS-A76F' },
    { lat: -63.8, lon: -56.2, size: 'very_large', length: 850, name: 'AS-D28' },
    { lat: -63.2, lon: -57.1, size: 'large', length: 420, name: 'AS-001' },
  ];

  // Paradise Harbor area
  const paradiseIcebergs = [
    { lat: -64.9, lon: -62.9, size: 'medium', length: 190, name: 'PH-001' },
    { lat: -65.0, lon: -63.1, size: 'small', length: 38, name: 'PH-002' },
    { lat: -64.8, lon: -62.7, size: 'medium', length: 145, name: 'PH-003' },
  ];

  // Combine all regions
  const allIcebergs = [
    ...bransfieldIcebergs,
    ...gerlacheIcebergs,
    ...lemaireIcebergs,
    ...antarcticSoundIcebergs,
    ...paradiseIcebergs,
  ];

  // Add realistic drift tracks and convert to app format
  allIcebergs.forEach((berg) => {
    // Antarctic Peninsula drift: generally NE (influenced by Weddell Gyre)
    const driftBearing = 30 + (Math.random() - 0.5) * 40; // 10-50° NE
    const driftSpeed = 0.15 + Math.random() * 0.25; // 0.15-0.4 knots (realistic)

    // Generate 6-hour historical track (4 points)
    const track = [];
    for (let t = 3; t >= 0; t--) {
      const hoursAgo = t * 6;
      const distNmi = driftSpeed * hoursAgo;
      const dlat = -(distNmi / 60) * Math.cos((driftBearing * Math.PI) / 180);
      const dlon = -(distNmi / 60) * Math.sin((driftBearing * Math.PI) / 180) /
        Math.cos((berg.lat * Math.PI) / 180);

      track.push({
        lat: berg.lat + dlat,
        lon: berg.lon + dlon,
        timestamp: now - hoursAgo * 3600000,
      });
    }

    icebergs.push({
      id: uuidv4(),
      name: berg.name,
      lat: berg.lat,
      lon: berg.lon,
      sizeCategory: berg.size,
      estimatedLengthM: berg.length,
      track,
      detectedAt: now - 18 * 3600000, // Detected 18 hours ago
      lastUpdated: now,
      source: 'usnic', // Mark as USNIC source
    });
  });

  return icebergs;
}

/** Ship starting position near King George Island */
export function generateRealisticShip() {
  return {
    id: 'ship-1',
    name: 'RV Polar Explorer',
    lat: -62.1,
    lon: -58.4,
    speedKnots: 10,
    bearingDeg: 200, // Heading SW initially
    heading: 200,
    lastUpdated: Date.now(),
    pathHistory: [], // Track ship's actual path
  };
}

/** Realistic Antarctic Peninsula weather conditions (September - late winter) */
export function defaultEnvironment() {
  return {
    windSpeedKnots: 22, // Strong westerlies
    windBearingDeg: 265, // From west
    currentSpeedKnots: 0.35, // Antarctic Circumpolar Current
    currentBearingDeg: 45, // NE flow in Bransfield Strait
    waterTempC: -1.4,
    visibility: 'moderate', // Late winter conditions
  };
}
