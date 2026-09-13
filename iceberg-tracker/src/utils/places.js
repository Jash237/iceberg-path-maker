/**
 * Antarctic & Maritime Places Database and Geocoding Service.
 *
 * Contains prominent Antarctic research stations, ports, channels,
 * and geographic locations, plus online geocoding for any place name worldwide.
 */

export const ANTARCTIC_PLACES = [
  // Ports & Departure Gateways
  { name: 'Ushuaia (Gateway Port)', lat: -54.8019, lon: -68.303, category: 'port', desc: 'Main Antarctic expedition departure port, Argentina' },
  { name: 'Punta Arenas', lat: -53.1638, lon: -70.9171, category: 'port', desc: 'Chilean Antarctic gateway port' },
  { name: 'Stanley (Falkland Islands)', lat: -51.7000, lon: -57.8500, category: 'port', desc: 'Gateway to South Georgia and Weddell Sea' },
  { name: 'Grytviken (South Georgia)', lat: -54.2811, lon: -36.5083, category: 'port', desc: 'Historic whaling station & research base' },

  // South Shetland Islands
  { name: 'King George Island (Maxwell Bay)', lat: -62.1933, lon: -58.9567, category: 'station', desc: 'Major hub with Frei Base & Teniente Marsh Runway' },
  { name: 'Deception Island (Whalers Bay)', lat: -62.9772, lon: -60.5544, category: 'landmark', desc: 'Caldera harbor, volcanic island in South Shetlands' },
  { name: 'Elephant Island (Point Wild)', lat: -61.2333, lon: -55.2333, category: 'landmark', desc: 'Historic Shackleton expedition refuge' },
  { name: 'Livingston Island (Hannah Point)', lat: -62.6500, lon: -60.6167, category: 'landmark', desc: 'St. Kliment Ohridski base, rich wildlife' },
  { name: 'Greenwich Island (Arturo Prat)', lat: -62.4833, lon: -59.6667, category: 'station', desc: 'Chilean naval Antarctic base' },

  // Antarctic Peninsula — West Coast
  { name: 'Port Lockroy (Goudier Island)', lat: -64.8250, lon: -63.4939, category: 'station', desc: 'Historic British Base A, historic post office' },
  { name: 'Paradise Harbor (Almirante Brown)', lat: -64.8950, lon: -62.8683, category: 'landmark', desc: 'Calm natural harbor surrounded by glaciers' },
  { name: 'Lemaire Channel (Kodak Gap)', lat: -65.1333, lon: -63.9500, category: 'landmark', desc: 'Narrow scenic strait between peninsula and Booth Island' },
  { name: 'Palmer Station (Anvers Island)', lat: -64.7744, lon: -64.0533, category: 'station', desc: 'United States permanent Antarctic research base' },
  { name: 'Vernadsky Station (Galindez Island)', lat: -65.2458, lon: -64.2575, category: 'station', desc: 'Ukrainian Antarctic base (formerly Faraday)' },
  { name: 'Rothera Research Station (Adelaide Island)', lat: -67.5700, lon: -68.1250, category: 'station', desc: 'British Antarctic Survey primary logistics hub' },
  { name: 'San Martin Station', lat: -68.1300, lon: -67.1000, category: 'station', desc: 'Argentine base in Marguerite Bay' },

  // Antarctic Peninsula — North & East Coast (Weddell Sea)
  { name: 'Hope Bay (Esperanza Base)', lat: -63.3972, lon: -56.9972, category: 'station', desc: 'Argentine town-station with year-round families' },
  { name: 'Marambio Base (Seymour Island)', lat: -64.2411, lon: -56.6269, category: 'station', desc: 'Major airfield in the Weddell Sea sector' },
  { name: 'General Bernardo O\'Higgins Base', lat: -63.3208, lon: -57.8997, category: 'station', desc: 'Chilean base on Cape Legoupil' },
  { name: 'Paulet Island', lat: -63.5833, lon: -55.7833, category: 'landmark', desc: 'Volcanic island in Erebus and Terror Gulf with huge Adélie colony' },
  { name: 'Larsen Ice Shelf (Calving Edge)', lat: -66.0000, lon: -60.5000, category: 'landmark', desc: 'Source of major tabular icebergs in the Weddell Sea' },

  // Greater Antarctica
  { name: 'McMurdo Station (Ross Island)', lat: -77.8460, lon: 166.6680, category: 'station', desc: 'Largest Antarctic community and research center' },
  { name: 'Scott Base (Pram Point)', lat: -77.8497, lon: 166.7628, category: 'station', desc: 'New Zealand research station on Ross Island' },
  { name: 'Amundsen-Scott South Pole Station', lat: -90.0000, lon: 0.0000, category: 'station', desc: 'Geographic South Pole US station' },
  { name: 'Halley VI Research Station', lat: -75.5800, lon: -25.5000, category: 'station', desc: 'British movable station on the Brunt Ice Shelf' },
  { name: 'Neumayer-Station III (Ekström Shelf)', lat: -70.6744, lon: -8.2742, category: 'station', desc: 'German polar research station' },
  { name: 'Davis Station (Vestfold Hills)', lat: -68.5764, lon: 77.9672, category: 'station', desc: 'Australian Antarctic station' },
  { name: 'Casey Station (Vincennes Bay)', lat: -66.2822, lon: 110.5294, category: 'station', desc: 'Australian continental base' },
  { name: 'Mawson Station (Holme Bay)', lat: -67.6042, lon: 62.8739, category: 'station', desc: 'Oldest continuously occupied Antarctic station' },
  { name: 'Concordia Station (Dome C)', lat: -75.1000, lon: 123.3333, category: 'station', desc: 'French-Italian high-altitude plateau base' },
];

/**
 * Search local Antarctic places database by keyword (case-insensitive fuzzy search).
 */
export function searchLocalPlaces(query) {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  return ANTARCTIC_PLACES.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

/**
 * Geocode any place name online using Open-Meteo & OpenStreetMap Nominatim APIs.
 * Supports any custom place or port typed by the user.
 */
export async function geocodePlace(query) {
  if (!query || query.trim().length < 2) return [];

  const localMatches = searchLocalPlaces(query);

  try {
    // 1. Try Open-Meteo Geocoding (fast, CORS-friendly, covers major ports & islands)
    const openMeteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=5&language=en&format=json`;

    const res = await fetch(openMeteoUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const onlineResults = data.results.map((r) => ({
          name: `${r.name}${r.admin1 ? ', ' + r.admin1 : ''}${r.country ? ' (' + r.country + ')' : ''}`,
          lat: r.latitude,
          lon: r.longitude,
          category: 'online',
          desc: `${r.country || 'Location'} • Lat: ${r.latitude.toFixed(2)}°, Lon: ${r.longitude.toFixed(2)}°`,
        }));

        // Merge local Antarctic priority matches with online results
        const merged = [...localMatches];
        onlineResults.forEach((onRes) => {
          if (!merged.some((m) => Math.abs(m.lat - onRes.lat) < 0.1 && Math.abs(m.lon - onRes.lon) < 0.1)) {
            merged.push(onRes);
          }
        });
        return merged;
      }
    }
  } catch (err) {
    console.warn('Online geocoding lookup error:', err);
  }

  // Fallback to local places if network is unavailable or no online results
  return localMatches;
}
