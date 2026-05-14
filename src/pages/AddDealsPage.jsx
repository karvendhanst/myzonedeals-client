// import React, { useState, useRef } from 'react';
// import {
//   Box, Typography, Container, Paper, Button,
//   TextField, Grid,
//   InputAdornment, Divider, Chip, IconButton,
//   Alert, Fade, CircularProgress
// } from '@mui/material';
// import { useParams, useNavigate } from 'react-router-dom';
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
// import SellIcon from '@mui/icons-material/Sell';
// import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
// import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import { useCreateDeal } from '../hooks/useCreateDeal';

// /* ─── helpers ─── */
// const labelSx = {
//   fontWeight: 600,
//   fontSize: '0.813rem',
//   color: '#0F172A',
//   mb: 0.5,
//   letterSpacing: '0.02em',
//   textTransform: 'uppercase',
// };

// const inputSx = {
//   '& .MuiOutlinedInput-root': {
//     borderRadius: '10px',
//     backgroundColor: '#fff',
//     fontSize: '0.95rem',
//     '& fieldset': { borderColor: '#E2E8F0' },
//     '&:hover fieldset': { borderColor: '#0F172A' },
//     '&.Mui-focused fieldset': { borderColor: '#0F172A', borderWidth: '1.5px' },
//   },
//   '& .MuiInputLabel-root.Mui-focused': { color: '#0F172A' },
// };

// /* ─── Discount Badge ─── */
// const DiscountBadge = ({ price, dealPrice }) => {
//   const p = parseFloat(price);
//   const dp = parseFloat(dealPrice);
//   if (!p || !dp || dp >= p) return null;
//   const pct = Math.round(((p - dp) / p) * 100);
//   return (
//     <Chip
//       label={`${pct}% OFF`}
//       size="small"
//       sx={{
//         bgcolor: '#FFF3E0',
//         color: '#F4A261',
//         fontWeight: 700,
//         fontSize: '0.75rem',
//         border: '1px solid #F4A261',
//         ml: 1,
//       }}
//     />
//   );
// };

// /* ─── Image Upload Zone ─── */
// const ImageUploadZone = ({ images, onAdd, onRemove }) => {
//   const inputRef = useRef(null);
//   const [dragging, setDragging] = useState(false);

//   const processFiles = (files) => {
//     Array.from(files).forEach((file) => {
//       if (!file.type.startsWith('image/')) return;
//       const url = URL.createObjectURL(file);
//       onAdd({ file, url });
//     });
//   };

//   return (
//     <Box>
//       <Typography sx={labelSx}>Deal Images</Typography>

//       <Box
//         onClick={() => inputRef.current?.click()}
//         onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
//         onDragLeave={() => setDragging(false)}
//         onDrop={(e) => {
//           e.preventDefault();
//           setDragging(false);
//           processFiles(e.dataTransfer.files);
//         }}
//         sx={{
//           border: `2px dashed ${dragging ? '#F4A261' : '#CBD5E1'}`,
//           borderRadius: '12px',
//           p: 4,
//           textAlign: 'center',
//           cursor: 'pointer',
//           bgcolor: dragging ? '#FFF8F0' : '#F8FAFC',
//           transition: 'all 0.2s ease',
//           '&:hover': { borderColor: '#F4A261', bgcolor: '#FFF8F0' },
//         }}
//       >
//         <CloudUploadIcon sx={{ fontSize: 40, color: dragging ? '#F4A261' : '#94A3B8', mb: 1 }} />
//         <Typography fontWeight={600} color="#0F172A" fontSize="0.95rem">
//           Drag & drop images here
//         </Typography>
//         <Typography fontSize="0.8rem" color="text.secondary" mt={0.5}>
//           or <span style={{ color: '#F4A261', fontWeight: 600 }}>browse files</span> — PNG, JPG, WEBP
//         </Typography>
//         <input
//           ref={inputRef}
//           type="file"
//           multiple
//           accept="image/*"
//           hidden
//           onChange={(e) => processFiles(e.target.files)}
//         />
//       </Box>

//       {images.length > 0 && (
//         <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 2 }}>
//           {images.map((img, idx) => (
//             <Box
//               key={idx}
//               sx={{
//                 position: 'relative',
//                 width: 96,
//                 height: 96,
//                 borderRadius: '10px',
//                 overflow: 'hidden',
//                 border: '2px solid #E2E8F0',
//                 '&:hover .del-btn': { opacity: 1 },
//               }}
//             >
//               <img
//                 src={img.url}
//                 alt={`deal-${idx}`}
//                 style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//               />
//               {idx === 0 && (
//                 <Chip
//                   label="Cover"
//                   size="small"
//                   sx={{
//                     position: 'absolute', bottom: 4, left: 4,
//                     bgcolor: '#0F172A', color: '#fff',
//                     fontSize: '0.65rem', height: 18, borderRadius: '4px',
//                   }}
//                 />
//               )}
//               <IconButton
//                 className="del-btn"
//                 size="small"
//                 onClick={() => onRemove(idx)}
//                 sx={{
//                   position: 'absolute', top: 2, right: 2,
//                   bgcolor: 'rgba(255,255,255,0.9)',
//                   opacity: 0,
//                   transition: 'opacity 0.2s',
//                   '&:hover': { bgcolor: '#fff' },
//                   width: 24, height: 24,
//                 }}
//               >
//                 <DeleteOutlineIcon sx={{ fontSize: 14, color: '#EF4444' }} />
//               </IconButton>
//             </Box>
//           ))}
//         </Box>
//       )}
//     </Box>
//   );
// };

// /* ─── Section wrapper — defined OUTSIDE AddDealsPage to prevent remount on every render ─── */
// const Section = ({ label, children }) => (
//   <Box
//     sx={{
//       p: { xs: 2, md: 3 },
//       bgcolor: '#F8FAFC',
//       borderRadius: '14px',
//       border: '1px solid #E2E8F0',
//     }}
//   >
//     <Typography
//       sx={{
//         fontSize: '0.7rem',
//         fontWeight: 700,
//         color: '#94A3B8',
//         letterSpacing: '0.1em',
//         textTransform: 'uppercase',
//         mb: 2,
//       }}
//     >
//       {label}
//     </Typography>
//     {children}
//   </Box>
// );

// /* ═══════════════════════════════════════════
//    MAIN COMPONENT
// ═══════════════════════════════════════════ */
// const AddDealsPage = () => {
//   const { shopId } = useParams();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     title: '',
//     description: '',
//     price: '',
//     dealPrice: '',
//     validFrom: '',
//     validTill: '',
//     isActive: true,
//   });
//   const [images, setImages] = useState([]);
//   const [success, setSuccess] = useState(false);
//   const [errors, setErrors] = useState({});

//   const { mutate: publishDeal, isPending: submitting } = useCreateDeal(shopId, {
//     onSuccess: () => {
//       setSuccess(true);
//       setTimeout(() => navigate(`/shop/${shopId}/deals`), 2000);
//     },
//     onError: (err) => setErrors({ submit: err.message }),
//   });

//   const set = (field) => (e) => {
//     setForm((f) => ({ ...f, [field]: e.target.value }));
//     setErrors((er) => ({ ...er, [field]: '' }));
//   };

//   const validate = () => {
//     const e = {};
//     if (!form.title.trim()) e.title = 'Title is required';
//     if (!form.price || isNaN(form.price)) e.price = 'Enter a valid price';
//     if (!form.dealPrice || isNaN(form.dealPrice)) e.dealPrice = 'Enter a valid deal price';
//     if (parseFloat(form.dealPrice) >= parseFloat(form.price))
//       e.dealPrice = 'Deal price must be less than original price';
//     if (!form.validFrom) e.validFrom = 'Start date required';
//     if (!form.validTill) e.validTill = 'End date required';
//     if (form.validFrom && form.validTill && form.validTill < form.validFrom)
//       e.validTill = 'End date must be after start date';
//     return e;
//   };

//   const handleSubmit = () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     publishDeal({ ...form, images });
//   };

//   if (success) {
//     return (
//       <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
//         <Fade in>
//           <Box>
//             <CheckCircleIcon sx={{ fontSize: 72, color: '#22C55E', mb: 2 }} />
//             <Typography variant="h5" fontWeight={700} color="#0F172A">
//               Deal Created!
//             </Typography>
//             <Typography color="text.secondary" mt={1}>
//               Redirecting to deals list…
//             </Typography>
//           </Box>
//         </Fade>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="md" sx={{ mt: { xs: 2, md: 5 }, mb: { xs: 4, md: 6 } }}>
//       <Paper
//         elevation={0}
//         sx={{
//           p: { xs: 2.5, md: 5 },
//           borderRadius: '20px',
//           border: '1px solid #E2E8F0',
//           bgcolor: '#fbfbfb',
//         }}
//       >
//         {/* ── Header ── */}
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <SellIcon sx={{ color: '#F4A261', fontSize: 22 }} />
//             <Typography
//               variant="h4"
//               component="h1"
//               sx={{ fontFamily: "'DM Serif Display', serif", color: '#0F172A', lineHeight: 1 }}
//             >
//               Create Deal
//             </Typography>
//           </Box>
//           <Button
//             startIcon={<ArrowBackIcon />}
//             variant="outlined"
//             onClick={() => navigate(`/shop/${shopId}/deals`)}
//             sx={{
//               borderRadius: '10px',
//               borderColor: '#E2E8F0',
//               color: '#0F172A',
//               fontWeight: 600,
//               fontSize: '0.82rem',
//               '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
//             }}
//           >
//             Back to Deals
//           </Button>
//         </Box>

//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

//           {/* ── Images ── */}
//           <Section label="Deal Images">
//             <ImageUploadZone
//               images={images}
//               onAdd={(img) => setImages((prev) => [...prev, img])}
//               onRemove={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))}
//             />
//           </Section>

//           {/* ── Basic Info ── */}
//           <Section label="Deal Details">
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
//               <Box>
//                 <Typography sx={labelSx}>Deal Title *</Typography>
//                 <TextField
//                   fullWidth
//                   placeholder="e.g. Buy 1 Get 1 Free on Pizzas"
//                   value={form.title}
//                   onChange={set('title')}
//                   error={!!errors.title}
//                   helperText={errors.title}
//                   sx={inputSx}
//                 />
//               </Box>
//               <Box>
//                 <Typography sx={labelSx}>Description</Typography>
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={3}
//                   placeholder="Describe your deal in detail…"
//                   value={form.description}
//                   onChange={set('description')}
//                   sx={inputSx}
//                 />
//               </Box>
//             </Box>
//           </Section>

//           {/* ── Pricing ── */}
//           <Section label="Pricing">
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <Typography sx={labelSx}>Original Price *</Typography>
//                 <TextField
//                   fullWidth
//                   type="number"
//                   placeholder="0.00"
//                   value={form.price}
//                   onChange={set('price')}
//                   error={!!errors.price}
//                   helperText={errors.price}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <CurrencyRupeeIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={inputSx}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
//                   <Typography sx={{ ...labelSx, mb: 0 }}>Deal Price *</Typography>
//                   <DiscountBadge price={form.price} dealPrice={form.dealPrice} />
//                 </Box>
//                 <TextField
//                   fullWidth
//                   type="number"
//                   placeholder="0.00"
//                   value={form.dealPrice}
//                   onChange={set('dealPrice')}
//                   error={!!errors.dealPrice}
//                   helperText={errors.dealPrice}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <CurrencyRupeeIcon sx={{ fontSize: 18, color: '#F4A261' }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={{
//                     ...inputSx,
//                     '& .MuiOutlinedInput-root': {
//                       ...inputSx['& .MuiOutlinedInput-root'],
//                       '&.Mui-focused fieldset': { borderColor: '#F4A261', borderWidth: '1.5px' },
//                     },
//                   }}
//                 />
//               </Grid>
//             </Grid>
//           </Section>

//           {/* ── Validity ── */}
//           <Section label="Validity Period">
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <Typography sx={labelSx}>Valid From *</Typography>
//                 <TextField
//                   fullWidth
//                   type="date"
//                   value={form.validFrom}
//                   onChange={set('validFrom')}
//                   error={!!errors.validFrom}
//                   helperText={errors.validFrom}
//                   InputLabelProps={{ shrink: true }}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <CalendarTodayIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={inputSx}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography sx={labelSx}>Valid Till *</Typography>
//                 <TextField
//                   fullWidth
//                   type="date"
//                   value={form.validTill}
//                   onChange={set('validTill')}
//                   error={!!errors.validTill}
//                   helperText={errors.validTill}
//                   InputLabelProps={{ shrink: true }}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <CalendarTodayIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={inputSx}
//                 />
//               </Grid>
//             </Grid>
//           </Section>

//           {/* ── Submit error ── */}
//           {errors.submit && (
//             <Alert severity="error" sx={{ borderRadius: '10px' }}>
//               {errors.submit}
//             </Alert>
//           )}

//           <Divider sx={{ borderColor: '#E2E8F0' }} />

//           {/* ── Actions ── */}
//           <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
//             <Button
//               variant="outlined"
//               onClick={() => navigate(`/shop/${shopId}/deals`)}
//               disabled={submitting}
//               sx={{
//                 borderRadius: '10px',
//                 borderColor: '#E2E8F0',
//                 color: '#6B7280',
//                 fontWeight: 600,
//                 px: 3,
//                 '&:hover': { borderColor: '#0F172A', color: '#0F172A', bgcolor: '#F8FAFC' },
//               }}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="contained"
//               onClick={handleSubmit}
//               disabled={submitting}
//               startIcon={
//                 submitting
//                   ? <CircularProgress size={16} color="inherit" />
//                   : <SellIcon />
//               }
//               sx={{
//                 borderRadius: '10px',
//                 bgcolor: '#0F172A',
//                 color: '#fff',
//                 fontWeight: 700,
//                 px: 4,
//                 fontSize: '0.9rem',
//                 boxShadow: 'none',
//                 '&:hover': { bgcolor: '#1E293B', boxShadow: '0 4px 16px rgba(15,23,42,0.18)' },
//                 '&:disabled': { bgcolor: '#94A3B8' },
//               }}
//             >
//               {submitting ? 'Publishing…' : 'Publish Deal'}
//             </Button>
//           </Box>

//         </Box>
//       </Paper>
//     </Container>
//   );
// };

// export default AddDealsPage;

import React, { useState, useRef } from 'react';
import {
  Box, Typography, Container, Button,
  TextField, Grid,
  InputAdornment, Divider, Chip, IconButton,
  Alert, Fade, CircularProgress, LinearProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SellIcon from '@mui/icons-material/Sell';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useCreateDeal } from '../hooks/useCreateDeal';

/* ─── Field label ─── */
const FieldLabel = ({ children, required }) => (
  <Typography
    sx={{
      fontSize: '0.72rem',
      fontWeight: 700,
      color: '#6B7280',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      mb: 0.75,
    }}
  >
    {children}{required && <span style={{ color: '#F4A261', marginLeft: 2 }}>*</span>}
  </Typography>
);

/* ─── Shared input sx ─── */
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    backgroundColor: '#fff',
    fontSize: '0.95rem',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: '#192235' },
    '&.Mui-focused fieldset': { borderColor: '#F4A261', borderWidth: '2px' },
  },
};

/* ─── Discount Badge ─── */
const DiscountBadge = ({ price, dealPrice }) => {
  const p = parseFloat(price);
  const dp = parseFloat(dealPrice);
  if (!p || !dp || dp >= p) return null;
  const pct = Math.round(((p - dp) / p) * 100);
  return (
    <Chip
      label={`${pct}% OFF`}
      size="small"
      sx={{
        bgcolor: '#FFF3E0',
        color: '#F4A261',
        fontWeight: 700,
        fontSize: '0.7rem',
        border: '1px solid #F4A261',
        height: 20,
        animation: 'popIn 0.2s ease',
        '@keyframes popIn': {
          '0%': { transform: 'scale(0.7)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      }}
    />
  );
};

/* ─── Image Upload Zone ─── */
const ImageUploadZone = ({ images, onAdd, onRemove }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      onAdd({ file, url });
    });
  };

  return (
    <Box>
      <FieldLabel>Images</FieldLabel>

      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        sx={{
          border: `2px dashed ${dragging ? '#F4A261' : '#E2E8F0'}`,
          borderRadius: '10px',
          p: 3,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragging ? '#FFF8F0' : '#F8FAFC',
          transition: 'all 0.18s ease',
          '&:hover': { borderColor: '#F4A261', bgcolor: '#FFF8F0' },
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 32, color: dragging ? '#F4A261' : '#CBD5E1', mb: 0.5 }} />
        <Typography fontWeight={600} color="#192235" fontSize="0.88rem">
          Drop images here or{' '}
          <span style={{ color: '#F4A261' }}>browse</span>
        </Typography>
        <Typography fontSize="0.75rem" color="#6B7280" mt={0.25}>
          PNG · JPG · WEBP
        </Typography>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={(e) => processFiles(e.target.files)}
        />
      </Box>

      {images.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1.5 }}>
          {images.map((img, idx) => (
            <Box
              key={idx}
              sx={{
                position: 'relative',
                width: 80,
                height: 80,
                borderRadius: '8px',
                overflow: 'hidden',
                border: idx === 0 ? '2px solid #F4A261' : '2px solid #E2E8F0',
                transition: 'border-color 0.15s',
                '&:hover .del-btn': { opacity: 1 },
                animation: 'fadeSlideIn 0.2s ease',
                '@keyframes fadeSlideIn': {
                  '0%': { opacity: 0, transform: 'scale(0.85)' },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                },
              }}
            >
              <img
                src={img.url}
                alt={`img-${idx}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {idx === 0 && (
                <Box sx={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  bgcolor: 'rgba(244,162,97,0.85)',
                  py: '2px',
                  textAlign: 'center',
                }}>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
                    COVER
                  </Typography>
                </Box>
              )}
              <IconButton
                className="del-btn"
                size="small"
                onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                sx={{
                  position: 'absolute', top: 2, right: 2,
                  bgcolor: 'rgba(255,255,255,0.92)',
                  opacity: 0,
                  transition: 'opacity 0.15s',
                  width: 22, height: 22,
                  '&:hover': { bgcolor: '#fff' },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 13, color: '#EF4444' }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

/* ─── Inline section divider ─── */
const SectionDivider = ({ label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, mb: 0.5 }}>
    <Typography sx={{
      fontSize: '0.68rem',
      fontWeight: 800,
      color: '#CBD5E1',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </Typography>
    <Box sx={{ flex: 1, height: '1px', bgcolor: '#F1F5F9' }} />
  </Box>
);

/* ─── Progress bar showing form completeness ─── */
const FormProgress = ({ form }) => {
  const fields = ['title', 'price', 'dealPrice', 'validFrom', 'validTill'];
  const filled = fields.filter((f) => form[f]).length;
  const pct = Math.round((filled / fields.length) * 100);

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: '#6B7280' }}>
          Form completion
        </Typography>
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: pct === 100 ? '#22C55E' : '#F4A261' }}>
          {pct}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 4,
          borderRadius: 4,
          bgcolor: '#F1F5F9',
          '& .MuiLinearProgress-bar': {
            bgcolor: pct === 100 ? '#22C55E' : '#F4A261',
            borderRadius: 4,
            transition: 'width 0.4s ease',
          },
        }}
      />
    </Box>
  );
};

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
const AddDealsPage = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    dealPrice: '',
    validFrom: '',
    validTill: '',
    isActive: true,
  });
  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const { mutate: publishDeal, isPending: submitting } = useCreateDeal(shopId, {
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    },
    onError: (err) => setErrors({ submit: err.message }),
  });

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.price || isNaN(form.price)) e.price = 'Enter a valid price';
    if (!form.dealPrice || isNaN(form.dealPrice)) e.dealPrice = 'Enter a valid deal price';
    if (parseFloat(form.dealPrice) >= parseFloat(form.price))
      e.dealPrice = 'Deal price must be less than original price';
    if (!form.validFrom) e.validFrom = 'Start date required';
    if (!form.validTill) e.validTill = 'End date required';
    if (form.validFrom && form.validTill && form.validTill < form.validFrom)
      e.validTill = 'End date must be after start date';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    publishDeal({ ...form, images });
  };

  /* ── Success State ── */
  if (success) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}>
        <Fade in>
          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}>
              <CheckCircleIcon sx={{ fontSize: 44, color: '#22C55E' }} />
            </Box>
            <Typography sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#192235',
            }}>
              Deal Published!
            </Typography>
            <Typography sx={{ color: '#6B7280', mt: 0.5, fontSize: '0.9rem' }}>
              Redirecting to deals…
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  /* ── Main Form ── */
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>

        {/* ── Top bar ── */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={() => navigate(`/shop/${shopId}/deals`)}
            sx={{
              color: '#6B7280',
              fontWeight: 600,
              fontSize: '0.82rem',
              p: 0,
              minWidth: 0,
              '&:hover': { color: '#192235', bgcolor: 'transparent' },
            }}
          >
            Deals
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              // bgcolor: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <SellIcon sx={{ fontSize: 15, color: '#F4A261' }} />
            </Box>
            <Typography sx={{
              // fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 500,
              textTransform: 'uppercase',
              fontSize: '1rem',
              color: '#192235',
            }}>
              Create Deal 
            </Typography>
          </Box>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting
              ? <CircularProgress size={13} color="inherit" />
              : <SellIcon sx={{ fontSize: '1rem !important' }} />
            }
            sx={{
              borderRadius: '8px',
              bgcolor: '#0F172A',
              color: '#fff',
              fontWeight: 700,
              px: 2.5,
              py: 0.9,
              fontSize: '0.82rem',
              boxShadow: 'none',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              '&:hover': { bgcolor: '#1E293B', boxShadow: '0 4px 20px rgba(15,23,42,0.2)' },
              '&:disabled': { bgcolor: '#CBD5E1' },
            }}
          >
            {submitting ? 'Publishing…' : 'Publish'}
          </Button>
        </Box>

        {/* ── Form completion bar ── */}
        <FormProgress form={form} />

        {/* ── Form body — flat, no cards ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Images */}
          <Box sx={{ mb: 3 }}>
            <ImageUploadZone
              images={images}
              onAdd={(img) => setImages((prev) => [...prev, img])}
              onRemove={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))}
            />
          </Box>

          <SectionDivider label="Deal Info" />

          {/* Title */}
          <Box sx={{ mb: 2.5, mt: 2 }}>
            <FieldLabel required>Deal Title</FieldLabel>
            <TextField
              fullWidth
              placeholder="e.g. Buy 1 Get 1 Free on Pizzas"
              value={form.title}
              onChange={set('title')}
              error={!!errors.title}
              helperText={errors.title}
              sx={inputSx}
            />
          </Box>

          {/* Description */}
          <Box sx={{ mb: 3 }}>
            <FieldLabel>Description</FieldLabel>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Describe your deal — terms, highlights, what makes it special…"
              value={form.description}
              onChange={set('description')}
              sx={inputSx}
            />
          </Box>

          <SectionDivider label="Pricing" />

          {/* Prices */}
          <Grid container spacing={2} sx={{ mt: 1.5, mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <FieldLabel required>Original Price</FieldLabel>
              <TextField
                fullWidth
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={set('price')}
                error={!!errors.price}
                helperText={errors.price}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeIcon sx={{ fontSize: 16, color: '#CBD5E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <FieldLabel required>Deal Price</FieldLabel>
                <DiscountBadge price={form.price} dealPrice={form.dealPrice} />
              </Box>
              <TextField
                fullWidth
                type="number"
                placeholder="0.00"
                value={form.dealPrice}
                onChange={set('dealPrice')}
                error={!!errors.dealPrice}
                helperText={errors.dealPrice}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeIcon sx={{ fontSize: 16, color: '#F4A261' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  ...inputSx,
                  '& .MuiOutlinedInput-root': {
                    ...inputSx['& .MuiOutlinedInput-root'],
                    '&.Mui-focused fieldset': { borderColor: '#F4A261', borderWidth: '2px' },
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Savings summary — live feedback */}
          {form.price && form.dealPrice && parseFloat(form.dealPrice) < parseFloat(form.price) && (
            <Fade in>
              <Box sx={{
                mb: 3,
                p: 1.5,
                borderRadius: '8px',
                bgcolor: '#FFF8F0',
                border: '1px solid #FDDCB5',
              }}>
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: '#F4A261', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Customer saves
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#192235' }}>
                    ₹{(parseFloat(form.price) - parseFloat(form.dealPrice)).toFixed(2)}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ borderColor: '#FDDCB5' }} />
                <Box>
                  <Typography sx={{ fontSize: '0.7rem', color: '#F4A261', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Discount
                  </Typography>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#192235' }}>
                    {Math.round(((parseFloat(form.price) - parseFloat(form.dealPrice)) / parseFloat(form.price)) * 100)}%
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}

          <SectionDivider label="Validity" />

          {/* Dates */}
          <Grid container spacing={2} sx={{ mt: 1.5, mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <FieldLabel required>Valid From</FieldLabel>
              <TextField
                fullWidth
                type="date"
                value={form.validFrom}
                onChange={set('validFrom')}
                error={!!errors.validFrom}
                helperText={errors.validFrom}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ fontSize: 14, color: '#CBD5E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FieldLabel required>Valid Till</FieldLabel>
              <TextField
                fullWidth
                type="date"
                value={form.validTill}
                onChange={set('validTill')}
                error={!!errors.validTill}
                helperText={errors.validTill}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ fontSize: 14, color: '#CBD5E1' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputSx}
              />
            </Grid>
          </Grid>

          {/* Duration live feedback */}
          {form.validFrom && form.validTill && form.validTill >= form.validFrom && (
            <Fade in>
              <Box sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>
                  Deal runs for{' '}
                  <strong style={{ color: '#192235' }}>
                    {Math.ceil((new Date(form.validTill) - new Date(form.validFrom)) / (1000 * 60 * 60 * 24) + 1)} days
                  </strong>
                </Typography>
              </Box>
            </Fade>
          )}

          {/* Submit error */}
          {errors.submit && (
            <Alert severity="error" sx={{ borderRadius: '8px', mb: 2 }}>
              {errors.submit}
            </Alert>
          )}

          {/* Mobile publish button */}
          <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 1.5, mt: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate(`/shop/${shopId}/deals`)}
              disabled={submitting}
              sx={{
                borderRadius: '8px',
                borderColor: '#E2E8F0',
                color: '#6B7280',
                fontWeight: 600,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                '&:hover': { borderColor: '#192235', color: '#192235' },
              }}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <SellIcon />}
              sx={{
                borderRadius: '8px',
                bgcolor: '#0F172A',
                color: '#fff',
                fontWeight: 700,
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1E293B' },
                '&:disabled': { bgcolor: '#CBD5E1' },
              }}
            >
              {submitting ? 'Publishing…' : 'Publish Deal'}
            </Button>
          </Box>

        </Box>
      </Container>
    </Box>
  );
};

export default AddDealsPage;