import { useMutation } from '@tanstack/react-query';
import {
  signupDealer,
  verifyEmailOtp,
  resendOtp,
  loginDealer,
} from './authApi';

// ─── Signup Mutation ──────────────────────────────────────────────────────────
export const useSignupMutation = (options = {}) =>
  useMutation({
    mutationFn: signupDealer,
    ...options,
  });

// ─── Verify OTP Mutation ──────────────────────────────────────────────────────
export const useVerifyOtpMutation = (options = {}) =>
  useMutation({
    mutationFn: verifyEmailOtp,
    ...options,
  });

// ─── Resend OTP Mutation ──────────────────────────────────────────────────────
export const useResendOtpMutation = (options = {}) =>
  useMutation({
    mutationFn: resendOtp,
    ...options,
  });

// ─── Login Mutation ───────────────────────────────────────────────────────────
export const useLoginMutation = (options = {}) =>
  useMutation({
    mutationFn: loginDealer,
    ...options,
  });

