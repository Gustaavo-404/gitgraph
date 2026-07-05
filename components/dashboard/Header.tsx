"use client";

import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/lib/hooks/useUser";
import { useProjects } from "@/lib/hooks/useProjects";
import { signOut } from "next-auth/react";
import {
  HelpCircle,
  LogOut,
  Settings,
  BookOpen,
  LifeBuoy,
  History,
  Keyboard,
  X,
  LayoutGrid,
  TableProperties,
  Calendar,
  User,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

export function DashboardHeader() {
  const user = useUser();
  const pathname = usePathname();
  const { data: projects } = useProjects();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Estados para o Modal de Perfil e Exclusão de Conta
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estados para as configurações
  const [viewPreference, setViewPreference] = useState("cards");
  const [periodPreference, setPeriodPreference] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);

  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [isReports, setIsReports] = useState(false);

  // Fecha menus ao clicar fora
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

  // Escuta sinais globais para abrir os modais (vindo da Sidebar/Busca)
  useEffect(() => {
    const handleOpenSettings = () => {
      setIsSettingsOpen(true);
    };
    const handleOpenProfile = () => {
      setIsProfileModalOpen(true);
      setShowDeleteConfirm(false);
    };
    const handleOpenShortcuts = () => {
      setIsShortcutsOpen(true);
    };

    window.addEventListener("open-settings-modal", handleOpenSettings);
    window.addEventListener("open-profile-modal", handleOpenProfile);
    window.addEventListener("open-shortcuts-modal", handleOpenShortcuts);

    return () => {
      window.removeEventListener("open-settings-modal", handleOpenSettings);
      window.removeEventListener("open-profile-modal", handleOpenProfile);
      window.removeEventListener("open-shortcuts-modal", handleOpenShortcuts);
    };
  }, []);

  // Sincroniza estados do LocalStorage ao abrir as configurações
  useEffect(() => {
    if (isSettingsOpen && typeof window !== "undefined") {
      const savedView = localStorage.getItem("pref-view-mode") || "cards";
      const savedPeriod = Number(localStorage.getItem("pref-commit-period") || "0");
      setViewPreference(savedView);
      setPeriodPreference(savedPeriod);
    }
  }, [isSettingsOpen]);

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

  // Atualiza e propaga as configurações do usuário
  const handleUpdateView = (val: string) => {
    setViewPreference(val);
    localStorage.setItem("pref-view-mode", val);
    window.dispatchEvent(new Event("settings-updated"));
  };

  const handleUpdatePeriod = (val: number) => {
    setPeriodPreference(val);
    localStorage.setItem("pref-commit-period", String(val));
    window.dispatchEvent(new Event("settings-updated"));
  };

  // Processo de remoção de conta
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (response.ok) {
        setIsProfileModalOpen(false);
        // Realiza o logout e redireciona à raiz
        await signOut({
          callbackUrl: "/",
        });
      } else {
        const data = await response.json();
        console.error("Failed to delete account:", data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error sending delete request:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isDashboardRoot = pathname === "/dashboard";

  return (
    <>
      <header className="
        fixed top-0 left-0 right-0
        h-14 z-[50]
        border-b border-white/[0.08]
        px-4 md:px-6 flex items-center justify-between
        bg-black/70 backdrop-blur-xl
        supports-[backdrop-filter]:bg-black/80
      ">
        {/* LEFT: Logo + Breadcrumb Responsivo */}
        <div className="flex items-center gap-3 md:gap-5 min-w-0 flex-1 mr-2">
          <Link href="/dashboard" className="relative group cursor-pointer shrink-0">
            <div className="absolute -inset-2" />
            <Image
              src="/logo.png"
              alt="GitGraph"
              width={24}
              height={24}
              className="relative animate-in fade-in duration-300"
            />
          </Link>

          <nav className="flex items-center gap-1.5 md:gap-3 text-[13px] font-medium tracking-tight min-w-0">
            <span className="text-zinc-700 font-light select-none">/</span>

            <Link
              href="/dashboard"
              className="hidden sm:inline text-zinc-500 hover:text-zinc-300 transition-colors truncate"
            >
              {user?.username ?? "system"}
            </Link>

            <span className="hidden sm:inline text-zinc-700 font-light select-none">/</span>

            <Link
              href="/dashboard"
              className={`transition-colors truncate ${isDashboardRoot
                  ? "text-white font-semibold inline"
                  : "hidden sm:inline text-zinc-500 hover:text-zinc-300"
                }`}
            >
              console
            </Link>

            {projectName && (
              <>
                <span className="text-zinc-700 font-light select-none">/</span>
                <Link
                  href={`/dashboard/${projectId}`}
                  className={`transition-colors truncate max-w-[100px] sm:max-w-[200px] ${!isReports
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
                  className="text-white font-semibold transition-colors shrink-0"
                >
                  reports
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* RIGHT: Status + Help + User */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
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
                cursor-pointer
              "
              aria-label="Open Help Menu"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Dropdown de Ajuda */}
            {isHelpOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  <Link
                    href="/docs"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setIsHelpOpen(false)}
                  >
                    <BookOpen className="w-4 h-4 text-zinc-500" />
                    <span>Documentation</span>
                  </Link>

                  <Link
                    href="/docs?cat=about"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setIsHelpOpen(false)}
                  >
                    <LifeBuoy className="w-4 h-4 text-zinc-500" />
                    <span>Support</span>
                  </Link>

                  <Link
                    href="/docs?cat=changelog"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setIsHelpOpen(false)}
                  >
                    <History className="w-4 h-4 text-zinc-500" />
                    <span>Changelog</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsHelpOpen(false);
                      setIsShortcutsOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    <Keyboard className="w-4 h-4 text-zinc-500" />
                    <span>Keyboard Shortcuts</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-white/[0.08]" />

          {/* User Avatar com Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="relative group focus:outline-none flex items-center cursor-pointer"
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
                <div className="relative w-[30px] h-[30px] rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                  {user?.username?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
            </button>

            {/* Dropdown do Perfil */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-zinc-800">
                  <p className="text-sm font-medium text-white truncate">{user?.username ?? "User"}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 truncate">{user?.email ?? "user@example.com"}</p>
                </div>

                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsProfileModalOpen(true);
                      setShowDeleteConfirm(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4 text-zinc-500" />
                    <span>Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4 text-zinc-500" />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-zinc-800 my-2" />

                  <button
                    onClick={async () => {
                      setIsProfileOpen(false);

                      await signOut({
                        callbackUrl: "/",
                      });
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
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

      {/* MODAL: Profile Details & Account Management */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-white/[0.06] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsProfileModalOpen(false);
                setShowDeleteConfirm(false);
              }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/5"
              aria-label="Close profile details"
            >
              <X className="w-4 h-4" />
            </button>

            {!showDeleteConfirm ? (
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt="User"
                        width={72}
                        height={72}
                        className="rounded-xl border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-xl font-bold text-emerald-500">
                        {user?.username?.charAt(0).toUpperCase() ?? "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Profile Details
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Verify your identifier status and account settings.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-[12px]">
                  <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                    <span className="text-zinc-500">Username</span>
                    <span className="text-white font-medium">{user?.username ?? "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-500">Email</span>
                    <span className="text-white font-medium truncate max-w-[170px]" title={user?.email}>
                      {user?.email ?? "N/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                  <button
                    onClick={() => setIsProfileModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.05] text-xs font-medium cursor-pointer transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center space-y-3">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    Confirm Account Deletion
                  </h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed px-2">
                    This action is completely permanent. All synchronized repositories, local configurations, and telemetry parameters will be deleted from the database.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? "Deleting..." : "Yes, delete my account"}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.05] text-xs font-medium cursor-pointer transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Keyboard Shortcuts */}
      {isShortcutsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-white/[0.06] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsShortcutsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/5"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-[#57e071]" />
                  Keyboard Shortcuts
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                  System navigation guidelines and active triggers.
                </p>
              </div>

              <div className="divide-y divide-white/[0.04] border-t border-b border-white/[0.04]">
                <ShortcutRow label="Search / Command Palette" keys={["Ctrl", "K"]} />
                <ShortcutRow label="Nodes Manager" keys={["N"]} />
                <ShortcutRow label="Connect Repository" keys={["G"]} />
                <ShortcutRow label="Settings" keys={["S"]} />
                <ShortcutRow label="Collapse Sidebar" keys={["["]} />
              </div>

              <button
                onClick={() => setIsShortcutsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.05] hover:border-white/10 text-xs font-medium cursor-pointer transition-all duration-200 active:scale-[0.98]"
              >
                Close Shortcuts
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Global Settings Preferences */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-zinc-950 border border-white/[0.06] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-white/5"
              aria-label="Close settings"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#57e071]" />
                  Client Settings
                </h3>
                <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                  Adjust default workspace preferences. Changes persist locally.
                </p>
              </div>

              {/* Ajuste de Preferência 1: View Padrão */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase text-zinc-600 font-mono tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3 h-3 text-[#57e071]" />
                  Default Dashboard View
                </span>
                <div className="grid grid-cols-2 gap-2 bg-white/[0.02] border border-white/[0.05] rounded-xl p-1">
                  <button
                    onClick={() => handleUpdateView("cards")}
                    className={`flex items-center justify-center gap-2 py-2 text-xs rounded-lg transition-all cursor-pointer ${viewPreference === "cards"
                        ? "bg-[#57e071] text-black font-semibold"
                        : "text-zinc-400 hover:text-white"
                      }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Cards
                  </button>
                  <button
                    onClick={() => handleUpdateView("table")}
                    className={`flex items-center justify-center gap-2 py-2 text-xs rounded-lg transition-all cursor-pointer ${viewPreference === "table"
                        ? "bg-[#57e071] text-black font-semibold"
                        : "text-zinc-400 hover:text-white"
                      }`}
                  >
                    <TableProperties className="w-3.5 h-3.5" />
                    Table
                  </button>
                </div>
              </div>

              {/* Ajuste de Preferência 2: Período de Commits */}
              <div className="space-y-2.5">
                <span className="text-[10px] uppercase text-zinc-600 font-mono tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#57e071]" />
                  Default Commit Period
                </span>
                <div className="grid grid-cols-3 gap-1 bg-white/[0.02] border border-white/[0.05] rounded-xl p-1">
                  {[
                    { label: "ALL", val: 0 },
                    { label: "7D", val: 7 },
                    { label: "30D", val: 30 },
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => handleUpdatePeriod(item.val)}
                      className={`py-2 text-[10px] font-mono rounded-md transition-all cursor-pointer ${periodPreference === item.val
                          ? "bg-[#57e071] text-black font-bold"
                          : "text-zinc-400 hover:text-white"
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.05] hover:border-white/10 text-xs font-medium cursor-pointer transition-all duration-200 active:scale-[0.98]"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* Row Component Helper */
function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[11px] text-zinc-400 font-normal">{label}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            {index > 0 && <span className="text-[9px] text-zinc-600 font-mono">+</span>}
            <kbd className="inline-flex items-center justify-center bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded text-[9px] text-zinc-300 font-mono min-w-[20px] select-none shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}