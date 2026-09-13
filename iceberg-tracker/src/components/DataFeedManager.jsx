import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchConsolidatedIcebergData, fetchAuthoritativeWeather } from '../services/satelliteService';

export default function DataFeedManager() {
  const { ship, addIceberg, updateEnvironment } = useApp();

  const [feedStatus, setFeedStatus] = useState({
    usnic: 'idle',
    satellite: 'idle',
    weather: 'idle',
  });

  const [lastUpdate, setLastUpdate] = useState({
    icebergs: null,
    weather: null,
  });

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300); // seconds

  // Fetch iceberg data from live feeds
  const fetchIcebergData = async () => {
    setFeedStatus(prev => ({ ...prev, usnic: 'loading', satellite: 'loading' }));

    try {
      // Define search bounds around ship position (±3 degrees ~ 180 nmi radius)
      const bounds = {
        north: ship.lat + 3,
        south: ship.lat - 3,
        east: ship.lon + 3,
        west: ship.lon - 3,
      };

      const data = await fetchConsolidatedIcebergData(bounds);

      // Merge detected icebergs into the app state
      if (data.icebergs && data.icebergs.length > 0) {
        data.icebergs.forEach(berg => {
          addIceberg({
            lat: berg.lat,
            lon: berg.lon,
            sizeCategory: berg.sizeCategory,
            estimatedLengthM: berg.estimatedLengthM,
          });
        });
      }

      setFeedStatus({
        usnic: data.sources.usnic === 'active' ? 'success' : 'no-data',
        satellite: data.sources.satellite === 'active' ? 'success' : 'no-data',
        weather: feedStatus.weather,
      });

      setLastUpdate(prev => ({ ...prev, icebergs: Date.now() }));

      return data;
    } catch (error) {
      console.error('Iceberg data fetch failed:', error);
      setFeedStatus(prev => ({
        ...prev,
        usnic: 'error',
        satellite: 'error',
      }));
      return null;
    }
  };

  // Fetch authoritative weather data
  const fetchWeatherData = async () => {
    setFeedStatus(prev => ({ ...prev, weather: 'loading' }));

    try {
      const weatherData = await fetchAuthoritativeWeather(ship.lat, ship.lon);

      if (weatherData) {
        updateEnvironment(weatherData.current);
        setFeedStatus(prev => ({ ...prev, weather: 'success' }));
        setLastUpdate(prev => ({ ...prev, weather: Date.now() }));
      } else {
        setFeedStatus(prev => ({ ...prev, weather: 'error' }));
      }

      return weatherData;
    } catch (error) {
      console.error('Weather data fetch failed:', error);
      setFeedStatus(prev => ({ ...prev, weather: 'error' }));
      return null;
    }
  };

  // Auto-refresh when enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchIcebergData();
      fetchWeatherData();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, ship.lat, ship.lon]);

  const formatTimestamp = (ts) => {
    if (!ts) return 'Never';
    const date = new Date(ts);
    return date.toLocaleTimeString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'status-success';
      case 'loading': return 'status-loading';
      case 'error': return 'status-error';
      case 'no-data': return 'status-warning';
      default: return 'status-idle';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✓';
      case 'loading': return '⏳';
      case 'error': return '✗';
      case 'no-data': return '⚠';
      default: return '○';
    }
  };

  return (
    <section className="sidebar-section data-feed-section">
      <h2>📡 Live Data Feeds</h2>

      {/* Feed Status */}
      <div className="feed-status-grid">
        <div className={`feed-status-item ${getStatusColor(feedStatus.usnic)}`}>
          <span className="feed-icon">{getStatusIcon(feedStatus.usnic)}</span>
          <div className="feed-info">
            <strong>USNIC Tracker</strong>
            <span className="feed-detail">Iceberg positions</span>
          </div>
        </div>

        <div className={`feed-status-item ${getStatusColor(feedStatus.satellite)}`}>
          <span className="feed-icon">{getStatusIcon(feedStatus.satellite)}</span>
          <div className="feed-info">
            <strong>Satellite Imagery</strong>
            <span className="feed-detail">Sentinel-1/2 SAR</span>
          </div>
        </div>

        <div className={`feed-status-item ${getStatusColor(feedStatus.weather)}`}>
          <span className="feed-icon">{getStatusIcon(feedStatus.weather)}</span>
          <div className="feed-info">
            <strong>Weather (GFS)</strong>
            <span className="feed-detail">NOAA forecast</span>
          </div>
        </div>
      </div>

      {/* Last Update Times */}
      <div className="update-times">
        <div className="update-row">
          <span>Icebergs:</span>
          <span className="update-time">{formatTimestamp(lastUpdate.icebergs)}</span>
        </div>
        <div className="update-row">
          <span>Weather:</span>
          <span className="update-time">{formatTimestamp(lastUpdate.weather)}</span>
        </div>
      </div>

      {/* Manual Refresh Controls */}
      <div className="feed-controls">
        <button
          className="btn-refresh-feed"
          onClick={() => {
            fetchIcebergData();
            fetchWeatherData();
          }}
          disabled={feedStatus.usnic === 'loading' || feedStatus.weather === 'loading'}
        >
          🔄 Refresh All Data
        </button>

        <div className="auto-refresh-control">
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh every
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={!autoRefresh}
            className="interval-select"
          >
            <option value={60}>1 min</option>
            <option value={300}>5 min</option>
            <option value={600}>10 min</option>
            <option value={1800}>30 min</option>
            <option value={3600}>1 hour</option>
          </select>
        </div>
      </div>

      {/* Info Note */}
      <div className="feed-note">
        <strong>ℹ️ Data Sources:</strong>
        <ul>
          <li><strong>USNIC:</strong> US National Ice Center official iceberg tracking</li>
          <li><strong>Satellite:</strong> Copernicus Sentinel SAR imagery for detection</li>
          <li><strong>Weather:</strong> NOAA GFS model for trajectory prediction</li>
        </ul>
        <p className="note-text">
          Between updates, trajectories are predicted using the latest weather data and physics-based drift models.
        </p>
      </div>
    </section>
  );
}
