import { useState, useEffect, useRef, useCallback } from 'react';

const LOCATION_CACHE_MS = 5 * 60 * 1000;
let cachedLocation = null;

// Standard Google polyline decode
export function decodePolyline(encoded) {
  if (!encoded) return [];
  const points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

export function formatDistance(metres) {
  if (metres >= 1000) return `${(metres / 1000).toFixed(1)} km`;
  return `${Math.round(metres)} m`;
}

export function formatDuration(seconds) {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function buildGoogleMapsUrl(userLocation, shopLat, shopLng, mode) {
  const travelMode = mode === 'walking' ? 'walking' : 'driving';
  if (userLocation) {
    const [uLat, uLng] = userLocation;
    return `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${shopLat},${shopLng}&travelmode=${travelMode}`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${shopLat},${shopLng}&travelmode=${travelMode}`;
}

export function useDirections(shopLat, shopLng, mode = 'DRIVE') {
  const isLocationFresh =
    cachedLocation && Date.now() - cachedLocation.timestamp < LOCATION_CACHE_MS;

  const [userLocation, setUserLocation] = useState(
    isLocationFresh ? cachedLocation.coords : null
  );
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [routeSteps, setRouteSteps] = useState([]);
  const [gpsLoading, setGpsLoading] = useState(!isLocationFresh);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const watchIdRef = useRef(null);

  // Fetch route line from Google Routes API v2
  useEffect(() => {
    if (!userLocation || !shopLat || !shopLng) return;

    let isMounted = true;
    const fetchRoute = async () => {
      setRouteLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const travelMode = mode === 'WALK' ? 'WALK' : 'DRIVE';

      try {
        const response = await fetch(
          'https://routes.googleapis.com/directions/v2:computeRoutes',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask':
                'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction',
            },
            body: JSON.stringify({
              origin: {
                location: {
                  latLng: {
                    latitude: userLocation[0],
                    longitude: userLocation[1],
                  },
                },
              },
              destination: {
                location: {
                  latLng: {
                    latitude: Number(shopLat),
                    longitude: Number(shopLng),
                  },
                },
              },
              travelMode,
              routingPreference:
                travelMode === 'DRIVE' ? 'TRAFFIC_UNAWARE' : undefined,
              computeAlternativeRoutes: false,
            }),
          }
        );

        const data = await response.json();
        if (!isMounted) return;

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          if (route.distanceMeters) {
            setDistance(formatDistance(route.distanceMeters));
          }
          if (route.duration) {
            const seconds = parseInt(route.duration.replace('s', ''), 10);
            setDuration(formatDuration(seconds));
          }
          if (route.polyline?.encodedPolyline) {
            const points = decodePolyline(route.polyline.encodedPolyline);
            setRoutePolyline(points);
          }
          const steps = route.legs?.[0]?.steps || [];
          setRouteSteps(
            steps
              .map((s) => s.navigationInstruction?.instructions)
              .filter(Boolean)
          );
        } else if (data.error) {
          console.warn('Routes API returned error:', data.error);
          // Fallback straight line
          setRoutePolyline([
            { lat: userLocation[0], lng: userLocation[1] },
            { lat: Number(shopLat), lng: Number(shopLng) },
          ]);
          setError(data.error.message || 'Route not found');
        }
      } catch (err) {
        console.error('Failed to compute route:', err);
        if (isMounted) {
          // Fallback straight line
          setRoutePolyline([
            { lat: userLocation[0], lng: userLocation[1] },
            { lat: Number(shopLat), lng: Number(shopLng) },
          ]);
        }
      } finally {
        if (isMounted) setRouteLoading(false);
      }
    };

    fetchRoute();

    return () => {
      isMounted = false;
    };
  }, [userLocation, shopLat, shopLng, mode]);

  const startWatch = useCallback(({ silent = false } = {}) => {
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

        if (watchIdRef.current === null) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (p) => {
              const latH = p.coords.latitude;
              const lngH = p.coords.longitude;
              cachedLocation = { coords: [latH, lngH], timestamp: Date.now() };
              setUserLocation([latH, lngH]);
            },
            () => { },
            { enableHighAccuracy: true, timeout: 15_000, maximumAge: 5_000 }
          );
        }
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) setPermissionDenied(true);
        else if (err.code === err.POSITION_UNAVAILABLE)
          setError('Your location is currently unavailable.');
        else if (err.code === err.TIMEOUT)
          setError('Location request timed out. Please try again.');
        else setError('Failed to detect your location.');
      },
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: LOCATION_CACHE_MS }
    );
  }, []);

  useEffect(() => {
    if (isLocationFresh) {
      setUserLocation(cachedLocation.coords);
      setGpsLoading(false);
      startWatch({ silent: true });
    } else {
      startWatch();
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const retry = useCallback(() => {
    setPermissionDenied(false);
    setError(null);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    startWatch();
  }, [startWatch]);

  const googleMapsUrl = buildGoogleMapsUrl(userLocation, shopLat, shopLng, mode.toLowerCase());

  return {
    userLocation,
    distance,
    duration,
    routePolyline,
    routeSteps,
    gpsLoading,
    routeLoading,
    error,
    permissionDenied,
    retry,
    googleMapsUrl,
  };
}