"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/lib/hooks/useUser";
import { useProjects } from "@/lib/hooks/useProjects";
import { 
  HelpCircle, 
  LogOut, 
  Settings, 
  User as UserIcon,
  BookOpen,
  LifeBuoy,
  History,
  Keyboard,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export function DashboardHeader() {
  const user = useUser();
  const pathname = usePathname();
  const { data: projects } = useProjects();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isReports, setIsReports] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const match = pathname?.match(/^\/dashboard\/([^\/]+)(\/reports)?$/);
    if (match) {
      const id = match[1];
      const reports = !!match[2];
      setProjectId(id);
      setIsReports(reports);

      const project = projects?.find(p => p.id === id);
      setProjectName(project?.fullName || id);
    } else {
      setProjectId(null);
      setProjectName(null);
      setIsReports(false);
    }
  }, [pathname, projects]);

  const isDashboardRoot = pathname === "/dashboard";

  return (
    <header className="
      fixed top-0 left-0 right-0
      h-14 z-[50]
      border-b border-white/[0.08]
      px-6 flex items-center justify-between
      bg-black/70 backdrop-blur-xl
      supports-[backdrop-filter]:bg-black/80
    ">
      {/* LEFT: Logo + Breadcrumb */}
      <div className="flex items-center gap-5">
        <Link href="/dashboard" className="relative group cursor-pointer">
          <div className="absolute -inset-2" />
          <Image 
            src="/logo.png" 
            alt="GitGraph" 
            width={24} 
            height={24} 
            className="relative"
          />
        </Link>

        <nav className="flex items-center gap-3 text-[13px] font-medium tracking-tight">
          <span className="text-zinc-700 font-light select-none">/</span>
          
          <Link 
            href="/dashboard"
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {user?.username ?? "system"}
          </Link>

          <span className="text-zinc-700 font-light select-none">/</span>

          <Link 
            href="/dashboard"
            className={`transition-colors ${
              isDashboardRoot
                ? "text-white font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            console
          </Link>

          {projectName && (
            <>
              <span className="text-zinc-700 font-light select-none">/</span>
              <Link 
                href={`/dashboard/${projectId}`}
                className={`transition-colors ${
                  !isReports
                    ? "text-white font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {projectName}
              </Link>
            </>
          )}

          {isReports && (
            <>
              <span className="text-zinc-700 font-light select-none">/</span>
              <Link 
                href={`/dashboard/${projectId}/reports`}
                className="text-white font-semibold transition-colors"
              >
                reports
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* RIGHT: Status + Help + User */}
      <div className="flex items-center gap-5">
        {/* Status Monitor */}
        <div className="
          hidden sm:flex items-center gap-2
          px-2.5 py-1 rounded-md
          bg-emerald-500/[0.03]
          text-emerald-500/80 text-[12px]
          border border-emerald-500/10
          tracking-tighter
        ">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          All OK
        </div>

        {/* Botão de Ajuda (?) */}
        <div className="relative" ref={helpRef}>
          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="
              w-7 h-7 rounded-md
              bg-white/[0.03] border border-white/[0.05]
              hover:border-white/10 hover:bg-white/[0.05]
              text-zinc-500 hover:text-white
              transition-all flex items-center justify-center
            "
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dropdown de Ajuda */}
          {isHelpOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                <Link
                  href="/docs"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                  onClick={() => setIsHelpOpen(false)}
                >
                  <BookOpen className="w-4 h-4 text-zinc-500" />
                  <span>Documentation</span>
                </Link>

                <Link
                  href="/support"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                  onClick={() => setIsHelpOpen(false)}
                >
                  <LifeBuoy className="w-4 h-4 text-zinc-500" />
                  <span>Support</span>
                </Link>

                <Link
                  href="/changelog"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                  onClick={() => setIsHelpOpen(false)}
                >
                  <History className="w-4 h-4 text-zinc-500" />
                  <span>Changelog</span>
                </Link>

                <Link
                  href="/shortcuts"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                  onClick={() => setIsHelpOpen(false)}
                >
                  <Keyboard className="w-4 h-4 text-zinc-500" />
                  <span>Keyboard Shortcuts</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Borda separadora */}
        <div className="w-px h-6 bg-white/[0.08]" />

        {/* User Avatar com Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="relative group focus:outline-none"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-tr rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity" />
            {user?.image ? (
              <Image
                src={user.image}
                alt="User"
                width={30}
                height={30}
                className="relative rounded-lg border border-white/10 object-cover"
              />
            ) : (
              <div className="relative w-7.5 h-7.5 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                {user?.username?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}
          </button>

          {/* Dropdown do Perfil */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-zinc-800">
                <p className="text-sm font-medium text-white">{user?.username ?? "User"}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{user?.email ?? "user@example.com"}</p>
              </div>

              <div className="p-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>

                <div className="border-t border-zinc-800 my-2" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    console.log("Logout");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}