// ./controllers/resource.controllers.js
import Resource from "../models/resource.model.js";
import Post from "../models/post.model.js";
import mongoose from "mongoose";

/**
 * Upload resource (files handled by multer in route)
 * Expects multipart/form-data: fields: title, description, file(s) as 'file' (single)
 */
export const uploadResource = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required." });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "File is required." });

    const { title = file.originalname, description = "" } = req.body;

    const resource = await Resource.create({
      uploader: userId,
      title: title.trim(),
      description: description.trim(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      url: `/uploads/${file.filename}`,
      size: file.size,
    });

    // optionally populate uploader
    await resource.populate("uploader", "fullName registrationNo");

    return res.status(201).json({ message: "Resource uploaded.", resource });
  } catch (error) {
    console.error("uploadResource error:", error);
    return res
      .status(500)
      .json({ message: "Upload failed.", error: error.message });
  }
};

/**
 * Get list of resources (paginated)
 * Query: ?page=1&limit=20
 */
export const listResources = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || "20")));
    const skip = (page - 1) * limit;

    const resources = await Resource.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("uploader", "fullName registrationNo")
      .lean();

    const total = await Resource.countDocuments();

    return res.status(200).json({ resources, page, limit, total });
  } catch (error) {
    console.error("listResources error:", error);
    return res
      .status(500)
      .json({ message: "Fetch resources failed.", error: error.message });
  }
};

/**
 * Get one resource by id (meta only)
 */
export const getResource = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id." });

    const resource = await Resource.findById(id)
      .populate("uploader", "fullName registrationNo")
      .lean();
    if (!resource)
      return res.status(404).json({ message: "Resource not found." });

    return res.status(200).json({ resource });
  } catch (error) {
    console.error("getResource error:", error);
    return res
      .status(500)
      .json({ message: "Get resource failed.", error: error.message });
  }
};

/**
 * Delete a resource (only uploader or admin ideally)
 */
export const deleteResource = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.userId || req.user?._id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required." });

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid id." });

    const resource = await Resource.findById(id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found." });

    // allow deletion only by uploader (or extend to admins)
    if (resource.uploader.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not allowed to delete this resource." });
    }

    await resource.remove();
    // note: consider removing file from disk as well in production

    return res.status(200).json({ message: "Resource deleted." });
  } catch (error) {
    console.error("deleteResource error:", error);
    return res
      .status(500)
      .json({ message: "Delete failed.", error: error.message });
  }
};

/**
 * Share resource: create a post that links to the resource URL.
 * POST /api/resources/:id/share
 * Body: { caption } (optional)
 */
export const shareResourceAsPost = async (req, res) => {
  try {
    const resourceId = req.params.id;
    const userId = req.userId || req.user?._id;
    const { caption = "" } = req.body;

    if (!userId)
      return res.status(401).json({ message: "Authentication required." });
    if (!mongoose.Types.ObjectId.isValid(resourceId))
      return res.status(400).json({ message: "Invalid resource id." });

    const resource = await Resource.findById(resourceId);
    if (!resource)
      return res.status(404).json({ message: "Resource not found." });

    resource.public = true;
    resource.sharesCount = (resource.sharesCount || 0) + 1;
    await resource.save();

    const absoluteUrl = `${req.protocol}://${req.get("host")}${resource.url}`;

    const content = `${
      caption ? caption.trim() + "\n\n" : ""
    }Shared resource: ${resource.title}\n${absoluteUrl}`;

    const post = await Post.create({
      author: userId,
      content,
      attachments: [
        {
          filename: resource.filename,
          originalName: resource.originalName,
          mimeType: resource.mimeType,
          url: resource.url, 
          size: resource.size,
        },
      ],
      likes: [],
      comments: [],
      likesCount: 0,
      commentsCount: 0,
    });

    await post.populate({ path: "author", select: "fullName registrationNo" });

    return res
      .status(201)
      .json({
        message: "Resource shared as post.",
        post,
        resource: { ...resource.toObject(), absoluteUrl },
      });
  } catch (error) {
    console.error("shareResourceAsPost error:", error);
    return res
      .status(500)
      .json({ message: "Share failed.", error: error.message });
  }
};
