import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Link,
  CircularProgress,
  InputAdornment,
  Alert,
} from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useSignupMutation, useGoogleLoginMutation } from '../../api/useAuthMutations';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Divider } from '@mui/material';

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

const FieldLabel = ({ children }) => (
  <Typography
    sx={{
      fontWeight: 600,
      fontSize: 13,
      color: 'text.secondary',
      mb: 0.5,
    }}
  >
    {children}
  </Typography>
);

export default function SignupForm({ onSuccess, onSwitchToLogin }) {
  const [tab, setTab] = useState('signup');
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});

  const { mutate: signup, isPending, error: apiError } = useSignupMutation({
    onSuccess: () => onSuccess(form.email),
  });

  const { login: authLogin } = useAuthStore();
  const navigate = useNavigate();

  const { mutate: googleLogin } = useGoogleLoginMutation({
    onSuccess: (data) => {
      if (data?.token) {
        authLogin(data.token);
        navigate('/owner-dashboard');
      }
    },
    onError: (err) => {
       console.error("Google signup failed", err);
    },
  });

  const handleTab = (_, val) => {
    if (val === 'login') onSwitchToLogin();
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (!/^\+?[\d\s-]{10,}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Valid phone required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    signup({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });
  };

  return (
    <Box sx={{maxWidth:"450px"}}>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, mb: 0.5 }}
      >
        Dealer Portal
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
        Welcome! Create your account to manage shop and deals.
      </Typography>

      {/* Tab toggle */}
      <ToggleButtonGroup
        value={tab}
        exclusive
        onChange={handleTab}
        fullWidth
        sx={{
          mb: 4,
          border: '1px solid #E5E2DC',
          borderRadius: '10px',
          overflow: 'hidden',
          '& .MuiToggleButton-root': {
            border: 'none',
            borderRadius: 0,
            py: 1.2,
            fontWeight: 500,
            fontSize: '0.95rem',
            color: '#666',
            textTransform: 'none',
            '&.Mui-selected': {
              bgcolor: 'white',
              color: '#1A1A1A',
              boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
              borderRadius: '8px',
              m: '3px',
            },
          },
        }}
      >
        <ToggleButton value="signup">Sign Up</ToggleButton>
        <ToggleButton value="login">Log In</ToggleButton>
      </ToggleButtonGroup>

      {/* API error */}
      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError.message}
        </Alert>
      )}

      {/* Name */}
      <Box sx={{ mb: 3.5 }}>
        <FieldLabel>Full Name</FieldLabel>
        <TextField
          placeholder="Enter Name"
          value={form.name}
          onChange={set('name')}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonOutlineOutlinedIcon sx={{ fontSize: 15, color: '#dedede' }} />
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />
      </Box>

      {/* Email */}
      <Box sx={{ mb: 3.5 }}>
        <FieldLabel>Email Address</FieldLabel>
        <TextField
          placeholder="john@example.com"
          value={form.email}
          onChange={set('email')}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
          size="small"
          sx={fieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailOutlinedIcon sx={{ fontSize: 15, color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Phone */}
      <Box sx={{ mb: 3.5 }}>
        <FieldLabel>Phone Number</FieldLabel>
        <TextField
          placeholder="+91 12345 67890"
          value={form.phone}
          onChange={set('phone')}
          error={!!errors.phone}
          helperText={errors.phone}
          fullWidth
          size="small"
          sx={fieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneOutlinedIcon sx={{ fontSize: 15, color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Password */}
      <Box sx={{ mb: 3.5 }}>
        <FieldLabel>Password</FieldLabel>
        <TextField
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set('password')}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          size="small"
          sx={fieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ fontSize: 15, color: '#999' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* CTA */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleSubmit}
        disabled={isPending}
        sx={{
          bgcolor: '#E8971A',
          color: 'white',
          fontWeight: 700,
          letterSpacing: 1.2,
          py: 1.6,
          borderRadius: '10px',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          mb: 2.5,
          '&:hover': { bgcolor: '#D4880F' },
        }}
        endIcon={!isPending && '→'}
      >
        {isPending ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Get Started'}
      </Button>

      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            googleLogin({ credential: credentialResponse.credential });
          }}
          onError={() => {
            console.error('Signup Failed');
          }}
        />
      </Box>

      {/* Footer */}
      <Typography variant="body2" align="center" color="text.secondary">
        Already a Dealer?{' '}
        <Link
          component="button"
          onClick={onSwitchToLogin}
          sx={{ color: '#E8971A', fontWeight: 600, cursor: 'pointer' }}
          underline="hover"
        >
          Login here
        </Link>
      </Typography>
    </Box>
  );
}

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '4px',
    bgcolor: 'white',
    padding: '5px',
    '& fieldset': {
      borderColor: '#E5E2DC', 
    },
    '&:hover fieldset': {
      borderColor: '#E5E2DC', 
    },
    '&.Mui-focused': {
      '& fieldset': {
        borderColor: '#f4d8ae', 
        borderWidth: '2px', 
      },
    },
  },
};