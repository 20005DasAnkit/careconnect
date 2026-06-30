import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import { Toaster, toast } from "react-hot-toast";
import {
  AlertCircle, RefreshCw, Loader2, Save, IndianRupee, CheckCircle2,
} from "lucide-react";

/* ─── Tokens (kept consistent with the rest of the app) ─── */
const T = {
  cream:      "#F5F0E8",
  creamDark:  "#EDE7D9",
  green:      "#2D5016",
  greenLight: "#EBF2E3",
  terra:      "#C4622D",
  ink:        "#16332B",
  muted:      "#6B7280",
  border:     "#E2DACE",
  white:      "#FFFFFF",
  red:        "#DC2626",
  redLight:   "#FEE2E2",
};

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

export default function Profile() {
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadError, setLoadError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [refundBalance, setRefundBalance] = useState(0);
  const [refundLoading, setRefundLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setStatus("loading");
    setLoadError(null);
    try {
      const res = await api.get("/patient/profile");
      const data = { ...EMPTY_FORM, ...res.data };
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
      // Non-critical — fail silently but keep the section visible at ₹0
      console.error(err);
    } finally {
      setRefundLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadRefundBalance();
  }, [loadProfile, loadRefundBalance]);

  const isDirty = useMemo(() => {
    if (!profile) return false;
    return JSON.stringify(profile) !== JSON.stringify(form);
  }, [profile, form]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
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
      const res = await api.put("/patient/profile", form);
      const updated = { ...form, ...(res.data || {}) };
      setProfile(updated);
      setForm(updated);
      localStorage.setItem("name", updated.fullName);
      toast.success("Profile saved successfully.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      toast.error(msg || "Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function discardChanges() {
    setForm(profile);
    setErrors({});
  }

  /* ---------------------------- render states ---------------------------- */

  if (status === "loading") return <ProfileSkeleton />;

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: T.cream }}>
        <div className="max-w-sm w-full rounded-[28px] p-8 text-center shadow-xl" style={{ backgroundColor: T.white, border: `1px solid ${T.border}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: T.redLight }}>
            <AlertCircle className="w-6 h-6" style={{ color: T.red }} />
          </div>
          <h2 className="text-base font-semibold mb-1.5" style={{ color: T.ink }}>Couldn't load your profile</h2>
          <p className="text-sm mb-5" style={{ color: T.muted }}>{loadError}</p>
          <button
            onClick={loadProfile}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl text-white"
            style={{ backgroundColor: T.green }}
          >
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: T.cream }}>
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto rounded-[35px] shadow-xl p-6 sm:p-10" style={{ backgroundColor: T.white, border: `1px solid ${T.border}` }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl" style={{ fontFamily: "Playfair Display, serif", color: T.ink }}>
              My Profile
            </h1>
            <p className="mt-2" style={{ color: T.muted }}>Manage your account information</p>
          </div>

          {isDirty && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}
            >
              Unsaved changes
            </span>
          )}
        </div>

        {/* Identity card */}
        <div className="mt-10 flex items-center gap-6">
          <img
            src={form.avatarUrl || "https://i.pravatar.cc/150"}
            alt=""
            className="w-28 h-28 rounded-full object-cover"
            style={{ border: `3px solid ${T.border}` }}
          />
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: T.ink }}>
              {form.fullName || "Patient"}
            </h2>
            <p style={{ color: T.muted }}>{form.email}</p>
          </div>
        </div>

        {/* Refund balance */}
        <div
          className="mt-8 rounded-3xl p-6 sm:p-8"
          style={{ backgroundColor: T.greenLight, border: `1px solid #BBD9A0` }}
        >
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: T.ink }}>
                Refund Balance
              </h2>
              <p className="mt-2 text-sm" style={{ color: T.muted }}>
                Use this balance while booking your next doctor appointment.
              </p>
            </div>
            <div className="text-right">
              {refundLoading ? (
                <Loader2 className="w-7 h-7 animate-spin ml-auto" style={{ color: T.green }} />
              ) : (
                <h1 className="text-4xl sm:text-5xl font-bold flex items-center gap-1" style={{ color: T.green }}>
                  <IndianRupee className="w-8 h-8" /> {refundBalance}
                </h1>
              )}
              <p className="text-sm mt-1" style={{ color: T.green }}>Available Balance</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <FormField label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />

          <FormField label="Email" name="email" value={form.email} disabled hint="Email can't be changed here — it's your login ID." />

          <FormField label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="e.g. +91 98765 43210" />

          <FormField as="select" label="Gender" name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </FormField>

          <FormField type="date" label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} error={errors.dob} max={new Date().toISOString().split("T")[0]} />

          <FormField as="select" label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
            <option value="">Select</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg}>{bg}</option>
            ))}
          </FormField>

          <FormField as="textarea" rows={4} label="Address" name="address" value={form.address} onChange={handleChange} className="md:col-span-2" />

          <FormField label="City" name="city" value={form.city} onChange={handleChange} />
          <FormField label="State" name="state" value={form.state} onChange={handleChange} />
          <FormField label="Country" name="country" value={form.country} onChange={handleChange} />
          <FormField label="PIN Code" name="pinCode" value={form.pinCode} onChange={handleChange} error={errors.pinCode} placeholder="6-digit PIN code" />
        </div>

        {/* Actions */}
        <div className="mt-10 flex justify-end gap-3">
          {isDirty && (
            <button
              onClick={discardChanges}
              disabled={saving}
              className="px-8 py-4 rounded-2xl font-semibold transition-all duration-300 disabled:opacity-60"
              style={{ backgroundColor: T.cream, color: T.ink, border: `1.5px solid ${T.border}` }}
            >
              Discard
            </button>
          )}
          <button
            onClick={saveProfile}
            disabled={saving || !isDirty}
            className="flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: T.ink }}
            onMouseEnter={(e) => !saving && isDirty && (e.currentTarget.style.backgroundColor = "#245242")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = T.ink)}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Reusable field ──────────────────────────── */
function FormField({
  as = "input", type = "text", label, name, value, onChange, error, hint,
  required = false, disabled = false, placeholder, className = "", children, rows, max,
}) {
  const base = "w-full rounded-2xl border px-5 outline-none transition-all duration-300 focus:ring-4";
  const style = {
    color: T.ink,
    borderColor: error ? "#FCA5A5" : T.border,
    backgroundColor: disabled ? T.cream : T.white,
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="block mb-2 text-sm font-medium" style={{ color: T.ink }}>
        {label} {required && <span style={{ color: T.terra }}>*</span>}
      </label>

      {as === "select" ? (
        <select id={name} name={name} value={value} onChange={onChange} disabled={disabled} className={`${base} h-14`} style={{ ...style, ["--tw-ring-color"]: "rgba(45,80,22,0.15)" }}>
          {children}
        </select>
      ) : as === "textarea" ? (
        <textarea id={name} name={name} rows={rows} value={value} onChange={onChange} disabled={disabled} className={`${base} p-5`} style={style} />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          max={max}
          aria-invalid={!!error}
          className={`${base} h-14`}
          style={style}
        />
      )}

      {error && <p className="mt-1.5 text-xs" style={{ color: T.red }}>{error}</p>}
      {!error && hint && <p className="mt-1.5 text-xs" style={{ color: T.muted }}>{hint}</p>}
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────── */
function ProfileSkeleton() {
  const pulse = { backgroundColor: T.creamDark };
  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: T.cream }}>
      <div className="max-w-5xl mx-auto rounded-[35px] shadow-xl p-10" style={{ backgroundColor: T.white, border: `1px solid ${T.border}` }}>
        <div className="h-10 w-56 rounded-xl animate-pulse mb-3" style={pulse} />
        <div className="h-4 w-72 rounded animate-pulse mb-10" style={pulse} />
        <div className="flex items-center gap-6 mb-8">
          <div className="w-28 h-28 rounded-full animate-pulse" style={pulse} />
          <div>
            <div className="h-6 w-40 rounded animate-pulse mb-2" style={pulse} />
            <div className="h-4 w-52 rounded animate-pulse" style={pulse} />
          </div>
        </div>
        <div className="h-32 rounded-3xl animate-pulse mb-10" style={pulse} />
        <div className="grid md:grid-cols-2 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-14 rounded-2xl animate-pulse" style={pulse} />
          ))}
        </div>
      </div>
    </div>
  );
}