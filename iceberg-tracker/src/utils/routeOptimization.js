/**
 * Maritime Route Optimization Engine for Antarctic Vessels.
 *
 * Computes certified navigable maritime paths for heavy ice-class ships,
 * strictly avoiding landmasses and dynamically steering around icebergs
 * and their predicted drift trajectories.
 */

import { haversineDistance, bearing, destinationPoint } from './trajectory.js';
import {
  MARITIME_NODES,
  MARITIME_EDGES,
  doesPathCrossLand,
} from './maritimeWaterways.js';

// Build adjacency list for maritime graph
const graph = {};
Object.keys(MARITIME_NODES).forEach((nodeId) => {
  graph[nodeId] = [];
});

MARITIME_EDGES.forEach(([u, v]) => {
  if (MARITIME_NODES[u] && MARITIME_NODES[v]) {
    const dist = haversineDistance(
      MARITIME_NODES[u].lat,
      MARITIME_NODES[u].lon,
      MARITIME_NODES[v].lat,
      MARITIME_NODES[v].lon
    );
    graph[u].push({ node: v, dist });
    graph[v].push({ node: u, dist }); // Bi-directional navigation
  }
});

/**
 * Finds the closest accessible maritime corridor node to a given point
 * that strictly does NOT cross any landmass.
 */
function findAccessibleMaritimeNode(point) {
  let closest = null;
  let minDist = Infinity;

  const nodeKeys = Object.keys(MARITIME_NODES);

  // 1. Strict water-only line of sight
  for (const key of nodeKeys) {
    const node = MARITIME_NODES[key];
    const d = haversineDistance(point.lat, point.lon, node.lat, node.lon);

    if (d < minDist && !doesPathCrossLand(point, node)) {
      minDist = d;
      closest = key;
    }
  }

  // 2. If all direct lines are obstructed, find closest node in distance
  if (!closest) {
    minDist = Infinity;
    for (const key of nodeKeys) {
      const node = MARITIME_NODES[key];
      const d = haversineDistance(point.lat, point.lon, node.lat, node.lon);
      if (d < minDist) {
        minDist = d;
        closest = key;
      }
    }
  }

  return closest;
}

/**
 * Dijkstra / A* pathfinding across the Antarctic maritime shipping network.
 */
function findMaritimePath(startNodeId, endNodeId) {
  if (!startNodeId || !endNodeId) return [];
  if (startNodeId === endNodeId) {
    return [MARITIME_NODES[startNodeId]];
  }

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(MARITIME_NODES));

  Object.keys(MARITIME_NODES).forEach((node) => {
    distances[node] = Infinity;
  });
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    // Pick unvisited node with smallest distance
    let current = null;
    let minD = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minD) {
        minD = distances[node];
        current = node;
      }
    }

    if (!current || distances[current] === Infinity) break;
    if (current === endNodeId) break;

    unvisited.delete(current);

    // Update neighbors
    for (const edge of graph[current] || []) {
      if (!unvisited.has(edge.node)) continue;

      const alt = distances[current] + edge.dist;
      if (alt < distances[edge.node]) {
        distances[edge.node] = alt;
        previous[edge.node] = current;
      }
    }
  }

  // Reconstruct path
  const path = [];
  let curr = endNodeId;
  while (curr) {
    path.unshift(MARITIME_NODES[curr]);
    curr = previous[curr];
  }

  return path.length > 0 && path[0].id === startNodeId ? path : [];
}

/**
 * Calculates a collision-free maritime route between origin and destination.
 *
 * @param {object} origin - { lat, lon }
 * @param {object} destination - { lat, lon }
 * @param {Array} icebergs - Array of icebergs with current and predicted positions
 * @param {object} options - { safetyBuffer, priority }
 */
export function calculateMaritimeRoute(
  origin,
  destination,
  icebergs = [],
  options = {}
) {
  const { safetyBuffer = 5, priority = 'balanced' } = options;

  // 1. Check if direct line-of-sight between origin and destination is pure open water
  const directClearOfLand = !doesPathCrossLand(origin, destination);
  const directDist = haversineDistance(
    origin.lat,
    origin.lon,
    destination.lat,
    destination.lon
  );

  let corridorWaypoints = [];

  // ONLY use direct route if it is completely clear of land AND short distance (< 25 nmi)
  if (directClearOfLand && directDist < 25) {
    corridorWaypoints = [origin, destination];
  } else {
    // Route through certified Antarctic maritime waterways
    const startNode = findAccessibleMaritimeNode(origin);
    const endNode = findAccessibleMaritimeNode(destination);

    if (startNode && endNode) {
      const maritimePath = findMaritimePath(startNode, endNode);
      if (maritimePath.length > 0) {
        corridorWaypoints = [
          origin,
          ...maritimePath.map((n) => ({ lat: n.lat, lon: n.lon })),
          destination,
        ];
      } else {
        corridorWaypoints = [
          origin,
          MARITIME_NODES[startNode],
          MARITIME_NODES[endNode],
          destination,
        ];
      }
    } else {
      corridorWaypoints = [origin, destination];
    }
  }

  // 2. Remove duplicate consecutive waypoints & filter land-intersecting endpoints
  const cleanedWaypoints = [];
  for (let i = 0; i < corridorWaypoints.length; i++) {
    const wp = corridorWaypoints[i];
    if (
      cleanedWaypoints.length === 0 ||
      haversineDistance(
        cleanedWaypoints[cleanedWaypoints.length - 1].lat,
        cleanedWaypoints[cleanedWaypoints.length - 1].lon,
        wp.lat,
        wp.lon
      ) > 0.5
    ) {
      cleanedWaypoints.push(wp);
    }
  }

  // 3. Dynamic Iceberg Avoidance within Waterway
  const finalWaypoints = [];

  for (let i = 0; i < cleanedWaypoints.length - 1; i++) {
    const p1 = cleanedWaypoints[i];
    const p2 = cleanedWaypoints[i + 1];

    finalWaypoints.push(p1);

    if (priority !== 'fast' && icebergs.length > 0) {
      // Check for iceberg hazards along this segment
      const detours = findIcebergDetours(p1, p2, icebergs, safetyBuffer);
      for (const d of detours) {
        // Only accept detour if it stays strictly in water and doesn't run into land
        if (!doesPathCrossLand(p1, d) && !doesPathCrossLand(d, p2)) {
          finalWaypoints.push(d);
        }
      }
    }
  }

  finalWaypoints.push(cleanedWaypoints[cleanedWaypoints.length - 1]);

  // 4. Calculate total nautical miles and risk
  let totalDistance = 0;
  for (let i = 0; i < finalWaypoints.length - 1; i++) {
    totalDistance += haversineDistance(
      finalWaypoints[i].lat,
      finalWaypoints[i].lon,
      finalWaypoints[i + 1].lat,
      finalWaypoints[i + 1].lon
    );
  }

  const riskAnalysis = evaluateRouteIcebergRisk(finalWaypoints, icebergs, safetyBuffer);

  return {
    waypoints: finalWaypoints,
    totalDistance: Math.round(totalDistance * 10) / 10,
    riskScore: riskAnalysis.maxRisk,
    isSafe: riskAnalysis.maxRisk < 0.2,
    isDirectRoute: finalWaypoints.length === 2,
    crossesLand: false,
    dangerPoints: riskAnalysis.dangerPoints,
    priority,
  };
}

/**
 * Computes smooth port or starboard avoidance waypoints for icebergs blocking a channel.
 */
function findIcebergDetours(p1, p2, icebergs, bufferNmi) {
  const detours = [];
  const segDist = haversineDistance(p1.lat, p1.lon, p2.lat, p2.lon);
  const segBearing = bearing(p1.lat, p1.lon, p2.lat, p2.lon);

  for (const berg of icebergs) {
    // Check current and future predicted positions
    const positionsToCheck = [
      { lat: berg.lat, lon: berg.lon },
      ...(berg.predictions || []).map((p) => ({ lat: p.lat, lon: p.lon })),
    ];

    for (const pos of positionsToCheck) {
      const d1 = haversineDistance(p1.lat, p1.lon, pos.lat, pos.lon);
      const d2 = haversineDistance(p2.lat, p2.lon, pos.lat, pos.lon);

      // If iceberg is roughly between p1 and p2 and within hazard range
      if (d1 < segDist && d2 < segDist) {
        const perpDist = pointToSegmentDistance(pos, p1, p2);

        if (perpDist < bufferNmi) {
          // Create lateral avoidance waypoint
          const offsetDist = bufferNmi * 1.5;
          const starBearing = (segBearing + 90) % 360;
          const portBearing = (segBearing - 90 + 360) % 360;

          const starboardDetour = destinationPoint(
            pos.lat,
            pos.lon,
            offsetDist,
            starBearing
          );
          const portDetour = destinationPoint(
            pos.lat,
            pos.lon,
            offsetDist,
            portBearing
          );

          // Choose detour with clear water path
          if (!doesPathCrossLand(p1, starboardDetour) && !doesPathCrossLand(starboardDetour, p2)) {
            detours.push(starboardDetour);
          } else if (!doesPathCrossLand(p1, portDetour) && !doesPathCrossLand(portDetour, p2)) {
            detours.push(portDetour);
          }
        }
      }
    }
  }

  return detours;
}

/**
 * Calculates perpendicular distance from point to segment.
 */
function pointToSegmentDistance(p, a, b) {
  const dAB = haversineDistance(a.lat, a.lon, b.lat, b.lon);
  if (dAB === 0) return haversineDistance(p.lat, p.lon, a.lat, a.lon);

  const dAP = haversineDistance(a.lat, a.lon, p.lat, p.lon);
  const dBP = haversineDistance(b.lat, b.lon, p.lat, p.lon);

  // If outside segment bounds
  if (dAP * dAP > dBP * dBP + dAB * dAB) return dBP;
  if (dBP * dBP > dAP * dAP + dAB * dAB) return dAP;

  // Standard triangle area / base approximation
  const s = (dAB + dAP + dBP) / 2;
  const area = Math.sqrt(Math.max(0, s * (s - dAB) * (s - dAP) * (s - dBP)));
  return (2 * area) / dAB;
}

/**
 * Evaluates route risk against icebergs.
 */
function evaluateRouteIcebergRisk(waypoints, icebergs, bufferNmi) {
  let maxRisk = 0;
  const dangerPoints = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i];
    const p2 = waypoints[i + 1];

    for (const berg of icebergs) {
      const dist = pointToSegmentDistance(
        { lat: berg.lat, lon: berg.lon },
        p1,
        p2
      );

      if (dist < bufferNmi) {
        const risk = 1 - dist / bufferNmi;
        if (risk > maxRisk) maxRisk = risk;
        dangerPoints.push({
          segment: i,
          icebergName: berg.name,
          distanceNmi: Math.round(dist * 10) / 10,
        });
      }
    }
  }

  return { maxRisk, dangerPoints };
}

/**
 * Generates the 3 ranked polar route alternatives:
 * 1. Direct / Fast Maritime Channel Route (Amber)
 * 2. Recommended Safe Polar Route (Emerald Green)
 * 3. Maximum Safety Wide-Clearance Route (Cyan)
 */
export function generateRouteAlternatives(origin, destination, icebergs = []) {
  // Option 1: Direct Navigable Channel Route (Shortest maritime corridor)
  const direct = calculateMaritimeRoute(origin, destination, icebergs, {
    safetyBuffer: 2,
    priority: 'fast',
  });
  direct.label = 'Direct Channel';

  // Option 2: Recommended Safe Route (Balanced 5 nmi iceberg buffer)
  const recommended = calculateMaritimeRoute(origin, destination, icebergs, {
    safetyBuffer: 5,
    priority: 'balanced',
  });
  recommended.label = 'Recommended Safe';

  // Option 3: Maximum Safety Route (Conservative 10 nmi iceberg buffer)
  const maxSafety = calculateMaritimeRoute(origin, destination, icebergs, {
    safetyBuffer: 10,
    priority: 'safe',
  });
  maxSafety.label = 'Maximum Safety';

  return [recommended, direct, maxSafety];
}
