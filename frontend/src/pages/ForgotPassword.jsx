import axios from "axios";
import React, { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/send-otp`,
        { email },
        { withCredentials: true }
      );
      setErr("");
      setStep(2);
    } catch (error) {
      setErr(error.response?.data?.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/verify-otp`,
        { email, otp },
        { withCredentials: true }
      );
      setErr("");
      setStep(3);
    } catch (error) {
      setErr(error.response?.data?.message);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/reset-password`,
        { email, newPassword },
        { withCredentials: true }
      );
      navigate("/signin");
    } catch (error) {
      setErr(error.response?.data?.message);
    }
    setLoading(false);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen p-5"
      style={{
        backgroundColor: "#ECF6F5",
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-xl backdrop-blur-md"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid rgba(0,0,0,0.05)"
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <IoIosArrowRoundBack
            size={32}
            className="cursor-pointer transition"
            style={{ color: "var(--color-primary)" }}
            onClick={() => navigate("/signin")}
          />
          <h1
            className="text-2xl font-bold tracking-wide"
            style={{ color: "var(--color-secondary)" }}
          >
            Forgot Password
          </h1>
        </div>

        {/* STEP 1 — Email */}
        {step === 1 && (
          <>
            <div className="mb-5">
              <label
                className="block font-medium mb-1"
                style={{ color: "var(--text-dark)" }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:ring-4 transition"
                style={{
                  borderColor: "#d1d5db",
                  backgroundColor: "var(--card)",
                  color: "var(--text-dark)",
                  focusRingColor: "var(--color-primary)"
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold shadow-md transition flex justify-center"
              style={{ backgroundColor: "var(--color-primary)", color: "white" }}
            >
              {loading ? <ClipLoader size={22} color="white" /> : "Send OTP"}
            </button>

            {err && <p className="text-red-500 text-center mt-3">*{err}</p>}
          </>
        )}

        {/* STEP 2 — OTP */}
        {step === 2 && (
          <>
            <div className="mb-5">
              <label
                className="block font-medium mb-1"
                style={{ color: "var(--text-dark)" }}
              >
                Enter OTP
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:ring-4 transition"
                style={{
                  borderColor: "#d1d5db",
                  backgroundColor: "var(--card)",
                  color: "var(--text-dark)",
                }}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold shadow-md transition flex justify-center"
              style={{ backgroundColor: "var(--color-primary)", color: "white" }}
            >
              {loading ? <ClipLoader size={22} color="white" /> : "Verify OTP"}
            </button>

            {err && <p className="text-red-500 text-center mt-3">*{err}</p>}
          </>
        )}

        {/* STEP 3 — Reset Password */}
        {step === 3 && (
          <>
            <div className="mb-5">
              <label
                className="block font-medium mb-1"
                style={{ color: "var(--text-dark)" }}
              >
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter New Password"
                className="w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:ring-4 transition"
                style={{
                  borderColor: "#d1d5db",
                  backgroundColor: "var(--card)",
                  color: "var(--text-dark)"
                }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label
                className="block font-medium mb-1"
                style={{ color: "var(--text-dark)" }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full rounded-lg px-4 py-2.5 border focus:outline-none focus:ring-4 transition"
                style={{
                  borderColor: "#d1d5db",
                  backgroundColor: "var(--card)",
                  color: "var(--text-dark)"
                }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-semibold shadow-md transition flex justify-center"
              style={{ backgroundColor: "var(--color-primary)", color: "white" }}
            >
              {loading ? <ClipLoader size={22} color="white" /> : "Reset Password"}
            </button>

            {err && <p className="text-red-500 text-center mt-3">*{err}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
