import React, { useState, useRef } from 'react';
import { Box, Typography, Tabs, Tab, TextField, Button, Avatar, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { PhotoCamera, Lock, Edit, Delete } from '@mui/icons-material';
import { useGetProfile } from '../hooks/useGetProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useGetMyShops } from '../hooks/useGetMyShops';
import { useUpdateShop } from '../hooks/useUpdateShop';
import { uploadProfilePictureApi } from '../api/dealerApi';
import { fetchDealsByShop, deleteDeal } from '../api/dealApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const T = {
  primaryMain: '#0F172A',
  secondaryMain: '#F4A261',
  bgDefault: '#ebebeb',
  bgWhite: '#FFFFFF',
  textPrimary: '#192235',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#DC2626',
  font: '"Plus Jakarta Sans", sans-serif',
};

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
      style={{ width: '100%', padding: '24px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProfileTab = ({ profile, refetch }) => {
  const initialName = profile?.data?.name || '';
  const initialPhone = profile?.data?.phone || '';
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const handleSave = () => {
    updateProfile({ name, phone });
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await uploadProfilePictureApi(formData);
      refetch(); // Reload profile to show new picture
    } catch (error) {
      console.error('Failed to upload picture:', error);
      alert('Failed to upload picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 600, mx: 'auto', p: 3, bgcolor: T.bgWhite, borderRadius: 2, border: `1px solid ${T.border}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar 
            src={profile?.data?.profilePicture} 
            sx={{ width: 100, height: 100, border: `2px solid ${T.border}` }} 
          />
          <IconButton 
            sx={{ position: 'absolute', bottom: -5, right: -5, bgcolor: T.primaryMain, color: 'white', '&:hover': { bgcolor: T.secondaryMain } }}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <PhotoCamera fontSize="small" />
          </IconButton>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handlePhotoUpload}
          />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700 }}>Profile Picture</Typography>
          <Typography variant="body2" sx={{ color: T.textSecondary }}>Upload a new avatar (max 5MB).</Typography>
        </Box>
      </Box>

      <TextField 
        label="Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        fullWidth 
        variant="outlined" 
      />

      <TextField 
        label="Email" 
        value={profile?.data?.email || ''} 
        fullWidth 
        variant="outlined"
        disabled
        InputProps={{
          endAdornment: <Lock sx={{ color: T.textSecondary }} />,
        }}
        helperText="Email address cannot be changed."
      />

      <TextField 
        label="Phone Number" 
        value={phone} 
        onChange={(e) => setPhone(e.target.value)} 
        fullWidth 
        variant="outlined" 
      />

      <Button 
        variant="contained" 
        onClick={handleSave} 
        disabled={isPending || (name === initialName && phone === initialPhone)}
        sx={{ mt: 2, bgcolor: T.primaryMain, color: 'white', '&:hover': { bgcolor: '#1E293B' }, py: 1.5, fontWeight: 600 }}
      >
        {isPending ? 'Saving...' : 'Save Profile'}
      </Button>
    </Box>
  );
};

const ShopsTab = ({ shops }) => {
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
    
    // We're not updating location here for simplicity, but we could pass long/lat
    if (editingShop.location?.coordinates) {
       formData.append('longitude', editingShop.location.coordinates[0]);
       formData.append('latitude', editingShop.location.coordinates[1]);
    }

    if (editingShop.newImage) {
      formData.append('shopImage', editingShop.newImage);
    }

    updateShop({ shopId: editingShop._id, formData }, {
      onSuccess: () => {
        handleClose();
      }
    });
  };

  const categories = ["Grocery", "Restaurant", "Pharmacy", "Electronics", "Clothing", "Bakery", "Salon & Spa", "Fitness", "Books & Stationery", "Jewellery", "Hardware", "Other"];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      {shops.map(shop => (
        <Box key={shop._id} sx={{ p: 3, bgcolor: T.bgWhite, borderRadius: 2, border: `1px solid ${T.border}`, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Avatar src={shop.shopImage} sx={{ width: 64, height: 64, borderRadius: 2 }} variant="rounded" />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontFamily: T.font }}>{shop.name}</Typography>
            <Typography variant="body2" sx={{ color: T.textSecondary }}>{shop.category}</Typography>
            <Typography variant="body2" sx={{ color: T.textSecondary }}>{shop.address?.city}</Typography>
          </Box>
          <IconButton onClick={() => handleEditClick(shop)} sx={{ bgcolor: T.bgDefault }}>
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      ))}

      {shops.length === 0 && (
        <Typography sx={{ gridColumn: '1 / -1', textAlign: 'center', p: 4, color: T.textSecondary }}>
          You don't have any shops yet.
        </Typography>
      )}

      {/* Edit Shop Dialog */}
      <Dialog open={!!editingShop} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: T.font, fontWeight: 700 }}>Edit Shop</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
             <Avatar 
                src={editingShop?.newImage ? URL.createObjectURL(editingShop.newImage) : editingShop?.shopImage} 
                sx={{ width: 80, height: 80, borderRadius: 2 }} 
                variant="rounded"
              />
              <Button variant="outlined" onClick={() => fileInputRef.current?.click()} size="small">
                Change Image
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={(e) => setEditingShop({...editingShop, newImage: e.target.files[0]})}
              />
          </Box>
          <TextField label="Shop Name" value={editingShop?.name || ''} onChange={e => setEditingShop({...editingShop, name: e.target.value})} fullWidth />
          
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select value={editingShop?.category || ''} label="Category" onChange={e => setEditingShop({...editingShop, category: e.target.value})}>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField label="Street" value={editingShop?.street || ''} onChange={e => setEditingShop({...editingShop, street: e.target.value})} fullWidth />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="City" value={editingShop?.city || ''} onChange={e => setEditingShop({...editingShop, city: e.target.value})} fullWidth />
            <TextField label="State" value={editingShop?.state || ''} onChange={e => setEditingShop({...editingShop, state: e.target.value})} fullWidth />
          </Box>
          <TextField label="Pincode" value={editingShop?.pincode || ''} onChange={e => setEditingShop({...editingShop, pincode: e.target.value})} fullWidth />
          
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={isPending || JSON.stringify(editingShop) === JSON.stringify(originalShop)} 
            sx={{ bgcolor: T.primaryMain, color: 'white' }}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DealsTab = ({ shops }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch deals for all shops
  const dealsQueries = useQuery({
    queryKey: ['allDeals', shops.map(s => s._id)],
    queryFn: async () => {
      const promises = shops.map(shop => fetchDealsByShop(shop._id).then(res => ({ shop, deals: res.deals })));
      return Promise.all(promises);
    },
    enabled: shops.length > 0,
  });

  const { mutate: deleteDealMutation } = useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDeals'] });
    },
  });

  const handleDelete = (dealId) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      deleteDealMutation(dealId);
    }
  };

  if (dealsQueries.isLoading) return <Typography>Loading deals...</Typography>;
  const data = dealsQueries.data || [];

  let totalDeals = 0;
  data.forEach(item => { totalDeals += item.deals.length; });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {totalDeals === 0 && (
        <Typography sx={{ textAlign: 'center', p: 4, color: T.textSecondary }}>
          No deals found across your shops.
        </Typography>
      )}

      {data.map((item) => item.deals.length > 0 && (
        <Box key={item.shop._id}>
          <Typography variant="h6" sx={{ fontFamily: T.font, fontWeight: 700, mb: 2 }}>
            {item.shop.name}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {item.deals.map(deal => (
              <Box key={deal._id} sx={{ p: 2, bgcolor: T.bgWhite, borderRadius: 2, border: `1px solid ${T.border}`, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar 
                  src={deal.images?.length > 0 ? deal.images.find(img => img.isCover)?.url || deal.images[0].url : ''} 
                  sx={{ width: 60, height: 60, borderRadius: 1 }} 
                  variant="rounded" 
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                   <Typography sx={{ fontWeight: 600, fontFamily: T.font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                     {deal.title}
                   </Typography>
                   <Typography variant="body2" sx={{ color: T.textSecondary, textTransform: 'capitalize' }}>
                     {deal.dealType} Offer
                   </Typography>
                   <Typography variant="body2" sx={{ fontWeight: 700, color: T.primaryMain }}>
                     {deal.dealPrice ? `₹${deal.dealPrice}` : (deal.price ? `₹${deal.price}` : 'Free')}
                   </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small" onClick={() => navigate(`/shop/${item.shop._id}/deals`)}>
                    Manage
                  </Button>
                  <IconButton size="small" color="error" onClick={() => handleDelete(deal._id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};


const DealerProfile = () => {
  const [tabIndex, setTabIndex] = useState(0);
  
  const { data: profileResponse, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile();
  const { data: shopsResponse, isLoading: shopsLoading } = useGetMyShops();

  if (profileLoading || shopsLoading) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography>Loading...</Typography></Box>;
  }

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: T.bgDefault, fontFamily: T.font }}>
      <Box sx={{ bgcolor: T.bgWhite, borderBottom: `1px solid ${T.border}`, px: { xs: 2, md: 6 }, py: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: T.font, color: T.primaryMain }}>
          Manage Profile
        </Typography>
        <Typography variant="body1" sx={{ color: T.textSecondary, mt: 1 }}>
          Update your personal information, shops, and deals.
        </Typography>

        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          sx={{ mt: 3, '& .MuiTab-root': { fontFamily: T.font, fontWeight: 600, textTransform: 'none', fontSize: '15px' }, '& .Mui-selected': { color: `${T.primaryMain} !important` }, '& .MuiTabs-indicator': { bgcolor: T.primaryMain } }}
        >
          <Tab label="My Profile" />
          <Tab label="My Shops" />
          <Tab label="My Deals" />
        </Tabs>
      </Box>

      <Box sx={{ px: { xs: 2, md: 6 } }}>
        <TabPanel value={tabIndex} index={0}>
          <ProfileTab profile={profileResponse} refetch={refetchProfile} />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <ShopsTab shops={shopsResponse?.data || []} />
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <DealsTab shops={shopsResponse?.data || []} />
        </TabPanel>
      </Box>
    </Box>
  );
};

export default DealerProfile;
