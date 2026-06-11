/**
 * Learning Paths — browse and enroll in guided learning journeys.
 */

import * as React from "react";
import { BookOpen, Check, CheckCircle, Clock, ChevronDown } from "lucide-react";
import Section from "../../layout/Section";
import { useLearningPaths, useStartLearning } from "../../api/hooks";

export default function LearningPathsPage() {
  const [openModule, setOpenModule] = React.useState<string | null>(null);
  const [enrolledPaths, setEnrolledPaths] = React.useState<Set<string>>(new Set());
  const [successMsg, setSuccessMsg] = React.useState("");
  const { data, isLoading } = useLearningPaths();
  const startLearning = useStartLearning();

  const paths = data?.data ?? [];

  const handleEnroll = async (path: (typeof paths)[number]) => {
    if (enrolledPaths.has(path.id)) return;
    await startLearning.mutateAsync({ path_id: path.id, path_title: path.title });
    setEnrolledPaths((prev) => new Set(prev).add(path.id));
    setSuccessMsg(`Enrolled in "${path.title}"!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <Section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">Learn / structured paths</div>
        <h1 className="font-display text-4xl text-slate-950 dark:text-white">Learning Paths</h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">Curated journeys for employees who want a clear next step, a measurable path, and room to go deeper.</p>
      </div>

      {successMsg && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
          <Check className="mr-2 inline-block h-4 w-4" />
          {successMsg}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4">
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-slate-200/80 dark:bg-slate-900/80" />
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-slate-200/80 dark:bg-slate-900/80" />
          <div className="h-40 animate-pulse rounded-[1.5rem] bg-slate-200/80 dark:bg-slate-900/80" />
        </div>
      ) : (
        <div className="space-y-4">
          {paths.map((path) => {
            const isEnrolled = enrolledPaths.has(path.id);
            return (
              <article key={path.id} className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl text-slate-950 dark:text-white">{path.title}</h2>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-semibold dark:bg-slate-900">{path.level}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900"><Clock className="h-3.5 w-3.5" />{path.estimatedHours} hours</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-900">{path.modules.length} modules</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleEnroll(path)}
                    disabled={isEnrolled || startLearning.isPending}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                      isEnrolled
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                        : "bg-slate-950 text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                    }`}
                  >
                    {isEnrolled ? <CheckCircle className="h-4 w-4" /> : null}
                    {isEnrolled ? "Enrolled" : "Start learning"}
                  </button>
                </div>

                <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{path.description}</p>

                <div className="mt-5 grid gap-3">
                  {path.modules.map((mod) => (
                    <div key={mod.id} className="overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800">
                      <button onClick={() => setOpenModule(openModule === mod.id ? null : mod.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">{path.modules.indexOf(mod) + 1}</span>
                        <span className="min-w-0 flex-1 text-sm font-medium text-slate-950 dark:text-white">{mod.title}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{mod.durationMinutes}m</span>
                        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${openModule === mod.id ? "rotate-180" : ""}`} />
                      </button>
                      {openModule === mod.id && <div className="px-4 pb-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{mod.description}</div>}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {path.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">{tag}</span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}
