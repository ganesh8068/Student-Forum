import React from "react";
import UpvoteButton from "./UpvoteButton";

export default function DiscussionCard({ post }) {
  return (
    <div className="p-4 card card-scale animate-fade-up">
      <div className="flex items-start gap-4">
        <img
          src={post.author?.avatar || "https://i.pravatar.cc/40"}
          alt="avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-[var(--color-secondary)]">
                {post.title || post.content?.slice(0, 80)}
              </h4>
              <div className="text-xs muted">
                {post.author?.fullName} •{" "}
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm muted">💬 {post.commentsCount || 0}</div>
            </div>
          </div>

          <p className="mt-3 text-sm text-[var(--color-text-soft)]">
            {post.excerpt || post.content?.slice(0, 140)}
          </p>

          <div className="mt-3 flex items-center gap-3">
            <UpvoteButton initial={post.upvotes || post.likesCount || 0} />
            <div className="text-xs muted">
              {post.tags?.map((t) => (
                <span
                  key={t}
                  className="px-2 py-1 bg-gray-100 rounded-full text-xs mr-2"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
