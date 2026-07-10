import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Toaster, toast } from "react-hot-toast";
import {
  AlertCircle,
  RefreshCw,
  Loader2,
  Save,
  IndianRupee,
  Camera,
  X,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Footer from "../../components/Footer";

/* ─── Design tokens — shared across CareConnect panels ─── */
const T = {
  cream: "#F5F1E8",
  creamDark: "#EDE7D9",
  green: "#16332B",
  greenSoft: "#1F4438",
  greenLight: "#E9EFE9",
  terra: "#C1633B",
  terraLight: "#FBEAE0",
  ink: "#1A1A17",
  muted: "#6B685F",
  border: "#E4DFD0",
  white: "#FFFFFF",
  red: "#B0432B",
  redLight: "#FBEAE0",
};

const FRAUNCES = "'Fraunces', serif";
const INTER = "'Inter', sans-serif";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  dob: "",
  bloodGroup: "",
  address: "",
  city: "",
  state: "",
  country: "",
  pinCode: "",
  avatarUrl: "",
};

const PHONE_RE = /^[0-9+()\-\s]{7,15}$/;
const PIN_RE = /^[0-9]{6}$/;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = "Full name is required";
  if (form.phone && !PHONE_RE.test(form.phone.trim())) errors.phone = "Enter a valid phone number";
  if (form.pinCode && !PIN_RE.test(form.pinCode.trim())) errors.pinCode = "PIN code must be 6 digits";
  if (form.dob && new Date(form.dob) > new Date()) errors.dob = "Date of birth can't be in the future";
  return errors;
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export default function Profile() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [refundBalance, setRefundBalance] = useState(0);
  const [refundLoading, setRefundLoading] = useState(true);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const loadProfile = useCallback(async () => {
    setStatus("loading");
    setLoadError(null);
    try {
      const res = await api.get("/patient/profile");
      const data = {
        ...EMPTY_FORM,
        ...res.data,
        dob: res.data.dob ? res.data.dob.split("T")[0] : "",
      };
      setProfile(data);
      setForm(data);
      setStatus("ready");
    } catch (err) {
      setLoadError(
        err?.response?.status === 401
          ? "Your session has expired. Please log in again."
          : "Couldn't load your profile. Check your connection and try again."
      );
      setStatus("error");
    }
  }, []);

  const loadRefundBalance = useCallback(async () => {
    setRefundLoading(true);
    try {
      const res = await api.get("/patient/refund-balance");
      setRefundBalance(res.data?.refundBalance ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setRefundLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadRefundBalance();
  }, [loadProfile, loadRefundBalance]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const isDirty = useMemo(() => {
    if (!profile) return false;
    return JSON.stringify(profile) !== JSON.stringify(form) || !!avatarFile;
  }, [profile, form, avatarFile]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function removeAvatarSelection() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
  }

  async function saveProfile() {
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    if (!isDirty) return;

    setSaving(true);
    try {
      let avatarUrl = form.avatarUrl;

      if (avatarFile) {
        setAvatarUploading(true);
        const fd = new FormData();
        fd.append("file", avatarFile);
        const uploadRes = await api.post("/patient/avatar", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        avatarUrl = uploadRes.data?.avatarUrl || avatarUrl;
        setAvatarUploading(false);
      }

      const payload = {
        ...form,
        dob: form.dob && form.dob.trim() !== "" ? form.dob : null,
        avatarUrl,
      };
      const res = await api.put("/patient/profile", payload);
      const updated = { ...payload, ...(res.data || {}), avatarUrl };
      setProfile(updated);
      setForm(updated);
      removeAvatarSelection();
      localStorage.setItem("name", updated.fullName);
      toast.success("Profile saved successfully.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      toast.error(msg || "Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
      setAvatarUploading(false);
    }
  }

  function discardChanges() {
    setForm(profile);
    setErrors({});
    removeAvatarSelection();
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    toast.success("Logged out successfully.");
    setTimeout(() => navigate("/"), 500);
  }

  /* ---------------------------- render states ---------------------------- */

  if (status === "loading") return <ProfileSkeleton />;

  if (status === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 20px",
          backgroundColor: T.cream,
          fontFamily: INTER
        }}>

        <BrandFont />

        <div
          style={{
            maxWidth: 380,
            width: "100%",
            borderRadius: 26,
            padding: "36px 32px",
            textAlign: "center",
            backgroundColor: T.white,
            border: `1px solid ${T.border}`,
            boxShadow: "0 24px 60px -30px rgba(22,51,43,.3)"
          }}>

          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              backgroundColor: T.redLight
            }}>

            <AlertCircle size={22} color={T.red} />
          </div>

          <h2
            style={{
              fontFamily: FRAUNCES,
              fontWeight: 600,
              fontSize: 19,
              color: T.ink,
              margin: "0 0 6px"
            }}>
            Couldn't load your profile
          </h2>

          <p
            style={{
              fontSize: 13.5,
              color: T.muted,
              margin: "0 0 22px",
              lineHeight: 1.6
            }}>{loadError}
          </p>

          <button
            onClick={loadProfile}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              fontWeight: 600,
              padding: "11px 22px",
              borderRadius: 999,
              color: T.white,
              backgroundColor: T.green,
              border: "none",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      </div>
    );
  }

  const displayAvatar = avatarPreview
    ? avatarPreview
    : form.avatarUrl ? `http://localhost:5008${form.avatarUrl}` : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: T.cream,
        fontFamily: INTER,
        paddingBottom: 110
      }}>
      <BrandFont />
      <Toaster position="top-right" />

      {/* ── Header band ── */}
      <div
        style={{
          width: "100%",
          maxWidth: "1500px",
          margin: "0 auto",
          padding: "48px 40px 24px",
        }}
      >

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10
          }}>

          <ShieldCheck size={13} color={T.terra} />

          <p
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: T.terra,
              margin: 0
            }}>
            Account
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 14
          }}>

          <h1
            style={{
              fontFamily: FRAUNCES,
              fontWeight: 500,
              fontSize: "clamp(30px, 4vw, 42px)",
              color: T.ink,
              lineHeight: 1.05,
              margin: 0
            }}>
            My Profile
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>

            {isDirty && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "7px 13px",
                  borderRadius: 999,
                  backgroundColor: T.terraLight,
                  color: T.terra,
                  border: `1px solid ${T.terra}33`
                }}>

                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: T.terra,
                    display: "inline-block"
                  }} />
                Unsaved changes
              </span>
            )}

            <button
              onClick={handleLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13.5,
                fontWeight: 600,
                padding: "10px 18px",
                borderRadius: 999,
                color: T.red,
                backgroundColor: T.white,
                border: `1px solid ${T.border}`,
                cursor: "pointer"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.red)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        <p style={{
          marginTop: 8,
          fontSize: 14,
          color: T.muted
        }}>Manage the details tied to your account and bookings.
        </p>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: "1500px",
          margin: "0 auto",
          padding: "0 40px",
        }}
      >

        <div
          style={{
            borderRadius: 32,
            overflow: "hidden",
            backgroundColor: T.white,
            border: `1px solid ${T.border}`,
            boxShadow: "0 30px 70px -40px rgba(22,51,43,.35)"
          }}>

          {/* Identity strip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "32px",
              borderBottom: `1px solid ${T.border}`,
              background: `linear-gradient(180deg, ${T.greenLight} 0%, ${T.white} 100%)`
            }}>

            <div
              style={{ position: "relative", flexShrink: 0 }}>
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt=""
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `4px solid ${T.white}`,
                    boxShadow: "0 6px 20px rgba(22,51,43,.15)"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 104,
                    height: 104,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: T.green,
                    border: `4px solid ${T.white}`,
                    boxShadow: "0 6px 20px rgba(22,51,43,.15)"
                  }}>

                  <span
                    style={{
                      fontFamily: FRAUNCES,
                      fontSize: 30,
                      color: T.white,
                      fontWeight: 500
                    }}>{initials(form.fullName)}
                  </span>

                </div>
              )}

              <label
                htmlFor="avatar-upload"
                title="Change photo"
                style={{
                  position: "absolute",
                  bottom: -2,
                  right: -2,
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  backgroundColor: T.terra,
                  boxShadow: "0 4px 12px rgba(193,99,59,.4)"
                }}
              >
                {avatarUploading ?
                  <Loader2
                    size={15}
                    color={T.white}
                    style={{ animation: "spin .8s linear infinite" }}
                  /> :
                  <Camera
                    size={15}
                    color={T.white}
                  />}

              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarSelect}
              />

              {avatarPreview && (
                <button
                  onClick={removeAvatarSelection}
                  title="Remove selected photo"
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: T.white,
                    border: `1px solid ${T.border}`,
                    cursor: "pointer"
                  }}
                >
                  <X size={13} color={T.ink} />
                </button>
              )}
            </div>

            <div style={{ minWidth: 0 }}>

              <h2
                style={{
                  fontFamily: FRAUNCES,
                  fontWeight: 600,
                  fontSize: 24,
                  color: T.ink,
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                {form.fullName || "Patient"}
              </h2>

              <p style={{
                fontSize: 13.5,
                color: T.muted,
                margin: "4px 0 0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {form.email}
              </p>
            </div>
          </div>

          {/* Refund balance */}
          <div
            style={{
              padding: "28px 32px",
              borderBottom: `1px solid ${T.border}`
            }}>

            <div
              style={{
                borderRadius: 18,
                padding: "20px 24px",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                backgroundColor: T.greenLight,
                border: `1px solid ${T.green}1A`
              }}>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14
                }}>

                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: T.green,
                    flexShrink: 0
                  }}>
                  <IndianRupee size={19} color={T.white} strokeWidth={2.25} />
                </div>

                <div>
                  <p
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: T.green,
                      opacity: 0.8,
                      margin: 0
                    }}>Refund Balance
                  </p>

                  <p
                    style={{
                      fontSize: 13,
                      color: T.muted,
                      margin: "3px 0 0"
                    }}
                  >Applied automatically at your next appointment
                  </p>
                </div>
              </div>

              <div>
                {refundLoading ? (
                  <Loader2
                    size={22}
                    color={T.green}
                    style={{ animation: "spin .8s linear infinite" }}
                  />
                ) : (
                  <h3
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontFamily: FRAUNCES,
                      fontSize: "clamp(26px, 3vw, 32px)",
                      color: T.green,
                      margin: 0,
                      fontWeight: 500
                    }}>

                    <IndianRupee size={24} strokeWidth={2.25} />
                    {refundBalance}
                  </h3>
                )}

              </div>
            </div>
          </div>

          {/* Form */}
          <div
            style={{ padding: "32px" }}>

            <p
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: T.muted,
                margin: "0 0 20px"
              }}>
              Personal Details
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 20
              }}>

              <FormField
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                error={errors.fullName}
                required
              />

              <FormField
                label="Email"
                name="email"
                value={form.email}
                disabled hint="Email can't be changed here — it's your login ID."
              />

              <FormField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="e.g. +91 98765 43210"
              />

              <FormField as="select"
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </FormField>

              <FormField
                type="date"
                label="Date of Birth"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                error={errors.dob}
                max={new Date().toISOString().split("T")[0]}
              />

              <FormField as="select"
                label="Blood Group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleChange}
              >

                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg}>{bg}</option>
                ))}
              </FormField>

              <FormField as="textarea"
                rows={3}
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                fullWidth
              />

              <FormField
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
              />

              <FormField
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
              />

              <FormField
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
              />

              <FormField
                label="PIN Code"
                name="pinCode"
                value={form.pinCode}
                onChange={handleChange}
                error={errors.pinCode}
                placeholder="6-digit PIN code"
              />
            </div>
          </div>

          {/* Desktop actions */}
          <div className="cc-desktop-actions"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              padding: "0 32px 32px"
            }}>

            {isDirty && (
              <button
                onClick={discardChanges}
                disabled={saving}
                style={{
                  padding: "13px 26px",
                  borderRadius: 999,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  opacity: saving
                    ? 0.6
                    : 1,
                  backgroundColor: T.cream,
                  color: T.ink,
                  border: `1.5px solid ${T.border}`
                }}
              >
                Discard
              </button>
            )}
            <SaveButton
              saving={saving}
              isDirty={isDirty}
              onClick={saveProfile}
            />
          </div>
        </div>
      </div>

      {/* Mobile sticky action bar */}
      {isDirty && (
        <div className="cc-mobile-actions"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "none",
            gap: 12,
            padding: 16,
            zIndex: 20,
            backgroundColor: T.white,
            borderTop: `1px solid ${T.border}`,
            boxShadow: "0 -8px 24px rgba(22,51,43,.08)"
          }}>

          <button
            onClick={discardChanges}
            disabled={saving}
            style={{
              flex: 1,
              padding: "14px 0",
              borderRadius: 999,
              fontWeight: 600,
              fontSize: 14,
              opacity: saving
                ? 0.6
                : 1,
              backgroundColor: T.cream,
              color: T.ink,
              border: `1.5px solid ${T.border}`
            }}
          >
            Discard
          </button>
          <div style={{ flex: 1.4 }}>
            <SaveButton
              saving={saving}
              isDirty={isDirty}
              onClick={saveProfile} full
            />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .cc-desktop-actions { display: none !important; }
          .cc-mobile-actions { display: flex !important; }
        }
      `}</style>
    </div>
  );
}

function BrandFont() {
  return <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap');@keyframes spin{to{transform:rotate(360deg)}}`}</style>;
}

function SaveButton({ saving, isDirty, onClick, full }) {
  return (
    <button
      onClick={onClick}
      disabled={saving || !isDirty}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: full ? "14px 0" : "13px 34px",
        width: full ? "100%" : "auto",
        borderRadius: 999,
        color: T.white,
        fontWeight: 600,
        fontSize: 14,
        backgroundColor: T.green,
        border: "none",
        cursor: saving || !isDirty ? "not-allowed" : "pointer",
        opacity: saving || !isDirty ? 0.6 : 1,
        transition: "background-color .15s ease",
      }}
      onMouseEnter={(e) => !saving && isDirty && (e.currentTarget.style.backgroundColor = T.greenSoft)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = T.green)}
    >
      {saving ? <Loader2
        size={15}
        style={{
          animation: "spin .8s linear infinite"
        }} />
        : <Save size={15}
        />}
      {saving ? "Saving…" : "Save Changes"}
    </button>
  );
}

/* ─── Reusable field ──────────────────────────── */
function FormField({
  as = "input",
  type = "text",
  label,
  name,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  placeholder,
  fullWidth = false,
  children,
  rows,
  max,
}) {
  const fieldStyle = {
    width: "100%",
    borderRadius: 12,
    border: `1.5px solid ${error ? "#E5A08A" : T.border}`,
    padding: as === "textarea" ? "12px 14px" : "0 14px",
    height: as === "textarea" ? "auto" : 46,
    color: T.ink,
    backgroundColor: disabled ? T.cream : T.white,
    fontFamily: INTER,
    fontSize: 14.5,
    outline: "none",
    transition: "border-color .15s ease, box-shadow .15s ease",
  };

  return (
    <div
      style={{
        gridColumn: fullWidth
          ? "1 / -1"
          : "auto"
      }}>

      <label
        htmlFor={name}
        style={{
          display: "block",
          marginBottom: 7,
          fontSize: 13,
          fontWeight: 500,
          color: T.ink
        }}>
        {label}
        {required &&
          <span
            style={{ color: T.terra }}
          >*
          </span>}
      </label>

      {as === "select" ? (
        <select
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          style={fieldStyle} className="cc-input"
        >
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          style={fieldStyle} className="cc-input"
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          max={max}
          aria-invalid={!!error}
          style={fieldStyle}
          className="cc-input"
        />
      )}

      {error &&
        <p
          style={{
            marginTop: 6,
            fontSize: 12,
            color: T.red
          }}
        >{error}
        </p>}

      {!error && hint &&
        <p
          style={{
            marginTop: 6,
            fontSize: 12,
            color: T.muted
          }}
        >
          {hint}
        </p>}

      <style>
        {`.cc-input:focus{border-color:${T.green}!important;box-shadow:0 0 0 3px rgba(22,51,43,.08);}`}
      </style>
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────── */
function ProfileSkeleton() {
  const pulse = { backgroundColor: T.creamDark, animation: "cc-pulse 1.4s ease-in-out infinite" };
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        backgroundColor: T.cream
      }}>

      <style>
        {`@keyframes cc-pulse{0%,100%{opacity:1}50%{opacity:.55}}`}
      </style>

      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          borderRadius: 32,
          padding: 32,
          backgroundColor: T.white,
          border: `1px solid ${T.border}`
        }}>

        <div
          style={{
            height: 34,
            width: 200,
            borderRadius: 10,
            marginBottom: 10, ...pulse
          }}
        />

        <div
          style={{
            height: 14,
            width: 280,
            borderRadius: 8,
            marginBottom: 30,
            ...pulse
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28
          }}
        >
          <div
            style={{
              width: 104,
              height: 104,
              borderRadius: "50%",
              ...pulse
            }}
          />

          <div>
            <div
              style={{
                height: 22,
                width: 160,
                borderRadius: 8,
                marginBottom: 8,
                ...pulse
              }} />
            <div
              style={{
                height: 14,
                width: 200,
                borderRadius: 6,
                ...pulse
              }}
            />
          </div>
        </div>

        <div
          style={{
            height: 88,
            borderRadius: 18,
            marginBottom: 28,
            ...pulse
          }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 20
          }}>
          {[...Array(8)].map((_, i) => (
            <div key={i}
              style={{
                height: 46,
                borderRadius: 12,
                ...pulse
              }}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}