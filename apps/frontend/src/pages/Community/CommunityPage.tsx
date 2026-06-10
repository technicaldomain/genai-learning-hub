/**
 * Community Contributions — browse user submissions. Pure Tailwind.
 */

import * as React from "react";
import Section from "../../layout/Section";

interface Contribution {
  id: string; title: string; description: string; author: string;
  author_department?: string; type: string; tags: string[];
  created_at: string; likes?: number;
}

const mockContributions: Contribution[] = [
  { id: "c1", title: "Using AI for Competitive Intelligence", description: "Our team developed a workflow using AI to scrape and summarize competitor press releases. The process takes 15 minutes instead of 2 hours.", author: "Alex Kim", author_department: "Product Strategy", type: "use-case", tags: ["competitive-intelligence", "automation"], created_at: "2026-05-20T10:00:00Z", likes: 23 },
  { id: "c2", title: "Prompt Pattern: Role-Based Output Control", description: "A technique for controlling output format by assigning the AI a specific role with detailed responsibilities.", author: "Maria Santos", author_department: "Engineering", type: "prompt", tags: ["prompt-engineering", "technique"], created_at: "2026-05-25T09:00:00Z", likes: 18 },
  { id: "c3", title: "Lessons Learned: When AI Hallucinations Cost Us Time", description: "A candid post-mortem on an AI-generated report that contained factual errors. Key takeaways on validation and human oversight.", author: "David Park", author_department: "Marketing", type: "lesson-learned", tags: ["validation", "risk-management"], created_at: "2026-06-01T11:00:00Z", likes: 31 },
  { id: "c4", title: "Quick Tip: Context Windows Are Your Friend", description: "Always include relevant context from previous messages. Providing explicit context improves accuracy by 30-50%.", author: "Rachel Foster", author_department: "Data Science", type: "tip", tags: ["tips", "best-practices"], created_at: "2026-06-04T08:00:00Z", likes: 15 },
];

const typeMap: Record<string, { label: string; color: string }> = {
  "use-case": { label: "Use Case", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  prompt: { label: "Prompt", color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200" },
  "lesson-learned": { label: "Lesson Learned", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  tip: { label: "Tip", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CommunityPage() {
  return (
    <Section>
      <h1 className="text-3xl font-bold">Community Contributions</h1>
      <p className="text-neutral-600 dark:text-neutral-400">Share knowledge, tips, and lessons learned with the community.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockContributions.map((contrib) => {
          const tm = typeMap[contrib.type] ?? typeMap["tip"];
          return (
            <div key={contrib.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-sm flex-shrink-0">
                    {contrib.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base">{contrib.title}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{contrib.author}{contrib.author_department ? ` · ${contrib.author_department}` : ""}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 leading-relaxed">{contrib.description}</p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${tm.color}`}>{tm.label}</span>
                    {contrib.tags.slice(0, 2).map((tag) => <span key={tag} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{tag}</span>)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/></svg>
                      {contrib.likes ?? 0}
                    </span>
                    <span>{formatDate(contrib.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
