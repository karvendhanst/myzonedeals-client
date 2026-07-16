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

  // Group deals by shopId so one marker shows all deals for that shop
  const shopGroups = useMemo(() => {
    const groups = {};
    deals.forEach((deal) => {
      if (!groups[deal.shopId]) {
        groups[deal.shopId] = {
          shopId: deal.shopId,
          shopName: deal.shopName,
          shopImage: deal.shopImage,
          latitude: deal.latitude,
          longitude: deal.longitude,
          deals: [],
        };
      }
      groups[deal.shopId].deals.push(deal);
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

        <MapSearch/>

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
                    <span className="dt-live">● LIVE</span>
                  </div>
                  <div className="dt-body">
                    <p className="dt-label">{group.deals.length} Active Deal{group.deals.length > 1 ? "s" : ""}</p>
                    {group.deals.map((deal) => (
                      <p key={deal._id} className="dt-deal">• {deal.description}</p>
                    ))}
                    <div className="dt-footer">
                      <span className="dt-active">Deal Active</span>
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