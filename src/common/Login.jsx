import React, { useState } from "react";
import { FaUser, FaLock, FaSpinner, FaArrowRight, FaEnvelope, FaKey, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { adminLogin, forgotPassword, resendOtp, verifyResetOtp, resetPassword } from "../Interceptor/interceptor";
import { useAuth } from "./authContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Forgot password states
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [forgotData, setForgotData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpResendDisabled, setOtpResendDisabled] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await adminLogin(formData);
      login(response.token, response.admin, response.admin.permissions);
      localStorage.setItem("Token", response.token);
      localStorage.setItem(
        "UserPermissions",
        JSON.stringify(response.admin.permissions)
      );
      navigate("/products");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Start OTP timer
  const startOtpTimer = () => {
    setOtpTimer(60);
    setOtpResendDisabled(true);
    
    const timerInterval = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          setOtpResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send email for OTP
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (!forgotData.email) {
      setError("Please enter your email");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // REPLACED: Using actual forgotPassword API
      const response = await forgotPassword({ email: forgotData.email });
      console.log(response,"this is the respsuce");
      
      
      if (response.success) {
        startOtpTimer();
        setForgotStep(2);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!forgotData.otp || forgotData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // REPLACED: Using actual verifyResetOtp API
      const response = await verifyResetOtp({ 
        email: forgotData.email, 
        otp: forgotData.otp 
      });
      
      if (response.success) {
        setForgotStep(3);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotData.newPassword || !forgotData.confirmPassword) {
      setError("Please enter new password and confirm it");
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (forgotData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // REPLACED: Using actual resetPassword API
      const response = await resetPassword({
        email: forgotData.email,
        otp: forgotData.otp,
        newPassword: forgotData.newPassword
      });
      
      if (response.success) {
        setForgotStep(4);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpResendDisabled) return;

    setLoading(true);
    try {
      // REPLACED: Using actual resendOtp API
      const response = await resendOtp({ email: forgotData.email });
      
      if (response.success) {
        startOtpTimer();
        setError("OTP resent successfully!");
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotStep(1);
    setForgotData({ email: "", otp: "", newPassword: "", confirmPassword: "" });
    setError("");
  };

  const handleBackToOtp = () => {
    setForgotStep(2);
    setError("");
  };

  const renderForgotPasswordForm = () => {
    switch (forgotStep) {
      case 1: // Email input
        return (
          <form onSubmit={handleForgotEmailSubmit} className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-lg inline-flex mb-4">
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
              <p className="text-white/70 text-sm mt-2">
                Enter your email to receive a reset OTP
              </p>
            </div>

            {error && (
              <div className="text-red-300 bg-red-800/30 border border-red-500/30 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="flex items-center bg-white/10 px-4 py-3 rounded-lg border border-white/15 focus-within:border-purple-400 transition">
              <FaEnvelope className="mr-3 opacity-70" />
              <input
                type="email"
                name="email"
                placeholder="Enter your registered email"
                value={forgotData.email}
                onChange={handleForgotChange}
                required
                className="bg-transparent outline-none text-sm w-full placeholder-white/70"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 py-3 rounded-full font-semibold flex items-center justify-center group disabled:opacity-70"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <span>Send OTP</span>
                  <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full text-white/70 hover:text-white py-2 text-sm transition-colors flex items-center justify-center"
            >
              <FaArrowLeft className="mr-2" />
              Back to Login
            </button>
          </form>
        );

      case 2: // OTP verification
        return (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-4 rounded-full shadow-lg inline-flex mb-4">
                <FaKey className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
              <p className="text-white/70 text-sm mt-2">
                Enter the 6-digit OTP sent to <br />
                <span className="font-medium">{forgotData.email}</span>
              </p>
            </div>

            {error && (
              <div className="text-red-300 bg-red-800/30 border border-red-500/30 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="flex items-center bg-white/10 px-4 py-3 rounded-lg border border-white/15 focus-within:border-purple-400 transition">
              <FaKey className="mr-3 opacity-70" />
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={forgotData.otp}
                onChange={handleForgotChange}
                maxLength="6"
                pattern="\d{6}"
                required
                className="bg-transparent outline-none text-sm w-full placeholder-white/70 text-center tracking-widest text-lg"
              />
            </div>

            <div className="text-center">
              {otpTimer > 0 ? (
                <p className="text-white/60 text-sm">
                  Resend OTP in <span className="font-bold">{otpTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpResendDisabled || loading}
                  className="text-purple-300 hover:text-purple-200 text-sm transition-colors disabled:opacity-50"
                >
                  Didn't receive OTP? Resend
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="flex-1 border border-white/30 text-white py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all duration-300 py-3 rounded-full font-semibold disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </button>
            </div>
          </form>
        );

      case 3: // New password
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-full shadow-lg inline-flex mb-4">
                <FaLock className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">New Password</h2>
              <p className="text-white/70 text-sm mt-2">
                Create a new password for your account
              </p>
            </div>

            {error && (
              <div className="text-red-300 bg-red-800/30 border border-red-500/30 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="flex items-center bg-white/10 px-4 py-3 rounded-lg border border-white/15 focus-within:border-purple-400 transition">
              <FaLock className="mr-3 opacity-70" />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={forgotData.newPassword}
                onChange={handleForgotChange}
                required
                className="bg-transparent outline-none text-sm w-full placeholder-white/70"
              />
            </div>

            <div className="flex items-center bg-white/10 px-4 py-3 rounded-lg border border-white/15 focus-within:border-purple-400 transition">
              <FaLock className="mr-3 opacity-70" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={forgotData.confirmPassword}
                onChange={handleForgotChange}
                required
                className="bg-transparent outline-none text-sm w-full placeholder-white/70"
              />
            </div>

            <div className="text-xs text-white/50 space-y-1">
              <p>• Password must be at least 6 characters long</p>
              <p>• Use a combination of letters, numbers, and symbols</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBackToOtp}
                className="flex-1 border border-white/30 text-white py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-300 py-3 rounded-full font-semibold disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>
        );

      case 4: // Success
        return (
          <div className="text-center space-y-6">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-full shadow-lg inline-flex mb-4">
              <FaCheckCircle className="text-white text-4xl" />
            </div>
            
            <h2 className="text-2xl font-bold text-white">Password Reset Successful!</h2>
            
            <p className="text-white/70 text-sm">
              Your password has been reset successfully. You can now login with your new password.
            </p>

            <div className="bg-green-800/30 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                <span className="font-semibold">Email:</span> {forgotData.email}
              </p>
              <p className="text-green-300 text-sm mt-1">
                <span className="font-semibold">Status:</span> Password updated
              </p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 py-3 rounded-full font-semibold"
            >
              Go to Login
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-800 to-slate-900 text-white">
      {/* Left Section */}
      <div className="hidden md:flex flex-col justify-center items-center w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522204502070-9c9254216759?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="relative z-10 text-center px-8">
          <h1 className="text-5xl font-extrabold tracking-wide mb-4 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
            {showForgotPassword ? "Reset Password" : "Welcome Back"}
          </h1>
          <p className="text-slate-200 text-lg max-w-md mx-auto leading-relaxed">
            {showForgotPassword 
              ? "Secure password reset process to protect your account."
              : "Manage your platform efficiently with our modern admin dashboard."
            }
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center justify-center w-full md:w-1/2 px-6 py-12 relative">
        {showForgotPassword ? (
          <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10">
            {renderForgotPasswordForm()}
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 relative z-10"
          >
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full shadow-lg">
                <FaUser className="text-white text-3xl" />
              </div>
            </div>

            <h2 className="text-center text-2xl font-bold mb-6 text-white tracking-wide">
              Admin Login
            </h2>

            {error && (
              <div className="text-red-300 bg-red-800/30 border border-red-500/30 text-sm p-3 rounded-lg mb-4 text-center">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex items-center bg-white/10 px-4 py-3 rounded-lg mb-4 border border-white/15 focus-within:border-purple-400 transition">
              <FaUser className="mr-3 opacity-70" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-transparent outline-none text-sm w-full placeholder-white/70"
              />
            </div>

            {/* Password */}
            <div className="flex items-center bg-white/10 px-4 py-3 rounded-lg mb-6 border border-white/15 focus-within:border-purple-400 transition">
              <FaLock className="mr-3 opacity-70" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-transparent outline-none text-sm w-full placeholder-white/70"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right mb-6">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-purple-300 hover:text-purple-200 text-sm transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transition-all duration-300 py-3 rounded-full font-semibold flex items-center justify-center group disabled:opacity-70"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                <>
                  <span>Login</span>
                  <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-white/60 mt-4">
              © {new Date().getFullYear()} Povi's Collections. All Rights Reserved.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;