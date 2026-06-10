/**
 * Skills Marketplace page — browse, vote, and grab AI skills. Pure Tailwind.
 */

import * as React from "react";
import Section from "../../layout/Section";
import { useSkills, usePostSkill, useVote, useGrab } from "../../api/hooks";
import { Plus, ThumbsUp, Download, X, Check } from "lucide-react";

const categoryLabels: Record<string, string> = {
  "data-processing": "Data Processing", "content-generation": "Content Generation",
  "code-assistance": "Code Assistance", analysis: "Analysis",
  automation: "Automation", design: "Design", other: "Other",
};

const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function SkillsPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [level, setLevel] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [showModal, setShowModal] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState("");

  const [form, setForm] = React.useState({ title: "", description: "", tags: "" });
  const tagsArray = React.useMemo(() => form.tags.split(",").map((t) => t.trim()).filter(Boolean), [form.tags]);

  const { data, isLoading } = useSkills({
    search: search || undefined, category: category || undefined,
    level: level || undefined, page,
  });
  const postSkillMutation = usePostSkill(() => {
    setSuccessMsg("Skill posted successfully!");
    setShowModal(false);
    setForm({ title: "", description: "", tags: "" });
    setTimeout(() => setSuccessMsg(""), 3000);
  });
  const voteMutation = useVote();
  const grabMutation = useGrab();

  const skills = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    await postSkillMutation.mutateAsync({
      title: form.title,
      description: form.description,
      tags: tagsArray,
    });
  };

  return (
    <Section>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">AI Skills Marketplace</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Discover reusable AI skills and automations shared across the organization.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Post Skill
        </button>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
          <Check className="h-4 w-4" />
          {successMsg}
        </div>
      )}

      {/* Post Skill Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <X className="h-4 w-4 text-neutral-500" />
            </button>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Post a Skill</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Title</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Data Cleaning Pipeline" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Description</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  placeholder="What does this skill do?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Tags</label>
                <input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="comma separated" />
              </div>
              <button type="submit" disabled={postSkillMutation.isPending}
                className="w-full py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
                {postSkillMutation.isPending ? "Posting..." : "Post Skill"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Search skills..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm">
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)}
          className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {/* Skills grid */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill: any) => (
              <div key={skill.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                    <h3 className="font-semibold text-lg">{skill.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">{skill.description}</p>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-medium border border-neutral-300 dark:border-neutral-600 rounded-full">{categoryLabels[skill.category] ?? skill.category}</span>
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${levelColors[skill.level] ?? "bg-neutral-100 text-neutral-800"}`}>{skill.level}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skill.tags?.slice(0, 3).map((tag: string) => <span key={tag} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{tag}</span>)}
                  </div>
                </div>

                {/* Actions bar */}
                <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
                  <span className="text-xs text-neutral-500">By {skill.author}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        const currentVotes = (skill as any).votes ?? 0;
                        const res = await voteMutation.mutateAsync({
                          target_id: skill.id, target_type: "skill", current_votes: currentVotes,
                        });
                        (skill as any).votes = res.new_vote_count;
                      }}
                      disabled={voteMutation.isPending}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/30 disabled:opacity-50 transition-colors"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      {(skill as any).votes ?? 0}
                    </button>
                    <button
                      onClick={async () => {
                        const res = await grabMutation.mutateAsync({
                          item_id: skill.id, item_type: "skill", item_title: skill.title,
                        });
                        setSuccessMsg(`"${skill.title}" added to your local project!`);
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
