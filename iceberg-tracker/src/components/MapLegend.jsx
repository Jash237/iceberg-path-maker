import './MapLegend.css';

export default function MapLegend({ showRoutes }) {
  if (!showRoutes) return null;

  return (
    <div className="map-legend">
      <h3>Route Legend</h3>
      <div className="legend-items">
        <div className="legend-item">
          <div className="legend-line legend-direct"></div>
          <span>Direct Route (Amber)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line legend-recommended"></div>
          <span>Recommended Safe (Green)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line legend-max-safety"></div>
          <span>Maximum Safety (Cyan)</span>
        </div>
        <div className="legend-item">
          <div className="legend-line legend-ship-path"></div>
          <span>Ship Path (Real-time)</span>
        </div>
      </div>
      <div className="legend-note">
        <strong>Selected route is shown with solid/thicker line</strong>
      </div>
    </div>
  );
}
