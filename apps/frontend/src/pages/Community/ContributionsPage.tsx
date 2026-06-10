/**
 * Contributions & Tips page — user-submitted use cases, prompts, lessons learned, and tips.
 */

import * as React from "react";
import { useContributions } from "../../api/hooks";

export default function ContributionsPage() {
  const { data, isLoading, error } = useContributions();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <svg
          className="h-10 w-10 animate-spin text-primary-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-950/30">
        <p className="text-sm text-red-600 dark:text-red-400">Failed to load contributions.</p>
      </div>
    );
  }

  const contributions = data?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Contributions & Tips
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Community-submitted use cases, prompts, lessons learned, and practical tips.
        </p>
      </div>

      {contributions.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-neutral-500 dark:text-neutral-400">No contributions yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contributions.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-primary-500">{c.type}</span>
                {c.author_department && (
                  <span className="text-xs text-neutral-400">· {c.author_department}</span>
                )}
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{c.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{c.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {c.tags?.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                <span>by {c.author}</span>
                {c.likes !== null && <span>❤️ {c.likes}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
