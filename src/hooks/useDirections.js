import { useState, useEffect, useRef, useCallback } from 'react';

// OSRM public demo server — free, no API key required
const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

// Minimum milliseconds between consecutive route re-fetches
const REFETCH_THROTTLE_MS = 10_000;

/**
 * Decode a polyline from OSRM's GeoJSON geometry into Leaflet [lat, lng] pairs.
 * OSRM returns [lng, lat], Leaflet expects [lat, lng].
 */
function decodeGeoJSON(coordinates) {
  return coordinates.map(([lng, lat]) => [lat, lng]);
}

/** Format seconds → "X min" or "X h Y min" */
export function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Format metres → "X.X km" or "X m" */
export function formatDistance(metres) {
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${Math.round(metres)} m`;
}

/**
 * useDirections
 *
 * @param {number|null} shopLat  — destination latitude
 * @param {number|null} shopLng  — destination longitude
 * @param {'driving'|'walking'} mode  — travel mode
 *
 * @returns {{
 *   userLocation: [lat, lng] | null,
 *   routeCoords:  [lat, lng][] | null,
 *   distance:     string | null,        // formatted
 *   duration:     string | null,        // formatted
 *   routeLoading: boolean,
 *   gpsLoading:   boolean,
 *   error:        string | null,
 *   permissionDenied: boolean,
 *   retry:        () => void,
 * }}
 */
export function useDirections(shopLat, shopLng, mode = 'driving') {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(true);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const watchIdRef = useRef(null);
  const lastFetchRef = useRef(0);
  const abortRef = useRef(null);
  const retryCountRef = useRef(0);

  // ── Route fetch ────────────────────────────────────────────────────────────
  const fetchRoute = useCallback(
    async (userLat, userLng) => {
      if (!shopLat || !shopLng) return;

      const now = Date.now();
      if (now - lastFetchRef.current < REFETCH_THROTTLE_MS) return;
      lastFetchRef.current = now;

      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setRouteLoading(true);
      setError(null);

      try {
        const osrmMode = mode === 'walking' ? 'foot' : 'driving';
        const url =
          `${OSRM_BASE}/${osrmMode}/` +
          `${userLng},${userLat};${shopLng},${shopLat}` +
          `?steps=false&geometries=geojson&overview=full`;

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) throw new Error(`OSRM error: ${res.status}`);

        const json = await res.json();
        if (json.code !== 'Ok' || !json.routes?.length) {
          throw new Error('No route found between the two locations.');
        }

        const route = json.routes[0];
        setRouteCoords(decodeGeoJSON(route.geometry.coordinates));
        setDistance(formatDistance(route.distance));
        setDuration(formatDuration(route.duration));
      } catch (err) {
        if (err.name === 'AbortError') return; // request was cancelled — ignore
        setError(err.message || 'Could not calculate route. Please try again.');
      } finally {
        setRouteLoading(false);
      }
    },
    [shopLat, shopLng, mode],
  );

  // ── GPS watch ─────────────────────────────────────────────────────────────
  const startWatch = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsLoading(false);
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    setPermissionDenied(false);
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLocation([lat, lng]);
        setGpsLoading(false);
        fetchRoute(lat, lng);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setError('Your location is currently unavailable. Please check your GPS signal.');
        } else if (err.code === err.TIMEOUT) {
          setError('Location request timed out. Please try again.');
        } else {
          setError('Failed to detect your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 5_000,
      },
    );
  }, [fetchRoute]);

  // ── Re-fetch when mode changes (with existing location) ──────────────────
  useEffect(() => {
    if (userLocation) {
      lastFetchRef.current = 0; // reset throttle so mode change triggers immediately
      fetchRoute(userLocation[0], userLocation[1]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ── Start watching on mount; clean up on unmount ─────────────────────────
  useEffect(() => {
    startWatch();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (abortRef.current) abortRef.current.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Retry helper ─────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    retryCountRef.current += 1;
    setRouteCoords(null);
    setDistance(null);
    setDuration(null);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    startWatch();
  }, [startWatch]);

  return {
    userLocation,
    routeCoords,
    distance,
    duration,
    routeLoading,
    gpsLoading,
    error,
    permissionDenied,
    retry,
  };
}
