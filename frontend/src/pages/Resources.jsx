// src/pages/Resources.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_SERVERURL || "http://localhost:5000";

function Resources() {
  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(false);

  // upload form state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources(page);
    // eslint-disable-next-line
  }, [page]);

  const fetchResources = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/api/resources/${resourceId}/share`,
        { caption },
        { withCredentials: true }
      );
      setResources(res.data.resources || []);
    } catch (err) {
      console.error("Fetch resources failed", err);
    } finally {
      setLoading(false);
    }
  };

  const onFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    // default title to filename
    if (e.target.files?.[0]) setTitle(e.target.files[0].name);
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select a file to upload.");
    setUploading(true);
    setError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title || file.name);
    fd.append("description", description || "");

    try {
      const res = await axios.post(`${API}/api/resources`, fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // prepend new resource
      setResources((prev) => [res.data.resource, ...prev]);
      setFile(null);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Upload failed", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Upload failed.");
      if (err?.response?.status === 401) navigate("/signin");
    } finally {
      setUploading(false);
    }
  };

  const handleShare = async (resourceId) => {
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
      if (createdPost) {
        setPosts((prev) => [createdPost, ...prev]);
        alert("Shared to feed.");
      } else {
        fetchPosts(1);
      }
    } catch (err) {
      console.error("Share failed", err?.response?.data || err.message);
      if (err?.response?.status === 401) navigate("/signin");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resources</h1>

      {/* Upload box */}
      <div className="border rounded-lg p-4 mb-6 bg-white/80">
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">File</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={onFileChange}
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-red-500">{error}</div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            {uploading ? "Uploading..." : "Upload Resource"}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div>Loading resources...</div>
      ) : resources.length === 0 ? (
        <div>No resources yet.</div>
      ) : (
        <div className="space-y-4">
          {resources.map((r) => (
            <div
              key={r._id}
              className="p-4 border rounded bg-white/80 flex justify-between items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    {r.mimeType?.startsWith("image/") ? (
                      <img
                        src={r.url}
                        alt={r.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-3xl">📄</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="font-semibold text-lg">{r.title}</div>
                        <div className="text-sm text-gray-500">
                          {r.originalName}
                        </div>
                        <div className="text-xs text-gray-400">
                          Uploaded by: {r.uploader?.fullName || "Unknown"}
                        </div>
                      </div>

                      <div className="text-right text-xs text-gray-400">
                        {new Date(r.createdAt).toLocaleString()}
                        <div>{(r.size / 1024).toFixed(0)} KB</div>
                      </div>
                    </div>

                    {r.description && (
                      <div className="mt-2 text-sm text-gray-700">
                        {r.description}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded bg-white border text-sm hover:bg-gray-50"
                >
                  View
                </a>
                <button
                  onClick={() => handleShare(r._id)}
                  className="px-3 py-2 rounded bg-orange-500 text-white text-sm"
                >
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded"
        >
          Prev
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Resources;
