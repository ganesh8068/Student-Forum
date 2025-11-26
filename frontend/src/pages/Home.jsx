// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_SERVERURL || "http://localhost:5000";

function Home() {
  // POSTS state
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const [likePending, setLikePending] = useState({});
  const [commentPending, setCommentPending] = useState({});
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

  // RESOURCES state (sidebar)
  const [resources, setResources] = useState([]);
  const [resPage, setResPage] = useState(1);
  const [resLimit] = useState(6);
  const [loadingResources, setLoadingResources] = useState(false);

  // UPLOAD resource state
  const [resFile, setResFile] = useState(null);
  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [uploadingRes, setUploadingRes] = useState(false);
  const [resError, setResError] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const navigate = useNavigate();

  // fetch posts
  useEffect(() => {
    fetchPosts(page);
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    const handler = (e) => {
      if (e?.detail?.post) {
        setPosts((prev) => [e.detail.post, ...prev]);
      }
    };
    window.addEventListener("resourceShared", handler);
    return () => window.removeEventListener("resourceShared", handler);
  }, []);

  // fetch resources
  useEffect(() => {
    fetchResources(resPage);
    // eslint-disable-next-line
  }, [resPage]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res = await axios.get(`${API}/api/auth/me`, {
          withCredentials: true,
        });
        setCurrentUser(res.data.user || null);
      } catch (err) {
        setCurrentUser(null);
      }
    };
    loadCurrentUser();
  }, []);

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

  const fetchResources = async (p = 1) => {
    try {
      setLoadingResources(true);
      const res = await axios.get(
        `${API}/api/resources?page=${p}&limit=${resLimit}`
      );
      setResources(res.data.resources || []);
      setResError("");
    } catch (err) {
      setResError("Failed to load resources.");
      console.error("fetchResources error", err);
    } finally {
      setLoadingResources(false);
    }
  };

  // Create Post
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

  // RESOURCE helper handlers (unchanged)
  const handleResourceFileChange = (e) => {
    const f = e.target.files?.[0] ?? null;
    setResFile(f);
    if (f && !resTitle) setResTitle(f.name);
  };

  const handleUploadResource = async () => {
    if (!resFile) return setResError("Please select a file to upload.");
    setUploadingRes(true);
    setResError("");

    const fd = new FormData();
    fd.append("file", resFile);
    fd.append("title", resTitle || resFile.name);
    fd.append("description", resDesc || "");

    try {
      const res = await axios.post(`${API}/api/resources`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResources((prev) => [res.data.resource, ...prev].slice(0, resLimit));
      setResFile(null);
      setResTitle("");
      setResDesc("");
    } catch (err) {
      console.error("Upload failed", err?.response?.data || err.message);
      setResError(err?.response?.data?.message || "Upload failed.");
      if (err?.response?.status === 401) navigate("/signin");
    } finally {
      setUploadingRes(false);
    }
  };

  const handleDownloadResource = (r) => {
    window.open(`${API}${r.url}`, "_blank", "noopener");
  };

  const handleShareResource = async (resourceId) => {
    try {
      const caption = window.prompt(
        "Add a caption for the post (optional):",
        ""
      );
      const res = await axios.post(
        `${API}/api/resources/${resourceId}/share`,
        { caption },
        { withCredentials: true }
      );

      // server returns created post and updated resource (per backend)
      const createdPost = res.data?.post;
      const updatedResource = res.data?.resource;
      if (updatedResource) {
        setResources((prev) =>
          prev.map((r) => (r._id === updatedResource._id ? updatedResource : r))
        );
      }
      if (createdPost) {
        setPosts((prev) => [createdPost, ...prev]);
        alert("Resource shared as a post.");
      } else {
        fetchPosts(1);
        setPage(1);
        alert("Resource shared.");
      }
    } catch (err) {
      console.error("Share failed", err?.response?.data || err.message);
      if (err?.response?.status === 401) navigate("/signin");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get(`${API}/api/auth/signout`, { withCredentials: true });
      navigate("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // LIKE handler (uses server as source-of-truth)
  const handleToggleLike = async (post) => {
    const postId = post._id;
    setLikePending((s) => ({ ...s, [postId]: true }));

    try {
      const res = await axios.post(`${API}/api/posts/${postId}/like`, null, {
        withCredentials: true,
      });

      const likesCount =
        typeof res.data?.likesCount === "number"
          ? res.data.likesCount
          : post.likesCount || 0;
      const liked = !!res.data?.liked;

      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likesCount, likedByMe: liked } : p
        )
      );
    } catch (err) {
      console.error("Like failed:", err?.response?.data || err.message || err);
      if (err?.response?.status === 401) window.location.href = "/signin";
    } finally {
      setLikePending((s) => ({ ...s, [postId]: false }));
    }
  };

  // COMMENT handler
  const handleAddComment = async (post) => {
    const postId = post._id;
    const text = (commentText[postId] || "").trim();
    if (!text) return;

    setCommentPending((s) => ({ ...s, [postId]: true }));

    const tempComment = {
      _id: `temp_${Date.now()}`,
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

      const serverComment = res.data?.comment;
      const commentsCount = res.data?.commentsCount ?? null;

      if (serverComment) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? {
                  ...p,
                  comments: (p.comments || []).map((c) =>
                    c.optimistic ? serverComment : c
                  ),
                  commentsCount:
                    commentsCount !== null
                      ? commentsCount
                      : (p.comments || []).length,
                }
              : p
          )
        );
      } else {
        await fetchPosts(page);
      }
    } catch (err) {
      console.error(
        "Add comment failed:",
        err?.response?.data || err.message || err
      );
      // revert optimistic
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
      if (err?.response?.status === 401) window.location.href = "/signin";
    } finally {
      setCommentPending((s) => ({ ...s, [postId]: false }));
    }
  };

  // helper to build absolute url for attachments
  const buildAbsolute = (relUrl) => `${API}${relUrl}`;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 to-white text-gray-800">
      {/* Left Sidebar */}
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

          <li className="cursor-pointer px-2 py-2 rounded-lg hover:bg-orange-100 hover:text-orange-600 transition">
            <div className="flex flex-col gap-2">
              <span className="font-medium">Settings</span>
              <button
                onClick={handleLogout}
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
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, Student 👋
            </h1>
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
            <span className="font-medium">
              {currentUser?.fullName || "My Profile"}
            </span>
          </div>
        </div>

        {/* Create Post Box */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border p-5 mb-6">
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
        <div className="space-y-5 mb-8">
          {loadingPosts ? (
            <div className="text-center py-8 text-gray-500">
              Loading posts...
            </div>
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
                <div className="flex justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">
                    {post.author?.fullName || "Unknown"}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* content with clickable URLs */}
                <div className="text-gray-700 mb-4 leading-relaxed">
                  {String(post.content || "")
                    .split("\n")
                    .map((line, idx) => {
                      const urlMatch = line.match(/https?:\/\/[^\s]+/);
                      if (urlMatch) {
                        const url = urlMatch[0];
                        const before = line.split(url)[0];
                        const after = line.split(url)[1] || "";
                        return (
                          <div key={idx}>
                            {before}
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-orange-600 underline"
                            >
                              {url}
                            </a>
                            {after}
                          </div>
                        );
                      }
                      return <div key={idx}>{line}</div>;
                    })}
                </div>

                {/* attachments (if any) */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {post.attachments.map((a, i) => (
                      <div
                        key={i}
                        className="border rounded-md p-2 bg-white/90"
                      >
                        {a.mimeType.startsWith("image/") ? (
                          <img
                            src={buildAbsolute(a.url)}
                            alt={a.originalName}
                            className="w-full h-40 object-cover rounded"
                          />
                        ) : a.mimeType === "application/pdf" ? (
                          <div className="flex items-center justify-between">
                            <a
                              href={buildAbsolute(a.url)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-orange-600 underline"
                            >
                              View PDF
                            </a>
                            <span className="text-xs text-gray-500">
                              {(a.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions: Like and Comment */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(post)}
                      disabled={!!likePending[post._id]}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                        post.likedByMe ? "bg-orange-100" : "hover:bg-gray-100"
                      } transition`}
                    >
                      <span>👍</span>
                      <span>{post.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() =>
                        setShowComments((s) => ({
                          ...s,
                          [post._id]: !s[post._id],
                        }))
                      }
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

                {/* Comments section */}
                {showComments[post._id] && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-3 mb-3">
                      {(post.comments || []).length === 0 ? (
                        <div className="text-sm text-gray-500">
                          No comments yet.
                        </div>
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

                    <div className="flex gap-2 items-start">
                      <input
                        type="text"
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText((s) => ({
                            ...s,
                            [post._id]: e.target.value,
                          }))
                        }
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
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </main>

      {/* Right Sidebar - Resources + Announcements */}
      <aside className="hidden xl:block w-96 border-l bg-white/70 backdrop-blur-lg p-6 space-y-6">
        {/* Announcements */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Announcements
          </h2>
          <div className="bg-gray-100 rounded-xl p-4 text-gray-700 mb-6">
            No new announcements
          </div>
        </div>

        {/* Upload Resource */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold mb-2">Upload Resource</h3>

          <div className="mb-2">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleResourceFileChange}
            />
          </div>

          <div className="mb-2">
            <input
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              placeholder="Title"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="mb-2">
            <textarea
              value={resDesc}
              onChange={(e) => setResDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-red-500">{resError}</div>
            <button
              onClick={handleUploadResource}
              disabled={uploadingRes}
              className="bg-orange-500 text-white px-3 py-1 rounded"
            >
              {uploadingRes ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Resources List */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Resources</h3>
            <div className="text-xs text-gray-500">Page {resPage}</div>
          </div>

          {loadingResources ? (
            <div className="text-sm text-gray-500">Loading resources...</div>
          ) : resources.length === 0 ? (
            <div className="text-sm text-gray-500">No resources yet.</div>
          ) : (
            <div className="space-y-3">
              {resources.map((r) => (
                <div
                  key={r._id}
                  className="flex items-start gap-3 border-b pb-3"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    {r.mimeType?.startsWith("image/") ? (
                      <img
                        src={`${API}${r.url}`}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl">📄</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-gray-500">
                          {r.originalName}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {r.description && (
                      <div className="text-sm text-gray-700 mt-1">
                        {r.description}
                      </div>
                    )}

                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleDownloadResource(r)}
                        className="text-sm px-2 py-1 rounded border bg-white hover:bg-gray-50"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleShareResource(r._id)}
                        className="text-sm px-2 py-1 rounded bg-orange-500 text-white"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* resources pagination */}
          <div className="mt-3 flex justify-between items-center">
            <button
              onClick={() => setResPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded text-sm"
            >
              Prev
            </button>
            <button
              onClick={() => setResPage((p) => p + 1)}
              className="px-3 py-1 border rounded text-sm"
            >
              Next
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Home;
