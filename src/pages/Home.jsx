import React, { useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
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
import { getMapIcon } from "../components/pinIcon";
import { useMapListings } from "../hooks/useListings";
import MapSearch from "../components/MapSearch";
import LocationModal from "../components/LocationModal";
import { useMap } from "react-leaflet";
import { useGetMapDeals } from "../hooks/useGetMapDeals";
import MarkerClusterGroup from "react-leaflet-cluster";

import L from "leaflet";

const DRAWER_BLEEDING = 70;

const toValidCoordinate = (value, min, max) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : null;
};

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
  const { data: mapDeals = [] } = useGetMapDeals();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem("userLocation");
    return saved ? JSON.parse(saved) : null;
  });

  const defaultCenter = [10.967287, 78.061949];
  const userLat = toValidCoordinate(userLocation?.lat, -90, 90);
  const userLon = toValidCoordinate(userLocation?.lon, -180, 180);
  const mapCenter = userLat !== null && userLon !== null
    ? [userLat, userLon]
    : defaultCenter;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const mapGroups = useMemo(() => {
    const groups = {};
    const seenCoords = {};
    const mapItems = [
      ...listings.map((listing) => ({
        ...listing,
        // The no-geo map response returns coordinates nested in location.
        // Existing listing records store them as [latitude, longitude].
        latitude: listing.latitude ?? listing.location?.coordinates?.[0],
        longitude: listing.longitude ?? listing.location?.coordinates?.[1],
        profilePicture: listing.profilePicture ?? listing.owner?.userId?.profilePicture,
        ownerName: listing.ownerName ?? listing.owner?.userId?.name,
      })),
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

      // Deal/shop records without coordinates cannot be rendered by Leaflet.
      if (lat === null || lng === null) return;

      // Group by shopId if it's a shop, otherwise by coordinate
      const isShop = listing.source?.type === 'SHOP';
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
  }, [listings, mapDeals]);

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

  const _getGroupLabel = (group) => {
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

      

        <MapContainer
          center={mapCenter}
          zoom={13}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <CenterUpdater center={mapCenter} />

          <TileLayer
            attribution="&copy; OpenStreetMap &copy; CARTO"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
/> */}

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
                icon={getMapIcon(group, selectedGroup?.id === group.id)}
                eventHandlers={{
                  click: () => handleMarkerClick(group),
                }}
              />
            ))}
          </MarkerClusterGroup>
        </MapContainer>
        <LocationModal open={!userLocation} onLocationSelect={setUserLocation} />
      </Box>
    </Box>
  );
};

export default Home;
