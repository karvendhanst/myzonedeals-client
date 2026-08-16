import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Avatar,
} from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PostAddIcon from "@mui/icons-material/PostAdd";
import useAuthStore from "../store/authStore";
import { useGetProfile } from "../hooks/useGetProfile";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation(); 
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();
  const { data: profileResponse } = useGetProfile();
  const profilePicture = profileResponse?.data?.profilePicture;

  const isOwnerDashboard = location.pathname === "/owner-dashboard"; 

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

    const navItems = [
    isOwnerDashboard
      ? { label: "Add Shop", path: "/add-shop", icon: <AddBusinessIcon /> }
      : { label: (token && token !== "null") ? "Dashboard" : "Shop Portal", path: (token && token !== "null") ? "/owner-dashboard" : "/shop-portal", icon: <StorefrontIcon /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ p: 0 ,  height: '100%', backgroundColor: "background.paper" }}>
      <Box sx={{
        p: 3,
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        justifyContent: 'center',
        mb: 2,
      }}>
        <Box sx={{
          backgroundColor: "secondary.main",
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LocalOfferIcon sx={{ color: "background.paper", fontSize: 18 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
          MyZoneDeals.
        </Typography>
      </Box>
      <List sx={{ px: 2 }}>
        {/* Post Something — top of mobile drawer */}
        {(token && token !== "null") && (
          <ListItem disablePadding sx={{ mb: 1.5 }}>
            <Button
              component={Link}
              to="/post"
              variant="contained"
              startIcon={<PostAddIcon />}
              fullWidth
              sx={{
                justifyContent: "center",
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 700,
                backgroundColor: 'secondary.main',
                color: '#fff',
                '& .MuiButton-startIcon': { color: '#fff' },
                '&:hover': { backgroundColor: '#E58D4D' },
              }}
            >
              <ListItemText
                primary="Post Something"
                primaryTypographyProps={{ fontWeight: 700, color: '#fff' }}
              />
            </Button>
          </ListItem>
        )}
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
            <Button
              component={Link}
              to={item.path}
              variant="contained"
              startIcon={item.icon || <StorefrontIcon />}
              fullWidth
              sx={{
                justifyContent: "center",
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: 'text.primary',
                '&:hover': { backgroundColor: '#1E293B' }
              }}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 600 }}
              />
            </Button>
          </ListItem>
        ))}
        {(token && token !== "null") && (
          <>
            <ListItem disablePadding sx={{ mb: 1 }}>
              <Button
                component={Link}
                to="/dealer-profile"
                variant="outlined"
                color="primary"
                startIcon={
                  profilePicture ? (
                    <Avatar src={profilePicture} sx={{ width: 24, height: 24 }} />
                  ) : (
                    <AccountCircleIcon />
                  )
                }
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  py: 1.5,
                  px: 2,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                My Profile
              </Button>
            </ListItem>
            <ListItem disablePadding sx={{ mb: 1 }}>
            <Button
  variant="outlined"
  color="error"
  startIcon={<LogoutIcon />}
  fullWidth
  onClick={handleLogout}
  sx={{
    justifyContent: "flex-start",
    py: 1.5,
    px: 2,
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
  }}
>
  Logout
</Button>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "background.paper",
          padding: { xs: "4px 12px", md: "8px 24px" },
          borderBottom: "1px solid #eee",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo Section */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
            }}
          >
            <Box
              sx={{
                backgroundColor: "secondary.main",
                width: { xs: 32, md: 40 },
                height: { xs: 32, md: 40 },
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalOfferIcon
                sx={{ color: "background.paper", fontSize: { xs: 18, md: 24 } }}
              />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              MyZoneDeals.
            </Typography>
          </Box>

          {/* Nav Links & Mobile Toggle */}
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 3 } }}>
            {!isMobile ? (
              <>
                {/* Post Something — primary CTA (visible only when logged in) */}
                {(token && token !== "null") && (
                  <Button
                    component={Link}
                    to="/post"
                    variant="contained"
                    startIcon={<PostAddIcon />}
                    sx={{
                      backgroundColor: "secondary.main",
                      color: "#fff",
                      "& .MuiButton-startIcon": { color: "#fff" },
                      borderRadius: "30px",
                      padding: "8px 20px",
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "0 4px 14px rgba(244, 162, 97, 0.24)",
                      "&:hover": { backgroundColor: "#E58D4D" },
                    }}
                  >
                    Post Something
                  </Button>
                )}

                <Button
                  component={Link}
                  to={isOwnerDashboard ? "/add-shop" : (token ? "/owner-dashboard" : "/shop-portal")}
                  variant="contained"
                  startIcon={isOwnerDashboard ? <AddBusinessIcon /> : <StorefrontIcon />}
                  sx={{
                    backgroundColor: "text.primary",
                    borderRadius: "30px",
                    padding: "8px 20px",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": { backgroundColor: "#1E293B" },
                  }}
                >
                  {isOwnerDashboard ? "Add Shop" : ((token && token !== "null") ? "Shop Deals" : "Shop Portal")}
                </Button>
                {(token && token !== "null") && (
                  <>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                      sx={{
                        borderRadius: "30px",
                        padding: "8px 20px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Logout
                    </Button>
                    <IconButton
                      component={Link}
                      to="/dealer-profile"
                      color="primary"
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {profilePicture ? (
                        <Avatar src={profilePicture} sx={{ width: 32, height: 32 }} />
                      ) : (
                        <AccountCircleIcon sx={{ fontSize: 32 }} />
                      )}
                    </IconButton>
                  </>
                )}
              </>
            ) : (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 300, height: '100%' },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
