/**
 * Skills Marketplace page — browse and filter AI skills. Pure Tailwind.
 */

import * as React from "react";
import Section from "../../layout/Section";
import { useSkills } from "../../api/hooks";
import type { PaginatedResponse } from "@genai-learning-hub/shared-types";

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

  const { data, isLoading } = useSkills({
    search: search || undefined, category: category || undefined,
    level: level || undefined, page,
  });

  const skills = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Section>
      <h1 className="text-3xl font-bold">AI Skills Marketplace</h1>
      <p className="text-neutral-600 dark:text-neutral-400">Discover reusable AI skills and automations shared across the organization.</p>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
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

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill: any) => (
              <div key={skill.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <h3 className="font-semibold text-lg">{skill.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">{skill.description}</p>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-medium border border-neutral-300 dark:border-neutral-600 rounded-full">{categoryLabels[skill.category] ?? skill.category}</span>
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full ${levelColors[skill.level] ?? "bg-neutral-100 text-neutral-800"}`}>{skill.level}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skill.tags.slice(0, 3).map((tag: string) => <span key={tag} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{tag}</span>)}
                  </div>
                </div>
                <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-between text-xs text-neutral-500">
                  <span>By {skill.author}</span>
                  {skill.popularity && <span>{skill.popularity} uses</span>}
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
