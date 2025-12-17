import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";

function SignUp() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================================
  // EMAIL + PASSWORD SIGN UP
  // ============================================
  const handleSignUp = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/signup`,
        { fullName, email, password, registrationNo },
        { withCredentials: true }
      );

      setErr("");
      setLoading(false);
      navigate("/signin");
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  // ============================================
  // GOOGLE SIGNUP
  // ============================================
  const handleGoogleAuth = async () => {
    if (!registrationNo) {
      return setErr("Registration number is required");
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          registrationNo,
        },
        { withCredentials: true }
      );

      navigate("/signin");
    } catch (error) {
      console.error("Google signup error:", error);
      setErr(
        error?.response?.data?.message ||
          error?.message ||
          "Google signup failed."
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl shadow-xl fade-in-up"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        {/* LOGO */}
        <h2
          className="text-4xl font-extrabold text-center"
          style={{ color: "var(--color-secondary)" }}
        >
          Student Forum and community
        </h2>

        <p
          className="text-center mt-2 mb-8"
          style={{ color: "var(--text-soft)" }}
        >
          Create an account to start learning and exploring.
        </p>

        {/* FULL NAME */}
        <div className="mb-4">
          <label
            className="block font-medium mb-1"
            style={{ color: "var(--text-dark)" }}
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border transition focus:ring-4"
            style={{
              borderColor: "#d1d5db",
              focusRingColor: "var(--color-primary)",
            }}
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* EMAIL */}
        <div className="mb-4">
          <label
            className="block font-medium mb-1"
            style={{ color: "var(--text-dark)" }}
          >
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg border transition focus:ring-4"
            style={{ borderColor: "#d1d5db" }}
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* REGISTRATION NUMBER */}
        <div className="mb-4">
          <label
            className="block font-medium mb-1"
            style={{ color: "var(--text-dark)" }}
          >
            Registration Number
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border transition focus:ring-4"
            style={{ borderColor: "#d1d5db" }}
            placeholder="Enter registration number"
            value={registrationNo}
            onChange={(e) => setRegistrationNo(e.target.value)}
            required
          />
        </div>

        {/* PASSWORD */}
        <div className="mb-4">
          <label
            className="block font-medium mb-1"
            style={{ color: "var(--text-dark)" }}
          >
            Password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-3 pr-10 rounded-lg border transition focus:ring-4"
              style={{ borderColor: "#d1d5db" }}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        {/* SIGN UP BUTTON */}
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold transition shadow-md flex justify-center"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
        </button>

        {err && <p className="text-red-500 text-center mt-3">{err}</p>}

        {/* DIVIDER */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* GOOGLE BUTTON */}
        <button
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border hover:bg-gray-100 transition"
        >
          <FcGoogle size={20} />
          <span className="font-medium">Sign up with Google</span>
        </button>

        {/* SIGNIN REDIRECT */}
        <p className="text-center mt-6" style={{ color: "var(--text-soft)" }}>
          Already have an account?{" "}
          <span
            className="cursor-pointer font-medium hover:underline"
            style={{ color: "var(--color-primary)" }}
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
