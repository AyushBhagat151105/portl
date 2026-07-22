import React, { useState, useEffect } from 'react';
import { DownloadSimple, List, X } from '@phosphor-icons/react';
import { useApkRelease } from '../hooks/use-apk-release';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: release } = useApkRelease();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDownload = () => {
    const element = document.createElement('a');
    element.href = release?.downloadUrl || 'https://portl-api.ayushbhagat.com/api/apk/download';
    element.setAttribute('download', 'portl.apk');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 md:pt-6 transition-all duration-300">
      <nav className={`w-full max-w-5xl transition-all duration-500 rounded-full border border-white/10 backdrop-blur-2xl flex items-center justify-between px-4 md:px-6 py-2.5 ${
        scrolled ? 'bg-zinc-950/90 shadow-2xl shadow-amber-500/5 border-white/15' : 'bg-zinc-900/70'
      }`}>
        {/* Brand Logo & Name */}
        <a href="#" className="flex items-center gap-3 group">
          <img
            src="/icon.png"
            alt="Portl App Icon"
            className="w-9 h-9 rounded-xl shadow-md border border-amber-500/30 group-hover:scale-105 transition-transform duration-300 object-cover"
          />
          <div className="flex flex-col text-left">
            <span className="text-white font-bold tracking-tight text-sm flex items-center gap-1.5">
              Portl <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">v{release?.version || '1.0.0'}</span>
            </span>
            <span className="text-[10px] text-zinc-400 hidden sm:inline-block">Society Security & Dues</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#showcase" className="hover:text-white transition-colors">App Showcase</a>
          <a href="#guide" className="hover:text-white transition-colors">How to Install</a>
        </div>

        {/* CTA Download Button */}
        <div className="hidden sm:flex items-center gap-3">
          <button 
            onClick={handleDownload}
            className="group relative inline-flex items-center gap-2.5 px-4.5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all duration-300 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <span>Download App</span>
            <div className="w-5 h-5 rounded-full bg-zinc-950/20 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
              <DownloadSimple size={12} weight="bold" />
            </div>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
        >
          {mobileMenuOpen ? <X size={16} /> : <List size={16} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-4 top-20 p-6 rounded-3xl bg-zinc-950/95 border border-white/15 backdrop-blur-3xl shadow-2xl flex flex-col gap-4 text-sm z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-2 border-b border-white/5">Features</a>
          <a href="#showcase" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-2 border-b border-white/5">App Showcase</a>
          <a href="#guide" onClick={() => setMobileMenuOpen(false)} className="text-zinc-300 hover:text-white py-2 border-b border-white/5">How to Install</a>
          <button 
            onClick={() => { setMobileMenuOpen(false); handleDownload(); }}
            className="w-full mt-2 py-3 rounded-full bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <DownloadSimple size={16} weight="bold" />
            <span>Download Portl App ({release?.sizeFormatted || '42.8 MB'})</span>
          </button>
        </div>
      )}
    </header>
  );
};
