import { useApp } from '../context/AppContext';

export default function RoutePanel() {
  const {
    ship,
    destination,
    routes,
    selectedRouteIndex,
    showRoutes,
    weatherLoading,
    weatherError,
    lastWeatherFetch,
    setDestination,
    selectRoute,
    toggleRoutes,
    refreshWeather,
  } = useApp();

  const selectedRoute = routes[selectedRouteIndex];

  return (
    <section className="sidebar-section route-panel">
      <h2>🗺️ Route Planning</h2>

      {/* Weather Status */}
      <div className="weather-status">
        <div className="weather-header">
          <span className="weather-label">Weather Data</span>
          {weatherLoading && <span className="status-loading">⏳ Loading...</span>}
          {weatherError && <span className="status-error">⚠️ {weatherError}</span>}
          {!weatherLoading && !weatherError && lastWeatherFetch && (
            <span className="status-ok">
              ✓ {new Date(lastWeatherFetch).toLocaleTimeString()}
            </span>
          )}
        </div>
        <button className="btn-refresh" onClick={refreshWeather} disabled={weatherLoading}>
          🔄 Refresh Weather
        </button>
      </div>

      {/* Destination */}
      <div className="destination-section">
        <label>Destination</label>
        <div className="destination-display">
          <strong>{destination.name || 'Custom'}</strong>
          <span className="destination-coords">
            {destination.lat.toFixed(4)}°, {destination.lon.toFixed(4)}°
          </span>
        </div>
        <div className="preset-destinations">
          <button
            className="btn-preset"
            onClick={() =>
              setDestination({
                lat: -62.0,
                lon: -58.0,
                name: 'King George Island',
              })
            }
          >
            King George Island
          </button>
          <button
            className="btn-preset"
            onClick={() =>
              setDestination({
                lat: -64.77,
                lon: -64.05,
                name: 'Port Lockroy',
              })
            }
          >
            Port Lockroy
          </button>
          <button
            className="btn-preset"
            onClick={() =>
              setDestination({
                lat: -65.25,
                lon: -64.25,
                name: 'Paradise Harbor',
              })
            }
          >
            Paradise Harbor
          </button>
        </div>
      </div>

      {/* Route Options */}
      {routes.length > 0 && (
        <>
          <label className="toggle-row">
            <input type="checkbox" checked={showRoutes} onChange={toggleRoutes} />
            Show route alternatives
          </label>

          {showRoutes && (
            <div className="route-options">
              {routes.map((route, idx) => (
                <div
                  key={idx}
                  className={`route-card ${
                    idx === selectedRouteIndex ? 'selected' : ''
                  } ${route.isSafe ? '' : 'route-unsafe'}`}
                  onClick={() => selectRoute(idx)}
                >
                  <div className="route-header">
                    <strong>{route.label}</strong>
                    {route.isSafe ? (
                      <span className="badge-safe">✓ Safe</span>
                    ) : (
                      <span className="badge-unsafe">⚠ Risk</span>
                    )}
                  </div>
                  <div className="route-stats">
                    <span>
                      {route.totalDistance} nmi · {route.waypoints.length - 1} legs
                    </span>
                    {route.isDirectRoute && <span className="badge-direct">Direct</span>}
                  </div>
                  {route.riskScore > 0 && (
                    <div className="route-risk">
                      Risk Score: {(route.riskScore * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedRoute && (
            <div className="route-detail">
              <h3>Selected Route Details</h3>
              <div className="info-grid">
                <label>Total Distance</label>
                <span>{selectedRoute.totalDistance} nmi</span>
                <label>Waypoints</label>
                <span>{selectedRoute.waypoints.length}</span>
                <label>Safety Status</label>
                <span className={selectedRoute.isSafe ? 'text-safe' : 'text-warning'}>
                  {selectedRoute.isSafe ? 'All Clear' : 'Caution Required'}
                </span>
                <label>ETA @ 8kts</label>
                <span>
                  {Math.round((selectedRoute.totalDistance / 8) * 60)} min
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
