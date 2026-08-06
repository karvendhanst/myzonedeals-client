import { useState, useEffect, useRef, useCallback } from 'react';


const OSRM_ENDPOINTS = {
  driving: 'https://router.project-osrm.org/route/v1/driving',
  walking: 'https://routing.openstreetmap.de/routed-foot/route/v1/foot',
};

const REFETCH_THROTTLE_MS = 10_000;
const LOCATION_CACHE_MS = 5 * 60 * 1000;   
const ROUTE_CACHE_MAX = 40;
const MIN_MOVE_METRES = 30;                

let cachedLocation = null;
const routeCache = new Map(); 

function haversineMetres([lat1, lng1], [lat2, lng2]) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function routeCacheKey(userLat, userLng, shopLat, shopLng, mode, shopId) {
  const ru = `${userLat.toFixed(3)},${userLng.toFixed(3)}`;
  // shopId ensures two different shops at the same GPS coords
  // never share a cached route with each other.
  const sid = shopId ?? `${shopLat},${shopLng}`;
  return `${ru}|${sid}|${mode}`;
}

function decodeGeoJSON(coordinates) {
  return coordinates.map(([lng, lat]) => [lat, lng]);
}

export function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function formatDistance(metres) {
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${Math.round(metres)} m`;
}

export function useDirections(shopLat, shopLng, mode = 'driving', shopId) {
  const isLocationFresh =
    cachedLocation && Date.now() - cachedLocation.timestamp < LOCATION_CACHE_MS;

  const [userLocation, setUserLocation] = useState(
    isLocationFresh ? cachedLocation.coords : null,
  );
  const [routeCoords, setRouteCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(!isLocationFresh);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const watchIdRef = useRef(null);
  const lastFetchRef = useRef(0);
  const lastFetchedAtRef = useRef(null); 
  const abortRef = useRef(null);

  const fetchRoute = useCallback(
    async (userLat, userLng, { force = false } = {}) => {
      if (!shopLat || !shopLng) return;

      if (!force && lastFetchedAtRef.current) {
        const moved = haversineMetres(lastFetchedAtRef.current, [userLat, userLng]);
        if (moved < MIN_MOVE_METRES) return;
      }

      // shopId disambiguates shops that share the same GPS coordinates
      const key = routeCacheKey(userLat, userLng, shopLat, shopLng, mode, shopId);
      const cached = routeCache.get(key);
      if (cached && !force) {
        setRouteCoords(cached.routeCoords);
        setDistance(cached.distance);
        setDuration(cached.duration);
        setError(null);
        lastFetchedAtRef.current = [userLat, userLng];
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchRef.current < REFETCH_THROTTLE_MS) return;
      lastFetchRef.current = now;
      lastFetchedAtRef.current = [userLat, userLng];

      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setRouteLoading(true);
      setError(null);

      try {
        const base = OSRM_ENDPOINTS[mode] ?? OSRM_ENDPOINTS.driving;
const url =
  `${base}/` +
  `${userLng},${userLat};${shopLng},${shopLat}` +
  `?steps=false&geometries=geojson&overview=full`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`OSRM error: ${res.status}`);

        const json = await res.json();
        if (json.code !== 'Ok' || !json.routes?.length) {
          throw new Error('No route found between the two locations.');
        }

        const route = json.routes[0];
        const coords = decodeGeoJSON(route.geometry.coordinates);
        const dist = formatDistance(route.distance);
        const dur = formatDuration(route.duration);

        setRouteCoords(coords);
        setDistance(dist);
        setDuration(dur);

        routeCache.set(key, { routeCoords: coords, distance: dist, duration: dur, timestamp: now });
        if (routeCache.size > ROUTE_CACHE_MAX) {
          routeCache.delete(routeCache.keys().next().value); 
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err.message || 'Could not calculate route. Please try again.');
      } finally {
        setRouteLoading(false);
      }
    },
    [shopLat, shopLng, mode, shopId],
  );

  const startWatch = useCallback(
    ({ silent = false } = {}) => {
      if (!('geolocation' in navigator)) {
        setGpsLoading(false);
        setError('Geolocation is not supported by your browser.');
        return;
      }

      if (!silent) {
        setGpsLoading(true);
        setPermissionDenied(false);
        setError(null);
      }


      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          cachedLocation = { coords: [lat, lng], timestamp: Date.now() };
          setUserLocation([lat, lng]);
          setGpsLoading(false);
          fetchRoute(lat, lng);

          if (watchIdRef.current === null) {
            watchIdRef.current = navigator.geolocation.watchPosition(
              (p) => {
                const latH = p.coords.latitude;
                const lngH = p.coords.longitude;
                cachedLocation = { coords: [latH, lngH], timestamp: Date.now() };
                setUserLocation([latH, lngH]);
                fetchRoute(latH, lngH);
              },
              () => {}, 
              { enableHighAccuracy: true, timeout: 15_000, maximumAge: 5_000 },
            );
          }
        },
        (err) => {
          setGpsLoading(false);
          if (err.code === err.PERMISSION_DENIED) setPermissionDenied(true);
          else if (err.code === err.POSITION_UNAVAILABLE)
            setError('Your location is currently unavailable. Please check your GPS signal.');
          else if (err.code === err.TIMEOUT) setError('Location request timed out. Please try again.');
          else setError('Failed to detect your location.');
        },
        { enableHighAccuracy: false, timeout: 8_000, maximumAge: LOCATION_CACHE_MS },
      );
    },
    [fetchRoute],
  );

  useEffect(() => {
    if (userLocation) {
      // Re-fetch whenever mode, destination coordinates, OR the shop identity
      // changes. Without shopId in deps, switching between two shops that share
      // the same lat/lng would NOT trigger a re-fetch (deps unchanged) and the
      // route calculated for the first shop would silently persist.
      fetchRoute(userLocation[0], userLocation[1], { force: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, shopLat, shopLng, shopId]);

  useEffect(() => {
    if (isLocationFresh) {
      setUserLocation(cachedLocation.coords);
      setGpsLoading(false);
      fetchRoute(cachedLocation.coords[0], cachedLocation.coords[1], { force: true });
      startWatch({ silent: true }); 
    } else {
      startWatch();
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => {
    setRouteCoords(null);
    setDistance(null);
    setDuration(null);
    setPermissionDenied(false);
    setError(null);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
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