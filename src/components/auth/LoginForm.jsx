// src/components/auth/LoginForm.jsx

import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Link,
  CircularProgress,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import { useLoginMutation,useResendOtpMutation } from '../../api/useAuthMutations';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const INITIAL = { email: '', password: '' };

export default function LoginForm({ onSwitchToSignup, onUnverifiedEmail }) {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login: authLogin } = useAuthStore();
  const navigate = useNavigate();

  const { mutate: resendOtp } = useResendOtpMutation();

  const { mutate: login, isPending, error: apiError } = useLoginMutation({
    onSuccess: (data) => {
      if (data?.token) {
        authLogin(data.token);
        navigate('/owner-dashboard');
      }
    },
    onError: (err) => {
      // Backend sends "Email not verified" (400) when isVerified is false.
      // Send the dealer to the OTP screen instead of just showing an error.
      if (err.message === 'Email not verified') {
        resendOtp({ email: form.email });
        if (onUnverifiedEmail) {
          onUnverifiedEmail(form.email);
        }
      }
    },
  });
  const handleTab = (_, val) => {
    if (val === 'signup') onSwitchToSignup();
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    return errs;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    login({ email: form.email, password: form.password });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <Typography
        variant="h4"
        sx={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, mb: 0.5 }}
      >
        Dealer Portal
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
        Welcome back! Manage your shop and deals here.
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
            fontFamily: "'DM Sans', sans-serif",
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

      {/* Email */}
      <TextField
        label="Email Address"
        placeholder="contact@shopname.com"
        type="email"
        value={form.email}
        onChange={set('email')}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
        size="small"
        sx={{ ...fieldSx, mb: 3.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlinedIcon sx={{ fontSize: 15, color: '#999' }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Password */}
      <TextField
        label="Password"
        placeholder="Enter your password"
        type={showPassword ? 'text' : 'password'}
        value={form.password}
        onChange={set('password')}
        error={!!errors.password}
        helperText={errors.password}
        fullWidth
        size="small"
        sx={{ ...fieldSx, mb: 3.5 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlinedIcon sx={{ fontSize: 15, color: '#999' }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword((v) => !v)}
                edge="end"
                size="small"
              >
                {showPassword
                  ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} />
                  : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* Forgot password */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Link href="#" underline="hover" sx={{ color: '#E8971A', fontSize: '0.82rem', fontWeight: 500 }}>
          Forgot password?
        </Link>
      </Box>

      {/* Login CTA */}
      <Button
        fullWidth
        type="submit"
        variant="contained"
        disabled={isPending}
        sx={{
          bgcolor: '#E8971A',
          color: 'white',
          fontFamily: "'DM Sans', sans-serif",
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
        {isPending ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Log In'}
      </Button>


      {/* Footer */}
      <Typography variant="body2" align="center" color="text.secondary">
        Not a Dealer yet?{' '}
        <Link
          component="button"
          type="button"
          onClick={onSwitchToSignup}
          sx={{ color: '#E8971A', fontWeight: 600, cursor: 'pointer' }}
          underline="hover"
        >
          Sign up here
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
        borderColor: '#E8971A',
        borderWidth: '2px',
      },
    },
  },
};