/**
 * Weather and marine data service for Antarctic regions.
 * Uses Open-Meteo Marine API (free, no auth required).
 */

const OPEN_METEO_MARINE = 'https://marine-api.open-meteo.com/v1/marine';

/**
 * Fetch real-time weather and ocean data for a given position.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<object>} Weather data
 */
export async function fetchWeatherData(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      current: [
        'wave_height',
        'wave_direction',
        'wave_period',
        'wind_wave_height',
        'wind_wave_direction',
        'wind_wave_period',
        'swell_wave_height',
        'swell_wave_direction',
        'swell_wave_period',
        'ocean_current_velocity',
        'ocean_current_direction',
      ].join(','),
      wind_speed_unit: 'kn',
      timezone: 'auto',
    });

    const response = await fetch(`${OPEN_METEO_MARINE}?${params}`);
    if (!response.ok) {
      throw new Error(`Marine API returned ${response.status}`);
    }

    const data = await response.json();
    return parseMarineData(data);
  } catch (error) {
    console.warn('Failed to fetch marine weather data:', error);
    return null;
  }
}

/**
 * Fetch atmospheric weather data (wind, temperature, visibility).
 */
export async function fetchAtmosphericData(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: lat.toFixed(4),
      longitude: lon.toFixed(4),
      current: [
        'temperature_2m',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'visibility',
        'weather_code',
      ].join(','),
      wind_speed_unit: 'kn',
      temperature_unit: 'celsius',
      timezone: 'auto',
    });

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params}`
    );
    if (!response.ok) {
      throw new Error(`Forecast API returned ${response.status}`);
    }

    const data = await response.json();
    return parseAtmosphericData(data);
  } catch (error) {
    console.warn('Failed to fetch atmospheric data:', error);
    return null;
  }
}

/**
 * Fetch both marine and atmospheric data and merge.
 */
export async function fetchCompleteWeather(lat, lon) {
  const [marine, atmospheric] = await Promise.all([
    fetchWeatherData(lat, lon),
    fetchAtmosphericData(lat, lon),
  ]);

  return {
    ...(marine || {}),
    ...(atmospheric || {}),
    lastUpdated: Date.now(),
  };
}

/** Parse marine API response. */
function parseMarineData(data) {
  const current = data.current || {};
  return {
    currentSpeedKnots: current.ocean_current_velocity || 0.3,
    currentBearingDeg: current.ocean_current_direction || 90,
    waveHeightM: current.wave_height || 0,
    waveDirection: current.wave_direction || 0,
    wavePeriodS: current.wave_period || 0,
    swellHeightM: current.swell_wave_height || 0,
    swellDirection: current.swell_wave_direction || 0,
  };
}

/** Parse atmospheric API response. */
function parseAtmosphericData(data) {
  const current = data.current || {};
  return {
    windSpeedKnots: current.wind_speed_10m || 10,
    windBearingDeg: current.wind_direction_10m || 270,
    windGustsKnots: current.wind_gusts_10m || 15,
    waterTempC: current.temperature_2m || -1.5,
    visibilityKm: (current.visibility || 10000) / 1000,
    visibility: classifyVisibility((current.visibility || 10000) / 1000),
    weatherCode: current.weather_code || 0,
    weatherDescription: weatherCodeToDescription(current.weather_code || 0),
  };
}

/** Convert visibility km to human category. */
function classifyVisibility(km) {
  if (km < 1) return 'poor';
  if (km < 5) return 'moderate';
  return 'good';
}

/** WMO Weather interpretation codes. */
function weatherCodeToDescription(code) {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
  };
  return codes[code] || 'Unknown';
}
