import React, { useState, useEffect, useRef } from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, Bold, Italic } from 'lucide-react';
import { Layer } from '../types';

interface TextEditorProps {
  layer: Layer;
  onUpdate: (updates: Partial<Layer>) => void;
  onClose: () => void;
}

export default function TextEditor({ layer, onUpdate, onClose }: TextEditorProps) {
  const [text, setText] = useState(layer.text || '');
  const [fontSize, setFontSize] = useState(layer.fontSize || 32);
  const [fontFamily, setFontFamily] = useState(layer.fontFamily || 'Impact');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus the textarea when component mounts
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);

  const handleTextChange = (newText: string) => {
    setText(newText);
    onUpdate({ text: newText });
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    onUpdate({ fontSize: newSize });
  };

  const handleFontFamilyChange = (newFont: string) => {
    setFontFamily(newFont);
    onUpdate({ fontFamily: newFont });
  };

  const fonts = [
    'Impact', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
    'Georgia', 'Verdana', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black',
    'Palatino', 'Garamond', 'Bookman', 'Tahoma'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0f1419] border border-emerald-500/20 rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <Type size={20} />
            <h2 className="text-lg font-semibold">Text Editor</h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-all"
          >
            Done
          </button>
        </div>

        {/* Text Input */}
        <div className="mb-4">
          <label className="block text-gray-400 text-sm mb-2">Text Content</label>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white font-mono resize-none focus:outline-none focus:border-emerald-500/50 transition-all"
            rows={5}
            placeholder="Enter your text here..."
          />
        </div>

        {/* Font Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Font Family</label>
            <select
              value={fontFamily}
              onChange={(e) => handleFontFamilyChange(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
            >
              {fonts.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-2">Font Size</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                min={8}
                max={200}
                className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
              />
              <input
                type="range"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                min={8}
                max={200}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-black/30 border border-white/10 rounded-lg p-6 min-h-[100px] flex items-center justify-center">
          <p
            style={{
              fontFamily: fontFamily,
              fontSize: `${fontSize}px`,
              color: 'white',
              textAlign: 'center',
              wordBreak: 'break-word'
            }}
          >
            {text || 'Preview appears here...'}
          </p>
        </div>

        {/* Quick Info */}
        <div className="mt-4 text-xs text-gray-500">
          <p>Tip: Press Ctrl/Cmd + Enter to close editor</p>
        </div>
      </div>
    </div>
  );
}
