import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";

function SignIn() {
  const primaryColor = "#ff4d2d";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // =============================
  // NORMAL SIGN-IN
  // =============================
  const handleSignIn = async () => {
    setLoading(true);

    try {
      const result = await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/signin`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      setErr("");
      setLoading(false);
      navigate("/"); // redirect after login
    } catch (error) {
      setErr(error?.response?.data?.message);
      setLoading(false);
    }
  };

  // =============================
  // GOOGLE SIGN-IN
  // =============================

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/google-auth`,
        {
          fullName: result.user.displayName,
          email: result.user.email,
          registrationNo: Date.now().toString(),
        },
        { withCredentials: true }
      );

      navigate("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      setErr(
        error?.response?.data?.message ||
          error.message ||
          "Google sign-in failed."
      );
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-orange-50 to-white">
    <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-orange-100">
      {/* Logo */}
      <h2 className="text-4xl font-extrabold text-orange-500 mb-2 text-center">
        Student Forum
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Welcome back! Sign in to continue 
      </p>

      {/* EMAIL */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Email</label>
        <input
          type="email"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
        />
      </div>

      {/* PASSWORD */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full px-4 py-3 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none transition"
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

      {/* FORGOT */}
      <div
        className="text-right mb-4 text-orange-500 font-medium cursor-pointer hover:underline"
        onClick={() => navigate("/forgot-password")}
      >
        Forgot password?
      </div>

      {/* SIGN IN BUTTON */}
      <button
        className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 transition text-white font-semibold shadow-md flex justify-center"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? <ClipLoader size={20} color="white" /> : "Sign In"}
      </button>

      {err && (
        <p className="text-red-500 text-center mt-3 font-medium">*{err}</p>
      )}

      {/* DIVIDER */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* GOOGLE AUTH */}
      <button
        onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
      >
        <FcGoogle size={20} />
        <span className="font-medium">Sign in with Google</span>
      </button>

      {/* SIGN UP LINK */}
      <p className="text-center mt-6 text-gray-600">
        New here?{" "}
        <span
          className="text-orange-500 font-medium cursor-pointer hover:underline"
          onClick={() => navigate("/signup")}
        >
          Create account
        </span>
      </p>
    </div>
  </div>
);

}

export default SignIn;
