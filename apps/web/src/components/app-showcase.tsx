import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellRinging, QrCode, CreditCard, UsersThree, CheckCircle, Sparkle, 
  WifiHigh, BatteryFull, ShieldCheck, Check, X, Receipt, User
} from '@phosphor-icons/react';

export const AppShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const showcaseItems = [
    {
      id: 'gate-calls',
      title: 'Gate Entry Requests',
      subtitle: 'Instant Push Alerts to Mobile',
      icon: BellRinging,
      badge: 'Security Operations',
      description: 'Security guards trigger instant gate entry verification. Residents receive push alerts with visitor details directly on their phones to approve or decline.',
    },
    {
      id: 'qr-passes',
      title: 'Digital Visitor Passes',
      subtitle: 'Single-Tap Invites for Guests',
      icon: QrCode,
      badge: 'Resident Convenience',
      description: 'Pre-approve guests, delivery drivers, or household help by generating instant QR entry passes that expire automatically.',
    },
    {
      id: 'treasury',
      title: 'Society Treasury',
      subtitle: 'Maintenance Payments & Receipts',
      icon: CreditCard,
      badge: 'Financial Transparency',
      description: 'Pay monthly maintenance dues securely, inspect transparent society balance sheets, and download instant payment receipts.',
    },
    {
      id: 'directory',
      title: 'Directory & Roles',
      subtitle: 'Verified Resident Membership',
      icon: UsersThree,
      badge: 'Society Security',
      description: 'Role-based access control ensuring distinct permissions for Security Officers, Residents, and Society Admins.',
    }
  ];

  return (
    <section 
      id="showcase" 
      className="relative bg-zinc-950 border-y border-white/5 py-20 md:py-28 overflow-hidden"
    >
      <div className="max-w-6xl w-full mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase font-mono tracking-widest mb-4">
            <Sparkle size={12} weight="fill" className="text-amber-400" />
            <span>Interactive App Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Designed for Everyday Residents & Guards.
          </h2>
          <p className="text-sm text-zinc-400">
            Select an app feature below to see how Portl works on Android.
          </p>
        </div>

        {/* Tab Selection Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {showcaseItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === idx;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(idx)}
                className={`relative p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                  isActive
                    ? 'bg-zinc-900 border-amber-500/40 shadow-xl shadow-amber-500/10'
                    : 'bg-zinc-950/60 border-white/5 hover:border-white/15 text-zinc-400'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-linear-to-r from-amber-500/10 via-transparent to-transparent pointer-events-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 relative z-10 ${
                  isActive ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/30' : 'bg-white/5 text-zinc-400'
                }`}>
                  <Icon size={18} weight={isActive ? 'bold' : 'regular'} />
                </div>
                <div className={`text-xs sm:text-sm font-semibold mb-1 relative z-10 ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                  {item.title}
                </div>
                <div className="text-[11px] text-zinc-500 truncate relative z-10">
                  {item.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Showcase Doppelrand Container */}
        <div className="rounded-4xl p-2.5 sm:p-4 bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl">
          <div className="rounded-[1.75rem] bg-zinc-950 p-6 sm:p-8 md:p-12 border border-white/5 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Description Column */}
            <div className="md:col-span-6 text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showcaseItems[activeTab].id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="px-3 py-1 rounded-md text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 inline-block">
                    {showcaseItems[activeTab].badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4">
                    {showcaseItems[activeTab].title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed mb-8 max-w-md">
                    {showcaseItems[activeTab].description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle size={18} className="text-amber-400 shrink-0" />
                      <span>Instant Mobile Push Alerts</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle size={18} className="text-amber-400 shrink-0" />
                      <span>Bank-Grade 256-Bit Data Encryption</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                      <CheckCircle size={18} className="text-amber-400 shrink-0" />
                      <span>24/7 Gate & Society Uptime</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right REAL NATIVE APP MOBILE SCREEN HARDWARE FRAME */}
            <div className="md:col-span-6 flex justify-center py-2">
              <div className="relative">
                
                {/* Side Buttons Notches */}
                <div className="absolute -left-1.25 top-16 w-1 h-8 bg-zinc-800 rounded-l-md" />
                <div className="absolute -left-1.25 top-28 w-1 h-8 bg-zinc-800 rounded-l-md" />
                <div className="absolute -right-1.25 top-20 w-1 h-12 bg-zinc-800 rounded-r-md" />

                {/* Outer Machine Chassis Frame */}
                <div className="w-67.5 sm:w-72.5 h-130 sm:h-137.5 rounded-[3rem] p-2.5 bg-zinc-900 border-2 border-amber-800/40 shadow-2xl shadow-amber-500/10 relative overflow-hidden flex flex-col justify-between">
                  
                  {/* Inner Glass Bezel Border */}
                  <div className="absolute inset-0 rounded-[3rem] border border-white/10 pointer-events-none z-30" />
                  
                  {/* Diagonal Screen Reflection Glare */}
                  <div className="absolute -inset-full bg-linear-to-tr from-transparent via-white/4 to-transparent rotate-45 pointer-events-none z-30" />

                  {/* TOP MOBILE STATUS BAR & DYNAMIC ISLAND NOTCH */}
                  <div className="relative z-20 pt-1 px-4 flex items-center justify-between text-[10px] font-mono font-bold text-zinc-400">
                    <span>09:41</span>
                    
                    {/* Dynamic Island Punch-hole */}
                    <div className="w-18 h-3.5 bg-black rounded-full border border-white/10 flex items-center justify-center gap-1.5 px-2 shadow-inner">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-zinc-700" />
                    </div>

                    <div className="flex items-center gap-1">
                      <WifiHigh size={11} weight="bold" />
                      <BatteryFull size={13} weight="bold" className="text-amber-400" />
                    </div>
                  </div>

                  {/* MOBILE DISPLAY SCREEN CONTENT AREA */}
                  <div className="flex-1 bg-zinc-950 rounded-[2.25rem] mt-1.5 mb-1 p-3.5 border border-white/5 flex flex-col justify-between relative overflow-hidden z-10 shadow-inner text-left">
                    
                    {/* App Header Bar */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <img src="/icon.png" alt="Portl Icon" className="w-6 h-6 rounded-md border border-amber-500/30 object-cover" />
                        <span className="font-bold text-white text-xs tracking-tight">Greenwood Heights</span>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        TOWER B
                      </span>
                    </div>

                    {/* Dynamic Screen Content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={showcaseItems[activeTab].id}
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.04, y: -8 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="py-3 space-y-2.5 flex-1 flex flex-col justify-center"
                      >
                        {/* SCREEN 1: Gate Calls */}
                        {showcaseItems[activeTab].id === 'gate-calls' && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                              <BellRinging size={14} className="text-amber-400" />
                              <span>Active Gate Entry Requests (1)</span>
                            </div>

                            <div className="p-3 rounded-2xl bg-zinc-900 border border-amber-500/50 shadow-lg shadow-amber-500/10 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-xs font-bold text-white">Rahul Sharma</div>
                                  <div className="text-[10px] text-zinc-400 mt-0.5">Courier Delivery</div>
                                  <div className="text-[10px] text-amber-400/90 font-mono mt-0.5">Vehicle: MH 12 AB 4920</div>
                                </div>
                                <span className="text-[9px] font-mono text-zinc-500">Just now</span>
                              </div>

                              <div className="flex items-center gap-2 pt-1">
                                <button className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md">
                                  <Check size={14} weight="bold" />
                                  <span>APPROVE</span>
                                </button>
                                <button className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-md">
                                  <X size={14} weight="bold" />
                                  <span>DECLINE</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SCREEN 2: Visitor Passes */}
                        {showcaseItems[activeTab].id === 'qr-passes' && (
                          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 text-center space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-mono text-amber-400">
                              <span>GUEST ENTRY PASS</span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">ACTIVE</span>
                            </div>

                            <div className="text-xs font-bold text-white">Vikram Mehta (Guest)</div>
                            <div className="text-[10px] text-zinc-400 font-mono">Valid until 11:00 PM Today</div>
                            
                            <div className="w-28 h-28 bg-white p-2.5 rounded-2xl mx-auto flex items-center justify-center shadow-xl my-1">
                              <QrCode size={100} className="text-black" />
                            </div>

                            <div className="text-[10px] font-mono text-zinc-300 bg-zinc-950 py-1.5 rounded-xl border border-white/5 tracking-wider font-bold">
                              PASSCODE: PORTL-892401
                            </div>
                          </div>
                        )}

                        {/* SCREEN 3: Society Treasury */}
                        {showcaseItems[activeTab].id === 'treasury' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="text-xs font-extrabold text-white">Monthly Maintenance Bill</div>
                              <div className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                                <span className="text-amber-400 text-[8px] font-extrabold uppercase">Verified</span>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400">July Maintenance Dues</span>
                                <Receipt size={14} className="text-amber-400" />
                              </div>
                              <div className="text-2xl font-black text-white font-mono">₹ 4,500.00</div>
                              <div className="inline-flex items-center gap-1.5 text-[9px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                                <ShieldCheck size={12} weight="fill" />
                                <span>PAID & RECEIPT GENERATED</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* SCREEN 4: Resident Directory */}
                        {showcaseItems[activeTab].id === 'directory' && (
                          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 space-y-2.5">
                            <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
                              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                <User size={18} />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-white">Ayush Bhagat</div>
                                <div className="text-[10px] text-zinc-400 font-mono">Tower B - Unit 402</div>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-zinc-950 border border-amber-500/20 space-y-0.5">
                              <div className="text-[9px] font-mono text-zinc-500 uppercase">Verified Residency</div>
                              <div className="text-xs text-amber-400 font-mono font-bold">FLAT RESIDENT</div>
                            </div>

                            <div className="text-[9px] text-zinc-400 font-mono flex items-center gap-1">
                              <ShieldCheck size={12} className="text-emerald-400" />
                              <span>Verified Member Account</span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Bottom Mobile Navigation Tabs */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-around text-zinc-500 text-[10px]">
                      <div className={`flex flex-col items-center gap-0.5 ${activeTab === 0 ? 'text-amber-400' : ''}`}>
                        <BellRinging size={14} />
                        <span className="text-[8px]">Calls</span>
                      </div>
                      <div className={`flex flex-col items-center gap-0.5 ${activeTab === 1 ? 'text-amber-400' : ''}`}>
                        <QrCode size={14} />
                        <span className="text-[8px]">Passes</span>
                      </div>
                      <div className={`flex flex-col items-center gap-0.5 ${activeTab === 2 ? 'text-amber-400' : ''}`}>
                        <CreditCard size={14} />
                        <span className="text-[8px]">Dues</span>
                      </div>
                      <div className={`flex flex-col items-center gap-0.5 ${activeTab === 3 ? 'text-amber-400' : ''}`}>
                        <UsersThree size={14} />
                        <span className="text-[8px]">Profile</span>
                      </div>
                    </div>

                  </div>

                  {/* Bottom Mobile Home Navigation Bar */}
                  <div className="w-24 h-1 bg-white/30 rounded-full mx-auto mt-1 z-20" />

                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
