/**
 * Antarctic Maritime Navigable Waterways and Landmass Geometry.
 *
 * Designed for heavy polar icebreakers and research vessels (e.g. Polarstern,
 * RV Aurora Australis, RV Nathaniel B. Palmer, RRS Sir David Attenborough).
 *
 * Includes:
 *  1. Landmass collision polygons (Antarctic Peninsula mainland, Anvers, Brabant,
 *     Adelaide, Joinville, King George, Livingston, etc.).
 *  2. Canonical deep-water navigable shipping corridors (Drake Passage, Bransfield
 *     Strait, Gerlache Strait, Neumayer/Bismarck, Antarctic Sound, Marguerite Bay, etc.).
 *  3. Geometric intersection tests to guarantee routes never cross land.
 */

// ============================================================================
// 1. LANDMASS POLYGONS (Coordinates in [lat, lon])
// ============================================================================

export const ANTARCTIC_LANDMASSES = [
  {
    name: 'Antarctic Continental Ice Sheet Core (excludes coastal navigation zones and Ross/Weddell embayments)',
    // Carves out open waters of Weddell Sea, Ross Sea, Bellingshausen Sea, and coastal zones
    polygon: [
      [-78.5, -180.0],  // South of Ross Ice Shelf edge
      [-78.5, -165.0],
      [-74.0, -135.0],
      [-73.0, -100.0],
      [-72.0, -90.0],
      [-78.0, -60.0],   // Ronne-Filchner Ice Shelf (deep in Weddell Sea)
      [-78.0, -45.0],
      [-75.0, 0.0],
      [-72.0, 45.0],
      [-70.0, 90.0],
      [-69.0, 120.0],
      [-70.0, 140.0],
      [-72.0, 160.0],
      [-78.5, 165.0],   // Ross Sea west coast (McMurdo Sound approach clear)
      [-78.5, 180.0],
      [-78.5, -180.0],
    ],
  },
  {
    name: 'Antarctic Peninsula Mainland (Graham Land & Palmer Land)',
    // Tighter polygon - excludes Bransfield Strait, Gerlache Strait, and Antarctic Sound
    polygon: [
      [-63.45, -57.4],   // Trinity Peninsula north tip (land only)
      [-63.85, -58.7],
      [-64.2, -59.7],
      [-64.6, -61.0],
      [-65.1, -62.3],
      [-65.5, -63.3],
      [-66.0, -64.4],
      [-66.5, -65.3],
      [-67.1, -66.2],
      [-67.7, -66.9],
      [-68.3, -67.1],
      [-68.7, -66.8],   // Palmer Land south
      [-68.5, -64.2],   // East coast (Weddell side)
      [-67.5, -62.8],
      [-66.5, -61.3],
      [-65.5, -59.8],
      [-64.8, -58.3],
      [-64.2, -57.3],
      [-63.45, -57.4],
    ],
  },
  {
    name: 'Joinville & D\'Urville Islands Group',
    polygon: [
      [-63.15, -55.9],
      [-63.15, -55.3],
      [-63.45, -55.25],
      [-63.55, -56.1],
      [-63.35, -56.6],
      [-63.15, -55.9],
    ],
  },
  {
    name: 'James Ross & Seymour Island Group',
    polygon: [
      [-63.85, -57.6],
      [-63.9, -56.7],
      [-64.45, -56.6],
      [-64.45, -57.7],
      [-64.2, -58.0],
      [-63.85, -57.6],
    ],
  },
  {
    name: 'King George Island (land core only, excludes Maxwell Bay anchorage)',
    polygon: [
      [-61.85, -57.8],
      [-62.05, -57.7],
      [-62.15, -58.5],
      [-62.1, -59.0],
      [-61.88, -58.8],
      [-61.85, -57.8],
    ],
  },
  {
    name: 'Livingston & Greenwich Islands',
    polygon: [
      [-62.45, -59.7],
      [-62.5, -59.85],
      [-62.75, -60.8],
      [-62.65, -61.2],
      [-62.45, -60.3],
      [-62.45, -59.7],
    ],
  },
  {
    name: 'Brabant Island',
    polygon: [
      [-64.08, -62.5],
      [-64.08, -62.2],
      [-64.38, -62.22],
      [-64.4, -62.6],
      [-64.2, -62.7],
      [-64.08, -62.5],
    ],
  },
  {
    name: 'Anvers Island (land core only, excludes Palmer Station and Port Lockroy channels)',
    polygon: [
      [-64.48, -63.65],
      [-64.48, -63.25],
      [-64.7, -63.3],
      [-64.75, -63.6],
      [-64.75, -64.0],
      [-64.58, -64.1],
      [-64.48, -63.65],
    ],
  },
  {
    name: 'Adelaide Island (land core only, excludes Marguerite Bay and Rothera waters)',
    polygon: [
      [-66.95, -68.8],
      [-66.95, -68.35],
      [-67.45, -68.4],
      [-67.5, -68.9],
      [-67.15, -69.15],
      [-66.95, -68.8],
    ],
  },
  {
    name: 'Alexander Island',
    polygon: [
      [-69.1, -71.4],
      [-69.1, -69.0],
      [-71.7, -69.0],
      [-71.7, -74.0],
      [-70.7, -73.2],
      [-69.1, -71.4],
    ],
  },
];

// ============================================================================
// 2. NAVIGABLE MARITIME CORRIDORS & WATERWAY NETWORK NODES
// Deep-water channels certified for heavy ice-class polar vessels
// ============================================================================

export const MARITIME_NODES = {
  // Drake Passage Gateway Nodes (Deep Open Ocean)
  DRAKE_NORTH: { id: 'DRAKE_NORTH', lat: -56.5, lon: -65.0, name: 'North Drake Passage' },
  DRAKE_WEST: { id: 'DRAKE_WEST', lat: -58.0, lon: -67.0, name: 'West Drake Approach' },
  DRAKE_CENTRAL: { id: 'DRAKE_CENTRAL', lat: -59.5, lon: -63.0, name: 'Central Drake Deep Sea' },
  DRAKE_SOUTH: { id: 'DRAKE_SOUTH', lat: -61.0, lon: -60.0, name: 'South Drake Passage Entrance' },

  // South Shetland Ocean Approaches
  KGI_NORTH_FAIRWAY: { id: 'KGI_NORTH_FAIRWAY', lat: -61.5, lon: -58.0, name: 'King George North Oceanic Fairway' },
  KGI_WEST_APPROACH: { id: 'KGI_WEST_APPROACH', lat: -61.8, lon: -59.3, name: 'King George West Approach' },
  KGI_MAXWELL_BAY: { id: 'KGI_MAXWELL_BAY', lat: -62.2, lon: -58.7, name: 'Maxwell Bay Fairway' },
  NELSON_STRAIT: { id: 'NELSON_STRAIT', lat: -62.3, lon: -59.5, name: 'Nelson Strait Passage' },
  LIVINGSTON_NORTH: { id: 'LIVINGSTON_NORTH', lat: -62.1, lon: -60.5, name: 'Livingston North Offshore Lane' },
  BOYD_STRAIT: { id: 'BOYD_STRAIT', lat: -62.8, lon: -62.0, name: 'Boyd Strait Deep Channel' },

  // Bransfield Strait (Major 100km wide Deep Water Channel between South Shetlands & Mainland)
  BRANSFIELD_EAST: { id: 'BRANSFIELD_EAST', lat: -62.5, lon: -56.5, name: 'Bransfield Strait East Gateway' },
  BRANSFIELD_MID_EAST: { id: 'BRANSFIELD_MID_EAST', lat: -62.8, lon: -58.0, name: 'Bransfield Mid-East Central Channel' },
  BRANSFIELD_CENTER: { id: 'BRANSFIELD_CENTER', lat: -63.2, lon: -59.5, name: 'Bransfield Central Deep Waterway' },
  BRANSFIELD_MID_WEST: { id: 'BRANSFIELD_MID_WEST', lat: -63.5, lon: -61.0, name: 'Bransfield West Channel' },
  BRANSFIELD_WEST_GATEWAY: { id: 'BRANSFIELD_WEST_GATEWAY', lat: -63.8, lon: -62.5, name: 'Bransfield West Oceanic Gateway' },

  // Antarctic Sound (Gateway to Weddell Sea around Hope Bay)
  ANTARCTIC_SOUND_NORTH: { id: 'ANTARCTIC_SOUND_NORTH', lat: -63.15, lon: -56.9, name: 'Antarctic Sound North Entry' },
  ANTARCTIC_SOUND_HOPE: { id: 'ANTARCTIC_SOUND_HOPE', lat: -63.38, lon: -56.85, name: 'Hope Bay Channel' },
  ANTARCTIC_SOUND_SOUTH: { id: 'ANTARCTIC_SOUND_SOUTH', lat: -63.7, lon: -56.7, name: 'Antarctic Sound South Entrance' },
  WEDDELL_NORTH_FAIRWAY: { id: 'WEDDELL_NORTH_FAIRWAY', lat: -64.0, lon: -55.5, name: 'Weddell Sea Outer Fairway' },
  MARAMBIO_APPROACH: { id: 'MARAMBIO_APPROACH', lat: -64.15, lon: -56.3, name: 'Seymour/Marambio Fairway' },

  // Gerlache Strait (Major scenic deep passage between Danco Coast and Anvers/Brabant)
  GERLACHE_NORTH: { id: 'GERLACHE_NORTH', lat: -64.0, lon: -61.8, name: 'Gerlache Strait North Entrance' },
  GERLACHE_MID_NORTH: { id: 'GERLACHE_MID_NORTH', lat: -64.3, lon: -62.0, name: 'Gerlache Central North Corridor' },
  GERLACHE_CENTER: { id: 'GERLACHE_CENTER', lat: -64.6, lon: -62.4, name: 'Gerlache Central Channel' },
  PARADISE_BAY_APPROACH: { id: 'PARADISE_BAY_APPROACH', lat: -64.85, lon: -62.9, name: 'Paradise Harbor Entrance' },
  GERLACHE_SOUTH: { id: 'GERLACHE_SOUTH', lat: -64.85, lon: -63.3, name: 'Gerlache South / Schollaert Junction' },

  // Neumayer Channel & Bismarck Strait (Connection to Port Lockroy & Palmer)
  PORT_LOCKROY_APPROACH: { id: 'PORT_LOCKROY_APPROACH', lat: -64.83, lon: -63.55, name: 'Port Lockroy Deep Water Approach' },
  BISMARCK_STRAIT_EAST: { id: 'BISMARCK_STRAIT_EAST', lat: -64.9, lon: -63.8, name: 'Bismarck Strait East Channel' },
  PALMER_STATION_FAIRWAY: { id: 'PALMER_STATION_FAIRWAY', lat: -64.79, lon: -64.15, name: 'Palmer Station Fairway' },
  BISMARCK_STRAIT_WEST: { id: 'BISMARCK_STRAIT_WEST', lat: -64.9, lon: -64.6, name: 'Bismarck Strait Open Sea Entrance' },

  // Grandidier Channel & Penola Strait (To Vernadsky & South Peninsula)
  LEMAIRE_NORTH_ENTRY: { id: 'LEMAIRE_NORTH_ENTRY', lat: -65.05, lon: -63.85, name: 'Lemaire Channel North Approach' },
  LEMAIRE_SOUTH_ENTRY: { id: 'LEMAIRE_SOUTH_ENTRY', lat: -65.18, lon: -64.1, name: 'Lemaire South / Penola Strait' },
  VERNADSKY_APPROACH: { id: 'VERNADSKY_APPROACH', lat: -65.25, lon: -64.3, name: 'Vernadsky Fairway' },
  GRANDIDIER_CENTRAL: { id: 'GRANDIDIER_CENTRAL', lat: -65.6, lon: -64.9, name: 'Grandidier Channel Central Fairway' },
  GRANDIDIER_SOUTH: { id: 'GRANDIDIER_SOUTH', lat: -66.2, lon: -66.0, name: 'Grandidier South Channel' },

  // Bellingshausen Sea Outer Offshore Lane (Open Deep Ocean for West Transit)
  BELLINGSHAUSEN_NORTH: { id: 'BELLINGSHAUSEN_NORTH', lat: -64.2, lon: -64.5, name: 'Bellingshausen North Offshore Lane' },
  BELLINGSHAUSEN_MID: { id: 'BELLINGSHAUSEN_MID', lat: -65.5, lon: -66.5, name: 'Bellingshausen Mid Offshore Route' },
  BELLINGSHAUSEN_SOUTH: { id: 'BELLINGSHAUSEN_SOUTH', lat: -67.0, lon: -69.5, name: 'Bellingshausen South Deep Fairway' },

  // Marguerite Bay & Adelaide Island Corridor (To Rothera & San Martin)
  MARGUERITE_ENTRANCE: { id: 'MARGUERITE_ENTRANCE', lat: -67.6, lon: -69.0, name: 'Marguerite Bay Outer Entrance' },
  ROTHERA_APPROACH: { id: 'ROTHERA_APPROACH', lat: -67.58, lon: -68.18, name: 'Rothera Research Station Fairway' },
  SAN_MARTIN_APPROACH: { id: 'SAN_MARTIN_APPROACH', lat: -68.12, lon: -67.15, name: 'San Martin Station Anchorage' },

  // Ross Sea & McMurdo Route Gateways
  ROSS_SEA_ENTRY: { id: 'ROSS_SEA_ENTRY', lat: -73.0, lon: 175.0, name: 'Ross Sea Northern Fairway' },
  ROSS_ISLAND_APPROACH: { id: 'ROSS_ISLAND_APPROACH', lat: -77.5, lon: 167.5, name: 'Ross Island North Entrance' },
  MCMURDO_SOUND: { id: 'MCMURDO_SOUND', lat: -77.82, lon: 166.65, name: 'McMurdo Sound Ice Channel' },

  // Ushuaia & Beagle Channel Gateway
  BEAGLE_CHANNEL_EXIT: { id: 'BEAGLE_CHANNEL_EXIT', lat: -55.0, lon: -67.0, name: 'Beagle Channel East Exit' },
  CAPE_HORN_OCEANIC: { id: 'CAPE_HORN_OCEANIC', lat: -56.0, lon: -67.3, name: 'Cape Horn Oceanic Passage' },

  // Southern Ocean Circumnavigation Highway (Deep offshore belt around Antarctica)
  // Pacific Sector (Drake → Bellingshausen → Amundsen)
  SO_DRAKE_WEST: { id: 'SO_DRAKE_WEST', lat: -62.0, lon: -70.0, name: 'Southern Ocean Drake West Gate' },
  SO_BELLINGSHAUSEN_WEST: { id: 'SO_BELLINGSHAUSEN_WEST', lat: -67.0, lon: -80.0, name: 'SO Bellingshausen West' },
  SO_AMUNDSEN_ENTRY: { id: 'SO_AMUNDSEN_ENTRY', lat: -69.0, lon: -105.0, name: 'SO Amundsen Sea Gateway' },
  SO_AMUNDSEN_EAST: { id: 'SO_AMUNDSEN_EAST', lat: -71.0, lon: -130.0, name: 'SO Amundsen East' },

  // Ross Sea Sector (all in Eastern Hemisphere to avoid antimeridian issues)
  SO_ROSS_WEST: { id: 'SO_ROSS_WEST', lat: -71.0, lon: -170.0, name: 'SO Ross Sea West Approach' },
  SO_ROSS_MID: { id: 'SO_ROSS_MID', lat: -69.5, lon: 178.0, name: 'SO Ross Sea Mid Passage' },
  SO_ROSS_NORTH: { id: 'SO_ROSS_NORTH', lat: -69.0, lon: 175.0, name: 'SO Ross Sea North Gate' },

  // East Antarctica Sector (Dumont d'Urville → Davis → Mawson → Prydz Bay)
  SO_DUMONT: { id: 'SO_DUMONT', lat: -67.0, lon: 140.0, name: 'SO Dumont d\'Urville Sea' },
  SO_DAVIS_APPROACH: { id: 'SO_DAVIS_APPROACH', lat: -66.0, lon: 80.0, name: 'SO Davis Sea' },
  SO_MAWSON_APPROACH: { id: 'SO_MAWSON_APPROACH', lat: -66.0, lon: 60.0, name: 'SO Mawson Coast' },
  SO_PRYDZ_BAY: { id: 'SO_PRYDZ_BAY', lat: -66.0, lon: 75.0, name: 'SO Prydz Bay Offshore' },

  // Atlantic Sector (Weddell Sea → South Sandwich → South Georgia)
  SO_ENDERBY_LAND: { id: 'SO_ENDERBY_LAND', lat: -66.0, lon: 40.0, name: 'SO Enderby Land Offshore' },
  SO_DRONNING_MAUD: { id: 'SO_DRONNING_MAUD', lat: -68.0, lon: 0.0, name: 'SO Dronning Maud Coast' },
  SO_WEDDELL_WEST: { id: 'SO_WEDDELL_WEST', lat: -68.0, lon: -20.0, name: 'SO Weddell West' },
  SO_WEDDELL_SOUTHWEST: { id: 'SO_WEDDELL_SOUTHWEST', lat: -67.0, lon: -40.0, name: 'SO Weddell Southwest' },
  SO_SOUTH_SANDWICH: { id: 'SO_SOUTH_SANDWICH', lat: -58.0, lon: -26.0, name: 'SO South Sandwich Islands' },
  SO_SOUTH_GEORGIA: { id: 'SO_SOUTH_GEORGIA', lat: -54.5, lon: -37.0, name: 'SO South Georgia Approach' },
};

// ============================================================================
// 3. MARITIME WATERWAY GRAPH EDGES (Verified deep navigable routes between nodes)
// ============================================================================

export const MARITIME_EDGES = [
  // Beagle Channel to Drake Passage
  ['BEAGLE_CHANNEL_EXIT', 'CAPE_HORN_OCEANIC'],
  ['CAPE_HORN_OCEANIC', 'DRAKE_NORTH'],
  ['DRAKE_NORTH', 'DRAKE_WEST'],
  ['DRAKE_NORTH', 'DRAKE_CENTRAL'],
  ['DRAKE_WEST', 'DRAKE_SOUTH'],
  ['DRAKE_CENTRAL', 'DRAKE_SOUTH'],

  // Drake Passage to South Shetlands
  ['DRAKE_SOUTH', 'KGI_NORTH_FAIRWAY'],
  ['DRAKE_SOUTH', 'LIVINGSTON_NORTH'],
  ['DRAKE_SOUTH', 'BOYD_STRAIT'],

  // South Shetlands Inter-Channel
  ['KGI_NORTH_FAIRWAY', 'KGI_WEST_APPROACH'],  // Route west around King George Island
  ['KGI_WEST_APPROACH', 'NELSON_STRAIT'],
  ['NELSON_STRAIT', 'KGI_MAXWELL_BAY'],
  ['KGI_MAXWELL_BAY', 'BRANSFIELD_MID_EAST'],
  ['NELSON_STRAIT', 'BRANSFIELD_MID_EAST'],
  ['LIVINGSTON_NORTH', 'BOYD_STRAIT'],
  ['BOYD_STRAIT', 'BRANSFIELD_MID_WEST'],
  ['BOYD_STRAIT', 'BELLINGSHAUSEN_NORTH'],

  // Bransfield Strait Spine (East to West)
  ['BRANSFIELD_EAST', 'BRANSFIELD_MID_EAST'],
  ['BRANSFIELD_MID_EAST', 'BRANSFIELD_CENTER'],
  ['BRANSFIELD_CENTER', 'BRANSFIELD_MID_WEST'],
  ['BRANSFIELD_MID_WEST', 'BRANSFIELD_WEST_GATEWAY'],
  ['KGI_MAXWELL_BAY', 'BRANSFIELD_MID_EAST'],

  // Antarctic Sound (Weddell Sea connection)
  ['BRANSFIELD_EAST', 'ANTARCTIC_SOUND_NORTH'],
  ['ANTARCTIC_SOUND_NORTH', 'ANTARCTIC_SOUND_HOPE'],
  ['ANTARCTIC_SOUND_HOPE', 'ANTARCTIC_SOUND_SOUTH'],
  ['ANTARCTIC_SOUND_SOUTH', 'WEDDELL_NORTH_FAIRWAY'],
  ['WEDDELL_NORTH_FAIRWAY', 'MARAMBIO_APPROACH'],

  // Gerlache Strait Corridor
  ['BRANSFIELD_WEST_GATEWAY', 'GERLACHE_NORTH'],
  ['GERLACHE_NORTH', 'GERLACHE_MID_NORTH'],
  ['GERLACHE_MID_NORTH', 'GERLACHE_CENTER'],
  ['GERLACHE_CENTER', 'PARADISE_BAY_APPROACH'],
  ['GERLACHE_CENTER', 'GERLACHE_SOUTH'],
  ['PARADISE_BAY_APPROACH', 'GERLACHE_SOUTH'],

  // Neumayer Channel & Palmer Station
  ['GERLACHE_SOUTH', 'PORT_LOCKROY_APPROACH'],
  ['PORT_LOCKROY_APPROACH', 'BISMARCK_STRAIT_EAST'],
  ['BISMARCK_STRAIT_EAST', 'PALMER_STATION_FAIRWAY'],
  ['PALMER_STATION_FAIRWAY', 'BISMARCK_STRAIT_WEST'],
  ['BISMARCK_STRAIT_WEST', 'BELLINGSHAUSEN_NORTH'],

  // Grandidier Channel & Vernadsky
  ['BISMARCK_STRAIT_EAST', 'LEMAIRE_NORTH_ENTRY'],
  ['LEMAIRE_NORTH_ENTRY', 'LEMAIRE_SOUTH_ENTRY'],
  ['LEMAIRE_SOUTH_ENTRY', 'VERNADSKY_APPROACH'],
  ['VERNADSKY_APPROACH', 'GRANDIDIER_CENTRAL'],
  ['GRANDIDIER_CENTRAL', 'GRANDIDIER_SOUTH'],

  // Bellingshausen Outer Deep Highway
  ['BRANSFIELD_WEST_GATEWAY', 'BELLINGSHAUSEN_NORTH'],
  ['BELLINGSHAUSEN_NORTH', 'BELLINGSHAUSEN_MID'],
  ['BELLINGSHAUSEN_MID', 'GRANDIDIER_SOUTH'],
  ['BELLINGSHAUSEN_MID', 'BELLINGSHAUSEN_SOUTH'],
  ['GRANDIDIER_SOUTH', 'BELLINGSHAUSEN_SOUTH'],

  // Marguerite Bay / Rothera / San Martin
  ['BELLINGSHAUSEN_SOUTH', 'MARGUERITE_ENTRANCE'],
  ['MARGUERITE_ENTRANCE', 'ROTHERA_APPROACH'],
  ['ROTHERA_APPROACH', 'SAN_MARTIN_APPROACH'],

  // Ross Sea Links
  ['ROSS_SEA_ENTRY', 'ROSS_ISLAND_APPROACH'],
  ['ROSS_ISLAND_APPROACH', 'MCMURDO_SOUND'],

  // Southern Ocean Circumnavigation Highway (Complete ring around Antarctica)
  // Connect Peninsula region to Pacific Sector
  ['BELLINGSHAUSEN_SOUTH', 'SO_DRAKE_WEST'],
  ['SO_DRAKE_WEST', 'SO_BELLINGSHAUSEN_WEST'],
  ['SO_BELLINGSHAUSEN_WEST', 'BELLINGSHAUSEN_MID'],

  // Pacific Sector: Bellingshausen → Amundsen → Ross
  ['SO_BELLINGSHAUSEN_WEST', 'SO_AMUNDSEN_ENTRY'],
  ['SO_AMUNDSEN_ENTRY', 'SO_AMUNDSEN_EAST'],
  ['SO_AMUNDSEN_EAST', 'SO_ROSS_WEST'],
  // Split Ross Sea crossing into two segments to avoid antimeridian interpolation
  ['SO_ROSS_WEST', 'SO_ROSS_MID'],  // -165° to +178° crosses Date Line
  ['SO_ROSS_MID', 'SO_ROSS_NORTH'],
  ['SO_ROSS_NORTH', 'ROSS_SEA_ENTRY'],

  // East Antarctica Sector: Ross → Dumont d'Urville → Davis → Mawson
  ['SO_ROSS_NORTH', 'SO_DUMONT'],
  ['SO_DUMONT', 'SO_PRYDZ_BAY'],
  ['SO_PRYDZ_BAY', 'SO_DAVIS_APPROACH'],
  ['SO_DAVIS_APPROACH', 'SO_MAWSON_APPROACH'],

  // Atlantic Sector: Mawson → Enderby → Dronning Maud → Weddell
  ['SO_MAWSON_APPROACH', 'SO_ENDERBY_LAND'],
  ['SO_ENDERBY_LAND', 'SO_DRONNING_MAUD'],
  ['SO_DRONNING_MAUD', 'SO_WEDDELL_WEST'],
  ['SO_WEDDELL_WEST', 'SO_WEDDELL_SOUTHWEST'],

  // Connect Weddell Sea region back to Antarctic Peninsula
  ['SO_WEDDELL_SOUTHWEST', 'WEDDELL_NORTH_FAIRWAY'],
  ['SO_WEDDELL_SOUTHWEST', 'SO_SOUTH_SANDWICH'],
  ['SO_SOUTH_SANDWICH', 'SO_SOUTH_GEORGIA'],
  ['SO_SOUTH_GEORGIA', 'DRAKE_CENTRAL'],

  // Connect Drake Passage to Southern Ocean ring
  ['DRAKE_SOUTH', 'SO_DRAKE_WEST'],
];

// ============================================================================
// 4. GEOMETRIC COLLISION TESTS (Line vs. Land Polygon)
// ============================================================================

/**
 * Checks if a point [lat, lon] is inside a polygon using ray casting.
 */
export function isPointInPolygon(point, polygon) {
  const [lat, lon] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lonI] = polygon[i];
    const [latJ, lonJ] = polygon[j];

    const intersect =
      lonI > lon !== lonJ > lon &&
      lat < ((latJ - latI) * (lon - lonI)) / (lonJ - lonI) + latI;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Checks if line segment (p1 -> p2) intersects line segment (p3 -> p4).
 */
function lineSegmentsIntersect(p1, p2, p3, p4) {
  function ccw(a, b, c) {
    return (c[0] - a[0]) * (b[1] - a[1]) > (b[0] - a[0]) * (c[1] - a[1]);
  }

  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
    ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
}

/**
 * Verifies whether a straight path between point A and point B crosses ANY Antarctic landmass.
 *
 * @param {object} p1 - { lat, lon }
 * @param {object} p2 - { lat, lon }
 * @returns {boolean} true if path intersects land, false if purely in water
 */
export function doesPathCrossLand(p1, p2) {
  const pt1 = [p1.lat, p1.lon];
  const pt2 = [p2.lat, p2.lon];

  // Check if either endpoint is inside land
  for (const land of ANTARCTIC_LANDMASSES) {
    if (isPointInPolygon(pt1, land.polygon) || isPointInPolygon(pt2, land.polygon)) {
      return true;
    }

    // Check if line segment intersects any polygon boundary edge
    const poly = land.polygon;
    for (let i = 0; i < poly.length - 1; i++) {
      if (lineSegmentsIntersect(pt1, pt2, poly[i], poly[i + 1])) {
        return true;
      }
    }
  }

  return false;
}
