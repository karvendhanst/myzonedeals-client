import { useState } from 'react';
import { Box, Grid } from '@mui/material';
import LeftPanel from '../components/auth/LeftPanel';
import SignupForm from '../components/auth/SignupForm';
import OtpForm from '../components/auth/OtpForm';
import LoginForm from '../components/auth/LoginForm';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const STEPS = {
  SIGNUP: 'signup',
  OTP: 'otp',
  LOGIN: 'login',
};

const SESSION_STEP_KEY = 'dealer_portal_step';
const SESSION_EMAIL_KEY = 'dealer_portal_email';

export default function DealerPortal() {
  const [step, setStep] = useState(
    () => sessionStorage.getItem(SESSION_STEP_KEY) || STEPS.SIGNUP
  );
  const [registeredEmail, setRegisteredEmail] = useState(
    () => sessionStorage.getItem(SESSION_EMAIL_KEY) || ''
  );
  // true only when OTP was freshly sent (not restored from sessionStorage)
  const [otpJustSent, setOtpJustSent] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin } = useAuthStore();

  const goToStep = (nextStep, email = registeredEmail) => {
    setStep(nextStep);
    sessionStorage.setItem(SESSION_STEP_KEY, nextStep);
    if (email) {
      setRegisteredEmail(email);
      sessionStorage.setItem(SESSION_EMAIL_KEY, email);
    }
  };

  const clearSession = () => {
    sessionStorage.removeItem(SESSION_STEP_KEY);
    sessionStorage.removeItem(SESSION_EMAIL_KEY);
  };

  const handleSignupSuccess = (email) => {
    setOtpJustSent(true);
    goToStep(STEPS.OTP, email);
  };

  const handleOtpSuccess = (data) => {
    clearSession();
    if (data?.token) {
      authLogin(data.token);
      navigate('/add-shop');
    } else {
      goToStep(STEPS.LOGIN);
    }
  };

  const handleUnverifiedEmail = (email) => goToStep(STEPS.OTP, email);

  const handleSwitchToLogin = () => goToStep(STEPS.LOGIN);
  const handleSwitchToSignup = () => {
    clearSession();
    setStep(STEPS.SIGNUP);
    setRegisteredEmail('');
  };

  return (
    <Grid
      container
      sx={{
        minHeight: '100vh',
        bgcolor: '#FAFAF8',
      }}
    >
      {/* Left decorative panel - Hidden on mobile */}
      <Grid
        item
        xs={false}
        md={7}
        lg={8}
        sx={{
          display: { xs: 'none', md: 'block' },
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <LeftPanel />
      </Grid>

      {/* Right form panel */}
      <Grid
        item
        xs={12}
        md={5}
        lg={4}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, md: 6 },
          px: { xs: 2.5, sm: 6, md: 4, lg: 8 },
        }}
      >
        <Box sx={{ maxWidth: '440px', width: '100%' }}>
          {step === STEPS.SIGNUP && (
            <SignupForm
              onSuccess={handleSignupSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
          {step === STEPS.OTP && (
            <OtpForm
              email={registeredEmail}
              onSuccess={handleOtpSuccess}
              onBack={handleSwitchToSignup}
              initialSent={otpJustSent}
              onInitialToastShown={() => setOtpJustSent(false)}
            />
          )}
          {step === STEPS.LOGIN && (
            <LoginForm 
              onSwitchToSignup={handleSwitchToSignup} 
              onUnverifiedEmail={handleUnverifiedEmail}
            />
          )}
        </Box>
      </Grid>
    </Grid>
  );
}
