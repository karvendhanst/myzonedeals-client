import React, { useMemo, useRef, useState, useEffect } from 'react';
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
  CircularProgress,
  Switch,
  LinearProgress,
  Stack,
} from '@mui/material';
import {
  PhotoCamera,
  EditRounded,
  DeleteOutlineRounded,
  StorefrontRounded,
  LocalOfferRounded,
  PersonRounded,
  PlaceRounded,
  ArrowForwardRounded,
  WarningAmberRounded,
  PersonOutlined,
  EmailOutlined,
  PhoneOutlined,
  ShieldOutlined,
  CalendarMonthOutlined,
  LightbulbOutlined,
  CheckCircleRounded,
  LockOutlined,
  EditOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
  NotificationsOutlined,
  SearchRounded,
  TrendingUpRounded,
  DesktopWindowsOutlined,
  SmartphoneOutlined,
  DescriptionOutlined,
  BadgeOutlined,
  MapOutlined,
} from '@mui/icons-material';
import { useGetProfile } from '../hooks/useGetProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useGetMyShops } from '../hooks/useGetMyShops';
import { useUpdateShop } from '../hooks/useUpdateShop';
import { uploadProfilePictureApi, removeProfilePictureApi } from '../api/dealerApi';
import { fetchDealsByShop, deleteDeal } from '../api/dealApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ImageCropModal from '../components/ImageCropModal';
import ProfileViewModal from '../components/ProfileViewModal';
import VerifiedIcon from '@mui/icons-material/Verified';
import { State, City } from 'country-state-city';

/* ----------------------------------------------------------------------- */
/*  Design tokens                                                          */
/* ----------------------------------------------------------------------- */

const T = {
  ink: '#0F172A',
  ink2: '#1E293B',
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueBg: '#EFF6FF',
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
  warning: '#B45309',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEF2F2',
  radius: 6,
  radiusSm: 6,
  shadow: '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.10)',
  shadowLg: '0 4px 8px rgba(15,23,42,0.04), 0 24px 48px -20px rgba(15,23,42,0.18)',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: `${T.radiusSm}px`,
    
    bgcolor: T.surfaceMuted,
    '& fieldset': { borderColor: T.border },
    '&:hover fieldset': { borderColor: T.borderStrong },
    '&.Mui-focused fieldset': { borderColor: T.ink, borderWidth: '1.5px' },
  }
};

const primaryBtnSx = {
  bgcolor: T.blue,
  color: '#fff',
  textTransform: 'none',
  
  fontWeight: 700,
  borderRadius: '6px',
  px: 3,
  py: 1.1,
  boxShadow: 'none',
  whiteSpace: 'nowrap',
  '&:hover': { bgcolor: T.blueDark, boxShadow: 'none' },
  '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
};

const ghostBtnSx = {
  textTransform: 'none',
  
  fontWeight: 600,
  borderRadius: '6px',
  color: T.textSecondary,
  px: 2.5,
  '&:hover': { bgcolor: T.surfaceMuted },
};

const styledFieldSx = (disabled) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    
    fontSize: 14,
    bgcolor: disabled ? '#F8FAFC' : '#FFFFFF',
    '& fieldset': { borderColor: '#E2E8F0' },
    '&:hover fieldset': { borderColor: disabled ? '#E2E8F0' : '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: T.blue, borderWidth: '1.5px' },
    '& input.Mui-disabled, & textarea.Mui-disabled': {
      WebkitTextFillColor: '#475569',
      fontWeight: 500,
    },
  },
});

const FieldLabel = ({ children, sx = {} }) => (
  <Typography
    sx={{
      
      fontWeight: 600,
      fontSize: 13,
      color: T.textSecondary,
      mb: 0.75,
      ...sx,
    }}
  >
    {children}
  </Typography>
);

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
      p: { xs: 4, sm: 5, md: 8 },
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
    <Typography sx={{  fontWeight: 700, color: T.textPrimary }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" sx={{ color: T.textSecondary, maxWidth: 360 }}>
        {subtitle}
      </Typography>
    )}
    {action}
  </Box>
);


/* ----------------------------------------------------------------------- */
/*  Profile tab                                                             */
/* ----------------------------------------------------------------------- */

const ProfileTab = ({ profile, shopsCount, dealsCount, refetch, onNotify }) => {
  const initialName = profile?.data?.name || '';
  const initialPhone = profile?.data?.phone || '';
  const initialBio = profile?.data?.bio || '';
  const initialAddress = profile?.data?.businessAddress || {};
  const email = profile?.data?.email || '';
  const isVerified = profile?.data?.isVerified !== false;
  const createdAt = profile?.data?.createdAt;

  const formattedDate = useMemo(() => {
    if (!createdAt) return 'Jan 2024';
    try {
      return new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return 'Jan 2024';
    }
  }, [createdAt]);

  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [bio, setBio] = useState(initialBio);
  const [addrLine, setAddrLine] = useState(initialAddress.line || '');
  const [addrCity, setAddrCity] = useState(initialAddress.city || '');
  const [addrState, setAddrState] = useState(initialAddress.state || '');
  const [addrPincode, setAddrPincode] = useState(initialAddress.pincode || '');

  // country-state-city dropdown data
  const allStates = useState(() => State.getStatesOfCountry('IN'))[0];
  const [addrStateCode, setAddrStateCode] = useState(() => {
    // pre-select stateCode from saved state name
    if (!initialAddress.state) return '';
    const match = State.getStatesOfCountry('IN').find(
      (s) => s.name === initialAddress.state
    );
    return match ? match.isoCode : '';
  });
  const [addrCities, setAddrCities] = useState(() => {
    const match = State.getStatesOfCountry('IN').find(
      (s) => s.name === initialAddress.state
    );
    return match ? City.getCitiesOfState('IN', match.isoCode) : [];
  });
  const [activeSubTab, setActiveSubTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Password fields for settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Notification preferences (local UI state — wire up to backend when available)
  const [notifPrefs, setNotifPrefs] = useState({
    dealAlerts: true,
  });
  const toggleNotif = (key) => setNotifPrefs((p) => ({ ...p, [key]: !p[key] }));

  const { mutate: updateProfile, isPending } = useUpdateProfile();

  // Derive cities whenever stateCode changes
  useEffect(() => {
    if (addrStateCode) {
      setAddrCities(City.getCitiesOfState('IN', addrStateCode));
    } else {
      setAddrCities([]);
    }
  }, [addrStateCode]);

  const isDirty =
    name !== initialName ||
    phone !== initialPhone ||
    bio !== initialBio ||
    addrLine !== (initialAddress.line || '') ||
    addrCity !== (initialAddress.city || '') ||
    addrState !== (initialAddress.state || '') ||
    addrPincode !== (initialAddress.pincode || '');

  // Profile completeness — used for the progress meter in the sidebar
  const completeness = useMemo(() => {
    const checks = [
      !!name,
      !!phone,
      !!bio,
      !!addrCity,
      !!profile?.data?.profilePicture,
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [name, phone, bio, addrCity, profile]);

  const handleSave = () => {
    updateProfile(
      {
        name,
        phone,
        bio,
        businessAddress: { line: addrLine, city: addrCity, state: addrState, pincode: addrPincode },
      },
      {
        onSuccess: () => {
          onNotify('success', 'Profile updated successfully.');
          setIsEditing(false);
        },
        onError: () => onNotify('error', "Couldn't save your changes. Try again."),
      }
    );
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword) {
      onNotify('error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      onNotify('error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      onNotify('error', 'Passwords do not match.');
      return;
    }
    onNotify('success', 'Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onNotify('error', 'That image is over 5MB. Choose a smaller file.');
      event.target.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSelectedImageSrc(objectUrl);
    setCropModalOpen(true);
    event.target.value = '';
  };

  const handleCropComplete = async (croppedFile) => {
    const previewObjectUrl = URL.createObjectURL(croppedFile);
    setPreviewUrl(previewObjectUrl);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('profilePicture', croppedFile);

    try {
      await uploadProfilePictureApi(formData);
      await refetch();
      onNotify('success', 'Profile photo updated.');
      setCropModalOpen(false);
      if (selectedImageSrc) URL.revokeObjectURL(selectedImageSrc);
      setSelectedImageSrc(null);
    } catch (error) {
      onNotify('error', "Couldn't upload that photo. Try again.");
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(previewObjectUrl);
      setPreviewUrl(null);
    }
  };

  const handleCloseCropModal = () => {
    if (isUploading) return;
    setCropModalOpen(false);
    if (selectedImageSrc) URL.revokeObjectURL(selectedImageSrc);
    setSelectedImageSrc(null);
  };

  const handleRemovePhoto = async () => {
    try {
      setIsUploading(true);
      await removeProfilePictureApi();
      await refetch();
      onNotify('success', 'Profile picture removed.');
    } catch (error) {
      onNotify('error', "Couldn't remove profile photo. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const subNavItems = [
    { key: 'personal', label: 'Personal Information', icon: PersonOutlined },
    { key: 'settings', label: 'Account Settings', icon: ShieldOutlined },
    { key: 'security', label: 'Privacy & Security', icon: LockOutlined },
    { key: 'notifications', label: 'Notifications', icon: NotificationsOutlined },
  ];

  return (
    <Box sx={{ maxWidth: 1120, mx: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
          gap: { xs: 2.5, md: 3.5 },
          alignItems: 'start',
        }}
      >
        {/* Left Column: Summary Card & Navigation */}
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
          {/* Header Gradient */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              pt: 4,
              pb: 3,
              px: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            {/* Avatar Container */}
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Tooltip title="Click to view full photo">
                <Avatar
                  src={previewUrl || profile?.data?.profilePicture}
                  onClick={() => !isUploading && setViewModalOpen(true)}
                  sx={{
                    width: 104,
                    height: 104,
                    border: '4px solid #FFFFFF',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.15)',
                    
                    fontWeight: 800,
                    fontSize: 36,
                    bgcolor: T.blue,
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.03)',
                      boxShadow: '0 10px 28px rgba(37,99,235,0.25)',
                    },
                  }}
                >
                  {initialName ? initialName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </Tooltip>

              {/* Upload Loader Overlay */}
              {isUploading && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    bgcolor: 'rgba(15, 23, 42, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(2px)',
                    zIndex: 2,
                  }}
                >
                  <CircularProgress size={32} sx={{ color: '#FFFFFF' }} />
                </Box>
              )}

              {/* Camera Icon Button */}
              <Tooltip title={isUploading ? 'Uploading...' : 'Change & crop photo'}>
                <span>
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: T.ink,
                      color: 'white',
                      width: 34,
                      height: 34,
                      border: '2.5px solid #FFFFFF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                      zIndex: 3,
                      '&:hover': { bgcolor: T.ink2 },
                      '&.Mui-disabled': { bgcolor: T.border },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <CircularProgress size={14} sx={{ color: 'white' }} />
                    ) : (
                      <PhotoCamera sx={{ fontSize: 17 }} />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Box>

            {/* Name & Joined Date */}
            <Typography sx={{  fontWeight: 800, fontSize: 19, color: T.ink, mt: 2 }}>
              {initialName || 'Dealer Account'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: T.textSecondary, mt: 0.5 }}>
              <CalendarMonthOutlined sx={{ fontSize: 15, color: T.textFaint }} />
              <Typography variant="body2" sx={{  fontSize: 13, fontWeight: 500, color: T.textSecondary }}>
                Member since {formattedDate}
              </Typography>
            </Box>

            {/* Profile completeness */}
            <Box sx={{ width: '100%', mt: 2.25 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{  fontSize: 12, fontWeight: 700, color: T.ink }}>
                  Profile strength
                </Typography>
                <Typography sx={{  fontSize: 12, fontWeight: 700, color: T.blue }}>
                  {completeness}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completeness}
                sx={{
                  height: 6,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.6)',
                  '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: T.blue },
                }}
              />
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          {/* Sub-Navigation Menu List — vertical list on desktop, scrollable chips on mobile */}
          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              gap: 0.75,
              overflowX: { xs: 'auto', md: 'visible' },
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {subNavItems.map(({ key, label, icon: Icon }) => {
              const isActive = activeSubTab === key;
              return (
                <Button
                  key={key}
                  onClick={() => setActiveSubTab(key)}
                  startIcon={
                    <Icon
                      sx={{
                        fontSize: 19,
                        color: isActive ? T.blue : T.textSecondary,
                        transition: 'color 0.15s ease',
                      }}
                    />
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    
                    fontWeight: isActive ? 700 : 600,
                    fontSize: 14,
                    textTransform: 'none',
                    py: 1.25,
                    px: 2,
                    borderRadius: '6px',
                    color: isActive ? T.blue : '#475569',
                    bgcolor: isActive ? T.blueBg : 'transparent',
                    boxShadow: 'none',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isActive ? T.blueBg : T.surfaceMuted,
                      color: isActive ? T.blue : T.ink,
                    },
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </Box>

          {/* Bottom Info Banner */}
          <Box sx={{ p: 2, pt: 1, display: { xs: 'none', md: 'block' } }}>
            <Box
              sx={{
                bgcolor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: '6px',
                p: 2,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#E0F2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: 0.25,
                }}
              >
                <LightbulbOutlined sx={{ fontSize: 18, color: '#0284C7' }} />
              </Box>
              <Typography variant="caption" sx={{  color: '#0369A1', lineHeight: 1.5, fontWeight: 500 }}>
                Keep your information up to date so customers can find and connect with you easily.
              </Typography>
            </Box>
          </Box>
        </SectionCard>

        {/* Right Column: Active Content Panel */}
        <SectionCard sx={{ p: { xs: 2.5, sm: 3, md: 4 }, minWidth: 0 }}>
          {activeSubTab === 'personal' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Header with Title & Edit Action */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      borderRadius: '6px',
                      bgcolor: T.blueBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: T.blue,
                    }}
                  >
                    <PersonOutlined sx={{ fontSize: 24 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{  fontWeight: 600, fontSize: { xs: 18, sm: 20 }, color: T.ink, lineHeight: 1.2 }}>
                      Personal Information
                    </Typography>
                    <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25 }}>
                      This is how you appear to customers on your shop pages.
                    </Typography>
                  </Box>
                </Box>

                {!isEditing ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlined sx={{ fontSize: 17 }} />}
                    onClick={() => setIsEditing(true)}
                    sx={{
                      borderRadius: '6px',
                      textTransform: 'none',
                      
                      fontWeight: 700,
                      fontSize: 13,
                      px: 2.5,
                      py: 0.75,
                      borderColor: T.borderStrong,
                      color: T.blue,
                      bgcolor: T.surface,
                      '&:hover': {
                        borderColor: T.blue,
                        bgcolor: T.blueBg,
                      },
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      onClick={() => {
                        setName(initialName);
                        setPhone(initialPhone);
                        setBio(initialBio);
                        setAddrLine(initialAddress.line || '');
                        setAddrCity(initialAddress.city || '');
                        setAddrState(initialAddress.state || '');
                        setAddrPincode(initialAddress.pincode || '');
                        setIsEditing(false);
                      }}
                      sx={ghostBtnSx}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isPending || !isDirty} sx={primaryBtnSx}>
                      {isPending ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              {/* Form Fields */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
                  {/* Full name */}
                  <Box>
                    <FieldLabel>Full name</FieldLabel>
                    <TextField
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlined sx={{ fontSize: 19, color: T.textFaint }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={styledFieldSx(!isEditing)}
                    />
                  </Box>

                  {/* Phone number */}
                  <Box>
                    <FieldLabel>Phone number</FieldLabel>
                    <TextField
                      placeholder="Enter phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      size="medium"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneOutlined sx={{ fontSize: 19, color: T.textFaint }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={styledFieldSx(!isEditing)}
                    />
                  </Box>
                </Box>

                {/* Email */}
                <Box>
                  <FieldLabel>Email</FieldLabel>
                  <TextField
                    value={email}
                    fullWidth
                    disabled
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlined sx={{ fontSize: 19, color: T.textFaint }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={styledFieldSx(true)}
                  />
                  <Typography variant="caption" sx={{ color: T.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                    ⓘ Your email is fixed and can't be changed.
                  </Typography>
                </Box>

                {/* Bio */}
                <Box>
                  <FieldLabel>About your business</FieldLabel>
                  <TextField
                    placeholder="Tell customers a little about what you sell and what makes your shop worth visiting."
                    value={bio}
                    onChange={(e) => setBio(e.target.value.slice(0, 280))}
                    disabled={!isEditing}
                    fullWidth
                    multiline
                    minRows={3}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.25 }}>
                          <DescriptionOutlined sx={{ fontSize: 19, color: T.textFaint }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={styledFieldSx(!isEditing)}
                  />
                  <Typography variant="caption" sx={{ color: T.textFaint, display: 'block', textAlign: 'right', mt: 0.5 }}>
                    {bio.length}/280
                  </Typography>
                </Box>

                {/* Business address */}
                <Box>
                  <FieldLabel>Business address</FieldLabel>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      placeholder="Street / area"
                      value={addrLine}
                      onChange={(e) => setAddrLine(e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MapOutlined sx={{ fontSize: 19, color: T.textFaint }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={styledFieldSx(!isEditing)}
                    />
                    {/* State dropdown */}
                    <FormControl fullWidth sx={styledFieldSx(!isEditing)} disabled={!isEditing}>
                      <Select
                        displayEmpty
                        value={addrStateCode}
                        onChange={(e) => {
                          const code = e.target.value;
                          const found = allStates.find((s) => s.isoCode === code);
                          setAddrStateCode(code);
                          setAddrState(found ? found.name : '');
                          setAddrCity('');
                        }}
                        renderValue={(val) =>
                          val
                            ? allStates.find((s) => s.isoCode === val)?.name
                            : <span style={{ color: T.textFaint }}>Select State</span>
                        }
                        sx={{ fontSize: 14 }}
                      >
                        <MenuItem value=""><em>Select State</em></MenuItem>
                        {allStates.map((s) => (
                          <MenuItem key={s.isoCode} value={s.isoCode}>{s.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {/* City dropdown */}
                    <FormControl fullWidth sx={styledFieldSx(!isEditing)} disabled={!isEditing || !addrStateCode}>
                      <Select
                        displayEmpty
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        renderValue={(val) =>
                          val ? val : <span style={{ color: T.textFaint }}>{addrStateCode ? 'Select City' : 'Select State first'}</span>
                        }
                        sx={{ fontSize: 14 }}
                      >
                        <MenuItem value=""><em>Select City</em></MenuItem>
                        {addrCities.map((c) => (
                          <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      placeholder="Pincode"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value)}
                      disabled={!isEditing}
                      fullWidth
                      sx={styledFieldSx(!isEditing)}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9', my: 1 }} />

              {/* Account Verification Card */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                  p: 2.5,
                  borderRadius: '6px',
                  bgcolor: T.surfaceMuted,
                  border: `1px solid ${T.border}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      borderRadius: '50%',
                      bgcolor: T.blueBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: T.blue,
                    }}
                  >
                    <BadgeOutlined sx={{ fontSize: 22 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{  fontWeight: 700, fontSize: 15, color: T.ink }}>
                      Account Verification
                    </Typography>
                    <Typography variant="body2" sx={{ color: isVerified ? T.success : T.warning, fontWeight: 600 }}>
                      {isVerified ? 'Your account is verified' : 'Verification pending'}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  icon={isVerified ? <CheckCircleRounded sx={{ fontSize: '15px !important', color: '#15803D !important' }} /> : undefined}
                  label={isVerified ? 'Verified' : 'Unverified'}
                  sx={{
                    
                    fontWeight: 700,
                    fontSize: 12,
                    bgcolor: isVerified ? T.successBg : T.warningBg,
                    color: isVerified ? '#15803D' : T.warning,
                    px: 1,
                    py: 0.5,
                    height: 28,
                    borderRadius: '999px',
                  }}
                />
              </Box>
            </Box>
          )}

          {activeSubTab === 'settings' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '6px',
                    bgcolor: T.blueBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: T.blue,
                  }}
                >
                  <ShieldOutlined sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{  fontWeight: 800, fontSize: { xs: 18, sm: 20 }, color: T.ink }}>
                    Account Settings
                  </Typography>
                  <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25 }}>
                    Manage your login password and security settings.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 480 }}>
                <Box>
                  <FieldLabel>Current Password</FieldLabel>
                  <TextField
                    type={showCurrentPass ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ fontSize: 19, color: T.textFaint }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowCurrentPass((v) => !v)} size="small">
                            {showCurrentPass ? <VisibilityOffOutlined sx={{ fontSize: 18 }} /> : <VisibilityOutlined sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={styledFieldSx(false)}
                  />
                </Box>

                <Box>
                  <FieldLabel>New Password</FieldLabel>
                  <TextField
                    type={showNewPass ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ fontSize: 19, color: T.textFaint }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPass((v) => !v)} size="small">
                            {showNewPass ? <VisibilityOffOutlined sx={{ fontSize: 18 }} /> : <VisibilityOutlined sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={styledFieldSx(false)}
                  />
                </Box>

                <Box>
                  <FieldLabel>Confirm New Password</FieldLabel>
                  <TextField
                    type={showConfirmPass ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined sx={{ fontSize: 19, color: T.textFaint }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmPass((v) => !v)} size="small">
                            {showConfirmPass ? <VisibilityOffOutlined sx={{ fontSize: 18 }} /> : <VisibilityOutlined sx={{ fontSize: 18 }} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={styledFieldSx(false)}
                  />
                </Box>

                <Button
                  onClick={handlePasswordUpdate}
                  sx={{ ...primaryBtnSx, alignSelf: { xs: 'stretch', sm: 'flex-start' }, px: 3.5, py: 1.25 }}
                >
                  Update Password
                </Button>
              </Box>
            </Box>
          )}

          {activeSubTab === 'security' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '6px',
                    bgcolor: T.blueBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: T.blue,
                  }}
                >
                  <LockOutlined sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{  fontWeight: 800, fontSize: { xs: 18, sm: 20 }, color: T.ink }}>
                    Privacy & Security
                  </Typography>
                  <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25 }}>
                    Review active sessions and security configuration.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: '6px',
                    bgcolor: T.surfaceMuted,
                    border: `1px solid ${T.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography sx={{  fontWeight: 700, fontSize: 15, color: T.ink }}>
                      Two-Factor Authentication (2FA)
                    </Typography>
                    <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25 }}>
                      Adds an extra layer of security to your account.
                    </Typography>
                  </Box>
                  <Chip label="Enabled" size="small" sx={{ bgcolor: T.successBg, color: '#15803D', fontWeight: 700 }} />
                </Box>

                {/* Active sessions list — more detail than a single row */}
                <Box
                  sx={{
                    borderRadius: '6px',
                    bgcolor: T.surfaceMuted,
                    border: `1px solid ${T.border}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ p: 2.5, pb: 1.5 }}>
                    <Typography sx={{  fontWeight: 700, fontSize: 15, color: T.ink }}>
                      Active Sessions
                    </Typography>
                    <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25 }}>
                      Devices currently signed in to your dealer account.
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: T.border }} />
                  {[
                    { device: 'Chrome on Windows', location: 'Karur, Tamil Nadu', time: 'Active now', current: true, icon: DesktopWindowsOutlined },
                    { device: 'Safari on iPhone', location: 'Karur, Tamil Nadu', time: '2 days ago', current: false, icon: SmartphoneOutlined },
                  ].map((session, idx, arr) => (
                    <React.Fragment key={session.device}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2.5, py: 1.75 }}>
                        <session.icon sx={{ fontSize: 22, color: T.textFaint, flexShrink: 0 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{  fontWeight: 600, fontSize: 14, color: T.ink }} noWrap>
                            {session.device}
                          </Typography>
                          <Typography variant="body2" sx={{ color: T.textSecondary, fontSize: 12.5 }} noWrap>
                            {session.location} · {session.time}
                          </Typography>
                        </Box>
                        {session.current ? (
                          <Chip label="This device" size="small" sx={{ bgcolor: T.blueBg, color: T.blue, fontWeight: 700, fontSize: 11 }} />
                        ) : (
                          <Button size="small" sx={{ ...ghostBtnSx, color: T.danger, px: 1.25 }}>
                            Sign out
                          </Button>
                        )}
                      </Box>
                      {idx < arr.length - 1 && <Divider sx={{ borderColor: T.border }} />}
                    </React.Fragment>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {activeSubTab === 'notifications' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '6px',
                    bgcolor: T.blueBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: T.blue,
                  }}
                >
                  <NotificationsOutlined sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography sx={{  fontWeight: 800, fontSize: { xs: 18, sm: 20 }, color: T.ink }}>
                    Notification Preferences
                  </Typography>
                  <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25 }}>
                    Choose what you hear from us and how.
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { key: 'dealAlerts', title: 'Deal performance alerts', desc: 'Get notified when a deal is expiring or performing well.' },
                ].map((item) => (
                  <Box
                    key={item.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                      p: 2,
                      borderRadius: '6px',
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{  fontWeight: 700, fontSize: 14, color: T.ink }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: T.textSecondary, fontSize: 12.5, mt: 0.25 }}>
                        {item.desc}
                      </Typography>
                    </Box>
                    <Switch
                      checked={notifPrefs[item.key]}
                      onChange={() => toggleNotif(item.key)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: T.blue },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: T.blue },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </SectionCard>
      </Box>

      {/* Profile View Modal */}
      <ProfileViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        src={profile?.data?.profilePicture}
        name={name}
        onChangePhoto={() => fileInputRef.current?.click()}
        onRemovePhoto={handleRemovePhoto}
      />

      {/* Image Crop & Rotate Modal */}
      <ImageCropModal
        open={cropModalOpen}
        imageSrc={selectedImageSrc}
        onClose={handleCloseCropModal}
        onCropComplete={handleCropComplete}
        isUploading={isUploading}
      />
    </Box>
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
  const [isLocating, setIsLocating] = useState(false);
  const { mutate: updateShop, isPending } = useUpdateShop();
  const fileInputRef = useRef(null);

  // country-state-city data for the edit dialog
  const shopAllStates = useState(() => State.getStatesOfCountry('IN'))[0];
  const [shopCities, setShopCities] = useState([]);

  useEffect(() => {
    if (editingShop?.stateCode) {
      setShopCities(City.getCitiesOfState('IN', editingShop.stateCode));
    } else {
      setShopCities([]);
    }
  }, [editingShop?.stateCode]);

  const filteredShops = useMemo(() => {
    return shops.filter(
      (s) => s.name?.toLowerCase() || s.category?.toLowerCase().includes(q) || s.address?.city?.toLowerCase().includes(q)
    );
  }, [shops]);

  const handleEditClick = (shop) => {
    const savedState = shop.address?.state || '';
    const matchedState = State.getStatesOfCountry('IN').find((s) => s.name === savedState);
    // Extract flat lat/lng from the GeoJSON location field
    const coords = shop.location?.coordinates;
    const editForm = {
      ...shop,
      street: shop.address?.street || '',
      city: shop.address?.city || '',
      state: savedState,
      stateCode: matchedState ? matchedState.isoCode : '',
      pincode: shop.address?.pincode || '',
      country: shop.address?.country || 'India',
      latitude: coords ? String(coords[1]) : '',
      longitude: coords ? String(coords[0]) : '',
      newImage: null,
    };
    setEditingShop(editForm);
    setOriginalShop(editForm);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setEditingShop((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setIsLocating(false);
      },
      () => setIsLocating(false)
    );
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

    if (editingShop.latitude) formData.append('latitude', editingShop.latitude);
    if (editingShop.longitude) formData.append('longitude', editingShop.longitude);

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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Typography sx={{  fontWeight: 800, fontSize: { xs: 17, sm: 18 }, color: T.ink }}>
          Your shops ({filteredShops.length})
        </Typography>
      </Box>

      {filteredShops.length === 0 ? (
        <SectionCard>
          <EmptyState icon={<SearchRounded />} title="No matching shops" subtitle="Try a different search term." />
        </SectionCard>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2.5 }}>
          {filteredShops.map((shop) => (
            <SectionCard
              key={shop._id}
              sx={{
                p: 2.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                transition: 'border-color 120ms ease, box-shadow 120ms ease',
                '&:hover': { borderColor: T.borderStrong, boxShadow: T.shadowLg },
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar
                  src={shop.shopImage}
                  variant="rounded"
                  sx={{ width: 60, height: 60, borderRadius: '6px', bgcolor: T.surfaceMuted, color: T.textFaint, flexShrink: 0 }}
                >
                  <StorefrontRounded />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700,  color: T.textPrimary }} noWrap>
                    {shop.name}
                  </Typography>
                  <Chip
                    label={shop.category}
                    size="small"
                    sx={{
                      mt: 0.5,
                      height: 22,
                      fontSize: 12,
                      fontWeight: 600,
                      
                      bgcolor: T.surfaceMuted,
                      color: T.textSecondary,
                      border: `1px solid ${T.border}`,
                    }}
                  />
                </Box>
                <Tooltip title="Edit shop">
                  <IconButton
                    onClick={() => handleEditClick(shop)}
                    sx={{ bgcolor: T.surfaceMuted, border: `1px solid ${T.border}`, '&:hover': { bgcolor: T.bg }, flexShrink: 0 }}
                  >
                    <EditRounded fontSize="small" sx={{ color: T.textPrimary }} />
                  </IconButton>
                </Tooltip>
              </Box>

              <Divider sx={{ borderColor: '#F1F5F9' }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                {shop.address?.city ? (
                  <Typography
                    variant="body2"
                    sx={{ color: T.textSecondary, display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}
                    noWrap
                  >
                    <PlaceRounded sx={{ fontSize: 15, flexShrink: 0 }} /> {shop.address.city}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: T.textFaint }}>
                    Location not set
                  </Typography>
                )}
                <Chip
                  label={shop.isActive === false ? 'Inactive' : 'Live'}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: 11,
                    height: 22,
                    bgcolor: shop.isActive === false ? T.dangerBg : T.successBg,
                    color: shop.isActive === false ? T.danger : '#15803D',
                  }}
                />
              </Box>
            </SectionCard>
          ))}
        </Box>
      )}

      <Dialog
        open={!!editingShop}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: `${T.radius}px` } }}
      >
        <DialogTitle sx={{  fontWeight: 800, pb: 1 }}>Edit shop</DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, p: 3, borderColor: T.border }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 0.5, flexWrap: 'wrap' }}>
            <Avatar
              src={editingShop?.newImage ? URL.createObjectURL(editingShop.newImage) : editingShop?.shopImage}
              sx={{ width: 72, height: 72, borderRadius: '6px', bgcolor: T.surfaceMuted, color: T.textFaint }}
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

          <Box>
            <FieldLabel>Shop name</FieldLabel>
            <TextField
              placeholder="Enter shop name"
              value={editingShop?.name || ''}
              onChange={(e) => setEditingShop({ ...editingShop, name: e.target.value })}
              fullWidth
              sx={fieldSx}
            />
          </Box>

          <Box>
            <FieldLabel>Category</FieldLabel>
            <FormControl fullWidth sx={fieldSx}>
              <Select
                value={editingShop?.category || ''}
                displayEmpty
                onChange={(e) => setEditingShop({ ...editingShop, category: e.target.value })}
                renderValue={(selected) =>
                  selected ? selected : <span style={{ color: T.textFaint }}>Select a category</span>
                }
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <FieldLabel>Street</FieldLabel>
              <TextField
                placeholder="Enter street address"
                value={editingShop?.street || ''}
                onChange={(e) => setEditingShop({ ...editingShop, street: e.target.value })}
                fullWidth
                sx={fieldSx}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <FieldLabel>State</FieldLabel>
              <FormControl fullWidth sx={fieldSx}>
                <Select
                  displayEmpty
                  value={editingShop?.stateCode || ''}
                  onChange={(e) => {
                    const code = e.target.value;
                    const found = shopAllStates.find((s) => s.isoCode === code);
                    setEditingShop({
                      ...editingShop,
                      stateCode: code,
                      state: found ? found.name : '',
                      city: '',
                    });
                  }}
                  renderValue={(val) =>
                    val
                      ? shopAllStates.find((s) => s.isoCode === val)?.name
                      : <span style={{ color: T.textFaint }}>Select State</span>
                  }
                  sx={{ fontSize: 14 }}
                >
                  <MenuItem value=""><em>Select State</em></MenuItem>
                  {shopAllStates.map((s) => (
                    <MenuItem key={s.isoCode} value={s.isoCode}>{s.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <FieldLabel>City</FieldLabel>
              <FormControl fullWidth sx={fieldSx} disabled={!editingShop?.stateCode}>
                <Select
                  displayEmpty
                  value={editingShop?.city || ''}
                  onChange={(e) => setEditingShop({ ...editingShop, city: e.target.value })}
                  renderValue={(val) =>
                    val
                      ? val
                      : <span style={{ color: T.textFaint }}>{editingShop?.stateCode ? 'Select City' : 'Select State first'}</span>
                  }
                  sx={{ fontSize: 14 }}
                >
                  <MenuItem value=""><em>Select City</em></MenuItem>
                  {shopCities.map((c) => (
                    <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ flex: 1, minWidth: 180 }}>
              <FieldLabel>Pincode</FieldLabel>
              <TextField
                placeholder="Enter pincode"
                value={editingShop?.pincode || ''}
                onChange={(e) => setEditingShop({ ...editingShop, pincode: e.target.value })}
                fullWidth
                sx={fieldSx}
              />
            </Box>
          </Box>

          {/* GPS Coordinates */}
          <Box>
            <FieldLabel>GPS Coordinates</FieldLabel>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <TextField
                placeholder="Latitude (e.g. 10.9517)"
                value={editingShop?.latitude || ''}
                onChange={(e) => setEditingShop({ ...editingShop, latitude: e.target.value })}
                sx={{ flex: 1, minWidth: 140, ...fieldSx }}
                inputProps={{ inputMode: 'decimal' }}
              />
              <TextField
                placeholder="Longitude (e.g. 78.0820)"
                value={editingShop?.longitude || ''}
                onChange={(e) => setEditingShop({ ...editingShop, longitude: e.target.value })}
                sx={{ flex: 1, minWidth: 140, ...fieldSx }}
                inputProps={{ inputMode: 'decimal' }}
              />
              <Tooltip title={isLocating ? 'Detecting…' : 'Use my current location'}>
                <span>
                  <Button
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    variant="outlined"
                    size="medium"
                    startIcon={
                      isLocating
                        ? <CircularProgress size={14} />
                        : <PlaceRounded sx={{ fontSize: 18 }} />
                    }
                    sx={{
                      textTransform: 'none',
                      
                      fontWeight: 600,
                      borderRadius: '6px',
                      borderColor: T.borderStrong,
                      color: T.textPrimary,
                      whiteSpace: 'nowrap',
                      height: 56,
                      px: 2,
                    }}
                  >
                    {isLocating ? 'Detecting…' : 'Detect'}
                  </Button>
                </span>
              </Tooltip>
            </Box>
            {editingShop?.latitude && editingShop?.longitude && (
              <Typography variant="caption" sx={{ color: T.textFaint, mt: 0.75, display: 'block' }}>
                📍 {editingShop.latitude}, {editingShop.longitude}
              </Typography>
            )}
          </Box>
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
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <SectionCard key={i} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="rounded" width={60} height={60} sx={{ borderRadius: '6px' }} />
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
  const totalValue = data.reduce(
    (sum, item) => sum + item.deals.reduce((s, d) => s + (Number(d.dealPrice || d.price) || 0), 0),
    0
  );

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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
                <Typography sx={{  fontWeight: 800, fontSize: 16, color: T.textPrimary }} noWrap>
                  {item.shop.name}{' '}
                  <Typography component="span" sx={{ color: T.textFaint, fontWeight: 600, fontSize: 13 }}>
                    ({item.deals.length})
                  </Typography>
                </Typography>
                <Button
                  size="small"
                  endIcon={<ArrowForwardRounded sx={{ fontSize: 16 }} />}
                  onClick={() => navigate(`/shop/${item.shop._id}/deals`)}
                  sx={{ ...ghostBtnSx, px: 1.5, flexShrink: 0 }}
                >
                  Manage all
                </Button>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2 }}>
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
                        sx={{ width: 58, height: 58, borderRadius: '6px', bgcolor: T.surfaceMuted, color: T.textFaint, flexShrink: 0 }}
                      >
                        <LocalOfferRounded fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          sx={{ fontWeight: 700,  color: T.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
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
                      <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
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
          <Typography sx={{  fontWeight: 800, fontSize: 17 }}>Delete this deal?</Typography>
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
  <Box sx={{ minHeight: '100vh', bgcolor: T.bg }}>
    <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}`, px: { xs: 2, md: 6 }, py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
        <Skeleton variant="circular" width={72} height={72} />
        <Box sx={{ flex: 1, minWidth: 160 }}>
          <Skeleton width={200} height={28} />
          <Skeleton width={140} />
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mt: 3, maxWidth: 720 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={64} sx={{ borderRadius: '6px' }} />
        ))}
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

  // Deal count across all shops, used in the header stats strip
  const dealsCountQuery = useQuery({
    queryKey: ['allDealsCount', shops.map((s) => s._id)],
    queryFn: async () => {
      const promises = shops.map((shop) => fetchDealsByShop(shop._id).then((res) => res.deals.length));
      const counts = await Promise.all(promises);
      return counts.reduce((a, b) => a + b, 0);
    },
    enabled: shops.length > 0,
  });

  const notify = (severity, message) => setToast({ open: true, severity, message });

  const initials = useMemo(() => {
    const name = profileResponse?.data?.name || '';
    return name ? name.charAt(0).toUpperCase() : '';
  }, [profileResponse]);

  const createdAt = profileResponse?.data?.createdAt;
  const memberSince = useMemo(() => {
    if (!createdAt) return '—';
    try {
      return new Date(createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return '—';
    }
  }, [createdAt]);

  const isVerified = profileResponse?.data?.isVerified !== false;

  if (profileLoading || shopsLoading) {
    return <PageSkeleton />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: T.bg }}>
      {/* Header / identity */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <Box sx={{ px: { xs: 2, sm: 3, md: 6 }, pt: { xs: 3, md: 4 }, pb: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: { xs: 2, sm: 2.5 },
              mb: 3,
            }}
          >
            <Avatar
              src={profileResponse?.data?.profilePicture}
              sx={{
                width: { xs: 60, sm: 72 },
                height: { xs: 60, sm: 72 },
                
                fontWeight: 700,
                fontSize: { xs: 22, sm: 26 },
                bgcolor: T.blue,
                color: '#FFFFFF',
                boxShadow: `0 0 0 4px ${T.surfaceMuted}`,
              }}
            >
              {initials || (profileResponse?.data?.name ? profileResponse.data.name.charAt(0).toUpperCase() : 'U')}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 180 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 600,  fontSize: { xs: 19, sm: 22 }, color: T.textPrimary, lineHeight: 1.2 }}>
                  {profileResponse?.data?.name || 'Your profile'}
                </Typography>
                {isVerified && (
                  <Tooltip title="Verified dealer">
                    {/* <CheckCircleRounded sx={{ fontSize: 19, color: T.blue }} /> */}
                    <VerifiedIcon sx={{ fontSize: 19, color: T.blue }} />   
                  </Tooltip>
                )}
              </Box>
              <Typography variant="body2" sx={{ color: T.textSecondary, mt: 0.25 }} noWrap>
                {profileResponse?.data?.email}
              </Typography>
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
                  
                  fontWeight: 700,
                  fontSize: 14,
                  textTransform: 'none',
                  color: T.textSecondary,
                  borderRadius: '999px 999px 0 0',
                  px: 2,
                  gap: 0.75,
                  borderBottom: tabIndex === i ? `2.5px solid ${T.blue}` : '2.5px solid transparent',
                  '&.Mui-selected': { color: T.blue },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 6 }, py: { xs: 3, md: 4 } }}>
        {tabIndex === 0 && (
          <ProfileTab
            profile={profileResponse}
            shopsCount={shops.length}
            dealsCount={dealsCountQuery.data ?? 0}
            refetch={refetchProfile}
            onNotify={notify}
          />
        )}
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
          sx={{  fontWeight: 600, borderRadius: `${T.radiusSm}px` }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DealerProfile;