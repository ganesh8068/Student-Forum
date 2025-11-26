// ./routes/resource.routes.js
import express from "express";
import {
  uploadResource,
  listResources,
  getResource,
  deleteResource,
  shareResourceAsPost,
} from "../controllers/resource.controllers.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import upload from "../config/multer.js";

const router = express.Router();

router.get("/", listResources); 
router.get("/:id", getResource);router.post("/", requireAuth, upload.single("file"), uploadResource); 
router.delete("/:id", requireAuth, deleteResource); 
router.post("/:id/share", requireAuth, shareResourceAsPost);
export default router;
