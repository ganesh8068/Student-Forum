import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";

function SignUp() {
  const primaryColor = "#ff4d2d";
  const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ============================
  // SIGNUP WITH EMAIL & PASSWORD
  // ============================
  const handleSignUp = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          registrationNo,
        },
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

  // ============================
  // GOOGLE AUTH SIGNUP
  // ============================

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
          error.message ||
          "Google signup failed."
      );
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-orange-50 to-white">
    <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-orange-100">
      {/* Logo */}
      <h2 className="text-4xl font-extrabold text-orange-500 mb-2 text-center">
        Vingo
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Create an account to start exploring delicious meals 🍽️
      </p>

      {/* FULL NAME */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Full Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 
          focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
          placeholder="Enter your full name"
          onChange={(e) => setFullName(e.target.value)}
          value={fullName}
          required
        />
      </div>

      {/* EMAIL */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">Email</label>
        <input
          type="email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 
          focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />
      </div>

      {/* REGISTRATION NO */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Registration Number
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 
          focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
          placeholder="Enter your registration number"
          onChange={(e) => setRegistrationNo(e.target.value)}
          value={registrationNo}
          required
        />
      </div>

      {/* PASSWORD */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 
            focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
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
        className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 
        transition text-white font-semibold shadow-md flex justify-center"
      >
        {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
      </button>

      {err && (
        <p className="text-red-500 text-center mt-3 font-medium">*{err}</p>
      )}

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* GOOGLE SIGN UP */}
      <button
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-lg 
        border border-gray-300 hover:bg-gray-100 transition"
      >
        <FcGoogle size={20} />
        <span className="font-medium">Sign up with Google</span>
      </button>

      {/* Login Redirect */}
      <p className="text-center mt-6 text-gray-600">
        Already have an account?{" "}
        <span
          className="text-orange-500 font-medium cursor-pointer hover:underline"
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
