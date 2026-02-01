import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, Zap, Image, Layers, Settings, Play, BookOpen } from 'lucide-react';

interface TutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  details: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to LaserTrace Pro",
    description: "Learn the basics of laser engraving in just a few minutes",
    icon: <Zap size={32} className="text-emerald-500" />,
    details: [
      "LaserTrace Pro is a professional laser engraving application",
      "Control your diode laser with advanced image processing",
      "This tutorial will guide you through the essential features",
      "You can skip this tutorial at any time or re-enable it in settings"
    ]
  },
  {
    title: "Loading and Positioning Images",
    description: "Import and position your artwork on the work area",
    icon: <Image size={32} className="text-blue-500" />,
    details: [
      "Click the 'Add Layer' button to import an image",
      "Drag and resize the image on the canvas to position it",
      "Use the layer controls to adjust opacity and visibility",
      "High-contrast images work best for laser engraving"
    ]
  },
  {
    title: "Working with Layers",
    description: "Organize your design with multiple layers",
    icon: <Layers size={32} className="text-purple-500" />,
    details: [
      "Each layer can have different power and speed settings",
      "Use layers to separate different parts of your design",
      "Layers execute in order based on their priority setting",
      "Lock layers to prevent accidental modifications"
    ]
  },
  {
    title: "Adjusting Settings",
    description: "Configure power, speed, and image processing",
    icon: <Settings size={32} className="text-orange-500" />,
    details: [
      "Adjust contrast and gamma for optimal engraving results",
      "Set laser power (lower for light marks, higher for deep cuts)",
      "Configure feed rate (speed) - slower for deeper marks",
      "Use material presets for common materials like wood and acrylic"
    ]
  },
  {
    title: "Generating Paths",
    description: "Convert your image to laser toolpaths",
    icon: <Zap size={32} className="text-yellow-500" />,
    details: [
      "Click 'Generate Paths' to create the laser toolpath",
      "The software converts your image to G-code commands",
      "Preview the paths before engraving to verify positioning",
      "Adjust settings and regenerate if needed"
    ]
  },
  {
    title: "Connecting and Engraving",
    description: "Connect to your laser and start engraving",
    icon: <Play size={32} className="text-emerald-500" />,
    details: [
      "Click 'CONNECT' in the top bar to connect to your laser",
      "Select your laser's USB serial port from the list",
      "Always wear safety goggles before operating the laser",
      "Click 'Execute Burn Sequence' to start the engraving job"
    ]
  }
];

export default function Tutorial({ isOpen, onClose, onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  const step = tutorialSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#0d1218] border border-white/10 w-full max-w-3xl rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-white/5 flex items-center justify-between bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <BookOpen className="text-emerald-500" size={24} />
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Interactive Tutorial</h2>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Step {currentStep + 1} of {tutorialSteps.length}
              </p>
            </div>
          </div>
          <button 
            onClick={handleSkip} 
            className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors"
          >
            Skip Tutorial
          </button>
        </header>

        {/* Progress Bar */}
        <div className="h-2 bg-black/40">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-black/40 rounded-2xl">
              {step.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-gray-400 font-medium">
                {step.description}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {step.details.map((detail, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-300 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed rounded-xl text-[11px] font-black uppercase tracking-widest transition-all"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className="flex gap-2">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'bg-emerald-500 w-8' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
          >
            {currentStep < tutorialSteps.length - 1 ? 'Next' : 'Complete'}
            <ChevronRight size={16} />
          </button>
        </footer>
      </div>
    </div>
  );
}
