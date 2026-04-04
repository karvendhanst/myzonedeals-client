import React, { useState } from 'react';
import { Box, Typography, Button, Container, Paper, Grid, Card, CardMedia, CardContent, Chip, CircularProgress, Alert, CardActionArea, Snackbar } from '@mui/material';
import { useGetMyShops } from '../hooks/useGetMyShops';
import { useNavigate } from 'react-router-dom';

const DealerDashboard = () => {
    const navigate = useNavigate();
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const { data: response, isLoading, error } = useGetMyShops();
    const shops = response?.data || [];

    return (
        <Container maxWidth={false} sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 }, maxWidth: 1400 }}>
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 4 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    borderRadius: '16px',
                    border: '1px solid #eee'
                }}
            >
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontFamily: "'DM Serif Display', serif",
                            fontSize: { xs: '1.75rem', md: '2.125rem' }
                        }}
                    >
                        Dealer Portal
                    </Typography>
                   
                </Box>

                <Typography variant="body1" color="text.secondary">
                    Welcome to your Dealer portal. Select a verified shop to add an offer.
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>My Shops</Typography>
                    
                    {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
                    
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            Failed to load shops. Please try again later.
                        </Alert>
                    )}

                    {!isLoading && !error && shops.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#F8F9FA', borderRadius: '12px', border: '1px solid #E9ECEF' }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                You haven't added any shops yet.
                            </Typography>
                            <Button variant="outlined" onClick={() => navigate('/add-shop')}>
                                Add Your First Shop
                            </Button>
                        </Box>
                    )}

                    {!isLoading && shops.length > 0 && (
                        <Grid container spacing={3}>
                            {shops.map((shop) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={shop._id}>
                                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                        <CardActionArea 
                                            sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                                            onClick={() => {
                                                if (shop.isVerified) {
                                                    navigate(`/shop/${shop._id}/deals`);
                                                } else {
                                                    setToastMessage("Please wait for this shop to be verified before adding offers.");
                                                    setToastOpen(true);
                                                }
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="180"
                                                image={shop.shopImage || 'https://via.placeholder.com/300x200?text=No+Image'}
                                                alt={shop.name}
                                                sx={{ objectFit: 'cover', width: '100%' }}
                                            />
                                            <CardContent sx={{ flexGrow: 1, width: '100%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                    <Typography gutterBottom variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                                        {shop.name}
                                                    </Typography>
                                                    <Chip 
                                                        label={shop.isVerified ? "Verified" : "Pending"} 
                                                        color={shop.isVerified ? "success" : "warning"} 
                                                        size="small" 
                                                        sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                                                    />
                                                </Box>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                    {shop.category}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                                    📍 {shop.address?.street}, {shop.address?.city}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Paper>

            <Snackbar 
                open={toastOpen} 
                autoHideDuration={4000} 
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setToastOpen(false)} severity="warning" variant="filled" sx={{ width: '100%' }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default DealerDashboard;

