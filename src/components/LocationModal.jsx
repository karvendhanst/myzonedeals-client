import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Typography,
  IconButton,
  Divider,
} from "@mui/material";
import SearchRounded from "@mui/icons-material/SearchRounded";
import PlaceRounded from "@mui/icons-material/PlaceRounded";
import MyLocationRounded from "@mui/icons-material/MyLocationRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";

/* ----------------------------------------------------------------------- */
/*  Design tokens — matches the rest of the dealer app                     */
/* ----------------------------------------------------------------------- */

const T = {
  ink: "#0F172A",
  ink2: "#1E293B",
  accent: "#F4A261",
  surface: "#FFFFFF",
  surfaceMuted: "#F8FAFC",
  border: "#E5E9F0",
  borderStrong: "#CBD5E1",
  textPrimary: "#111827",
  textSecondary: "#64748B",
  textFaint: "#94A3B8",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  radius: 18,
  radiusSm: 12,
  font: '"Plus Jakarta Sans", "Inter", sans-serif',
};

/* ----------------------------------------------------------------------- */
/*  Helpers                                                                 */
/* ----------------------------------------------------------------------- */

// Splits "Koramangala, Bengaluru, Karnataka, 560034, India" into a bold
// primary line and a muted secondary line, so results scan faster.
const splitPlaceName = (displayName = "") => {
  const parts = displayName.split(",").map((p) => p.trim());
  const primary = parts[0] || displayName;
  const secondary = parts.slice(1, 4).join(", ");
  return { primary, secondary };
};

const LocationModal = ({ open, onLocationSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError("");
      setActiveIndex(-1);
    }
  }, [open]);

  const fetchResults = async (value) => {
    if (!value.trim()) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(
          value
        )}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      setResults(data);
      setActiveIndex(-1);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Geocoding error:", err);
        setError("Couldn't search right now. Check your connection and try again.");
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 400);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setError("");
    setActiveIndex(-1);
  };

  const commitLocation = (locationData) => {
    try {
      localStorage.setItem("userLocation", JSON.stringify(locationData));
    } catch (err) {
      console.error("Couldn't persist location:", err);
    }
    onLocationSelect(locationData);
  };

  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    commitLocation({ lat, lon, name: place.display_name });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support location detection.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          commitLocation({
            lat: latitude,
            lon: longitude,
            name: data?.display_name || "Current location",
          });
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          commitLocation({ lat: latitude, lon: longitude, name: "Current location" });
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Couldn't access your location. Allow location access, or search instead.");
        setLocating(false);
      }
    );
  };

  const handleKeyDown = (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      handleSelect(results[activeIndex >= 0 ? activeIndex : 0]);
    }
  };

  const showEmptyState = !loading && !error && query.trim().length > 1 && results.length === 0;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: `${T.radius}px`, fontFamily: T.font } }}
    >
      <DialogTitle sx={{ textAlign: "center", fontWeight: 800, fontFamily: T.font, pb: 0.5, pt: 3.5 }}>
        Where are you located?
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, pb: 3.5 }}>
        <Typography
          variant="body2"
          sx={{ color: T.textSecondary, mb: 2.5, textAlign: "center", fontFamily: T.font }}
        >
          Enter your city or area so we can show deals near you.
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: 1.75,
            py: 1,
            borderRadius: `${T.radiusSm}px`,
            backgroundColor: T.surfaceMuted,
            border: `1.5px solid ${T.border}`,
            transition: "border-color 120ms ease",
            "&:focus-within": { borderColor: T.ink },
          }}
        >
          <SearchRounded sx={{ color: T.textFaint, mr: 1 }} fontSize="small" />
          <InputBase
            placeholder="Search your city or area…"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            fullWidth
            sx={{ fontSize: 15, fontFamily: T.font, color: T.textPrimary }}
            autoFocus
          />
          {loading && <CircularProgress size={18} thickness={5} sx={{ color: T.textFaint, mr: query ? 0.5 : 0 }} />}
          {!loading && query && (
            <IconButton size="small" onClick={handleClear} sx={{ color: T.textFaint }}>
              <CloseRounded sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>

        {error && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: `${T.radiusSm}px`,
              bgcolor: T.dangerBg,
              border: "1px solid #FCE4E4",
            }}
          >
            <ErrorOutlineRounded sx={{ fontSize: 17, color: T.danger }} />
            <Typography variant="body2" sx={{ color: T.danger, fontFamily: T.font, fontSize: 13 }}>
              {error}
            </Typography>
          </Box>
        )}

        {results.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              borderRadius: `${T.radiusSm}px`,
              border: `1px solid ${T.border}`,
              overflow: "hidden",
            }}
          >
            <List dense disablePadding>
              {results.map((place, i) => {
                const { primary, secondary } = splitPlaceName(place.display_name);
                const active = i === activeIndex;
                return (
                  <ListItemButton
                    key={place.place_id}
                    onClick={() => handleSelect(place)}
                    onMouseEnter={() => setActiveIndex(i)}
                    selected={active}
                    sx={{
                      py: 1.1,
                      "&.Mui-selected": { bgcolor: T.surfaceMuted },
                      "&.Mui-selected:hover": { bgcolor: T.surfaceMuted },
                      "&:hover": { bgcolor: T.surfaceMuted },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <PlaceRounded sx={{ fontSize: 18, color: T.textFaint }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={primary}
                      secondary={secondary || undefined}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: T.font,
                        color: T.textPrimary,
                      }}
                      secondaryTypographyProps={{
                        fontSize: 12.5,
                        fontFamily: T.font,
                        color: T.textSecondary,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        )}

        {showEmptyState && (
          <Typography
            variant="body2"
            sx={{ color: T.textFaint, textAlign: "center", mt: 2.5, fontFamily: T.font }}
          >
            No matches for "{query}". Try a different spelling or a nearby landmark.
          </Typography>
        )}

        <Divider sx={{ my: 2.5, borderColor: T.border }}>
          <Typography variant="caption" sx={{ color: T.textFaint, fontFamily: T.font, px: 1 }}>
            or
          </Typography>
        </Divider>

        <Box
          onClick={locating ? undefined : handleUseCurrentLocation}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            py: 1.25,
            borderRadius: "999px",
            border: `1.5px solid ${T.ink}`,
            color: T.ink,
            fontFamily: T.font,
            fontWeight: 700,
            fontSize: 14,
            cursor: locating ? "default" : "pointer",
            opacity: locating ? 0.6 : 1,
            transition: "background-color 120ms ease",
            "&:hover": locating ? {} : { bgcolor: T.surfaceMuted },
          }}
        >
          {locating ? (
            <CircularProgress size={16} thickness={5} sx={{ color: T.ink }} />
          ) : (
            <MyLocationRounded sx={{ fontSize: 17 }} />
          )}
          {locating ? "Finding you…" : "Use my current location"}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;