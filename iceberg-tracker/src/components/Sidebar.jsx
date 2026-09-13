import { useApp } from '../context/AppContext';
import RoutePanel from './RoutePanel';
import WaypointInput from './WaypointInput';
import DataFeedManager from './DataFeedManager';

export default function Sidebar() {
  const {
    icebergs,
    ship,
    environment,
    risks,
    predictions,
    selectedIcebergId,
    showPredictions,
    isSimulating,
    selectIceberg,
    removeIceberg,
    updateShip,
    updateEnvironment,
    togglePredictions,
    toggleSimulation,
  } = useApp();

  const selectedBerg = icebergs.find((b) => b.id === selectedIcebergId);
  const sortedByRisk = [...icebergs].sort((a, b) => {
    const order = { critical: 0, high: 1, moderate: 2, low: 3 };
    return (order[risks[a.id]?.level] ?? 4) - (order[risks[b.id]?.level] ?? 4);
  });

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h1>🧊 Iceberg Tracker</h1>
        <p className="subtitle">Antarctic Navigation System</p>
      </div>

      {/* Ship Info */}
      <section className="sidebar-section">
        <h2>🚢 Ship Status</h2>
        <div className="info-grid">
          <label>Name</label>
          <span>{ship.name}</span>
          <label>Position</label>
          <span>
            {ship.lat.toFixed(4)}°, {ship.lon.toFixed(4)}°
          </span>
          <label>Speed</label>
          <div className="inline-input">
            <input
              type="number"
              value={ship.speedKnots}
              onChange={(e) =>
                updateShip({ speedKnots: parseFloat(e.target.value) || 0 })
              }
              min={0}
              max={30}
              step={0.5}
            />
            <span>kts</span>
          </div>
          <label>Heading</label>
          <div className="inline-input">
            <input
              type="number"
              value={ship.bearingDeg}
              onChange={(e) =>
                updateShip({ bearingDeg: parseFloat(e.target.value) || 0 })
              }
              min={0}
              max={360}
              step={1}
            />
            <span>°</span>
          </div>
        </div>
      </section>

      {/* Environment */}
      <section className="sidebar-section">
        <h2>🌊 Environment</h2>
        <div className="info-grid">
          <label>Wind</label>
          <span>
            {environment.windSpeedKnots.toFixed(0)} kts @{' '}
            {environment.windBearingDeg.toFixed(0)}°
          </span>
          <label>Current</label>
          <span>
            {environment.currentSpeedKnots.toFixed(1)} kts @{' '}
            {environment.currentBearingDeg.toFixed(0)}°
          </span>
          <label>Water Temp</label>
          <span>{environment.waterTempC.toFixed(1)}°C</span>
          <label>Visibility</label>
          <span className={`vis-${environment.visibility}`}>
            {environment.visibility}
          </span>
        </div>
      </section>

      {/* Controls */}
      <section className="sidebar-section">
        <h2>⚙️ Controls</h2>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={showPredictions}
            onChange={togglePredictions}
          />
          Show trajectory predictions
        </label>
        <label className="toggle-row">
          <input
            type="checkbox"
            checked={isSimulating}
            onChange={toggleSimulation}
          />
          Auto-simulate movement
        </label>
      </section>

      {/* Navigation Points (Source & Destination) */}
      <WaypointInput />

      {/* Live Data Feeds */}
      <DataFeedManager />

      {/* Route Planning */}
      <RoutePanel />

      {/* Iceberg List */}
      <section className="sidebar-section iceberg-list-section">
        <h2>🧊 Tracked Icebergs ({icebergs.length})</h2>
        <div className="iceberg-list">
          {sortedByRisk.map((berg) => {
            const risk = risks[berg.id];
            const isSelected = berg.id === selectedIcebergId;
            return (
              <div
                key={berg.id}
                className={`iceberg-card ${isSelected ? 'selected' : ''} risk-border-${risk?.level || 'low'}`}
                onClick={() => selectIceberg(berg.id)}
              >
                <div className="card-header">
                  <strong>{berg.name}</strong>
                  <span className={`risk-badge risk-${risk?.level}`}>
                    {risk?.level?.toUpperCase()}
                  </span>
                </div>
                <div className="card-details">
                  <span>
                    {berg.sizeCategory} · ~{berg.estimatedLengthM}m
                  </span>
                  <span>{risk?.distanceNmi} nmi</span>
                </div>
                <button
                  className="btn-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeIceberg(berg.id);
                  }}
                  title="Remove iceberg"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected Iceberg Details */}
      {selectedBerg && (
        <section className="sidebar-section detail-section">
          <h2>📋 {selectedBerg.name} Details</h2>
          <div className="info-grid">
            <label>Position</label>
            <span>
              {selectedBerg.lat.toFixed(4)}°, {selectedBerg.lon.toFixed(4)}°
            </span>
            <label>Size</label>
            <span>
              {selectedBerg.sizeCategory} (~{selectedBerg.estimatedLengthM}m)
            </span>
            <label>Track Points</label>
            <span>{selectedBerg.track.length}</span>
            <label>Detected</label>
            <span>{new Date(selectedBerg.detectedAt).toLocaleTimeString()}</span>
          </div>
          {predictions[selectedBerg.id] && (
            <div className="prediction-table">
              <h3>Predicted Positions</h3>
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Lat</th>
                    <th>Lon</th>
                    <th>±nmi</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions[selectedBerg.id].map((p, i) => (
                    <tr key={i}>
                      <td>+{p.hours}h</td>
                      <td>{p.lat.toFixed(4)}°</td>
                      <td>{p.lon.toFixed(4)}°</td>
                      <td>{p.uncertaintyNmi.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </aside>
  );
}
