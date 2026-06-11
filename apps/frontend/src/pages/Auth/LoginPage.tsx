/**
 * Login page — displays a sign-in button that redirects to the OIDC provider.
 */

import * as React from "react";
import { ArrowRight, Lock, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  const handleSignIn = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_28%),radial-gradient(circle_at_85%_15%,_rgba(248,113,113,0.12),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-10 dark:bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.14),_transparent_24%),radial-gradient(circle_at_85%_15%,_rgba(248,113,113,0.1),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:42px_42px] opacity-40 dark:opacity-15" />

      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_120px_rgba(15,23,42,0.24)] sm:px-8 sm:py-10 dark:border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.16),_transparent_30%),radial-gradient(circle_at_80%_20%,_rgba(248,113,113,0.12),_transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
                <Sparkles className="h-3.5 w-3.5" />
                Guided entry
              </div>
              <div className="space-y-4">
                <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                  Sign in to your GenAI workspace.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                  Continue with your organization&apos;s SSO to reach approved prompts,
                  learning paths, community examples, and tool guidance in one place.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-white">Protected access</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Authentication happens through your existing SSO flow and uses a secure session cookie.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-white">Curated environment</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Once signed in, the hub brings together vetted content, tooling, and community knowledge.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/80 bg-white/88 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/78 sm:p-8">
          <div className="mx-auto flex h-full max-w-md flex-col justify-center text-center">
            <div className="mb-8 inline-flex h-16 w-16 items-center justify-center self-center rounded-[1.5rem] bg-amber-100 text-amber-900 shadow-sm dark:bg-amber-400/15 dark:text-amber-200">
              <Lock className="h-8 w-8" />
            </div>
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                Secure sign-in
              </div>
              <h2 className="font-display text-3xl text-slate-950 dark:text-white sm:text-4xl">
                Enter the hub
              </h2>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Use your organization account to access learning resources, approved prompts,
                internal showcases, and MCP connection guides.
              </p>
            </div>

            <button
              onClick={handleSignIn}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 dark:focus:ring-offset-slate-950"
            >
              Continue with SSO
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">
              You&apos;ll be redirected to your identity provider and returned here after authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
