import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Chip, Grid, Button,
  Divider, CircularProgress, Alert, Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useListing } from '../hooks/useListings';
import useAuthStore from '../store/authStore';

const TYPE_COLOR = {
  SELL: '#6366f1', RENT: '#0ea5e9', EVENT: '#f59e0b',
  SERVICE: '#10b981', GIVEAWAY: '#ec4899', DEAL: '#f97316',
};

const STATUS_COLOR = {
  DRAFT: '#94a3b8', SUBMITTED: '#60a5fa', PENDING_REVIEW: '#f59e0b',
  APPROVED: '#34d399', PUBLISHED: '#34d399', ACTIVE: '#4ade80',
  REJECTED: '#f87171', EXPIRED: '#94a3b8', SOLD: '#a78bfa',
  RENTED: '#38bdf8', COMPLETED: '#6ee7b7', ARCHIVED: '#94a3b8',
};

export default function ListingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError } = useListing(id);
  const listing = data?.listing;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !listing) {
    return (
      <Container maxWidth="md" sx={{ mt: 6 }}>
        <Alert severity="error">Listing not found or has been removed.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go back
        </Button>
      </Container>
    );
  }

  const color = TYPE_COLOR[listing.listingType] ?? '#6366f1';
  const statusColor = STATUS_COLOR[listing.status] ?? '#94a3b8';
  const coverImg = listing.media?.find((m) => m.isCover)?.url ?? listing.media?.[0]?.url;
  const meta = listing.metadata ?? {};

  return (
    <Box sx={{ minHeight: 'calc(100vh - 72px)', bgcolor: '#FAFAF8', py: 4 }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ color: '#666', mb: 3, '&:hover': { color: '#1a1a1a' } }}
        >
          Back
        </Button>

        {/* Cover image */}
        {coverImg && (
          <Box
            component="img"
            src={coverImg}
            alt={listing.title}
            sx={{
              width: '100%', height: 320, objectFit: 'cover',
              borderRadius: 3, mb: 3,
            }}
          />
        )}

        {/* Badges */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Chip
            label={listing.listingType}
            size="small"
            sx={{ bgcolor: `${color}22`, color, fontWeight: 700 }}
          />
          <Chip
            label={listing.status}
            size="small"
            sx={{ bgcolor: `${statusColor}22`, color: statusColor, fontWeight: 600 }}
          />
          {listing.categoryInfo?.name && (
            <Chip label={listing.categoryInfo.name} size="small" variant="outlined"
              sx={{ borderColor: '#ccc', color: '#666' }} />
          )}
        </Box>

        {/* Title */}
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ color: '#1a1a1a', fontFamily: '"Plus Jakarta Sans",sans-serif', mb: 1 }}
        >
          {listing.title}
        </Typography>

        {/* Price / key metadata */}
        {meta.price != null && (
          <Typography variant="h5" fontWeight={700} sx={{ color, mb: 2 }}>
            ₹{meta.dealPrice ?? meta.price}
            {meta.dealPrice && (
              <Typography component="span" sx={{ textDecoration: 'line-through', color: '#999', ml: 1.5, fontSize: 18 }}>
                ₹{meta.price}
              </Typography>
            )}
            {meta.rentalPeriod && (
              <Typography component="span" sx={{ color: '#666', fontSize: 16, ml: 1 }}>
                /{meta.rentalPeriod}
              </Typography>
            )}
          </Typography>
        )}

        <Divider sx={{ borderColor: '#e0e0e0', my: 2 }} />

        {/* Description */}
        <Typography sx={{ color: '#333', lineHeight: 1.8, mb: 3 }}>
          {listing.description || 'No description provided.'}
        </Typography>

        {/* Event-specific */}
        {listing.listingType === 'EVENT' && (
          <Paper sx={{ bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 2, p: 2.5, mb: 3 }} elevation={0}>
            <Grid container spacing={2}>
              {meta.startDate && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <CalendarTodayIcon sx={{ color, fontSize: 18 }} />
                    <Typography sx={{ color: '#1a1a1a', fontSize: 14 }}>
                      {new Date(meta.startDate).toLocaleDateString()} {meta.startTime && `at ${meta.startTime}`}
                    </Typography>
                  </Box>
                </Grid>
              )}
              {meta.venue && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <LocationOnIcon sx={{ color, fontSize: 18 }} />
                    <Typography sx={{ color: '#1a1a1a', fontSize: 14 }}>{meta.venue}</Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Paper>
        )}

        {/* Location */}
        {listing.location?.address?.city && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 3 }}>
            <LocationOnIcon sx={{ color: '#666', fontSize: 18 }} />
            <Typography sx={{ color: '#666', fontSize: 14 }}>
              {[listing.location.address.city, listing.location.address.state]
                .filter(Boolean)
                .join(', ')}
            </Typography>
          </Box>
        )}

        {/* Media gallery (additional images) */}
        {listing.media?.length > 1 && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
            {listing.media.slice(1).map((m, i) => (
              <Box
                key={i}
                component="img"
                src={m.url}
                alt=""
                sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 2 }}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
