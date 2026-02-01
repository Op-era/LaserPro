import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onChangeCommitted?: (value: number) => void;  // Called after drag ends
  label?: string;
  unit?: string;
  disabled?: boolean;
  className?: string;
  debounce?: number;  // Delay before onChange is called (ms)
}

export default function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  onChangeCommitted,
  label,
  unit = '',
  disabled = false,
  className = '',
  debounce = 0
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local value when prop changes (from external source)
  useEffect(() => {
    if (!isDragging) {
      setLocalValue(value);
    }
  }, [value, isDragging]);

  const clampValue = useCallback((val: number) => {
    const clamped = Math.max(min, Math.min(max, val));
    const stepped = Math.round(clamped / step) * step;
    return stepped;
  }, [min, max, step]);

  const notifyChange = useCallback((newValue: number) => {
    if (debounce > 0) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onChange(newValue);
      }, debounce);
    } else {
      onChange(newValue);
    }
  }, [onChange, debounce]);

  const updateValue = useCallback((clientX: number) => {
    if (!sliderRef.current || disabled) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newValue = min + percent * (max - min);
    const clampedValue = clampValue(newValue);
    
    if (clampedValue !== localValue) {
      setLocalValue(clampedValue);
      notifyChange(clampedValue);
    }
  }, [min, max, localValue, clampValue, notifyChange, disabled]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
    updateValue(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updateValue(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Notify of final value when drag ends
      if (onChangeCommitted && localValue !== value) {
        onChangeCommitted(localValue);
      }
      // Ensure final value is committed
      onChange(localValue);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, updateValue, localValue, value, onChange, onChangeCommitted]);

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-[10px] font-black uppercase">
          <span className="text-gray-400">{label}</span>
          <span className="text-emerald-500">{value}{unit}</span>
        </div>
      )}
      <div
        ref={sliderRef}
        className={`relative h-2 rounded-full cursor-pointer ${
          disabled ? 'bg-gray-800 opacity-50' : 'bg-white/10'
        }`}
        onMouseDown={handleMouseDown}
      >
        {/* Progress bar */}
        <div
          className={`absolute h-full rounded-full transition-all ${
            disabled ? 'bg-gray-600' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all ${
            disabled
              ? 'bg-gray-600 border-gray-700'
              : isDragging
              ? 'bg-emerald-400 border-emerald-300 scale-125 shadow-[0_0_20px_rgba(16,185,129,0.6)]'
              : 'bg-emerald-500 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
          }`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
