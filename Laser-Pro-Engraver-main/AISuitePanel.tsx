/**
 * AI Suite Panel - Phase 3 UI Component
 * Interface for AI-powered design and optimization features
 */

import React, { useState } from 'react';
import { Sparkles, Brain, Zap, TrendingUp } from 'lucide-react';
import {
  generateAIDesign,
  runPredictiveSimulation,
  autoOptimizeJob,
  materialScanToSettings,
  AIDesignPrompt,
  AIDesignResult,
} from './utils/aiSuite';

interface AISuitePanelProps {
  onAIDesignGenerated?: (result: AIDesignResult) => void;
  currentPaths?: Array<{ x: number; y: number }[]>;
  currentMaterial?: string;
  currentSettings?: { power: number; speed: number };
}

export const AISuitePanel: React.FC<AISuitePanelProps> = ({
  onAIDesignGenerated,
  currentPaths = [],
  currentMaterial = 'wood',
  currentSettings = { power: 80, speed: 1000 },
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'simulate' | 'optimize' | 'scan'>('generate');
  const [designPrompt, setDesignPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  const handleGenerateDesign = async () => {
    if (!designPrompt.trim()) return;
    
    setIsProcessing(true);
    try {
      const prompt: AIDesignPrompt = {
        description: designPrompt,
        style: 'vector',
        complexity: 'medium',
        material: currentMaterial,
      };
      
      const result = await generateAIDesign(prompt);
      
      if (onAIDesignGenerated) {
        onAIDesignGenerated(result);
      }
      
      alert('AI design generated successfully!');
    } catch (error) {
      console.error('AI generation error:', error);
      alert('Failed to generate design. This feature requires AI service connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRunSimulation = () => {
    if (currentPaths.length === 0) {
      alert('No paths to simulate. Load an image or design first.');
      return;
    }
    
    const result = runPredictiveSimulation(
      currentMaterial,
      currentSettings.power,
      currentSettings.speed,
      currentPaths
    );
    
    setSimulationResult(result);
  };

  const handleOptimize = () => {
    if (currentPaths.length === 0) {
      alert('No paths to optimize. Load an image or design first.');
      return;
    }
    
    const result = autoOptimizeJob(currentPaths, currentMaterial, currentSettings);
    setOptimizationResult(result);
    
    if (result.timeSaved > 0) {
      alert(`Optimization complete! Estimated time savings: ${Math.round(result.timeSaved)}s`);
    }
  };

  const handleMaterialScan = () => {
    const settings = materialScanToSettings(currentMaterial, 3);
    alert(`Recommended settings for ${currentMaterial}:\nPower: ${settings.power}%\nSpeed: ${settings.speed}mm/min\nPasses: ${settings.passes}`);
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '16px',
      color: '#fff',
      maxWidth: '400px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        fontSize: '18px',
        fontWeight: 'bold',
      }}>
        <Sparkles size={24} color="#10b981" />
        <span>AI Suite</span>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        borderBottom: '1px solid #333',
        paddingBottom: '8px',
      }}>
        <button
          onClick={() => setActiveTab('generate')}
          style={{
            padding: '6px 12px',
            backgroundColor: activeTab === 'generate' ? '#10b981' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Generate
        </button>
        <button
          onClick={() => setActiveTab('simulate')}
          style={{
            padding: '6px 12px',
            backgroundColor: activeTab === 'simulate' ? '#10b981' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Simulate
        </button>
        <button
          onClick={() => setActiveTab('optimize')}
          style={{
            padding: '6px 12px',
            backgroundColor: activeTab === 'optimize' ? '#10b981' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Optimize
        </button>
        <button
          onClick={() => setActiveTab('scan')}
          style={{
            padding: '6px 12px',
            backgroundColor: activeTab === 'scan' ? '#10b981' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Scan
        </button>
      </div>

      {/* Generate Tab */}
      {activeTab === 'generate' && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
              Design Prompt
            </label>
            <textarea
              value={designPrompt}
              onChange={(e) => setDesignPrompt(e.target.value)}
              placeholder="Describe your design... (e.g., 'Celtic knot pattern', 'Mountain landscape silhouette')"
              style={{
                width: '100%',
                minHeight: '80px',
                backgroundColor: '#0d1218',
                border: '1px solid #333',
                borderRadius: '4px',
                padding: '8px',
                color: '#fff',
                fontSize: '12px',
                resize: 'vertical',
              }}
            />
          </div>
          <button
            onClick={handleGenerateDesign}
            disabled={isProcessing || !designPrompt.trim()}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: isProcessing ? '#555' : '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Brain size={18} />
            {isProcessing ? 'Generating...' : 'Generate AI Design'}
          </button>
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
            Note: AI generation requires cloud service connection
          </div>
        </div>
      )}

      {/* Simulate Tab */}
      {activeTab === 'simulate' && (
        <div>
          <button
            onClick={handleRunSimulation}
            disabled={currentPaths.length === 0}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: currentPaths.length === 0 ? '#555' : '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: currentPaths.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <Zap size={18} />
            Run Predictive Simulation
          </button>

          {simulationResult && (
            <div style={{
              backgroundColor: '#0d1218',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '12px',
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#10b981' }}>
                Simulation Results
              </div>
              <div style={{ marginBottom: '4px' }}>
                Heat Distortion: {(simulationResult.heatDistortion * 100).toFixed(1)}%
              </div>
              <div style={{ marginBottom: '4px' }}>
                Cut Quality: {simulationResult.cutQuality.toFixed(1)}%
              </div>
              <div style={{ marginBottom: '4px' }}>
                Burn Time: {simulationResult.burnTime.toFixed(1)}s
              </div>
              {simulationResult.warnings.length > 0 && (
                <div style={{ marginTop: '8px', color: '#f59e0b' }}>
                  <strong>Warnings:</strong>
                  <ul style={{ marginLeft: '16px', marginTop: '4px' }}>
                    {simulationResult.warnings.map((warning: string, index: number) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Optimize Tab */}
      {activeTab === 'optimize' && (
        <div>
          <button
            onClick={handleOptimize}
            disabled={currentPaths.length === 0}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: currentPaths.length === 0 ? '#555' : '#8b5cf6',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: currentPaths.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            <TrendingUp size={18} />
            Auto-Optimize Job
          </button>

          {optimizationResult && (
            <div style={{
              backgroundColor: '#0d1218',
              border: '1px solid #333',
              borderRadius: '4px',
              padding: '12px',
              fontSize: '12px',
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#8b5cf6' }}>
                Optimization Results
              </div>
              <div style={{ marginBottom: '4px' }}>
                Time Saved: {Math.round(optimizationResult.timeSaved)}s
              </div>
              <div style={{ marginBottom: '4px' }}>
                Energy Saved: {optimizationResult.energySaved.toFixed(2)} kWh
              </div>
              {optimizationResult.recommendations.length > 0 && (
                <div style={{ marginTop: '8px', color: '#10b981' }}>
                  <strong>Recommendations:</strong>
                  <ul style={{ marginLeft: '16px', marginTop: '4px' }}>
                    {optimizationResult.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scan Tab */}
      {activeTab === 'scan' && (
        <div>
          <div style={{ marginBottom: '12px', fontSize: '12px', color: '#aaa' }}>
            Current Material: <strong style={{ color: '#fff' }}>{currentMaterial}</strong>
          </div>
          <button
            onClick={handleMaterialScan}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#f59e0b',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <Brain size={18} />
            Suggest Settings from Material
          </button>
          <div style={{ marginTop: '12px', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
            AI analyzes material properties to suggest optimal laser settings
          </div>
        </div>
      )}
    </div>
  );
};
