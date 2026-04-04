import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import { Box, SwipeableDrawer, useMediaQuery, useTheme, GlobalStyles, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import "../styles/map.css";
import { customIcon } from "../components/pinIcon";

const shop = {
  name: "Madras Bakery",
  offer: "Tea 50% OFF ( ₹5 only )",
  lat: 11.122705,
  lng: 78.231454,
};

const DRAWER_BLEEDING = 56;

const Home = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: { xs: "calc(100vh - 56px)", md: "calc(100vh - 72px)" },
        width: "100%",
        overflow: "hidden",
        bgcolor: 'background.default',
        position: 'relative'
      }}
    >
      <GlobalStyles
        styles={{
          '.MuiDrawer-root > .MuiPaper-root': {
            height: `calc(70% - ${DRAWER_BLEEDING}px)`,
            overflow: 'visible',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      />

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Box sx={{ borderRight: "1px solid rgba(0,0,0,0.05)" }}>
          <Sidebar />
        </Box>
      )}

      {/* MOBILE BOTTOM SHEET */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={toggleDrawer(false)}
          onOpen={toggleDrawer(true)}
          swipeAreaWidth={DRAWER_BLEEDING}
          disableSwipeToOpen={false}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              boxShadow: '0 -4px 20px rgba(0,0,0,0.08)'
            }
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -DRAWER_BLEEDING,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              visibility: 'visible',
              right: 0,
              left: 0,
              bgcolor: 'background.paper',
              height: DRAWER_BLEEDING,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: open ? 'none' : '0 -2px 10px rgba(0,0,0,0.05)'
            }}
            onClick={toggleDrawer(!open)}
          >
            <Box
              sx={{
                width: 30,
                height: 4,
                bgcolor: 'grey.300',
                borderRadius: 2,
                position: 'absolute',
                top: 8
              }}
            />
            <Typography sx={{ fontWeight: 700, mt: 1, color: 'primary.main' }}>
              Nearest Deals
            </Typography>
          </Box>
          <Box sx={{ height: '100%', overflow: 'auto' }}>
            <Sidebar isMobile={true} hideTitle={true} />
          </Box>
        </SwipeableDrawer>
      )}

      {/* RIGHT MAP SECTION */}
      <Box sx={{ flex: 1, position: 'relative', height: '100%', width: '100%' }}>
        <MapContainer
          center={[shop.lat, shop.lng]}
          zoom={13}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap &copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <ZoomControl position="topright" />

          <Marker position={[shop.lat, shop.lng]} icon={customIcon}>
            <Popup>
              <div>
                <h3>{shop.name}</h3>
                <p>{shop.offer}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </Box>
    </Box >
  );
};

export default Home;
