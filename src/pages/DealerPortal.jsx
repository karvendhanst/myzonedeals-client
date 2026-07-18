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

export default function DealerPortal() {
  const [step, setStep] = useState(STEPS.SIGNUP);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuthStore();

  const handleSignupSuccess = (email) => {
    setRegisteredEmail(email);
    setStep(STEPS.OTP);
  };

  const handleOtpSuccess = (data) => {
    if (data?.token) {
      authLogin(data.token);
      navigate('/add-shop');
    } else {
      setStep(STEPS.LOGIN);
    }
  };

  const handleUnverifiedEmail = (email) => {
    setRegisteredEmail(email);
    setStep(STEPS.OTP);
  };

  const handleSwitchToLogin = () => setStep(STEPS.LOGIN);
  const handleSwitchToSignup = () => setStep(STEPS.SIGNUP);

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
