import React, { useState, useRef } from "react";
import { useMap } from "react-leaflet";
import { Box, InputBase, Paper, List, ListItemButton, ListItemText, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const MapSearch = () => {
  const map = useMap();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchResults = async (value) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(
          value
        )}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Geocoding error:", err);
      setResults([]);
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

  const handleSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);
    map.flyTo([lat, lon], 15, { duration: 1.2 });
    setQuery(place.display_name);
    setResults([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 1000,
        width: { xs: "calc(100% - 24px)", sm: 320 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          py: 1,
          borderRadius: 2,
          backgroundColor: "background.paper",
          border: 1,
    borderColor: "secondary.main",
        }}
      >
        <SearchIcon sx={{ color: "text.secondary", mr: 1 }} fontSize="small" />
        <InputBase
          placeholder="Search a place..."
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          fullWidth
          sx={{ fontSize: 14 }}
        />
        {loading && <CircularProgress size={16} />}
      </Box>

      {results.length > 0 && (
        <Paper elevation={3} sx={{ mt: 0.5, borderRadius: 2, overflow: "hidden" }}>
          <List dense disablePadding>
            {results.map((place) => (
              <ListItemButton key={place.place_id} onClick={() => handleSelect(place)}>
                <ListItemText
                  primary={place.display_name}
                  primaryTypographyProps={{ fontSize: 13 }}
                />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default MapSearch;