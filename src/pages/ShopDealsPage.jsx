
// import React, { useEffect, useState } from 'react';
// import {
//     Box, Typography, Button, Container, CircularProgress, Alert, Chip
// } from '@mui/material';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useGetShopDeals } from '../hooks/useGetShopDeals';
// import AddIcon from '@mui/icons-material/Add';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// /* ─── Image Grid ─────────────────────────────────────────────────── */
// const ImageGrid = ({ images, title }) => {
//     const fallback = 'https://via.placeholder.com/600x400?text=No+Image';
//     const imgs = images && images.length > 0 ? images : [{ url: fallback }];
//     const count = imgs.length;

//     /* Layout variants based on image count */
//     const gridTemplates = {
//         1: { cols: '1fr', rows: '240px' },
//         2: { cols: '1fr 1fr', rows: '220px' },
//         3: { cols: '2fr 1fr', rows: '120px' },   // left big, right 2 stacked
//         4: { cols: '1fr 1fr', rows: '120px' },
//     };

//     const template = count >= 4 ? gridTemplates[4] : gridTemplates[count];

//     /* For 3 images, special layout: left spans 2 rows */
//     const getGridArea = (i, total) => {
//         if (total === 3 && i === 0) return '1 / 1 / 3 / 2'; // span 2 rows
//         return undefined;
//     };

//     const displayImgs = count > 4 ? imgs.slice(0, 4) : imgs;
//     const extraCount = count > 4 ? count - 4 : 0;

//     return (
//         <Box
//             sx={{
//                 display: 'grid',
//                 gridTemplateColumns: template.cols,
//                 gridTemplateRows: count === 3
//                     ? `${template.rows} ${template.rows}`
//                     : template.rows,
//                 gap: '3px',
//                 borderRadius: '14px 14px 0 0',
//                 overflow: 'hidden',
//             }}
//         >
//             {displayImgs.map((img, i) => (
//                 <Box
//                     key={i}
//                     sx={{
//                         position: 'relative',
//                         gridArea: getGridArea(i, count),
//                         overflow: 'hidden',
//                         '&:hover img': { transform: 'scale(1.04)' },
//                     }}
//                 >
//                     <Box
//                         component="img"
//                         src={img.url || fallback}
//                         alt={`${title} ${i + 1}`}
//                         sx={{
//                             width: '100%',
//                             height: '100%',
//                             objectFit: 'cover',
//                             display: 'block',
//                             transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
//                         }}
//                     />
//                     {/* Overlay for last image when there are extra */}
//                     {extraCount > 0 && i === displayImgs.length - 1 && (
//                         <Box
//                             sx={{
//                                 position: 'absolute', inset: 0,
//                                 bgcolor: 'rgba(15,23,42,0.62)',
//                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                             }}
//                         >
//                             <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
//                                 +{extraCount}
//                             </Typography>
//                         </Box>
//                     )}
//                 </Box>
//             ))}
//         </Box>
//     );
// };

// /* ─── Deal Card ───────────────────────────────────────────────────── */
// const DealCard = ({ deal }) => {
//     const hasDiscount = deal.discountPercent > 0;

//     return (
//         <Box
//             sx={{
//                 borderRadius: '16px',
//                 overflow: 'hidden',
//                 bgcolor: '#fff',
//                 border: '1px solid #E8EDF3',
//                 boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 transition: 'box-shadow 0.25s ease, transform 0.25s ease',
//                 '&:hover': {
//                     boxShadow: '0 12px 36px rgba(15,23,42,0.13)',
//                     transform: 'translateY(-4px)',
//                 },
//             }}
//         >
//             {/* Images */}
//             <ImageGrid images={deal.images} title={deal.title} />

//             {/* Content */}
//             <Box sx={{ p: '18px 20px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
//                 {/* Discount badge */}
//                 {hasDiscount && (
//                     <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
//                         <Chip
//                             icon={<LocalOfferIcon sx={{ fontSize: '13px !important' }} />}
//                             label={`${deal.discountPercent}% OFF`}
//                             size="small"
//                             sx={{
//                                 bgcolor: '#ECFDF5',
//                                 color: '#059669',
//                                 fontWeight: 700,
//                                 fontSize: '0.72rem',
//                                 border: '1px solid #A7F3D0',
//                                 height: '22px',
//                                 letterSpacing: '0.3px',
//                                 '& .MuiChip-icon': { color: '#059669' },
//                             }}
//                         />
//                     </Box>
//                 )}

//                 {/* Title */}
//                 <Typography
//                     sx={{
//                         fontFamily: "'DM Serif Display', serif",
//                         fontSize: '1.15rem',
//                         fontWeight: 400,
//                         lineHeight: 1.3,
//                         color: '#0F172A',
//                         letterSpacing: '-0.2px',
//                     }}
//                 >
//                     {deal.title}
//                 </Typography>

//                 {/* Description */}
//                 {deal.description && (
//                     <Typography
//                         sx={{
//                             fontSize: '0.83rem',
//                             color: '#64748B',
//                             lineHeight: 1.55,
//                             display: '-webkit-box',
//                             WebkitLineClamp: 2,
//                             WebkitBoxOrient: 'vertical',
//                             overflow: 'hidden',
//                         }}
//                     >
//                         {deal.description}
//                     </Typography>
//                 )}

//                 {/* Spacer */}
//                 <Box sx={{ flexGrow: 1 }} />

//                 {/* Price row */}
//                 <Box
//                     sx={{
//                         display: 'flex',
//                         alignItems: 'baseline',
//                         gap: 1.5,
//                         pt: 1.5,
//                         borderTop: '1px solid #F1F5F9',
//                         mt: 1,
//                     }}
//                 >
//                     <Typography
//                         sx={{
//                             fontSize: '1.35rem',
//                             fontWeight: 800,
//                             color: '#0F172A',
//                             letterSpacing: '-0.5px',
//                             fontFamily: "'DM Sans', sans-serif",
//                         }}
//                     >
//                         ₹{deal.dealPrice}
//                     </Typography>
//                     {deal.price && (
//                         <Typography
//                             sx={{
//                                 fontSize: '0.9rem',
//                                 color: '#94A3B8',
//                                 textDecoration: 'line-through',
//                                 fontFamily: "'DM Sans', sans-serif",
//                             }}
//                         >
//                             ₹{deal.price}
//                         </Typography>
//                     )}
//                     {/* Image count pill */}
//                     {deal.images && deal.images.length > 0 && (
//                         <Box sx={{ ml: 'auto' }}>
//                             <Typography
//                                 sx={{
//                                     fontSize: '0.72rem',
//                                     color: '#94A3B8',
//                                     bgcolor: '#F8FAFC',
//                                     border: '1px solid #E2E8F0',
//                                     borderRadius: '20px',
//                                     px: 1,
//                                     py: 0.3,
//                                     letterSpacing: '0.2px',
//                                 }}
//                             >
//                                 {deal.images.length} photo{deal.images.length > 1 ? 's' : ''}
//                             </Typography>
//                         </Box>
//                     )}
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// /* ─── Page ────────────────────────────────────────────────────────── */
// const ShopDealsPage = () => {
//     const { shopId } = useParams();
//     const navigate = useNavigate();
//     const { data: response, isLoading, error } = useGetShopDeals(shopId);

//     const deals = response?.deals || [];

//     useEffect(() => {
//         if (!isLoading && !error && deals.length === 0) {
//             navigate(`/shop/${shopId}/add-deals`, { replace: true });
//         }
//     }, [isLoading, error, deals.length, navigate, shopId]);

//     if (isLoading) {
//         return (
//             <Box sx={{ mt: 14, textAlign: 'center' }}>
//                 <CircularProgress size={36} thickness={4} sx={{ color: '#0F172A' }} />
//             </Box>
//         );
//     }

//     if (error) {
//         return (
//             <Container sx={{ mt: 5 }}>
//                 <Alert severity="error">Failed to load deals. Please try again.</Alert>
//             </Container>
//         );
//     }

//     if (deals.length === 0) return null;

//     return (
//         <Box
//             sx={{
//                 minHeight: '100vh',
//                 bgcolor: '#F8FAFC',
//                 py: { xs: 3, md: 5 },
//                 px: { xs: 2, sm: 3, md: 5 },
//             }}
//         >
//             {/* Header */}
//             <Box
//                 sx={{
//                     maxWidth: 1400,
//                     mx: 'auto',
//                     mb: { xs: 3, md: 4 },
//                     display: 'flex',
//                     flexDirection: { xs: 'column', sm: 'row' },
//                     alignItems: { xs: 'flex-start', sm: 'center' },
//                     justifyContent: 'space-between',
//                     gap: 2,
//                 }}
//             >
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//                     <Box
//                         onClick={() => navigate('/owner-dashboard')}
//                         sx={{
//                             width: 38, height: 38,
//                             borderRadius: '10px',
//                             border: '1px solid #E2E8F0',
//                             bgcolor: '#fff',
//                             display: 'flex', alignItems: 'center', justifyContent: 'center',
//                             cursor: 'pointer',
//                             color: '#475569',
//                             transition: 'all 0.2s',
//                             '&:hover': { bgcolor: '#0F172A', color: '#fff', borderColor: '#0F172A' },
//                         }}
//                     >
//                         <ArrowBackIcon sx={{ fontSize: '18px' }} />
//                     </Box>
//                     <Box>
//                         <Typography
//                             sx={{
//                                 fontFamily: "'DM Serif Display', serif",
//                                 fontSize: { xs: '1.6rem', md: '2rem' },
//                                 fontWeight: 400,
//                                 color: '#0F172A',
//                                 lineHeight: 1,
//                                 letterSpacing: '-0.5px',
//                             }}
//                         >
//                             Shop Deals
//                         </Typography>
//                         <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', mt: 0.4 }}>
//                             {deals.length} active deal{deals.length !== 1 ? 's' : ''}
//                         </Typography>
//                     </Box>
//                 </Box>

//                 <Button
//                     variant="contained"
//                     startIcon={<AddIcon />}
//                     onClick={() => navigate(`/shop/${shopId}/add-deals`)}
//                     sx={{
//                         borderRadius: '10px',
//                         bgcolor: '#0F172A',
//                         color: '#fff',
//                         px: 2.5,
//                         py: 1.1,
//                         fontSize: '0.85rem',
//                         fontWeight: 600,
//                         textTransform: 'none',
//                         letterSpacing: '0.2px',
//                         boxShadow: 'none',
//                         '&:hover': {
//                             bgcolor: '#1E293B',
//                             boxShadow: '0 4px 16px rgba(15,23,42,0.25)',
//                         },
//                     }}
//                 >
//                     Add Deal
//                 </Button>
//             </Box>

//             {/* Grid */}
//             <Box
//                 sx={{
//                     maxWidth: 1400,
//                     mx: 'auto',
//                     display: 'grid',
//                     gridTemplateColumns: {
//                         xs: '1fr',
//                         sm: 'repeat(2, 1fr)',
//                         lg: 'repeat(3, 1fr)',
//                         xl: 'repeat(4, 1fr)',
//                     },
//                     gap: { xs: 2.5, md: 3 },
//                 }}
//             >
//                 {deals.map(deal => (
//                     <DealCard key={deal._id} deal={deal} />
//                 ))}
//             </Box>
//         </Box>
//     );
// };

// export default ShopDealsPage;


import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, Container } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetShopDeals } from '../hooks/useGetShopDeals';

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
`;

// ─── Thumbnail strip (up to 3 images) ────────────────────────────────────────
const ThumbStrip = ({ images }) => {
  const fallback = 'https://via.placeholder.com/60x60?text=?';
  const imgs = images && images.length > 0 ? images.slice(0, 3) : [];
  const extra = images && images.length > 3 ? images.length - 3 : 0;

  if (imgs.length === 0) {
    return (
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: T.bgDefault,
        border: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
      }}>🏷️</div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}>
      {imgs.map((img, i) => (
        <div key={i} style={{
          width: 44, height: 44,
          borderRadius: 10,
          overflow: 'hidden',
          border: `2px solid ${T.bgWhite}`,
          marginLeft: i > 0 ? -10 : 0,
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

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SkeletonRow = ({ index }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: '36px 64px 1fr 120px 100px 110px 60px',
    alignItems: 'center',
    gap: '0 16px',
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

// ─── Deal row ─────────────────────────────────────────────────────────────────
const DealRow = ({ deal, index }) => {
  const [hovered, setHovered] = useState(false);
  const hasDiscount = deal.discountPercent > 0;
  const saving = deal.price && deal.dealPrice
    ? deal.price - deal.dealPrice
    : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '36px 64px 1fr 130px 110px 120px 60px',
        alignItems: 'center',
        gap: '0 16px',
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
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          fontFamily: T.font, fontWeight: 700, fontSize: '14px',
          color: hovered ? T.primaryMain : T.textPrimary,
          transition: 'color 0.12s',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {deal.title}
        </div>
        {deal.description && (
          <div style={{
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
      <div>
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
      <div>
        {hasDiscount ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px', borderRadius: 20,
            fontSize: '11px', fontWeight: 700, fontFamily: T.font,
            background: T.successBg, color: T.success,
          }}>
            🏷️ {deal.discountPercent}% OFF
          </span>
        ) : (
          <span style={{ fontFamily: T.font, fontSize: '12px', color: T.textSecondary, opacity: 0.4 }}>—</span>
        )}
      </div>

      {/* Savings */}
      <div>
        {saving !== null && saving > 0 ? (
          <div>
            <div style={{ fontFamily: T.font, fontWeight: 600, fontSize: '13px', color: T.success }}>
              ₹{saving} saved
            </div>
          </div>
        ) : (
          <span style={{ fontFamily: T.font, fontSize: '12px', color: T.textSecondary, opacity: 0.4 }}>—</span>
        )}
      </div>

      {/* Photos count */}
      <div style={{ textAlign: 'right' }}>
        {deal.images && deal.images.length > 0 ? (
          <span style={{
            fontFamily: T.font, fontWeight: 500, fontSize: '11px',
            color: T.textSecondary,
            background: T.bgDefault,
            border: `1px solid ${T.border}`,
            borderRadius: 20, padding: '2px 8px',
          }}>
            {deal.images.length} photo{deal.images.length !== 1 ? 's' : ''}
          </span>
        ) : (
          <span style={{ fontFamily: T.font, fontSize: '11px', color: T.textSecondary, opacity: 0.35 }}>No photos</span>
        )}
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────
const ShopDealsPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const { data: response, isLoading, error } = useGetShopDeals(shopId);
  const deals = response?.deals || [];

  const [filter, setFilter] = useState('all');

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
          <div style={{
            height: 52, background: T.bgWhite,
            borderBottom: `1px solid ${T.border}`,
            display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.border }} />
            <div style={{ width: 90, height: 11, borderRadius: 6, background: T.border }} />
          </div>
          <div style={{ padding: '28px 28px 0' }}>
            <div style={{ width: 200, height: 28, borderRadius: 8, background: T.bgWhite, border: `1px solid ${T.border}`, marginBottom: 22 }} />
            <div style={{ background: T.bgWhite, border: `1px solid ${T.border}`, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ height: 40, background: '#F9FAFB', borderBottom: `1px solid ${T.border}` }} />
              {[0,1,2,3,4].map(i => <SkeletonRow key={i} index={i} />)}
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
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: T.bgWhite,
          borderBottom: `1px solid ${T.border}`,
          padding: '0 28px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Back + breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => navigate('/owner-dashboard')}
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
              ←
            </button>
            <span style={{ fontFamily: T.font, fontSize: '12px', color: T.textSecondary }}>
              Dealer Portal
            </span>
            <span style={{ color: T.border, fontSize: 12 }}>/</span>
            <span style={{ fontFamily: T.font, fontWeight: 700, fontSize: '12px', color: T.textPrimary }}>
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
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <span style={{ fontSize: 14 }}>+</span> Add Deal
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '28px 28px 0' }}>

          {/* Page title */}
          <div style={{ marginBottom: 22, animation: 'fade-up 0.35s ease both' }}>
            <h1 style={{
              fontFamily: T.font, fontWeight: 800,
              fontSize: 'clamp(22px, 3vw, 30px)',
              margin: '0 0 4px', color: T.textPrimary, letterSpacing: '-0.02em',
            }}>
              Shop Deals
            </h1>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: T.textSecondary }}>
              {deals.length} active deal{deals.length !== 1 ? 's' : ''} in this shop
            </p>
          </div>

          {/* Stats strip */}
          <div style={{
            display: 'flex', gap: 0, marginBottom: 22,
            animation: 'fade-up 0.35s ease 0.07s both',
            borderRadius: 10, overflow: 'hidden',
            border: `1px solid ${T.border}`, width: 'fit-content',
          }}>
            {[
              { label: 'Total Deals',    value: deals.length,          accent: T.textPrimary },
              { label: 'With Discount',  value: withDiscount.length,   accent: T.success },
              { label: 'Total Savings',  value: totalSavings > 0 ? `₹${totalSavings}` : '—', accent: T.secondaryMain },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '12px 24px', background: T.bgWhite,
                borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
                minWidth: 120,
              }}>
                <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: '11px', color: T.textSecondary, marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: '22px', color: s.accent, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{
            display: 'flex',
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

        {/* ── Table ── */}
        <div style={{ padding: '0 28px 48px' }}>
          <div style={{
            background: T.bgWhite,
            borderRadius: '0 0 12px 12px',
            border: `1px solid ${T.border}`,
            borderTop: 'none',
            overflow: 'hidden',
          }}>

            {/* Column headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '36px 64px 1fr 130px 110px 120px 60px',
              gap: '0 16px', padding: '10px 20px',
              borderBottom: `1px solid ${T.border}`,
              background: '#F9FAFB',
            }}>
              {['#', '', 'Deal', 'Price', 'Discount', 'You Save', 'Photos'].map((h, i) => (
                <span key={i} style={{
                  fontFamily: T.font, fontWeight: 600, fontSize: '11px',
                  color: T.textSecondary, letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  textAlign: i === 6 ? 'right' : 'left',
                }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((deal, i) => (
              <DealRow key={deal._id} deal={deal} index={i} />
            ))}

            {/* Empty filter */}
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
        </div>
      </div>
    </>
  );
};

export default ShopDealsPage;