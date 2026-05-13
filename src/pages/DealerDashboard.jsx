// import React, { useState } from 'react';
// import { Box, Typography, Button, Container, Paper, Grid, Card, CardMedia, CardContent, Chip, CircularProgress, Alert, CardActionArea, Snackbar } from '@mui/material';
// import { useGetMyShops } from '../hooks/useGetMyShops';
// import { useNavigate } from 'react-router-dom';

// const DealerDashboard = () => {
//     const navigate = useNavigate();
//     const [toastOpen, setToastOpen] = useState(false);
//     const [toastMessage, setToastMessage] = useState('');
//     const { data: response, isLoading, error } = useGetMyShops();
//     const shops = response?.data || [];

//     return (
//         <Container maxWidth={false} sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 }, maxWidth: 1400 }}>
//             <Paper
//                 elevation={0}
//                 sx={{
//                     p: { xs: 2, md: 4 },
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: 3,
//                     borderRadius: '16px',
//                     border: '1px solid #eee'
//                 }}
//             >
//                 <Box sx={{
//                     display: 'flex',
//                     flexDirection: { xs: 'column', sm: 'row' },
//                     justifyContent: 'space-between',
//                     alignItems: { xs: 'flex-start', sm: 'center' },
//                     gap: 2
//                 }}>
//                     <Typography
//                         variant="h4"
//                         component="h1"
//                         sx={{
//                             fontFamily: "'DM Serif Display', serif",
//                             fontSize: { xs: '1.75rem', md: '2.125rem' }
//                         }}
//                     >
//                         Dealer Portal
//                     </Typography>
                   
//                 </Box>

//                 <Typography variant="body1" color="text.secondary">
//                     Welcome to your Dealer portal. Select a verified shop to add an offer.
//                 </Typography>

//                 <Box sx={{ mt: 2 }}>
//                     <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>My Shops</Typography>
                    
//                     {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
                    
//                     {error && (
//                         <Alert severity="error" sx={{ mb: 2 }}>
//                             Failed to load shops. Please try again later.
//                         </Alert>
//                     )}

//                     {!isLoading && !error && shops.length === 0 && (
//                         <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8F9FA', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
//                             <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//                                 You haven't added any shops yet.
//                             </Typography>
//                             <Button variant="outlined" onClick={() => navigate('/add-shop')}>
//                                 Add Your First Shop
//                             </Button>
//                         </Box>
//                     )}

//                     {!isLoading && shops.length > 0 && (
//                         <Grid container spacing={3}>
//                             {shops.map((shop) => (
//                                 <Grid item xs={12} sm={6} md={4} lg={3} key={shop._id}>
//                                     <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
//                                         <CardActionArea 
//                                             sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
//                                             onClick={() => {
//                                                 if (shop.isVerified) {
//                                                     navigate(`/shop/${shop._id}/deals`);
//                                                 } else {
//                                                     setToastMessage("Please wait for this shop to be verified before adding offers.");
//                                                     setToastOpen(true);
//                                                 }
//                                             }}
//                                         >
//                                             <CardMedia
//                                                 component="img"
//                                                 height="180"
//                                                 image={shop.shopImage || 'https://via.placeholder.com/300x200?text=No+Image'}
//                                                 alt={shop.name}
//                                                 sx={{ objectFit: 'cover', width: '100%' }}
//                                             />
//                                             <CardContent sx={{ flexGrow: 1, width: '100%' }}>
//                                                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
//                                                     <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
//                                                         {shop.name}
//                                                     </Typography>
//                                                     <Chip 
//                                                         label={shop.isVerified ? "Verified" : "Pending"} 
//                                                         color={shop.isVerified ? "success" : "warning"} 
//                                                         size="small" 
//                                                         sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
//                                                     />
//                                                 </Box>
//                                                 <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                                                     {shop.category}
//                                                 </Typography>
//                                                 <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
//                                                     📍 {shop.address?.street}, {shop.address?.city}
//                                                 </Typography>
//                                             </CardContent>
//                                         </CardActionArea>
//                                     </Card>
//                                 </Grid>
//                             ))}
//                         </Grid>
//                     )}
//                 </Box>
//             </Paper>

//             <Snackbar 
//                 open={toastOpen} 
//                 autoHideDuration={4000} 
//                 onClose={() => setToastOpen(false)}
//                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//             >
//                 <Alert onClose={() => setToastOpen(false)} severity="warning" variant="filled" sx={{ width: '100%' }}>
//                     {toastMessage}
//                 </Alert>
//             </Snackbar>
//         </Container>
//     );
// };

// export default DealerDashboard;


import React, { useState } from 'react';
import { useGetMyShops } from '../hooks/useGetMyShops';
import { useNavigate } from 'react-router-dom';

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
`;

// ─── Live clock ───────────────────────────────────────────────────────────────
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: T.font, fontSize: '12px', fontWeight: 500, color: T.textSecondary }}>
      {time.toTimeString().slice(0, 8)}
    </span>
  );
};

// ─── Skeleton row ─────────────────────────────────────────────────────────────
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

// ─── Shop row ─────────────────────────────────────────────────────────────────
const ShopRow = ({ shop, index, navigate, onPendingClick }) => {
  const [hovered, setHovered] = useState(false);

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
        <span style={{ fontSize: '11px' }}>📍</span>
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
        →
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const DealerDashboard = () => {
  const navigate = useNavigate();
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

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: '100vh', background: T.bgDefault, color: T.textPrimary, fontFamily: T.font }}>

        {/* ── Top bar ── */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 100,
          background: T.bgWhite,
          borderBottom: `1px solid ${T.border}`,
          padding: '0 28px', height: 52,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: T.success,
              display: 'inline-block',
              animation: 'pulse-dot 2.5s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: T.font, fontWeight: 700, fontSize: '11px', color: T.textSecondary, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Dealer Portal
            </span>
            <span style={{ color: T.border }}>|</span>
            <LiveClock />
          </div>
          <button
            onClick={() => navigate('/add-shop')}
            style={{
              background: T.primaryMain, border: 'none',
              color: '#fff', fontFamily: T.font, fontWeight: 600,
              fontSize: '12px', padding: '7px 16px', borderRadius: '8px',
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.82'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            + New Shop
          </button>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '28px 28px 0' }}>

          {/* Page title */}
          <div style={{ marginBottom: 22, animation: 'fade-up 0.35s ease both' }}>
            <h1 style={{ fontFamily: T.font, fontWeight: 800, fontSize: 'clamp(22px, 3vw, 30px)', margin: '0 0 4px', color: T.textPrimary, letterSpacing: '-0.02em' }}>
              Shop Operations
            </h1>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: T.textSecondary }}>
              Select a verified shop to manage offers and deals
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
              { label: 'Total Shops', value: shops.length, accent: T.textPrimary },
              { label: 'Verified',    value: verified,      accent: T.success },
              { label: 'Pending',     value: pending,       accent: T.warning },
            ].map((s, i) => (
              <div key={i} style={{
                padding: '12px 24px', background: T.bgWhite,
                borderRight: i < 2 ? `1px solid ${T.border}` : 'none',
                minWidth: 108,
              }}>
                <div style={{ fontFamily: T.font, fontWeight: 500, fontSize: '11px', color: T.textSecondary, marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: '22px', color: s.accent, lineHeight: 1 }}>
                  {isLoading ? '—' : s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, animation: 'fade-up 0.35s ease 0.12s both' }}>
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
                  fontSize: '13px', padding: '9px 18px', cursor: 'pointer',
                  transition: 'all 0.13s', marginBottom: '-1px',
                  display: 'flex', alignItems: 'center', gap: 6,
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

        {/* ── Table ── */}
        <div style={{ padding: '0 28px 48px' }}>
          <div style={{
            background: T.bgWhite,
            borderRadius: '0 0 12px 12px',
            border: `1px solid ${T.border}`,
            borderTop: 'none',
            overflow: 'hidden',
          }}>
            {/* Col headers */}
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

            {isLoading && [0,1,2,3,4].map(i => <SkeletonRow key={i} index={i} />)}

            {error && (
              <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: T.font, fontSize: '13px', color: T.error, fontWeight: 500 }}>
                ⚠ Failed to load shops. Please try again later.
              </div>
            )}

            {!isLoading && !error && shops.length === 0 && (
              <div style={{ padding: '60px 20px', textAlign: 'center', animation: 'fade-up 0.3s ease both' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '14px',
                  background: T.bgDefault, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', fontSize: 22,
                }}>🏪</div>
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

        {/* ── Toast ── */}
        {toastOpen && (
          <div
            onClick={() => setToastOpen(false)}
            style={{
              position: 'fixed', bottom: 24, right: 24,
              background: T.bgWhite,
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${T.warning}`,
              borderRadius: '10px', padding: '13px 16px',
              display: 'flex', alignItems: 'flex-start', gap: 10,
              animation: 'toast-in 0.2s ease both',
              cursor: 'pointer', zIndex: 999, maxWidth: 340,
              boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
            }}
          >
            <span style={{ fontSize: 15, marginTop: 1 }}>⚠️</span>
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