
import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Container, CircularProgress, Alert, Chip
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetShopDeals } from '../hooks/useGetShopDeals';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

/* ─── Image Grid ─────────────────────────────────────────────────── */
const ImageGrid = ({ images, title }) => {
    const fallback = 'https://via.placeholder.com/600x400?text=No+Image';
    const imgs = images && images.length > 0 ? images : [{ url: fallback }];
    const count = imgs.length;

    /* Layout variants based on image count */
    const gridTemplates = {
        1: { cols: '1fr', rows: '240px' },
        2: { cols: '1fr 1fr', rows: '220px' },
        3: { cols: '2fr 1fr', rows: '120px' },   // left big, right 2 stacked
        4: { cols: '1fr 1fr', rows: '120px' },
    };

    const template = count >= 4 ? gridTemplates[4] : gridTemplates[count];

    /* For 3 images, special layout: left spans 2 rows */
    const getGridArea = (i, total) => {
        if (total === 3 && i === 0) return '1 / 1 / 3 / 2'; // span 2 rows
        return undefined;
    };

    const displayImgs = count > 4 ? imgs.slice(0, 4) : imgs;
    const extraCount = count > 4 ? count - 4 : 0;

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: template.cols,
                gridTemplateRows: count === 3
                    ? `${template.rows} ${template.rows}`
                    : template.rows,
                gap: '3px',
                borderRadius: '14px 14px 0 0',
                overflow: 'hidden',
            }}
        >
            {displayImgs.map((img, i) => (
                <Box
                    key={i}
                    sx={{
                        position: 'relative',
                        gridArea: getGridArea(i, count),
                        overflow: 'hidden',
                        '&:hover img': { transform: 'scale(1.04)' },
                    }}
                >
                    <Box
                        component="img"
                        src={img.url || fallback}
                        alt={`${title} ${i + 1}`}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                            transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
                        }}
                    />
                    {/* Overlay for last image when there are extra */}
                    {extraCount > 0 && i === displayImgs.length - 1 && (
                        <Box
                            sx={{
                                position: 'absolute', inset: 0,
                                bgcolor: 'rgba(15,23,42,0.62)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>
                                +{extraCount}
                            </Typography>
                        </Box>
                    )}
                </Box>
            ))}
        </Box>
    );
};

/* ─── Deal Card ───────────────────────────────────────────────────── */
const DealCard = ({ deal }) => {
    const hasDiscount = deal.discountPercent > 0;

    return (
        <Box
            sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: '#fff',
                border: '1px solid #E8EDF3',
                boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.25s ease, transform 0.25s ease',
                '&:hover': {
                    boxShadow: '0 12px 36px rgba(15,23,42,0.13)',
                    transform: 'translateY(-4px)',
                },
            }}
        >
            {/* Images */}
            <ImageGrid images={deal.images} title={deal.title} />

            {/* Content */}
            <Box sx={{ p: '18px 20px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Discount badge */}
                {hasDiscount && (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                        <Chip
                            icon={<LocalOfferIcon sx={{ fontSize: '13px !important' }} />}
                            label={`${deal.discountPercent}% OFF`}
                            size="small"
                            sx={{
                                bgcolor: '#ECFDF5',
                                color: '#059669',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                border: '1px solid #A7F3D0',
                                height: '22px',
                                letterSpacing: '0.3px',
                                '& .MuiChip-icon': { color: '#059669' },
                            }}
                        />
                    </Box>
                )}

                {/* Title */}
                <Typography
                    sx={{
                        fontFamily: "'DM Serif Display', serif",
                        fontSize: '1.15rem',
                        fontWeight: 400,
                        lineHeight: 1.3,
                        color: '#0F172A',
                        letterSpacing: '-0.2px',
                    }}
                >
                    {deal.title}
                </Typography>

                {/* Description */}
                {deal.description && (
                    <Typography
                        sx={{
                            fontSize: '0.83rem',
                            color: '#64748B',
                            lineHeight: 1.55,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {deal.description}
                    </Typography>
                )}

                {/* Spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Price row */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 1.5,
                        pt: 1.5,
                        borderTop: '1px solid #F1F5F9',
                        mt: 1,
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '1.35rem',
                            fontWeight: 800,
                            color: '#0F172A',
                            letterSpacing: '-0.5px',
                            fontFamily: "'DM Sans', sans-serif",
                        }}
                    >
                        ₹{deal.dealPrice}
                    </Typography>
                    {deal.price && (
                        <Typography
                            sx={{
                                fontSize: '0.9rem',
                                color: '#94A3B8',
                                textDecoration: 'line-through',
                                fontFamily: "'DM Sans', sans-serif",
                            }}
                        >
                            ₹{deal.price}
                        </Typography>
                    )}
                    {/* Image count pill */}
                    {deal.images && deal.images.length > 0 && (
                        <Box sx={{ ml: 'auto' }}>
                            <Typography
                                sx={{
                                    fontSize: '0.72rem',
                                    color: '#94A3B8',
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '20px',
                                    px: 1,
                                    py: 0.3,
                                    letterSpacing: '0.2px',
                                }}
                            >
                                {deal.images.length} photo{deal.images.length > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

/* ─── Page ────────────────────────────────────────────────────────── */
const ShopDealsPage = () => {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const { data: response, isLoading, error } = useGetShopDeals(shopId);

    const deals = response?.deals || [];

    useEffect(() => {
        if (!isLoading && !error && deals.length === 0) {
            navigate(`/shop/${shopId}/add-deals`, { replace: true });
        }
    }, [isLoading, error, deals.length, navigate, shopId]);

    if (isLoading) {
        return (
            <Box sx={{ mt: 14, textAlign: 'center' }}>
                <CircularProgress size={36} thickness={4} sx={{ color: '#0F172A' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 5 }}>
                <Alert severity="error">Failed to load deals. Please try again.</Alert>
            </Container>
        );
    }

    if (deals.length === 0) return null;

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#F8FAFC',
                py: { xs: 3, md: 5 },
                px: { xs: 2, sm: 3, md: 5 },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    maxWidth: 1400,
                    mx: 'auto',
                    mb: { xs: 3, md: 4 },
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        onClick={() => navigate('/owner-dashboard')}
                        sx={{
                            width: 38, height: 38,
                            borderRadius: '10px',
                            border: '1px solid #E2E8F0',
                            bgcolor: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#475569',
                            transition: 'all 0.2s',
                            '&:hover': { bgcolor: '#0F172A', color: '#fff', borderColor: '#0F172A' },
                        }}
                    >
                        <ArrowBackIcon sx={{ fontSize: '18px' }} />
                    </Box>
                    <Box>
                        <Typography
                            sx={{
                                fontFamily: "'DM Serif Display', serif",
                                fontSize: { xs: '1.6rem', md: '2rem' },
                                fontWeight: 400,
                                color: '#0F172A',
                                lineHeight: 1,
                                letterSpacing: '-0.5px',
                            }}
                        >
                            Shop Deals
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', mt: 0.4 }}>
                            {deals.length} active deal{deals.length !== 1 ? 's' : ''}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate(`/shop/${shopId}/add-deals`)}
                    sx={{
                        borderRadius: '10px',
                        bgcolor: '#0F172A',
                        color: '#fff',
                        px: 2.5,
                        py: 1.1,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        letterSpacing: '0.2px',
                        boxShadow: 'none',
                        '&:hover': {
                            bgcolor: '#1E293B',
                            boxShadow: '0 4px 16px rgba(15,23,42,0.25)',
                        },
                    }}
                >
                    Add Deal
                </Button>
            </Box>

            {/* Grid */}
            <Box
                sx={{
                    maxWidth: 1400,
                    mx: 'auto',
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)',
                        xl: 'repeat(4, 1fr)',
                    },
                    gap: { xs: 2.5, md: 3 },
                }}
            >
                {deals.map(deal => (
                    <DealCard key={deal._id} deal={deal} />
                ))}
            </Box>
        </Box>
    );
};

export default ShopDealsPage;
