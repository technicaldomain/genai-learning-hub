/**
 * Prompt Library — browse, vote, and grab prompt templates. Pure Tailwind.
 */

import * as React from "react";
import Section from "../../layout/Section";
import { usePrompts, useVote, useGrab } from "../../api/hooks";
import { ThumbsUp, Download, Check } from "lucide-react";

const categoryLabels: Record<string, string> = {
  writing: "Writing", coding: "Coding", analysis: "Analysis",
  creative: "Creative", summarization: "Summarization", translation: "Translation", other: "Other",
};

export default function PromptsPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState("");

  const { data, isLoading } = usePrompts({
    search: search || undefined, category: category || undefined, page, sortBy: "rating",
  });
  const voteMutation = useVote();
  const grabMutation = useGrab();

  const prompts = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Section>
      <h1 className="text-2xl font-bold">Prompt Library</h1>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">Curated prompt templates for common AI use cases.</p>

      {/* Success toast */}
      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          <Check className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search prompts..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm">
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>

      {/* Prompts grid */}
      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prompts.map((p: any) => (
              <div key={p.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <h3 className="font-semibold text-lg flex-1">{p.title}</h3>
                    <div className="flex gap-1.5">
                      {p.rating && <span className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">⭐ {p.rating.toFixed(1)}</span>}
                      {p.usageCount && <span className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{p.usageCount} uses</span>}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{p.description}</p>
                  <div className="flex gap-2 flex-wrap mb-2">
                    <span className="px-2 py-0.5 text-xs border border-neutral-300 dark:border-neutral-600 rounded-full">{categoryLabels[p.category] ?? p.category}</span>
                    {p.tags?.slice(0, 2).map((t: string) => <span key={t} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{t}</span>)}
                  </div>
                  <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} className="text-sm text-primary-500 dark:text-primary-400 hover:underline">
                    {expandedId === p.id ? "Hide template ▲" : "Show template ▼"}
                  </button>
                  {expandedId === p.id && (
                    <pre className="mt-3 p-4 bg-neutral-900 text-blue-200 rounded-lg text-xs whitespace-pre-wrap break-all font-mono">{p.template}</pre>
                  )}
                </div>

                {/* Actions bar */}
                <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <span className="text-xs text-neutral-500">By {p.author}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        const currentVotes = (p as any).votes ?? 0;
                        const res = await voteMutation.mutateAsync({
                          target_id: p.id, target_type: "skill", current_votes: currentVotes,
                        });
                        (p as any).votes = res.new_vote_count;
                      }}
                      disabled={voteMutation.isPending}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/30 disabled:opacity-50 transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {(p as any).votes ?? 0}
                    </button>
                    <button
                      onClick={async () => {
                        const res = await grabMutation.mutateAsync({
                          item_id: p.id, item_type: "prompt", item_title: p.title,
                        });
                        setSuccessMsg(`"${p.title}" added to your local project!`);
                        setTimeout(() => setSuccessMsg(""), 3000);
                      }}
                      disabled={grabMutation.isPending}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 transition-colors"
                    >
                      <Download className="h-3 w-3" />
                      Grab
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {total > 0 && (
            <div className="flex justify-center mt-8">
              <nav className="flex gap-2">
                {[...Array(Math.ceil(total / (data?.page_size ?? 10)))].map((_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? "bg-primary-500 text-white" : "bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}>{i + 1}</button>
                ))}
              </nav>
            </div>
          )}
        </>
      )}
    </Section>
  );
}
