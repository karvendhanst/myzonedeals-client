import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateShop } from "../hooks/useCreateShop";

const CATEGORIES = [
  "Grocery", "Restaurant", "Pharmacy", "Electronics", "Clothing",
  "Bakery", "Salon & Spa", "Fitness", "Books & Stationery",
  "Jewellery", "Hardware", "Other",
];

const initialForm = {
  name: "", category: "Grocery", street: "", city: "",
  state: "", pincode: "", country: "India",
  longitude: "", latitude: "", shopImage: null,
};

/* ─── Inline styles ─────────────────────────────────────────────────── */
const S = {
  page: {
    minHeight: "100vh",
    background: "#F0F1F4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 16px",
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 980,
    display: "flex",
    borderRadius: 20,
    overflow: "hidden",
    border: "1px solid #E2E4E9",
    boxShadow: "0 8px 48px rgba(13,27,42,0.10)",
    background: "#fff",
    minHeight: 620,
  },
  /* LEFT PANEL */
  left: {
    width: 290,
    minWidth: 290,
    flexShrink: 0,
    background: "#0D1B2A",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "start",
    padding: "36px 24px",
    gap: 0,
  },
  leftCircle1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: "50%",
    border: "1px solid rgba(232,129,74,0.09)",
    top: -80,
    right: -80,
    pointerEvents: "none",
  },
  leftCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: "50%",
    border: "1px solid rgba(232,129,74,0.06)",
    bottom: -40,
    left: -60,
    pointerEvents: "none",
  },
  leftBlob: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "rgba(232,129,74,0.05)",
    top: 30,
    left: 16,
    pointerEvents: "none",
  },
  tagline: {
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    marginTop: 20,
  },
  tagH: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700,
    fontSize: 17,
    color: "#fff",
    lineHeight: 1.4,
    marginBottom: 4,
  },
  tagSpan: { color: "#E8814A" },
  tagP: {
    fontSize: 12,
    color: "rgba(255,255,255,0.38)",
    lineHeight: 1.65,
    maxWidth: 200,
    margin: "0 auto",
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginTop: 14,
  },
  pill: {
    padding: "4px 12px",
    border: "1px solid rgba(232,129,74,0.28)",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    color: "#E8814A",
    background: "rgba(232,129,74,0.08)",
  },
  /* RIGHT PANEL */
  right: {
    flex: 1,
    overflowY: "auto",
    padding: "36px 32px",
    background: "#fff",
  },
  formHead: { marginBottom: 26 },
  formH: {
    fontWeight: 700,
    fontSize: 20,
    color: "#0D1B2A",
    marginBottom: 4,
  },
  formSub: { fontSize: 13, color: "#6B7280" },
  /* Section labels */
  secRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    marginTop: 22,
  },
  secDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#E8814A",
    flexShrink: 0,
  },
  secLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: "0.9px",
  },
  /* Grid rows */
  row: { display: "grid", gap: 10, marginBottom: 10 },
  /* Field */
  fieldWrap: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: "#6B7280" },
  input: {
    height: 40,
    padding: "0 12px",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    background: "#F9FAFB",
    fontSize: 13,
    color: "#111827",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
  inputFocus: {
    borderColor: "#E8814A",
    boxShadow: "0 0 0 3px rgba(232,129,74,0.12)",
    background: "#fff",
  },
  inputError: { borderColor: "#F87171" },
  select: {
    height: 40,
    padding: "0 12px",
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    background: "#F9FAFB",
    fontSize: 13,
    color: "#111827",
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
    cursor: "pointer",
    appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 12px center",
    paddingRight: 36,
  },
  helperErr: { fontSize: 11, color: "#EF4444", marginTop: 2 },
  divider: {
    height: 1,
    background: "#F3F4F6",
    margin: "20px 0 4px",
    border: "none",
  },
  /* Upload */
  uploadBox: {
    border: "1.5px dashed #E5E7EB",
    borderRadius: 12,
    background: "#F9FAFB",
    padding: "20px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    transition: "border-color 0.15s, background 0.15s",
    marginBottom: 10,
    minHeight: 100,
  },
  uploadBoxHover: {
    borderColor: "#E8814A",
    background: "#FFF9F5",
  },
  uploadIcon: {
    width: 38,
    height: 38,
    borderRadius: 9,
    background: "rgba(232,129,74,0.10)",
    border: "1px solid rgba(232,129,74,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadTitle: { fontWeight: 700, fontSize: 13, color: "#374151" },
  uploadSub: { fontSize: 11, color: "#9CA3AF" },
  /* Image preview */
  previewWrap: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid #E5E7EB",
    height: 120,
    marginBottom: 10,
  },
  previewImg: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  previewOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(13,27,42,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    opacity: 0,
    transition: "opacity 0.2s",
  },
  previewBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    background: "rgba(232,129,74,0.92)",
    borderRadius: 5,
    padding: "2px 8px",
    fontSize: 10,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "0.5px",
  },
  chip: (bg, border) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 12px",
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
  }),
  /* Coord chip */
  coordChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "4px 12px",
    background: "#FFF8F2",
    border: "1px solid #FDDCB5",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    color: "#374151",
    marginTop: 8,
  },
  /* Detect btn */
  detectBtn: {
    height: 40,
    width: 44,
    flexShrink: 0,
    border: "1px solid #E5E7EB",
    borderRadius: 10,
    background: "#F9FAFB",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.15s, background 0.15s",
    alignSelf: "flex-end",
    marginBottom: 0,
  },
  /* Actions */
  actions: { display: "flex", gap: 10, marginTop: 28 },
  btnPrimary: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    border: "none",
    background: "#0D1B2A",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "inherit",
    cursor: "pointer",
    letterSpacing: "0.3px",
    transition: "opacity 0.15s, background 0.15s",
  },
  btnReset: {
    height: 46,
    padding: "0 22px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "transparent",
    color: "#6B7280",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "border-color 0.15s, color 0.15s",
  },
};

/* ─── ShopSVG (unchanged original) ─────────────────────────────────── */
function ShopSVG() {
  return (
    <svg viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 240, position: "relative", zIndex: 1 }}>
      <rect x="15" y="190" width="230" height="6" rx="3" fill="rgba(232,129,74,0.15)" />
      <rect x="45" y="85" width="170" height="107" rx="3" fill="#162336" />
      <rect x="35" y="72" width="190" height="22" rx="5" fill="#E8814A" />
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={42 + i*16} y="72" width="10" height="22" rx="1" fill="rgba(255,255,255,0.12)" />
      ))}
      <rect x="70" y="85" width="120" height="24" rx="3" fill="#0D1B2A" stroke="#E8814A" strokeWidth="0.8" />
      <text x="130" y="101" textAnchor="middle" fill="#E8814A"
        fontFamily="sans-serif" fontSize="8" fontWeight="600" letterSpacing="1.2">
        MY ZONE DEALS
      </text>
      {/* Door */}
      <rect x="100" y="140" width="60" height="52" rx="3" fill="#0D1B2A" />
      <rect x="103" y="143" width="54" height="46" rx="2" fill="#162336" />
      <circle cx="148" cy="166" r="2.5" fill="#E8814A" />
      <rect x="110" y="149" width="38" height="20" rx="2" fill="rgba(232,129,74,0.10)" stroke="rgba(232,129,74,0.25)" strokeWidth="0.7" />
      <line x1="129" y1="149" x2="129" y2="169" stroke="rgba(232,129,74,0.25)" strokeWidth="0.7" />
      <line x1="110" y1="159" x2="148" y2="159" stroke="rgba(232,129,74,0.25)" strokeWidth="0.7" />
      {/* Left window */}
      <rect x="55" y="100" width="38" height="30" rx="3" fill="#0D1B2A" />
      <rect x="58" y="103" width="32" height="24" rx="2" fill="rgba(232,129,74,0.07)" stroke="rgba(232,129,74,0.2)" strokeWidth="0.7" />
      <line x1="74" y1="103" x2="74" y2="127" stroke="rgba(232,129,74,0.2)" strokeWidth="0.7" />
      <line x1="58" y1="115" x2="90" y2="115" stroke="rgba(232,129,74,0.2)" strokeWidth="0.7" />
      {/* Right window */}
      <rect x="167" y="100" width="38" height="30" rx="3" fill="#0D1B2A" />
      <rect x="170" y="103" width="32" height="24" rx="2" fill="rgba(232,129,74,0.07)" stroke="rgba(232,129,74,0.2)" strokeWidth="0.7" />
      <line x1="186" y1="103" x2="186" y2="127" stroke="rgba(232,129,74,0.2)" strokeWidth="0.7" />
      <line x1="170" y1="115" x2="202" y2="115" stroke="rgba(232,129,74,0.2)" strokeWidth="0.7" />
      {/* Steps */}
      <rect x="98" y="185" width="64" height="5" rx="2" fill="#E8814A" opacity="0.4" />
      <rect x="104" y="180" width="52" height="5" rx="2" fill="#E8814A" opacity="0.25" />
      {/* Trees */}
      <ellipse cx="55" cy="178" rx="11" ry="12" fill="#163024" />
      <ellipse cx="49" cy="172" rx="6" ry="7" fill="#1A4030" />
      <ellipse cx="62" cy="171" rx="6" ry="7" fill="#1A4030" />
      <ellipse cx="205" cy="178" rx="11" ry="12" fill="#163024" />
      <ellipse cx="199" cy="172" rx="6" ry="7" fill="#1A4030" />
      <ellipse cx="212" cy="171" rx="6" ry="7" fill="#1A4030" />
      {/* Stars */}
      <circle cx="38" cy="56" r="2" fill="#E8814A" opacity="0.5" />
      <circle cx="222" cy="51" r="1.5" fill="#E8814A" opacity="0.4" />
      <circle cx="210" cy="65" r="1" fill="#E8814A" opacity="0.3" />
    </svg>
  );
}

/* ─── Reusable sub-components ───────────────────────────────────────── */
function SectionLabel({ label }) {
  return (
    <div style={S.secRow}>
      <div style={S.secDot} />
      <span style={S.secLabel}>{label}</span>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div style={S.fieldWrap}>
      <label style={S.label}>{label}</label>
      {children}
      {error && <span style={S.helperErr}>{error}</span>}
    </div>
  );
}

function StyledInput({ style: extraStyle, ...props }) {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  return (
    <input
      {...props}
      style={{
        ...S.input,
        ...(focused ? S.inputFocus : {}),
        ...(hovered && !focused ? { borderColor: "#D1D5DB" } : {}),
        ...(props["data-error"] ? S.inputError : {}),
        ...extraStyle,
      }}
      onFocus={e => { setFocused(true); props.onFocus && props.onFocus(e); }}
      onBlur={e => { setFocused(false); props.onBlur && props.onBlur(e); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
}

function StyledSelect({ ...props }) {
  const [focused, setFocused] = React.useState(false);
  return (
    <select
      {...props}
      style={{
        ...S.select,
        ...(focused ? { borderColor: "#E8814A", boxShadow: "0 0 0 3px rgba(232,129,74,0.12)", background: "#fff" } : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
export default function AddShopForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadHover, setUploadHover] = useState(false);
  const [previewHover, setPreviewHover] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const { mutateAsync, isPending } = useCreateShop();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setForm(p => ({ ...p, shopImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm(p => ({ ...p, shopImage: null }));
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Shop name is required";
    if (!form.category) e.category = "Category is required";
    if (!form.street.trim()) e.street = "Street is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state.trim()) e.state = "State is required";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    if (!form.longitude || isNaN(form.longitude)) e.longitude = "Valid longitude required";
    if (!form.latitude || isNaN(form.latitude)) e.latitude = "Valid latitude required";
    return e;
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(p => ({
          ...p,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setErrors(p => ({ ...p, latitude: "", longitude: "" }));
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

const handleSubmit = async e => {
  e.preventDefault();

  const errs = validate();
  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("street", form.street);
    formData.append("city", form.city);
    formData.append("state", form.state);
    formData.append("pincode", form.pincode);
    formData.append("country", form.country);
    formData.append("longitude", form.longitude);
    formData.append("latitude", form.latitude);

    if (form.shopImage) {
      formData.append("shopImage", form.shopImage);
    }

    await mutateAsync(formData);

    setSuccess(true);
    setForm(initialForm);
    setImagePreview(null);

    // Navigate to dealer dashboard after a short delay so they can see the success message
    setTimeout(() => {
      navigate("/owner-dashboard");
    }, 1500);

  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={S.page}>
      <div style={{ width: "100%", maxWidth: 980 }}>

        {/* Success banner */}
        {success && (
          <div style={{
            marginBottom: 14,
            padding: "12px 16px",
            background: "#F0FDF4",
            border: "1px solid #86EFAC",
            borderRadius: 12,
            fontSize: 13,
            color: "#15803D",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Shop added successfully! It will appear after verification.
          </div>
        )}

        <div style={S.card}>

          {/* ── LEFT PANEL ── */}
          <div style={S.left}>
            <div style={S.leftCircle1} />
            <div style={S.leftCircle2} />
            <div style={S.leftBlob} />
            <ShopSVG />
            <div style={S.tagline}>
              <p style={S.tagH}>
                List your shop on<br />
                <span style={S.tagSpan}>MyZone Deals</span>
              </p>
              <p style={S.tagP}>
                Reach thousands of local customers and grow your business with us.
              </p>
              <div style={S.pillRow}>
                {["Free listing", "Local reach", "Easy setup"].map(f => (
                  <div key={f} style={S.pill}>✦ {f}</div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT FORM PANEL ── */}
          <div style={S.right}>
            <div style={S.formHead}>
              <p style={S.formH}>Add new shop</p>
              <p style={S.formSub}>Fill in the details below to list your shop</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>

              {/* Shop Information */}
              <SectionLabel label="Shop information" />
              <div style={{ ...S.row, marginBottom: 10 }}>
                <Field label="Shop name" error={errors.name}>
                  <StyledInput
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Sri Murugan Stores"
                    data-error={!!errors.name}
                  />
                </Field>
              </div>
              <div style={{ ...S.row, marginBottom: 0 }}>
                <Field label="Category" error={errors.category}>
                  <StyledSelect name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </StyledSelect>
                </Field>
              </div>

              <hr style={S.divider} />

              {/* Shop Image */}
              <SectionLabel label="Shop image" />
              <input
                ref={fileInputRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleImageChange}
                id="shop-image-upload"
              />

              {!imagePreview ? (
                <label htmlFor="shop-image-upload" style={{ display: "block" }}>
                  <div
                    style={{ ...S.uploadBox, ...(uploadHover ? S.uploadBoxHover : {}) }}
                    onMouseEnter={() => setUploadHover(true)}
                    onMouseLeave={() => setUploadHover(false)}
                  >
                    <div style={S.uploadIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8814A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <p style={S.uploadTitle}>Click to upload shop image</p>
                    <p style={S.uploadSub}>PNG, JPG, WEBP — up to 5MB</p>
                  </div>
                </label>
              ) : (
                <div
                  style={S.previewWrap}
                  onMouseEnter={() => setPreviewHover(true)}
                  onMouseLeave={() => setPreviewHover(false)}
                >
                  <img src={imagePreview} alt="Shop preview" style={S.previewImg} />
                  <div style={{ ...S.previewOverlay, opacity: previewHover ? 1 : 0 }}>
                    <label htmlFor="shop-image-upload" style={{ cursor: "pointer" }}>
                      <div style={S.chip("rgba(232,129,74,0.92)", "transparent")}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                        Change
                      </div>
                    </label>
                    <div
                      style={S.chip("rgba(239,68,68,0.88)", "transparent")}
                      onClick={handleRemoveImage}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Remove
                    </div>
                  </div>
                  <div style={S.previewBadge}>UPLOADED</div>
                </div>
              )}

              <hr style={S.divider} />

              {/* Shop Address */}
              <SectionLabel label="Shop address" />
              <div style={{ ...S.row, marginBottom: 10 }}>
                <Field label="Street address" error={errors.street}>
                  <StyledInput
                    name="street" value={form.street} onChange={handleChange}
                    placeholder="Door no, street name, area"
                    data-error={!!errors.street}
                  />
                </Field>
              </div>
              <div style={{ ...S.row, gridTemplateColumns: "1fr 1fr", marginBottom: 10 }}>
                <Field label="City" error={errors.city}>
                  <StyledInput name="city" value={form.city} onChange={handleChange} placeholder="e.g. Karur" data-error={!!errors.city} />
                </Field>
                <Field label="State" error={errors.state}>
                  <StyledInput name="state" value={form.state} onChange={handleChange} placeholder="e.g. Tamil Nadu" data-error={!!errors.state} />
                </Field>
              </div>
              <div style={{ ...S.row, gridTemplateColumns: "1fr 1fr", marginBottom: 0 }}>
                <Field label="Pincode" error={errors.pincode}>
                  <StyledInput
                    name="pincode" value={form.pincode} onChange={handleChange}
                    placeholder="6-digit pincode" maxLength={6}
                    data-error={!!errors.pincode}
                  />
                </Field>
                <Field label="Country">
                  <StyledInput name="country" value={form.country} onChange={handleChange} />
                </Field>
              </div>

              <hr style={S.divider} />

              {/* GPS Coordinates */}
              <SectionLabel label="GPS coordinates" />
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 0 }}>
                <div style={{ flex: 1 }}>
                  <Field label="Latitude" error={errors.latitude}>
                    <StyledInput
                      name="latitude" value={form.latitude} onChange={handleChange}
                      placeholder="e.g. 10.9517" data-error={!!errors.latitude}
                    />
                  </Field>
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Longitude" error={errors.longitude}>
                    <StyledInput
                      name="longitude" value={form.longitude} onChange={handleChange}
                      placeholder="e.g. 78.0820" data-error={!!errors.longitude}
                    />
                  </Field>
                </div>
                <DetectButton locating={locating} onClick={handleDetectLocation} />
              </div>

              {form.latitude && form.longitude && (
                <div style={S.coordChip}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E8814A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  [{form.longitude}, {form.latitude}]
                </div>
              )}

              {/* Actions */}
              <div style={S.actions}>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ ...S.btnPrimary, opacity: isPending ? 0.6 : 1, cursor: isPending ? "not-allowed" : "pointer" }}
                >
                  {isPending ? "Adding shop…" : "Add shop →"}
                </button>
                <button type="button" onClick={handleReset} style={S.btnReset}>
                  Reset
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Detect Button ─────────────────────────────────────────────────── */
function DetectButton({ locating, onClick }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locating}
      title="Detect my location"
      style={{
        ...S.detectBtn,
        ...(hovered ? { borderColor: "#E8814A", background: "#FFF8F2" } : {}),
        opacity: locating ? 0.7 : 1,
        cursor: locating ? "not-allowed" : "pointer",
        marginBottom: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {locating ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8814A" strokeWidth="2" strokeLinecap="round"
          style={{ animation: "spin 1s linear infinite" }}>
          <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E8814A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
          <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
        </svg>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}