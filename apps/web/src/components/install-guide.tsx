import React from 'react';
import { DownloadSimple, Gear, CheckCircle, ArrowRight } from '@phosphor-icons/react';

export const InstallGuide: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Download the Portl App',
      subtitle: 'Safe Package · ~42.8 MB',
      description: 'Tap the "Download App" button to download portl-v1.0.0.apk directly to your Android smartphone.',
      icon: DownloadSimple,
      action: 'portl-v1.0.0.apk'
    },
    {
      number: '02',
      title: 'Allow Installation Prompt',
      subtitle: 'Standard Android Protection',
      description: 'When prompted by your browser, tap "Settings" and enable "Allow from this source" to install the app.',
      icon: Gear,
      action: 'Settings ➔ Allow'
    },
    {
      number: '03',
      title: 'Open Portl & Sign In',
      subtitle: 'Instant Setup',
      description: 'Launch Portl, enter your mobile number, and select your apartment to start receiving gate calls.',
      icon: CheckCircle,
      action: 'Open & Enjoy'
    }
  ];

  return (
    <section id="guide" className="relative py-24 md:py-32 bg-zinc-950/40 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase font-mono tracking-widest mb-4">
            Easy 3-Step Setup
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            How to Install Portl on Android
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            No Play Store account required. Follow these simple steps to install the app directly on your phone.
          </p>
        </div>

        {/* 3-Step Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="group rounded-4xl p-1.5 bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div className="rounded-[1.625rem] bg-zinc-950 p-6 sm:p-8 h-full flex flex-col justify-between border border-white/5 relative">
                  
                  <div>
                    {/* Step Number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-2xl font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                        {step.number}
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300">
                        <Icon size={20} />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white tracking-tight mb-1">
                      {step.title}
                    </h3>
                    <div className="text-xs font-mono text-amber-400/80 mb-4">
                      {step.subtitle}
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Footer Badge */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>ACTION</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      {step.action}
                      <ArrowRight size={12} />
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
