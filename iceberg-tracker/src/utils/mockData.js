/**
 * Mock data generators for development and demo purposes.
 * In production these would be replaced by real sensor feeds.
 */
import { v4 as uuidv4 } from 'uuid';

const ANTARCTIC_CENTER = { lat: -64.5, lon: -60.0 }; // Near Antarctic Peninsula

/** Generate a set of sample icebergs scattered around the Antarctic Peninsula. */
export function generateSampleIcebergs(count = 8) {
  const categories = ['small', 'medium', 'large', 'very_large'];
  const icebergs = [];

  for (let i = 0; i < count; i++) {
    const lat = ANTARCTIC_CENTER.lat + (Math.random() - 0.5) * 6;
    const lon = ANTARCTIC_CENTER.lon + (Math.random() - 0.5) * 10;
    const sizeCategory = categories[Math.floor(Math.random() * categories.length)];
    const now = Date.now();

    // Create a short historical track (3-5 points over the last few hours)
    const trackLength = 3 + Math.floor(Math.random() * 3);
    const driftBearing = Math.random() * 360;
    const driftSpeed = 0.1 + Math.random() * 0.5; // knots
    const track = [];

    for (let t = trackLength - 1; t >= 0; t--) {
      const hoursAgo = t * 2;
      const dlat = -driftSpeed * hoursAgo * Math.cos(driftBearing * Math.PI / 180) / 60;
      const dlon = -driftSpeed * hoursAgo * Math.sin(driftBearing * Math.PI / 180) /
        (60 * Math.cos(lat * Math.PI / 180));
      track.push({
        lat: lat + dlat,
        lon: lon + dlon,
        timestamp: now - hoursAgo * 3600000,
      });
    }

    icebergs.push({
      id: uuidv4(),
      name: `ICB-${String(i + 1).padStart(3, '0')}`,
      lat,
      lon,
      sizeCategory,
      estimatedLengthM: sizeEstimate(sizeCategory),
      track,
      detectedAt: now - trackLength * 2 * 3600000,
      lastUpdated: now,
    });
  }

  return icebergs;
}

function sizeEstimate(category) {
  const ranges = {
    small: [15, 60],
    medium: [60, 200],
    large: [200, 500],
    very_large: [500, 2000],
  };
  const [min, max] = ranges[category] ?? [50, 100];
  return Math.round(min + Math.random() * (max - min));
}

/** Generate a sample ship position near the icebergs. */
export function generateSampleShip() {
  return {
    id: 'ship-1',
    name: 'RV Aurora',
    lat: ANTARCTIC_CENTER.lat + 0.5,
    lon: ANTARCTIC_CENTER.lon + 1.0,
    speedKnots: 8,
    bearingDeg: 210,
    heading: 210,
    lastUpdated: Date.now(),
  };
}

/** Default environmental conditions for the Antarctic Peninsula region. */
export function defaultEnvironment() {
  return {
    windSpeedKnots: 15 + Math.random() * 15,
    windBearingDeg: 250 + Math.random() * 40, // Prevailing westerlies
    currentSpeedKnots: 0.2 + Math.random() * 0.3,
    currentBearingDeg: 30 + Math.random() * 60, // Antarctic Circumpolar Current
    waterTempC: -1.8 + Math.random() * 2,
    visibility: ['good', 'moderate', 'poor'][Math.floor(Math.random() * 3)],
  };
}
