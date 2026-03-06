"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";

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
            <div className="flex gap-4">
              <SocialLink icon={<FaGithub />} href="#" />
              <SocialLink icon={<FaTwitter />} href="#" />
              <SocialLink icon={<FaFacebook />} href="#" />
              <SocialLink icon={<FaLinkedin />} href="#" />
            </div>
          </div>

          {/* Coluna 2: Produto */}
          <div>
            <h4 className="text-white text-xs font-mono uppercase tracking-[0.2em] mb-8">Platform</h4>
            <ul className="space-y-4">
              <FooterLink label="Security Protocol" href="#" />
              <FooterLink label="CI/CD Integration" href="#" />
              <FooterLink label="Technical Debt" href="#" />
              <FooterLink label="Team Velocity" href="#" />
            </ul>
          </div>

          {/* Coluna 3: Empresa */}
          <div>
            <h4 className="text-white text-xs font-mono uppercase tracking-[0.2em] mb-8">Company</h4>
            <ul className="space-y-4">
              <FooterLink label="About Us" href="#" />
              <FooterLink label="Documentation" href="#" />
              <FooterLink label="Privacy Policy" href="#" />
              <FooterLink label="Terms of Service" href="#" />
            </ul>
          </div>

          {/* Coluna 4: Newsletter */}
          <div className="space-y-6">
            <h4 className="text-white text-xs font-mono uppercase tracking-[0.2em] mb-8">Stay Updated</h4>
            <p className="text-zinc-500 text-sm font-mono leading-tight uppercase tracking-wider">
              {">"} join_the_changelog
            </p>
            <form className="relative">
              <input 
                type="email" 
                placeholder="engineer@email.com" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-mono px-3 py-1.5 rounded border border-zinc-700 transition-colors"
              >
                GO
              </button>
            </form>
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
            © {currentYear} GitGraph Labs. All rights reserved.
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

const SocialLink = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <Link 
    href={href} 
    className="w-10 h-10 rounded-lg bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all duration-300"
  >
    {icon}
  </Link>
);