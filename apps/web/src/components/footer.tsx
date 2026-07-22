import React from 'react';
import { ShieldCheck, DownloadSimple, GithubLogo, FileText } from '@phosphor-icons/react';
import { useApkRelease } from '../hooks/use-apk-release';

export const Footer: React.FC = () => {
  const { data: release } = useApkRelease();

  return (
    <footer className="relative bg-zinc-950 border-t border-white/5 py-12 text-xs text-zinc-500">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Brand Identity */}
        <div className="flex items-center gap-3">
          <img
            src="/icon.png"
            alt="Portl App Icon"
            className="w-8 h-8 rounded-xl shadow-md border border-amber-500/30 object-cover"
          />
          <div className="text-left">
            <div className="text-white font-semibold text-xs flex items-center gap-2">
              <span>Portl Smart Society Systems</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                v{release.version} RELEASE
              </span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              Smart Gate Security, Visitor QR Passes & Society Operations.
            </div>
          </div>
        </div>

        {/* Center Diagnostics Badges */}
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>GATE SYSTEM: 100% OPERATIONAL</span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>BANK-GRADE ENCRYPTED</span>
          </div>
        </div>

        {/* Right Action Links */}
        <div className="flex flex-wrap items-center gap-4 font-medium text-zinc-400">
          <a
            href="https://portl-api.ayushbhagat.com/reference"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <FileText size={14} />
            <span>API Reference</span>
          </a>
          <a
            href="https://github.com/AyushBhagat151105/portl"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <GithubLogo size={14} />
            <span>GitHub</span>
          </a>
          <a
            href={release.downloadUrl}
            className="hover:text-white transition-colors flex items-center gap-1.5 text-amber-400 font-bold"
          >
            <DownloadSimple size={14} />
            <span>Download APK</span>
          </a>
        </div>

      </div>

      <div className="mt-8 text-center text-[11px] text-zinc-600 border-t border-white/5 pt-6">
        © {new Date().getFullYear()} Portl Smart Society Systems. Built for Residents & Housing Communities. All rights reserved.
      </div>
    </footer>
  );
};
