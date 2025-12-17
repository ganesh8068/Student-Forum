import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { ClipLoader } from "react-spinners";
import Button from "../components/Button";

function SignIn() {
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
      await axios.post(
        `${import.meta.env.VITE_SERVERURL}/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      );

      setErr("");
      setLoading(false);
      navigate("/");
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
      setErr(
        error?.response?.data?.message ||
          error.message ||
          "Google sign-in failed."
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">

        {/* LEFT — Branding */}
        <div className="hidden md:flex flex-col justify-center px-8 fade-in-up">
          <h1 className="text-5xl font-semibold" style={{ color: "var(--color-secondary)" }}>
            Student Forum 
          </h1>
          <p className="mt-3 text-lg" style={{ color: "var(--text-soft)" }}>
            A community for students — share resources, ask questions, and collaborate.
          </p>

          <img
            src="/student-forum-illustration.png"
            alt="community"
            className="mt-6 w-full max-w-sm"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        {/* RIGHT — Form */}
        <div className="flex items-center justify-center">
          <div
            className="w-full max-w-md p-8 rounded-xl shadow-lg fade-in-up"
            style={{ backgroundColor: "var(--card)" }}
          >
            <h2
              className="text-3xl font-semibold text-center mb-2"
              style={{ color: "var(--color-secondary)" }}
            >
              Welcome back
            </h2>
            <p className="text-center mb-6" style={{ color: "var(--text-soft)" }}>
              Sign in to continue to the community
            </p>

            {/* EMAIL */}
            <div className="mb-4">
              <label className="block mb-1 font-medium" style={{ color: "var(--text-dark)" }}>
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg border focus:outline-none transition"
                style={{
                  borderColor: "#d1d5db",
                  boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                }}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="mb-4">
              <label className="block mb-1 font-medium" style={{ color: "var(--text-dark)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-10 rounded-lg border focus:outline-none transition"
                  style={{
                    borderColor: "#d1d5db",
                    boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                  }}
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

            {/* FORGOT PASSWORD */}
            <div
              className="text-right mb-4 cursor-pointer hover:underline"
              style={{ color: "var(--color-primary)" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </div>

            {/* SIGN IN BUTTON */}
            <Button onClick={handleSignIn} disabled={loading} className="w-full">
              {loading ? <ClipLoader size={18} color="white" /> : "Sign In"}
            </Button>

            {/* ERROR */}
            {err && (
              <p className="text-red-500 text-center mt-3 font-medium">*{err}</p>
            )}

            {/* DIVIDER */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                  Or continue with
                </span>
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
            <p className="text-center mt-6" style={{ color: "var(--text-soft)" }}>
              New here?{" "}
              <span
                className="font-medium cursor-pointer"
                style={{ color: "var(--color-primary)" }}
                onClick={() => navigate("/signup")}
              >
                Create account
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;