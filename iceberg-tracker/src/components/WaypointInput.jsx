import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { geocodePlace } from '../utils/places';

export default function WaypointInput() {
  const { ship, destination, updateShip, setDestination } = useApp();

  const [showSourceInput, setShowSourceInput] = useState(false);
  const [showDestInput, setShowDestInput] = useState(false);

  const [sourceName, setSourceName] = useState('');
  const [sourceLat, setSourceLat] = useState(ship.lat.toFixed(4));
  const [sourceLon, setSourceLon] = useState(ship.lon.toFixed(4));
  const [sourceSearchResults, setSourceSearchResults] = useState([]);
  const [sourceSearching, setSourceSearching] = useState(false);

  const [destName, setDestName] = useState(destination.name || '');
  const [destLat, setDestLat] = useState(destination.lat.toFixed(4));
  const [destLon, setDestLon] = useState(destination.lon.toFixed(4));
  const [destSearchResults, setDestSearchResults] = useState([]);
  const [destSearching, setDestSearching] = useState(false);

  // Handle source place name search
  const handleSourceNameSearch = async (value) => {
    setSourceName(value);
    if (value.trim().length < 2) {
      setSourceSearchResults([]);
      return;
    }
    setSourceSearching(true);
    const results = await geocodePlace(value);
    setSourceSearchResults(results);
    setSourceSearching(false);
  };

  // Handle destination place name search
  const handleDestNameSearch = async (value) => {
    setDestName(value);
    if (value.trim().length < 2) {
      setDestSearchResults([]);
      return;
    }
    setDestSearching(true);
    const results = await geocodePlace(value);
    setDestSearchResults(results);
    setDestSearching(false);
  };

  // Select source place from search results
  const selectSourcePlace = (place) => {
    setSourceLat(place.lat.toFixed(4));
    setSourceLon(place.lon.toFixed(4));
    setSourceName(place.name);
    setSourceSearchResults([]);
  };

  // Select destination place from search results
  const selectDestPlace = (place) => {
    setDestLat(place.lat.toFixed(4));
    setDestLon(place.lon.toFixed(4));
    setDestName(place.name);
    setDestSearchResults([]);
  };

  const handleSourceSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(sourceLat);
    const lon = parseFloat(sourceLon);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }

    updateShip({ lat, lon });
    setShowSourceInput(false);
  };

  const handleDestSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(destLat);
    const lon = parseFloat(destLon);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      alert('Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180');
      return;
    }

    setDestination({ lat, lon, name: destName || 'Custom' });
    setShowDestInput(false);
  };

  return (
    <section className="sidebar-section waypoint-input-section">
      <h2>📍 Navigation Points</h2>

      {/* Source (Ship Position) */}
      <div className="waypoint-group">
        <div className="waypoint-header">
          <label>Source (Current Position)</label>
          <button
            className="btn-edit-waypoint"
            onClick={() => setShowSourceInput(!showSourceInput)}
          >
            {showSourceInput ? '✕' : '✏️ Edit'}
          </button>
        </div>

        {showSourceInput ? (
          <form onSubmit={handleSourceSubmit} className="waypoint-form">
            {/* Place Name Search */}
            <div className="place-search-container">
              <input
                type="text"
                placeholder="🔍 Search place name (e.g. Ushuaia, Palmer Station)"
                value={sourceName}
                onChange={(e) => handleSourceNameSearch(e.target.value)}
                className="input-full place-search-input"
              />
              {sourceSearching && <span className="searching-indicator">Searching...</span>}
              {sourceSearchResults.length > 0 && (
                <div className="search-results">
                  {sourceSearchResults.map((place, idx) => (
                    <div
                      key={idx}
                      className="search-result-item"
                      onClick={() => selectSourcePlace(place)}
                    >
                      <strong>{place.name}</strong>
                      <span className="result-desc">{place.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Coordinate Entry */}
            <div className="form-divider">OR enter coordinates</div>
            <div className="form-row">
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={sourceLat}
                onChange={(e) => setSourceLat(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={sourceLon}
                onChange={(e) => setSourceLon(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit">Set Source</button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowSourceInput(false);
                  setSourceSearchResults([]);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="waypoint-display">
            <span className="coords">
              {ship.lat.toFixed(4)}°, {ship.lon.toFixed(4)}°
            </span>
          </div>
        )}
      </div>

      {/* Destination */}
      <div className="waypoint-group">
        <div className="waypoint-header">
          <label>Destination</label>
          <button
            className="btn-edit-waypoint"
            onClick={() => setShowDestInput(!showDestInput)}
          >
            {showDestInput ? '✕' : '✏️ Edit'}
          </button>
        </div>

        {showDestInput ? (
          <form onSubmit={handleDestSubmit} className="waypoint-form">
            {/* Place Name Search */}
            <div className="place-search-container">
              <input
                type="text"
                placeholder="🔍 Search place name (e.g. McMurdo, Port Lockroy)"
                value={destName}
                onChange={(e) => handleDestNameSearch(e.target.value)}
                className="input-full place-search-input"
              />
              {destSearching && <span className="searching-indicator">Searching...</span>}
              {destSearchResults.length > 0 && (
                <div className="search-results">
                  {destSearchResults.map((place, idx) => (
                    <div
                      key={idx}
                      className="search-result-item"
                      onClick={() => selectDestPlace(place)}
                    >
                      <strong>{place.name}</strong>
                      <span className="result-desc">{place.desc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Coordinate Entry */}
            <div className="form-divider">OR enter coordinates</div>
            <div className="form-row">
              <input
                type="number"
                step="0.0001"
                placeholder="Latitude"
                value={destLat}
                onChange={(e) => setDestLat(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.0001"
                placeholder="Longitude"
                value={destLon}
                onChange={(e) => setDestLon(e.target.value)}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-submit">Set Destination</button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowDestInput(false);
                  setDestSearchResults([]);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="waypoint-display">
            <strong>{destination.name || 'Custom'}</strong>
            <span className="coords">
              {destination.lat.toFixed(4)}°, {destination.lon.toFixed(4)}°
            </span>
          </div>
        )}
      </div>

      {/* Quick Antarctic Destinations */}
      <div className="quick-destinations">
        <label>Quick Destinations</label>
        <div className="preset-grid">
          <button
            className="btn-preset-small"
            onClick={() => {
              setDestination({ lat: -62.0, lon: -58.0, name: 'King George Island' });
              setDestLat('-62.0');
              setDestLon('-58.0');
              setDestName('King George Island');
            }}
          >
            King George Is.
          </button>
          <button
            className="btn-preset-small"
            onClick={() => {
              setDestination({ lat: -64.77, lon: -64.05, name: 'Port Lockroy' });
              setDestLat('-64.77');
              setDestLon('-64.05');
              setDestName('Port Lockroy');
            }}
          >
            Port Lockroy
          </button>
          <button
            className="btn-preset-small"
            onClick={() => {
              setDestination({ lat: -65.25, lon: -64.25, name: 'Paradise Harbor' });
              setDestLat('-65.25');
              setDestLon('-64.25');
              setDestName('Paradise Harbor');
            }}
          >
            Paradise Harbor
          </button>
          <button
            className="btn-preset-small"
            onClick={() => {
              setDestination({ lat: -77.85, lon: 166.67, name: 'McMurdo Station' });
              setDestLat('-77.85');
              setDestLon('166.67');
              setDestName('McMurdo Station');
            }}
          >
            McMurdo Station
          </button>
        </div>
      </div>
    </section>
  );
}
