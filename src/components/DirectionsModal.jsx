import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Map,
  useMap,
} from '@vis.gl/react-google-maps';
import { useDirections } from '../hooks/useDirections';
import { CLEAN_MAP_STYLES } from '../styles/mapStyles';
import { MOBILE_SHEET_HEIGHT } from '../styles/mobileSheet';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BlockIcon from '@mui/icons-material/Block';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StraightenIcon from '@mui/icons-material/Straighten';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MyLocationIcon from '@mui/icons-material/MyLocation';

/* ─── Styles ─────────────────────────────────────────────────────────── */
const STYLES = `
@keyframes dmUp   { from { opacity:0; transform:translateY(40px) } to { opacity:1; transform:translateY(0) } }
@keyframes dmFade { from { opacity:0 } to { opacity:1 } }
@keyframes dmSpin { to { transform:rotate(360deg) } }

.dm-ctrl-btn {
  transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease, background 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}
.dm-ctrl-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(0,0,0,0.25) !important;
}
.dm-ctrl-btn:active {
  transform: scale(0.92);
}

.dm-mode-btn {
  transition: all .2s ease;
}
.dm-gmaps-btn {
  transition: transform .18s cubic-bezier(.34,1.56,.64,1), box-shadow .18s ease;
}
.dm-gmaps-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26,115,232,.45) !important;
}
.dm-gmaps-btn:active {
  transform: translateY(0);
}
`;

if (typeof document !== 'undefined' && !document.getElementById('dm-v4-styles')) {
  const s = document.createElement('style');
  s.id = 'dm-v4-styles';
  s.textContent = STYLES;
  document.head.appendChild(s);
}

const T = {
  bg: '#0F172A',
  accent: '#F4A261',
  blue: '#2563EB',
  border: 'rgba(15,23,42,0.08)',
  muted: '#6B7280',
  surface: '#FFFFFF',
};

/* ─── Route Renderer ─── */
const RouteRenderer = ({ userLocation, shopLat, shopLng, routePolyline }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !window.google?.maps) return;

    // 1. Draw route polyline
    let polyline = null;
    if (routePolyline && routePolyline.length > 0) {
      polyline = new window.google.maps.Polyline({
        path: routePolyline,
        geodesic: true,
        strokeColor: '#2563EB',
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map,
      });
    }

    // 2. Add Markers for User and Destination
    const markers = [];

    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: { lat: userLocation[0], lng: userLocation[1] },
        map,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
        },
      });
      markers.push(userMarker);
    }

    if (shopLat && shopLng) {
      const shopMarker = new window.google.maps.Marker({
        position: { lat: Number(shopLat), lng: Number(shopLng) },
        map,
        title: 'Destination',
      });
      markers.push(shopMarker);
    }

    // 3. Fit bounds to see entire route
    const bounds = new window.google.maps.LatLngBounds();
    if (routePolyline && routePolyline.length > 0) {
      routePolyline.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { top: 35, right: 35, bottom: 35, left: 35 });
    } else if (userLocation && shopLat && shopLng) {
      bounds.extend({ lat: userLocation[0], lng: userLocation[1] });
      bounds.extend({ lat: Number(shopLat), lng: Number(shopLng) });
      map.fitBounds(bounds, { top: 35, right: 35, bottom: 35, left: 35 });
    }

    return () => {
      if (polyline) polyline.setMap(null);
      markers.forEach((m) => m.setMap(null));
    };
  }, [map, userLocation, shopLat, shopLng, routePolyline]);

  return null;
};

/* ─── Modern Custom Zoom Controls Overlay ─── */
const CustomMapControls = ({ userLocation, shopLat, shopLng, routePolyline }) => {
  const map = useMap();

  const handleZoomIn = useCallback(() => {
    if (map) map.setZoom((map.getZoom() || 14) + 1);
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) map.setZoom((map.getZoom() || 14) - 1);
  }, [map]);

  const handleRecenter = useCallback(() => {
    if (!map || !window.google?.maps) return;
    const bounds = new window.google.maps.LatLngBounds();
    if (routePolyline && routePolyline.length > 0) {
      routePolyline.forEach((pt) => bounds.extend(pt));
      map.fitBounds(bounds, { top: 35, right: 35, bottom: 35, left: 35 });
    } else if (userLocation && shopLat && shopLng) {
      bounds.extend({ lat: userLocation[0], lng: userLocation[1] });
      bounds.extend({ lat: Number(shopLat), lng: Number(shopLng) });
      map.fitBounds(bounds, { top: 35, right: 35, bottom: 35, left: 35 });
    }
  }, [map, userLocation, shopLat, shopLng, routePolyline]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Recenter Button */}
      <button
        type="button"
        className="dm-ctrl-btn"
        onClick={handleRecenter}
        title="Fit route"
        aria-label="Fit route"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
          color: T.bg,
        }}
      >
        <MyLocationIcon sx={{ fontSize: 18 }} />
      </button>

      {/* Modern Stacked Zoom Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 10,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <button
          type="button"
          className="dm-ctrl-btn"
          onClick={handleZoomIn}
          title="Zoom in"
          aria-label="Zoom in"
          style={{
            width: 36,
            height: 36,
            color: T.bg,
            borderBottom: '1px solid rgba(15,23,42,0.08)',
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
        </button>
        <button
          type="button"
          className="dm-ctrl-btn"
          onClick={handleZoomOut}
          title="Zoom out"
          aria-label="Zoom out"
          style={{
            width: 36,
            height: 36,
            color: T.bg,
          }}
        >
          <RemoveIcon sx={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, sub }) => (
  <div
    style={{
      flex: 1,
      background: '#F8FAFC',
      borderRadius: 14,
      padding: '12px 14px',
      border: `1px solid ${T.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: T.muted }}>
      {icon}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        {label}
      </span>
    </div>
    <div style={{ fontWeight: 800, fontSize: 18, color: T.bg, lineHeight: 1.1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 11, color: T.muted }}>{sub}</div>}
  </div>
);

/* ─── Directions Modal ─── */
const DirectionsModal = ({ open, onClose, shopLat, shopLng, shopName }) => {
  const [mode, setMode] = useState('DRIVE'); // 'DRIVE' or 'WALK'
  const [hasOpened, setHasOpened] = useState(false);

  const {
    userLocation,
    distance,
    duration,
    routePolyline,
    gpsLoading,
    routeLoading,
    permissionDenied,
    retry,
    googleMapsUrl,
  } = useDirections(shopLat, shopLng, mode);

  useEffect(() => {
    if (open) setHasOpened(true);
  }, [open]);

  const center = useMemo(() => {
    if (userLocation) return { lat: userLocation[0], lng: userLocation[1] };
    if (shopLat && shopLng) return { lat: Number(shopLat), lng: Number(shopLng) };
    return { lat: 10.9678, lng: 78.062 };
  }, [userLocation, shopLat, shopLng]);

  if (!open && !hasOpened) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Directions to ${shopName}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(5px)',
        animation: 'dmFade .2s ease',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 540,
          height: MOBILE_SHEET_HEIGHT,
          maxHeight: MOBILE_SHEET_HEIGHT,
          margin: '0 auto',
          background: T.surface,
          borderRadius: '24px 24px 0 0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -12px 48px rgba(15,23,42,0.25)',
          animation: 'dmUp .3s cubic-bezier(.34,1.56,.64,1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 10, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(15,23,42,0.15)' }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '8px 18px 12px',
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg,#0F172A 0%,#1e3a5f 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <LocationOnIcon sx={{ fontSize: 20, color: '#F4A261' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>
              Directions to
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: T.bg,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {shopName || 'Destination'}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              border: `1px solid ${T.border}`,
              background: '#F8FAFC',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: T.muted,
            }}
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        {/* Interactive Map Preview with Polyline Route */}
        <div style={{ position: 'relative', width: '100%', flex: '1 1 260px', minHeight: 180, background: '#e2e8f0' }}>
          <Map
            defaultCenter={center}
            defaultZoom={14}
            styles={CLEAN_MAP_STYLES}
            disableDefaultUI={true}
            style={{ width: '100%', height: '100%' }}
          >
            <RouteRenderer
              userLocation={userLocation}
              shopLat={shopLat}
              shopLng={shopLng}
              routePolyline={routePolyline}
            />
            <CustomMapControls
              userLocation={userLocation}
              shopLat={shopLat}
              shopLng={shopLng}
              routePolyline={routePolyline}
            />
          </Map>

          {(gpsLoading || routeLoading) && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: T.blue,
                zIndex: 10,
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'dmSpin .8s linear infinite',
                }}
              />
              {gpsLoading ? 'Detecting your location…' : 'Calculating route path…'}
            </div>
          )}
        </div>

        {/* Details & Action Controls */}
        <div style={{ padding: '16px 20px 22px', display: 'flex', flexDirection: 'column', gap: 14, flex: '0 1 auto', overflowY: 'auto' }}>
          {permissionDenied && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#B91C1C', fontSize: 13 }}>
                <BlockIcon sx={{ fontSize: 18 }} />
                <span>Location access denied</span>
              </div>
              <button
                onClick={retry}
                style={{
                  border: 'none',
                  background: '#B91C1C',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 10 }}>
            <StatCard
              icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
              label="Estimated Time"
              value={duration || '—'}
              sub={routeLoading ? 'Calculating…' : `via ${mode === 'DRIVE' ? 'roads' : 'walkways'}`}
            />
            <StatCard
              icon={<StraightenIcon sx={{ fontSize: 16 }} />}
              label="Route Distance"
              value={distance || '—'}
              sub="actual road distance"
            />
          </div>

          {/* Mode Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(15,23,42,0.05)',
              borderRadius: 12,
              padding: 4,
              gap: 6,
            }}
          >
            {[
              { id: 'DRIVE', label: 'Driving', icon: <DirectionsCarIcon sx={{ fontSize: 18 }} /> },
              { id: 'WALK', label: 'Walking', icon: <DirectionsWalkIcon sx={{ fontSize: 18 }} /> },
            ].map((m) => (
              <button
                key={m.id}
                className="dm-mode-btn"
                onClick={() => setMode(m.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  border: 'none',
                  borderRadius: 8,
                  padding: '9px 12px',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: mode === m.id ? T.bg : 'transparent',
                  color: mode === m.id ? '#fff' : '#4B5563',
                  boxShadow: mode === m.id ? '0 2px 8px rgba(15,23,42,0.2)' : 'none',
                }}
              >
                {m.icon}
                {m.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DirectionsModal;
