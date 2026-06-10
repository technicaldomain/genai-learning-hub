/**
 * Login page — displays a sign-in button that redirects to the OIDC provider.
 */

import * as React from "react";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const handleSignIn = () => {
    window.location.href = "/api/auth/login";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="text-center max-w-md px-4">
        <div className="mb-8">
          <Lock className="h-16 w-16 text-primary-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Sign in to GenAI Learning Hub
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8">
          Authenticate with your organization's SSO to access learning resources,
          skills, prompts, and more.
        </p>
        <button
          onClick={handleSignIn}
          className="inline-flex items-center justify-center rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
