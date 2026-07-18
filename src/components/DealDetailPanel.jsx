import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Typography, IconButton, Button, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneIcon from "@mui/icons-material/Phone";
import ShareIcon from "@mui/icons-material/Share";
import DirectionsIcon from "@mui/icons-material/Directions";
import StarIcon from "@mui/icons-material/Star";
import BoltIcon from "@mui/icons-material/Bolt";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DirectionsModal from "./DirectionsModal";

/* ─── inject styles once ─── */
const STYLES = `
@keyframes dpPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.55; transform: scale(0.85); }
}
@keyframes dpFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes dotBounce {
  0%, 100% { transform: scaleX(1); }
  50%       { transform: scaleX(1.5); }
}
.dp-track {
  display: flex;
  height: 100%;
  transition: transform 0.42s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
}
.dp-slide {
  flex-shrink: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.dp-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}
.dp-slide:hover img {
  transform: scale(1.04);
}
`;

if (typeof document !== "undefined" && !document.getElementById("dp-styles")) {
  const s = document.createElement("style");
  s.id = "dp-styles";
  s.textContent = STYLES;
  document.head.appendChild(s);
}

/* ─── IMAGE CAROUSEL ─── */
const ImageCarousel = ({ images = [], discountPct, hasMultipleDeals, allDeals, selectedIndex, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [dragStart, setDragStart] = useState(null);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef(null);

  // reset when deal changes
  useEffect(() => { setCurrent(0); }, [images]);

  const count = images.length;

  const go = useCallback((idx) => {
    setCurrent((idx + count) % count);
  }, [count]);

  const prev = (e) => { e.stopPropagation(); go(current - 1); };
  const next = (e) => { e.stopPropagation(); go(current + 1); };

  /* touch / mouse drag */
  const onPointerDown = (e) => {
    setDragStart(e.clientX ?? e.touches?.[0]?.clientX);
    setDragging(false);
  };
  const onPointerMove = (e) => {
    if (dragStart === null) return;
    const x = e.clientX ?? e.touches?.[0]?.clientX;
    if (Math.abs(x - dragStart) > 6) setDragging(true);
  };
  const onPointerUp = (e) => {
    if (dragStart === null) return;
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX;
    const diff = dragStart - x;
    if (Math.abs(diff) > 40) diff > 0 ? go(current + 1) : go(current - 1);
    setDragStart(null);
    setDragging(false);
  };

  return (
    <Box sx={{ position: "relative", height: 250, flexShrink: 0, overflow: "hidden", bgcolor: "#0F172A", cursor: dragging ? "grabbing" : "grab" }}
      onMouseDown={onPointerDown} onMouseMove={onPointerMove} onMouseUp={onPointerUp}
      onTouchStart={onPointerDown} onTouchMove={onPointerMove} onTouchEnd={onPointerUp}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className="dp-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {images.map((img, i) => (
          <div key={i} className="dp-slide">
            <img src={img.url} alt={`Deal image ${i + 1}`} draggable={false} />
          </div>
        ))}
      </div>

      {/* Gradient overlay */}
      <Box sx={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(175deg, rgba(15,23,42,0.6) 0%, transparent 40%, rgba(15,23,42,0.75) 100%)",
      }} />

      {/* Prev/Next arrows — only if more than 1 image */}
      {count > 1 && (
        <>
          <IconButton onClick={prev} size="small" sx={{
            position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
            width: 32, height: 32,
            bgcolor: "rgba(15,23,42,0.55)", backdropFilter: "blur(8px)",
            color: "#fff", border: "1px solid rgba(255,255,255,0.15)",
            "&:hover": { bgcolor: "rgba(15,23,42,0.85)", transform: "translateY(-50%) scale(1.08)" },
            transition: "all 0.18s ease",
          }}>
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton onClick={next} size="small" sx={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            width: 32, height: 32,
            bgcolor: "rgba(15,23,42,0.55)", backdropFilter: "blur(8px)",
            color: "#fff", border: "1px solid rgba(255,255,255,0.15)",
            "&:hover": { bgcolor: "rgba(15,23,42,0.85)", transform: "translateY(-50%) scale(1.08)" },
            transition: "all 0.18s ease",
          }}>
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </>
      )}

      {/* Close button */}
      <IconButton onClick={onClose} size="small" sx={{
        position: "absolute", top: 12, right: 12,
        width: 32, height: 32,
        bgcolor: "rgba(15,23,42,0.55)", backdropFilter: "blur(8px)",
        color: "#fff", border: "1px solid rgba(255,255,255,0.12)",
        "&:hover": { bgcolor: "rgba(15,23,42,0.85)" },
        transition: "background 0.18s",
      }}>
        <CloseIcon sx={{ fontSize: 15 }} />
      </IconButton>

      {/* Discount badge */}
      <Box sx={{
        position: "absolute", top: 12, left: 12,
        display: "flex", alignItems: "center", gap: 0.5,
        background: "linear-gradient(90deg, #F4A261 0%, #e8894a 100%)",
        color: "#fff", fontSize: 11, fontWeight: 800,
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        px: 1.3, py: 0.5, borderRadius: "8px", letterSpacing: "0.3px",
        boxShadow: "0 4px 14px rgba(244,162,97,0.45)",
      }}>
        <BoltIcon sx={{ fontSize: 12 }} />
        {discountPct}% OFF
      </Box>

      {/* Bottom row: live pill + dots + deal counter */}
      <Box sx={{
        position: "absolute", bottom: 12, left: 12, right: 12,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        {/* Live pill */}
        <Box sx={{
          display: "flex", alignItems: "center", gap: 0.6,
          bgcolor: "rgba(15,23,42,0.65)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
          fontSize: 11, fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif',
          px: 1.2, py: 0.45, borderRadius: "20px",
        }}>
          <Box sx={{
            width: 6, height: 6, borderRadius: "50%", bgcolor: "#4ade80",
            animation: "dpPulse 1.8s ease-in-out infinite",
          }} />
          Live Deal
        </Box>

        {/* Dot indicators (multi-image only) */}
        {count > 1 && (
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {images.map((_, i) => (
              <Box
                key={i}
                onClick={(e) => { e.stopPropagation(); go(i); }}
                sx={{
                  width: i === current ? 18 : 6,
                  height: 6,
                  borderRadius: "3px",
                  bgcolor: i === current ? "#F4A261" : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  "&:hover": { bgcolor: i === current ? "#F4A261" : "rgba(255,255,255,0.75)" },
                }}
              />
            ))}
          </Box>
        )}

        {/* Deal counter (multi-deal shops) */}
        {hasMultipleDeals && (
          <Box sx={{
            bgcolor: "rgba(15,23,42,0.65)", backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.12)", color: "#fff",
            fontSize: 11, fontWeight: 700, fontFamily: '"Plus Jakarta Sans", sans-serif',
            px: 1.2, py: 0.45, borderRadius: "20px",
          }}>
            {selectedIndex + 1} / {allDeals.length} deals
          </Box>
        )}
      </Box>

      {/* Thumbnail strip — shown only if 3+ images */}
      {count >= 3 && (
        <Box sx={{
          position: "absolute", bottom: 44, left: "50%", transform: "translateX(-50%)",
          display: "flex", gap: 0.7, alignItems: "center",
        }}>
          {images.map((img, i) => (
            <Box
              key={i}
              onClick={(e) => { e.stopPropagation(); go(i); }}
              sx={{
                width: i === current ? 40 : 30,
                height: i === current ? 40 : 30,
                borderRadius: "8px",
                overflow: "hidden",
                border: i === current ? "2px solid #F4A261" : "2px solid rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                flexShrink: 0,
                boxShadow: i === current ? "0 4px 12px rgba(244,162,97,0.5)" : "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", pointerEvents: "none" }} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

/* ─── EMPTY STATE ─── */
const EmptyState = () => (
  <Box sx={{
    height: "100%", display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 2, px: 4,
    bgcolor: "background.default", animation: "dpFadeIn 0.4s ease",
  }}>
    <Box sx={{
      width: 80, height: 80, borderRadius: "24px",
      background: "linear-gradient(135deg, #0F172A 0%, #1e2d47 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 34, boxShadow: "0 12px 40px rgba(15,23,42,0.18)",
    }}>🏷️</Box>
    <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: 16, color: "text.primary", textAlign: "center" }}>
      No deal selected
    </Typography>
    <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: "text.secondary", textAlign: "center", lineHeight: 1.6 }}>
      Tap a marker on the map to explore live deals near you
    </Typography>
  </Box>
);

/* ─── DEAL TAB BAR ─── */
const DealTabBar = ({ deals, selectedIndex, onSelect }) => (
  <Box sx={{
    display: "flex", gap: 1, px: 2, py: 1.5, overflowX: "auto",
    borderBottom: "1px solid rgba(15,23,42,0.07)", bgcolor: "background.paper", flexShrink: 0,
    "&::-webkit-scrollbar": { height: 0 }, scrollbarWidth: "none",
  }}>
    {deals.map((deal, i) => (
      <Box key={deal._id} onClick={() => onSelect(i)} sx={{
        flexShrink: 0, cursor: "pointer", px: 1.5, py: 0.8, borderRadius: "10px",
        border: "1.5px solid", borderColor: i === selectedIndex ? "#0F172A" : "rgba(15,23,42,0.12)",
        bgcolor: i === selectedIndex ? "#0F172A" : "transparent",
        transition: "all 0.18s ease",
      }}>
        <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 11, fontWeight: 700, color: i === selectedIndex ? "#fff" : "text.secondary", whiteSpace: "nowrap", lineHeight: 1.3 }}>
          {deal.title}
        </Typography>
        <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 10, fontWeight: 600, color: i === selectedIndex ? "rgba(255,255,255,0.65)" : "#F4A261" }}>
          ₹{deal.dealPrice}
        </Typography>
      </Box>
    ))}
  </Box>
);

/* ─── MAIN COMPONENT ─── */
const DealDetailPanel = ({ deal, allDeals, selectedIndex = 0, onSelectDeal, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [showDirections, setShowDirections] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, [deal?._id ?? deal?.title]);

  if (!deal) return <EmptyState />;

  const savings = deal.price - deal.dealPrice;
  const discountPct = deal.discountPercent ?? Math.round((savings / deal.price) * 100);
  const hasMultipleDeals = allDeals && allDeals.length > 1;
  const images = deal.images ?? [];

  return (
    <Box sx={{
      height: "100%", display: "flex", flexDirection: "column",
      bgcolor: "background.default",
      opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)",
      transition: "opacity 0.35s ease, transform 0.35s ease",
    }}>
      {/* Deal tab bar */}
      {hasMultipleDeals && (
        <DealTabBar deals={allDeals} selectedIndex={selectedIndex} onSelect={onSelectDeal} />
      )}

      {/* Scrollable content */}
      <Box sx={{ flex: 1, overflowY: "auto", "&::-webkit-scrollbar": { width: 0 }, scrollbarWidth: "none" }}>

        {/* ── IMAGE CAROUSEL ── */}
        <ImageCarousel
          images={images}
          discountPct={discountPct}
          hasMultipleDeals={hasMultipleDeals}
          allDeals={allDeals}
          selectedIndex={selectedIndex}
          onClose={onClose}
        />

        {/* ── CONTENT ── */}
        <Box sx={{ p: "18px 20px", display: "flex", flexDirection: "column", gap: "18px" }}>

          {/* Shop identity row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", minWidth: 0 }}>
              {deal.shopImage ? (
                <Box component="img" src={deal.shopImage} alt={deal.shopName} sx={{
                  width: 48, height: 48, borderRadius: "14px", objectFit: "cover",
                  border: "2px solid rgba(15,23,42,0.07)", flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }} />
              ) : (
                <Box sx={{
                  width: 48, height: 48, borderRadius: "14px",
                  background: "linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22, flexShrink: 0,
                }}>🏪</Box>
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: 15,
                  color: "text.primary", lineHeight: 1.3, whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {deal.shopName}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.5, flexWrap: "wrap" }}>
                  <Chip label={deal.category} size="small" sx={{
                    height: 20, fontSize: 10, fontWeight: 700,
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    bgcolor: "rgba(15,23,42,0.07)", color: "#0F172A",
                    borderRadius: "6px", "& .MuiChip-label": { px: 1 },
                  }} />
                  {hasMultipleDeals && (
                    <Chip label={`${allDeals.length} deals`} size="small" sx={{
                      height: 20, fontSize: 10, fontWeight: 700,
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      bgcolor: "rgba(244,162,97,0.15)", color: "#c2610a",
                      borderRadius: "6px", "& .MuiChip-label": { px: 1 },
                    }} />
                  )}
                </Box>
              </Box>
            </Box>

            {deal.rating && (
              <Box sx={{
                display: "flex", flexDirection: "column", alignItems: "center",
                background: "linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)",
                borderRadius: "12px", px: 1.5, py: 1, flexShrink: 0,
                gap: 0.2, minWidth: 52, boxShadow: "0 4px 16px rgba(15,23,42,0.25)",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                  <StarIcon sx={{ fontSize: 12, color: "#F4A261" }} />
                  <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, fontSize: 14, color: "#fff", lineHeight: 1 }}>
                    {deal.rating}
                  </Typography>
                </Box>
                {deal.reviewCount && (
                  <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1 }}>
                    {deal.reviewCount} reviews
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ height: "1px", bgcolor: "rgba(15,23,42,0.07)" }} />

          {/* Deal info */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 0.8 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#F4A261", animation: "dpPulse 2s ease-in-out infinite" }} />
              <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 10, fontWeight: 800, color: "#F4A261", letterSpacing: "1px", textTransform: "uppercase" }}>
                Current deal
              </Typography>
            </Box>
            <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700, fontSize: 17, color: "text.primary", lineHeight: 1.35, mb: 0.8 }}>
              {deal.title}
            </Typography>
            <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, color: "text.secondary", lineHeight: 1.75 }}>
              {deal.description}
            </Typography>
          </Box>

          {/* Price card */}
          <Box sx={{ borderRadius: "16px", p: "16px 18px", display: "flex", alignItems: "center", gap: 1.5, position: "relative", overflow: "hidden" }}>
            <Box sx={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(244,162,97,0.08)", pointerEvents: "none" }} />
            <Box>
              <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 10, fontWeight: 600, mb: 0.2, letterSpacing: "0.5px" }}>
                Deal Price
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800, fontSize: 28, lineHeight: 1 }}>
                  ₹{deal.dealPrice}
                </Typography>
                <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', textDecoration: "line-through", fontSize: 14, lineHeight: 1 }}>
                  ₹{deal.price}
                </Typography>
              </Box>
            </Box>
            <Box sx={{
              ml: "auto",
              background: "linear-gradient(90deg, #F4A261 0%, #e8894a 100%)",
              color: "#fff", fontSize: 11, fontWeight: 800,
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              px: 1.5, py: 0.8, borderRadius: "10px", whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(244,162,97,0.4)", letterSpacing: "0.2px",
            }}>
              Save ₹{savings}
            </Box>
          </Box>

          <Box sx={{ height: "1px", bgcolor: "rgba(15,23,42,0.07)" }} />

          {/* Info rows */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.4 }}>
            {deal.address && (
              <Box sx={{ display: "flex", gap: 1.2, alignItems: "flex-start" }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: "rgba(15,23,42,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <LocationOnIcon sx={{ fontSize: 15, color: "#0F172A" }} />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 12, fontWeight: 600, color: "text.primary", lineHeight: 1.3 }}>
                    {deal.address.street}
                  </Typography>
                  <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 11, color: "text.secondary" }}>
                    {deal.address.city}
                  </Typography>
                </Box>
              </Box>
            )}
            {deal.hours && (
              <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: "rgba(15,23,42,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AccessTimeIcon sx={{ fontSize: 15, color: "#0F172A" }} />
                </Box>
                <Box>
                  <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 12, fontWeight: 600, color: "#16a34a", lineHeight: 1.3 }}>Open now</Typography>
                  <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 11, color: "text.secondary" }}>{deal.hours}</Typography>
                </Box>
              </Box>
            )}
            {deal.phone && (
              <Box sx={{ display: "flex", gap: 1.2, alignItems: "center" }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: "rgba(15,23,42,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <PhoneIcon sx={{ fontSize: 15, color: "#0F172A" }} />
                </Box>
                <Typography sx={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 12, fontWeight: 500, color: "text.primary" }}>
                  {deal.phone}
                </Typography>
              </Box>
            )}
          </Box>

          {/* CTA Buttons */}
          <Box sx={{ display: "flex", gap: 1.2, pb: 0.5 }}>
            <Button fullWidth startIcon={<DirectionsIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => setShowDirections(true)}
              sx={{
                borderRadius: "12px", py: 1.4, textTransform: "none", fontWeight: 700,
                fontSize: 13, fontFamily: '"Plus Jakarta Sans", sans-serif',
                background: "linear-gradient(135deg, #0F172A 0%, #1e3a5f 100%)",
                color: "#fff", boxShadow: "0 4px 18px rgba(15,23,42,0.28)",
                "&:hover": { background: "linear-gradient(135deg, #162032 0%, #243f6a 100%)", boxShadow: "0 6px 22px rgba(15,23,42,0.38)" },
                transition: "all 0.2s ease",
              }}>
              Directions
            </Button>
            <Button fullWidth startIcon={<ShareIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => navigator.share?.({ title: deal.title, text: deal.description })}
              sx={{
                borderRadius: "12px", py: 1.4, textTransform: "none", fontWeight: 700,
                fontSize: 13, fontFamily: '"Plus Jakarta Sans", sans-serif',
                bgcolor: "transparent", color: "#0F172A", border: "1.5px solid rgba(15,23,42,0.15)",
                "&:hover": { bgcolor: "rgba(15,23,42,0.04)", borderColor: "rgba(15,23,42,0.3)" },
                transition: "all 0.2s ease",
              }}>
              Share
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Directions modal — rendered outside the scrollable content so it covers full screen */}
      <DirectionsModal
        open={showDirections}
        onClose={() => setShowDirections(false)}
        shopLat={deal.latitude}
        shopLng={deal.longitude}
        shopName={deal.shopName}
      />
    </Box>
  );
};

export default DealDetailPanel;