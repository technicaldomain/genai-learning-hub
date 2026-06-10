/**
 * Approved Tools & APIs — browse approved resources. Pure Tailwind.
 */

import * as React from "react";
import Section from "../../layout/Section";
import { useTools } from "../../api/hooks";

const categoryLabels: Record<string, string> = {
  model: "Model", platform: "Platform", tool: "Tool", api: "API",
  framework: "Framework", documentation: "Documentation", other: "Other",
};
const iconColors: Record<string, string> = {
  model: "#7C4DFF", platform: "#00B0FF", tool: "#00BFA5", api: "#FF6D00",
  framework: "#1E88E5", documentation: "#64DD17", other: "#9E9E9E",
};

export default function ToolsPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useTools({ search: search || undefined, category: category || undefined, page });
  const resources = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <Section>
      <h1 className="text-3xl font-bold">Tools & APIs</h1>
      <p className="text-neutral-600 dark:text-neutral-400">Approved AI tools, platforms, and APIs for organizational use.</p>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input type="text" placeholder="Search tools..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 text-sm">
          <option value="">All Categories</option>
          {Object.entries(categoryLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((r: any) => (
              <div key={r.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${iconColors[r.category] || "#9E9E9E"}18` }}>
                      <svg className="h-5 w-5" style={{ color: iconColors[r.category] || "#9E9E9E" }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <h3 className="font-semibold flex-1">{r.title}</h3>
                    {r.featured && <span className="px-2 py-0.5 text-xs bg-primary-500 text-white rounded-full">Featured</span>}
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">{r.description}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="px-2 py-0.5 text-xs border border-neutral-300 dark:border-neutral-600 rounded-full">{categoryLabels[r.category] ?? r.category}</span>
                    {r.tags.slice(0, 2).map((t: string) => <span key={t} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{t}</span>)}
                  </div>
                </div>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="block px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 text-sm text-primary-500 dark:text-primary-400 hover:text-primary-600 transition-colors">
                  Visit {r.title} →
                </a>
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
