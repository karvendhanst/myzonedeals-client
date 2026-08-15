// import React, { useState, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Box, Container, Typography, TextField, Button, MenuItem,
//   Grid, CircularProgress, Alert, Chip, IconButton, Paper,
// } from '@mui/material';
// import CloudUploadIcon from '@mui/icons-material/CloudUpload';
// import CloseIcon from '@mui/icons-material/Close';
// import { useCategories } from '../hooks/useCategories';
// import { useCreateListing } from '../hooks/useListings';
// import { useGetMyShops } from '../hooks/useGetMyShops';
// import useAuthStore from '../store/authStore';

// /* ── Type metadata ── */
// const TYPE_META = {
//   SELL:     { label: 'Sell Something',       color: '#6366f1' },
//   RENT:     { label: 'Rent Something',        color: '#0ea5e9' },
//   EVENT:    { label: 'Create an Event',       color: '#f59e0b' },
//   SERVICE:  { label: 'Offer a Service',       color: '#10b981' },
//   GIVEAWAY: { label: 'Give Something Away',   color: '#ec4899' },
//   DEAL:     { label: 'Post a Deal',           color: '#f97316' },
// };

// const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'];
// const RENTAL_PERIODS = ['hourly', 'daily', 'weekly', 'monthly'];
// const PRICING_TYPES = ['fixed', 'hourly', 'negotiable'];
// const DEAL_TYPES = ['discount', 'bogo', 'freebie', 'showcase'];

// export default function ListingFormPage() {
//   const { listingType: rawType } = useParams();
//   const listingType = rawType?.toUpperCase();
//   const navigate = useNavigate();
//   const role = useAuthStore((s) => s.role);

//   const meta = TYPE_META[listingType];
//   const { data: categories = [] } = useCategories({ listingType });
//   const { data: shopsData } = useGetMyShops();
//   const myShops = shopsData?.data ?? [];

//   const createMutation = useCreateListing();
//   const fileInputRef = useRef(null);

//   const [fields, setFields] = useState({
//     title: '', description: '', category: '',
//     // SELL
//     price: '', condition: '', negotiable: false,
//     // RENT
//     rentalPeriod: '', deposit: '', availabilityDate: '',
//     // EVENT
//     startDate: '', endDate: '', startTime: '', endTime: '', venue: '',
//     ticketRequired: false, ticketPrice: '',
//     // SERVICE
//     pricingType: '', serviceArea: '', availability: '',
//     // DEAL
//     shopId: '', dealType: 'discount', dealPrice: '', validFrom: '', validUntil: '',
//     // Location
//     latitude: '', longitude: '', street: '', city: '', state: '', pincode: '',
//   });
//   const [images, setImages] = useState([]);
//   const [previews, setPreviews] = useState([]);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   if (!meta) {
//     return (
//       <Box sx={{ p: 4, textAlign: 'center' }}>
//         <Typography color="error">Unknown listing type: {rawType}</Typography>
//         <Button onClick={() => navigate('/post')} sx={{ mt: 2 }}>Back</Button>
//       </Box>
//     );
//   }

//   const set = (key) => (e) =>
//     setFields((prev) => ({ ...prev, [key]: e.target.value }));

//   const handleFiles = (e) => {
//     const files = Array.from(e.target.files).slice(0, 10 - images.length);
//     setImages((prev) => [...prev, ...files]);
//     files.forEach((f) => {
//       const reader = new FileReader();
//       reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target.result]);
//       reader.readAsDataURL(f);
//     });
//   };

//   const removeImage = (idx) => {
//     setImages((prev) => prev.filter((_, i) => i !== idx));
//     setPreviews((prev) => prev.filter((_, i) => i !== idx));
//   };

//   const buildMetadata = () => {
//     const m = {};
//     if (['SELL', 'RENT', 'SERVICE', 'DEAL'].includes(listingType) && fields.price)
//       m.price = Number(fields.price);
//     if (listingType === 'SELL') {
//       if (fields.condition) m.condition = fields.condition;
//       m.negotiable = fields.negotiable;
//     }
//     if (listingType === 'RENT') {
//       if (fields.rentalPeriod) m.rentalPeriod = fields.rentalPeriod;
//       if (fields.deposit) m.deposit = Number(fields.deposit);
//       if (fields.availabilityDate) m.availabilityDate = fields.availabilityDate;
//     }
//     if (listingType === 'EVENT') {
//       if (fields.startDate) m.startDate = fields.startDate;
//       if (fields.endDate) m.endDate = fields.endDate;
//       if (fields.startTime) m.startTime = fields.startTime;
//       if (fields.endTime) m.endTime = fields.endTime;
//       if (fields.venue) m.venue = fields.venue;
//       m.ticketRequired = fields.ticketRequired;
//       if (fields.ticketPrice) m.ticketPrice = Number(fields.ticketPrice);
//     }
//     if (listingType === 'SERVICE') {
//       if (fields.pricingType) m.pricingType = fields.pricingType;
//       if (fields.serviceArea) m.serviceArea = fields.serviceArea;
//       if (fields.availability) m.availability = fields.availability;
//     }
//     if (listingType === 'DEAL') {
//       m.dealType = fields.dealType;
//       if (fields.dealPrice) m.dealPrice = Number(fields.dealPrice);
//       if (fields.validFrom) m.validFrom = fields.validFrom;
//       if (fields.validUntil) m.validUntil = fields.validUntil;
//     }
//     return m;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     if (!fields.title.trim()) return setError('Title is required');
//     if (!fields.latitude || !fields.longitude)
//       return setError('Location coordinates are required');

//     const fd = new FormData();
//     fd.append('listingType', listingType);
//     fd.append('title', fields.title);
//     fd.append('description', fields.description);
//     if (fields.category) fd.append('category', fields.category);
//     fd.append(
//       'location',
//       JSON.stringify({
//         type: 'Point',
//         coordinates: [parseFloat(fields.longitude), parseFloat(fields.latitude)],
//         address: {
//           street: fields.street, city: fields.city,
//           state: fields.state, pincode: fields.pincode,
//         },
//       })
//     );
//     fd.append('metadata', JSON.stringify(buildMetadata()));
//     if (listingType === 'DEAL' && fields.shopId) {
//       fd.append('source', JSON.stringify({ type: 'SHOP', shopId: fields.shopId }));
//     }
//     images.forEach((img) => fd.append('images', img));

//     try {
//       const result = await createMutation.mutateAsync(fd);
//       setSuccess(true);
//       setTimeout(() => navigate(`/listings/${result.listing._id}`), 1500);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   /* ── Shared field style ── */
//   const inputSx = {
//     '& .MuiInputBase-root': { bgcolor: '#fff', borderRadius: 2 },
//     '& .MuiInputLabel-root': { color: '#666' },
//     '& .MuiInputBase-input': { color: '#1a1a1a' },
//     '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
//     '& .MuiSelect-icon': { color: '#666' },
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: 'calc(100vh - 72px)',
//         bgcolor: '#FAFAF8',
//         py: 5, px: 2,
//       }}
//     >
//       <Container maxWidth="md">
//         {/* Header */}
//         <Box sx={{ mb: 4 }}>
//           <Chip
//             label={meta.label}
//             sx={{ bgcolor: `${meta.color}22`, color: meta.color, fontWeight: 700, mb: 2 }}
//           />
//           <Typography
//             variant="h4"
//             fontWeight={800}
//             sx={{ color: '#1a1a1a', fontFamily: '"Plus Jakarta Sans",sans-serif' }}
//           >
//             Create your listing
//           </Typography>
//         </Box>

//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={3}>

//             {/* ── Common fields ── */}
//             <Grid item xs={12}>
//               <TextField fullWidth label="Title *" value={fields.title}
//                 onChange={set('title')} sx={inputSx} />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField fullWidth multiline rows={4} label="Description"
//                 value={fields.description} onChange={set('description')} sx={inputSx} />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth select label="Category" value={fields.category}
//                 onChange={set('category')} sx={inputSx}>
//                 <MenuItem value="">Select category</MenuItem>
//                 {categories.map((c) => (
//                   <MenuItem key={c._id} value={c._id}>{c.icon} {c.name}</MenuItem>
//                 ))}
//               </TextField>
//             </Grid>

//             {/* ── SELL fields ── */}
//             {listingType === 'SELL' && (
//               <>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Price (₹)" type="number"
//                     value={fields.price} onChange={set('price')} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth select label="Condition"
//                     value={fields.condition} onChange={set('condition')} sx={inputSx}>
//                     {CONDITIONS.map((c) => (
//                       <MenuItem key={c} value={c}>{c.replace('_', ' ')}</MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>
//               </>
//             )}

//             {/* ── RENT fields ── */}
//             {listingType === 'RENT' && (
//               <>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Price (₹)" type="number"
//                     value={fields.price} onChange={set('price')} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth select label="Rental Period"
//                     value={fields.rentalPeriod} onChange={set('rentalPeriod')} sx={inputSx}>
//                     {RENTAL_PERIODS.map((r) => (
//                       <MenuItem key={r} value={r}>{r}</MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Deposit (₹)" type="number"
//                     value={fields.deposit} onChange={set('deposit')} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Available From" type="date"
//                     value={fields.availabilityDate} onChange={set('availabilityDate')}
//                     InputLabelProps={{ shrink: true }} sx={inputSx} />
//                 </Grid>
//               </>
//             )}

//             {/* ── EVENT fields ── */}
//             {listingType === 'EVENT' && (
//               <>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Start Date" type="date"
//                     value={fields.startDate} onChange={set('startDate')}
//                     InputLabelProps={{ shrink: true }} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="End Date" type="date"
//                     value={fields.endDate} onChange={set('endDate')}
//                     InputLabelProps={{ shrink: true }} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Start Time" type="time"
//                     value={fields.startTime} onChange={set('startTime')}
//                     InputLabelProps={{ shrink: true }} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="End Time" type="time"
//                     value={fields.endTime} onChange={set('endTime')}
//                     InputLabelProps={{ shrink: true }} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField fullWidth label="Venue / Location name"
//                     value={fields.venue} onChange={set('venue')} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Ticket Price (₹, 0 = free)" type="number"
//                     value={fields.ticketPrice} onChange={set('ticketPrice')} sx={inputSx} />
//                 </Grid>
//               </>
//             )}

//             {/* ── SERVICE fields ── */}
//             {listingType === 'SERVICE' && (
//               <>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth select label="Pricing Type"
//                     value={fields.pricingType} onChange={set('pricingType')} sx={inputSx}>
//                     {PRICING_TYPES.map((p) => (
//                       <MenuItem key={p} value={p}>{p}</MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Price (₹)" type="number"
//                     value={fields.price} onChange={set('price')} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Service Area"
//                     value={fields.serviceArea} onChange={set('serviceArea')} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Availability"
//                     value={fields.availability} onChange={set('availability')} sx={inputSx} />
//                 </Grid>
//               </>
//             )}

//             {/* ── DEAL fields ── */}
//             {listingType === 'DEAL' && (
//               <>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth select label="Select Shop *"
//                     value={fields.shopId} onChange={set('shopId')} sx={inputSx}>
//                     {myShops.filter(s => s.isVerified).map((s) => (
//                       <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
//                     ))}
//                     {myShops.filter(s => s.isVerified).length === 0 && (
//                       <MenuItem disabled>No verified shops available</MenuItem>
//                     )}
//                   </TextField>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth select label="Deal Type"
//                     value={fields.dealType} onChange={set('dealType')} sx={inputSx}>
//                     {DEAL_TYPES.map((d) => (
//                       <MenuItem key={d} value={d}>{d}</MenuItem>
//                     ))}
//                   </TextField>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Original Price (₹)" type="number"
//                     value={fields.price} onChange={set('price')} sx={inputSx} />
//                 </Grid>
//                 {fields.dealType === 'discount' && (
//                   <Grid item xs={12} sm={6}>
//                     <TextField fullWidth label="Deal Price (₹)" type="number"
//                       value={fields.dealPrice} onChange={set('dealPrice')} sx={inputSx} />
//                   </Grid>
//                 )}
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Valid From" type="date"
//                     value={fields.validFrom} onChange={set('validFrom')}
//                     InputLabelProps={{ shrink: true }} sx={inputSx} />
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <TextField fullWidth label="Valid Until" type="date"
//                     value={fields.validUntil} onChange={set('validUntil')}
//                     InputLabelProps={{ shrink: true }} sx={inputSx} />
//                 </Grid>
//               </>
//             )}

//             {/* ── Location ── */}
//             <Grid item xs={12}>
//               <Typography variant="subtitle2" sx={{ color: '#666', mb: 1.5 }}>
//                 Location
//               </Typography>
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Latitude *" type="number"
//                 value={fields.latitude} onChange={set('latitude')} sx={inputSx} />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="Longitude *" type="number"
//                 value={fields.longitude} onChange={set('longitude')} sx={inputSx} />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="City" value={fields.city}
//                 onChange={set('city')} sx={inputSx} />
//             </Grid>
//             <Grid item xs={12} sm={6}>
//               <TextField fullWidth label="State" value={fields.state}
//                 onChange={set('state')} sx={inputSx} />
//             </Grid>

//             {/* ── Media upload ── */}
//             <Grid item xs={12}>
//               <Typography variant="subtitle2" sx={{ color: '#666', mb: 1.5 }}>
//                 Images (max 10)
//               </Typography>
//               <Paper
//                 onClick={() => fileInputRef.current?.click()}
//                 sx={{
//                   border: '2px dashed #e0e0e0',
//                   borderRadius: 2, p: 3, textAlign: 'center',
//                   cursor: 'pointer', bgcolor: '#fff',
//                   '&:hover': { borderColor: meta.color },
//                 }}
//               >
//                 <CloudUploadIcon sx={{ fontSize: 36, color: meta.color, mb: 1 }} />
//                 <Typography sx={{ color: '#666', fontSize: 14 }}>
//                   Click to upload images
//                 </Typography>
//               </Paper>
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 hidden
//                 onChange={handleFiles}
//               />
//               {previews.length > 0 && (
//                 <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
//                   {previews.map((src, i) => (
//                     <Box key={i} sx={{ position: 'relative', width: 80, height: 80 }}>
//                       <img
//                         src={src}
//                         alt=""
//                         style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
//                       />
//                       <IconButton
//                         size="small"
//                         onClick={() => removeImage(i)}
//                         sx={{
//                           position: 'absolute', top: -8, right: -8,
//                           bgcolor: '#ef4444', color: '#fff', width: 20, height: 20,
//                           '&:hover': { bgcolor: '#dc2626' },
//                         }}
//                       >
//                         <CloseIcon sx={{ fontSize: 12 }} />
//                       </IconButton>
//                     </Box>
//                   ))}
//                 </Box>
//               )}
//             </Grid>

//             {/* ── Error / Success ── */}
//             {error && (
//               <Grid item xs={12}>
//                 <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
//               </Grid>
//             )}
//             {success && (
//               <Grid item xs={12}>
//                 <Alert severity="success" sx={{ borderRadius: 2 }}>
//                   Listing created! Redirecting…
//                 </Alert>
//               </Grid>
//             )}

//             {/* ── Submit ── */}
//             <Grid item xs={12}>
//               <Button
//                 type="submit"
//                 fullWidth
//                 variant="contained"
//                 disabled={createMutation.isPending}
//                 sx={{
//                   py: 1.8,
//                   borderRadius: 2.5,
//                   fontWeight: 700,
//                   fontSize: 16,
//                   background: `linear-gradient(135deg,${meta.color},${meta.color}bb)`,
//                   '&:hover': { background: meta.color },
//                 }}
//               >
//                 {createMutation.isPending ? <CircularProgress size={22} color="inherit" /> : 'Post Listing'}
//               </Button>
//             </Grid>

//           </Grid>
//         </form>
//       </Container>
//     </Box>
//   );
// }


import React, { useState, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, TextField, Button, MenuItem,
  Grid, CircularProgress, Alert, IconButton, Paper, LinearProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SellIcon from '@mui/icons-material/Sell';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import RedeemIcon from '@mui/icons-material/Redeem';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useCategories } from '../hooks/useCategories';
import { useCreateListing } from '../hooks/useListings';
import { useGetMyShops } from '../hooks/useGetMyShops';
import useAuthStore from '../store/authStore';

/* ── Type metadata ── */
const TYPE_META = {
  SELL:     { label: 'Sell Something',     short: 'Sell',     color: '#6366f1' },
  RENT:     { label: 'Rent Something',     short: 'Rent',     color: '#0ea5e9' },
  EVENT:    { label: 'Create an Event',    short: 'Event',    color: '#f59e0b' },
  SERVICE:  { label: 'Offer a Service',    short: 'Service',  color: '#10b981' },
  GIVEAWAY: { label: 'Give Something Away',short: 'Giveaway', color: '#ec4899' },
  DEAL:     { label: 'Post a Deal',        short: 'Deal',     color: '#f97316' },
};

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];
const RENTAL_PERIODS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];
const PRICING_TYPES = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'negotiable', label: 'Negotiable' },
];
const DEAL_TYPES = [
  { value: 'discount', label: 'Flat Discount', icon: TrendingDownIcon },
  { value: 'bogo', label: 'Buy & Get', icon: CardGiftcardIcon },
  { value: 'freebie', label: 'Free Gift', icon: RedeemIcon },
  { value: 'showcase', label: 'Showcase Only', icon: StorefrontIcon },
];

/* ────────────────────────────────────────────────────────────
   Small presentational helpers
   ──────────────────────────────────────────────────────────── */

function Section({ label, children, sx }) {
  return (
    <Box sx={{ mb: { xs: 3.5, sm: 4.5 }, ...sx }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: '#9CA3AF',
          textTransform: 'uppercase',
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ borderBottom: '1px solid #EEEEEE', mb: 2.5 }} />
      {children}
    </Box>
  );
}

function FieldLabel({ children, required }) {
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#374151', mb: 0.75, letterSpacing: '0.02em' }}>
      {children} {required && <Box component="span" sx={{ color: '#f97316' }}>*</Box>}
    </Typography>
  );
}

function PillGroup({ options, value, onChange, color, columns }) {
  const hasIcons = options.some((o) => o.icon);
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: `repeat(${Math.min(2, options.length)}, 1fr)`,
          sm: `repeat(${columns || Math.min(options.length, 4)}, 1fr)`,
        },
        gap: 1.25,
      }}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        const Icon = opt.icon;
        return (
          <Box
            key={opt.value}
            role="button"
            tabIndex={0}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChange(opt.value)}
            sx={{
              cursor: 'pointer',
              borderRadius: 2,
              border: '1.5px solid',
              borderColor: selected ? color : '#E5E7EB',
              bgcolor: selected ? `${color}14` : '#fff',
              color: selected ? color : '#374151',
              px: 1.5,
              py: hasIcons ? 1.5 : 1.25,
              textAlign: hasIcons ? 'center' : 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              transition: 'all .15s ease',
              userSelect: 'none',
              '&:hover': { borderColor: color },
              '&:focus-visible': { outline: `2px solid ${color}`, outlineOffset: 2 },
            }}
          >
            {Icon && <Icon sx={{ fontSize: 20 }} />}
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</Typography>
          </Box>
        );
      })}
    </Box>
  );
}

/* ────────────────────────────────────────────────────────────
   Main component
   ──────────────────────────────────────────────────────────── */

export default function ListingFormPage() {
  const { listingType: rawType } = useParams();
  const listingType = rawType?.toUpperCase();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);

  const meta = TYPE_META[listingType];
  const { data: categories = [] } = useCategories({ listingType });
  const { data: shopsData } = useGetMyShops();
  const myShops = shopsData?.data ?? [];

  const createMutation = useCreateListing();
  const fileInputRef = useRef(null);

  const [fields, setFields] = useState({
    title: '', description: '', category: '',
    // SELL
    price: '', condition: '', negotiable: false,
    // RENT
    rentalPeriod: '', deposit: '', availabilityDate: '',
    // EVENT
    startDate: '', endDate: '', startTime: '', endTime: '', venue: '',
    ticketRequired: false, ticketPrice: '',
    // SERVICE
    pricingType: '', serviceArea: '', availability: '',
    // DEAL
    shopId: '', dealType: 'discount', dealPrice: '', validFrom: '', validUntil: '',
    // Location
    latitude: '', longitude: '', street: '', city: '', state: '', pincode: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!meta) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Unknown listing type: {rawType}</Typography>
        <Button onClick={() => navigate('/post')} sx={{ mt: 2 }}>Back</Button>
      </Box>
    );
  }

  const set = (key) => (e) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));
  const setVal = (key) => (val) =>
    setFields((prev) => ({ ...prev, [key]: val }));

  const addFiles = (fileList) => {
    const files = Array.from(fileList).slice(0, 10 - images.length);
    setImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const handleFiles = (e) => addFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildMetadata = () => {
    const m = {};
    if (['SELL', 'RENT', 'SERVICE', 'DEAL'].includes(listingType) && fields.price)
      m.price = Number(fields.price);
    if (listingType === 'SELL') {
      if (fields.condition) m.condition = fields.condition;
      m.negotiable = fields.negotiable;
    }
    if (listingType === 'RENT') {
      if (fields.rentalPeriod) m.rentalPeriod = fields.rentalPeriod;
      if (fields.deposit) m.deposit = Number(fields.deposit);
      if (fields.availabilityDate) m.availabilityDate = fields.availabilityDate;
    }
    if (listingType === 'EVENT') {
      if (fields.startDate) m.startDate = fields.startDate;
      if (fields.endDate) m.endDate = fields.endDate;
      if (fields.startTime) m.startTime = fields.startTime;
      if (fields.endTime) m.endTime = fields.endTime;
      if (fields.venue) m.venue = fields.venue;
      m.ticketRequired = fields.ticketRequired;
      if (fields.ticketPrice) m.ticketPrice = Number(fields.ticketPrice);
    }
    if (listingType === 'SERVICE') {
      if (fields.pricingType) m.pricingType = fields.pricingType;
      if (fields.serviceArea) m.serviceArea = fields.serviceArea;
      if (fields.availability) m.availability = fields.availability;
    }
    if (listingType === 'DEAL') {
      m.dealType = fields.dealType;
      if (fields.dealPrice) m.dealPrice = Number(fields.dealPrice);
      if (fields.validFrom) m.validFrom = fields.validFrom;
      if (fields.validUntil) m.validUntil = fields.validUntil;
    }
    return m;
  };

  const doSubmit = async () => {
    setError('');
    if (!fields.title.trim()) return setError('Title is required');
    if (!fields.latitude || !fields.longitude)
      return setError('Location coordinates are required');

    const fd = new FormData();
    fd.append('listingType', listingType);
    fd.append('title', fields.title);
    fd.append('description', fields.description);
    if (fields.category) fd.append('category', fields.category);
    fd.append(
      'location',
      JSON.stringify({
        type: 'Point',
        coordinates: [parseFloat(fields.longitude), parseFloat(fields.latitude)],
        address: {
          street: fields.street, city: fields.city,
          state: fields.state, pincode: fields.pincode,
        },
      })
    );
    fd.append('metadata', JSON.stringify(buildMetadata()));
    if (listingType === 'DEAL' && fields.shopId) {
      fd.append('source', JSON.stringify({ type: 'SHOP', shopId: fields.shopId }));
    }
    images.forEach((img) => fd.append('images', img));

    try {
      const result = await createMutation.mutateAsync(fd);
      setSuccess(true);
      setTimeout(() => navigate(`/listings/${result.listing._id}`), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    doSubmit();
  };

  /* ── Progress calculation ── */
  const progress = useMemo(() => {
    const base = [
      !!fields.title.trim(),
      images.length > 0,
      !!fields.category,
      !!fields.latitude && !!fields.longitude,
    ];
    const extra = [];
    if (listingType === 'SELL') extra.push(!!fields.price, !!fields.condition);
    if (listingType === 'RENT') extra.push(!!fields.price, !!fields.rentalPeriod);
    if (listingType === 'EVENT') extra.push(!!fields.startDate, !!fields.venue);
    if (listingType === 'SERVICE') extra.push(!!fields.pricingType, !!fields.serviceArea);
    if (listingType === 'DEAL') extra.push(!!fields.shopId, !!fields.dealPrice || !!fields.price);
    const all = [...base, ...extra];
    return Math.round((all.filter(Boolean).length / all.length) * 100);
  }, [fields, images, listingType]);

  /* ── Shared field style ── */
  const inputSx = {
    '& .MuiInputBase-root': { bgcolor: '#fff', borderRadius: 2, fontSize: 15.5 },
    '& .MuiInputLabel-root': { display: 'none' },
    '& .MuiInputBase-input': { color: '#1a1a1a', py: 1.75 },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: meta.color },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: meta.color, borderWidth: 1.5 },
    '& .MuiSelect-icon': { color: '#666' },
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#FAFAF8' }}>
      {/* ── Sticky top bar ── */}
      <Box
        sx={{
          position: 'sticky', top: 0, zIndex: 10,
          bgcolor: '#FAFAF8', borderBottom: '1px solid #EEEEEE',
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            py: { xs: 1.5, sm: 2 }, gap: 1,
          }}>
            <Box
              onClick={() => navigate('/post')}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer',
                color: '#6B7280', flexShrink: 0,
                '&:hover': { color: '#1a1a1a' },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 18 }} />
              <Typography sx={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.06em',
                display: { xs: 'none', sm: 'block' },
              }}>
                BACK
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
              <SellIcon sx={{ fontSize: 16, color: meta.color, flexShrink: 0 }} />
              <Typography
                noWrap
                sx={{
                  fontSize: { xs: 12, sm: 13 }, fontWeight: 700, letterSpacing: '0.06em',
                  color: meta.color, textTransform: 'uppercase',
                }}
              >
                Create {meta.short}
              </Typography>
            </Box>

            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              sx={{
                bgcolor: '#111827', color: '#fff', borderRadius: 2,
                px: { xs: 1.75, sm: 2.5 }, py: 0.9, fontSize: 12.5, fontWeight: 700,
                letterSpacing: '0.04em', flexShrink: 0,
                '&:hover': { bgcolor: '#000' },
                '&.Mui-disabled': { bgcolor: '#111827', opacity: 0.6, color: '#fff' },
              }}
            >
              {createMutation.isPending ? <CircularProgress size={16} color="inherit" /> : 'PUBLISH'}
            </Button>
          </Box>

          <Box sx={{ pb: 1.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.06em' }}>
                FORM COMPLETION
              </Typography>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: meta.color }}>
                {progress}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 4, borderRadius: 4, bgcolor: '#EEEEEE',
                '& .MuiLinearProgress-bar': { bgcolor: meta.color, borderRadius: 4 },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* ── Form body ── */}
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
        <Box component="form" onSubmit={handleSubmit}>

          {/* Images */}
          <Section label="Images">
            <Paper
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              elevation={0}
              sx={{
                border: '2px dashed',
                borderColor: dragActive ? meta.color : '#E5E7EB',
                borderRadius: 2.5, p: { xs: 3, sm: 4 }, textAlign: 'center',
                cursor: 'pointer', bgcolor: dragActive ? `${meta.color}0A` : '#FBFBFA',
                transition: 'all .15s ease',
                '&:hover': { borderColor: meta.color },
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 32, color: '#9CA3AF', mb: 1 }} />
              <Typography sx={{ color: '#1a1a1a', fontSize: 14, fontWeight: 500 }}>
                Drop images here or{' '}
                <Box component="span" sx={{ color: meta.color, fontWeight: 700 }}>browse</Box>
              </Typography>
              <Typography sx={{ color: '#9CA3AF', fontSize: 11.5, mt: 0.5, letterSpacing: '0.03em' }}>
                PNG · JPG · WEBP
              </Typography>
            </Paper>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleFiles}
            />
            {previews.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1.25, mt: 2, flexWrap: 'wrap' }}>
                {previews.map((src, i) => (
                  <Box key={i} sx={{ position: 'relative', width: { xs: 68, sm: 80 }, height: { xs: 68, sm: 80 } }}>
                    <img
                      src={src}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }}
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                      sx={{
                        position: 'absolute', top: -8, right: -8,
                        bgcolor: '#ef4444', color: '#fff', width: 20, height: 20,
                        '&:hover': { bgcolor: '#dc2626' },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Section>

          {/* Basic info */}
          <Section label={`${meta.short} Info`}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <FieldLabel required>{meta.short} Title</FieldLabel>
                <TextField fullWidth placeholder="e.g. Buy 1 Get 1 Free on Pizzas"
                  value={fields.title} onChange={set('title')} sx={inputSx} />
              </Box>
              <Box>
                <FieldLabel>Description</FieldLabel>
                <TextField fullWidth multiline rows={4}
                  placeholder="Describe your listing — terms, highlights, what makes it special…"
                  value={fields.description} onChange={set('description')} sx={inputSx} />
              </Box>
              <Box>
                <FieldLabel>Category</FieldLabel>
                <TextField fullWidth select value={fields.category}
                  onChange={set('category')} sx={inputSx}>
                  <MenuItem value="">Select category</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.icon} {c.name}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>
          </Section>

          {/* ── SELL fields ── */}
          {listingType === 'SELL' && (
            <Section label="Offer Details">
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <FieldLabel>Pricing</FieldLabel>
                  <PillGroup
                    options={[{ value: 'false', label: 'Fixed Price' }, { value: 'true', label: 'Negotiable' }]}
                    value={String(fields.negotiable)}
                    onChange={(v) => setVal('negotiable')(v === 'true')}
                    color={meta.color}
                    columns={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel required>Price (₹)</FieldLabel>
                  <TextField fullWidth type="number" placeholder="0.00"
                    value={fields.price} onChange={set('price')} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Condition</FieldLabel>
                  <PillGroup options={CONDITIONS} value={fields.condition}
                    onChange={setVal('condition')} color={meta.color} columns={3} />
                </Grid>
              </Grid>
            </Section>
          )}

          {/* ── RENT fields ── */}
          {listingType === 'RENT' && (
            <Section label="Offer Details">
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <FieldLabel>Rental Period</FieldLabel>
                  <PillGroup options={RENTAL_PERIODS} value={fields.rentalPeriod}
                    onChange={setVal('rentalPeriod')} color={meta.color} columns={4} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel required>Price (₹)</FieldLabel>
                  <TextField fullWidth type="number" placeholder="0.00"
                    value={fields.price} onChange={set('price')} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Deposit (₹)</FieldLabel>
                  <TextField fullWidth type="number" placeholder="0.00"
                    value={fields.deposit} onChange={set('deposit')} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Available From</FieldLabel>
                  <TextField fullWidth type="date"
                    value={fields.availabilityDate} onChange={set('availabilityDate')}
                    InputLabelProps={{ shrink: true }} sx={inputSx} />
                </Grid>
              </Grid>
            </Section>
          )}

          {/* ── EVENT fields ── */}
          {listingType === 'EVENT' && (
            <Section label="Event Details">
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <FieldLabel required>Start Date</FieldLabel>
                  <TextField fullWidth type="date"
                    value={fields.startDate} onChange={set('startDate')}
                    InputLabelProps={{ shrink: true }} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>End Date</FieldLabel>
                  <TextField fullWidth type="date"
                    value={fields.endDate} onChange={set('endDate')}
                    InputLabelProps={{ shrink: true }} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Start Time</FieldLabel>
                  <TextField fullWidth type="time"
                    value={fields.startTime} onChange={set('startTime')}
                    InputLabelProps={{ shrink: true }} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>End Time</FieldLabel>
                  <TextField fullWidth type="time"
                    value={fields.endTime} onChange={set('endTime')}
                    InputLabelProps={{ shrink: true }} sx={inputSx} />
                </Grid>
                <Grid item xs={12}>
                  <FieldLabel required>Venue / Location Name</FieldLabel>
                  <TextField fullWidth placeholder="e.g. Community Hall, MG Road"
                    value={fields.venue} onChange={set('venue')} sx={inputSx} />
                </Grid>
                <Grid item xs={12}>
                  <FieldLabel>Tickets</FieldLabel>
                  <PillGroup
                    options={[{ value: 'false', label: 'Free Entry' }, { value: 'true', label: 'Paid Entry' }]}
                    value={String(fields.ticketRequired)}
                    onChange={(v) => setVal('ticketRequired')(v === 'true')}
                    color={meta.color}
                    columns={2}
                  />
                </Grid>
                {fields.ticketRequired && (
                  <Grid item xs={12} sm={6}>
                    <FieldLabel>Ticket Price (₹)</FieldLabel>
                    <TextField fullWidth type="number" placeholder="0.00"
                      value={fields.ticketPrice} onChange={set('ticketPrice')} sx={inputSx} />
                  </Grid>
                )}
              </Grid>
            </Section>
          )}

          {/* ── SERVICE fields ── */}
          {listingType === 'SERVICE' && (
            <Section label="Offer Details">
              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <FieldLabel required>Pricing Type</FieldLabel>
                  <PillGroup options={PRICING_TYPES} value={fields.pricingType}
                    onChange={setVal('pricingType')} color={meta.color} columns={3} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel>Price (₹)</FieldLabel>
                  <TextField fullWidth type="number" placeholder="0.00"
                    value={fields.price} onChange={set('price')} sx={inputSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FieldLabel required>Service Area</FieldLabel>
                  <TextField fullWidth placeholder="e.g. Within 5km"
                    value={fields.serviceArea} onChange={set('serviceArea')} sx={inputSx} />
                </Grid>
                <Grid item xs={12}>
                  <FieldLabel>Availability</FieldLabel>
                  <TextField fullWidth placeholder="e.g. Mon–Sat, 9am–6pm"
                    value={fields.availability} onChange={set('availability')} sx={inputSx} />
                </Grid>
              </Grid>
            </Section>
          )}

          {/* ── DEAL fields ── */}
          {listingType === 'DEAL' && (
            <>
              <Section label="Offer Details">
                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <FieldLabel required>Select Shop</FieldLabel>
                    <TextField fullWidth select value={fields.shopId}
                      onChange={set('shopId')} sx={inputSx}>
                      {myShops.filter((s) => s.isVerified).map((s) => (
                        <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                      ))}
                      {myShops.filter((s) => s.isVerified).length === 0 && (
                        <MenuItem disabled>No verified shops available</MenuItem>
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <FieldLabel>Offer Type</FieldLabel>
                    <PillGroup options={DEAL_TYPES} value={fields.dealType}
                      onChange={setVal('dealType')} color={meta.color} columns={4} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel required>Original Price (₹)</FieldLabel>
                    <TextField fullWidth type="number" placeholder="0.00"
                      value={fields.price} onChange={set('price')} sx={inputSx} />
                  </Grid>
                  {fields.dealType === 'discount' && (
                    <Grid item xs={12} sm={6}>
                      <FieldLabel required>Deal Price (₹)</FieldLabel>
                      <TextField fullWidth type="number" placeholder="0.00"
                        value={fields.dealPrice} onChange={set('dealPrice')} sx={inputSx} />
                    </Grid>
                  )}
                </Grid>
              </Section>

              <Section label="Validity">
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel required>Valid From</FieldLabel>
                    <TextField fullWidth type="date"
                      value={fields.validFrom} onChange={set('validFrom')}
                      InputLabelProps={{ shrink: true }} sx={inputSx} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FieldLabel required>Valid Till</FieldLabel>
                    <TextField fullWidth type="date"
                      value={fields.validUntil} onChange={set('validUntil')}
                      InputLabelProps={{ shrink: true }} sx={inputSx} />
                  </Grid>
                </Grid>
              </Section>
            </>
          )}

          {/* ── Location ── */}
          <Section label="Location">
            <Grid container spacing={2.5}>
              <Grid item xs={6} sm={6}>
                <FieldLabel required>Latitude</FieldLabel>
                <TextField fullWidth type="number" placeholder="0.000000"
                  value={fields.latitude} onChange={set('latitude')} sx={inputSx} />
              </Grid>
              <Grid item xs={6} sm={6}>
                <FieldLabel required>Longitude</FieldLabel>
                <TextField fullWidth type="number" placeholder="0.000000"
                  value={fields.longitude} onChange={set('longitude')} sx={inputSx} />
              </Grid>
              <Grid item xs={12}>
                <FieldLabel>Street</FieldLabel>
                <TextField fullWidth placeholder="Street address"
                  value={fields.street} onChange={set('street')} sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FieldLabel>City</FieldLabel>
                <TextField fullWidth value={fields.city} onChange={set('city')} sx={inputSx} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FieldLabel>State</FieldLabel>
                <TextField fullWidth value={fields.state} onChange={set('state')} sx={inputSx} />
              </Grid>
              <Grid item xs={6} sm={4}>
                <FieldLabel>Pincode</FieldLabel>
                <TextField fullWidth value={fields.pincode} onChange={set('pincode')} sx={inputSx} />
              </Grid>
            </Grid>
          </Section>

          {error && <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ borderRadius: 2, mb: 2 }}>
              Listing created! Redirecting…
            </Alert>
          )}

          {/* Bottom publish button — mirrors the sticky one, useful once the page scrolls */}
          <Button
            type="submit"
            fullWidth
            disabled={createMutation.isPending}
            sx={{
              mt: 1, py: 1.6, borderRadius: 2.5, fontWeight: 700, fontSize: 15,
              letterSpacing: '0.02em',
              bgcolor: '#111827', color: '#fff',
              '&:hover': { bgcolor: '#000' },
              '&.Mui-disabled': { bgcolor: '#111827', opacity: 0.6, color: '#fff' },
            }}
          >
            {createMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Publish Listing'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}