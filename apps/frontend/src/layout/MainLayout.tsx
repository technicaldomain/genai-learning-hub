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
  SunIcon,
  MoonIcon,
  MonitorIcon,
  UserCircleIcon,
  LogOutIcon,
  ChevronDownIcon,
  LockIcon,
} from "lucide-react";

const DRAWER_WIDTH = 260;

type NavItem = { label: string; path: string; icon: React.ReactNode };

const navItems: NavItem[] = [
  { label: "Home", path: "/", icon: <HomeIcon className="h-5 w-5" /> },
  { label: "AI Skills", path: "/skills", icon: <WrenchIcon className="h-5 w-5" /> },
  { label: "Prompt Library", path: "/prompts", icon: <TextQuoteIcon className="h-5 w-5" /> },
  { label: "Tools & APIs", path: "/resources", icon: <PuzzleIcon className="h-5 w-5" /> },
  { label: "Learning Paths", path: "/learning-paths", icon: <GraduationCapIcon className="h-5 w-5" /> },
  { label: "News & Updates", path: "/news", icon: <NewspaperIcon className="h-5 w-5" /> },
  { label: "Community", path: "/community", icon: <UsersIcon className="h-5 w-5" /> },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  return (
    <aside className="h-full flex flex-col bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800">
      <nav className="flex-1 py-2 px-3 space-y-0.5">
        {navItems.map((item) => (
          <SidebarLink key={item.path} {...item} onClose={onClose} />
        ))}
      </nav>
      <div className="p-4 text-center">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
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
            ? "bg-primary-500 text-white dark:text-white"
            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        aria-label="User menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-white text-sm font-medium">
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-medium text-neutral-700 dark:text-neutral-300 max-w-32 truncate">
          {displayName}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-neutral-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg py-1 z-50">
          <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {displayName}
            </p>
            {user.email && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                {user.email}
              </p>
            )}
            {user.department && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                {user.department}
              </p>
            )}
          </div>
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 h-14 flex items-center px-4 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex p-2 -ml-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="flex-1 ml-2 text-lg font-bold text-primary-500">
          GenAI Learning Hub
        </span>
        <button
          onClick={cycleTheme}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
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
        <div className="pl-2 border-l border-neutral-200 dark:border-neutral-800">
          <UserMenu />
        </div>
      </header>

      {/* ── Mobile sidebar overlay ──────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
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
          className="hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)]"
          style={{ width: DRAWER_WIDTH }}
        >
          <Sidebar />
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
