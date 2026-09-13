import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { predictTrajectory, collisionRisk, destinationPoint } from '../utils/trajectory';
import {
  generateRealisticIcebergs,
  generateRealisticShip,
  defaultEnvironment,
} from '../utils/realisticData';
import { fetchCompleteWeather } from '../services/weatherService';
import { generateRouteAlternatives } from '../utils/routeOptimization';

const AppContext = createContext(null);

const initialIcebergs = generateRealisticIcebergs();
const initialShip = generateRealisticShip();
const initialEnv = defaultEnvironment();

const initialState = {
  icebergs: initialIcebergs,
  ship: initialShip,
  environment: initialEnv,
  selectedIcebergId: null,
  alerts: [],
  showPredictions: true,
  isSimulating: true,
  simulationSpeed: 1, // 1x, 5x, 10x
  predictionHorizon: [1, 6, 24, 72],
  mapCenter: [-64.5, -60.0],
  mapZoom: 7,
  // New: Weather API state
  weatherLoading: false,
  weatherError: null,
  lastWeatherFetch: null,
  // New: Route optimization state
  destination: { lat: -62.0, lon: -58.0, name: 'King George Island' },
  routes: [],
  selectedRouteIndex: 0,
  showRoutes: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'TICK_SIMULATION': {
      // Advance ship along heading
      const dtHours = (1 / 3600) * state.simulationSpeed * 60; // 1 min per tick at 1x
      const shipDist = state.ship.speedKnots * dtHours;

      // Get selected route and find next waypoint to steer towards
      let newBearing = state.ship.bearingDeg;
      if (state.routes.length > 0 && state.routes[state.selectedRouteIndex]) {
        const selectedRoute = state.routes[state.selectedRouteIndex];
        const waypoints = selectedRoute.waypoints;

        // Find closest waypoint ahead
        let closestWaypoint = null;
        let minDist = Infinity;

        for (let i = 0; i < waypoints.length; i++) {
          const wp = waypoints[i];
          const distToWp = Math.sqrt(
            Math.pow(wp.lat - state.ship.lat, 2) + Math.pow(wp.lon - state.ship.lon, 2)
          );

          // Only consider waypoints ahead (not already passed)
          if (distToWp > 0.01 && distToWp < minDist) {
            minDist = distToWp;
            closestWaypoint = wp;
          }
        }

        // Steer towards closest waypoint
        if (closestWaypoint) {
          const targetBearing = Math.atan2(
            closestWaypoint.lon - state.ship.lon,
            closestWaypoint.lat - state.ship.lat
          ) * (180 / Math.PI);

          newBearing = (targetBearing + 360) % 360;
        }
      }

      const newShipPos = destinationPoint(
        state.ship.lat,
        state.ship.lon,
        shipDist,
        newBearing
      );

      // Add to path history (keep last 100 points)
      const newPathHistory = [
        ...(state.ship.pathHistory || []),
        { lat: state.ship.lat, lon: state.ship.lon, timestamp: Date.now() }
      ].slice(-100);

      // Advance icebergs slightly according to their predicted trajectory
      const newIcebergs = state.icebergs.map((berg) => {
        // Drift at ~0.2-0.5 knots
        const bergSpeed = 0.3 * dtHours;
        const bergPos = destinationPoint(
          berg.lat,
          berg.lon,
          bergSpeed,
          state.environment.currentBearingDeg
        );
        const newTrack =
          berg.track.length > 20
            ? [...berg.track.slice(1), { ...bergPos, timestamp: Date.now() }]
            : [...berg.track, { ...bergPos, timestamp: Date.now() }];
        return {
          ...berg,
          lat: bergPos.lat,
          lon: bergPos.lon,
          track: newTrack,
          lastUpdated: Date.now(),
        };
      });

      return {
        ...state,
        ship: {
          ...state.ship,
          lat: newShipPos.lat,
          lon: newShipPos.lon,
          bearingDeg: newBearing,
          pathHistory: newPathHistory,
          lastUpdated: Date.now(),
        },
        icebergs: newIcebergs,
      };
    }

    case 'TOGGLE_SIMULATION':
      return { ...state, isSimulating: !state.isSimulating };

    case 'SET_SIMULATION_SPEED':
      return { ...state, simulationSpeed: action.payload };

    case 'ADD_ICEBERG': {
      const iceberg = {
        id: uuidv4(),
        name: `ICB-${String(state.icebergs.length + 1).padStart(3, '0')}`,
        lat: action.payload.lat,
        lon: action.payload.lon,
        sizeCategory: action.payload.sizeCategory || 'medium',
        estimatedLengthM: action.payload.estimatedLengthM || 100,
        track: [
          {
            lat: action.payload.lat,
            lon: action.payload.lon,
            timestamp: Date.now(),
          },
        ],
        detectedAt: Date.now(),
        lastUpdated: Date.now(),
      };
      return { ...state, icebergs: [...state.icebergs, iceberg] };
    }

    case 'UPDATE_ICEBERG': {
      const { id, lat, lon } = action.payload;
      return {
        ...state,
        icebergs: state.icebergs.map((berg) => {
          if (berg.id !== id) return berg;
          const newTrack = [
            ...berg.track,
            { lat, lon, timestamp: Date.now() },
          ];
          return { ...berg, lat, lon, track: newTrack, lastUpdated: Date.now() };
        }),
      };
    }

    case 'REMOVE_ICEBERG':
      return {
        ...state,
        icebergs: state.icebergs.filter((b) => b.id !== action.payload),
        selectedIcebergId:
          state.selectedIcebergId === action.payload
            ? null
            : state.selectedIcebergId,
      };

    case 'SELECT_ICEBERG':
      return { ...state, selectedIcebergId: action.payload };

    case 'UPDATE_SHIP':
      return {
        ...state,
        ship: { ...state.ship, ...action.payload, lastUpdated: Date.now() },
      };

    case 'UPDATE_ENVIRONMENT':
      return {
        ...state,
        environment: { ...state.environment, ...action.payload },
      };

    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };

    case 'TOGGLE_PREDICTIONS':
      return { ...state, showPredictions: !state.showPredictions };

    case 'SET_WEATHER_LOADING':
      return { ...state, weatherLoading: action.payload };

    case 'SET_WEATHER_DATA':
      return {
        ...state,
        environment: { ...state.environment, ...action.payload },
        lastWeatherFetch: Date.now(),
        weatherLoading: false,
        weatherError: null,
      };

    case 'SET_WEATHER_ERROR':
      return {
        ...state,
        weatherError: action.payload,
        weatherLoading: false,
      };

    case 'SET_DESTINATION':
      return { ...state, destination: action.payload };

    case 'SET_ROUTES':
      return { ...state, routes: action.payload };

    case 'SELECT_ROUTE':
      return { ...state, selectedRouteIndex: action.payload };

    case 'TOGGLE_ROUTES':
      return { ...state, showRoutes: !state.showRoutes };

    case 'SET_MAP_VIEW':
      return {
        ...state,
        mapCenter: action.payload.center,
        mapZoom: action.payload.zoom,
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Weather fetching effect
  const refreshWeather = useCallback(async () => {
    dispatch({ type: 'SET_WEATHER_LOADING', payload: true });
    try {
      const data = await fetchCompleteWeather(state.ship.lat, state.ship.lon);
      if (data) {
        dispatch({ type: 'SET_WEATHER_DATA', payload: data });
      } else {
        dispatch({ type: 'SET_WEATHER_ERROR', payload: 'No data received' });
      }
    } catch (err) {
      dispatch({ type: 'SET_WEATHER_ERROR', payload: err.message });
    }
  }, [state.ship.lat, state.ship.lon]);

  // Initial weather fetch
  useEffect(() => {
    refreshWeather();
  }, []);

  // Recalculate routes when ship, destination, or icebergs change
  useEffect(() => {
    if (!state.destination) return;
    const computedRoutes = generateRouteAlternatives(
      { lat: state.ship.lat, lon: state.ship.lon },
      state.destination,
      state.icebergs.map((b) => ({
        ...b,
        predictions: predictions[b.id] || [],
      }))
    );
    dispatch({ type: 'SET_ROUTES', payload: computedRoutes });
  }, [state.ship.lat, state.ship.lon, state.destination, state.icebergs]);
  useEffect(() => {
    if (!state.isSimulating) return;
    const interval = setInterval(() => {
      dispatch({ type: 'TICK_SIMULATION' });
    }, 2000);
    return () => clearInterval(interval);
  }, [state.isSimulating, state.simulationSpeed]);

  // Compute predictions for all icebergs
  const predictions = state.icebergs.reduce((acc, berg) => {
    acc[berg.id] = predictTrajectory(berg, state.environment, state.predictionHorizon);
    return acc;
  }, {});

  // Compute collision risks
  const risks = state.icebergs.reduce((acc, berg) => {
    acc[berg.id] = collisionRisk(state.ship, berg, state.environment);
    return acc;
  }, {});

  const addIceberg = useCallback(
    (payload) => dispatch({ type: 'ADD_ICEBERG', payload }),
    []
  );
  const updateIceberg = useCallback(
    (payload) => dispatch({ type: 'UPDATE_ICEBERG', payload }),
    []
  );
  const removeIceberg = useCallback(
    (id) => dispatch({ type: 'REMOVE_ICEBERG', payload: id }),
    []
  );
  const selectIceberg = useCallback(
    (id) => dispatch({ type: 'SELECT_ICEBERG', payload: id }),
    []
  );
  const updateShip = useCallback(
    (payload) => dispatch({ type: 'UPDATE_SHIP', payload }),
    []
  );
  const updateEnvironment = useCallback(
    (payload) => dispatch({ type: 'UPDATE_ENVIRONMENT', payload }),
    []
  );
  const togglePredictions = useCallback(
    () => dispatch({ type: 'TOGGLE_PREDICTIONS' }),
    []
  );
  const toggleSimulation = useCallback(
    () => dispatch({ type: 'TOGGLE_SIMULATION' }),
    []
  );
  const setSimulationSpeed = useCallback(
    (speed) => dispatch({ type: 'SET_SIMULATION_SPEED', payload: speed }),
    []
  );
  const setDestination = useCallback(
    (dest) => dispatch({ type: 'SET_DESTINATION', payload: dest }),
    []
  );
  const selectRoute = useCallback(
    (index) => dispatch({ type: 'SELECT_ROUTE', payload: index }),
    []
  );
  const toggleRoutes = useCallback(
    () => dispatch({ type: 'TOGGLE_ROUTES' }),
    []
  );

  const value = {
    ...state,
    predictions,
    risks,
    addIceberg,
    updateIceberg,
    removeIceberg,
    selectIceberg,
    updateShip,
    updateEnvironment,
    togglePredictions,
    toggleSimulation,
    setSimulationSpeed,
    setDestination,
    selectRoute,
    toggleRoutes,
    refreshWeather,
    dispatch,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
