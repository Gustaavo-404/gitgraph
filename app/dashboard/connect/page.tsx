"use client";

import { useEffect, useState, useMemo } from "react";
import { FaGithub, FaCheck, FaPlus, FaSearch, FaInfoCircle } from "react-icons/fa";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function ConnectPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/github/repos")
      .then(res => res.json())
      .then(data => {
        setRepos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const connect = async () => {
    await Promise.all(
      selected.map(id => {
        const repo = repos.find(r => r.id == id);
        return fetch("/api/projects", {
          method: "POST",
          body: JSON.stringify({
            provider: "github",
            externalId: String(repo.id),
            name: repo.name,
            fullName: repo.full_name,
          }),
        });
      })
    );
    window.location.href = "/dashboard";
  };

  const filteredRepos = useMemo(() => {
    return repos.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [repos, search]);

  // Estatísticas de seleção
  const selectedCount = selected.length;
  const totalCount = filteredRepos.length;

  return (
    <div className="pt-14 pb-20 space-y-10 animate-in fade-in duration-500">

      {/* Header com título e info */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800/50 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Connect Repositories
            </h1>
            <InfoTooltip text="Select GitHub repositories to import as nodes in your dashboard." />
          </div>
          <p className="text-zinc-600 text-sm font-mono">
            {totalCount} repositories available
          </p>
        </div>

        {/* Campo de busca estilizado */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm" />
          <input
            type="text"
            placeholder="Filter repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-[#57e071]/30 focus:border-[#57e071]/30 focus:outline-none transition-all backdrop-blur-sm"
          />
        </div>
      </header>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-900/50 rounded-2xl border border-zinc-800/50 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredRepos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 backdrop-blur-sm">
          <FaGithub className="text-4xl text-zinc-700 mb-4" />
          <p className="text-zinc-500 text-lg">No repositories found</p>
          <p className="text-zinc-700 text-sm mt-2">Try adjusting your search</p>
        </div>
      )}

      {/* Grid de repositórios */}
      {!loading && filteredRepos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => {
            const isSelected = selected.includes(repo.id);
            return (
              <div
                key={repo.id}
                onClick={() => toggle(repo.id)}
                className={`
                  group relative bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300
                  ${isSelected
                    ? "border-[#57e071] shadow-lg shadow-[#57e071]/10"
                    : "border-zinc-800/50 hover:border-[#57e071]/30 hover:shadow-xl hover:shadow-[#57e071]/5"
                  }
                `}
              >
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#57e071]/0 via-[#57e071]/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500 pointer-events-none" />

                {/* Checkmark */}
                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#57e071] flex items-center justify-center shadow-lg shadow-[#57e071]/30">
                    <FaCheck className="text-black text-xs" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center border border-zinc-600/50">
                    <FaGithub className="text-zinc-300 text-lg" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{repo.name}</h3>
                    <p className="text-sm text-zinc-500 truncate mt-1">{repo.full_name}</p>
                  </div>
                </div>

                {/* Badge de privado */}
                {repo.private && (
                  <div className="mt-4">
                    <span className="inline-block px-2 py-1 text-xs font-mono uppercase tracking-wider bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 rounded-full">
                      Private
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Barra de seleção e botão de conectar */}
      {!loading && filteredRepos.length > 0 && (
        <div className="sticky bottom-6 mt-8 flex justify-center">
          <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800/50 rounded-2xl shadow-2xl p-4 flex items-center gap-6">
            <div className="text-sm text-zinc-400">
              <span className="text-white font-semibold">{selectedCount}</span> repositories selected
            </div>
            <button
              disabled={selectedCount === 0}
              onClick={connect}
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-[#57e071] to-[#3fa855] rounded-xl px-6 py-3 text-black font-semibold hover:opacity-90 transition-all duration-300 shadow-lg shadow-[#57e071]/20 hover:shadow-xl hover:shadow-[#57e071]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              <FaPlus className="transition-transform group-hover:rotate-90" />
              Connect Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Tooltip Component (reutilizado) --- */
function InfoTooltip({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`relative group cursor-pointer ${className || ""}`}>
      <InformationCircleIcon className="w-4 h-4 text-zinc-600 hover:text-[#57e071] transition-colors" />
      <div className="absolute bottom-full right-0 mb-2 w-56 bg-zinc-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl border border-zinc-800 z-50">
        {text}
      </div>
    </div>
  );
}