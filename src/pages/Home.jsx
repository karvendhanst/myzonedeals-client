import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import {
  Box,
  SwipeableDrawer,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import DealDetailPanel from "../components/DealDetailPanel";
import "../styles/map.css";
import { CLEAN_MAP_STYLES } from "../styles/mapStyles";
import { PinMarkerContent } from "../components/pinIcon";
import CustomOverlay from "../components/CustomOverlay";
import LocationModal from "../components/LocationModal";
import { useGetMapDeals } from "../hooks/useGetMapDeals";
import { MOBILE_SHEET_HEIGHT } from "../styles/mobileSheet";

const DRAWER_BLEEDING = 70;

const toValidCoordinate = (value, min, max) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

// Component to dynamically pan camera when center prop updates
const CenterUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [center, map]);
  return null;
};

// Component to switch map type imperatively
const MapTypeUpdater = ({ mapType }) => {
  const map = useMap();
  useEffect(() => {
    if (map) map.setMapTypeId(mapType);
  }, [map, mapType]);
  return null;
};

// Custom Cluster Renderer matching our previous CSS custom cluster badge
const customClusterRenderer = {
  render: ({ count, position }) => {
    const clusterDiv = document.createElement("div");
    clusterDiv.className = "custom-cluster";
    clusterDiv.innerHTML = `<span>${count}</span>`;

    return new window.google.maps.marker.AdvancedMarkerElement({
      position,
      content: clusterDiv,
      zIndex: 1000 + count,
    });
  },
};

// Custom Deal Markers overlay
const DealMarkers = ({ mapGroups, selectedGroup, onMarkerClick }) => {
  return (
    <>
      {mapGroups.map((group) => (
        <CustomOverlay
          key={group.id}
          position={{ lat: Number(group.latitude), lng: Number(group.longitude) }}
          onClick={() => onMarkerClick(group)}
        >
          <PinMarkerContent
            group={group}
            isActive={selectedGroup?.id === group.id}
          />
        </CustomOverlay>
      ))}
    </>
  );
};

const Home = () => {
  const { data: mapDeals = [] } = useGetMapDeals();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [mapType, setMapType] = useState("roadmap");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapBoxRef = useRef(null);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem("userLocation");
    return saved ? JSON.parse(saved) : null;
  });

  const defaultCenter = useMemo(() => ({ lat: 10.967287, lng: 78.061949 }), []);
  const userLat = toValidCoordinate(userLocation?.lat, -90, 90);
  const userLon = toValidCoordinate(userLocation?.lon, -180, 180);
  const mapCenter = useMemo(() => {
    return userLat !== null && userLon !== null
      ? { lat: userLat, lng: userLon }
      : defaultCenter;
  }, [userLat, userLon, defaultCenter]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const mapGroups = useMemo(() => {
    const groups = {};
    const seenCoords = {};
    const mapItems = [
      ...mapDeals.map((deal) => ({
        _id: deal._id,
        listingType: "DEAL",
        title: deal.title,
        description: deal.description,
        media: deal.images ?? [],
        source: { type: "SHOP" },
        shopId: deal.shopId,
        shopName: deal.shopName,
        shopImage: deal.shopImage,
        categoryName: deal.category,
        latitude: deal.latitude,
        longitude: deal.longitude,
        metadata: {
          dealType: deal.dealType,
          price: deal.price,
          dealPrice: deal.dealPrice,
          discountPercent: deal.discountPercent,
          bogoDetails: deal.bogoDetails,
          freebieDetails: deal.freebieDetails,
        },
      })),
    ];

    mapItems.forEach((listing) => {
      const lat = toValidCoordinate(listing.latitude, -90, 90);
      const lng = toValidCoordinate(listing.longitude, -180, 180);

      if (lat === null || lng === null) return;

      const isShop = listing.source?.type === "SHOP";
      const key = isShop && listing.shopId ? `shop_${listing.shopId}` : `coord_${listing.latitude}_${listing.longitude}`;

      if (!groups[key]) {
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
  }, [mapDeals]);

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

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    const el = mapBoxRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.() ||
        el.webkitRequestFullscreen?.() ||
        el.mozRequestFullScreen?.();
    } else {
      document.exitFullscreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.mozCancelFullScreen?.();
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  // Inject button animation styles once
  useEffect(() => {
    if (document.getElementById("map-btn-styles")) return;
    const s = document.createElement("style");
    s.id = "map-btn-styles";
    s.textContent = `
      .map-icon-btn {
        transition: transform 0.18s cubic-bezier(.34,1.56,.64,1),
                    box-shadow 0.18s ease,
                    background 0.18s ease;
      }
      .map-icon-btn:hover {
        transform: scale(1.12);
        box-shadow: 0 6px 24px rgba(0,0,0,0.38) !important;
      }
      .map-icon-btn:active { transform: scale(0.93); }
      .map-icon-btn svg { display: block; }
    `;
    document.head.appendChild(s);
  }, []);

  return (
    <APIProvider
      apiKey={apiKey}
      libraries={["places", "marker", "geometry", "routes"]}
    >
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
                height: `calc(${MOBILE_SHEET_HEIGHT} - ${DRAWER_BLEEDING}px)`,
                overflow: "visible",
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
          ref={mapBoxRef}
          sx={{ flex: 1, position: "relative", height: "100%", width: "100%" }}
        >
          <Map
            defaultCenter={mapCenter}
            defaultZoom={13}
            styles={mapType === "roadmap" ? CLEAN_MAP_STYLES : []}
            disableDefaultUI={false}
            zoomControl={true}
            streetViewControl={false}
            mapTypeControl={false}
            style={{ height: "100%", width: "100%" }}
          >
            <CenterUpdater center={mapCenter} />
            <MapTypeUpdater mapType={mapType} />
            <DealMarkers
              mapGroups={mapGroups}
              selectedGroup={selectedGroup}
              onMarkerClick={handleMarkerClick}
            />
          </Map>

          {/* ── Fullscreen toggle ── */}
          <button
            className="map-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 10,
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.35)",
              padding: 0,
            }}
          >
            {isFullscreen ? (
              /* Compress / exit-fullscreen icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="8 3 3 3 3 8" />
                <line x1="3" y1="3" x2="9" y2="9" />
                <polyline points="16 3 21 3 21 8" />
                <line x1="21" y1="3" x2="15" y2="9" />
                <polyline points="8 21 3 21 3 16" />
                <line x1="3" y1="21" x2="9" y2="15" />
                <polyline points="16 21 21 21 21 16" />
                <line x1="21" y1="21" x2="15" y2="15" />
              </svg>
            ) : (
              /* Expand / enter-fullscreen icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            )}
          </button>

          {/* Satellite / Road toggle button */}
          <button
            onClick={() => setMapType((t) => t === "roadmap" ? "satellite" : "roadmap")}
            title={mapType === "roadmap" ? "Switch to Satellite" : "Switch to Map"}
            style={{
              position: "absolute",
              bottom: 120,
              right: 10,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              width: 52,
              height: 52,
              borderRadius: 10,
              border: "2px solid rgba(255,255,255,0.9)",
              cursor: "pointer",
              padding: 0,
              overflow: "hidden",
              boxShadow: "0 2px 10px rgba(0,0,0,0.28)",
              background: "none",
            }}
          >
            {mapType === "roadmap" ? (
              /* Show satellite thumbnail when in road mode */
              <>
                <img
                  src="https://maps.gstatic.com/tactile/layerswitcher/ic_satellite-1x.png"
                  alt="Satellite"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div style={{
                  display: "none", position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, #1a3a5c 0%, #0d2137 100%)",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.3,
                }}>SAT</div>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "rgba(0,0,0,0.55)",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                  textAlign: "center", padding: "3px 0", letterSpacing: 0.3,
                }}>Satellite</div>
              </>
            ) : (
              /* Show map thumbnail when in satellite mode */
              <>
                <img
                  src="https://maps.gstatic.com/tactile/layerswitcher/ic_default-1x.png"
                  alt="Map"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div style={{
                  display: "none", position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: "#2e7d32", letterSpacing: 0.3,
                }}>MAP</div>
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "rgba(0,0,0,0.55)",
                  fontSize: 9, fontWeight: 700, color: "#fff",
                  textAlign: "center", padding: "3px 0", letterSpacing: 0.3,
                }}>Map</div>
              </>
            )}
          </button>

          <LocationModal
            open={!userLocation}
            onLocationSelect={setUserLocation}
          />
        </Box>
      </Box>
    </APIProvider>
  );
};

export default Home;
