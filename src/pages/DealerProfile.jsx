// import React, { useState, useRef } from 'react';
// import { Box, Typography, Tabs, Tab, TextField, Button, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
// import { PhotoCamera, Lock, Edit, Delete } from '@mui/icons-material';
// import { useGetProfile } from '../hooks/useGetProfile';
// import { useUpdateProfile } from '../hooks/useUpdateProfile';
// import { useGetMyShops } from '../hooks/useGetMyShops';
// import { useUpdateShop } from '../hooks/useUpdateShop';
// import { uploadProfilePictureApi } from '../api/dealerApi';
// import { fetchDealsByShop, deleteDeal } from '../api/dealApi';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';

// const T = {
//   primaryMain: '#0F172A',
//   secondaryMain: '#F4A261',
//   bgDefault: '#ebebeb',
//   bgWhite: '#FFFFFF',
//   textPrimary: '#192235',
//   textSecondary: '#6B7280',
//   border: '#E5E7EB',
//   error: '#DC2626',
//   font: '"Plus Jakarta Sans", sans-serif',
// };

// const TabPanel = (props) => {
//   const { children, value, index, ...other } = props;
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`profile-tabpanel-${index}`}
//       aria-labelledby={`profile-tab-${index}`}
//       {...other}
//       style={{ width: '100%', padding: '24px 0' }}
//     >
//       {value === index && (
//         <Box>
//           {children}
//         </Box>
//       )}
//     </div>
//   );
// };

// const ProfileTab = ({ profile, refetch }) => {
//   const initialName = profile?.data?.name || '';
//   const initialPhone = profile?.data?.phone || '';
//   const [name, setName] = useState(initialName);
//   const [phone, setPhone] = useState(initialPhone);
//   const [isUploading, setIsUploading] = useState(false);
//   const fileInputRef = useRef(null);

//   const { mutate: updateProfile, isPending } = useUpdateProfile();

//   const handleSave = () => {
//     updateProfile({ name, phone });
//   };

//   const handlePhotoUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setIsUploading(true);
//     const formData = new FormData();
//     formData.append('profilePicture', file);

//     try {
//       await uploadProfilePictureApi(formData);
//       refetch(); // Reload profile to show new picture
//     } catch (error) {
//       console.error('Failed to upload picture:', error);
//       alert('Failed to upload picture');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto', p: 3, bgcolor: T.bgWhite, borderRadius: 2, border: `1px solid ${T.border}` }}>
//       <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
//         <Box sx={{ position: 'relative' }}>
//           <Avatar 
//             src={profile?.data?.profilePicture} 
//             sx={{ width: 100, height: 100, border: `2px solid ${T.border}` }} 
//           />
//           <IconButton 
//             sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: T.primaryMain, color: 'white', '&:hover': { bgcolor: T.secondaryMain } }}
//             onClick={() => fileInputRef.current?.click()}
//             disabled={isUploading}
//           >
//             <PhotoCamera fontSize="small" />
//           </IconButton>
//           <input 
//             type="file" 
//             ref={fileInputRef} 
//             style={{ display: 'none' }} 
//             accept="image/*"
//             onChange={handlePhotoUpload}
//           />
//         </Box>
//         <Box>
//           <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700 }}>Profile Picture</Typography>
//           <Typography variant="body2" sx={{ color: T.textSecondary }}>Upload a new avatar (max 5MB).</Typography>
//         </Box>
//       </Box>

//       <TextField 
//         label="Name" 
//         value={name} 
//         onChange={(e) => setName(e.target.value)} 
//         fullWidth 
//         variant="outlined" 
//       />

//       <TextField 
//         label="Email" 
//         value={profile?.data?.email || ''} 
//         fullWidth 
//         variant="outlined"
//         disabled
//         InputProps={{
//           endAdornment: <Lock sx={{ color: T.textSecondary }} />,
//         }}
//         helperText="Email address cannot be changed."
//       />

//       <TextField 
//         label="Phone Number" 
//         value={phone} 
//         onChange={(e) => setPhone(e.target.value)} 
//         fullWidth 
//         variant="outlined" 
//       />

//       <Button 
//         variant="contained" 
//         onClick={handleSave} 
//         disabled={isPending || (name === initialName && phone === initialPhone)}
//         sx={{ mt: 2, bgcolor: T.primaryMain, color: 'white', '&:hover': { bgcolor: '#1E293B' }, py: 1.5, fontWeight: 600 }}
//       >
//         {isPending ? 'Saving...' : 'Save Profile'}
//       </Button>
//     </Box>
//   );
// };

// const ShopsTab = ({ shops }) => {
//   const [editingShop, setEditingShop] = useState(null);
//   const [originalShop, setOriginalShop] = useState(null);
//   const { mutate: updateShop, isPending } = useUpdateShop();
//   const fileInputRef = useRef(null);

//   const handleEditClick = (shop) => {
//     const editForm = {
//       ...shop,
//       street: shop.address?.street || '',
//       city: shop.address?.city || '',
//       state: shop.address?.state || '',
//       pincode: shop.address?.pincode || '',
//       country: shop.address?.country || 'India',
//       newImage: null,
//     };
//     setEditingShop(editForm);
//     setOriginalShop(editForm);
//   };

//   const handleClose = () => {
//     setEditingShop(null);
//     setOriginalShop(null);
//   };

//   const handleSave = () => {
//     const formData = new FormData();
//     formData.append('name', editingShop.name);
//     formData.append('category', editingShop.category);
//     formData.append('street', editingShop.street);
//     formData.append('city', editingShop.city);
//     formData.append('state', editingShop.state);
//     formData.append('pincode', editingShop.pincode);
//     formData.append('country', editingShop.country);
    
//     // We're not updating location here for simplicity, but we could pass long/lat
//     if (editingShop.location?.coordinates) {
//        formData.append('longitude', editingShop.location.coordinates[0]);
//        formData.append('latitude', editingShop.location.coordinates[1]);
//     }

//     if (editingShop.newImage) {
//       formData.append('shopImage', editingShop.newImage);
//     }

//     updateShop({ shopId: editingShop._id, formData }, {
//       onSuccess: () => {
//         handleClose();
//       }
//     });
//   };

//   const categories = ["Grocery", "Restaurant", "Pharmacy", "Electronics", "Clothing", "Bakery", "Salon & Spa", "Fitness", "Books & Stationery", "Jewellery", "Hardware", "Other"];

//   return (
//     <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
//       {shops.map(shop => (
//         <Box key={shop._id} sx={{ p: 3, bgcolor: T.bgWhite, borderRadius: 2, border: `1px solid ${T.border}`, display: 'flex', gap: 2, alignItems: 'center' }}>
//           <Avatar src={shop.shopImage} sx={{ width: 64, height: 64, borderRadius: 2 }} variant="rounded" />
//           <Box sx={{ flex: 1 }}>
//             <Typography sx={{ fontWeight: 700, fontFamily: T.font }}>{shop.name}</Typography>
//             <Typography variant="body2" sx={{ color: T.textSecondary }}>{shop.category}</Typography>
//             <Typography variant="body2" sx={{ color: T.textSecondary }}>{shop.address?.city}</Typography>
//           </Box>
//           <IconButton onClick={() => handleEditClick(shop)} sx={{ bgcolor: T.bgDefault }}>
//             <Edit fontSize="small" />
//           </IconButton>
//         </Box>
//       ))}

//       {shops.length === 0 && (
//         <Typography sx={{ gridColumn: '1 / -1', textAlign: 'center', p: 4, color: T.textSecondary }}>
//           You don't have any shops yet.
//         </Typography>
//       )}

//       {/* Edit Shop Dialog */}
//       <Dialog open={!!editingShop} onClose={handleClose} maxWidth="sm" fullWidth>
//         <DialogTitle sx={{ fontFamily: T.font, fontWeight: 700 }}>Edit Shop</DialogTitle>
//         <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
//           <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
//              <Avatar 
//                 src={editingShop?.newImage ? URL.createObjectURL(editingShop.newImage) : editingShop?.shopImage} 
//                 sx={{ width: 80, height: 80, borderRadius: 2 }} 
//                 variant="rounded"
//               />
//               <Button variant="outlined" onClick={() => fileInputRef.current?.click()} size="small">
//                 Change Image
//               </Button>
//               <input 
//                 type="file" 
//                 ref={fileInputRef} 
//                 style={{ display: 'none' }} 
//                 accept="image/*"
//                 onChange={(e) => setEditingShop({...editingShop, newImage: e.target.files[0]})}
//               />
//           </Box>
//           <TextField label="Shop Name" value={editingShop?.name || ''} onChange={e => setEditingShop({...editingShop, name: e.target.value})} fullWidth />
          
//           <FormControl fullWidth>
//             <InputLabel>Category</InputLabel>
//             <Select value={editingShop?.category || ''} label="Category" onChange={e => setEditingShop({...editingShop, category: e.target.value})}>
//               {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
//             </Select>
//           </FormControl>

//           <TextField label="Street" value={editingShop?.street || ''} onChange={e => setEditingShop({...editingShop, street: e.target.value})} fullWidth />
//           <Box sx={{ display: 'flex', gap: 2 }}>
//             <TextField label="City" value={editingShop?.city || ''} onChange={e => setEditingShop({...editingShop, city: e.target.value})} fullWidth />
//             <TextField label="State" value={editingShop?.state || ''} onChange={e => setEditingShop({...editingShop, state: e.target.value})} fullWidth />
//           </Box>
//           <TextField label="Pincode" value={editingShop?.pincode || ''} onChange={e => setEditingShop({...editingShop, pincode: e.target.value})} fullWidth />
          
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button onClick={handleClose} color="inherit">Cancel</Button>
//           <Button 
//             onClick={handleSave} 
//             variant="contained" 
//             disabled={isPending || JSON.stringify(editingShop) === JSON.stringify(originalShop)} 
//             sx={{ bgcolor: T.primaryMain, color: 'white' }}
//           >
//             {isPending ? 'Saving...' : 'Save Changes'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// const DealsTab = ({ shops }) => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();

//   // Fetch deals for all shops
//   const dealsQueries = useQuery({
//     queryKey: ['allDeals', shops.map(s => s._id)],
//     queryFn: async () => {
//       const promises = shops.map(shop => fetchDealsByShop(shop._id).then(res => ({ shop, deals: res.deals })));
//       return Promise.all(promises);
//     },
//     enabled: shops.length > 0,
//   });

//   const { mutate: deleteDealMutation } = useMutation({
//     mutationFn: deleteDeal,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['allDeals'] });
//     },
//   });

//   const handleDelete = (dealId) => {
//     if (window.confirm("Are you sure you want to delete this deal?")) {
//       deleteDealMutation(dealId);
//     }
//   };

//   if (dealsQueries.isLoading) return <Typography>Loading deals...</Typography>;
//   const data = dealsQueries.data || [];

//   let totalDeals = 0;
//   data.forEach(item => { totalDeals += item.deals.length; });

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
//       {totalDeals === 0 && (
//         <Typography sx={{ textAlign: 'center', p: 4, color: T.textSecondary }}>
//           No deals found across your shops.
//         </Typography>
//       )}

//       {data.map((item) => item.deals.length > 0 && (
//         <Box key={item.shop._id}>
//           <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700, mb: 2 }}>
//             {item.shop.name}
//           </Typography>
//           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
//             {item.deals.map(deal => (
//               <Box key={deal._id} sx={{ p: 2, bgcolor: T.bgWhite, borderRadius: 2, border: `1px solid ${T.border}`, display: 'flex', gap: 2, alignItems: 'center' }}>
//                 <Avatar 
//                   src={deal.images?.length > 0 ? deal.images.find(img => img.isCover)?.url || deal.images[0].url : ''} 
//                   sx={{ width: 60, height: 60, borderRadius: 1 }} 
//                   variant="rounded" 
//                 />
//                 <Box sx={{ flex: 1, minWidth: 0 }}>
//                    <Typography sx={{ fontWeight: 600, fontFamily: T.font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                      {deal.title}
//                    </Typography>
//                    <Typography variant="body2" sx={{ color: T.textSecondary, textTransform: 'capitalize' }}>
//                      {deal.dealType} Offer
//                    </Typography>
//                    <Typography variant="body2" sx={{ fontWeight: 700, color: T.primaryMain }}>
//                      {deal.dealPrice ? `₹${deal.dealPrice}` : (deal.price ? `₹${deal.price}` : 'Free')}
//                    </Typography>
//                 </Box>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Button variant="outlined" size="small" onClick={() => navigate(`/shop/${item.shop._id}/deals`)}>
//                     Manage
//                   </Button>
//                   <IconButton size="small" color="error" onClick={() => handleDelete(deal._id)}>
//                     <Delete fontSize="small" />
//                   </IconButton>
//                 </Box>
//               </Box>
//             ))}
//           </Box>
//         </Box>
//       ))}
//     </Box>
//   );
// };


// const DealerProfile = () => {
//   const [tabIndex, setTabIndex] = useState(0);
  
//   const { data: profileResponse, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile();
//   const { data: shopsResponse, isLoading: shopsLoading } = useGetMyShops();

//   if (profileLoading || shopsLoading) {
//     return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading...</Typography></Box>;
//   }

//   const handleTabChange = (event, newValue) => {
//     setTabIndex(newValue);
//   };

//   return (
//     <Box sx={{ minHeight: '100vh', bgcolor: T.bgDefault, fontFamily: T.font }}>
//       <Box sx={{ bgcolor: T.bgWhite, borderBottom: `1px solid ${T.border}`, px: { xs: 2, md: 6 }, py: 3 }}>
//         <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: T.font, color: T.primaryMain }}>
//           Manage Profile
//         </Typography>
//         <Typography variant="body1" sx={{ color: T.textSecondary, mt: 1 }}>
//           Update your personal information, shops, and deals.
//         </Typography>

//         <Tabs 
//           value={tabIndex} 
//           onChange={handleTabChange} 
//           sx={{ mt: 3, '& .MuiTab-root': { fontFamily: T.font, fontWeight: 600, textTransform: 'none', fontSize: '15px' }, '& .Mui-selected': { color: `${T.primaryMain} !important` }, '& .MuiTabs-indicator': { bgcolor: T.primaryMain } }}
//         >
//           <Tab label="My Profile" />
//           <Tab label="My Shops" />
//           <Tab label="My Deals" />
//         </Tabs>
//       </Box>

//       <Box sx={{ px: { xs: 2, md: 6 } }}>
//         <TabPanel value={tabIndex} index={0}>
//           <ProfileTab profile={profileResponse} refetch={refetchProfile} />
//         </TabPanel>
//         <TabPanel value={tabIndex} index={1}>
//           <ShopsTab shops={shopsResponse?.data || []} />
//         </TabPanel>
//         <TabPanel value={tabIndex} index={2}>
//           <DealsTab shops={shopsResponse?.data || []} />
//         </TabPanel>
//       </Box>
//     </Box>
//   );
// };

// export default DealerProfile;

import React, { useMemo, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Skeleton,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  PhotoCamera,
  Lock,
  EditRounded,
  DeleteOutlineRounded,
  StorefrontRounded,
  LocalOfferRounded,
  PersonRounded,
  PlaceRounded,
  ArrowForwardRounded,
  WarningAmberRounded,
} from '@mui/icons-material';
import { useGetProfile } from '../hooks/useGetProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useGetMyShops } from '../hooks/useGetMyShops';
import { useUpdateShop } from '../hooks/useUpdateShop';
import { uploadProfilePictureApi } from '../api/dealerApi';
import { fetchDealsByShop, deleteDeal } from '../api/dealApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

/* ----------------------------------------------------------------------- */
/*  Design tokens                                                          */
/* ----------------------------------------------------------------------- */

const T = {
  ink: '#0F172A',
  ink2: '#1E293B',
  accent: '#F4A261',
  accentDark: '#E08A3E',
  bg: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceMuted: '#F8FAFC',
  border: '#E5E9F0',
  borderStrong: '#CBD5E1',
  textPrimary: '#111827',
  textSecondary: '#64748B',
  textFaint: '#94A3B8',
  success: '#16A34A',
  successBg: '#ECFDF5',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  radius: 18,
  radiusSm: 12,
  font: '"Plus Jakarta Sans", "Inter", sans-serif',
  shadow: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.10)',
  shadowLg: '0 4px 8px rgba(15,23,42,0.04), 0 24px 48px -20px rgba(15,23,42,0.18)',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: `${T.radiusSm}px`,
    fontFamily: T.font,
    bgcolor: T.surfaceMuted,
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderStrong },
    '&.Mui-focused fieldset': { borderColor: T.ink, borderWidth: '1.5px' },
  },
  '& .MuiInputLabel-root': { fontFamily: T.font },
};

const primaryBtnSx = {
  bgcolor: T.ink,
  color: '#fff',
  textTransform: 'none',
  fontFamily: T.font,
  fontWeight: 700,
  borderRadius: '999px',
  px: 3,
  py: 1.1,
  boxShadow: 'none',
  '&:hover': { bgcolor: T.ink2, boxShadow: 'none' },
  '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
};

const ghostBtnSx = {
  textTransform: 'none',
  fontFamily: T.font,
  fontWeight: 600,
  borderRadius: '999px',
  color: T.textSecondary,
  px: 2.5,
  '&:hover': { bgcolor: T.surfaceMuted },
};

/* ----------------------------------------------------------------------- */
/*  Small shared pieces                                                    */
/* ----------------------------------------------------------------------- */

const SectionCard = ({ children, sx = {} }) => (
  <Box
    sx={{
      bgcolor: T.surface,
      borderRadius: `${T.radius}px`,
      border: `1px solid ${T.border}`,
      boxShadow: T.shadow,
      ...sx,
    }}
  >
    {children}
  </Box>
);

const EmptyState = ({ icon, title, subtitle, action }) => (
  <Box
    sx={{
      textAlign: 'center',
      p: { xs: 5, md: 8 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        bgcolor: T.surfaceMuted,
        border: `1px solid ${T.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: T.textFaint,
        mb: 1,
      }}
    >
      {icon}
    </Box>
    <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ color: T.textSecondary, maxWidth: 360, fontFamily: T.font }}>
        {subtitle}
      </Typography>
    )}
    {action}
  </Box>
);

/* ----------------------------------------------------------------------- */
/*  Profile tab                                                             */
/* ----------------------------------------------------------------------- */

const ProfileTab = ({ profile, refetch, onNotify }) => {
  const initialName = profile?.data?.name || '';
  const initialPhone = profile?.data?.phone || '';
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const isDirty = name !== initialName || phone !== initialPhone;

  const handleSave = () => {
    updateProfile(
      { name, phone },
      {
        onSuccess: () => onNotify('success', 'Profile updated.'),
        onError: () => onNotify('error', "Couldn't save your changes. Try again."),
      }
    );
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onNotify('error', 'That image is over 5MB. Choose a smaller file.');
      event.target.value = '';
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await uploadProfilePictureApi(formData);
      await refetch();
      onNotify('success', 'Profile photo updated.');
    } catch (error) {
      onNotify('error', "Couldn't upload that photo. Try again.");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <SectionCard sx={{ maxWidth: 640, mx: 'auto', p: { xs: 3, md: 4 } }}>
      <Typography sx={{ fontFamily: T.font, fontWeight: 800, fontSize: 18, color: T.textPrimary, mb: 0.5 }}>
        Personal information
      </Typography>
      <Typography variant="body2" sx={{ color: T.textSecondary, mb: 3 }}>
        This is how you appear to customers on your shop pages.
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={profile?.data?.profilePicture}
            sx={{
              width: 88,
              height: 88,
              border: `3px solid ${T.surface}`,
              boxShadow: `0 0 0 1px ${T.border}`,
              fontFamily: T.font,
              fontWeight: 700,
              bgcolor: T.ink,
            }}
          >
            {initialName ? initialName.charAt(0).toUpperCase() : <PersonRounded />}
          </Avatar>
          <Tooltip title="Change photo">
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                bgcolor: T.ink,
                color: 'white',
                width: 32,
                height: 32,
                border: `2px solid ${T.surface}`,
                '&:hover': { bgcolor: T.accentDark },
              }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <PhotoCamera sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: T.font, fontWeight: 700, color: T.textPrimary }}>
            {isUploading ? 'Uploading…' : 'Profile photo'}
          </Typography>
          <Typography variant="body2" sx={{ color: T.textSecondary }}>
            JPG or PNG. Up to 5MB.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          sx={fieldSx}
        />

        <TextField
          label="Email"
          value={profile?.data?.email || ''}
          fullWidth
          disabled
          sx={fieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Lock sx={{ color: T.textFaint, fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          helperText="Your email is fixed and can't be changed."
        />

        <TextField
          label="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          fullWidth
          sx={fieldSx}
        />
      </Box>

      <Divider sx={{ my: 3, borderColor: T.border }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
        {isDirty && (
          <Button
            onClick={() => {
              setName(initialName);
              setPhone(initialPhone);
            }}
            sx={ghostBtnSx}
          >
            Discard
          </Button>
        )}
        <Button onClick={handleSave} disabled={isPending || !isDirty} sx={primaryBtnSx}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </Box>
    </SectionCard>
  );
};

/* ----------------------------------------------------------------------- */
/*  Shops tab                                                               */
/* ----------------------------------------------------------------------- */

const CATEGORIES = [
  'Grocery',
  'Restaurant',
  'Pharmacy',
  'Electronics',
  'Clothing',
  'Bakery',
  'Salon & Spa',
  'Fitness',
  'Books & Stationery',
  'Jewellery',
  'Hardware',
  'Other',
];

const ShopsTab = ({ shops, onNotify }) => {
  const [editingShop, setEditingShop] = useState(null);
  const [originalShop, setOriginalShop] = useState(null);
  const { mutate: updateShop, isPending } = useUpdateShop();
  const fileInputRef = useRef(null);

  const handleEditClick = (shop) => {
    const editForm = {
      ...shop,
      street: shop.address?.street || '',
      city: shop.address?.city || '',
      state: shop.address?.state || '',
      pincode: shop.address?.pincode || '',
      country: shop.address?.country || 'India',
      newImage: null,
    };
    setEditingShop(editForm);
    setOriginalShop(editForm);
  };

  const handleClose = () => {
    setEditingShop(null);
    setOriginalShop(null);
  };

  const handleSave = () => {
    const formData = new FormData();
    formData.append('name', editingShop.name);
    formData.append('category', editingShop.category);
    formData.append('street', editingShop.street);
    formData.append('city', editingShop.city);
    formData.append('state', editingShop.state);
    formData.append('pincode', editingShop.pincode);
    formData.append('country', editingShop.country);

    if (editingShop.location?.coordinates) {
      formData.append('longitude', editingShop.location.coordinates[0]);
      formData.append('latitude', editingShop.location.coordinates[1]);
    }

    if (editingShop.newImage) {
      formData.append('shopImage', editingShop.newImage);
    }

    updateShop(
      { shopId: editingShop._id, formData },
      {
        onSuccess: () => {
          onNotify('success', 'Shop details updated.');
          handleClose();
        },
        onError: () => onNotify('error', "Couldn't save this shop. Try again."),
      }
    );
  };

  if (shops.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          icon={<StorefrontRounded />}
          title="No shops yet"
          subtitle="Shops you create will show up here for you to manage."
        />
      </SectionCard>
    );
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
      {shops.map((shop) => (
        <SectionCard
          key={shop._id}
          sx={{
            p: 2.5,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            transition: 'border-color 120ms ease, box-shadow 120ms ease',
            '&:hover': { borderColor: T.borderStrong, boxShadow: T.shadowLg },
          }}
        >
          <Avatar
            src={shop.shopImage}
            variant="rounded"
            sx={{ width: 64, height: 64, borderRadius: '14px', bgcolor: T.surfaceMuted, color: T.textFaint }}
          >
            <StorefrontRounded />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontFamily: T.font, color: T.textPrimary }} noWrap>
              {shop.name}
            </Typography>
            <Chip
              label={shop.category}
              size="small"
              sx={{
                mt: 0.5,
                mb: 0.5,
                height: 22,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: T.font,
                bgcolor: T.surfaceMuted,
                color: T.textSecondary,
                border: `1px solid ${T.border}`,
              }}
            />
            {shop.address?.city && (
              <Typography
                variant="body2"
                sx={{ color: T.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}
                noWrap
              >
                <PlaceRounded sx={{ fontSize: 15 }} /> {shop.address.city}
              </Typography>
            )}
          </Box>
          <Tooltip title="Edit shop">
            <IconButton
              onClick={() => handleEditClick(shop)}
              sx={{
                bgcolor: T.surfaceMuted,
                border: `1px solid ${T.border}`,
                '&:hover': { bgcolor: T.bg },
              }}
            >
              <EditRounded fontSize="small" sx={{ color: T.textPrimary }} />
            </IconButton>
          </Tooltip>
        </SectionCard>
      ))}

      <Dialog
        open={!!editingShop}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: `${T.radius}px` } }}
      >
        <DialogTitle sx={{ fontFamily: T.font, fontWeight: 800, pb: 1 }}>Edit shop</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, p: 3, borderColor: T.border }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5 }}>
            <Avatar
              src={editingShop?.newImage ? URL.createObjectURL(editingShop.newImage) : editingShop?.shopImage}
              sx={{ width: 72, height: 72, borderRadius: '14px', bgcolor: T.surfaceMuted, color: T.textFaint }}
              variant="rounded"
            >
              <StorefrontRounded />
            </Avatar>
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              size="small"
              sx={{
                textTransform: 'none',
                fontFamily: T.font,
                fontWeight: 600,
                borderRadius: '999px',
                borderColor: T.borderStrong,
                color: T.textPrimary,
              }}
            >
              Change image
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={(e) => setEditingShop({ ...editingShop, newImage: e.target.files[0] })}
            />
          </Box>

          <TextField
            label="Shop name"
            value={editingShop?.name || ''}
            onChange={(e) => setEditingShop({ ...editingShop, name: e.target.value })}
            fullWidth
            sx={fieldSx}
          />

          <FormControl fullWidth sx={fieldSx}>
            <InputLabel>Category</InputLabel>
            <Select
              value={editingShop?.category || ''}
              label="Category"
              onChange={(e) => setEditingShop({ ...editingShop, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Street"
            value={editingShop?.street || ''}
            onChange={(e) => setEditingShop({ ...editingShop, street: e.target.value })}
            fullWidth
            sx={fieldSx}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              value={editingShop?.city || ''}
              onChange={(e) => setEditingShop({ ...editingShop, city: e.target.value })}
              fullWidth
              sx={fieldSx}
            />
            <TextField
              label="State"
              value={editingShop?.state || ''}
              onChange={(e) => setEditingShop({ ...editingShop, state: e.target.value })}
              fullWidth
              sx={fieldSx}
            />
          </Box>
          <TextField
            label="Pincode"
            value={editingShop?.pincode || ''}
            onChange={(e) => setEditingShop({ ...editingShop, pincode: e.target.value })}
            fullWidth
            sx={fieldSx}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleClose} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || JSON.stringify(editingShop) === JSON.stringify(originalShop)}
            sx={primaryBtnSx}
          >
            {isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ----------------------------------------------------------------------- */
/*  Deals tab                                                               */
/* ----------------------------------------------------------------------- */

const DealsTab = ({ shops, onNotify }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState(null);

  const dealsQuery = useQuery({
    queryKey: ['allDeals', shops.map((s) => s._id)],
    queryFn: async () => {
      const promises = shops.map((shop) =>
        fetchDealsByShop(shop._id).then((res) => ({ shop, deals: res.deals }))
      );
      return Promise.all(promises);
    },
    enabled: shops.length > 0,
  });

  const { mutate: deleteDealMutation, isPending: isDeleting } = useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDeals'] });
      onNotify('success', 'Deal deleted.');
      setPendingDelete(null);
    },
    onError: () => onNotify('error', "Couldn't delete this deal. Try again."),
  });

  if (shops.length === 0) {
    return (
      <SectionCard>
        <EmptyState
          icon={<LocalOfferRounded />}
          title="No shops to show deals for"
          subtitle="Create a shop first, then add deals to it."
        />
      </SectionCard>
    );
  }

  if (dealsQuery.isLoading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SectionCard key={i} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="rounded" width={60} height={60} sx={{ borderRadius: '10px' }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="70%" />
              <Skeleton width="40%" />
              <Skeleton width="30%" />
            </Box>
          </SectionCard>
        ))}
      </Box>
    );
  }

  const data = dealsQuery.data || [];
  const totalDeals = data.reduce((sum, item) => sum + item.deals.length, 0);

  if (totalDeals === 0) {
    return (
      <SectionCard>
        <EmptyState
          icon={<LocalOfferRounded />}
          title="No deals yet"
          subtitle="Deals you publish across your shops will appear here."
        />
      </SectionCard>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {data.map(
        (item) =>
          item.deals.length > 0 && (
            <Box key={item.shop._id}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontFamily: T.font, fontWeight: 800, fontSize: 16, color: T.textPrimary }}>
                  {item.shop.name}
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardRounded sx={{ fontSize: 16 }} />}
                  onClick={() => navigate(`/shop/${item.shop._id}/deals`)}
                  sx={{ ...ghostBtnSx, px: 1.5 }}
                >
                  Manage all
                </Button>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {item.deals.map((deal) => {
                  const cover = deal.images?.length
                    ? deal.images.find((img) => img.isCover)?.url || deal.images[0].url
                    : '';
                  const priceLabel = deal.dealPrice
                    ? `₹${deal.dealPrice}`
                    : deal.price
                    ? `₹${deal.price}`
                    : 'Free';
                  return (
                    <SectionCard
                      key={deal._id}
                      sx={{
                        p: 2,
                        display: 'flex',
                        gap: 2,
                        alignItems: 'center',
                        transition: 'border-color 120ms ease, box-shadow 120ms ease',
                        '&:hover': { borderColor: T.borderStrong, boxShadow: T.shadowLg },
                      }}
                    >
                      <Avatar
                        src={cover}
                        variant="rounded"
                        sx={{ width: 58, height: 58, borderRadius: '12px', bgcolor: T.surfaceMuted, color: T.textFaint }}
                      >
                        <LocalOfferRounded fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{ fontWeight: 700, fontFamily: T.font, color: T.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {deal.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: T.textSecondary, textTransform: 'capitalize' }}>
                          {deal.dealType} offer
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: T.ink, mt: 0.25 }}>
                          {priceLabel}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Manage">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/shop/${item.shop._id}/deals`)}
                            sx={{ bgcolor: T.surfaceMuted, border: `1px solid ${T.border}` }}
                          >
                            <EditRounded sx={{ fontSize: 17, color: T.textPrimary }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => setPendingDelete(deal)}
                            sx={{ bgcolor: T.dangerBg, border: `1px solid #FCE4E4`, '&:hover': { bgcolor: '#FDE2E2' } }}
                          >
                            <DeleteOutlineRounded sx={{ fontSize: 17, color: T.danger }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </SectionCard>
                  );
                })}
              </Box>
            </Box>
          )
      )}

      <Dialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: `${T.radius}px`, p: 0.5 } }}
      >
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 1.5, pt: 3 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: T.dangerBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningAmberRounded sx={{ color: T.danger }} />
          </Box>
          <Typography sx={{ fontFamily: T.font, fontWeight: 800, fontSize: 17 }}>Delete this deal?</Typography>
          <Typography variant="body2" sx={{ color: T.textSecondary }}>
            {pendingDelete
              ? `"${pendingDelete.title}" will be removed permanently. This can't be undone.`
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'center', gap: 1.5 }}>
          <Button onClick={() => setPendingDelete(null)} sx={ghostBtnSx}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteDealMutation(pendingDelete._id)}
            disabled={isDeleting}
            sx={{
              textTransform: 'none',
              fontFamily: T.font,
              fontWeight: 700,
              borderRadius: '999px',
              px: 3,
              bgcolor: T.danger,
              color: '#fff',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ----------------------------------------------------------------------- */
/*  Loading skeleton for the whole page                                    */
/* ----------------------------------------------------------------------- */

const PageSkeleton = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: T.bg, fontFamily: T.font }}>
    <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, px: { xs: 2, md: 6 }, py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Skeleton variant="circular" width={72} height={72} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width={200} height={28} />
          <Skeleton width={140} />
        </Box>
      </Box>
    </Box>
    <Box sx={{ px: { xs: 2, md: 6 }, py: 4, display: 'grid', gap: 2, maxWidth: 640, mx: 'auto' }}>
      <Skeleton variant="rounded" height={280} sx={{ borderRadius: `${T.radius}px` }} />
    </Box>
  </Box>
);

/* ----------------------------------------------------------------------- */
/*  Page                                                                    */
/* ----------------------------------------------------------------------- */

const NAV = [
  { label: 'Profile', icon: PersonRounded },
  { label: 'Shops', icon: StorefrontRounded },
  { label: 'Deals', icon: LocalOfferRounded },
];

const DealerProfile = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [toast, setToast] = useState({ open: false, severity: 'success', message: '' });

  const { data: profileResponse, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile();
  const { data: shopsResponse, isLoading: shopsLoading } = useGetMyShops();

  const shops = shopsResponse?.data || [];

  const notify = (severity, message) => setToast({ open: true, severity, message });

  const initials = useMemo(() => {
    const name = profileResponse?.data?.name || '';
    return name ? name.charAt(0).toUpperCase() : '';
  }, [profileResponse]);

  if (profileLoading || shopsLoading) {
    return <PageSkeleton />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: T.bg, fontFamily: T.font }}>
      {/* Header / identity */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <Box sx={{ px: { xs: 2, md: 6 }, pt: { xs: 3, md: 4 }, pb: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 2.5,
              mb: 3,
            }}
          >
            <Avatar
              src={profileResponse?.data?.profilePicture}
              sx={{
                width: 72,
                height: 72,
                fontFamily: T.font,
                fontWeight: 700,
                fontSize: 26,
                bgcolor: T.ink,
                boxShadow: `0 0 0 4px ${T.surfaceMuted}`,
              }}
            >
              {initials || <PersonRounded />}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Typography sx={{ fontWeight: 800, fontFamily: T.font, fontSize: { xs: 22, md: 26 }, color: T.textPrimary, lineHeight: 1.2 }}>
                {profileResponse?.data?.name || 'Your profile'}
              </Typography>
              <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25 }}>
                {profileResponse?.data?.email}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<StorefrontRounded sx={{ fontSize: 16, color: `${T.textSecondary} !important` }} />}
                label={`${shops.length} ${shops.length === 1 ? 'shop' : 'shops'}`}
                sx={{
                  fontFamily: T.font,
                  fontWeight: 600,
                  bgcolor: T.surfaceMuted,
                  border: `1px solid ${T.border}`,
                  color: T.textPrimary,
                }}
              />
            </Box>
          </Box>

          {/* Section nav */}
          <Tabs
            value={tabIndex}
            onChange={(e, v) => setTabIndex(v)}
            variant="scrollable"
            scrollButtons={false}
            TabIndicatorProps={{ style: { display: 'none' } }}
            sx={{
              minHeight: 'auto',
              '& .MuiTabs-flexContainer': { gap: 1 },
            }}
          >
            {NAV.map(({ label, icon: Icon }, i) => (
              <Tab
                key={label}
                disableRipple
                icon={<Icon sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label={label}
                sx={{
                  minHeight: 44,
                  minWidth: 0,
                  fontFamily: T.font,
                  fontWeight: 700,
                  fontSize: 14,
                  textTransform: 'none',
                  color: T.textSecondary,
                  borderRadius: '999px 999px 0 0',
                  px: 2,
                  gap: 0.75,
                  borderBottom: tabIndex === i ? `2px solid ${T.ink}` : '2px solid transparent',
                  '&.Mui-selected': { color: T.ink },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 4 } }}>
        {tabIndex === 0 && <ProfileTab profile={profileResponse} refetch={refetchProfile} onNotify={notify} />}
        {tabIndex === 1 && <ShopsTab shops={shops} onNotify={notify} />}
        {tabIndex === 2 && <DealsTab shops={shops} onNotify={notify} />}
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          sx={{ fontFamily: T.font, fontWeight: 600, borderRadius: `${T.radiusSm}px` }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DealerProfile;