import React, { useEffect, useState } from 'react';
import { Alert, Container } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetShopDeals } from '../hooks/useGetShopDeals';
import { updateDeal } from '../api/dealApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

// ─── Theme tokens (same as DealerDashboard) ──────────────────────────────────
const T = {
  primaryMain:   '#0F172A',
  secondaryMain: '#F4A261',
  bgDefault:     '#ebebeb',
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

@keyframes slide-in {
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
* { box-sizing: border-box; }

/* ── Responsive visibility toggles ── */
.sd-desktop-table { display: block; }
.sd-mobile-cards   { display: none; }

.sd-page-pad     { padding-left: 28px; padding-right: 28px; }
.sd-topbar       { padding-left: 28px; padding-right: 28px; }

.sd-stats-strip {
  display: flex;
  width: fit-content;
}
.sd-stat-item { min-width: 120px; }

.sd-filter-tabs { display: flex; }

.sd-addbtn-label { display: inline; }

/* ── Table grid columns (class-based so media queries can retarget them) ── */
.sd-row-grid {
  display: grid;
  grid-template-columns: 36px 64px 1fr 130px 110px 120px 60px;
  gap: 0 16px;
}

@media (max-width: 1180px) {
  .sd-row-grid {
    grid-template-columns: 32px 56px 1fr 110px 95px 60px;
  }
  .sd-col-savings { display: none; }
}

@media (max-width: 1024px) {
  .sd-row-grid {
    grid-template-columns: 28px 48px 1fr 95px 60px;
  }
  .sd-col-discount { display: none; }
  .sd-desktop-table .sd-deal-desc { display: none; }
}

@media (max-width: 860px) {
  .sd-desktop-table { display: none; }
  .sd-mobile-cards   { display: block; }
}

@media (max-width: 640px) {
  .sd-page-pad, .sd-topbar { padding-left: 16px; padding-right: 16px; }

  .sd-stats-strip {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .sd-stats-strip::-webkit-scrollbar { display: none; }
  .sd-stat-item { min-width: 108px; flex-shrink: 0; }

  .sd-filter-tabs { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  .sd-filter-tabs::-webkit-scrollbar { display: none; }
  .sd-filter-tabs button { white-space: nowrap; }

  .sd-breadcrumb-portal { display: none; }
}
`;

// ─── Thumbnail strip (up to 3 images) ────────────────────────────────────────
const ThumbStrip = ({ images, size = 44 }) => {
  const fallback = 'https://via.placeholder.com/60x60?text=?';
  const imgs = images && images.length > 0 ? images.slice(0, 3) : [];
  const extra = images && images.length > 3 ? images.length - 3 : 0;

  if (imgs.length === 0) {
    return (
      <div style={{
        width: size, height: size, borderRadius: 10,
        background: T.bgDefault,
        border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}><LocalOfferIcon sx={{ fontSize: 18 }} /></div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
      {imgs.map((img, i) => (
        <div key={i} style={{
          width: size, height: size,
          borderRadius: 10,
          overflow: 'hidden',
          border: `2px solid ${T.bgWhite}`,
          marginLeft: i > 0 ? -35 : 0,
          zIndex: imgs.length - i,
          position: 'relative',
          background: T.bgDefault,
          flexShrink: 0,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}>
          <img
            src={img.url || fallback}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {extra > 0 && i === imgs.length - 1 && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(15,23,42,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8,
            }}>
              <span style={{
                fontFamily: T.font, fontWeight: 700, fontSize: '11px', color: '#fff',
              }}>+{extra}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Skeleton row (desktop table) ────────────────────────────────────────────
const SkeletonRow = ({ index }) => (
  <div className="sd-row-grid" style={{
    alignItems: 'center',
    padding: '13px 20px',
    borderBottom: `1px solid ${T.border}`,
  }}>
    {[28, 48, '65%', 70, 60, 80, 24].map((w, i) => (
      <div key={i} style={{
        height: i === 1 ? 44 : 11,
        width: typeof w === 'number' ? w : w,
        borderRadius: i === 1 ? 10 : 6,
        background: 'linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%)',
        backgroundSize: '400px 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        animationDelay: `${index * 0.07}s`,
      }} />
    ))}
  </div>
);

// ─── Skeleton card (mobile) ──────────────────────────────────────────────────
const SkeletonCard = ({ index }) => (
  <div style={{
    display: 'flex', gap: 12, padding: '14px 16px',
    borderBottom: `1px solid ${T.border}`,
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 10, flexShrink: 0,
      background: 'linear-gradient(90deg, #ebebeb 25%, #f5f5f5 50%, #ebebeb 75%)',
      backgroundSize: '400px 100%',
      animation: 'shimmer 1.4s ease-in-out infinite',
      animationDelay: `${index * 0.07}s`,
    }} />
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ height: 12, width: '70%', borderRadius: 6, background: '#ebebeb', backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: `${index * 0.07}s` }} />
      <div style={{ height: 10, width: '45%', borderRadius: 6, background: '#ebebeb', backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: `${index * 0.07}s` }} />
      <div style={{ height: 14, width: '35%', borderRadius: 6, background: '#ebebeb', backgroundSize: '400px 100%', animation: 'shimmer 1.4s ease-in-out infinite', animationDelay: `${index * 0.07}s` }} />
    </div>
  </div>
);

// ─── Deal row (desktop table) ────────────────────────────────────────────────
const DealRow = ({ deal, index, onEdit }) => {
  const [hovered, setHovered] = useState(false);
  const hasDiscount = deal.discountPercent > 0;
  const saving = deal.price && deal.dealPrice
    ? deal.price - deal.dealPrice
    : null;

  return (
    <div
      className="sd-row-grid"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        alignItems: 'center',
        padding: '13px 20px',
        borderBottom: `1px solid ${T.border}`,
        background: hovered ? '#F8FAFF' : T.bgWhite,
        transition: 'background 0.12s ease',
        animation: 'slide-in 0.28s ease both',
        animationDelay: `${index * 0.04}s`,
      }}
    >
      {/* Index */}
      <span style={{
        fontFamily: T.font, fontWeight: 600, fontSize: '12px',
        color: T.textSecondary, opacity: 0.5,
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Thumbnail stack */}
      <ThumbStrip images={deal.images} />

      {/* Title + description */}
      <div style={{ overflow: 'hidden', minWidth: 0 }}>
        <div style={{
          fontFamily: T.font, fontWeight: 700, fontSize: '14px',
          color: hovered ? T.primaryMain : T.textPrimary,
          transition: 'color 0.12s',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {deal.title}
        </div>
        {deal.description && (
          <div className="sd-deal-desc" style={{
            fontFamily: T.font, fontWeight: 400, fontSize: '12px',
            color: T.textSecondary, marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: '95%',
          }}>
            {deal.description}
          </div>
        )}
      </div>

      {/* Deal price */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: T.font, fontWeight: 800, fontSize: '15px',
          color: T.textPrimary, letterSpacing: '-0.3px',
        }}>
          ₹{deal.dealPrice}
        </div>
        {deal.price && (
          <div style={{
            fontFamily: T.font, fontWeight: 400, fontSize: '11px',
            color: T.textSecondary, textDecoration: 'line-through', marginTop: 1,
          }}>
            ₹{deal.price}
          </div>
        )}
      </div>

      {/* Discount badge */}
      <div className="sd-col-discount" style={{ minWidth: 0 }}>
        {hasDiscount ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 20,
            fontSize: '11px', fontWeight: 700, fontFamily: T.font,
            background: T.successBg, color: T.success,
            whiteSpace: 'nowrap',
          }}>
            <LocalOfferIcon sx={{ fontSize: 12 }} /> {deal.discountPercent}% OFF
          </span>
        ) : (
          <span style={{ fontFamily: T.font, fontSize: '12px', color: T.textSecondary, opacity: 0.4 }}>—</span>
        )}
      </div>

      {/* Savings */}
      <div className="sd-col-savings" style={{ minWidth: 0 }}>
        {saving !== null && saving > 0 ? (
          <div style={{
            fontFamily: T.font, fontWeight: 600, fontSize: '13px', color: T.success,
            whiteSpace: 'nowrap',
          }}>
            ₹{saving} saved
          </div>
        ) : (
          <span style={{ fontFamily: T.font, fontSize: '12px', color: T.textSecondary, opacity: 0.4 }}>—</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ textAlign: 'right', minWidth: 0, display: 'flex', gap: 8, justifyContent: 'flex-end', alignItems: 'center' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(deal); }}
          style={{
            cursor: 'pointer', background: 'transparent', border: '1px solid #E5E7EB', borderRadius: 6,
            color: T.textSecondary, fontSize: '12px', padding: '4px 8px', fontFamily: T.font, fontWeight: 600
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
};

// ─── Deal card (mobile) ──────────────────────────────────────────────────────
const DealCard = ({ deal, index, onEdit }) => {
  const hasDiscount = deal.discountPercent > 0;
  const saving = deal.price && deal.dealPrice
    ? deal.price - deal.dealPrice
    : null;
  const photoCount = deal.images ? deal.images.length : 0;

  return (
    <div
      style={{
        display: 'flex', gap: 12,
        padding: '14px 16px',
        borderBottom: `1px solid ${T.border}`,
        background: T.bgWhite,
        animation: 'fade-up 0.28s ease both',
        animationDelay: `${index * 0.03}s`,
      }}
    >
      <ThumbStrip images={deal.images} size={56} />

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8,
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontFamily: T.font, fontWeight: 700, fontSize: '14px',
              color: T.textPrimary,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {deal.title}
            </div>
            {deal.description && (
              <div style={{
                fontFamily: T.font, fontWeight: 400, fontSize: '12px',
                color: T.textSecondary, marginTop: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {deal.description}
              </div>
            )}
          </div>
          <span style={{
            fontFamily: T.font, fontWeight: 600, fontSize: '11px',
            color: T.textSecondary, opacity: 0.5, flexShrink: 0, marginTop: 1,
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Price row */}
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8, flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: T.font, fontWeight: 800, fontSize: '16px',
            color: T.textPrimary, letterSpacing: '-0.3px',
          }}>
            ₹{deal.dealPrice}
          </span>
          {deal.price && (
            <span style={{
              fontFamily: T.font, fontWeight: 400, fontSize: '12px',
              color: T.textSecondary, textDecoration: 'line-through',
            }}>
              ₹{deal.price}
            </span>
          )}
        </div>

        {/* Meta row: discount, savings, photos */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap',
        }}>
          {hasDiscount && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 20,
              fontSize: '11px', fontWeight: 700, fontFamily: T.font,
              background: T.successBg, color: T.success,
            }}>
              <LocalOfferIcon sx={{ fontSize: 12 }} /> {deal.discountPercent}% OFF
            </span>
          )}
          {saving !== null && saving > 0 && (
            <span style={{
              fontFamily: T.font, fontWeight: 600, fontSize: '12px', color: T.success,
            }}>
              ₹{saving} saved
            </span>
          )}
          {photoCount > 0 ? (
            <span style={{
              fontFamily: T.font, fontWeight: 500, fontSize: '11px',
              color: T.textSecondary,
              background: T.bgDefault,
              border: `1px solid ${T.border}`,
              borderRadius: 20, padding: '2px 8px',
              marginLeft: 'auto',
            }}>
              {photoCount} photo{photoCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <span style={{
              fontFamily: T.font, fontSize: '11px', color: T.textSecondary, opacity: 0.35,
              marginLeft: 'auto',
            }}>
              No photos
            </span>
          )}
          <button
            onClick={() => onEdit(deal)}
            style={{
              cursor: 'pointer', background: T.bgDefault, border: 'none', borderRadius: 6,
              color: T.textPrimary, fontSize: '12px', padding: '4px 12px', fontFamily: T.font, fontWeight: 600,
              marginLeft: 8
            }}
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const ShopDealsPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: response, isLoading, error } = useGetShopDeals(shopId);
  const deals = response?.deals || [];

  const [filter, setFilter] = useState('all');
  const [editingDeal, setEditingDeal] = useState(null);

  const { mutate: doUpdateDeal, isPending: updating } = useMutation({
    mutationFn: (data) => updateDeal(data._id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopDeals', shopId] });
      setEditingDeal(null);
    }
  });

  const handleEditSave = () => {
    doUpdateDeal({
      _id: editingDeal._id,
      payload: {
        title: editingDeal.title,
        description: editingDeal.description,
        price: editingDeal.price,
        dealPrice: editingDeal.dealPrice,
        validFrom: editingDeal.validFrom,
        validTill: editingDeal.validTill,
      }
    });
  };

  useEffect(() => {
    if (!isLoading && !error && deals.length === 0) {
      navigate(`/shop/${shopId}/add-deals`, { replace: true });
    }
  }, [isLoading, error, deals.length, navigate, shopId]);

  const withDiscount = deals.filter(d => d.discountPercent > 0);
  const noDiscount   = deals.filter(d => !d.discountPercent || d.discountPercent === 0);

  const filtered = filter === 'discounted' ? withDiscount
    : filter === 'full'       ? noDiscount
    : deals;

  const totalSavings = deals.reduce((acc, d) => {
    const s = (d.price || 0) - (d.dealPrice || 0);
    return acc + (s > 0 ? s : 0);
  }, 0);

  if (isLoading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={{ minHeight: '100vh', background: T.bgDefault, fontFamily: T.font }}>
          {/* Top bar skeleton */}
          <div className="sd-topbar" style={{
            height: 52, background: T.bgWhite,
            borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.border }} />
            <div style={{ width: 90, height: 11, borderRadius: 6, background: T.border }} />
          </div>
          <div className="sd-page-pad" style={{ paddingTop: 28 }}>
            <div style={{ width: 200, height: 28, borderRadius: 8, background: T.bgWhite, border: `1px solid ${T.border}`, marginBottom: 22 }} />
            <div style={{ background: T.bgWhite, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 40, background: '#F9FAFB', borderBottom: `1px solid ${T.border}` }} />
              <div className="sd-desktop-table">
                {[0,1,2,3,4].map(i => <SkeletonRow key={i} index={i} />)}
              </div>
              <div className="sd-mobile-cards">
                {[0,1,2,3,4].map(i => <SkeletonCard key={i} index={i} />)}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">Failed to load deals. Please try again.</Alert>
      </Container>
    );
  }

  if (deals.length === 0) return null;

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', background: T.bgDefault, fontFamily: T.font }}>

        {/* ── Top bar ── */}
        <div className="sd-topbar" style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: T.bgWhite,
          borderBottom: `1px solid ${T.border}`,
          height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Back + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <button
              onClick={() => navigate('/owner-dashboard')}
              aria-label="Go back"
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.bgWhite,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: T.textSecondary,
                fontSize: 14, transition: 'all 0.13s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = T.primaryMain; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = T.primaryMain; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.bgWhite; e.currentTarget.style.color = T.textSecondary; e.currentTarget.style.borderColor = T.border; }}
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
            </button>
            <span className="sd-breadcrumb-portal" style={{ fontFamily: T.font, fontSize: '12px', color: T.textSecondary, whiteSpace: 'nowrap' }}>
              Dealer Portal
            </span>
            <span className="sd-breadcrumb-portal" style={{ color: T.border, fontSize: 12 }}>/</span>
            <span style={{
              fontFamily: T.font, fontWeight: 700, fontSize: '12px', color: T.textPrimary,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              Shop Deals
            </span>
          </div>

          {/* Add deal button */}
          <button
            onClick={() => navigate(`/shop/${shopId}/add-deals`)}
            style={{
              background: T.primaryMain, border: 'none',
              color: '#fff', fontFamily: T.font, fontWeight: 600,
              fontSize: '12px', padding: '7px 16px', borderRadius: '8px',
              cursor: 'pointer', transition: 'opacity 0.15s',
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <span style={{ fontSize: 14 }}>+</span>
            <span className="sd-addbtn-label">Add Deal</span>
          </button>
        </div>

        {/* ── Content ── */}
        <div className="sd-page-pad" style={{ paddingTop: 28 }}>

          {/* Page title */}
          <div style={{ marginBottom: 22, animation: 'fade-up 0.35s ease both' }}>
            <h1 style={{
              fontFamily: T.font, fontWeight: 800,
              fontSize: 'clamp(20px, 5vw, 30px)',
              margin: '0 0 4px', color: T.textPrimary, letterSpacing: '-0.02em',
            }}>
              Shop Deals
            </h1>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: T.textSecondary }}>
              {deals.length} active deal{deals.length !== 1 ? 's' : ''} in this shop
            </p>
          </div>

          {/* Stats strip */}
          <div className="sd-stats-strip" style={{
            marginBottom: 22,
            animation: 'fade-up 0.35s ease 0.07s both',
            borderRadius: 10, overflow: 'hidden',
            border: `1px solid ${T.border}`,
          }}>
            {[
              { label: 'Total Deals',    value: deals.length,          accent: T.textPrimary },
              { label: 'With Discount',  value: withDiscount.length,   accent: T.success },
              { label: 'Total Savings',  value: totalSavings > 0 ? `₹${totalSavings}` : '—', accent: T.secondaryMain },
            ].map((s, i) => (
              <div key={i} className="sd-stat-item" style={{
                padding: '12px 24px', background: T.bgWhite,
                borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
              }}>
                <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: '11px', color: T.textSecondary, marginBottom: 4, whiteSpace: 'nowrap' }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: '22px', color: s.accent, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="sd-filter-tabs" style={{
            borderBottom: `1px solid ${T.border}`,
            animation: 'fade-up 0.35s ease 0.12s both',
          }}>
            {[
              { key: 'all',         label: 'All',          count: deals.length },
              { key: 'discounted',  label: 'Discounted',   count: withDiscount.length },
              { key: 'full',        label: 'Full Price',   count: noDiscount.length },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  background: 'transparent', border: 'none',
                  borderBottom: filter === f.key ? `2px solid ${T.secondaryMain}` : '2px solid transparent',
                  color: filter === f.key ? T.textPrimary : T.textSecondary,
                  fontFamily: T.font, fontWeight: filter === f.key ? 700 : 500,
                  fontSize: '13px', padding: '9px 18px', cursor: 'pointer',
                  transition: 'all 0.13s', marginBottom: '-1px',
                  display: 'flex', alignItems: 'center', gap: 6,
                  flexShrink: 0,
                }}
              >
                {f.label}
                <span style={{
                  background: filter === f.key ? T.secondaryMain : T.bgDefault,
                  color: filter === f.key ? '#fff' : T.textSecondary,
                  fontSize: '10px', fontWeight: 700,
                  padding: '1px 6px', borderRadius: 10,
                  transition: 'all 0.13s',
                }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── List (table on desktop, cards on mobile) ── */}
        <div className="sd-page-pad" style={{ paddingBottom: 48 }}>
          <div style={{
            background: T.bgWhite,
            borderRadius: '9px',
            border: `1px solid ${T.border}`,
            borderTop: 'none',
            overflow: 'hidden',
          }}>

            {/* Desktop table */}
            <div className="sd-desktop-table">
              {/* Column headers */}
              <div className="sd-row-grid" style={{
                padding: '10px 20px',
                borderBottom: `1px solid ${T.border}`,
                background: '#F9FAFB',
              }}>
                {['#', '', 'Deal', 'Price', 'Discount', 'You Save', 'Photos'].map((h, i) => {
                  const extraClass = i === 4 ? 'sd-col-discount' : i === 5 ? 'sd-col-savings' : '';
                  return (
                    <span key={i} className={extraClass} style={{
                      fontFamily: T.font, fontWeight: 600, fontSize: '11px',
                      color: T.textSecondary, letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      textAlign: i === 6 ? 'right' : 'left',
                    }}>
                      {h}
                    </span>
                  );
                })}
              </div>

              {filtered.map((deal, i) => (
                <DealRow key={deal._id} deal={deal} index={i} onEdit={(d) => setEditingDeal({...d, validFrom: d.validFrom?.split('T')[0] || '', validTill: d.validTill?.split('T')[0] || ''})} />
              ))}

              {filtered.length === 0 && (
                <div style={{
                  padding: '48px 20px', textAlign: 'center',
                  fontFamily: T.font, fontSize: '13px', color: T.textSecondary,
                  animation: 'fade-up 0.3s ease both',
                }}>
                  No {filter === 'discounted' ? 'discounted' : 'full-price'} deals found.
                </div>
              )}
            </div>

            {/* Mobile cards */}
            <div className="sd-mobile-cards">
              {filtered.map((deal, i) => (
                <DealCard key={deal._id} deal={deal} index={i} onEdit={(d) => setEditingDeal({...d, validFrom: d.validFrom?.split('T')[0] || '', validTill: d.validTill?.split('T')[0] || ''})} />
              ))}

              {filtered.length === 0 && (
                <div style={{
                  padding: '40px 16px', textAlign: 'center',
                  fontFamily: T.font, fontSize: '13px', color: T.textSecondary,
                  animation: 'fade-up 0.3s ease both',
                }}>
                  No {filter === 'discounted' ? 'discounted' : 'full-price'} deals found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Deal Modal */}
        <Dialog open={!!editingDeal} onClose={() => setEditingDeal(null)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontFamily: T.font, fontWeight: 700 }}>Edit Deal</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
            <TextField label="Title" value={editingDeal?.title || ''} onChange={e => setEditingDeal({...editingDeal, title: e.target.value})} fullWidth />
            <TextField label="Description" value={editingDeal?.description || ''} onChange={e => setEditingDeal({...editingDeal, description: e.target.value})} fullWidth multiline rows={3} />
            <div style={{ display: 'flex', gap: 16 }}>
              <TextField label="Original Price" type="number" value={editingDeal?.price || ''} onChange={e => setEditingDeal({...editingDeal, price: e.target.value})} fullWidth />
              {editingDeal?.dealType === 'discount' && (
                <TextField label="Deal Price" type="number" value={editingDeal?.dealPrice || ''} onChange={e => setEditingDeal({...editingDeal, dealPrice: e.target.value})} fullWidth />
              )}
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <TextField label="Valid From" type="date" value={editingDeal?.validFrom || ''} onChange={e => setEditingDeal({...editingDeal, validFrom: e.target.value})} fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Valid Till" type="date" value={editingDeal?.validTill || ''} onChange={e => setEditingDeal({...editingDeal, validTill: e.target.value})} fullWidth InputLabelProps={{ shrink: true }} />
            </div>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditingDeal(null)} color="inherit">Cancel</Button>
            <Button onClick={handleEditSave} variant="contained" disabled={updating} sx={{ bgcolor: T.primaryMain, color: 'white' }}>
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  );
};

export default ShopDealsPage;