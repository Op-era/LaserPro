import React from 'react';
import { X, Zap, Target, Grid, Scissors, ShieldAlert, Compass, MoveHorizontal, Camera, Info, BookOpen, Settings, ShoppingBag, ExternalLink, Cpu } from 'lucide-react';

interface HelpGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpGuide({ isOpen, onClose }: HelpGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0d1218] border border-white/10 w-full max-w-5xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <BookOpen className="text-emerald-500" />
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">LaserTrace Documentation</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Mastering your Laser</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scroll">
          {/* Driver Section */}
          <section className="p-8 bg-blue-500/5 rounded-3xl border border-blue-500/20 space-y-6">
            <h3 className="text-blue-400 font-black uppercase tracking-widest flex items-center gap-2">
              <Cpu size={18} /> 00. Driver Installation (REQUIRED)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  Most diode lasers use the <span className="text-white font-bold">CH340/CH341 USB-to-Serial</span> bridge. Without these drivers, your computer cannot see the laser as a COM port.
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <p className="text-[10px] font-black text-white uppercase mb-1">Standard Serial Drivers</p>
                    <a 
                      href="http://www.wch-ic.com/downloads/CH341SER_EXE.html" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-400 flex items-center gap-1 hover:underline"
                    >
                      Official CH340 Driver Download <ExternalLink size={10}/>
                    </a>
                  </div>
                  <p className="text-[9px] text-gray-500 italic">Note: If you have used LightBurn or LaserGRBL on this PC before, your drivers are likely already installed.</p>
                </div>
              </div>
              <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 space-y-3">
                <p className="text-[10px] font-black text-blue-300 uppercase">Verification Steps:</p>
                <ul className="text-[10px] text-gray-400 space-y-2 list-decimal ml-4">
                  <li>Install the driver and restart your browser.</li>
                  <li>Plug in the laser and turn it on.</li>
                  <li>Click "CONNECT" in the top bar.</li>
                  <li>Select the appropriate USB-SERIAL port from the list.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Workflow Essentials */}
          <section className="space-y-6">
            <h3 className="text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <Zap size={18} /> 01. Workflow Essentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-white font-black text-[10px] uppercase">Image Prep</p>
                <p className="text-[11px] text-gray-400">High-contrast images work best. Use the 'Contrast' and 'Gamma' filters to ensure your shadows aren't "muddy". The laser needs clear differences in tone to shade correctly.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-white font-black text-[10px] uppercase">The First Fire</p>
                <p className="text-[11px] text-gray-400">Always use 'Pulse' to see exactly where your beam is. Wear safety goggles! If the laser doesn't mark, check your 'Min Power' setting.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <p className="text-white font-black text-[10px] uppercase">Safety Protocol</p>
                <p className="text-[11px] text-gray-400">Never leave the machine unattended. Materials like PVC or Vinyl release toxic gases. Stick to wood, slate, and laser-safe acrylics.</p>
              </div>
            </div>
          </section>

          {/* Vision Suite */}
          <section className="space-y-6">
            <h3 className="text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <Camera size={18} /> 02. Vision Suite (Bed Mapping)
            </h3>
            <div className="space-y-4">
              <p className="text-[11px] text-gray-300">To place designs accurately on scrap material, your camera must be mapped to the laser's coordinate system:</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: "Start", desc: "Click 'Bed Mapping' to activate the overhead camera." },
                  { step: "Top-Left", desc: "Click the exact top-left corner of your physical work area." },
                  { step: "Clockwise", desc: "Click Top-Right, then Bottom-Right, then Bottom-Left." },
                  { step: "Overlay", desc: "Adjust Opacity to see your design projected onto the bed." }
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-black/40 rounded-xl border border-emerald-500/10">
                    <span className="text-[9px] font-black text-emerald-500 uppercase">Step {i+1}</span>
                    <p className="text-white font-bold text-[10px] my-1">{item.step}</p>
                    <p className="text-[10px] text-gray-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Technical Guide */}
          <section className="space-y-6">
            <h3 className="text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <Settings size={18} /> 03. Technical Parameter Guide
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-5 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-[10px]"><Target size={14} className="text-cyan-400"/> PPI & Resolution</div>
                  <p className="text-[10px] text-gray-400">Pixels Per Inch (PPI) defines the detail. For diode lasers with common spot sizes (~0.06mm), use a PPI that matches your 'Lines per mm' (e.g., 16.6 l/mm ≈ 420 PPI).</p>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-[10px]"><Zap size={14} className="text-yellow-400"/> Power Gamma</div>
                  <p className="text-[10px] text-gray-400">Adjusts the mid-tone distribution. If your images are too dark, increase Gamma. If they are washed out, decrease it. Most wood performs best at 1.8 to 2.2 Gamma.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-5 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-[10px]"><ShieldAlert size={14} className="text-orange-400"/> M3 vs M4 Modes</div>
                  <p className="text-[10px] text-gray-400">M3 is Constant Power (good for cutting). M4 is Dynamic Power (essential for photos). M4 adjusts power based on speed, preventing burns during acceleration/deceleration.</p>
                </div>
                <div className="p-5 bg-white/5 rounded-2xl space-y-2 border border-white/5">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-[10px]"><Compass size={14} className="text-emerald-400"/> Scan Angle</div>
                  <p className="text-[10px] text-gray-400">Horizontal (0°) is fastest. Diagonal (45°) creates better visual contrast on grains and hides scanning lines. Use 90° if your material has heavy horizontal grain.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Copper & Metal Warning */}
          <section className="p-8 bg-orange-500/5 rounded-3xl border border-orange-500/10 space-y-4">
            <h3 className="text-orange-400 font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert size={18} /> 04. Bare Metal Protocol (Copper & Aluminum)
            </h3>
            <div className="text-[11px] text-gray-400 space-y-3 leading-relaxed">
              <p>Diode lasers cannot engrave bare, reflective metals directly. To mark copper or aluminum:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li><span className="text-white font-bold">Surface Preparation:</span> Coat the surface with <span className="text-emerald-400 font-black italic underline">Laser Marking Spray</span> or a <span className="text-emerald-400 font-black italic underline">Black Permanent Marker</span>.</li>
                <li><span className="text-white font-bold">Bonding:</span> The laser bonds the pigment to the metal. After the job, clean the excess with 99% Isopropyl Alcohol.</li>
                <li><span className="text-white font-bold">Reflection Risk:</span> Failure to coat bare metal can reflect the beam back into the laser diode, causing permanent hardware damage.</li>
              </ul>
            </div>
          </section>
        </div>

        <footer className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-500">
            <Info size={14} className="text-emerald-500/50" />
            <span className="text-[10px]">
              LaserTrace Pro © 2026 Shane Foster
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => { onClose(); window.setTimeout(() => (window as any).showGlossary?.(), 100); }} className="px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[11px] rounded-2xl transition-all">
              View Glossary
            </button>
            <button onClick={onClose} className="px-10 py-4 bg-emerald-500 text-black font-black uppercase text-[11px] rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95">
              Close Manual
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}