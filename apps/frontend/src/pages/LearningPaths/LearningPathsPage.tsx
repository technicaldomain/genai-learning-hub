/**
 * Learning Paths — browse guided learning journeys. Pure Tailwind.
 */

import * as React from "react";
import Section from "../../layout/Section";

interface Module { id: string; title: string; description: string; durationMinutes: number }
interface Path {
  id: string; title: string; description: string; level: string;
  modules: Module[]; estimated_hours: number; tags: string[];
}

const mockPaths: Path[] = [
  { id: "p1", title: "AI Fundamentals for Business Professionals", description: "A comprehensive introduction to AI covering core concepts and responsible usage.", level: "beginner", modules: [
    { id: "m1", title: "What is AI?", description: "Understand the basics of AI, ML, and generative AI.", durationMinutes: 45 },
    { id: "m2", title: "LLMs and Generative AI", description: "Learn how large language models work.", durationMinutes: 60 },
    { id: "m3", title: "AI in the Enterprise", description: "How organizations use AI and governance.", durationMinutes: 30 },
    { id: "m4", title: "Hands-on: First AI Experience", description: "Try your first AI tools.", durationMinutes: 90 },
  ], estimated_hours: 6, tags: ["basics", "enterprise", "non-technical"] },
  { id: "p2", title: "Building AI Applications with LangChain", description: "Build production-ready AI applications using the LangChain framework.", level: "intermediate", modules: [
    { id: "m5", title: "LangChain Foundations", description: "Core building blocks.", durationMinutes: 90 },
    { id: "m6", title: "Chains and Prompts", description: "Multi-step AI workflows.", durationMinutes: 120 },
    { id: "m7", title: "Memory and Context", description: "Conversation memory.", durationMinutes: 90 },
    { id: "m8", title: "Building AI Agents", description: "Agents with tools and decisions.", durationMinutes: 150 },
  ], estimated_hours: 9, tags: ["langchain", "python", "development"] },
  { id: "p3", title: "Advanced Prompt Engineering Techniques", description: "Master advanced prompt engineering for complex tasks.", level: "advanced", modules: [
    { id: "m9", title: "Prompt Design Patterns", description: "Proven patterns for effective prompting.", durationMinutes: 60 },
    { id: "m10", title: "Chain of Thought & Reasoning", description: "Multi-step reasoning from models.", durationMinutes: 75 },
    { id: "m11", title: "Structured Output & Validation", description: "Reliable structured outputs.", durationMinutes: 90 },
    { id: "m12", title: "Evaluation & Optimization", description: "Measure and improve prompt quality.", durationMinutes: 120 },
  ], estimated_hours: 7, tags: ["prompt-engineering", "advanced"] },
];

const levelMap: Record<string, { label: string; color: string }> = {
  beginner: { label: "Beginner", color: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900" },
  intermediate: { label: "Intermediate", color: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900" },
  advanced: { label: "Advanced", color: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900" },
};

export default function LearningPathsPage() {
  const [openModule, setOpenModule] = React.useState<string | null>(null);

  return (
    <Section>
      <h1 className="text-3xl font-bold">Learning Paths</h1>
      <p className="text-neutral-600 dark:text-neutral-400">Guided journeys from AI basics to advanced techniques.</p>

      <div className="space-y-4">
        {mockPaths.map((path) => {
          const lc = levelMap[path.level] ?? levelMap.beginner;
          return (
            <div key={path.id} className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="h-8 w-8 text-primary-500 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{path.title}</h2>
                    <div className="flex gap-3 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${lc.color}`}>{lc.label}</span>
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {path.estimated_hours}h
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">{path.description}</p>
                <h3 className="text-sm font-semibold mb-2">Modules</h3>
                <div className="space-y-2">
                  {path.modules.map((mod, idx) => (
                    <div key={mod.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                      <button onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                        <span className="w-7 h-7 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                        <span className="flex-1 text-sm font-medium">{mod.title}</span>
                        <span className="text-xs text-neutral-500">{mod.durationMinutes}m</span>
                        <svg className={`h-4 w-4 text-neutral-400 transition-transform ${openModule === mod.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                      </button>
                      {openModule === mod.id && <div className="px-4 pb-3 text-sm text-neutral-600 dark:text-neutral-400">{mod.description}</div>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap mt-4">
                  {path.tags.map((tag) => <span key={tag} className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-full">{tag}</span>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
