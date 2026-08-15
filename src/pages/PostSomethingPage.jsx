import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Typography, Card, CardActionArea,
  CardContent, Chip, Container, Stack,
} from '@mui/material';
import SellIcon from '@mui/icons-material/Sell';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import BuildIcon from '@mui/icons-material/Build';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import useAuthStore from '../store/authStore';
import { useGetMyShops } from '../hooks/useGetMyShops';

const LISTING_TYPES = [
  {
    type: 'SELL',
    label: 'Sell Something',
    description: 'Phone, vehicle, furniture, electronics & more',
    cta: 'Start Selling',
    icon: <SellIcon sx={{ fontSize: 30 }} />,
    color: '#6366f1',
    bg: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)',
    blob: '#6366f1',
    requiresDealer: false,
  },
  {
    type: 'RENT',
    label: 'Rent Something',
    description: 'Property, vehicle, equipment & more',
    cta: 'Start Renting',
    icon: <HomeIcon sx={{ fontSize: 30 }} />,
    color: '#0ea5e9',
    bg: 'linear-gradient(135deg,#3b82f6 0%,#0ea5e9 100%)',
    blob: '#3b82f6',
    requiresDealer: false,
  },
  {
    type: 'EVENT',
    label: 'Create an Event',
    description: 'Concert, workshop, meetup, sports & more',
    cta: 'Create Event',
    icon: <EventIcon sx={{ fontSize: 30 }} />,
    color: '#f59e0b',
    bg: 'linear-gradient(135deg,#f59e0b 0%,#f97316 100%)',
    blob: '#f59e0b',
    requiresDealer: false,
  },
  {
    type: 'SERVICE',
    label: 'Offer a Service',
    description: 'Home services, tutoring, consulting & more',
    cta: 'Offer Service',
    icon: <BuildIcon sx={{ fontSize: 30 }} />,
    color: '#10b981',
    bg: 'linear-gradient(135deg,#10b981 0%,#059669 100%)',
    blob: '#10b981',
    requiresDealer: false,
  },
  {
    type: 'GIVEAWAY',
    label: 'Give Something Away',
    description: 'Free items, donations, community sharing',
    cta: 'Give Away',
    icon: <CardGiftcardIcon sx={{ fontSize: 30 }} />,
    color: '#ec4899',
    bg: 'linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)',
    blob: '#ec4899',
    requiresDealer: false,
  },
  {
    type: 'DEAL',
    label: 'Post a Deal',
    description: 'Shop discounts, BOGO, freebies — requires verified shop',
    cta: 'Post Deal',
    icon: <LocalOfferIcon sx={{ fontSize: 30 }} />,
    color: '#f97316',
    bg: 'linear-gradient(135deg,#f97316 0%,#ef4444 100%)',
    blob: '#f97316',
    requiresDealer: true,
  },
];

const TRUST_ITEMS = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 22 }} />,
    title: 'Safe & Secure',
    description: 'We protect your privacy and keep your data safe.',
    color: '#6366f1',
  },
  {
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 22 }} />,
    title: 'Easy & Quick',
    description: 'Simple steps to create your listing in minutes.',
    color: '#6366f1',
  },
  {
    icon: <GroupsOutlinedIcon sx={{ fontSize: 22 }} />,
    title: 'Trusted Community',
    description: 'Join thousands of users in your local community.',
    color: '#6366f1',
  },
];

export default function PostSomethingPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const { data: shopsData } = useGetMyShops();
  const myShops = shopsData?.data ?? [];
  const hasVerifiedShop = myShops.some((s) => s.isVerified);

  // Admin can always bypass, otherwise you need a verified shop
  const canPostDeal = role === 'admin' || hasVerifiedShop;

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 72px)',
        bgcolor: '#F8F8FB',
        py: { xs: 5, sm: 7, md: 9 },
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography
            variant="h3"
            sx={{
              color: '#14141a',
              fontFamily: '"Plus Jakarta Sans",sans-serif',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: { xs: 32, sm: 40, md: 48 },
              mb: 2,
            }}
          >
            What do you want to post?
          </Typography>

          {/* Decorative divider */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ mb: 2.5 }}
          >
            <Box
              sx={{
                width: 56,
                height: 3,
                borderRadius: 3,
                background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
              }}
            />
            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#8b5cf6' }} />
          </Stack>

          <Typography
            variant="body1"
            sx={{ color: '#6b7280', fontSize: 16, maxWidth: 480, mx: 'auto' }}
          >
            Choose a listing type to get started. No shop required for individual listings.
          </Typography>
        </Box>

        {/* Cards */}
        <Grid container spacing={3} justifyContent="center">
          {LISTING_TYPES.map((lt) => {
            const locked = lt.requiresDealer && !canPostDeal;
            return (
              <Grid item xs={12} sm={6} md={4} key={lt.type} >
                <Card
                  elevation={0}
                  sx={{
                    position: 'relative',
                    height: '100%',
                    borderRadius: 4,
                    bgcolor: '#fff',
                    border: '1px solid #ECECF3',
                    overflow: 'hidden',
                    width: "340px",
                    opacity: locked ? 0.65 : 1,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                    '&:hover': locked
                      ? {}
                      : {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 16px 36px rgba(20,20,26,0.08)',
                          borderColor: `${lt.color}55`,
                        },
                  }}
                >
                  {/* Decorative corner blob */}
                  <Box
                    aria-hidden
                    sx={{
                      position: 'absolute',
                      right: -30,
                      bottom: -30,
                      width: 130,
                      height: 130,
                      borderRadius: '50%',
                      background: lt.blob,
                      opacity: 0.08,
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Top-right corner indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: lt.type === 'DEAL' ? `${lt.color}18` : '#F5F5F8',
                      color: lt.type === 'DEAL' ? lt.color : '#9ca3af',
                    }}
                  >
                    {lt.type === 'DEAL'
                      ? <ShieldOutlinedIcon sx={{ fontSize: 18 }} />
                      : <ChevronRightIcon sx={{ fontSize: 20 }} />}
                  </Box>

                  <CardActionArea
                    disabled={locked}
                    onClick={() => {
                      if (lt.type === 'DEAL') {
                        const verifiedShops = myShops.filter((s) => s.isVerified);
                        if (verifiedShops.length > 0) {
                          navigate(`/shop/${verifiedShops[0]._id}/add-deals`);
                        }
                      } else {
                        navigate(`/post/${lt.type.toLowerCase()}`);
                      }
                    }}
                    sx={{
                      p: 3.5,
                      height: '100%',
                      alignItems: 'flex-start',
                      cursor: locked ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <CardContent sx={{ p: 0, width: '100%', position: 'relative', zIndex: 1 }}>
                      {/* Icon */}
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '18px',
                          background: lt.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          mb: 2.5,
                          boxShadow: `0 10px 22px ${lt.color}40`,
                        }}
                      >
                        {lt.icon}
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          color: '#14141a',
                          fontFamily: '"Plus Jakarta Sans",sans-serif',
                          fontWeight: 700,
                          fontSize: 19,
                          mb: 0.75,
                        }}
                      >
                        {lt.label}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: '#6b7280', lineHeight: 1.6, fontSize: 14.5, mb: 2.5 }}
                      >
                        {lt.description}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {lt.requiresDealer && (
                          <Chip
                            label={locked ? 'Verified shop required' : 'Dealer listing'}
                            size="small"
                            sx={{
                              bgcolor: `${lt.color}18`,
                              color: lt.color,
                              fontWeight: 600,
                              fontSize: 11.5,
                              height: 26,
                            }}
                          />
                        )}

                        <Chip
                          label={lt.cta}
                          size="small"
                          deleteIcon={<ChevronRightIcon />}
                          onDelete={() => {}}
                          sx={{
                            bgcolor: `${lt.color}18`,
                            color: lt.color,
                            fontWeight: 700,
                            fontSize: 13,
                            height: 30,
                            px: 0.5,
                            '& .MuiChip-deleteIcon': {
                              color: lt.color,
                              fontSize: 18,
                              m: 0,
                            },
                          }}
                        />
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Trust row */}
        <Box
          sx={{
            mt: { xs: 5, md: 7 },
            pt: { xs: 4, md: 5 },
            borderTop: '1px solid #ECECF3',
          }}
        >
          <Grid container spacing={{ xs: 3, sm: 4 }}>
            {TRUST_ITEMS.map((item) => (
              <Grid item xs={12} sm={4} key={item.title}>
                <Stack direction="row" spacing={1.75} alignItems="flex-start">
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: `${item.color}14`,
                      color: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: '"Plus Jakarta Sans",sans-serif',
                        fontWeight: 700,
                        fontSize: 15.5,
                        color: '#14141a',
                        mb: 0.25,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: 13.5, lineHeight: 1.5 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}