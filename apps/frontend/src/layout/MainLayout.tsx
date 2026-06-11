/**
 * Main layout — sticky header + sidebar nav + content area.
 * Pure Tailwind, zero MUI.
 */

import * as React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useThemeMode, type ThemeMode } from "../providers/ThemeContext";
import { useCurrentUser } from "../api/hooks";
import {
  MenuIcon,
  HomeIcon,
  WrenchIcon,
  TextQuoteIcon,
  PuzzleIcon,
  GraduationCapIcon,
  NewspaperIcon,
  UsersIcon,
  LightbulbIcon,
  RocketIcon,
  ServerIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  UserCircleIcon,
  LogOutIcon,
  ChevronDownIcon,
  LockIcon,
  CompassIcon,
} from "lucide-react";

const DRAWER_WIDTH = 260;

type NavGroup = {
  label: string;
  icon: React.ReactNode;
  items: { label: string; path: string; icon: React.ReactNode }[];
};

const navGroups: NavGroup[] = [
  {
    label: "Trailhead",
    icon: <CompassIcon className="h-4 w-4" />,
    items: [
      { label: "Home", path: "/", icon: <HomeIcon className="h-4 w-4" /> },
      { label: "Prompt Library", path: "/marketplace/prompts", icon: <TextQuoteIcon className="h-4 w-4" /> },
      { label: "Approved Tools", path: "/marketplace/tools", icon: <PuzzleIcon className="h-4 w-4" /> },
    ],
  },
  {
    label: "Learn",
    icon: <GraduationCapIcon className="h-4 w-4" />,
    items: [
      { label: "Learning Paths", path: "/learn/paths", icon: <GraduationCapIcon className="h-4 w-4" /> },
      { label: "News & Updates", path: "/learn/news", icon: <NewspaperIcon className="h-4 w-4" /> },
    ],
  },
  {
    label: "Community",
    icon: <UsersIcon className="h-4 w-4" />,
    items: [
      { label: "Contributions & Tips", path: "/community/contributions", icon: <LightbulbIcon className="h-4 w-4" /> },
      { label: "Use Case Showcase", path: "/community/showcases", icon: <RocketIcon className="h-4 w-4" /> },
      { label: "MCP Connect", path: "/community/mcp-connect", icon: <ServerIcon className="h-4 w-4" /> },
    ],
  },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="flex h-full flex-col border-r border-slate-200/80 bg-slate-950 text-white dark:border-slate-800">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">GenAI Learning Hub</div>
      </div>
      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink key={item.path} {...item} onClose={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4 text-center">
        <span className="text-xs text-slate-400">
          GenAI Learning Hub v0.1.0
        </span>
      </div>
    </aside>
  );
}

function SidebarLink({ label, path, icon, onClose }: NavItem & { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === path;

  return (
    <button
      onClick={() => { navigate(path); onClose?.(); }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
        ${
          active
            ? "bg-amber-400 text-slate-950"
            : "text-slate-300 hover:bg-white/8 hover:text-white"
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// User menu (header right side)
// ---------------------------------------------------------------------------

function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: user, isLoading, error, refetch } = useCurrentUser();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const handleLogin = () => {
    // Navigate to frontend login page (which has a sign-in button)
    navigate("/auth/login", { replace: true });
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    try {
      await fetch("/api/auth/logout", { credentials: "include", method: "GET" });
    } catch {
      // Ignore logout errors — always redirect
    }
    // Clear cached user data
    queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    // Redirect
    window.location.href = "/login";
  };

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch {
      // User is not authenticated — show sign-in
    }
  };

  // Initial refetch on mount to check auth status
  React.useEffect(() => {
    refetch().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error || !user) {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-white/10 dark:text-slate-200 dark:hover:bg-white/10"
        title="Sign in"
      >
        <UserCircleIcon className="h-5 w-5" />
        <span className="hidden sm:inline">Sign in</span>
      </button>
    );
  }

  // Authenticated user
  const displayName = user.name || user.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200/80 px-2 py-1.5 transition-colors hover:bg-slate-100 dark:border-white/10 dark:hover:bg-white/10"
        aria-label="User menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-medium text-slate-950">
          {initials}
        </div>
        <span className="hidden max-w-32 truncate text-sm font-medium text-slate-700 dark:text-slate-100 sm:block">
          {displayName}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-slate-500 transition-transform dark:text-slate-400 ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-slate-200/80 bg-white py-1 shadow-[0_18px_50px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200/80 px-4 py-3 dark:border-slate-800">
            <p className="truncate text-sm font-medium text-slate-950 dark:text-white">
              {displayName}
            </p>
            {user.email && (
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            )}
            {user.department && (
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                {user.department}
              </p>
            )}
          </div>
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MainLayout() {
  const { mode, toggleTheme } = useThemeMode();

  // Current mode from state
  const currentMode = mode;

  // Resolve actual display mode for icon selection
  const resolvedMode: "light" | "dark" | "system" = currentMode;

  const cycleTheme = () => {
    const current = mode;
    const next: ThemeMode = current === "system" ? "light" : current === "light" ? "dark" : "system";
    try { localStorage.setItem("genai-hub-theme-mode", next); } catch {}
    window.dispatchEvent(new Event("theme-change"));
    if (next === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else if (next === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      // system: respect OS preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }
  };

  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.08),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] dark:text-slate-100">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-slate-200/70 bg-white/80 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="-ml-2 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="-ml-2 hidden rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:flex"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <div className="ml-2 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-700 dark:text-amber-200">GenAI Learning Hub</div>
          <div className="font-display text-lg text-slate-950 dark:text-white">Trailhead</div>
        </div>
        <button
          onClick={cycleTheme}
          className="rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Toggle theme"
          title={
            resolvedMode === "system"
              ? "System"
              : resolvedMode === "light"
                ? "Light"
                : "Dark"
          }
        >
          {resolvedMode === "dark" ? (
            <MoonIcon className="h-5 w-5" />
          ) : resolvedMode === "light" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MonitorIcon className="h-5 w-5" />
          )}
        </button>
        <div className="border-l border-slate-200/70 pl-2 dark:border-slate-800">
          <UserMenu />
        </div>
      </header>

      {/* ── Mobile sidebar overlay ──────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setMobileMenuOpen(false)} />
          <div
            className="absolute inset-y-0 left-0 w-64"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Layout body ─────────────────────────────────────── */}
      <div className="flex flex-1 pt-14">
        {/* Desktop sidebar */}
        <div
          className="hidden sticky top-16 h-[calc(100vh-4rem)] shrink-0 lg:block"
          style={{ width: DRAWER_WIDTH }}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 p-4 sm:p-6 md:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
