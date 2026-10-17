import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMap } from "@vis.gl/react-google-maps";

/**
 * CustomOverlay renders React components as Google Maps overlays on the map canvas
 * without requiring AdvancedMarkerElement or a Google Cloud mapId.
 * This unlocks full client-side CLEAN_MAP_STYLES so all temples, shops, and
 * unwanted POIs are completely hidden while leaving only roads, locations, and deals.
 */
export const CustomOverlay = ({ position, onClick, children }) => {
  const map = useMap();
  const containerRef = useRef(null);
  const overlayRef = useRef(null);

  if (!containerRef.current) {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.transform = "translate(-50%, -50%)";
    div.style.cursor = "pointer";
    div.style.pointerEvents = "auto";
    containerRef.current = div;
  }

  useEffect(() => {
    if (!map || !window.google?.maps?.OverlayView) return;

    class MapOverlay extends window.google.maps.OverlayView {
      constructor(container, pos) {
        super();
        this.container = container;
        this.pos = pos;
      }

      onAdd() {
        const panes = this.getPanes();
        if (panes?.overlayMouseTarget) {
          panes.overlayMouseTarget.appendChild(this.container);
        }
      }

      draw() {
        const projection = this.getProjection();
        if (!projection || !this.pos) return;

        const point = projection.fromLatLngToDivPixel(
          new window.google.maps.LatLng(this.pos.lat, this.pos.lng)
        );

        if (point) {
          this.container.style.left = `${point.x}px`;
          this.container.style.top = `${point.y}px`;
        }
      }

      onRemove() {
        if (this.container.parentNode) {
          this.container.parentNode.removeChild(this.container);
        }
      }

      setPosition(newPos) {
        this.pos = newPos;
        this.draw();
      }
    }

    const overlay = new MapOverlay(containerRef.current, position);
    overlay.setMap(map);
    overlayRef.current = overlay;

    return () => {
      overlay.setMap(null);
      overlayRef.current = null;
    };
  }, [map]);

  // Keep position reactive if deal coordinates update
  useEffect(() => {
    if (overlayRef.current && position) {
      overlayRef.current.setPosition(position);
    }
  }, [position?.lat, position?.lng]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !onClick) return;

    const handleClick = (e) => {
      e.stopPropagation();
      onClick();
    };

    el.addEventListener("click", handleClick);
    return () => {
      el.removeEventListener("click", handleClick);
    };
  }, [onClick]);

  return createPortal(children, containerRef.current);
};

export default CustomOverlay;
