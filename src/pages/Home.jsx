import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import {
  Box,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
  GlobalStyles,
  Typography,
} from "@mui/material";
import DealDetailPanel from "../components/DealDetailPanel";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import "../styles/map.css";
import { customIcon } from "../components/pinIcon";
import { useGetMapDeals } from "../hooks/useGetMapDeals";
import MapSearch from "../components/MapSearch";

const DRAWER_BLEEDING = 64;

const Home = () => {
  const { data: deals = [] } = useGetMapDeals();
  const [selectedShopDeals, setSelectedShopDeals] = useState(null);
  const [selectedDealIndex, setSelectedDealIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));


  const shopGroups = useMemo(() => {
    const groups = {};
    const seenCoords = {}; 

    deals.forEach((deal) => {
      const key = String(deal.shopId);
      if (!groups[key]) {
        const lat = Number(deal.latitude);
        const lng = Number(deal.longitude);
        const posKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        const count = seenCoords[posKey] ?? 0;
        seenCoords[posKey] = count + 1;

        // Apply a tiny spiral jitter (~3–5 m) so coincident markers don't stack
        const jitter = count * 0.00004;
        const angle = count * 2.4; // golden-angle spread
        const jLat = count === 0 ? lat : lat + jitter * Math.cos(angle);
        const jLng = count === 0 ? lng : lng + jitter * Math.sin(angle);

        groups[key] = {
          shopId: key,
          shopName: deal.shopName,
          shopImage: deal.shopImage,
          latitude: jLat,
          longitude: jLng,
          deals: [],
        };
      }
      groups[key].deals.push(deal);
    });
    return Object.values(groups);
  }, [deals]);

  const selectedDeal =
    selectedShopDeals ? selectedShopDeals.deals[selectedDealIndex] : null;

  const handleMarkerClick = (shopGroup) => {
    setSelectedShopDeals(shopGroup);
    setSelectedDealIndex(0);
    if (isMobile) setOpen(true);
  };

  const handleClose = () => {
    setSelectedShopDeals(null);
    setSelectedDealIndex(0);
    setOpen(false);
  };


  const bestPriceFor = (group) =>
    Math.min(...group.deals.map((d) => d.dealPrice));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: { xs: "calc(100vh - 56px)", md: "calc(100vh - 72px)" },
        width: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
        position: "relative",
      }}
    >
      <GlobalStyles
        styles={{
          ".MuiDrawer-root > .MuiPaper-root": {
            height: `calc(85% - ${DRAWER_BLEEDING}px)`,
            overflow: "visible",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          },
        }}
      />

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <Box
          sx={{
            width: 380,
            height: "100%",
            borderRight: "1px solid rgba(0,0,0,0.06)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <DealDetailPanel
            deal={selectedDeal}
            allDeals={selectedShopDeals?.deals}
            selectedIndex={selectedDealIndex}
            onSelectDeal={setSelectedDealIndex}
            onClose={handleClose}
          />
        </Box>
      )}

      {/* MOBILE BOTTOM DRAWER */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          onOpen={() => setOpen(true)}
          swipeAreaWidth={DRAWER_BLEEDING}
          disableSwipeToOpen={true}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
            },
          }}
        >
          {/* Drag handle bar */}
          <Box
            sx={{
              position: "absolute",
              top: -DRAWER_BLEEDING,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              right: 0,
              left: 0,
              bgcolor: "background.paper",
              height: DRAWER_BLEEDING,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
            }}
            onClick={handleClose}
          >
            <Box sx={{ width: 36, height: 4, bgcolor: "grey.300", borderRadius: 2, mb: 1 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
              {selectedDeal ? selectedDeal.shopName : "Tap a marker"}
            </Typography>
          </Box>
          <Box sx={{ height: "100%", overflowY: "auto" }}>
            <DealDetailPanel
              deal={selectedDeal}
              allDeals={selectedShopDeals?.deals}
              selectedIndex={selectedDealIndex}
              onSelectDeal={setSelectedDealIndex}
              onClose={handleClose}
            />
          </Box>
        </SwipeableDrawer>
      )}

      {/* MAP */}
      <Box sx={{ flex: 1, position: "relative", height: "100%", width: "100%" }}>

        <Box
          sx={{
            position: "absolute",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 700,
            bgcolor: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            px: 1.6,
            py: 0.6,
            borderRadius: "20px",
            display: "flex",
            alignItems: "center",
            gap: 0.7,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ade80" }} />
          {shopGroups.length} shop{shopGroups.length !== 1 ? "s" : ""} with live deals
        </Box>

        <MapContainer
          center={[10.967287, 78.061949]}
          zoom={13}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap &copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          <MapSearch />

          <ZoomControl position="topright" />

          {shopGroups.map((group) => (
            <Marker
              key={group.shopId}
              position={[Number(group.latitude), Number(group.longitude)]}
              icon={customIcon}
              eventHandlers={{
                click: () => handleMarkerClick(group),
              }}
            >

              <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
                <div className="dt-card">
                  <div className="dt-header">
                    <div className="dt-logo">
                      <img src={group.shopImage} alt={group.shopName} width="100%" height="100%" />
                    </div>
                    <div>
                      <p className="dt-name">{group.shopName}</p>
                      <p className="dt-type">{group.deals[0]?.category}</p>
                    </div>
                    <span className="dt-live" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><FiberManualRecordIcon sx={{ fontSize: 10 }} /> LIVE</span>
                  </div>
                  <div className="dt-body">
                    <p className="dt-label">
                      From ₹{bestPriceFor(group)} · {group.deals.length} deal
                      {group.deals.length > 1 ? "s" : ""}
                    </p>
                    <div className="dt-footer">
                      <span className="dt-active">Tap for details</span>
                    </div>
                  </div>
                </div>
              </Tooltip>

              
            </Marker>
          ))}
        </MapContainer>
      </Box>
    </Box>
  );
};

export default Home;