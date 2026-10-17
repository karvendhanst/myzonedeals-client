// Map styling: ONLY show roads and location/area names.
// All POIs (temples, shops, schools, hospitals, parks, transit) are completely hidden.
export const CLEAN_MAP_STYLES = [
  // ── Hide ALL points of interest (temples, shops, parks, hospitals, etc.) ──
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  // ── Hide transit (bus stops, train stations, metro) ──
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  // ── Roads: keep geometry + labels ──
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "road",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  // ── Keep city / town / village / neighborhood names ──
  {
    featureType: "administrative",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "administrative.neighborhood",
    elementType: "labels",
    stylers: [{ visibility: "on" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];
