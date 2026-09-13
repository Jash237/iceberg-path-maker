import { useState, useCallback } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import TrackerMap from './components/TrackerMap';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import AlertBanner from './components/AlertBanner';
import 'leaflet/dist/leaflet.css';
import './App.css';

function AppContent() {
  const [isAddingIceberg, setIsAddingIceberg] = useState(false);
  const { addIceberg } = useApp();

  const handleIcebergAdded = useCallback(
    (pos) => {
      addIceberg({
        lat: pos.lat,
        lon: pos.lon,
        sizeCategory: 'medium',
        estimatedLengthM: 100,
      });
      setIsAddingIceberg(false);
    },
    [addIceberg]
  );

  return (
    <div className="app">
      <AlertBanner />
      <div className="app-body">
        <Sidebar />
        <div className="map-container">
          <Toolbar
            isAddingIceberg={isAddingIceberg}
            setIsAddingIceberg={setIsAddingIceberg}
          />
          <TrackerMap
            isAddingIceberg={isAddingIceberg}
            onIcebergAdded={handleIcebergAdded}
          />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
