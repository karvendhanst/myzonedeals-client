import React, { useState, useRef, useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { Box, InputBase, Paper, List, ListItemButton, ListItemText, CircularProgress } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const MapSearch = () => {
  const map = useMap();
  const placesLib = useMapsLibrary("places");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  useEffect(() => {
    if (placesLib) {
      autocompleteServiceRef.current = new placesLib.AutocompleteService();
      // PlacesService requires a map instance or dummy element
      if (map) {
        placesServiceRef.current = new placesLib.PlacesService(map);
      }
    }
  }, [placesLib, map]);

  const fetchResults = (value) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    if (!autocompleteServiceRef.current) {
      return;
    }

    setLoading(true);
    autocompleteServiceRef.current.getPlacePredictions(
      { input: value },
      (predictions, status) => {
        setLoading(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          setResults(predictions);
        } else {
          setResults([]);
        }
      }
    );
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 350);
  };

  const handleSelect = (place) => {
    setQuery(place.description);
    setResults([]);

    if (placesServiceRef.current && place.place_id) {
      placesServiceRef.current.getDetails(
        { placeId: place.place_id, fields: ["geometry"] },
        (details, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            details?.geometry?.location &&
            map
          ) {
            const loc = details.geometry.location;
            map.panTo(loc);
            map.setZoom(15);
          }
        }
      );
    }
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
        zIndex: 10,
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
          boxShadow: 2,
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
                  primary={place.structured_formatting?.main_text || place.description}
                  secondary={place.structured_formatting?.secondary_text}
                  primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                  secondaryTypographyProps={{ fontSize: 12 }}
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