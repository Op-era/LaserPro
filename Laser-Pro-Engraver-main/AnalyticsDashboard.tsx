/**
 * Analytics Dashboard - Phase 3 UI Component
 * Real-time analytics and sustainability metrics
 */

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Leaf, DollarSign, Clock, Zap } from 'lucide-react';
import {
  generateEfficiencyMetrics,
  generateSustainabilityMetrics,
  generateTrendData,
  JobAnalytics,
  DashboardData,
} from './utils/analytics';

interface AnalyticsDashboardProps {
  jobs?: JobAnalytics[];
  refreshInterval?: number; // milliseconds
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  jobs = [],
  refreshInterval = 30000,
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'efficiency' | 'sustainability'>('overview');

  useEffect(() => {
    updateDashboard();
    
    const interval = setInterval(updateDashboard, refreshInterval);
    return () => clearInterval(interval);
  }, [jobs, refreshInterval]);

  const updateDashboard = () => {
    if (jobs.length === 0) return;
    
    const efficiency = generateEfficiencyMetrics(jobs);
    const sustainability = generateSustainabilityMetrics(jobs);
    const trends = generateTrendData(jobs, 7);
    
    setDashboardData({
      analytics: jobs,
      efficiency,
      sustainability,
      trends,
    });
  };

  if (!dashboardData) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '24px',
        color: '#fff',
        textAlign: 'center',
      }}>
        <BarChart3 size={48} color="#888" style={{ margin: '0 auto 16px' }} />
        <div style={{ color: '#888' }}>No analytics data available</div>
        <div style={{ color: '#666', fontSize: '12px', marginTop: '8px' }}>
          Complete some jobs to see analytics
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '20px',
      color: '#fff',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '20px',
          fontWeight: 'bold',
        }}>
          <BarChart3 size={24} color="#10b981" />
          <span>Analytics Dashboard</span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSelectedView('overview')}
            style={{
              padding: '6px 12px',
              backgroundColor: selectedView === 'overview' ? '#10b981' : 'transparent',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedView('efficiency')}
            style={{
              padding: '6px 12px',
              backgroundColor: selectedView === 'efficiency' ? '#10b981' : 'transparent',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Efficiency
          </button>
          <button
            onClick={() => setSelectedView('sustainability')}
            style={{
              padding: '6px 12px',
              backgroundColor: selectedView === 'sustainability' ? '#10b981' : 'transparent',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Sustainability
          </button>
        </div>
      </div>

      {/* Overview */}
      {selectedView === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <MetricCard
            icon={<BarChart3 size={20} />}
            label="Total Jobs"
            value={dashboardData.efficiency.totalJobs}
            color="#3b82f6"
          />
          <MetricCard
            icon={<TrendingUp size={20} />}
            label="Success Rate"
            value={`${dashboardData.efficiency.successRate.toFixed(1)}%`}
            color="#10b981"
          />
          <MetricCard
            icon={<Clock size={20} />}
            label="Avg Duration"
            value={`${Math.round(dashboardData.efficiency.avgJobDuration)}s`}
            color="#f59e0b"
          />
          <MetricCard
            icon={<Zap size={20} />}
            label="Total Energy"
            value={`${dashboardData.efficiency.totalEnergyUsed.toFixed(2)} kWh`}
            color="#8b5cf6"
          />
          <MetricCard
            icon={<DollarSign size={20} />}
            label="Total Cost"
            value={`$${dashboardData.efficiency.totalCost.toFixed(2)}`}
            color="#06b6d4"
          />
          <MetricCard
            icon={<Leaf size={20} />}
            label="Carbon Footprint"
            value={`${dashboardData.sustainability.carbonFootprint.toFixed(2)} kg CO₂`}
            color="#22c55e"
          />
        </div>
      )}

      {/* Efficiency View */}
      {selectedView === 'efficiency' && (
        <div>
          <div style={{
            backgroundColor: '#0d1218',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#10b981' }}>
              Efficiency Metrics
            </div>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Average Efficiency:</span>
                <span style={{ fontWeight: 'bold' }}>{dashboardData.efficiency.avgEfficiency.toFixed(1)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Average Job Duration:</span>
                <span style={{ fontWeight: 'bold' }}>{Math.round(dashboardData.efficiency.avgJobDuration)}s</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Material Used:</span>
                <span style={{ fontWeight: 'bold' }}>{dashboardData.efficiency.totalMaterialUsed.toFixed(0)} mm²</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#0d1218',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '16px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#3b82f6' }}>
              7-Day Trend
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '100px' }}>
              {dashboardData.trends.map((day, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      backgroundColor: '#3b82f6',
                      borderRadius: '2px 2px 0 0',
                      height: `${Math.min(100, (day.jobs / Math.max(...dashboardData.trends.map(d => d.jobs))) * 100)}%`,
                      minHeight: day.jobs > 0 ? '4px' : '0',
                    }}
                    title={`${day.jobs} jobs`}
                  />
                  <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
                    {new Date(day.date).getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sustainability View */}
      {selectedView === 'sustainability' && (
        <div>
          <div style={{
            backgroundColor: '#0d1218',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#22c55e' }}>
              Environmental Impact
            </div>
            <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Carbon Footprint:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {dashboardData.sustainability.carbonFootprint.toFixed(2)} kg CO₂
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Material Waste:</span>
                <span style={{ fontWeight: 'bold', color: dashboardData.sustainability.materialWaste > 30 ? '#f59e0b' : '#22c55e' }}>
                  {dashboardData.sustainability.materialWaste.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Energy Efficiency:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {dashboardData.sustainability.energyEfficiency.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#aaa' }}>Waste Reduction:</span>
                <span style={{ fontWeight: 'bold', color: '#22c55e' }}>
                  {dashboardData.sustainability.wasteReduction.toFixed(1)}% vs baseline
                </span>
              </div>
            </div>
          </div>

          {dashboardData.sustainability.recommendations.length > 0 && (
            <div style={{
              backgroundColor: '#0d1218',
              border: '1px solid #333',
              borderRadius: '6px',
              padding: '16px',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>
                Recommendations
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#ccc' }}>
                {dashboardData.sustainability.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '6px' }}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper component for metric cards
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div style={{
    backgroundColor: '#0d1218',
    border: '1px solid #333',
    borderRadius: '6px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color }}>
      {icon}
      <span style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase' }}>{label}</span>
    </div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
      {value}
    </div>
  </div>
);
