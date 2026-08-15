import React from 'react';
import {
  Box, Container, Typography, Grid, Chip, Button,
  CircularProgress, Alert, IconButton, Menu, MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useListings, useDeleteListing, useArchiveListing, useMarkSold } from '../hooks/useListings';
import useAuthStore from '../store/authStore';
import { useState } from 'react';

const TYPE_COLOR = {
  SELL: '#6366f1', RENT: '#0ea5e9', EVENT: '#f59e0b',
  SERVICE: '#10b981', GIVEAWAY: '#ec4899', DEAL: '#f97316',
};

const STATUS_BADGE = {
  DRAFT: { label: 'Draft', color: '#94a3b8' },
  SUBMITTED: { label: 'Submitted', color: '#60a5fa' },
  PENDING_REVIEW: { label: 'Under Review', color: '#f59e0b' },
  APPROVED: { label: 'Approved', color: '#34d399' },
  PUBLISHED: { label: 'Live', color: '#4ade80' },
  ACTIVE: { label: 'Active', color: '#4ade80' },
  REJECTED: { label: 'Rejected', color: '#f87171' },
  EXPIRED: { label: 'Expired', color: '#94a3b8' },
  SOLD: { label: 'Sold', color: '#a78bfa' },
  ARCHIVED: { label: 'Archived', color: '#64748b' },
};

function ListingCardMenu({ listing }) {
  const [anchor, setAnchor] = useState(null);
  const navigate = useNavigate();
  const deleteMut = useDeleteListing();
  const archiveMut = useArchiveListing();
  const soldMut = useMarkSold();

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ color: '#666' }}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { bgcolor: '#fff', color: '#1a1a1a', minWidth: 160 } }}
      >
        <MenuItem onClick={() => { navigate(`/listings/${listing._id}`); setAnchor(null); }}>
          View
        </MenuItem>
        {listing.listingType === 'SELL' && listing.status === 'ACTIVE' && (
          <MenuItem onClick={() => { soldMut.mutate(listing._id); setAnchor(null); }}>
            Mark as Sold
          </MenuItem>
        )}
        {['PUBLISHED', 'ACTIVE'].includes(listing.status) && (
          <MenuItem onClick={() => { archiveMut.mutate(listing._id); setAnchor(null); }}>
            Archive
          </MenuItem>
        )}
        <MenuItem
          onClick={() => { if (confirm('Delete this listing?')) deleteMut.mutate(listing._id); setAnchor(null); }}
          sx={{ color: '#f87171' }}
        >
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

export default function MyListingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // TODO: pass ownerId from decoded token on server — for now filter client-side
  const { data, isLoading, isError } = useListings({
    status: 'DRAFT,SUBMITTED,PENDING_REVIEW,APPROVED,PUBLISHED,ACTIVE,REJECTED,EXPIRED,SOLD,ARCHIVED',
  });
  const listings = data?.listings ?? [];

  return (
    <Box sx={{ minHeight: 'calc(100vh - 72px)', bgcolor: '#FAFAF8', py: 5 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: '#1a1a1a', fontFamily: '"Plus Jakarta Sans",sans-serif' }}
          >
            My Listings
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/post')}
            sx={{
              borderRadius: 2.5, fontWeight: 700,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            }}
          >
            Post Something
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <CircularProgress sx={{ color: '#6366f1' }} />
          </Box>
        )}

        {isError && (
          <Alert severity="error">Failed to load listings.</Alert>
        )}

        {!isLoading && listings.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography sx={{ color: '#666', mb: 3 }}>
              You haven't posted anything yet.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/post')}
              sx={{ borderColor: '#6366f1', color: '#6366f1', borderRadius: 2.5 }}
            >
              Create your first listing
            </Button>
          </Box>
        )}

        <Grid container spacing={2.5}>
          {listings.map((listing) => {
            const color = TYPE_COLOR[listing.listingType] ?? '#6366f1';
            const badge = STATUS_BADGE[listing.status] ?? { label: listing.status, color: '#94a3b8' };
            const cover = listing.media?.find((m) => m.isCover)?.url ?? listing.media?.[0]?.url;

            return (
              <Grid item xs={12} sm={6} md={4} key={listing._id}>
                <Box
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 3,
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
                  }}
                >
                  {/* Cover image */}
                  <Box sx={{ height: 140, bgcolor: `${color}18`, position: 'relative' }}>
                    {cover ? (
                      <Box component="img" src={cover} alt=""
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography sx={{ color: `${color}88`, fontSize: 40 }}>📦</Typography>
                      </Box>
                    )}
                    {/* Type badge */}
                    <Chip
                      label={listing.listingType}
                      size="small"
                      sx={{
                        position: 'absolute', top: 10, left: 10,
                        bgcolor: `${color}dd`, color: '#fff', fontWeight: 700, fontSize: 10,
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography
                        fontWeight={700}
                        sx={{ color: '#1a1a1a', flex: 1, pr: 1, fontSize: 15,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {listing.title}
                      </Typography>
                      <ListingCardMenu listing={listing} />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: badge.color }} />
                      <Typography sx={{ color: badge.color, fontSize: 12, fontWeight: 600 }}>
                        {badge.label}
                      </Typography>
                    </Box>

                    {listing.metadata?.price != null && (
                      <Typography sx={{ color, fontWeight: 700, mt: 1, fontSize: 15 }}>
                        ₹{listing.metadata.dealPrice ?? listing.metadata.price}
                      </Typography>
                    )}

                    <Typography sx={{ color: '#999', fontSize: 11, mt: 1 }}>
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
