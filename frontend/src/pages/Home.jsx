import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();
  const API = import.meta.env.VITE_SERVERURL || "http://localhost:5000";

  const [likePending, setLikePending] = useState({}); 
  const [commentPending, setCommentPending] = useState({}); 
  const [showComments, setShowComments] = useState({}); 
  const [commentText, setCommentText] = useState({}); 

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const fetchPosts = async (p = 1) => {
    try {
      setLoadingPosts(true);
      const res = await axios.get(`${API}/api/posts?page=${p}&limit=${limit}`, {
        withCredentials: true,
      });
      setPosts(res.data.posts || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load posts.");
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreatePost = async () => {
    if (!content.trim()) return setError("Post content cannot be empty.");
    setPosting(true);
    setError("");

    const optimistic = {
      _id: `temp_${Date.now()}`,
      content: content.trim(),
      author: { fullName: "You" },
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      likes: [],
      comments: [],
      optimistic: true,
    };

    setPosts((p) => [optimistic, ...p]);
    setContent("");

    try {
      const res = await axios.post(
        `${API}/api/posts`,
        { content: optimistic.content },
        { withCredentials: true }
      );

      setPosts((prev) =>
        prev.map((it) => (it._id === optimistic._id ? res.data : it))
      );
    } catch (err) {
      setPosts((prev) => prev.filter((it) => it._id !== optimistic._id));
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to create post. Are you logged in?"
      );
    } finally {
      setPosting(false);
    }
  };

  const handleToggleLike = async (post) => {
  const postId = post._id;
  setLikePending((s) => ({ ...s, [postId]: true }));

  try {
    const res = await axios.post(`${API}/api/posts/${postId}/like`, null, {
      withCredentials: true,
    });

    // debug log
    console.log("like response:", res.status, res.data);

    const likesCount = res.data?.likesCount;
    const liked = !!res.data?.liked;

    if (typeof likesCount === "number") {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                likesCount,
                // optional: maintain a shallow 'likedByMe' flag locally if you want
                likedByMe: liked,
              }
            : p
        )
      );
    } else {
      // Unexpected response shape: fallback to refetch posts
      console.warn("Unexpected like response shape, refetching posts");
      await fetchPosts(page);
    }
  } catch (err) {
    console.error("Like failed:", err?.response?.data || err.message || err);
    // if 401 -> redirect to signin
    if (err?.response?.status === 401) {
      window.location.href = "/signin";
    }
  } finally {
    setLikePending((s) => ({ ...s, [postId]: false }));
  }
};

  const handleAddComment = async (post) => {
  const postId = post._id;
  const text = (commentText[postId] || "").trim();
  if (!text) return;
  setCommentPending((s) => ({ ...s, [postId]: true }));

  const tempComment = {
    _id: `temp_c_${Date.now()}`,
    content: text,
    author: { fullName: "You" },
    createdAt: new Date().toISOString(),
    optimistic: true,
  };

  setPosts((prev) =>
    prev.map((p) =>
      p._id === postId
        ? {
            ...p,
            comments: [...(p.comments || []), tempComment],
            commentsCount: (p.commentsCount || 0) + 1,
          }
        : p
    )
  );

  setCommentText((s) => ({ ...s, [postId]: "" }));
  setShowComments((s) => ({ ...s, [postId]: true }));

  try {
    const res = await axios.post(
      `${API}/api/posts/${postId}/comments`,
      { content: text },
      { withCredentials: true }
    );
    const newComment = res.data?.comment;
    const newCount = res.data?.commentsCount ?? null;

    if (newComment) {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: (p.comments || []).map((c) => (c.optimistic ? newComment : c)),
                commentsCount: newCount !== null ? newCount : (p.comments || []).length,
              }
            : p
        )
      );
    } else {
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? {
                ...p,
                comments: [...(p.comments || []), res.data],
                commentsCount: newCount !== null ? newCount : (p.comments || []).length,
              }
            : p
        )
      );
    }
  } catch (err) {
    console.error("Add comment failed:", err);
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? {
              ...p,
              comments: (p.comments || []).filter((c) => !c.optimistic),
              commentsCount: Math.max(0, (p.commentsCount || 1) - 1),
            }
          : p
      )
    );
  } finally {
    setCommentPending((s) => ({ ...s, [postId]: false }));
  }
};


  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-white text-gray-800">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white/70 backdrop-blur-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-orange-600 mb-8 tracking-wide">
          Student Forum
        </h2>

        <ul className="space-y-4 text-lg font-medium">
          <li className="cursor-pointer px-2 py-2 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition">
            Home
          </li>

          <li className="cursor-pointer px-2 py-2 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition">
            My Posts
          </li>

          <li className="cursor-pointer px-2 py-2 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition">
            Departments
          </li>

          <li className="cursor-pointer px-2 py-2 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition">
            Discussion Rooms
          </li>

          {/* SETTINGS WITH LOGOUT BUTTON */}
          <li className="cursor-pointer px-2 py-2 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition">
            <div className="flex flex-col gap-2">
              <span className="font-medium">Settings</span>

              <button
                onClick={async () => {
                  try {
                    await axios.get(`${API}/api/auth/signout`, {
                      withCredentials: true,
                    });
                    window.location.href = "/signin"; // redirect
                  } catch (err) {
                    console.error("Logout failed:", err);
                  }
                }}
                className="text-left bg-orange-500 text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition text-sm"
              >
                Logout
              </button>
            </div>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, Student 👋</h1>
            <p className="text-sm text-gray-500">
              Stay updated and connect with your classmates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
              className="w-10 h-10 rounded-full border border-gray-300"
            />
            <span className="font-medium">My Profile</span>
          </div>
        </div>

        {/* Create Post Box */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border p-5 mb-8">
          <textarea
            placeholder="Share your question, thoughts or updates..."
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex justify-between mt-3">
            <div className="text-sm text-red-500">{error && `* ${error}`}</div>

            <button
              onClick={handleCreatePost}
              disabled={posting}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-medium transition"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-5">
          {loadingPosts ? (
            <div className="text-center py-8 text-gray-500">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No posts yet. Be the first to share something!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className={`bg-white/80 backdrop-blur-lg shadow-md border rounded-2xl p-5 transition ${
                  post.optimistic ? "opacity-80" : ""
                }`}
              >
                {/* Post Header */}
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {post.author?.fullName || "Unknown"}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Post Content */}
                <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                {/* Stats + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-6 text-sm text-gray-500 items-center">
                    <button
                      onClick={() => handleToggleLike(post)}
                      disabled={!!likePending[post._id]}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                    >
                      <span>👍</span>
                      <span>{post.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => setShowComments((s) => ({ ...s, [post._id]: !s[post._id] }))}
                      className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition"
                    >
                      <span>💬</span>
                      <span>{post.commentsCount || 0}</span>
                    </button>
                  </div>

                  <div className="text-sm text-gray-400">
                    {post.optimistic ? "Posting..." : ""}
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="mt-4 border-t pt-4">
                    {/* existing comments */}
                    <div className="space-y-3 mb-3">
                      {(post.comments || []).length === 0 ? (
                        <div className="text-sm text-gray-500">No comments yet.</div>
                      ) : (
                        (post.comments || []).map((c) => (
                          <div key={c._id || c.createdAt} className="text-sm">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-800">
                                {c.author?.fullName || "Unknown"}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {new Date(c.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-gray-700">{c.content}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* add comment */}
                    <div className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={commentText[post._id] || ""}
                        onChange={(e) => setCommentText((s) => ({ ...s, [post._id]: e.target.value }))}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                        placeholder="Write a comment..."
                      />
                      <button
                        onClick={() => handleAddComment(post)}
                        disabled={!!commentPending[post._id]}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg"
                      >
                        {commentPending[post._id] ? "..." : "Comment"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="font-medium">Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border rounded-lg hover:bg-gray-100">
            Next
          </button>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-80 border-l bg-white/70 backdrop-blur-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Announcements</h2>
        <div className="bg-gray-100 rounded-xl p-4 text-gray-700 mb-6">No new announcements</div>

        <h2 className="text-xl font-bold mb-4 text-gray-800">Upcoming Events</h2>
        <div className="bg-gray-100 rounded-xl p-4 text-gray-700">No upcoming events</div>
      </aside>
    </div>
  );
}

export default Home;
