"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black border-t border-zinc-900 pt-20 pb-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          
          {/* Coluna 1: Logo e Branding */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="GitGraph Logo"
                width={30}
                height={30}
                className="opacity-80"
              />
              <span className="text-xl font-normal tracking-tighter text-white">
                GitGraph
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Next-generation intelligence for GitHub repositories. 
              Built for engineering teams who value code health and velocity.
            </p>
          </div>

          {/* Coluna 2: Produto */}
          <div>
            <h4 className="text-white text-xs font-mono uppercase tracking-[0.2em] mb-8">Platform</h4>
            <ul className="space-y-4">
              <FooterLink label="Security Protocol" href="/docs?cat=getting-started#security-standards" />
              <FooterLink label="CI/CD Integration" href="/docs?cat=getting-started#cicd-integrations" />
            </ul>
          </div>

          {/* Coluna 3: Project */}
          <div>
            <h4 className="text-white text-xs font-mono uppercase tracking-[0.2em] mb-8">Project</h4>
            <ul className="space-y-4">
              <FooterLink label="About" href="/docs?cat=about" />
              <FooterLink label="Documentation" href="/docs" />
            </ul>
          </div>

          {/* Coluna 4: Changelog */}
          <div className="space-y-6">
            <h4 className="text-white text-xs font-mono uppercase tracking-[0.2em] mb-8">Updates</h4>
            <Link 
              href="/docs?cat=changelog"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all duration-300 font-mono uppercase tracking-wider"
            >
              <span>{">"} read_changelog</span>
            </Link>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-zinc-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
              All systems operational
            </span>
          </div>
          
          <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">
            © {currentYear} GitGraph. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

/* Sub-componentes para manter o código limpo */
const FooterLink = ({ label, href }: { label: string; href: string }) => (
  <li>
    <Link 
      href={href} 
      className="text-zinc-500 hover:text-emerald-400 text-sm transition-colors duration-300 flex items-center group"
    >
      <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-emerald-500 font-mono text-[10px]">
        →
      </span>
      {label}
    </Link>
  </li>
);