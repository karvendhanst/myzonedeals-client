// src/components/auth/OtpForm.jsx
// Step 2 — Email OTP verification with 6 individual input boxes

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Link,
  CircularProgress,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import { useVerifyOtpMutation, useResendOtpMutation } from '../../api/useAuthMutations';

const OTP_LENGTH = 6;

export default function OtpForm({ email, onSuccess, onBack }) {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const { mutate: verify, isPending, error: verifyError } = useVerifyOtpMutation({
    onSuccess,
  });

  const { mutate: resend, isPending: resendPending } = useResendOtpMutation({
    onSuccess: () => setResendTimer(60),
  });

  const handleChange = (idx, value) => {
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    // Auto-advance
    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...otp];
    [...pasted].forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) return;
    verify({ email, otp: code });
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    resend({ email });
  };

  const isComplete = otp.every(Boolean);
  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c);

  return (
    <Box>
      {/* Back */}
      <Button
        startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
        onClick={onBack}
        sx={{
          mb: 4,
          p: 0,
          color: '#666',
          fontFamily: "'DM Sans', sans-serif",
          textTransform: 'none',
          '&:hover': { bgcolor: 'transparent', color: '#333' },
        }}
      >
        Back
      </Button>

      {/* Icon */}
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '16px',
          bgcolor: '#FEF3E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3,
        }}
      >
        <MarkEmailReadOutlinedIcon sx={{ fontSize: 30, color: '#E8971A' }} />
      </Box>

      {/* Heading */}
      <Typography
        variant="h4"
        sx={{ fontFamily: "'DM Serif Display', serif", fontWeight: 400, mb: 1 }}
      >
        Check your email
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
        We sent a 6-digit verification code to{' '}
        <Box component="span" sx={{ fontWeight: 600, color: '#1A1A1A' }}>
          {maskedEmail}
        </Box>
        . Enter it below to verify your account.
      </Typography>

      {/* Error */}
      {verifyError && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {verifyError.message}
        </Alert>
      )}

      {/* OTP inputs */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 4, justifyContent: 'center' }}>
        {otp.map((digit, idx) => (
          <Box
            key={idx}
            component="input"
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            sx={{
              width: 52,
              height: 58,
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              border: digit
                ? '2px solid #E8971A'
                : '2px solid #E5E2DC',
              borderRadius: '12px',
              bgcolor: digit ? '#FEF9F0' : 'white',
              outline: 'none',
              transition: 'border-color 0.15s, background 0.15s',
              cursor: 'text',
              '&:focus': {
                borderColor: '#E8971A',
                boxShadow: '0 0 0 3px rgba(232,151,26,0.18)',
              },
            }}
          />
        ))}
      </Box>

      {/* Verify button */}
      <Button
        fullWidth
        variant="contained"
        onClick={handleVerify}
        disabled={!isComplete || isPending}
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
          mb: 3,
          '&:hover': { bgcolor: '#D4880F' },
          '&.Mui-disabled': { bgcolor: '#F0E0C0', color: 'white' },
        }}
        endIcon={!isPending && '→'}
      >
        {isPending ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Verify Email'}
      </Button>

      {/* Resend */}
      <Typography variant="body2" align="center" color="text.secondary">
        Didn&apos;t receive the code?{' '}
        {resendTimer > 0 ? (
          <Box component="span" sx={{ color: '#999' }}>
            Resend in {resendTimer}s
          </Box>
        ) : (
          <Link
            component="button"
            onClick={handleResend}
            disabled={resendPending}
            sx={{ color: '#E8971A', fontWeight: 600, cursor: 'pointer' }}
            underline="hover"
          >
            {resendPending ? 'Sending…' : 'Resend code'}
          </Link>
        )}
      </Typography>
    </Box>
  );
}