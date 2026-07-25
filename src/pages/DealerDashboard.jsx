import React, { useState } from 'react';
import { useGetMyShops } from '../hooks/useGetMyShops';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import WarningIcon from '@mui/icons-material/Warning';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


// ─── Theme tokens (matches your MUI theme) ───────────────────────────────────
const T = {
  primaryMain:   '#0F172A',
  secondaryMain: '#F4A261',
  bgDefault:     '#ebebeb',
  bgPaper:       '#fbfbfb',
  bgWhite:       '#FFFFFF',
  textPrimary:   '#192235',
  textSecondary: '#6B7280',
  border:        '#E5E7EB',
  borderStrong:  '#D1D5DB',
  success:       '#16A34A',
  successBg:     '#DCFCE7',
  warning:       '#D97706',
  warningBg:     '#FEF3C7',
  error:         '#DC2626',
  font:          '"Plus Jakarta Sans", sans-serif',
};

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.45); }
  50%       { box-shadow: 0 0 0 4px rgba(22,163,74,0); }
}
@keyframes pulse-warn {
  0%, 100% { box-shadow: 0 0 0 0 rgba(217,119,6,0.4); }
  50%       { box-shadow: 0 0 0 4px rgba(217,119,6,0); }
}
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes toast-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
* { box-sizing: border-box; }

/* hide scrollbar for the filter-tab / stats strips on mobile while keeping scroll */
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ─── Live clock ───────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span
      style={{
        fontFamily: T.font,
        fontSize: "12px",
        fontWeight: 500,
        color: T.textSecondary,
      }}
    >
      {time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })}
    </span>
  );
};

// ─── Skeleton row (desktop table) ─────────────────────────────────────────────
const SkeletonRow = ({ index }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '36px 1fr 150px 170px 110px 60px',
    alignItems: 'center',
    gap: '0 16px',
    padding: '13px 20px',
    borderBottom: `1px solid ${T.border}`,
  }}>
    {[32, '70%', 80, 100, 60, 24].map((w, i) => (
      <div key={i} style={{
        height: 11,
        width: typeof w === 'number' ? w : w,
        borderRadius: 6,
        background: 'linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        animationDelay: `${index * 0.08}s`,
      }} />
    ))}
  </div>
);

// ─── Skeleton card (mobile list) ──────────────────────────────────────────────
const SkeletonCard = ({ index }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '16px', borderBottom: `1px solid ${T.border}`, background: T.bgWhite,
  }}>
    <div style={{
      width: 50, height: 50, borderRadius: '12px', flexShrink: 0,
      background: 'linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%)',
      backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease-in-out infinite',
      animationDelay: `${index * 0.08}s`,
    }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{
        height: 12, width: '60%', borderRadius: 6,
        background: 'linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%)',
        backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease-in-out infinite',
        animationDelay: `${index * 0.08}s`,
      }} />
      <div style={{
        height: 10, width: '35%', borderRadius: 6,
        background: 'linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%)',
        backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease-in-out infinite',
        animationDelay: `${index * 0.08}s`,
      }} />
    </div>
  </div>
);

// ─── Shop row (desktop table row OR mobile card) ──────────────────────────────
const ShopRow = ({ shop, index, navigate, onPendingClick, isMobile }) => {
  const [hovered, setHovered] = useState(false);

  if (isMobile) {
    return (
      <div
        onClick={() => shop.isVerified
          ? navigate(`/shop/${shop._id}/deals`)
          : onPendingClick('Please wait for this shop to be verified before adding offers.')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderBottom: `1px solid ${T.border}`,
          background: T.bgWhite,
          cursor: shop.isVerified ? 'pointer' : 'default',
          opacity: shop.isVerified ? 1 : 0.8,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{
          width: 46, height: 46, borderRadius: '12px',
          overflow: 'hidden', flexShrink: 0,
          border: `1px solid ${T.border}`,
          background: T.bgDefault,
        }}>
          <img
            src={shop.shopImage || 'https://via.placeholder.com/50x50?text=S'}
            alt={shop.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: T.font, fontWeight: 700, fontSize: '14px',
            color: T.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {shop.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
             <span style={{
              padding: '2px 8px', borderRadius: 12,
              fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap',
              background: shop.isVerified ? T.successBg : T.warningBg,
              color: shop.isVerified ? T.success : T.warning,
            }}>
              {shop.isVerified ? 'Verified' : 'Pending'}
            </span>
            <span style={{
              fontSize: '11px', color: T.textSecondary, opacity: 0.8,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140,
            }}>
              {shop.category || '—'}
            </span>
          </div>
          <div style={{
            fontSize: '11px', color: T.textSecondary, opacity: 0.65, marginTop: 3,
            display: 'flex', alignItems: 'center', gap: 4,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            <LocationPinIcon style={{ fontSize: '11px' }} /> {shop.address?.city || '—'}
          </div>
        </div>
        <div style={{ color: T.borderStrong, flexShrink: 0, display: 'flex', alignItems: 'center' }}><ArrowForwardIcon sx={{ fontSize: 18 }} /></div>
      </div>
    );
  }

  return (
    <div
      onClick={() => shop.isVerified
        ? navigate(`/shop/${shop._id}/deals`)
        : onPendingClick('Please wait for this shop to be verified before adding offers.')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 1fr 150px 170px 110px 60px',
        alignItems: 'center',
        gap: '0 16px',
        padding: '13px 20px',
        borderBottom: `1px solid ${T.border}`,
        cursor: shop.isVerified ? 'pointer' : 'default',
        background: hovered ? (shop.isVerified ? '#F8FAFF' : '#FAFAFA') : T.bgWhite,
        transition: 'background 0.12s ease',
        animation: 'slide-in 0.28s ease both',
        animationDelay: `${index * 0.04}s`,
        opacity: shop.isVerified ? 1 : 0.72,
      }}
    >
      {/* Index */}
      <span style={{ fontFamily: T.font, fontWeight: 600, fontSize: '12px', color: T.textSecondary, opacity: 0.55 }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Shop + thumbnail */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
        <div style={{
          width: 38, height: 38, borderRadius: '10px',
          overflow: 'hidden', flexShrink: 0,
          border: `1px solid ${T.border}`,
          background: T.bgDefault,
        }}>
          <img
            src={shop.shopImage || 'https://via.placeholder.com/38x38?text=S'}
            alt={shop.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{
            fontFamily: T.font, fontWeight: 700, fontSize: '14px',
            color: hovered && shop.isVerified ? T.primaryMain : T.textPrimary,
            transition: 'color 0.12s',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {shop.name}
          </div>
          <div style={{ fontFamily: T.font, fontWeight: 400, fontSize: '11px', color: T.textSecondary, marginTop: 1, opacity: 0.65 }}>
            #{shop._id?.slice(-6)?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Category */}
      <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: '13px', color: T.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {shop.category || '—'}
      </div>

      {/* Location */}
      <div style={{ fontFamily: T.font, fontWeight: 400, fontSize: '13px', color: T.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
        <LocationPinIcon style={{ fontSize: '11px' }} />
        {shop.address?.city || '—'}
      </div>

      {/* Status pill */}
      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '3px 10px', borderRadius: 20,
          fontSize: '11px', fontWeight: 700, fontFamily: T.font,
          background: shop.isVerified ? T.successBg : T.warningBg,
          color: shop.isVerified ? T.success : T.warning,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: shop.isVerified ? T.success : T.warning,
            animation: shop.isVerified ? 'pulse-dot 2.5s ease-in-out infinite' : 'pulse-warn 2.5s ease-in-out infinite',
          }} />
          {shop.isVerified ? 'Verified' : 'Pending'}
        </span>
      </div>

      {/* Arrow */}
      <div style={{
        textAlign: 'right', fontSize: '16px',
        color: hovered && shop.isVerified ? T.secondaryMain : T.borderStrong,
        transition: 'all 0.12s',
        transform: hovered && shop.isVerified ? 'translateX(3px)' : 'translateX(0)',
      }}>
        <ArrowForwardIcon sx={{ fontSize: 18 }} />
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const DealerDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const [toastOpen, setToastOpen]     = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [filter, setFilter]           = useState('all');
  const { data: response, isLoading, error } = useGetMyShops();
  const shops = response?.data || [];

  const verified = shops.filter(s => s.isVerified).length;
  const pending  = shops.filter(s => !s.isVerified).length;
  const filtered = shops.filter(s => {
    if (filter === 'verified') return s.isVerified;
    if (filter === 'pending')  return !s.isVerified;
    return true;
  });

  React.useEffect(() => {
    if (!toastOpen) return;
    const t = setTimeout(() => setToastOpen(false), 4000);
    return () => clearTimeout(t);
  }, [toastOpen]);

  // responsive spacing tokens
  const pageX = isSmall ? '16px' : isMobile ? '20px' : '28px';

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', background: T.bgDefault, color: T.textPrimary, fontFamily: T.font }}>

        {/* ── Top bar ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: T.bgWhite,
          borderBottom: `1px solid ${T.border}`,
          padding: `0 ${pageX}`, height: isSmall ? 48 : 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, overflow: 'hidden' }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: T.success,
              display: 'inline-block', flexShrink: 0,
              animation: 'pulse-dot 2.5s ease-in-out infinite',
            }} />
            <span style={{
              fontFamily: T.font, fontWeight: 700, fontSize: '11px', color: T.textSecondary,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              Dealer Portal
            </span>
            {!isSmall && (
              <>
                <span style={{ color: T.border }}>|</span>
                <LiveClock />
              </>
            )}
          </div>
          <button
            onClick={() => navigate('/add-shop')}
            style={{
              background: T.primaryMain, border: 'none',
              color: '#fff', fontFamily: T.font, fontWeight: 600,
              fontSize: '12px', padding: isSmall ? '8px 12px' : '9px 16px',
              borderRadius: '8px', cursor: 'pointer', transition: 'opacity 0.15s',
              flexShrink: 0, whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {isSmall ? '+ Shop' : '+ New Shop'}
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: `${isSmall ? 18 : 28}px ${pageX} 0` }}>

          {/* Page title */}
          <div style={{ marginBottom: isSmall ? 16 : 22, animation: 'fade-up 0.35s ease both' }}>
            <h1 style={{ fontFamily: T.font, fontWeight: 800, fontSize: 'clamp(20px, 5vw, 30px)', margin: '0 0 4px', color: T.textPrimary, letterSpacing: '-0.02em' }}>
              Shop Operations
            </h1>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: T.textSecondary }}>
              Select a verified shop to manage offers and deals
            </p>
          </div>

          {/* Stats strip — horizontally scrollable, equal-width on mobile */}
          <div
            className="no-scrollbar"
            style={{
              display: 'flex', gap: 0, marginBottom: isSmall ? 16 : 22,
              animation: 'fade-up 0.35s ease 0.07s both',
              borderRadius: 10, overflow: isMobile ? 'auto' : 'hidden',
              border: `1px solid ${T.border}`,
              width: isMobile ? '100%' : 'fit-content',
            }}
          >
            {[
              { label: 'Total Shops', value: shops.length, accent: T.textPrimary },
              { label: 'Verified',    value: verified,      accent: T.success },
              { label: 'Pending',     value: pending,       accent: T.warning },
            ].map((s, i) => (
              <div key={i} style={{
                padding: isSmall ? '10px 16px' : '12px 24px', background: T.bgWhite,
                borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
                minWidth: isMobile ? 0 : 108,
                flex: isMobile ? '1 1 0' : '0 0 auto',
              }}>
                <div style={{
                  fontFamily: T.font, fontWeight: 500, fontSize: isSmall ? '10px' : '11px',
                  color: T.textSecondary, marginBottom: 4, whiteSpace: 'nowrap',
                }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: isSmall ? '18px' : '22px', color: s.accent, lineHeight: 1 }}>
                  {isLoading ? '—' : s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div
            className="no-scrollbar"
            style={{
              display: 'flex', borderBottom: `1px solid ${T.border}`,
              animation: 'fade-up 0.35s ease 0.12s both',
              overflowX: 'auto', whiteSpace: 'nowrap',
            }}
          >
            {[
              { key: 'all',      label: 'All',      count: null },
              { key: 'verified', label: 'Verified', count: verified },
              { key: 'pending',  label: 'Pending',  count: pending },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: filter === f.key ? `2px solid ${T.secondaryMain}` : '2px solid transparent',
                  color: filter === f.key ? T.textPrimary : T.textSecondary,
                  fontFamily: T.font, fontWeight: filter === f.key ? 700 : 500,
                  fontSize: '13px', padding: isSmall ? '8px 12px' : '9px 18px',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'all 0.13s', marginBottom: '-1px',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
              >
                {f.label}
                {f.count !== null && (
                  <span style={{
                    background: filter === f.key ? T.secondaryMain : T.bgDefault,
                    color: filter === f.key ? '#fff' : T.textSecondary,
                    fontSize: '10px', fontWeight: 700,
                    padding: '1px 6px', borderRadius: 10,
                    transition: 'all 0.13s',
                  }}>
                    {f.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table / mobile list ── */}
        <div style={{ padding: `0 ${pageX} ${isSmall ? 32 : 48}px` }}>
          <div style={{
            background: T.bgWhite,
            borderRadius: '9px',
            border: `1px solid ${T.border}`,
            borderTop: 'none',
            overflow: 'hidden',
          }}>
            {/* Col headers - desktop/tablet only, real table is grid so no horizontal scroll needed there */}
            {!isMobile && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr 150px 170px 110px 60px',
                gap: '0 16px', padding: '10px 20px',
                borderBottom: `1px solid ${T.border}`,
                background: '#F9FAFB',
              }}>
                {['#', 'Shop', 'Category', 'Location', 'Status', ''].map((h, i) => (
                  <span key={i} style={{
                    fontFamily: T.font, fontWeight: 600, fontSize: '11px',
                    color: T.textSecondary, letterSpacing: '0.04em',
                    textTransform: 'uppercase', textAlign: i === 5 ? 'right' : 'left',
                  }}>
                    {h}
                  </span>
                ))}
              </div>
            )}

            {isLoading && (isMobile
              ? [0, 1, 2, 3].map(i => <SkeletonCard key={i} index={i} />)
              : [0, 1, 2, 3, 4].map(i => <SkeletonRow key={i} index={i} />)
            )}

            {error && (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: T.font, fontSize: '13px', color: T.error, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <WarningIcon sx={{ fontSize: 16 }} /> Failed to load shops. Please try again later.
              </div>
            )}

            {!isLoading && !error && shops.length === 0 && (
              <div style={{ padding: isSmall ? '44px 16px' : '60px 20px', textAlign: 'center', animation: 'fade-up 0.3s ease both' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '14px',
                  background: T.bgDefault, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}><StorefrontIcon sx={{ fontSize: 24, color: T.textSecondary }} /></div>
                <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: '14px', color: T.textPrimary, marginBottom: 6 }}>
                  No shops yet
                </div>
                <div style={{ fontFamily: T.font, fontSize: '13px', color: T.textSecondary, marginBottom: 20 }}>
                  Register your first shop to start adding deals.
                </div>
                <button
                  onClick={() => navigate('/add-shop')}
                  style={{
                    background: T.primaryMain, border: 'none', color: '#fff',
                    fontFamily: T.font, fontWeight: 600, fontSize: '13px',
                    padding: '9px 22px', borderRadius: '8px', cursor: 'pointer',
                  }}
                >
                  + Register Shop
                </button>
              </div>
            )}

            {!isLoading && filtered.map((shop, i) => (
              <ShopRow
                key={shop._id}
                shop={shop}
                index={i}
                navigate={navigate}
                isMobile={isMobile}
                onPendingClick={(msg) => { setToastMessage(msg); setToastOpen(true); }}
              />
            ))}

            {!isLoading && shops.length > 0 && filtered.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: T.font, fontSize: '13px', color: T.textSecondary }}>
                No {filter} shops found.
              </div>
            )}
          </div>
        </div>

        {/* ── Toast ── full-width bottom sheet on mobile, floating card on desktop */}
        {toastOpen && (
          <div
            onClick={() => setToastOpen(false)}
            style={{
              position: 'fixed',
              bottom: isSmall ? 0 : 24,
              right: isSmall ? 0 : 24,
              left: isSmall ? 0 : 'auto',
              background: T.bgWhite,
              border: `1px solid ${T.border}`,
              borderLeft: isSmall ? `1px solid ${T.border}` : `3px solid ${T.warning}`,
              borderTop: isSmall ? `3px solid ${T.warning}` : `1px solid ${T.border}`,
              borderRadius: isSmall ? '9px' : '10px',
              padding: '13px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              animation: 'toast-in 0.2s ease both',
              cursor: 'pointer', zIndex: 999,
              maxWidth: isSmall ? 'none' : 340,
              width: isSmall ? '100%' : 'auto',
              boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
            }}
          >
            <WarningIcon sx={{ fontSize: 18, color: T.warning, mt: '1px' }} />
            <div>
              <div style={{ fontFamily: T.font, fontWeight: 700, fontSize: '12px', color: T.warning, marginBottom: 2 }}>
                Shop not verified
              </div>
              <div style={{ fontFamily: T.font, fontSize: '12px', color: T.textSecondary, lineHeight: 1.5 }}>
                {toastMessage}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DealerDashboard;