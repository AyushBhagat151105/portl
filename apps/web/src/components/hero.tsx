import React, { useState } from 'react';
import { DownloadSimple, QrCode, ShieldCheck, Copy, Check, AndroidLogo } from '@phosphor-icons/react';
import { useApkRelease } from '../hooks/use-apk-release';

interface HeroProps {
  onOpenQr: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQr }) => {
  const [copied, setCopied] = useState(false);
  const { data: release } = useApkRelease();

  const handleCopyChecksum = () => {
    navigator.clipboard.writeText(release.sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.location.href = release.downloadUrl;
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Radial Amber Glow Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-87.5 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none animate-glow-slow" />
      <div className="absolute top-1/3 left-1/3 w-100 h-62.5 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
        
        {/* Micro-Eyebrow Badge with App Icon */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-amber-500/30 text-amber-400 text-[11px] font-mono tracking-[0.15em] uppercase mb-8 shadow-lg shadow-amber-500/10">
          <img src="/icon.png" alt="Portl Icon" className="w-5 h-5 rounded-md object-cover border border-amber-500/30" />
          <span>Official Android Release · v{release.version}</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white leading-[1.05] max-w-4xl mb-6">
          Smart Gate Security & Resident Operations.
        </h1>

        {/* Consumer Subhead */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-[60ch] leading-relaxed mb-10">
          Instant gate entry approval calls, single-tap digital guest passes, and automated maintenance dues—packaged into an ultra-fast, dark-themed Android app.
        </p>

        {/* Dual Actions Hub */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
          
          {/* Primary APK Download Button with Dynamic Size */}
          <button
            onClick={handleDownload}
            className="group w-full sm:w-auto px-7 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm tracking-tight flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-amber-500/25 active:scale-[0.98] cursor-pointer"
          >
            <AndroidLogo size={20} weight="fill" />
            <span>Download App (v{release.version} · {release.sizeFormatted})</span>
            <div className="w-7 h-7 rounded-full bg-zinc-950/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <DownloadSimple size={14} weight="bold" />
            </div>
          </button>

          {/* Secondary Scan QR Button */}
          <button
            onClick={onOpenQr}
            className="w-full sm:w-auto px-6 py-4 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/10 text-white font-medium text-sm flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.98] cursor-pointer"
          >
            <QrCode size={18} className="text-zinc-400" />
            <span>Scan QR Code on Phone</span>
          </button>
        </div>

        {/* Double-Bezel Security Guarantee Card with Dynamic Hash */}
        <div className="w-full max-w-2xl rounded-4xl p-1.5 bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="rounded-[1.625rem] bg-zinc-950/90 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            
            <div className="flex items-center gap-3 text-left">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldCheck size={20} weight="duotone" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <span>SHA-256 Package Checksum</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">Verified</span>
                </div>
                <div className="text-[11px] font-mono text-zinc-500 truncate max-w-70 sm:max-w-85">
                  {release.sha256}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyChecksum}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-medium text-zinc-300 flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-amber-400" />
                  <span className="text-amber-400 font-mono">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-zinc-400" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Consumer Feature Badges Row */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-amber-400" />
            <span>Works on Android 8.0 to Android 15</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-amber-400" />
            <span>24/7 Gate & Society Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-amber-400" />
            <span>100% Free for Residents</span>
          </div>
        </div>

      </div>
    </section>
  );
};
