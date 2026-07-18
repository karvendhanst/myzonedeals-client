import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { customIcon } from './pinIcon';
import { useDirections } from '../hooks/useDirections';

/* ─── Inject component-scoped styles once ───────────────────────────────── */
const MODAL_STYLES = `
@keyframes dmSlideUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dmFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes userPulse {
  0%   { transform: scale(1);   opacity: 0.85; }
  50%  { transform: scale(1.55); opacity: 0.3;  }
  100% { transform: scale(1);   opacity: 0.85; }
}
@keyframes spinArc {
  to { transform: rotate(360deg); }
}

/* User location dot */
.dm-user-dot-wrapper {
  position: relative;
  width: 18px;
  height: 18px;
}
.dm-user-dot {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 14px;
  height: 14px;
  background: #2563EB;
  border-radius: 50%;
  border: 3px solid #fff;
  box-shadow: 0 2px 10px rgba(37,99,235,0.6);
  z-index: 2;
}
.dm-user-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: rgba(37,99,235,0.25);
  animation: userPulse 2s ease-out infinite;
  z-index: 1;
}

/* Spinner */
.dm-spinner {
  width: 44px;
  height: 44px;
  border: 4px solid rgba(15,23,42,0.1);
  border-top-color: #F4A261;
  border-radius: 50%;
  animation: spinArc 0.9s linear infinite;
}
`;

if (typeof document !== 'undefined' && !document.getElementById('dm-styles')) {
  const s = document.createElement('style');
  s.id = 'dm-styles';
  s.textContent = MODAL_STYLES;
  document.head.appendChild(s);
}

/* ─── User Location Marker (animated blue dot) ───────────────────────────── */
const userDotIcon = L.divIcon({
  className: '',
  html: `<div class="dm-user-dot-wrapper">
           <div class="dm-user-pulse"></div>
           <div class="dm-user-dot"></div>
         </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/* ─── Map auto-fit helper (runs inside MapContainer context) ─────────────── */
const MapBoundsFitter = ({ userLocation, shopLocation, routeCoords }) => {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    // Once we have both endpoints, fit bounds (only once per session)
    if (!userLocation || !shopLocation) return;
    if (fittedRef.current) return;

    const points = routeCoords?.length
      ? routeCoords
      : [userLocation, shopLocation];

    try {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [52, 52], maxZoom: 16, animate: true });
      fittedRef.current = true;
    } catch (_) {
      // bounds calculation failed — ignore
    }
  }, [map, userLocation, shopLocation, routeCoords]);

  return null;
};

/* ─── Info Strip ─────────────────────────────────────────────────────────── */
const T = {
  primary:   '#0F172A',
  accent:    '#F4A261',
  success:   '#16A34A',
  border:    'rgba(15,23,42,0.1)',
  font:      '"Plus Jakarta Sans", sans-serif',
};

const InfoStrip = ({ distance, duration, mode, onModeChange, routeLoading }) => (
  <div style={{
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 800,
    background: '#fff',
    borderTop: `1px solid ${T.border}`,
    boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
    borderRadius: '20px 20px 0 0',
    padding: '16px 20px 20px',
    animation: 'dmSlideUp 0.3s ease',
  }}>
    {/* Drag handle */}
    <div style={{
      width: 36, height: 4, borderRadius: 2,
      background: 'rgba(15,23,42,0.12)',
      margin: '0 auto 14px',
    }} />

    {/* Distance + ETA */}
    {routeLoading ? (
      <div style={{ textAlign: 'center', padding: '4px 0 10px' }}>
        <div style={{ fontFamily: T.font, fontSize: 13, color: '#6B7280' }}>
          Calculating route…
        </div>
      </div>
    ) : distance && duration ? (
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{
          flex: 1, textAlign: 'center',
          background: 'rgba(15,23,42,0.04)', borderRadius: 12, padding: '10px 8px',
        }}>
          <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 22, color: T.primary, lineHeight: 1 }}>
            {distance}
          </div>
          <div style={{ fontFamily: T.font, fontSize: 11, color: '#6B7280', marginTop: 3 }}>
            Distance
          </div>
        </div>
        <div style={{
          flex: 1, textAlign: 'center',
          background: 'linear-gradient(135deg, #F4A261 0%, #e8894a 100%)',
          borderRadius: 12, padding: '10px 8px',
          boxShadow: '0 4px 14px rgba(244,162,97,0.35)',
        }}>
          <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 22, color: '#fff', lineHeight: 1 }}>
            {duration}
          </div>
          <div style={{ fontFamily: T.font, fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>
            Est. travel time
          </div>
        </div>
      </div>
    ) : null}

    {/* Travel mode chips */}
    <div style={{ display: 'flex', gap: 8 }}>
      {[
        { value: 'driving', label: '🚗 Driving' },
        { value: 'walking', label: '🚶 Walking' },
      ].map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          style={{
            flex: 1, border: 'none', borderRadius: 10, padding: '9px 0',
            fontFamily: T.font, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            background: mode === m.value ? T.primary : 'rgba(15,23,42,0.06)',
            color: mode === m.value ? '#fff' : '#374151',
            transition: 'all 0.18s ease',
            boxShadow: mode === m.value ? '0 4px 12px rgba(15,23,42,0.25)' : 'none',
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  </div>
);

/* ─── GPS Loading screen ─────────────────────────────────────────────────── */
const GpsLoadingScreen = () => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 18,
    background: '#F8FAFF',
    animation: 'dmFadeIn 0.3s ease',
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 32, boxShadow: '0 12px 36px rgba(15,23,42,0.2)',
    }}>📍</div>
    <div>
      <div style={{
        fontFamily: T.font, fontWeight: 700, fontSize: 16,
        color: T.primary, textAlign: 'center', marginBottom: 6,
      }}>
        Detecting your location…
      </div>
      <div style={{
        fontFamily: T.font, fontSize: 13, color: '#6B7280',
        textAlign: 'center', lineHeight: 1.6,
      }}>
        Please allow location access when prompted
      </div>
    </div>
    <div className="dm-spinner" />
  </div>
);

/* ─── Permission Denied screen ───────────────────────────────────────────── */
const PermissionDeniedScreen = ({ onRetry }) => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 18,
    background: '#FFF8F5', padding: '0 28px',
    animation: 'dmFadeIn 0.3s ease',
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: 'linear-gradient(135deg, #DC2626 0%, #ef4444 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 32, boxShadow: '0 12px 36px rgba(220,38,38,0.2)',
    }}>🚫</div>
    <div>
      <div style={{
        fontFamily: T.font, fontWeight: 700, fontSize: 16,
        color: T.primary, textAlign: 'center', marginBottom: 8,
      }}>
        Location access denied
      </div>
      <div style={{
        fontFamily: T.font, fontSize: 13, color: '#6B7280',
        textAlign: 'center', lineHeight: 1.7,
      }}>
        To show directions, please enable location access in your browser settings, then try again.
      </div>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 }}>
      <button
        onClick={onRetry}
        style={{
          border: 'none', borderRadius: 12, padding: '12px 0',
          fontFamily: T.font, fontWeight: 700, fontSize: 14, cursor: 'pointer',
          background: 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)',
          color: '#fff', boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
        }}
      >
        Try Again
      </button>
      <div style={{
        fontFamily: T.font, fontSize: 12, color: '#9CA3AF',
        textAlign: 'center', lineHeight: 1.5,
      }}>
        Tip: In Chrome, click the 🔒 icon in the address bar → Site settings → Location → Allow
      </div>
    </div>
  </div>
);

/* ─── Error screen ────────────────────────────────────────────────────────── */
const ErrorScreen = ({ message, onRetry }) => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 18,
    background: '#F8FAFF', padding: '0 28px',
    animation: 'dmFadeIn 0.3s ease',
  }}>
    <div style={{
      width: 72, height: 72, borderRadius: 20,
      background: 'linear-gradient(135deg, #D97706 0%, #f59e0b 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 32, boxShadow: '0 12px 36px rgba(217,119,6,0.2)',
    }}>⚠️</div>
    <div>
      <div style={{
        fontFamily: T.font, fontWeight: 700, fontSize: 16,
        color: T.primary, textAlign: 'center', marginBottom: 6,
      }}>
        Something went wrong
      </div>
      <div style={{
        fontFamily: T.font, fontSize: 13, color: '#6B7280',
        textAlign: 'center', lineHeight: 1.6,
      }}>
        {message}
      </div>
    </div>
    <button
      onClick={onRetry}
      style={{
        border: 'none', borderRadius: 12, padding: '12px 32px',
        fontFamily: T.font, fontWeight: 700, fontSize: 14, cursor: 'pointer',
        background: 'linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)',
        color: '#fff', boxShadow: '0 4px 14px rgba(15,23,42,0.25)',
      }}
    >
      Retry
    </button>
  </div>
);

/* ─── Route Map ──────────────────────────────────────────────────────────── */
const RouteMap = ({ userLocation, shopLocation, routeCoords }) => {
  const center = userLocation ?? shopLocation ?? [20.5937, 78.9629];

  return (
    <MapContainer
      center={center}
      zoom={14}
      zoomControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <ZoomControl position="topright" />

      <MapBoundsFitter
        userLocation={userLocation}
        shopLocation={shopLocation}
        routeCoords={routeCoords}
      />

      {/* Route polyline */}
      {routeCoords && routeCoords.length > 0 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: '#2563EB',
            weight: 5,
            opacity: 0.82,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      )}

      {/* User location marker */}
      {userLocation && (
        <Marker position={userLocation} icon={userDotIcon} />
      )}

      {/* Shop marker */}
      {shopLocation && (
        <Marker position={shopLocation} icon={customIcon} />
      )}
    </MapContainer>
  );
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
/**
 * DirectionsModal
 *
 * @param {object}   props
 * @param {boolean}  props.open         — whether the modal is visible
 * @param {Function} props.onClose      — called when the user closes the modal
 * @param {number}   props.shopLat      — shop latitude
 * @param {number}   props.shopLng      — shop longitude
 * @param {string}   props.shopName     — shop name (shown in header)
 */
const DirectionsModal = ({ open, onClose, shopLat, shopLng, shopName }) => {
  const [mode, setMode] = useState('driving');

  const {
    userLocation,
    routeCoords,
    distance,
    duration,
    gpsLoading,
    routeLoading,
    error,
    permissionDenied,
    retry,
  } = useDirections(shopLat, shopLng, mode);

  const shopLocation = useMemo(
    () => (shopLat && shopLng ? [Number(shopLat), Number(shopLng)] : null),
    [shopLat, shopLng],
  );

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const showMap = !gpsLoading && !permissionDenied && !error;
  // INFO_STRIP_HEIGHT — how much space the info strip takes at the bottom
  const INFO_H = 'auto'; // flex handles it

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'dmFadeIn 0.22s ease',
      }}
    >
      {/* Modal sheet */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          height: '92dvh',
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 48px rgba(15,23,42,0.22)',
          animation: 'dmSlideUp 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderBottom: '1px solid rgba(15,23,42,0.08)',
          background: '#fff',
          flexShrink: 0,
          zIndex: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #2563EB 0%, #3b82f6 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
          }}>🧭</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: T.font, fontWeight: 700, fontSize: 14, color: T.primary,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              Directions to {shopName}
            </div>
            <div style={{ fontFamily: T.font, fontSize: 11, color: '#6B7280', marginTop: 2 }}>
              {gpsLoading
                ? 'Getting your location…'
                : userLocation
                ? distance
                  ? `${distance} · ${duration}`
                  : 'Route found'
                : 'Waiting for GPS…'}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close directions"
            style={{
              width: 34, height: 34, borderRadius: 9,
              border: '1px solid rgba(15,23,42,0.12)',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#6B7280', fontSize: 16, flexShrink: 0,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = T.primary;
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = T.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#6B7280';
              e.currentTarget.style.borderColor = 'rgba(15,23,42,0.12)';
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {gpsLoading && <GpsLoadingScreen />}
          {!gpsLoading && permissionDenied && <PermissionDeniedScreen onRetry={retry} />}
          {!gpsLoading && !permissionDenied && error && !routeCoords && (
            <ErrorScreen message={error} onRetry={retry} />
          )}

          {/* Map — show as soon as we have location, even if route is still loading */}
          {showMap && (
            <div style={{ flex: 1, position: 'relative' }}>
              <RouteMap
                userLocation={userLocation}
                shopLocation={shopLocation}
                routeCoords={routeCoords}
              />

              {/* Route error toast (shown over the map when route fails but user is visible) */}
              {error && (
                <div style={{
                  position: 'absolute', top: 12, left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(220,38,38,0.92)',
                  backdropFilter: 'blur(8px)',
                  color: '#fff', padding: '8px 16px',
                  borderRadius: 20, fontSize: 12,
                  fontFamily: T.font, fontWeight: 600,
                  zIndex: 900, whiteSpace: 'nowrap',
                  boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
                }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Info strip overlay on the map */}
              <InfoStrip
                distance={distance}
                duration={duration}
                mode={mode}
                onModeChange={setMode}
                routeLoading={routeLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectionsModal;
