import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton, Button, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";
import ShareIcon from "@mui/icons-material/Share";
import DirectionsIcon from "@mui/icons-material/Directions";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";

/* ─── tiny pulse keyframe injected once ─── */
const PULSE_STYLE = `
@keyframes dpPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.55; transform: scale(0.85); }
}
@keyframes dpSlideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes dpFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
`;

if (typeof document !== "undefined" && !document.getElementById("dp-styles")) {
  const s = document.createElement("style");
  s.id = "dp-styles";
  s.textContent = PULSE_STYLE;
  document.head.appendChild(s);
}

/* ─── EMPTY STATE ─── */
const EmptyState = () => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
      px: 4,
      bgcolor: "background.default",
      animation: "dpFadeIn 0.4s ease",
    }}
  >
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: "24px",
        background: "linear-gradient(135deg, #0F172A 0%, #1e2d47 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 34,
        boxShadow: "0 12px 40px rgba(15,23,42,0.18)",
      }}
    >
      🏷️
    </Box>
    <Typography
      sx={{
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontWeight: 700,
        fontSize: 16,
        color: "text.primary",
        textAlign: "center",
      }}
    >
      No deal selected
    </Typography>
    <Typography
      sx={{
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        fontSize: 13,
        color: "text.secondary",
        textAlign: "center",
        lineHeight: 1.6,
      }}
    >
      Tap a marker on the map to explore live deals near you
    </Typography>
  </Box>
);

/* ─── MAIN COMPONENT ─── */
const DealDetailPanel = ({ deal, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [deal?.id ?? deal?.title]);

  if (!deal) return <EmptyState />;

  const savings = deal.price - deal.dealPrice;
  const discountPct = deal.discountPercent ?? Math.round((savings / deal.price) * 100);

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        /* hide scrollbar but keep scroll */
        "&::-webkit-scrollbar": { width: 0 },
        scrollbarWidth: "none",
      }}
    >
      {/* ── HERO IMAGE ── */}
      <Box sx={{ position: "relative", height: 230, flexShrink: 0 }}>
        <Box
          component="img"
          src={deal.images?.[0]?.url}
          alt={deal.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Layered gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(175deg, rgba(15,23,42,0.55) 0%, transparent 45%, rgba(15,23,42,0.72) 100%)",
          }}
        />

        {/* Close */}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 34,
            height: 34,
            bgcolor: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.12)",
            "&:hover": { bgcolor: "rgba(15,23,42,0.8)" },
            transition: "background 0.2s",
          }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>

        {/* Discount badge */}
        <Box
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            background: "linear-gradient(90deg, #F4A261 0%, #e8894a 100%)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            px: 1.4,
            py: 0.55,
            borderRadius: "8px",
            letterSpacing: "0.3px",
            boxShadow: "0 4px 14px rgba(244,162,97,0.45)",
          }}
        >
          <BoltIcon sx={{ fontSize: 13 }} />
          {discountPct}% OFF
        </Box>

        {/* Live pill */}
        <Box
          sx={{
            position: "absolute",
            bottom: 14,
            left: 14,
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            bgcolor: "rgba(15,23,42,0.65)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            px: 1.3,
            py: 0.5,
            borderRadius: "20px",
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: "#4ade80",
              animation: "dpPulse 1.8s ease-in-out infinite",
            }}
          />
          Live Deal
        </Box>

        {/* Viewers count */}
        {deal.viewerCount && (
          <Box
            sx={{
              position: "absolute",
              bottom: 14,
              right: 14,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              bgcolor: "rgba(15,23,42,0.65)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.85)",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              px: 1.2,
              py: 0.5,
              borderRadius: "20px",
            }}
          >
            👁 {deal.viewerCount} viewing
          </Box>
        )}
      </Box>

      {/* ── CONTENT ── */}
      <Box sx={{ p: "18px 20px", display: "flex", flexDirection: "column", gap: "18px" }}>

        {/* Shop identity row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minWidth: 0 }}>
            {deal.shopImage ? (
              <Box
                component="img"
                src={deal.shopImage}
                alt={deal.shopName}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  objectFit: "cover",
                  border: "2px solid rgba(15,23,42,0.07)",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                🏪
              </Box>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  color: "text.primary",
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {deal.shopName}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.5, flexWrap: "wrap" }}>
                <Chip
                  label={deal.category}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    bgcolor: "rgba(15,23,42,0.07)",
                    color: "#0F172A",
                    borderRadius: "6px",
                    "& .MuiChip-label": { px: 1 },
                  }}
                />
                {deal.distance && (
                  <Typography
                    sx={{
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: 11,
                      color: "text.secondary",
                    }}
                  >
                    {deal.distance} km away
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Rating pill */}
          {deal.rating && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)",
                borderRadius: "12px",
                px: 1.5,
                py: 1,
                flexShrink: 0,
                gap: 0.2,
                minWidth: 52,
                boxShadow: "0 4px 16px rgba(15,23,42,0.25)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                <StarIcon sx={{ fontSize: 12, color: "#F4A261" }} />
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontWeight: 800,
                    fontSize: 14,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {deal.rating}
                </Typography>
              </Box>
              {deal.reviewCount && (
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: 10,
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1,
                  }}
                >
                  {deal.reviewCount} reviews
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Thin rule */}
        <Box sx={{ height: "1px", bgcolor: "rgba(15,23,42,0.07)" }} />

        {/* Deal info */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.8 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#F4A261",
                animation: "dpPulse 2s ease-in-out infinite",
              }}
            />
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: 10,
                fontWeight: 800,
                color: "#F4A261",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              Current deal
            </Typography>
          </Box>
          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontWeight: 700,
              fontSize: 17,
              color: "text.primary",
              lineHeight: 1.35,
              mb: 0.8,
            }}
          >
            {deal.title}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.75,
            }}
          >
            {deal.description}
          </Typography>
        </Box>

        {/* Price card */}
        <Box
          sx={{
            // background: "linear-gradient(135deg, #0F172A 0%, #162032 100%)",
            borderRadius: "16px",
            p: "16px 18px",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            // boxShadow: "0 8px 32px rgba(15,23,42,0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* decorative blob */}
          <Box
            sx={{
              position: "absolute",
              right: -20,
              top: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(244,162,97,0.08)",
              pointerEvents: "none",
            }}
          />

          <Box>
            <Typography
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: 10,
                fontWeight: 600,
                // color: "rgba(255,255,255,0.45)",
                mb: 0.2,
                letterSpacing: "0.5px",
              }}
            >
              Deal Price
            </Typography>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <Typography
                sx={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontWeight: 800,
                  fontSize: 28,
                //   color: "#fff",
                  lineHeight: 1,
                }}
              >
                ₹{deal.dealPrice}
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  textDecoration: "line-through",
                //   color: "rgba(255,255,255,0.35)",
                  fontSize: 14,
                  lineHeight: 1,
                }}
              >
                ₹{deal.price}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              ml: "auto",
              background: "linear-gradient(90deg, #F4A261 0%, #e8894a 100%)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 800,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              px: 1.5,
              py: 0.8,
              borderRadius: "10px",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(244,162,97,0.4)",
              letterSpacing: "0.2px",
            }}
          >
            Save ₹{savings}
          </Box>
        </Box>

        {/* Thin rule */}
        <Box sx={{ height: "1px", bgcolor: "rgba(15,23,42,0.07)" }} />

        {/* Info rows */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
          {deal.address && (
            <Box sx={{ display: "flex", gap: 1.2, alignItems: "flex-start" }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  bgcolor: "rgba(15,23,42,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <LocationOnIcon sx={{ fontSize: 15, color: "#0F172A" }} />
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: "text.primary",
                    lineHeight: 1.3,
                  }}
                >
                  {deal.address.street}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  {deal.address.city}
                </Typography>
              </Box>
            </Box>
          )}

          {deal.hours && (
            <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  bgcolor: "rgba(15,23,42,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 15, color: "#0F172A" }} />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#16a34a",
                    lineHeight: 1.3,
                  }}
                >
                  Open now
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontSize: 11,
                    color: "text.secondary",
                  }}
                >
                  {deal.hours}
                </Typography>
              </Box>
            </Box>
          )}

          {deal.phone && (
            <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "8px",
                  bgcolor: "rgba(15,23,42,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PhoneIcon sx={{ fontSize: 15, color: "#0F172A" }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: 12,
                  fontWeight: 500,
                  color: "text.primary",
                }}
              >
                {deal.phone}
              </Typography>
            </Box>
          )}
        </Box>

        {/* CTA Buttons */}
        <Box sx={{ display: "flex", gap: 1.2, pb: 0.5 }}>
          <Button
            fullWidth
            startIcon={<DirectionsIcon sx={{ fontSize: "16px !important" }} />}
            onClick={() =>
              window.open(
                `https://maps.google.com/?q=${deal.address?.street},${deal.address?.city}`
              )
            }
            sx={{
              borderRadius: "12px",
              py: 1.4,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              background: "linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)",
              color: "#fff",
              boxShadow: "0 4px 18px rgba(15,23,42,0.28)",
              "&:hover": {
                background: "linear-gradient(135deg, #162032 0%, #243f6a 100%)",
                boxShadow: "0 6px 22px rgba(15,23,42,0.38)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Directions
          </Button>
          <Button
            fullWidth
            startIcon={<ShareIcon sx={{ fontSize: "16px !important" }} />}
            onClick={() =>
              navigator.share?.({ title: deal.title, text: deal.description })
            }
            sx={{
              borderRadius: "12px",
              py: 1.4,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              bgcolor: "transparent",
              color: "#0F172A",
              border: "1.5px solid rgba(15,23,42,0.15)",
              "&:hover": {
                bgcolor: "rgba(15,23,42,0.04)",
                borderColor: "rgba(15,23,42,0.3)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Share
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DealDetailPanel;