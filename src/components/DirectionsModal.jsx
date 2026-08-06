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

import DirectionsIcon from '@mui/icons-material/Directions';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BlockIcon from '@mui/icons-material/Block';
import WarningIcon from '@mui/icons-material/Warning';

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

.dm-user-dot-wrapper { position: relative; width: 18px; height: 18px; }
.dm-user-dot {
  position: absolute; inset: 0; margin: auto;
  width: 14px; height: 14px; background: #2563EB; border-radius: 50%;
  border: 3px solid #fff; box-shadow: 0 2px 10px rgba(37,99,235,0.6); z-index: 2;
}
.dm-user-pulse {
  position: absolute; inset: -6px; border-radius: 50%;
  background: rgba(37,99,235,0.25); animation: userPulse 2s ease-out infinite; z-index: 1;
}
.dm-spinner {
  width: 40px; height: 40px; border: 4px solid rgba(15,23,42,0.08);
  border-top-color: #F4A261; border-radius: 50%; animation: spinArc 0.9s linear infinite;
}
`;

if (typeof document !== 'undefined' && !document.getElementById('dm-styles')) {
  const s = document.createElement('style');
  s.id = 'dm-styles';
  s.textContent = MODAL_STYLES;
  document.head.appendChild(s);
}

/* ─── Design tokens (shared feel with DealDetailPanel) ───────────────────── */
const T = {
  primary: '#0F172A',
  accent: '#F4A261',
  success: '#16A34A',
  border: 'rgba(15,23,42,0.08)',
  muted: '#6B7280',
  font: '"Plus Jakarta Sans", sans-serif',
};

/* ─── User Location Marker ────────────────────────────────────────────────*/
const userDotIcon = L.divIcon({
  className: '',
  html: `<div class="dm-user-dot-wrapper">
           <div class="dm-user-pulse"></div>
           <div class="dm-user-dot"></div>
         </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

/* ─── Map auto-fit helper ─────────────────────────────────────────────────*/
const MapBoundsFitter = ({ userLocation, shopLocation, routeCoords }) => {
  const map = useMap();
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!userLocation || !shopLocation) return;
    if (fittedRef.current) return;

    const points = routeCoords?.length ? routeCoords : [userLocation, shopLocation];

    try {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16, animate: true });
      fittedRef.current = true;
    } catch (_) {
      /* bounds calc failed — ignore */
    }
  }, [map, userLocation, shopLocation, routeCoords]);

  return null;
};

/* ─── Info Strip ─────────────────────────────────────────────────────────
 * Single source of truth for distance/duration — the modal header only
 * shows a short status line, so numbers aren't repeated in two places. */
const InfoStrip = ({ distance, duration, mode, onModeChange, routeLoading }) => (
  <div
    style={{
      position: 'absolute',
      bottom: 0, left: 0, right: 0,
      zIndex: 800,
      background: '#fff',
      borderTop: `1px solid ${T.border}`,
      boxShadow: '0 -6px 20px rgba(15,23,42,0.08)',
      borderRadius: '18px 18px 0 0',
      padding: '14px 18px 18px',
      animation: 'dmSlideUp 0.3s ease',
    }}
  >
    <div style={{ width: 34, height: 4, borderRadius: 2, background: 'rgba(15,23,42,0.12)', margin: '0 auto 12px' }} />

    {routeLoading ? (
      <div style={{ textAlign: 'center', padding: '6px 0 12px', fontFamily: T.font, fontSize: 13, color: T.muted }}>
        Calculating route…
      </div>
    ) : distance && duration ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: T.font, fontWeight: 800, fontSize: 20, color: T.primary }}>{duration}</span>
          <span style={{ fontFamily: T.font, fontSize: 12, color: T.muted }}>· {distance}</span>
        </div>
        <div style={{
          marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
          background: T.success, flexShrink: 0,
        }} />
        <span style={{ fontFamily: T.font, fontSize: 11, color: T.success, fontWeight: 700 }}>Fastest route</span>
      </div>
    ) : null}

    <div style={{ display: 'flex', gap: 8 }}>
      {[
        { value: 'driving', label: 'Driving', icon: <DirectionsCarIcon/> },
        { value: 'walking', label: 'Walking', icon: <DirectionsWalkIcon/> },
      ].map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          style={{
            display: "flex", alignItems: "center",flex: 1, justifyContent: "center", gap: 2, border: 'none', borderRadius: 10, padding: '9px 12px',
            fontFamily: T.font, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            background: mode === m.value ? T.primary : 'rgba(15,23,42,0.05)',
            color: mode === m.value ? '#fff' : '#374151',
            transition: 'background 0.18s ease',
          }}
        >
         <span>{m.icon}</span>
         <span>{m.label}</span> 
        </button>
      ))}
    </div>
  </div>
);

/* ─── Status screens ──────────────────────────────────────────────────────*/
const StatusScreen = ({ icon, iconBg, title, message, children }) => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16,
    background: '#FAFBFF', padding: '0 28px',
    animation: 'dmFadeIn 0.3s ease',
  }}>
    <div style={{
      width: 64, height: 64, borderRadius: 18, background: iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 28, boxShadow: '0 8px 24px rgba(15,23,42,0.14)',
    }}>{icon}</div>
    <div>
      <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: 15, color: T.primary, textAlign: 'center', marginBottom: 6 }}>
        {title}
      </div>
      {message && (
        <div style={{ fontFamily: T.font, fontSize: 13, color: T.muted, textAlign: 'center', lineHeight: 1.6 }}>
          {message}
        </div>
      )}
    </div>
    {children}
  </div>
);

const RetryButton = ({ onClick, label = 'Try Again' }) => (
  <button
    onClick={onClick}
    style={{
      border: 'none', borderRadius: 11, padding: '11px 28px',
      fontFamily: T.font, fontWeight: 700, fontSize: 13, cursor: 'pointer',
      background: T.primary, color: '#fff',
      boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
    }}
  >
    {label}
  </button>
);

/* ─── Route Map ──────────────────────────────────────────────────────────*/
const RouteMap = ({ userLocation, shopLocation, routeCoords }) => {
  const center = userLocation ?? shopLocation ?? [20.5937, 78.9629];

  return (
    <MapContainer center={center} zoom={14} zoomControl={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution="&copy; OpenStreetMap &copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="topright" />
      <MapBoundsFitter userLocation={userLocation} shopLocation={shopLocation} routeCoords={routeCoords} />

      {routeCoords && routeCoords.length > 0 && (
        <Polyline
          positions={routeCoords}
          pathOptions={{ color: '#2563EB', weight: 5, opacity: 0.82, lineCap: 'round', lineJoin: 'round' }}
        />
      )}

      {userLocation && <Marker position={userLocation} icon={userDotIcon} />}
      {shopLocation && <Marker position={shopLocation} icon={customIcon} />}
    </MapContainer>
  );
};

/* ─── MAIN COMPONENT ───────────────────────────────────────────────────── */
const DirectionsModal = ({ open, onClose, shopLat, shopLng, shopName }) => {
  const [mode, setMode] = useState('driving');
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const {
    userLocation, routeCoords, distance, duration,
    gpsLoading, routeLoading, error, permissionDenied, retry,
  } = useDirections(shopLat, shopLng, mode, shopName);

  const shopLocation = useMemo(
    () => (shopLat && shopLng ? [Number(shopLat), Number(shopLng)] : null),
    [shopLat, shopLng],
  );

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (open) setHasOpenedOnce(true);
  }, [open]);

  if (!hasOpenedOnce) return null;

  const showMap = !gpsLoading && !permissionDenied && !error;

  // Short, single-line status for the header — numbers live only in the InfoStrip.
  const headerStatus = gpsLoading
    ? 'Getting your location…'
    : permissionDenied
    ? 'Location access needed'
    : error && !routeCoords
    ? 'Route unavailable'
    : routeLoading
    ? 'Finding the fastest route…'
    : userLocation
    ? 'Route ready'
    : 'Waiting for GPS…';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(4px)',
        alignItems: 'flex-end',
        justifyContent: 'center',
        display: open ? 'flex' : 'none',
        animation: open ? 'dmFadeIn 0.2s ease' : 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 540,
          height: '88dvh',
          background: '#fff',
          borderRadius: '18px 18px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 40px rgba(15,23,42,0.2)',
          animation: 'dmSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0,
          }}><DirectionsIcon/></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: T.font, fontWeight: 700, fontSize: 14, color: T.primary,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              Directions to {shopName}
            </div>
            <div style={{ fontFamily: T.font, fontSize: 11, color: T.muted, marginTop: 1 }}>
              {headerStatus}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close directions"
            style={{
              width: 32, height: 32, borderRadius: 9,
              border: `1px solid ${T.border}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.muted, fontSize: 15, flexShrink: 0,
            }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {gpsLoading && (
            <StatusScreen icon={<LocationOnIcon sx={{ fontSize: 'inherit' }} />} iconBg="#EEF2FF" title="Detecting your location…" message="Please allow location access when prompted." />
          )}

          {!gpsLoading && permissionDenied && (
            <StatusScreen
              icon={<BlockIcon sx={{ fontSize: 'inherit' }} />} iconBg="#FEE2E2" title="Location access denied"
              message="Enable location access in your browser settings, then try again."
            >
              <RetryButton onClick={retry} />
            </StatusScreen>
          )}

          {!gpsLoading && !permissionDenied && error && !routeCoords && (
            <StatusScreen icon={<WarningIcon sx={{ fontSize: 'inherit' }} />} iconBg="#FEF3C7" title="Couldn't calculate a route" message={error}>
              <RetryButton onClick={retry} />
            </StatusScreen>
          )}

          {showMap && (
            <div style={{ flex: 1, position: 'relative' }}>
              <RouteMap userLocation={userLocation} shopLocation={shopLocation} routeCoords={routeCoords} />

              {error && (
                <div style={{
                  position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(220,38,38,0.92)', backdropFilter: 'blur(8px)',
                  color: '#fff', padding: '7px 14px', borderRadius: 20, fontSize: 12,
                  fontFamily: T.font, fontWeight: 600, zIndex: 900, whiteSpace: 'nowrap',
                }}>
                  {error}
                </div>
              )}

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
