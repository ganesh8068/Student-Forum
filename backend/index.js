// ./index.js or ./server.js (your main server file)
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import postRouter from "./routes/post.routes.js";

const app = express();

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);

const port = process.env.PORT || 3000;

async function start() {
  await dbConnect(); 
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

start();
