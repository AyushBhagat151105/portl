import React from 'react';
import { X, ShieldCheck, DownloadSimple } from '@phosphor-icons/react';
import { useApkRelease } from '../hooks/use-apk-release';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ isOpen, onClose }) => {
  const { data: release } = useApkRelease();
  if (!isOpen) return null;

  const downloadUrl = release.downloadUrl;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(downloadUrl)}&color=ffffff&bgcolor=09090b`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Double Bezel Outer Shell */}
      <div className="relative w-full max-w-sm rounded-[2.5rem] p-2 bg-white/5 border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        
        {/* Inner Core */}
        <div className="rounded-4xl bg-zinc-950 p-6 flex flex-col items-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] relative">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Icon Header */}
          <img
            src="/icon.png"
            alt="Portl Icon"
            className="w-12 h-12 rounded-2xl border border-amber-500/30 mb-4 shadow-lg shadow-amber-500/10 object-cover"
          />

          <h3 className="text-lg font-semibold text-white tracking-tight mb-1">
            Scan to Install Portl v{release.version}
          </h3>
          <p className="text-xs text-zinc-400 max-w-60 mb-6">
            Open your Android camera to scan and download directly to your mobile phone.
          </p>

          {/* QR Code Container with Double-Bezel */}
          <div className="rounded-2xl p-3 bg-zinc-900 border border-white/10 shadow-inner mb-6 relative group">
            <img
              src={qrSvgUrl}
              alt="Scan Portl APK QR Code"
              className="w-48 h-48 rounded-lg object-contain"
            />
            <div className="absolute inset-0 bg-amber-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-mono mb-4">
            <ShieldCheck size={14} weight="fill" />
            <span>Verified Package · {release.sizeFormatted}</span>
          </div>

          {/* Direct Download Link */}
          <a
            href={release.downloadUrl}
            className="w-full py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <DownloadSimple size={14} />
            <span>Download Directly on PC</span>
          </a>
        </div>
      </div>
    </div>
  );
};
