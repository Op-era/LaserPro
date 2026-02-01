
import React, { useState, useRef } from 'react';
import { ShieldAlert, Cpu, CheckCircle, Scale, Zap, AlertTriangle, Eye, Wind, Flame, Settings2, MoveUp, MoveDown, MoveLeft, MoveRight, Power, Crosshair, Terminal } from 'lucide-react';
import { EngraverSettings, MachineProfile, LaserSourceType, LaserMode } from './types';
import { registry } from './utils/registry';

interface SetupWizardProps {
  onComplete: (settings: Partial<EngraverSettings>) => void;
}

export default function SetupWizard({ onComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedMachine, setSelectedMachine] = useState<MachineProfile | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  // Fix: Align customSettings with EngraverSettings property names
  const [customSettings, setCustomSettings] = useState<Partial<EngraverSettings>>({
    machineModel: 'Unlisted Laser',
    bedWidth: 400,
    bedHeight: 400,
    laserType: 'diode',
    laserMode: 'M4',
    travelSpeed: 4000,
    feedRate: 2000,
    laserPower: 1000
  });

  const [safetyChecks, setSafetyChecks] = useState({
    goggles: false,
    ventilation: false,
    fireExtinguisher: false,
    materials: false
  });
  const [legalAccepted, setLegalAccepted] = useState(false);
  
  // Test State
  const [isConnected, setIsConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const portRef = useRef<TauriSerialController | null>(null);
  const writerRef = useRef<WritableStreamDefaultWriter | null>(null);

  const machines = registry.getMachines();

  // Fix: Separate logic for custom vs selected machine to resolve type errors and handle correct property mappings
  const handleFinish = () => {
    if ((!selectedMachine && !isCustom) || !legalAccepted) return;
    
    if (isCustom) {
      onComplete({
        machineModel: customSettings.machineModel,
        bedWidth: customSettings.bedWidth,
        bedHeight: customSettings.bedHeight,
        laserType: customSettings.laserType,
        laserMode: customSettings.laserMode,
        travelSpeed: customSettings.travelSpeed,
        feedRate: customSettings.feedRate,
        laserPower: customSettings.laserPower,
        workAreaWidth: customSettings.bedWidth,
        workAreaHeight: customSettings.bedHeight,
        isCustomMachine: true,
        customBounds: { 
          active: false, 
          centerX: (customSettings.bedWidth || 400) / 2, 
          centerY: (customSettings.bedHeight || 400) / 2, 
          minX: 0, maxX: customSettings.bedWidth || 400, 
          minY: 0, maxY: customSettings.bedHeight || 400 
        }
      });
    } else {
      const machine = selectedMachine!;
      onComplete({
        machineModel: machine.name,
        bedWidth: machine.width,
        bedHeight: machine.height,
        laserType: machine.type,
        workAreaWidth: machine.width,
        workAreaHeight: machine.height,
        isCustomMachine: false,
        customBounds: { 
          active: false, 
          centerX: machine.width / 2, 
          centerY: machine.height / 2, 
          minX: 0, maxX: machine.width, 
          minY: 0, maxY: machine.height 
        }
      });
    }
  };

  const connectSerial = async () => {
    try {
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      writerRef.current = port.writable.getWriter();
      setIsConnected(true);
      addToLog("Connected successfully.");
    } catch (err) {
      addToLog("Connection failed.");
    }
  };

  const sendCommand = async (cmd: string) => {
    if (!writerRef.current) return;
    try {
      await writerRef.current.write(new TextEncoder().encode(cmd + '\n'));
      addToLog(`TX: ${cmd}`);
    } catch (e) {
      addToLog("Write error.");
    }
  };

  const addToLog = (msg: string) => {
    setLog(prev => [...prev.slice(-9), `> ${msg}`]);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#05070a] flex items-center justify-center p-4 overflow-hidden font-sans">
      <div className="w-full max-w-2xl bg-[#0d1218] border border-white/5 rounded-[40px] shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* Progress Header */}
        <div className="p-6 flex items-center justify-center gap-4 shrink-0">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-16 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'w-8 bg-white/5'}`} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 custom-scroll min-h-0">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <Cpu className="mx-auto text-emerald-500 mb-4" size={48} />
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Select Your Hardware</h2>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Standard profiles or custom configuration</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {machines.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMachine(m); setIsCustom(false); }}
                    className={`text-left p-5 rounded-3xl border transition-all group ${(!isCustom && selectedMachine?.id === m.id) ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={`text-[10px] font-black uppercase ${(!isCustom && selectedMachine?.id === m.id) ? 'text-black/60' : 'text-gray-500'}`}>{m.brand}</p>
                        <h4 className="text-lg font-black uppercase tracking-tight">{m.name}</h4>
                      </div>
                      <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${(!isCustom && selectedMachine?.id === m.id) ? 'bg-black/20' : 'bg-black/40 border border-white/5'}`}>
                        {m.width}x{m.height}mm
                      </div>
                    </div>
                  </button>
                ))}
                
                <button
                  onClick={() => { setIsCustom(true); setSelectedMachine(null); }}
                  className={`text-left p-5 rounded-3xl border transition-all group border-dashed ${isCustom ? 'bg-orange-500 border-orange-400 text-black' : 'bg-orange-500/5 border-orange-500/30 text-orange-500 hover:bg-orange-500/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <Settings2 size={24} />
                    <div>
                      <h4 className="text-lg font-black uppercase tracking-tight">Manual / Custom Setup</h4>
                      <p className="text-[10px] uppercase font-bold opacity-60 italic">Define your own G-Code parameters (At Your Own Risk)</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && isCustom && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center space-y-2">
                <Settings2 className="mx-auto text-orange-500 mb-4" size={48} />
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-orange-500">Technical Parameters</h2>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Manual override of GRBL physics</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Bed Width (X)</label>
                  {/* Fix: Update property names to match EngraverSettings */}
                  <input type="number" value={customSettings.bedWidth} onChange={e => setCustomSettings({...customSettings, bedWidth: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Bed Height (Y)</label>
                  {/* Fix: Update property names to match EngraverSettings */}
                  <input type="number" value={customSettings.bedHeight} onChange={e => setCustomSettings({...customSettings, bedHeight: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Max Travel Speed (mm/min)</label>
                  <input type="number" value={customSettings.travelSpeed} onChange={e => setCustomSettings({...customSettings, travelSpeed: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Max Power Value (S-Max)</label>
                  <input type="number" value={customSettings.laserPower} onChange={e => setCustomSettings({...customSettings, laserPower: parseInt(e.target.value)})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Laser Mode</label>
                  <select value={customSettings.laserMode} onChange={e => setCustomSettings({...customSettings, laserMode: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-orange-500 outline-none transition-all">
                    <option value="M4">M4 (Dynamic Power)</option>
                    <option value="M3">M3 (Constant Power)</option>
                  </select>
                </div>
                 <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-500 ml-2">Source Type</label>
                  {/* Fix: Update property names to match EngraverSettings */}
                  <select value={customSettings.laserType} onChange={e => setCustomSettings({...customSettings, laserType: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-orange-500 outline-none transition-all">
                    <option value="diode">Diode</option>
                    <option value="co2">CO2</option>
                    <option value="fiber">Fiber</option>
                  </select>
                </div>
              </div>

              {/* TEST CONSOLE */}
              <div className="bg-black/60 rounded-[32px] border border-orange-500/20 p-6 space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-2"><Terminal size={12}/> Live Test Console</span>
                    {!isConnected ? (
                      <button onClick={connectSerial} className="px-4 py-1.5 bg-orange-500 text-black rounded-full text-[9px] font-black uppercase hover:bg-orange-400 transition-all">Connect to Test</button>
                    ) : (
                      <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1"><CheckCircle size={10}/> Online</span>
                    )}
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <button onMouseDown={() => sendCommand('G91 G0 Y10 F1000')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400"><MoveUp size={18}/></button>
                       <div className="flex gap-2">
                          <button onMouseDown={() => sendCommand('G91 G0 X-10 F1000')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400"><MoveLeft size={18}/></button>
                          <button onClick={() => sendCommand('$H')} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-black transition-all"><Crosshair size={18}/></button>
                          <button onMouseDown={() => sendCommand('G91 G0 X10 F1000')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400"><MoveRight size={18}/></button>
                       </div>
                       <button onMouseDown={() => sendCommand('G91 G0 Y-10 F1000')} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400"><MoveDown size={18}/></button>
                    </div>

                    <div className="space-y-2">
                       <div className="h-28 bg-black/80 rounded-2xl border border-white/5 p-3 font-mono text-[9px] text-orange-500/80 overflow-y-auto custom-scroll">
                          {log.map((l, i) => <div key={i}>{l}</div>)}
                          {log.length === 0 && <div className="text-gray-700 italic">No activity logs...</div>}
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <button onMouseDown={() => sendCommand('M3 S10')} onMouseUp={() => sendCommand('M5')} className="py-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white"><Power size={12}/> Pulse</button>
                          <button onClick={() => sendCommand('$X')} className="py-3 bg-white/5 text-gray-400 border border-white/5 rounded-xl text-[9px] font-black uppercase hover:text-white">Unlock ($X)</button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {(step === 2 && !isCustom) || (step === 3) ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <ShieldAlert className="mx-auto text-orange-500 mb-4" size={48} />
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Safety Compliance</h2>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">A laser is a powerful thermal energy source</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: 'goggles', icon: <Eye size={18}/>, label: "I am wearing OD5+ certified laser safety goggles." },
                  { id: 'ventilation', icon: <Wind size={18}/>, label: "My work area has active ventilation to the outdoors." },
                  { id: 'fireExtinguisher', icon: <Flame size={18}/>, label: "I have a fire extinguisher or fire blanket within reach." },
                  { id: 'materials', icon: <AlertTriangle size={18}/>, label: "I have verified my materials do not contain PVC or Vinyl." }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-4 p-5 bg-black/40 rounded-3xl border border-white/5 cursor-pointer hover:border-orange-500/30 transition-all group">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded bg-black border-white/10 text-orange-500 focus:ring-orange-500/20"
                      checked={(safetyChecks as any)[item.id]}
                      onChange={(e) => setSafetyChecks({...safetyChecks, [item.id]: e.target.checked})}
                    />
                    <div className="text-orange-500/50 group-hover:text-orange-500 transition-colors">{item.icon}</div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tight">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          {((step === 3 && !isCustom) || (step === 4)) && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-2">
                <Scale className="mx-auto text-blue-500 mb-4" size={48} />
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">Legal Agreement</h2>
                <p className="text-sm text-gray-500 uppercase tracking-widest font-bold">Terms of Service & Non-Liability</p>
              </div>
              <div className="bg-black/60 p-6 rounded-3xl border border-white/5 h-64 overflow-y-auto text-[10px] text-gray-500 font-mono leading-relaxed custom-scroll">
                <p className="text-white font-bold mb-4 uppercase">1. DISCLAIMER OF LIABILITY</p>
                <p className="mb-4">THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE DEVELOPERS OR AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
                <p className="text-white font-bold mb-4 uppercase">2. USER RESPONSIBILITY</p>
                <p className="mb-4">THE USER ASSUMES ALL RESPONSIBILITY FOR THE OPERATION OF THE LASER HARDWARE. LASER ENGRAVING EQUIPMENT CAN CAUSE SEVERE EYE INJURY, PERMANENT BLINDNESS, SKIN BURNS, AND FIRE. IMPROPER USE CAN LEAD TO THE RELEASE OF TOXIC GASSES (INCLUDING CYANIDE AND CHLORINE) DEPENDING ON THE MATERIAL ENGRAVED.</p>
                <p className="text-white font-bold mb-4 uppercase">3. COMPLIANCE</p>
                <p className="mb-4">BY USING THIS SOFTWARE, YOU AGREE TO COMPLY WITH ALL LOCAL, STATE, AND NATIONAL SAFETY STANDARDS REGARDING LASER OPERATION. YOU AGREE TO INDEMNIFY AND HOLD HARMLESS THE SOFTWARE AUTHORS FROM ANY DAMAGES TO PROPERTY OR PERSONS RESULTING FROM THE OPERATION OF HARDWARE CONTROLLED BY THIS SOFTWARE.</p>
              </div>
              <label className="flex items-center gap-4 p-5 bg-blue-500/5 rounded-3xl border border-blue-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded bg-black border-blue-500/30 text-blue-500 focus:ring-blue-500/20"
                  checked={legalAccepted}
                  onChange={(e) => setLegalAccepted(e.target.checked)}
                />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">I HAVE READ AND ACCEPT THE LEGAL TERMS</span>
              </label>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 flex gap-4 shrink-0">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-400 transition-all">Back</button>
          )}
          
          <button
            disabled={
              (step === 1 && !selectedMachine && !isCustom) ||
              /* Fix: Update property names in disabled check */
              (step === 2 && isCustom && (!customSettings.bedWidth || !customSettings.bedHeight)) ||
              (((step === 2 && !isCustom) || (step === 3 && isCustom)) && !Object.values(safetyChecks).every(Boolean)) ||
              (((step === 3 && !isCustom) || (step === 4 && isCustom)) && !legalAccepted)
            }
            onClick={() => {
              const maxStep = isCustom ? 4 : 3;
              if (step < maxStep) setStep(step + 1);
              else handleFinish();
            }}
            className="flex-[2] py-4 bg-emerald-500 disabled:opacity-20 rounded-2xl text-[11px] font-black uppercase tracking-widest text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            { (step === (isCustom ? 4 : 3)) ? 'Initialize Workspace' : 'Continue' }
          </button>
        </div>
      </div>
    </div>
  );
}
