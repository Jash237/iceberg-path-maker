import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMapEvents,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import MapLegend from './MapLegend';

// Fix default marker icons in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom iceberg icon
function icebergIcon(risk = 'low', selected = false) {
  const colors = {
    critical: '#ef4444',
    high: '#f97316',
    moderate: '#eab308',
    low: '#3b82f6',
  };
  const color = colors[risk] || colors.low;
  const size = selected ? 32 : 24;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
      <polygon points="50,5 85,45 75,95 25,95 15,45"
        fill="${color}" fill-opacity="0.8" stroke="white" stroke-width="3"/>
      <polygon points="50,5 85,45 50,35" fill="white" fill-opacity="0.3"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: 'iceberg-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Ship icon
const shipIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28">
      <polygon points="50,5 80,70 50,60 20,70"
        fill="#10b981" stroke="white" stroke-width="3"/>
      <rect x="45" y="60" width="10" height="25" rx="3"
        fill="#10b981" stroke="white" stroke-width="2"/>
    </svg>`,
  className: 'ship-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Click handler for adding icebergs
function MapClickHandler({ isAdding, onAdd }) {
  useMapEvents({
    click(e) {
      if (isAdding) {
        onAdd({ lat: e.latlng.lat, lon: e.latlng.lng });
      }
    },
  });
  return null;
}

// Update map view when center/zoom changes externally
function MapViewController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, []); // only on mount
  return null;
}

export default function TrackerMap({ isAddingIceberg, onIcebergAdded }) {
  const {
    icebergs,
    ship,
    predictions,
    risks,
    selectedIcebergId,
    showPredictions,
    destination,
    routes,
    selectedRouteIndex,
    showRoutes,
    selectIceberg,
    updateIceberg,
    mapCenter,
    mapZoom,
  } = useApp();

  // Prediction path colors by time horizon
  const horizonColors = ['#60a5fa', '#a78bfa', '#f472b6', '#fb923c'];

  // Distinct Route colors by priority/type
  const routeStyles = {
    fast: { color: '#f59e0b', name: 'Direct Route', dash: '6,6', weight: 3 }, // Amber
    balanced: { color: '#10b981', name: 'Recommended Safe', dash: null, weight: 5 }, // Emerald Green
    safe: { color: '#06b6d4', name: 'Maximum Safety', dash: '8,4', weight: 3 }, // Cyan
  };

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapLegend showRoutes={showRoutes} />
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="tracker-map"
        style={{ height: '100%', width: '100%' }}
      >
      <MapViewController center={mapCenter} zoom={mapZoom} />
      <MapClickHandler isAdding={isAddingIceberg} onAdd={onIcebergAdded} />

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Ship marker */}
      <Marker position={[ship.lat, ship.lon]} icon={shipIcon}>
        <Popup>
          <div className="popup-content">
            <strong>🚢 {ship.name}</strong>
            <br />
            Speed: {ship.speedKnots} kts | Heading: {ship.bearingDeg}°
            <br />
            Lat: {ship.lat.toFixed(4)}°, Lon: {ship.lon.toFixed(4)}°
          </div>
        </Popup>
      </Marker>

      {/* Ship Path History (Wake / Real-time Track) */}
      {ship.pathHistory && ship.pathHistory.length > 1 && (
        <Polyline
          positions={ship.pathHistory.map((p) => [p.lat, p.lon])}
          color="#38bdf8"
          weight={3}
          opacity={0.8}
        />
      )}

      {/* Destination marker */}
      {destination && (
        <Marker
          position={[destination.lat, destination.lon]}
          icon={L.divIcon({
            html: `
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
                <circle cx="50" cy="50" r="42" fill="#ec4899" stroke="white" stroke-width="4"/>
                <circle cx="50" cy="50" r="24" fill="white"/>
                <circle cx="50" cy="50" r="10" fill="#ec4899"/>
              </svg>`,
            className: 'destination-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })}
        >
          <Popup>
            <div className="popup-content">
              <strong>🎯 Destination</strong>
              <br />
              {destination.name || 'Custom Waypoint'}
              <br />
              {destination.lat.toFixed(4)}°, {destination.lon.toFixed(4)}°
            </div>
          </Popup>
        </Marker>
      )}

      {/* Route lines with distinct styling */}
      {showRoutes &&
        routes.map((route, idx) => {
          const isSelected = idx === selectedRouteIndex;
          const style = routeStyles[route.priority] || {
            color: '#10b981',
            weight: 3,
          };
          return (
            <div key={idx}>
              <Polyline
                positions={route.waypoints.map((wp) => [wp.lat, wp.lon])}
                color={style.color}
                weight={isSelected ? style.weight + 2 : 2.5}
                opacity={isSelected ? 1.0 : 0.45}
                dashArray={isSelected ? (route.priority === 'balanced' ? null : '6,6') : '4,8'}
              />
              {/* Waypoint markers along the selected route */}
              {isSelected &&
                route.waypoints.slice(1, -1).map((wp, wpIdx) => (
                  <Circle
                    key={wpIdx}
                    center={[wp.lat, wp.lon]}
                    radius={800}
                    pathOptions={{
                      color: style.color,
                      fillColor: '#ffffff',
                      fillOpacity: 0.9,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <strong>Waypoint {wpIdx + 1}</strong>
                      <br />
                      Lat: {wp.lat.toFixed(4)}°, Lon: {wp.lon.toFixed(4)}°
                    </Popup>
                  </Circle>
                ))}
            </div>
          );
        })}

      {/* Iceberg markers */}
      {icebergs.map((berg) => {
        const risk = risks[berg.id]?.level || 'low';
        const isSelected = berg.id === selectedIcebergId;

        return (
          <div key={berg.id}>
            {/* Iceberg marker */}
            <Marker
              position={[berg.lat, berg.lon]}
              icon={icebergIcon(risk, isSelected)}
              draggable
              eventHandlers={{
                click: () => selectIceberg(berg.id),
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  updateIceberg({ id: berg.id, lat, lon: lng });
                },
              }}
            >
              <Popup>
                <div className="popup-content">
                  <strong>🧊 {berg.name}</strong>
                  <br />
                  Size: {berg.sizeCategory} (~{berg.estimatedLengthM}m)
                  <br />
                  Risk: <span className={`risk-${risk}`}>{risk.toUpperCase()}</span>
                  <br />
                  Distance: {risks[berg.id]?.distanceNmi} nmi
                </div>
              </Popup>
            </Marker>

            {/* Historical track */}
            {berg.track.length > 1 && (
              <Polyline
                positions={berg.track.map((p) => [p.lat, p.lon])}
                color="#94a3b8"
                weight={2}
                dashArray="5,5"
                opacity={0.7}
              />
            )}

            {/* Predicted trajectory */}
            {showPredictions && predictions[berg.id]?.length > 0 && (
              <>
                <Polyline
                  positions={[
                    [berg.lat, berg.lon],
                    ...predictions[berg.id].map((p) => [p.lat, p.lon]),
                  ]}
                  color={horizonColors[0]}
                  weight={2}
                  dashArray="8,4"
                  opacity={0.8}
                />
                {predictions[berg.id].map((pred, idx) => (
                  <Circle
                    key={idx}
                    center={[pred.lat, pred.lon]}
                    radius={pred.uncertaintyNmi * 1852} // convert nmi to meters
                    pathOptions={{
                      color: horizonColors[idx % horizonColors.length],
                      fillColor: horizonColors[idx % horizonColors.length],
                      fillOpacity: 0.1,
                      weight: 1,
                      dashArray: '4,4',
                    }}
                  >
                    <Popup>
                      +{pred.hours}h prediction
                      <br />
                      Uncertainty: ±{pred.uncertaintyNmi.toFixed(1)} nmi
                    </Popup>
                  </Circle>
                ))}
              </>
            )}
          </div>
        );
      })}
    </MapContainer>
  </div>
  );
}
