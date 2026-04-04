import L from "leaflet";

export const customIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      background:#F4A261;
      width:42px;
      height:42px;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      box-shadow:0 6px 16px rgba(0,0,0,0.2);
      border:3px solid white;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="white" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
      </svg>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42], 
});
