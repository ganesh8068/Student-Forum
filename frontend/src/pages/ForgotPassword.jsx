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
    <div className="flex w-full items-center justify-center min-h-screen p-5 bg-gradient-to-br from-orange-100 via-white to-orange-200">
      <div className="backdrop-blur-md w-full max-w-md bg-white/70 border border-white shadow-xl rounded-2xl p-8">
        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <IoIosArrowRoundBack
            size={32}
            className="text-orange-500 hover:text-orange-600 transition cursor-pointer"
            onClick={() => navigate("/signin")}
          />
          <h1 className="text-2xl font-bold text-orange-600 tracking-wide">
            Forgot Password
          </h1>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                placeholder="Enter your Email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full py-2.5 font-semibold bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 transition"
            >
              {loading ? <ClipLoader size={22} color="white" /> : "Send OTP"}
            </button>

            {err && <p className="text-red-500 text-center mt-3">*{err}</p>}
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-1">
                Enter OTP
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
              />
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full py-2.5 font-semibold bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 transition"
            >
              {loading ? <ClipLoader size={22} color="white" /> : "Verify OTP"}
            </button>

            {err && <p className="text-red-500 text-center mt-3">*{err}</p>}
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                placeholder="Enter New Password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full py-2.5 font-semibold bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 transition"
            >
              {loading ? (
                <ClipLoader size={22} color="white" />
              ) : (
                "Reset Password"
              )}
            </button>

            {err && <p className="text-red-500 text-center mt-3">*{err}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
