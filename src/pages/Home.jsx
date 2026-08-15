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
import { useMapListings } from "../hooks/useListings";
import MapSearch from "../components/MapSearch";
import LocationModal from "../components/LocationModal";
import { useMap } from "react-leaflet";
import { Fab, Stack } from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import MarkerClusterGroup from "react-leaflet-cluster";

import L from "leaflet";

const DRAWER_BLEEDING = 70;

const createClusterCustomIcon = (cluster) => {
  const count = cluster.getChildCount();

  return L.divIcon({
    html: `
      <div class="custom-cluster">
        ${count}
      </div>
    `,
    className: "",
    iconSize: [56, 56],
  });
};

const CenterUpdater = ({ center }) => {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
};

const Home = () => {
  const { data: listings = [] } = useMapListings();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [mapType, setMapType] = useState("road");

  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem("userLocation");
    return saved ? JSON.parse(saved) : null;
  });

  const defaultCenter = [10.967287, 78.061949];
  const mapCenter = userLocation ? [userLocation.lat, userLocation.lon] : defaultCenter;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const mapGroups = useMemo(() => {
    const groups = {};
    const seenCoords = {};

    listings.forEach((listing) => {
      // Group by shopId if it's a shop, otherwise by coordinate
      const isShop = listing.source?.type === 'SHOP';
      const key = isShop && listing.shopId ? `shop_${listing.shopId}` : `coord_${listing.latitude}_${listing.longitude}`;
      
      if (!groups[key]) {
        const lat = Number(listing.latitude);
        const lng = Number(listing.longitude);
        const posKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        const count = seenCoords[posKey] ?? 0;
        seenCoords[posKey] = count + 1;

        const jitter = count * 0.00004;
        const angle = count * 2.4;
        const jLat = count === 0 ? lat : lat + jitter * Math.cos(angle);
        const jLng = count === 0 ? lng : lng + jitter * Math.sin(angle);

        groups[key] = {
          id: key,
          name: isShop ? listing.shopName : "Individual Listings",
          image: isShop ? listing.shopImage : null,
          latitude: jLat,
          longitude: jLng,
          listings: [],
        };
      }
      groups[key].listings.push(listing);
    });
    return Object.values(groups);
  }, [listings]);

  const selectedListing = selectedGroup
    ? selectedGroup.listings[selectedIndex]
    : null;

  const handleMarkerClick = (group) => {
    setSelectedGroup(group);
    setSelectedIndex(0);
    if (isMobile) setOpen(true);
  };

  const handleClose = () => {
    setSelectedGroup(null);
    setSelectedIndex(0);
    setOpen(false);
  };

  const getGroupLabel = (group) => {
    const discountDeals = group.listings.filter(
      (d) => d.metadata?.dealType === "discount" && typeof d.metadata?.dealPrice === "number"
    );
    if (discountDeals.length > 0) {
      const minPrice = Math.min(...discountDeals.map((d) => d.metadata.dealPrice));
      return `From ₹${minPrice}`;
    }
    if (group.listings.some((d) => d.metadata?.dealType === "bogo")) return "BOGO Deals";
    if (group.listings.some((d) => d.metadata?.dealType === "freebie")) return "Free Offers";
    return `${group.listings.length} item${group.listings.length > 1 ? 's' : ''}`;
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
            deal={selectedListing}
            allDeals={selectedGroup?.listings}
            selectedIndex={selectedIndex}
            onSelectDeal={setSelectedIndex}
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
            <Box
              sx={{
                width: 36,
                height: 4,
                bgcolor: "grey.300",
                borderRadius: 2,
                mb: 1,
              }}
            />
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}
            >
              {selectedGroup ? selectedGroup.name : "Tap a marker"}
            </Typography>
          </Box>
          <Box sx={{ height: "100%", overflowY: "auto" }}>
            <DealDetailPanel
              deal={selectedListing}
              allDeals={selectedGroup?.listings}
              selectedIndex={selectedIndex}
              onSelectDeal={setSelectedIndex}
              onClose={handleClose}
            />
          </Box>
        </SwipeableDrawer>
      )}

      {/* MAP */}
      <Box
        sx={{ flex: 1, position: "relative", height: "100%", width: "100%" }}
      >
        {/* Map type toggle — rendered outside MapContainer so it is never clipped */}
        <Stack
          spacing={1}
          sx={{
            position: "absolute",
            right: 16,
            bottom: { xs: DRAWER_BLEEDING + 16, md: 24 },
            zIndex: 1200,
          }}
        >
          <Fab
            size="small"
            color={mapType === "road" ? "primary" : "default"}
            onClick={() => setMapType("road")}
          >
            <MapIcon />
          </Fab>

          <Fab
            size="small"
            color={mapType === "satellite" ? "primary" : "default"}
            onClick={() => setMapType("satellite")}
          >
            <SatelliteAltIcon />
          </Fab>
        </Stack>

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
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: "#4ade80",
            }}
          />
          {mapGroups.length} location{mapGroups.length !== 1 ? "s" : ""}
        </Box>

        <MapContainer
          center={mapCenter}
          zoom={13}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <CenterUpdater center={mapCenter} />

          <TileLayer
            attribution={
              mapType === "road"
                ? "&copy; OpenStreetMap &copy; CARTO"
                : "Tiles © Esri"
            }
            url={
              mapType === "road"
                ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            }
          />

          <MapSearch />

          <ZoomControl position="topright" />

          <MarkerClusterGroup
            iconCreateFunction={createClusterCustomIcon}
            showCoverageOnHover={false}
            spiderLegPolylineOptions={{
              weight: 2.5,
              color: "#F4A261",
              opacity: 0.75,
              lineCap: "round",
              lineJoin: "round",
            }}
            zoomToBoundsOnClick={true}
            animate={true}
            maxClusterRadius={60}
          >
            {mapGroups.map((group) => (
              <Marker
                key={group.id}
                position={[Number(group.latitude), Number(group.longitude)]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(group),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -20]}
                  opacity={1}
                  permanent={false}
                >
                  <div className="dt-card">
                    <div className="dt-header">
                      {group.image && (
                        <div className="dt-logo">
                          <img
                            src={group.image}
                            alt={group.name}
                            width="100%"
                            height="100%"
                          />
                        </div>
                      )}
                      <div>
                        <p className="dt-name">{group.name}</p>
                        <p className="dt-type">{group.listings[0]?.categoryName || group.listings[0]?.listingType}</p>
                      </div>
                      <span
                        className="dt-live"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "2px",
                        }}
                      >
                        <FiberManualRecordIcon sx={{ fontSize: 10 }} /> LIVE
                      </span>
                    </div>
                    <div className="dt-body">
                      <p className="dt-label">
                        {getGroupLabel(group)}
                      </p>
                      <div className="dt-footer">
                        <span className="dt-active">Tap for details</span>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
        <LocationModal open={!userLocation} onLocationSelect={setUserLocation} />
      </Box>
    </Box>
  );
};

export default Home;
