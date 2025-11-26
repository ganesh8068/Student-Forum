// ./controllers/auth.controllers.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

const getCookieOptions = () => {
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // secure cookies in production
    sameSite: isProd ? "none" : "lax", // if front and back are on different origins in prod, use 'none'
    maxAge,
  };
};

const stripSensitive = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.resetOtp;
  delete obj.otpExpires;
  return obj;
};

export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, registrationNo } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ message: "Full name and email are required." });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists." });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters." });
    }

    if (!registrationNo || registrationNo.length < 8) {
      return res
        .status(400)
        .json({ message: "Registration number must be at least 8 characters." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user = await User.create({
      fullName,
      email,
      registrationNo,
      password: hashedPassword,
    });

    const token = genToken(user._id);
    if (!token) {
      return res.status(500).json({ message: "Token generation failed." });
    }

    res.cookie("token", token, getCookieOptions());
    return res.status(201).json(stripSensitive(user));
  } catch (error) {
    console.error("Sign up error:", error);
    return res.status(500).json({ message: "Sign up error", error: error.message });
  }
};

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password." });
    }

    const token = genToken(user._id);
    if (!token) {
      return res.status(500).json({ message: "Token generation failed." });
    }

    res.cookie("token", token, getCookieOptions());
    return res.status(200).json(stripSensitive(user));
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(500).json({ message: "Sign in error", error: error.message });
  }
};

export const signOut = async (req, res) => {
  try {
    // Use same options as when setting cookie so clearing works consistently (sameSite, secure, path)
    res.clearCookie("token", getCookieOptions());
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Sign out error:", error);
    return res.status(500).json({ message: "Sign out error", error: error.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetOtp = otp;
    // store otpExpires as a Date object
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000);
    user.isOtpVerified = false;
    await user.save();

    await sendOtpMail(email, otp);
    return res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ message: "Send OTP error", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User does not exist." });
    }

    // check otp
    if (!user.resetOtp || user.resetOtp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // robust expiry check for Date/string/number
    const expiresAt = user.otpExpires
      ? (typeof user.otpExpires.getTime === "function"
          ? user.otpExpires.getTime()
          : new Date(user.otpExpires).getTime())
      : 0;

    if (!expiresAt || expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired." });
    }

    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Verify OTP error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.isOtpVerified) {
      return res.status(400).json({ message: "OTP verification required." });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isOtpVerified = false;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Reset password error", error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = req.user || (await User.findById(req.userId).select("-password -resetOtp -otpExpires"));
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ message: "Get current user error", error: error.message });
  }
};


export const googleAuth = async (req, res) => {
  try {
    const { fullName, email, registrationNo } = req.body;

    if (!email || !fullName || !registrationNo) {
      return res.status(400).json({ message: "Required fields missing." });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fullName,
        email,
        registrationNo,
      });
    }

    const token = genToken(user._id);
    if (!token) {
      return res.status(500).json({ message: "Token generation failed." });
    }

    res.cookie("token", token, getCookieOptions());
    return res.status(200).json(stripSensitive(user));
  } catch (error) {
    console.error("Google Auth error:", error);
    return res.status(500).json({ message: "Google Auth error", error: error.message });
  }
};
