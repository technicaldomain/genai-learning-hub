/**
 * Home page — curated trailhead and layered discovery.
 */

import * as React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Clock3, Layers3, Newspaper, Rocket, Sparkles, Users } from "lucide-react";
import Section from "../../layout/Section";
import { useHomeContent } from "../../api/hooks";

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  className = "",
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  image?: string;
}) {
  return (
    <section className={`rounded-[1.75rem] border border-white/10 bg-white/80 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/5 dark:bg-slate-950/70 sm:p-6 ${className}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">{eyebrow}</div>
          <h2 className="font-display text-2xl text-slate-950 dark:text-white">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        {image && (
          <img src={image} alt="" aria-hidden="true" className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm" />
        )}
      </div>
      {children}
    </section>
  );
}

export default function HomePage() {
  const { data, isLoading } = useHomeContent()

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-80 animate-pulse rounded-[2rem] bg-slate-200/80 dark:bg-slate-900/80" />
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200/80 lg:col-span-5 dark:bg-slate-900/80" />
          <div className="h-72 animate-pulse rounded-[1.75rem] bg-slate-200/80 lg:col-span-7 dark:bg-slate-900/80" />
        </div>
      </div>
    );
  }

  const prompt = data.promptLibrary.featured[0];
  const nextPrompt = data.promptLibrary.featured[1];
  const showcase = data.showcase.items[0];

  return (
    <Section className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_120px_rgba(15,23,42,0.32)] sm:px-8 sm:py-10">
        <img src="/hero.png" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.12),_transparent_36%),radial-gradient(circle_at_80%_20%,_rgba(251,191,36,0.1),_transparent_34%),linear-gradient(135deg,_rgba(15,23,42,0.72)_0%,_rgba(17,24,39,0.6)_40%,_rgba(31,41,55,0.5)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />
        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              {data.hero.eyebrow}
            </div>
            <div className="space-y-4 max-w-3xl">
              <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">{data.hero.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{data.hero.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={data.hero.primaryAction.path} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
                {data.hero.primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to={data.hero.secondaryAction.path} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">
                {data.hero.secondaryAction.label}
              </Link>
            </div>
            <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-slate-200 backdrop-blur-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Freshness signal</div>
              <p>{data.hero.freshness}</p>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/10 p-4 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-1">
            {data.startHere.steps.map((step) => (
              <Link key={step.title} to={step.path} className="group rounded-2xl border border-white/10 bg-slate-900/70 p-4 transition-transform hover:-translate-y-0.5 hover:bg-slate-900">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200">
                    <Clock3 className="h-3.5 w-3.5" />
                    {step.effort}
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/50 transition-transform group-hover:translate-x-0.5" />
                </div>
                <h3 className="font-display text-lg text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/70 sm:grid-cols-2 xl:grid-cols-5">
        {data.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="text-3xl font-display text-slate-950 dark:text-white">{stat.value}</div>
            <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{stat.label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{stat.detail}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        <SectionCard eyebrow="Start here" title={data.startHere.title} description={data.startHere.description} className="lg:col-span-5" image="/getting-started.png">
          <div className="space-y-3">
            {data.startHere.steps.map((step) => (
              <Link key={step.title} to={step.path} className="flex items-start gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/70 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-amber-400/40 dark:hover:bg-slate-900">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">{step.effort}</div>
                <div>
                  <h3 className="font-semibold text-slate-950 dark:text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Prompt library" title={data.promptLibrary.title} description={data.promptLibrary.description} className="lg:col-span-7" image="/prompt-engineering.png">
          {prompt && (
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-200/70 bg-slate-950 p-5 text-white dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  <BookOpen className="h-4 w-4" />
                  Featured prompt
                </div>
                <h3 className="mt-4 font-display text-2xl">{prompt.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-200">{prompt.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {prompt.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-xs text-slate-200">{tag}</span>
                  ))}
                </div>
                <Link to={prompt.path} className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
                  Explore prompts
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="space-y-3">
                {data.promptLibrary.featured.slice(1, 3).map((item) => (
                  <Link key={item.id} to={item.path} className="block rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                      {item.rating && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">{item.rating.toFixed(1)}</span>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{tag}</span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="Learning paths" title={data.learningPaths.title} description={data.learningPaths.description} className="lg:col-span-7">
          <div className="grid gap-3">
            {data.learningPaths.items.map((path) => (
              <Link key={path.id} to={path.path} className="flex items-start gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/60 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-amber-400/30 dark:hover:bg-slate-900">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-950 dark:text-white">{path.title}</h3>
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">{path.level}</span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{path.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 dark:bg-slate-950">
                      <BookOpen className="h-3.5 w-3.5" />
                      {path.moduleCount} modules
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 dark:bg-slate-950">
                      <Clock3 className="h-3.5 w-3.5" />
                      {path.estimatedHours} hours
                    </span>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Use case showcase" title={data.showcase.title} description={data.showcase.description} className="lg:col-span-5">
          <div className="space-y-3">
            {data.showcase.items.map((item) => (
              <Link key={item.id} to={item.path} className="block rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300">{item.authorDepartment || item.author}</p>
                  </div>
                  <Rocket className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="What's new" title={data.whatsNew.title} description={data.whatsNew.description} className="lg:col-span-12">
          <div className="grid gap-3 xl:grid-cols-2">
            {data.whatsNew.items.map((item) => (
              <Link key={item.id} to={item.path ?? "/learn/news"} className="flex items-start gap-4 rounded-3xl border border-slate-200/70 bg-slate-50/80 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50/60 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-amber-400/30 dark:hover:bg-slate-900">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  <Newspaper className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    <span>{item.source}</span>
                    <span>•</span>
                    <span>{item.freshnessLabel}</span>
                    {item.featured && <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">Featured</span>}
                  </div>
                  <h3 className="mt-2 font-semibold text-slate-950 dark:text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>
    </Section>
  );
}
