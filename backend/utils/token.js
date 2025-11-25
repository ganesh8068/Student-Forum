import jwt from "jsonwebtoken";

const genToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET not set in environment variables.");
    return null;
  }
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.error("JWT generation error:", error);
    return null;
  }
};

export default genToken;
