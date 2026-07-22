import React from 'react';
import { BellRinging, QrCode, CreditCard, LockKey } from '@phosphor-icons/react';

export const BentoFeatures: React.FC = () => {
  return (
    <section id="features" className="relative py-24 md:py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase font-mono tracking-widest mb-4">
            Core Features
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Built for Speed, Security, and Transparency.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Everything your housing society needs for gate operations, visitor entry, and maintenance collection.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Bento Tile 1 (Large Col-8): Real-Time Gate Entry Calls */}
          <div className="md:col-span-8 group rounded-4xl p-1.5 bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-500 shadow-xl">
            <div className="h-full rounded-[1.625rem] bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
              
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-md shadow-amber-500/10">
                  <BellRinging size={22} weight="duotone" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                  Instant Gate Entry Push Notifications
                </h3>
                <p className="text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">
                  When a guest or courier arrives at the gate, guards send instant push notifications with visitor photos and vehicle numbers directly to your mobile phone.
                </p>
              </div>

              {/* Decorative Card Inner UI Element */}
              <div className="relative z-10 p-4 rounded-xl bg-zinc-900/90 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs font-mono text-zinc-300">LIVE GATE VERIFICATION</span>
                </div>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">Instant Delivery</span>
              </div>

              {/* Background Ambient Glow */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
            </div>
          </div>

          {/* Bento Tile 2 (Col-4): Digital QR Passes */}
          <div className="md:col-span-4 group rounded-4xl p-1.5 bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-500 shadow-xl">
            <div className="h-full rounded-[1.625rem] bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
              
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-md shadow-amber-500/10">
                  <QrCode size={22} weight="duotone" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                  Digital Guest Invites
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Pre-approve friends, delivery drivers, or household staff by creating digital QR passes that expire automatically.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 text-center font-mono text-xs text-amber-400">
                <span>AUTOPASS EXPIRES AT MIDNIGHT</span>
              </div>
            </div>
          </div>

          {/* Bento Tile 3 (Col-4): Society Treasury */}
          <div className="md:col-span-4 group rounded-4xl p-1.5 bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-500 shadow-xl">
            <div className="h-full rounded-[1.625rem] bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
              
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-md shadow-amber-500/10">
                  <CreditCard size={22} weight="duotone" />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight mb-2">
                  Automated Maintenance Dues
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Pay monthly maintenance fees securely and view transparent society balance sheets right inside the app.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Instant Receipts</span>
                <span className="text-amber-400 font-mono">100% Encrypted</span>
              </div>
            </div>
          </div>

          {/* Bento Tile 4 (Large Col-8): Society Security */}
          <div className="md:col-span-8 group rounded-4xl p-1.5 bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-500 shadow-xl">
            <div className="h-full rounded-[1.625rem] bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between border border-white/5 relative overflow-hidden">
              
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 shadow-md shadow-amber-500/10">
                  <LockKey size={22} weight="duotone" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-2">
                  Multi-Level Society Security
                </h3>
                <p className="text-sm text-zinc-400 max-w-lg mb-6 leading-relaxed">
                  Tailored interfaces for Residents, Security Guards, and Society Management to keep your apartment complex safe and well-managed.
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-amber-500/30 text-center text-amber-400 font-bold">RESIDENTS</div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-center text-zinc-300">SECURITY GUARDS</div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-center text-zinc-300">SOCIETY ADMINS</div>
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/5 text-center text-zinc-300">TREASURERS</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
