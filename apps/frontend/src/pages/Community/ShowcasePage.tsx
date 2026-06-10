/**
 * Use Case Showcase page — production ML pipelines, internal tools, experiments.
 */

import * as React from "react";
import { useShowcases, usePostUsecase, useVote } from "../../api/hooks";
import { Plus, ThumbsUp, X, Check } from "lucide-react";

interface UsecaseForm {
  title: string;
  description: string;
  tags: string;
}

export default function ShowcasePage() {
  const { data, isLoading, error } = useShowcases();
  const postUsecaseMutation = usePostUsecase();
  const voteMutation = useVote();

  const [showModal, setShowModal] = React.useState(false);
  const [form, setForm] = React.useState<UsecaseForm>({ title: "", description: "", tags: "" });
  const [successMsg, setSuccessMsg] = React.useState("");

  const tagsArray = React.useMemo(() => form.tags.split(",").map((t) => t.trim()).filter(Boolean), [form.tags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await postUsecaseMutation.mutateAsync({
      title: form.title,
      description: form.description,
      tags: tagsArray,
    });
    setSuccessMsg("Use case posted successfully!");
    setShowModal(false);
    setForm({ title: "", description: "", tags: "" });
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <svg
          className="h-10 w-10 animate-spin text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load showcases.</p>
      </div>
    );
  }

  const showcases = data?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Use Case Showcase</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Real-world AI use cases implemented across the organization.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Post Usecase
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          <Check className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Post usecase modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-6">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4 text-neutral-500" />
            </button>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Post a Use Case</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Real-time Fraud Detection"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="Describe the use case..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tags</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="comma separated, e.g. ml-pipeline, kafka"
                />
              </div>
              <button
                type="submit"
                disabled={postUsecaseMutation.isPending}
                className="w-full py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {postUsecaseMutation.isPending ? "Posting..." : "Post Use Case"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Showcase list */}
      {showcases.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-500 dark:text-neutral-400">No showcases yet. Share your success story!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {showcases.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-primary-500 capitalize">{s.category?.replace("-", " ")}</span>
                    <span className="text-xs text-neutral-400">·</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">{s.author}{s.author_department ? ` · ${s.author_department}` : ""}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{s.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{s.description}</p>
                </div>
              </div>

              {s.resources?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.resources.map((r, i) => (
                    r.url ? (
                      <a
                        key={i}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400"
                      >
                        {r.name} →
                      </a>
                    ) : (
                      <span key={i} className="text-xs text-neutral-500">{r.name}</span>
                    )
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.tags?.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Vote button */}
              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={async () => {
                    const currentVotes = (s as any).votes ?? 0;
                    const res = await voteMutation.mutateAsync({
                      target_id: s.id,
                      target_type: "usecase",
                      current_votes: currentVotes,
                    });
                    (s as any).votes = res.new_vote_count;
                  }}
                  disabled={voteMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 dark:hover:bg-primary-950/30 dark:hover:text-primary-400 dark:hover:border-primary-800 transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span>{(s as any).votes ?? 0}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
