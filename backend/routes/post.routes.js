import express from "express";
import { createPost, getPosts, getPostById, toggleLike, addComment } from "../controllers/post.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getPosts); 
router.get("/:id", getPostById); 
router.post("/", requireAuth, createPost); 
router.post("/:id/like", requireAuth, toggleLike); 
router.post("/:id/comments", requireAuth, addComment); 

export default router;
