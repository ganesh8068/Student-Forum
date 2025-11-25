import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";

/**
 * Create a post. Protected route (requireAuth)
 * Body: { content }
 */
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.userId || req.user?._id;

    if (!userId) return res.status(401).json({ message: "Authentication required." });
    if (!content || !content.trim()) return res.status(400).json({ message: "Content is required." });

    const post = await Post.create({
      author: userId,
      content: content.trim(),
      likes: [],
      comments: [],
      likesCount: 0,
      commentsCount: 0,
    });

    // populate author display info
    await post.populate({ path: "author", select: "fullName registrationNo email" });

    return res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error);
    return res.status(500).json({ message: "Create post error", error: error.message });
  }
};

/**
 * Get all posts (paginated)
 * Query: ?page=1&limit=10
 */
export const getPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || "10")));
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "fullName registrationNo")
      .populate({ path: "comments.author", select: "fullName registrationNo" })
      .lean();

    // normalize counts for backwards compatibility
    const normalized = posts.map((p) => {
      const likes = Array.isArray(p.likes) ? p.likes.length : (p.likesCount || p.likes || 0);
      const commentsCount = Array.isArray(p.comments) ? p.comments.length : (p.commentsCount || 0);
      return {
        ...p,
        likes: Array.isArray(p.likes) ? p.likes : [],
        likesCount: likes,
        commentsCount,
      };
    });

    const total = await Post.countDocuments();
    return res.status(200).json({ posts: normalized, page, limit, total });
  } catch (error) {
    console.error("Get posts error:", error);
    return res.status(500).json({ message: "Get posts error", error: error.message });
  }
};

/**
 * Get single post by id (with comments)
 */
export const getPostById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid post id." });

    const post = await Post.findById(id)
      .populate("author", "fullName registrationNo")
      .populate({ path: "comments.author", select: "fullName registrationNo" })
      .lean();

    if (!post) return res.status(404).json({ message: "Post not found." });

    const likesCount = Array.isArray(post.likes) ? post.likes.length : (post.likesCount || 0);
    const commentsCount = Array.isArray(post.comments) ? post.comments.length : (post.commentsCount || 0);

    return res.status(200).json({
      ...post,
      likes: Array.isArray(post.likes) ? post.likes : [],
      likesCount,
      commentsCount,
    });
  } catch (error) {
    console.error("Get post by id error:", error);
    return res.status(500).json({ message: "Get post error", error: error.message });
  }
};

/**
 * Toggle like/unlike for a post. Protected.
 * POST /api/posts/:id/like
 */

export const toggleLike = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    const postId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({ message: "Invalid post id." });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found." });

    // ensure likes is an array
    if (!Array.isArray(post.likes)) post.likes = [];

    const idx = post.likes.findIndex((id) => id.toString() === userId.toString());
    let liked;
    if (idx === -1) {
      post.likes.push(userId);
      liked = true;
    } else {
      post.likes.splice(idx, 1);
      liked = false;
    }

    // keep likesCount compatible and in sync
    post.likesCount = Array.isArray(post.likes) ? post.likes.length : post.likesCount || 0;

    await post.save();

    return res.status(200).json({
      message: liked ? "Post liked." : "Post unliked.",
      likesCount: post.likesCount,
      liked,
      postId: post._id.toString(),
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    return res.status(500).json({ message: "Toggle like error", error: error.message });
  }
};


/**
 * Add a comment to a post. Protected.
 * POST /api/posts/:id/comments
 * Body: { content }
 */
export const addComment = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;
    if (!userId) return res.status(401).json({ message: "Authentication required." });

    const postId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(postId)) return res.status(400).json({ message: "Invalid post id." });

    const { content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: "Comment content is required." });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found." });

    const comment = {
      author: userId,
      content: content.trim(),
    };

    post.comments.push(comment);

    // keep commentsCount in sync
    post.commentsCount = Array.isArray(post.comments) ? post.comments.length : (post.commentsCount || 0) + 1;

    await post.save();

    // populate the newly added comment's author info
    const populatedPost = await Post.findById(postId)
      .populate("author", "fullName registrationNo")
      .populate({ path: "comments.author", select: "fullName registrationNo" })
      .lean();

    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    return res.status(201).json({
      message: "Comment added.",
      comment: newComment,
      commentsCount: populatedPost.comments.length,
      postId: postId,
    });
  } catch (error) {
    console.error("Add comment error:", error);
    return res.status(500).json({ message: "Add comment error", error: error.message });
  }
};
