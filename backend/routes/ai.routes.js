import express from "express";
import { aiChat } from "../controllers/ai.controllers.js";

const router = express.Router();

router.post("/chat", aiChat);

export default router;
