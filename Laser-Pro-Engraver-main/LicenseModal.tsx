import React, { useState, useEffect } from 'react';
<parameter name="X, Key, Check, AlertCircle, Shield, Zap, Lock } from 'lucide-react';
import { LicenseManager, LicenseInfo, FEATURES } from './utils/licensing';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLicenseActivated?: (license: LicenseInfo) => void;
}

export default function LicenseModal({ isOpen, onClose, onLicenseActivated }: LicenseModalProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [currentLicense, setCurrentLicense] = useState<LicenseInfo | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadLicenseInfo();
    }
  }, [isOpen]);

  const loadLicenseInfo = async () => {
    try {
      const [license, hwId] = await Promise.all([
        LicenseManager.getLicenseInfo(),
        LicenseManager.getHardwareId()
      ]);
      setCurrentLicense(license);
      setHardwareId(hwId);
    } catch (err) {
      console.error('Failed to load license info:', err);
    }
  };

  const handleActivate = async () => {
    setError('');
    setSuccess('');
    
    const trimmedKey = licenseKey.trim().toUpperCase();
    
    if (!LicenseManager.validateKeyFormat(trimmedKey)) {
      setError('Invalid license key format. Use: XXXXX-XXXXX-XXXXX-XXXXX');
      return;
    }
    
    setIsActivating(true);
    
    try {
      const license = await LicenseManager.activateLicense(trimmedKey);
      setCurrentLicense(license);
      setSuccess('License activated successfully!');
      setLicenseKey('');
      
      if (onLicenseActivated) {
        onLicenseActivated(license);
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to activate license');
    } finally {
      setIsActivating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate your license? You will lose access to premium features.')) {
      return;
    }
    
    try {
      await LicenseManager.deactivateLicense();
      await loadLicenseInfo();
      setSuccess('License deactivated successfully');
    } catch (err) {
      setError('Failed to deactivate license');
    }
  };

  const formatKey = (value: string) => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const clean = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Split into groups of 5
    const groups = [];
    for (let i = 0; i < clean.length && i < 20; i += 5) {
      groups.push(clean.substring(i, i + 5));
    }
    
    return groups.join('-');
  };

  const handleKeyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKey(e.target.value);
    setLicenseKey(formatted);
  };

  if (!isOpen) return null;

  const isPremium = currentLicense?.tier === 'Premium' && currentLicense?.activated;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0d1218] border border-white/10 w-full max-w-3xl rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <Key className="text-emerald-500" size={24} />
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">License Management</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                {isPremium ? 'Premium Active' : 'Free Version'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Current Status */}
          <div className={`p-6 rounded-2xl border ${isPremium ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                  {isPremium ? 'Premium License' : 'Free Version'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {isPremium ? 'All features unlocked' : 'Limited features available'}
                </p>
              </div>
              <div className={`p-2 rounded-xl ${isPremium ? 'bg-emerald-500/20' : 'bg-gray-500/20'}`}>
                {isPremium ? <Check className="text-emerald-500" size={20} /> : <Lock className="text-gray-500" size={20} />}
              </div>
            </div>
            
            {currentLicense && (
              <div className="space-y-2 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Hardware ID:</span>
                  <span className="font-mono text-gray-300">{hardwareId.substring(0, 16)}...</span>
                </div>
                {isPremium && currentLicense.activation_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Activated:</span>
                    <span className="text-gray-300">{new Date(currentLicense.activation_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Feature Comparison */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-500/5 rounded-2xl border border-gray-500/10">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-3">Free Features</h4>
              <ul className="space-y-2 text-[11px] text-gray-500">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-500 rounded-full" />
                  Basic image loading
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-500 rounded-full" />
                  Grayscale & threshold
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-500 rounded-full" />
                  Basic G-code export
                </li>
              </ul>
            </div>
            
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
                <Zap size={12} />
                Premium Features
              </h4>
              <ul className="space-y-2 text-[11px] text-emerald-300/80">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  7 professional filters
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  5 dithering algorithms
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  40+ filter presets
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  Material library (50+)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  Project save/load
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                  Serial port control
                </li>
              </ul>
            </div>
          </div>

          {/* Activation Form */}
          {!isPremium && (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider">Activate License</h4>
              
              <div className="space-y-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-wider">License Key</label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={handleKeyInput}
                  placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
                  maxLength={23}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <Check size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-400">{success}</p>
                </div>
              )}

              <button
                onClick={handleActivate}
                disabled={isActivating || licenseKey.length < 23}
                className="w-full px-6 py-3 bg-emerald-500 text-black font-black uppercase text-[11px] rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isActivating ? 'Activating...' : 'Activate License'}
              </button>

              <p className="text-[10px] text-gray-500 text-center">
                Don't have a license? <a href="#" className="text-emerald-500 hover:underline">Purchase Now</a>
              </p>
            </div>
          )}

          {/* Deactivation */}
          {isPremium && (
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="text-gray-500" size={20} />
                <div className="flex-1">
                  <h4 className="text-sm font-black uppercase tracking-wider mb-1">License Deactivation</h4>
                  <p className="text-[11px] text-gray-400 mb-3">
                    Deactivate this license to transfer it to another device. You will lose access to premium features on this device.
                  </p>
                  <button
                    onClick={handleDeactivate}
                    className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase text-[10px] rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    Deactivate License
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-white/5 bg-black/40 flex justify-between items-center">
          <p className="text-[10px] text-gray-500">
            © 2026 Shane Foster
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white/10 text-white font-black uppercase text-[11px] rounded-xl hover:bg-white/15 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
