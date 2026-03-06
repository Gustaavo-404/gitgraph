import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaChevronDown } from "react-icons/fa";

export function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-black/70 text-white border-b border-white/10 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">

        {/* Left - Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Logo"
            width={35}
            height={35}
            priority
          />
          <span className="text-lg font-normal tracking-tight">
            GitGraph
          </span>
        </div>

        {/* Center - Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-zinc-300">

          {/* PRODUCT */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-white transition">
              Product
              <FaChevronDown className="text-xs opacity-70 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Dropdown */}
            <div className="absolute left-0 top-full mt-4 w-[520px] rounded-xl border border-white/10 bg-zinc-950 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="grid grid-cols-2 gap-6">

                {/* Coluna 1 */}
                <div>
                  <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                    Core Platform
                  </p>

                  <div className="space-y-3">
                    <DropdownItem
                      title="Repository Analytics"
                      desc="Deep metrics on commits and growth."
                    />
                    <DropdownItem
                      title="Contributor Insights"
                      desc="Performance and collaboration patterns."
                    />
                    <DropdownItem
                      title="Code Health"
                      desc="Quality and technical debt signals."
                    />
                    <DropdownItem
                      title="Activity Timeline"
                      desc="Visual history of your output."
                    />
                  </div>
                </div>

                {/* Coluna 2 */}
                <div>
                  <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                    Visualization
                  </p>

                  <div className="space-y-3">
                    <DropdownItem
                      title="Interactive Dashboards"
                      desc="Custom charts and metrics."
                    />
                    <DropdownItem
                      title="Graphs & Trends"
                      desc="Spot long-term patterns."
                    />
                    <DropdownItem
                      title="Heatmaps"
                      desc="When and where work happens."
                    />
                    <DropdownItem
                      title="Comparisons"
                      desc="Compare repos and teams."
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* FEATURES */}
          <div className="relative group">
            <button className="flex items-center gap-1 hover:text-white transition">
              Features
              <FaChevronDown className="text-xs opacity-70 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Dropdown */}
            <div className="absolute left-0 top-full mt-4 w-[520px] rounded-xl border border-white/10 bg-zinc-950 p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="grid grid-cols-2 gap-6">

                {/* Coluna 1 */}
                <div>
                  <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                    Automation
                  </p>

                  <div className="space-y-3">
                    <DropdownItem
                      title="Auto Sync"
                      desc="Always up-to-date with GitHub."
                    />
                    <DropdownItem
                      title="Scheduled Reports"
                      desc="Insights delivered automatically."
                    />
                    <DropdownItem
                      title="Smart Alerts"
                      desc="Get notified of key changes."
                    />
                    <DropdownItem
                      title="Data Refresh"
                      desc="Real-time or batch updates."
                    />
                  </div>
                </div>

                {/* Coluna 2 */}
                <div>
                  <p className="mb-3 text-xs uppercase tracking-widest text-zinc-500">
                    Integrations
                  </p>

                  <div className="space-y-3">
                    <DropdownItem
                      title="GitHub OAuth"
                      desc="Secure account connection."
                    />
                    <DropdownItem
                      title="API Access"
                      desc="Use your data anywhere."
                    />
                    <DropdownItem
                      title="Export Data"
                      desc="CSV, JSON and PDF."
                    />
                    <DropdownItem
                      title="Webhooks"
                      desc="Trigger workflows from events."
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          <Link href="#" className="hover:text-white transition">Docs</Link>
          <Link href="#" className="hover:text-white transition">About</Link>
        </nav>

        {/* Right - CTA */}
        <Link
          href="/login"
          className="group relative flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm overflow-hidden transition-all duration-300 cursor-pointer"
        >
          <span className="absolute bottom-0 left-0 w-0 h-0 rounded-full bg-white transition-all duration-600 ease-out group-hover:w-[500px] group-hover:h-[500px] group-hover:-bottom-40 group-hover:-left-40" />

          <FaGithub className="text-lg relative z-10 text-white group-hover:text-black transition-colors duration-300" />
          <span className="relative z-10 text-white group-hover:text-black transition-colors duration-300">
            Connect GitHub
          </span>
        </Link>
      </div>
    </header>
  );
}

function DropdownItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="cursor-pointer rounded-lg p-2 hover:bg-white/5 transition">
      <p className="text-sm text-white">{title}</p>
      <p className="text-xs text-zinc-400">{desc}</p>
    </div>
  );
}