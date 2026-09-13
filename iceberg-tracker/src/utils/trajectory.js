/**
 * Trajectory prediction engine for icebergs.
 *
 * Uses a simplified physics model:
 *  - Ocean current drift (dominant force, ~2% of wind speed at 20-40° right of wind in Southern Hemisphere)
 *  - Wind drag on the above-water portion (~1-3% of wind speed)
 *  - Coriolis deflection (leftward in the Southern Hemisphere)
 *  - Linear extrapolation from observed velocity when no environmental data is available
 *
 * All coordinates are in decimal degrees (WGS-84).
 * Distances / speeds are in nautical miles (nmi) and knots internally.
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EARTH_RADIUS_NMI = 3440.065; // nautical miles

// --- helpers ----------------------------------------------------------------

/** Haversine distance between two points in nautical miles. */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * DEG_TO_RAD;
  const dLon = (lon2 - lon1) * DEG_TO_RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * DEG_TO_RAD) *
      Math.cos(lat2 * DEG_TO_RAD) *
      Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_NMI * Math.asin(Math.sqrt(a));
}

/** Bearing from point 1 to point 2 in degrees (0 = north, clockwise). */
export function bearing(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * DEG_TO_RAD;
  const φ2 = lat2 * DEG_TO_RAD;
  const Δλ = (lon2 - lon1) * DEG_TO_RAD;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * RAD_TO_DEG) + 360) % 360;
}

/** Move a point by a given distance (nmi) and bearing (degrees). */
export function destinationPoint(lat, lon, distanceNmi, bearingDeg) {
  const δ = distanceNmi / EARTH_RADIUS_NMI;
  const θ = bearingDeg * DEG_TO_RAD;
  const φ1 = lat * DEG_TO_RAD;
  const λ1 = lon * DEG_TO_RAD;

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );

  return { lat: φ2 * RAD_TO_DEG, lon: λ2 * RAD_TO_DEG };
}

// --- observed velocity ------------------------------------------------------

/**
 * Compute velocity (speed in knots, bearing in degrees) from the last two
 * recorded positions of an iceberg.
 */
export function observedVelocity(track) {
  if (!track || track.length < 2) return null;
  const a = track[track.length - 2];
  const b = track[track.length - 1];
  const dt = (b.timestamp - a.timestamp) / 3600000; // hours
  if (dt <= 0) return null;
  const dist = haversineDistance(a.lat, a.lon, b.lat, b.lon);
  return {
    speedKnots: dist / dt,
    bearing: bearing(a.lat, a.lon, b.lat, b.lon),
  };
}

// --- drift model ------------------------------------------------------------

/**
 * Estimate iceberg drift vector from environmental conditions.
 *
 * @param {object} env - { windSpeedKnots, windBearingDeg, currentSpeedKnots, currentBearingDeg }
 * @returns {{ speedKnots: number, bearing: number }}
 */
export function driftVector(env = {}) {
  const {
    windSpeedKnots = 10,
    windBearingDeg = 180,
    currentSpeedKnots = 0.3,
    currentBearingDeg = 90,
  } = env;

  // Wind drag: ~2% of wind speed
  const windDriftSpeed = windSpeedKnots * 0.02;
  // In Southern Hemisphere, Ekman drift is ~20-40° LEFT of wind direction
  const windDriftBearing = (windBearingDeg - 30 + 360) % 360;

  // Resolve into x/y components (east, north)
  const wx = windDriftSpeed * Math.sin(windDriftBearing * DEG_TO_RAD);
  const wy = windDriftSpeed * Math.cos(windDriftBearing * DEG_TO_RAD);
  const cx = currentSpeedKnots * Math.sin(currentBearingDeg * DEG_TO_RAD);
  const cy = currentSpeedKnots * Math.cos(currentBearingDeg * DEG_TO_RAD);

  const tx = wx + cx;
  const ty = wy + cy;
  const speed = Math.sqrt(tx * tx + ty * ty);
  const bear = (Math.atan2(tx, ty) * RAD_TO_DEG + 360) % 360;

  return { speedKnots: speed, bearing: bear };
}

// --- prediction -------------------------------------------------------------

/**
 * Predict future positions of an iceberg.
 *
 * @param {object} iceberg    - { lat, lon, track, sizeCategory }
 * @param {object} [env]      - environmental conditions (see driftVector)
 * @param {number[]} horizons - prediction horizons in hours (default: [1,6,24,72])
 * @returns {Array<{ hours, lat, lon, uncertainty }>}
 */
export function predictTrajectory(
  iceberg,
  env = null,
  horizons = [1, 6, 24, 72]
) {
  // Try observed velocity first
  const obs = observedVelocity(iceberg.track);

  // Fall back to environmental drift model
  const drift = env ? driftVector(env) : null;

  // Blend: if we have observations, weight them 70 / 30 with drift model;
  // otherwise use drift model alone.
  let speedKnots, bearingDeg;
  if (obs && drift) {
    speedKnots = obs.speedKnots * 0.7 + drift.speedKnots * 0.3;
    bearingDeg = blendBearing(obs.bearing, drift.bearing, 0.7);
  } else if (obs) {
    speedKnots = obs.speedKnots;
    bearingDeg = obs.bearing;
  } else if (drift) {
    speedKnots = drift.speedKnots;
    bearingDeg = drift.bearing;
  } else {
    // Default gentle northward drift typical of Antarctic icebergs
    speedKnots = 0.3;
    bearingDeg = 0;
  }

  // Size-based speed modifier (larger icebergs move slower)
  const sizeFactor = sizeSpeedFactor(iceberg.sizeCategory);
  speedKnots *= sizeFactor;

  return horizons.map((h) => {
    const dist = speedKnots * h;
    const pos = destinationPoint(iceberg.lat, iceberg.lon, dist, bearingDeg);
    // Uncertainty grows with time — roughly ±15% of distance per hour
    const uncertainty = dist * 0.15;
    return { hours: h, ...pos, uncertaintyNmi: uncertainty };
  });
}

/** Blend two bearings with a weight towards the first. */
function blendBearing(b1, b2, w) {
  const x = w * Math.sin(b1 * DEG_TO_RAD) + (1 - w) * Math.sin(b2 * DEG_TO_RAD);
  const y = w * Math.cos(b1 * DEG_TO_RAD) + (1 - w) * Math.cos(b2 * DEG_TO_RAD);
  return (Math.atan2(x, y) * RAD_TO_DEG + 360) % 360;
}

/** Larger icebergs are affected more by currents and less by wind → slower surface speed. */
function sizeSpeedFactor(category = 'medium') {
  const factors = { small: 1.2, medium: 1.0, large: 0.8, very_large: 0.6 };
  return factors[category] ?? 1.0;
}

// --- collision risk ---------------------------------------------------------

/**
 * Compute collision risk between a ship and an iceberg.
 *
 * @param {object} ship    - { lat, lon, speedKnots, bearingDeg }
 * @param {object} iceberg - { lat, lon, track, sizeCategory }
 * @param {object} [env]   - environmental conditions
 * @returns {{ level: string, distanceNmi: number, closestApproachHours: number | null }}
 */
export function collisionRisk(ship, iceberg, env = null) {
  const dist = haversineDistance(ship.lat, ship.lon, iceberg.lat, iceberg.lon);
  const predictions = predictTrajectory(iceberg, env, [1, 3, 6, 12, 24]);

  // Find closest predicted approach
  let minDist = dist;
  let minHours = 0;
  for (const p of predictions) {
    // Simple: project ship position at same time
    const shipPos = destinationPoint(
      ship.lat,
      ship.lon,
      ship.speedKnots * p.hours,
      ship.bearingDeg
    );
    const d = haversineDistance(shipPos.lat, shipPos.lon, p.lat, p.lon);
    if (d < minDist) {
      minDist = d;
      minHours = p.hours;
    }
  }

  let level;
  if (minDist < 1) level = 'critical';       // < 1 nmi
  else if (minDist < 5) level = 'high';       // < 5 nmi
  else if (minDist < 15) level = 'moderate';  // < 15 nmi
  else level = 'low';

  return {
    level,
    distanceNmi: Math.round(minDist * 100) / 100,
    closestApproachHours: minHours,
  };
}
