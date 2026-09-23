// components/common/AuthPage.jsx
"use client";

import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { showToast } from "../utils/toast";
  import { usePathname } from "next/navigation";
// import {Loginpopupimage} from "../../../public/Loginpopupimage.jpg";

import {
  Login,
  Register,
  // OTP FLOW DISABLED - Direct password reset flow is currently used.
  // Original OTP logic kept commented for future restoration.
  // Otp,
  // OtpVerify,
  ResetPassword,
  mergeCart,
  mergeWishlist
} from "../interceptor/interseptor";

const AuthPage = ({ onClose }) => {
  const router = useRouter();
  const { login } = useAuth();


const pathname = usePathname();


  /* ================= STATE ================= */

  const [mode, setMode] = useState("login");
  // login | signup | forgot | otp | reset

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [phone, setPhone] = useState("");

  const [form, setForm] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  /* ================= ESC CLOSE ================= */

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);


  useEffect(() => {
  if (typeof window !== "undefined") {
    localStorage.setItem("redirectAfterLogin", pathname);
  }
}, [pathname]);

  /* ================= HELPERS ================= */

  const handleOtpChange = (val, i) => {
    if (!/^\d*$/.test(val)) return;

    const arr = [...otp];
    arr[i] = val.slice(-1);
    setOtp(arr);

    if (val && i < 5) {
      const nextInput = document.getElementById(`otp-${i + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  /* ================= LOGIN ================= */

 const handleLogin = async (e) => {
  e.preventDefault();

  if (!phone || !form.password) {
    return showToast.error("All fields required");
  }

  if (phone.length !== 10) {
    return showToast.error("Phone number must be 10 digits");
  }

  setLoading(true);

  try {
    const res = await Login({
      phone,
      password: form.password,
    });

    if (res?.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      login(res.user);

      await mergeCart();
      await mergeWishlist();

      const redirectPath =
        localStorage.getItem("redirectAfterLogin") || "/";

      localStorage.removeItem("redirectAfterLogin");

      onClose();
      router.push(redirectPath); // 🔥 same page redirect
    }
  } catch (err) {
    showToast.error(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


  /* ================= SIGNUP ================= */

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!form.name || !phone || !form.password || !form.confirmPassword) {
      return showToast.error("All fields required");
    }

    if (phone.length !== 10) {
      return showToast.error("Phone number must be 10 digits");
    }

    if (form.password !== form.confirmPassword) {
      return showToast.error("Passwords do not match");
    }

    if (form.password.length < 6) {
      return showToast.error("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const res = await Register({
        name: form.name,
        phone,
        password: form.password,
      });

      if (res.success) {
        showToast.success("Account created successfully");
        setMode("login");
        setForm({ name: "", password: "", confirmPassword: "" });
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEND OTP ================= */

  // OTP FLOW DISABLED - Direct password reset flow is currently used.
  // Original OTP logic kept commented for future restoration.
  /*
  const handleSendOtp = async () => {
    if (!phone) return showToast.error("Enter phone number");

    if (phone.length !== 10) {
      return showToast.error("Phone number must be 10 digits");
    }

    setLoading(true);

    try {
      const res = await Otp({ phone });

      if (res.success) {
        showToast.success("OTP sent to your phone");
        setMode("otp");
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || "OTP send failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      return showToast.error("Enter complete 6-digit OTP");
    }

    setLoading(true);

    try {
      const res = await OtpVerify({
        phone,
        otp: code,
      });

      if (res.success) {
        showToast.success("OTP verified successfully");
        setMode("reset");
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };
  */

  /* ================= RESET ================= */

  const handleResetPassword = async () => {
    if (!phone || phone.length !== 10) {
      return showToast.error("Phone number must be 10 digits");
    }

    if (form.password.length < 6) {
      return showToast.error("Password must be at least 6 characters");
    }

    if (form.password !== form.confirmPassword) {
      return showToast.error("Passwords do not match");
    }

    setLoading(true);

    try {
      const res = await ResetPassword({
        phone,
        password: form.password,
      });

      if (res.success) {
        showToast.success("Password updated successfully");
        setMode("login");
        setForm({ name: "", password: "", confirmPassword: "" });
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SHARED STYLES ================= */

  const inputClass =
    "w-full h-12 border border-gray-300 rounded-md px-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E8650A] transition";

  const inputClassWithPrefix =
    "w-full h-12 border border-gray-300 rounded-md pl-14 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E8650A] transition";

  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  /* ================= RENDER ================= */

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      {/* MODAL — two-column layout */}
      <div
        className="bg-white  shadow-2xl flex overflow-hidden relative"
        style={{ maxWidth: 780, width: "100%", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* -------- LEFT PANEL — Agriculture Branding Image -------- */}
        <div
          className="relative flex-shrink-0"
          style={{ width: "45%", minHeight: 520 }}
        >
          <img
            src={"/loginpopup.jpg"}
            alt="Agrowmed"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* subtle dark gradient at bottom for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        </div>

        {/* -------- RIGHT PANEL — Auth Form -------- */}
        <div
          className="flex-1 flex flex-col justify-center px-9 py-10 overflow-y-auto"
          style={{ minHeight: 520 }}
        >
          {/* CLOSE button */}
          <button
          type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 text-lg font-bold transition-colors z-10"
          >
            ✕
          </button>

          {/* BACK link (forgot / otp / reset flows) */}
          {mode !== "login" && mode !== "signup" && (
            <button
              onClick={() => {
                setMode("login");
                setOtp(["", "", "", "", "", ""]);
              }}
              className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#E8650A] transition-colors"
            >
              <FiArrowLeft size={14} /> Back to Login
            </button>
          )}

          {/* PAGE TITLE */}
          <h2
            className="text-xl font-bold text-bgvariant-1 mb-6 tracking-wide"
            style={{ letterSpacing: "0.08em" }}
          >
            {mode === "login" && "SIGN IN"}
            {mode === "signup" && "CREATE ACCOUNT"}
            {mode === "forgot" && "FORGOT PASSWORD"}
            {mode === "otp" && "VERIFY OTP"}
            {mode === "reset" && "RESET PASSWORD"}
          </h2>

          {/* ===== LOGIN ===== */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={labelClass}>
                  Phone Number <span className="text-[#E8650A]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={inputClassWithPrefix}
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Password <span className="text-[#E8650A]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    className="w-full h-12 border border-gray-300 rounded-md px-4 pr-10 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#E8650A] transition"
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* LOGIN button — dark charcoal */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-white font-bold bg-bgvariant-3 tracking-widest text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                // style={{ backgroundColor: "#3d3d3d" }}
                // onMouseEnter={(e) =>
                //   (e.currentTarget.style.backgroundColor = "#2a2a2a")
                // }
                // onMouseLeave={(e) =>
                //   (e.currentTarget.style.backgroundColor = "#3d3d3d")
                // }
              >
                {loading ? "LOGGING IN..." : "LOGIN"}
              </button>

              {/* Forgot link */}
              <p className="text-center">
                <span
                  onClick={() => {
                    setMode("reset");
                  }}
                  className="text-sm text-gray-500 underline cursor-pointer hover:text-[#E8650A] transition-colors"
                >
                  Forgot Your Password?
                </span>
              </p>

              {/* CREATE ACCOUNT button — orange */}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setForm({ name: "", password: "", confirmPassword: "" });
                  setPhone("");
                }}
                className="w-full h-12 text-white font-bold bg-bgvariant-1 tracking-widest text-sm rounded-md transition-colors"
                // style={{ backgroundColor: "#E8650A" }}
                // onMouseEnter={(e) =>
                //   (e.currentTarget.style.backgroundColor = "#d15a09")
                // }
                // onMouseLeave={(e) =>
                //   (e.currentTarget.style.backgroundColor = "#E8650A")
                // }
              >
                CREATE ACCOUNT
              </button>
            </form>
          )}

          {/* ===== SIGNUP ===== */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className={labelClass}>
                  Full Name <span className="text-[#E8650A]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  className={inputClass}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Phone Number <span className="text-[#E8650A]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={inputClassWithPrefix}
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Password <span className="text-[#E8650A]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  className={inputClass}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Confirm Password <span className="text-[#E8650A]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  className={inputClass}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-white font-bold bg-bgvariant-3 tracking-widest text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                // style={{ backgroundColor: "#E8650A" }}
                // onMouseEnter={(e) =>
                //   (e.currentTarget.style.backgroundColor = "#d15a09")
                // }
                // onMouseLeave={(e) =>
                //   (e.currentTarget.style.backgroundColor = "#E8650A")
                // }
              >
                {loading ? "CREATING..." : "CREATE ACCOUNT"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setMode("login");
                    setForm({ name: "", password: "", confirmPassword: "" });
                    setPhone("");
                  }}
                  className="text-bgvariant-3 cursor-pointer font-bold hover:underline transition-colors"
                >
                  Sign In
                </span>
              </p>
            </form>
          )}

          {/* OTP FLOW DISABLED - Direct password reset flow is currently used.
              Original OTP logic kept commented for future restoration.
          {mode === "forgot" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-2">
                Enter your phone number to receive an OTP for password reset.
              </p>

              <div>
                <label className={labelClass}>
                  Phone Number <span className="text-[#E8650A]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={inputClassWithPrefix}
                    maxLength={10}
                  />
                </div>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-12 text-white font-bold bg-bgvariant-3 tracking-widest text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "SENDING..." : "SEND OTP"}
              </button>
            </div>
          )}

          {mode === "otp" && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500 text-center">
                Enter the 6-digit OTP sent to{" "}
                <span className="font-semibold text-gray-800">
                  +91 {phone}
                </span>
              </p>

              <div className="flex justify-center gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !digit && i > 0) {
                        const prevInput = document.getElementById(
                          `otp-${i - 1}`
                        );
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    className="w-11 border-2 border-gray-300 rounded-md text-center text-lg font-bold text-gray-800 focus:outline-none focus:border-[#E8650A] transition"
                    style={{ height: 48 }}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full h-12 text-white font-bold tracking-widest text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#3d3d3d" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#2a2a2a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3d3d3d")
                }
              >
                {loading ? "VERIFYING..." : "VERIFY OTP"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Didn't receive OTP?{" "}
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-[#E8650A] font-semibold hover:underline transition-colors disabled:opacity-50"
                >
                  Resend
                </button>
              </p>
            </div>
          )}
          */}

          {/* ===== RESET PASSWORD ===== */}
          {mode === "reset" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-1">
                Enter your phone number and create a new password for your account.
              </p>

              <div>
                <label className={labelClass}>
                  Phone Number <span className="text-[#E8650A]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={handlePhoneChange}
                    className={inputClassWithPrefix}
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  New Password <span className="text-[#E8650A]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  className={inputClass}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Confirm Password <span className="text-[#E8650A]">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  className={inputClass}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
              </div>

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full h-12 text-white font-bold tracking-widest text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#E8650A" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#d15a09")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#E8650A")
                }
              >
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;