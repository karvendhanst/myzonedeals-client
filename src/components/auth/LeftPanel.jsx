import { Box, Typography, Avatar, Rating } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import authimage from '../../assets/images/authimage.jpg';

const BG_IMAGE = authimage;

  
export default function LeftPanel() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'bottom center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 5,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(160deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.46) 100%)',
          zIndex: 0,
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: '10px',
            width: 38,
            height: 38,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LocalOfferOutlinedIcon sx={{ color: '#E8971A', fontSize: 22 }} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ color: 'white', fontWeight: 600 }}
        >
          My Zone Deals
        </Typography>
      </Box>

      {/* Hero copy */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h2"
          sx={{
            color: 'white',
            fontWeight: 400,
            fontSize: { md: '2.6rem', lg: '3rem' },
            lineHeight: 1.2,
            mb: 2,
            fontFamily: "'DM Serif Display', serif"
          }}
        >
          Grow your local<br />presence effortlessly.
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.82)',
            maxWidth: 360,
            lineHeight: 1.7,
          }}
        >
          List your shop, create exclusive offers, and reach thousands of customers in your immediate neighborhood.
        </Typography>
      </Box>

      {/* Testimonial card */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          bgcolor: 'rgba(255,255,255,0.13)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 3,
          p: 3,
        }}
      >
        <Rating value={5} readOnly size="small" sx={{ mb: 1.5, color: '#E8971A' }} />
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255,255,255,0.92)',
            fontStyle: 'italic',
            lineHeight: 1.7,
            mb: 2,
          }}
        >
          "My Zone Deals helped us increase our foot traffic by 40% in just two months. The platform is incredibly easy to manage."
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{ width: 38, height: 38, bgcolor: '#2D6A4F', fontSize: 14 }}
          >
            K
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{ color: 'white', fontWeight: 600}}
            >
              Karvendhan
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.8 }}
            >
              Owner, The Madras Bakes
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}