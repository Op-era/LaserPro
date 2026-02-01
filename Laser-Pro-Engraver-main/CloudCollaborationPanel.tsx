/**
 * Cloud Collaboration Panel - Phase 3 UI Component
 * Real-time collaboration and remote fleet management
 */

import React, { useState, useEffect } from 'react';
import { Cloud, Users, Radio, Share2, Upload, Download } from 'lucide-react';
import {
  initCloudSession,
  syncToCloud,
  loadFromCloud,
  getFleetMachines,
  queueRemoteJob,
  FleetMachine,
  CloudSettings,
  CloudProject,
} from './utils/cloudCollaboration';

interface CloudCollaborationPanelProps {
  currentProject?: CloudProject;
  onProjectLoaded?: (project: CloudProject) => void;
}

export const CloudCollaborationPanel: React.FC<CloudCollaborationPanelProps> = ({
  currentProject,
  onProjectLoaded,
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'collaborate' | 'fleet'>('sync');
  const [isSyncing, setIsSyncing] = useState(false);
  const [fleetMachines, setFleetMachines] = useState<FleetMachine[]>([]);
  const [cloudSettings] = useState<CloudSettings>({
    autoSync: false,
    syncInterval: 60000,
    cloudProvider: 'aws',
  });

  useEffect(() => {
    if (activeTab === 'fleet') {
      loadFleetMachines();
    }
  }, [activeTab]);

  const loadFleetMachines = async () => {
    const machines = await getFleetMachines();
    setFleetMachines(machines);
  };

  const handleSyncToCloud = async () => {
    if (!currentProject) {
      alert('No project to sync');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await syncToCloud(currentProject, cloudSettings);
      if (result.success) {
        alert('Project synced to cloud successfully!');
      } else {
        alert(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      alert('Sync error: Cloud service not available');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLoadFromCloud = async () => {
    setIsSyncing(true);
    try {
      const result = await loadFromCloud('project-123', cloudSettings);
      if (result.success && result.project && onProjectLoaded) {
        onProjectLoaded(result.project);
        alert('Project loaded from cloud!');
      } else {
        alert(`Load failed: ${result.error}`);
      }
    } catch (error) {
      alert('Load error: Cloud service not available');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleQueueToMachine = async (machineId: string) => {
    if (!currentProject) {
      alert('No project to queue');
      return;
    }

    const result = await queueRemoteJob(machineId, currentProject);
    if (result.success) {
      alert(`Job queued to machine at position ${result.queuePosition}`);
      loadFleetMachines(); // Refresh status
    } else {
      alert(`Failed to queue job: ${result.error}`);
    }
  };

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '16px',
      color: '#fff',
      maxWidth: '500px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        fontSize: '18px',
        fontWeight: 'bold',
      }}>
        <Cloud size={24} color="#10b981" />
        <span>Cloud Collaboration</span>
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
          onClick={() => setActiveTab('sync')}
          style={{
            padding: '6px 12px',
            backgroundColor: activeTab === 'sync' ? '#10b981' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Sync
        </button>
        <button
          onClick={() => setActiveTab('collaborate')}
          style={{
            padding: '6px 12px',
            backgroundColor: activeTab === 'collaborate' ? '#10b981' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Collaborate
        </button>
        <button
          onClick={() => setActiveTab('fleet')}
          style={{
            padding: '6px 12px',
            backgroundColor: activeTab === 'fleet' ? '#10b981' : 'transparent',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Fleet
        </button>
      </div>

      {/* Sync Tab */}
      {activeTab === 'sync' && (
        <div>
          <div style={{
            backgroundColor: '#0d1218',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px',
            fontSize: '12px',
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Cloud Provider:</strong> {cloudSettings.cloudProvider.toUpperCase()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Auto-Sync:</strong> {cloudSettings.autoSync ? 'Enabled' : 'Disabled'}
            </div>
            <div>
              <strong>Status:</strong> <span style={{ color: '#10b981' }}>Connected</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSyncToCloud}
              disabled={isSyncing || !currentProject}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: isSyncing ? '#555' : '#3b82f6',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: isSyncing || !currentProject ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Upload size={16} />
              {isSyncing ? 'Syncing...' : 'Sync to Cloud'}
            </button>

            <button
              onClick={handleLoadFromCloud}
              disabled={isSyncing}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: isSyncing ? '#555' : '#8b5cf6',
                border: 'none',
                borderRadius: '4px',
                color: '#fff',
                cursor: isSyncing ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Download size={16} />
              Load from Cloud
            </button>
          </div>

          <div style={{ marginTop: '12px', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
            Projects are automatically saved to cloud storage
          </div>
        </div>
      )}

      {/* Collaborate Tab */}
      {activeTab === 'collaborate' && (
        <div>
          <div style={{
            backgroundColor: '#0d1218',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Users size={18} color="#10b981" />
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Active Collaborators</span>
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              No active collaboration session
            </div>
          </div>

          <button
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#10b981',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}
          >
            <Share2 size={16} />
            Start Collaboration Session
          </button>

          <button
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              border: '1px solid #333',
              borderRadius: '4px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Users size={16} />
            Join Existing Session
          </button>

          <div style={{ marginTop: '12px', fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
            Real-time multi-user editing with live cursors and changes
          </div>
        </div>
      )}

      {/* Fleet Tab */}
      {activeTab === 'fleet' && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Remote Machines</span>
              <button
                onClick={loadFleetMachines}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #333',
                  borderRadius: '4px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >
                Refresh
              </button>
            </div>

            {fleetMachines.length === 0 ? (
              <div style={{
                backgroundColor: '#0d1218',
                border: '1px solid #333',
                borderRadius: '6px',
                padding: '16px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#888',
              }}>
                No machines available
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fleetMachines.map((machine) => (
                  <div
                    key={machine.id}
                    style={{
                      backgroundColor: '#0d1218',
                      border: '1px solid #333',
                      borderRadius: '6px',
                      padding: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{machine.name}</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>{machine.location}</div>
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        backgroundColor: machine.status === 'idle' ? '#10b981' : machine.status === 'busy' ? '#f59e0b' : '#ef4444',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                        {machine.status}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '8px' }}>
                      Queue: {machine.queueLength} jobs
                    </div>

                    <button
                      onClick={() => handleQueueToMachine(machine.id)}
                      disabled={machine.status === 'offline' || machine.status === 'error'}
                      style={{
                        width: '100%',
                        padding: '6px',
                        backgroundColor: machine.status === 'offline' || machine.status === 'error' ? '#555' : '#3b82f6',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: machine.status === 'offline' || machine.status === 'error' ? 'not-allowed' : 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Radio size={14} />
                      Queue Job to This Machine
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>
            Manage and control remote laser engravers in your fleet
          </div>
        </div>
      )}
    </div>
  );
};
