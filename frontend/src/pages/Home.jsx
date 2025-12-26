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
  }, [resPage]);


  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const res = await axios.get(`${API}/api/auth/me`, {
          withCredentials: true,
        });
        setCurrentUser(res.data.user || null);
      } catch (err) {
        console.error("Authentication check failed", err);
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

  // RESOURCE helper handlers
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

  const buildAbsolute = (relUrl) => `${API}${relUrl}`;

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e9f5f4] to-white text-gray-800">
      {/* Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r bg-white/80 backdrop-blur-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-[#2a9d8f] mb-8 tracking-tight">
          Student Forum and Community 
        </h2>

        <ul className="space-y-3 text-base font-medium">
          <li className="cursor-pointer px-3 py-2 rounded-xl bg-[#2a9d8f]/10 text-[#2a9d8f] transition">
            Home
          </li>
          <li
            onClick={() => navigate("/about")}
            className="cursor-pointer px-3 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            About Us
          </li>
          <li
            onClick={() => navigate("/resources")}
            className="cursor-pointer px-3 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            Share Resources
          </li>
          <li
            onClick={() => navigate("/discussion-room")}
            className="cursor-pointer px-3 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            Discussion Rooms
          </li>

          <li className="pt-4 border-t mt-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase text-gray-400 px-3">Account</span>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition font-medium"
              >
                Logout
              </button>
            </div>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, Student 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Connect and collaborate with your peers.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-full border shadow-sm">
            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
              className="w-8 h-8 rounded-full ring-2 ring-[#2a9d8f]/20"
            />
            <span className="font-semibold text-sm">
              {currentUser?.fullName || "My Profile"}
            </span>
          </div>
        </div>

        {/* Create Post Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <textarea
            placeholder="What's on your mind today?"
            className="w-full border-none bg-gray-50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f]/50 resize-none"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-red-500 font-medium">{error && error}</div>

            <button
              onClick={handleCreatePost}
              disabled={posting}
              className="bg-[#2a9d8f] hover:bg-[#238b7e] text-white px-8 py-2 rounded-xl font-bold transition-all shadow-md shadow-[#2a9d8f]/20 disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post"}
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6 mb-8">
          {loadingPosts ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2a9d8f] mb-2"></div>
              <p>Fetching conversations...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed">
              <p className="text-gray-500 italic">No posts yet. Start the conversation!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className={`bg-white shadow-sm border border-gray-100 rounded-2xl p-6 transition-all hover:border-[#2a9d8f]/30 ${
                  post.optimistic ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#2a9d8f]/10 flex items-center justify-center text-[#2a9d8f] font-bold">
                        {post.author?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 leading-none">
                            {post.author?.fullName || "Anonymous"}
                        </h3>
                        <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                            {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>

                <div className="text-gray-700 mb-5 leading-relaxed text-[15px]">
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
                              className="text-[#2a9d8f] font-medium hover:underline"
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

                {/* attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {post.attachments.map((a, i) => (
                      <div
                        key={i}
                        className="border rounded-xl p-2 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        {a.mimeType.startsWith("image/") ? (
                          <img
                            src={buildAbsolute(a.url)}
                            alt={a.originalName}
                            className="w-full h-44 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center justify-between p-2">
                             <div className="flex items-center gap-2">
                                <span className="text-xl">📄</span>
                                <a
                                href={buildAbsolute(a.url)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm font-semibold text-[#2a9d8f] truncate max-w-[150px]"
                                >
                                {a.originalName || "View PDF"}
                                </a>
                             </div>
                            <span className="text-[10px] bg-gray-200 px-2 py-1 rounded-md font-bold text-gray-500">
                              {(a.size / 1024).toFixed(0)} KB
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleLike(post)}
                      disabled={!!likePending[post._id]}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold transition ${
                        post.likedByMe 
                        ? "bg-[#2a9d8f] text-white" 
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>{post.likedByMe ? "Liked" : "Like"}</span>
                      <span className={post.likedByMe ? "text-white/80" : "text-gray-400"}>
                        {post.likesCount || 0}
                      </span>
                    </button>

                    <button
                      onClick={() =>
                        setShowComments((s) => ({
                          ...s,
                          [post._id]: !s[post._id],
                        }))
                      }
                      className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                    >
                      <span>Discuss</span>
                      <span className="text-gray-400">{post.commentsCount || 0}</span>
                    </button>
                  </div>
                </div>

                {/* Comments section */}
                {showComments[post._id] && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4">
                    <div className="space-y-4 mb-4">
                      {(post.comments || []).length === 0 ? (
                        <div className="text-xs text-center text-gray-400 py-2">
                          No thoughts yet. Be the first!
                        </div>
                      ) : (
                        (post.comments || []).map((c) => (
                          <div key={c._id || c.createdAt} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-xs text-[#2a9d8f]">
                                    {c.author?.fullName || "User"}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="text-sm text-gray-700">{c.content}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText((s) => ({
                            ...s,
                            [post._id]: e.target.value,
                          }))
                        }
                        className="flex-1 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#2a9d8f]/40"
                        placeholder="Write a comment..."
                      />
                      <button
                        onClick={() => handleAddComment(post)}
                        disabled={!!commentPending[post._id]}
                        className="bg-[#2a9d8f] text-white px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        {commentPending[post._id] ? "..." : "Send"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex justify-center items-center gap-6 pb-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 text-gray-400 hover:text-[#2a9d8f] disabled:opacity-30 transition"
          >
             &larr; Previous
          </button>
          <div className="h-8 w-8 bg-[#2a9d8f] text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-md shadow-[#2a9d8f]/30">
            {page}
          </div>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="p-2 text-gray-400 hover:text-[#2a9d8f] transition"
          >
            Next &rarr;
          </button>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-80 border-l bg-white/40 backdrop-blur-md p-6 space-y-8">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            Announcements
          </h2>
          <div className="bg-[#2a9d8f]/5 rounded-2xl p-4 border border-[#2a9d8f]/10 text-gray-600 text-sm italic">
            No new announcements
          </div>
        </div>

        {/* Upload Resource */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="text-[#2a9d8f]">📁</span> Upload Resource
          </h3>

          <div className="space-y-3">
            <div className="relative group">
                <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleResourceFileChange}
                className="text-[11px] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#2a9d8f]/10 file:text-[#2a9d8f] hover:file:bg-[#2a9d8f]/20 cursor-pointer"
                />
            </div>

            <input
              value={resTitle}
              onChange={(e) => setResTitle(e.target.value)}
              placeholder="Give it a title..."
              className="w-full bg-gray-50 border-none px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#2a9d8f]/40"
            />

            <textarea
              value={resDesc}
              onChange={(e) => setResDesc(e.target.value)}
              placeholder="Brief description..."
              className="w-full bg-gray-50 border-none px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#2a9d8f]/40 resize-none"
              rows={2}
            />

            <div className="flex flex-col gap-2">
              <button
                onClick={handleUploadResource}
                disabled={uploadingRes}
                className="w-full bg-[#2a9d8f] text-white py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#2a9d8f]/10 transition active:scale-95"
              >
                {uploadingRes ? "Processing..." : "Publish Resource"}
              </button>
              {resError && <div className="text-[10px] text-red-500 font-medium text-center">{resError}</div>}
            </div>
          </div>
        </div>

        {/* Resources List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Recent Library
            </h2>
            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">Pg {resPage}</span>
          </div>

          {loadingResources ? (
            <div className="text-xs text-center py-4">Loading library...</div>
          ) : resources.length === 0 ? (
            <div className="text-xs text-center py-4 text-gray-400">Empty library.</div>
          ) : (
            <div className="space-y-4">
              {resources.map((r) => (
                <div
                  key={r._id}
                  className="group bg-white rounded-xl p-3 border border-gray-100 hover:shadow-md transition"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {r.mimeType?.startsWith("image/") ? (
                        <img
                            src={`${API}${r.url}`}
                            alt={r.title}
                            className="w-full h-full object-cover"
                        />
                        ) : (
                        <span className="text-xl">📄</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-gray-800 truncate">{r.title}</div>
                        <div className="text-[10px] text-gray-400 truncate italic">{r.originalName}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadResource(r)}
                      className="flex-1 text-[10px] font-bold py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleShareResource(r._id)}
                      className="flex-1 text-[10px] font-bold py-1.5 rounded-lg bg-[#2a9d8f] text-white hover:bg-[#238b7e] transition"
                    >
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setResPage((p) => Math.max(1, p - 1))}
              className="text-[10px] font-bold text-gray-400 hover:text-[#2a9d8f]"
            >
              &larr; Prev
            </button>
            <button
              onClick={() => setResPage((p) => p + 1)}
              className="text-[10px] font-bold text-gray-400 hover:text-[#2a9d8f]"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Home;