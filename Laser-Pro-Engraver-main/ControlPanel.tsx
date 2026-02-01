import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Zap, ShoppingBag, Camera, Wind, MousePointer2, Settings, Home, Activity, Target, ChevronRight, ChevronLeft, Check, X, Power, Terminal, HelpCircle
} from 'lucide-react';
import { EngraverSettings } from './types';
import { registry } from './utils/registry';
import { getRedirectUrl } from './gearAds';

interface ControlPanelProps {
  settings: EngraverSettings;
  setSettings: (s: Partial<EngraverSettings>) => void;
  sendGCode: (cmd: string) => Promise<void>;
  pulseLaser: (on: boolean) => void;
  connected: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraActive: boolean;
  setCameraActive: (a: boolean) => void;
  triggerConnectPrompt: (action: string) => void;
}

const Joystick = ({ onMove, triggerConnectPrompt, connected }: { onMove: (x: number, y: number) => void, triggerConnectPrompt: (a: string) => void, connected: boolean }) => {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!connected) { triggerConnectPrompt('using the joystick'); return; }
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) { setOffset({ x: 0, y: 0 }); return; }
    const move = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = rect.width / 2;
      const limitedX = distance > maxRadius ? (dx / distance) * maxRadius : dx;
      const limitedY = distance > maxRadius ? (dy / distance) * maxRadius : dy;
      setOffset({ x: limitedX, y: limitedY });
      onMove(limitedX / maxRadius, limitedY / maxRadius);
    };
    const stop = () => setDragging(false);
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', move); window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', move); window.removeEventListener('touchend', stop);
    };
  }, [dragging, onMove]);

  return (
    <div ref={containerRef} onMouseDown={handleStart} onTouchStart={handleStart} className={`relative w-40 h-40 rounded-full border-4 border-white/5 bg-black/40 shadow-inner flex items-center justify-center mx-auto cursor-grab active:cursor-grabbing transition-opacity ${!connected ? 'opacity-20' : 'opacity-100'}`}>
      <div className="w-16 h-16 rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-transform duration-75" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
         <Activity size={100} />
      </div>
      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[6px] font-black text-white uppercase opacity-30">Y+</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[6px] font-black text-white uppercase opacity-30">Y-</div>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[6px] font-black text-white uppercase opacity-30">X-</div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[6px] font-black text-white uppercase opacity-30">X+</div>
    </div>
  );
};

export default function ControlPanel({ 
  settings, setSettings, sendGCode, pulseLaser, connected, videoRef, cameraActive, setCameraActive, triggerConnectPrompt 
}: ControlPanelProps) {
  const [laserOn, setLaserOn] = useState(false);
  const [airAssistOn, setAirAssistOn] = useState(false);
  const [wizardStep, setWizardStep] = useState<null | 'center' | 'top' | 'bottom' | 'left' | 'right'>(null);
  const [tempBounds, setTempBounds] = useState({ centerX: 0, centerY: 0, minX: 0, maxX: 140, minY: 0, maxY: 140 });

  const currentBrand = useMemo(() => {
    return registry.getMachines(true).find(p => p.name === settings.machineModel)?.brand || 'Generic';
  }, [settings.machineModel]);

  const toggleAirAssist = () => {
    if (!settings.ownedAirAssist) {
      window.open(getRedirectUrl('air-assist', currentBrand), '_blank');
      return;
    }
    if (!connected) { triggerConnectPrompt('controlling the air assist'); return; }
    if (airAssistOn) { sendGCode('M9'); setAirAssistOn(false); } 
    else { sendGCode('M8'); setAirAssistOn(true); }
  };

  const forceFireLaser = async (on: boolean) => {
    if (!connected) { triggerConnectPrompt('firing the laser'); return; }
    if (on) {
      // Use configured test fire power
      const power = Math.max(10, Math.min(100, settings.testFirePower));
      if (settings.laserType === 'diode') {
        // Temporarily disable laser mode for test firing
        await sendGCode("$32=0");
      }
      // Fire at test power level
      await sendGCode(`M3 S${power}`);
      setLaserOn(true);
      // Also trigger the callback if provided
      pulseLaser(true);
    } else {
      await sendGCode("M5");
      if (settings.laserType === 'diode') {
        // Re-enable laser mode
        await sendGCode("$32=1");
      }
      setLaserOn(false);
      pulseLaser(false);
    }
  };

  const capturePoint = () => {
    const { x, y } = settings.machinePosition;
    if (wizardStep === 'center') {
      setTempBounds(prev => ({ ...prev, centerX: x, centerY: y }));
      setWizardStep('top');
    } else if (wizardStep === 'top') {
      setTempBounds(prev => ({ ...prev, maxY: y }));
      setWizardStep('bottom');
    } else if (wizardStep === 'bottom') {
      setTempBounds(prev => ({ ...prev, minY: y }));
      setWizardStep('left');
    } else if (wizardStep === 'left') {
      setTempBounds(prev => ({ ...prev, minX: x }));
      setWizardStep('right');
    } else if (wizardStep === 'right') {
      const finalBounds = { ...tempBounds, maxX: x, active: true };
      setSettings({ customBounds: finalBounds });
      setWizardStep(null);
    }
  };

  return (
    <aside className="w-80 bg-[#0d1218] border border-white/5 rounded-3xl p-5 flex flex-col gap-6 shadow-2xl shrink-0 overflow-y-auto custom-scroll">
       
       {wizardStep && (
         <section className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Obj Mapping Wizard</span>
              <button onClick={() => setWizardStep(null)} className="text-gray-500 hover:text-red-500"><X size={14}/></button>
            </div>
            <p className="text-[9px] text-gray-400 text-center uppercase font-bold tracking-widest italic leading-tight">Use joystick to move laser to the <span className="text-emerald-400 font-black">{wizardStep}</span> of your material.</p>
            <button onClick={capturePoint} className="w-full py-3 bg-emerald-500 text-black rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-emerald-400 transition-colors shadow-lg">
               <Target size={14}/> Capture {wizardStep}
            </button>
         </section>
       )}

       <section className="space-y-4">
          <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">
            <span>Manual Gantry Jog</span>
            <div className="group relative">
              <HelpCircle size={14} className="text-gray-600 hover:text-emerald-500 cursor-help" />
              <div className="absolute bottom-full right-0 mb-2 w-48 p-3 bg-black/90 border border-white/10 rounded-xl text-[9px] text-gray-400 invisible group-hover:visible z-50 shadow-2xl backdrop-blur-md uppercase tracking-tight font-bold">
                Joystick moves the laser head. Sensitivity controls how far it moves per pulse. 2mm safety cushion is enforced.
              </div>
            </div>
          </div>
          <Joystick 
            connected={connected}
            triggerConnectPrompt={triggerConnectPrompt}
            onMove={(x, y) => {
              const sensitivity = settings.joystickSensitivity || 5;
              
              // Handle Axis Inversions
              // Joystick RIGHT (+x) should move laser head RIGHT (X+)
              const xFactor = settings.mirrorX ? -1 : 1;
              // Allow user to configure Y-axis inversion
              const yFactor = settings.joystickInvertY ? 1 : -1;  // User configurable

              const deltaX = x * sensitivity * xFactor;
              const deltaY = y * sensitivity * yFactor;
              const nextY = Math.max(minY, Math.min(maxY, settings.machinePosition.y + deltaY));
              
              // Update machine position state
              setSettings({ machinePosition: { x: nextX, y: nextY } });
              
              if (Math.abs(x) > 0.1 || Math.abs(y) > 0.1) {
                sendGCode(`G0 X${nextX.toFixed(2)} Y${nextY.toFixed(2)} F${settings.travelSpeed}`);
              }
            }} 
          />
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => {
              if (!connected) { triggerConnectPrompt('homing the machine'); return; }
              sendGCode('$H');
              // Set home position after homing completes
              setTimeout(() => {
                setSettings({ 
                  homePosition: { x: 0, y: 0 },  // Homing sets (0,0) as minimum boundary
                  machinePosition: { x: 0, y: 0 },  // Update position to home
                  isHomed: true  // Mark as homed
                });
              }, 2000);  // Wait for homing cycle to complete
            }} className="py-4 bg-emerald-500/5 border border-white/5 text-gray-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-emerald-500/30 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
              <Home size={14}/> {settings.isHomed ? '✓ Homed' : 'Home ($H)'}
            </button>
            <button onClick={() => setWizardStep('center')} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${settings.customBounds.active ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-inner' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-black'}`}>
              <Target size={14}/> {settings.customBounds.active ? 'Re-Map Bed' : 'Map Bed HUD'}
            </button>
          </div>
       </section>

       <div className="h-px bg-white/5 mx-2" />

       <section className="space-y-4">
          <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-4 shadow-inner">
            <div className="flex justify-between items-center text-[10px] font-black uppercase text-gray-500">
              <div className="flex items-center gap-1">
                <span>Beam Test</span>
                <div className="group relative">
                  <HelpCircle size={10} className="text-gray-600 hover:text-emerald-500" />
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-3 bg-black/90 border border-white/10 rounded-xl text-[9px] text-gray-400 invisible group-hover:visible z-50 shadow-2xl backdrop-blur-md">
                    Sets laser power for focusing. Diode lasers often won't fire below 10-15%.
                  </div>
                </div>
              </div>
              <span className="text-emerald-500 font-mono">{settings.testFirePower} / 1000</span>
            </div>
            <input type="range" min="0" max="1000" value={settings.testFirePower} onChange={(e) => setSettings({testFirePower: parseInt(e.target.value)})} className="w-full h-1.5 accent-emerald-500 bg-black rounded-full cursor-pointer" />
            <div className="grid grid-cols-2 gap-2">
              <button onMouseDown={() => forceFireLaser(true)} onMouseUp={() => forceFireLaser(false)} onMouseLeave={() => forceFireLaser(false)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${laserOn ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black'}`}>
                <Power size={12}/> {laserOn ? 'FIRING' : 'FIRE PULSE'}
              </button>
              <button onClick={toggleAirAssist} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${airAssistOn ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black'}`}>
                <Wind size={12} /> {airAssistOn ? 'AIR ACTIVE' : 'AIR ASSIST'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <button onClick={() => sendGCode('$X')} className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase text-gray-500 hover:text-orange-500 hover:border-orange-500/50 transition-all">Unlock ($X)</button>
             <button onClick={() => sendGCode('G92 X0 Y0')} className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase text-gray-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">Set Zero</button>
          </div>
       </section>

       <div className="h-px bg-white/5 mx-2" />

       <section className="space-y-3">
          <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2"><Terminal size={14}/> Direct G-Code</h3>
          <input 
            type="text" 
            placeholder="Type command..." 
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendGCode((e.target as HTMLInputElement).value.toUpperCase());
                (e.target as HTMLInputElement).value = '';
              }
            }}
            className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-[10px] font-mono text-emerald-400 outline-none focus:border-emerald-500/30 transition-all"
          />
       </section>
    </aside>
  );
}
