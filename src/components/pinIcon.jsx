import React from "react";

export const PIN_TYPES = {
  DEAL: { className: "deal", label: "Deal", icon: '<path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.83 0l3.35-3.35a2 2 0 0 0 0-2.83ZM6.5 7.5A1.5 1.5 0 1 1 6.5 4a1.5 1.5 0 0 1 0 3.5Z"/>' },
  SELL: { className: "sell", label: "For sale", icon: '<path d="M4 10.5 12 4l8 6.5V20H4v-9.5ZM9 20v-5h6v5M8 9h.01M12 9h.01M16 9h.01"/>' },
  RENT: { className: "rent", label: "For rent", icon: '<path d="m4 10 8-6 8 6v9H4v-9Zm4 9v-5h8v5M8 10h.01M12 10h.01M16 10h.01"/>' },
  SERVICE: { className: "service", label: "Service", icon: '<path d="m14.7 6.3 3-3a4 4 0 0 0-5 5L5 16a2.12 2.12 0 1 0 3 3l7.7-7.7a4 4 0 0 0 5-5l-3 3-3-3ZM6.5 17.5h.01"/>' },
  EVENT: { className: "event", label: "Event", icon: '<path d="M5 5h14v14H5zM8 3v4M16 3v4M5 10h14M9 14h2M13 14h2"/>' },
  GIVEAWAY: { className: "giveaway", label: "Giveaway", icon: '<path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7H8.5a2.5 2.5 0 1 1 2.5-2.5V7Zm0 0h3.5a2.5 2.5 0 1 0-2.5-2.5V7Z"/>' },
};

export const resolvePinType = (group) => {
  const listing = group?.listings?.find((item) => item.listingType === "DEAL") ?? group?.listings?.[0];
  return PIN_TYPES[listing?.listingType] ?? PIN_TYPES.SELL;
};

export const PinMarkerContent = ({ group, isActive = false }) => {
  const type = resolvePinType(group);

  return (
    <div
      className={`map-pin map-pin--${type.className}${isActive ? " is-active" : ""}`}
      role="img"
      aria-label={type.label}
    >
      <span className="map-pin__icon" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          focusable="false"
          dangerouslySetInnerHTML={{ __html: type.icon }}
        />
      </span>
      <span className="map-pin__point" aria-hidden="true" />
    </div>
  );
};

export default PinMarkerContent;
