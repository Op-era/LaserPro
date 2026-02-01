/**
 * Feature Flags - Production Configuration
 * Controls availability of features based on implementation status
 */

export interface FeatureFlags {
  // Core Features (Always Enabled)
  imageProcessing: boolean;
  serialControl: boolean;
  gcodeGeneration: boolean;
  layerManagement: boolean;
  materialLibrary: boolean;
  
  // Phase 1 Features
  serialization: boolean;
  variableText: boolean;
  professionalFilters: boolean;
  
  // Phase 3 - AI Suite
  aiPredictiveSimulation: boolean;    // ✅ Working
  aiOptimization: boolean;            // ✅ Working
  aiMaterialScan: boolean;            // ✅ Working
  aiDesignGeneration: boolean;        // 🔄 Placeholder - requires ML API
  
  // Phase 3 - Cloud Collaboration
  cloudSync: boolean;                 // 🔄 Placeholder - requires backend
  cloudCollaboration: boolean;        // 🔄 Placeholder - requires WebSocket
  remoteFleetManagement: boolean;     // 🔄 Placeholder - requires API
  
  // Phase 3 - Enterprise
  enterpriseAPI: boolean;             // 🔄 Placeholder - requires backend
  erpIntegration: boolean;            // 🔄 Placeholder - requires adapters
  crmIntegration: boolean;            // 🔄 Placeholder - requires adapters
  productionAnalytics: boolean;       // 🔄 Placeholder - requires database
  
  // Phase 3 - Hybrid Integrations
  hybridWorkflows: boolean;           // ✅ Working
  threeDPrintExport: boolean;         // ✅ Working
  cncExport: boolean;                 // ✅ Working
  
  // Phase 3 - VR/AR
  vrPreview: boolean;                 // 🔄 Skeleton only - requires WebXR
  arAlignment: boolean;               // 🔄 Skeleton only - requires WebXR
}

/**
 * Production Feature Flags
 * Only enable features that are fully implemented and tested
 */
export const PRODUCTION_FLAGS: FeatureFlags = {
  // Core Features - Always ON
  imageProcessing: true,
  serialControl: true,
  gcodeGeneration: true,
  layerManagement: true,
  materialLibrary: true,
  
  // Phase 1 Features - All Working
  serialization: true,
  variableText: true,
  professionalFilters: true,
  
  // Phase 3 - AI Suite (Mixed)
  aiPredictiveSimulation: true,   // ✅ Fully working
  aiOptimization: true,           // ✅ Fully working
  aiMaterialScan: true,           // ✅ Fully working
  aiDesignGeneration: false,      // 🔄 Disabled - placeholder only
  
  // Phase 3 - Cloud (All Placeholder)
  cloudSync: false,               // 🔄 Disabled - needs backend
  cloudCollaboration: false,      // 🔄 Disabled - needs WebSocket
  remoteFleetManagement: false,   // 🔄 Disabled - needs API
  
  // Phase 3 - Enterprise (All Placeholder)
  enterpriseAPI: false,           // 🔄 Disabled - needs backend
  erpIntegration: false,          // 🔄 Disabled - needs adapters
  crmIntegration: false,          // 🔄 Disabled - needs adapters
  productionAnalytics: false,     // 🔄 Disabled - needs database
  
  // Phase 3 - Hybrid (All Working)
  hybridWorkflows: true,          // ✅ Fully working
  threeDPrintExport: true,        // ✅ Fully working
  cncExport: true,                // ✅ Fully working
  
  // Phase 3 - VR/AR (Skeleton Only)
  vrPreview: false,               // 🔄 Disabled - skeleton only
  arAlignment: false,             // 🔄 Disabled - skeleton only
};

/**
 * Development Feature Flags
 * Enable all features for testing, including placeholders
 */
export const DEVELOPMENT_FLAGS: FeatureFlags = {
  // Core Features
  imageProcessing: true,
  serialControl: true,
  gcodeGeneration: true,
  layerManagement: true,
  materialLibrary: true,
  
  // Phase 1 Features
  serialization: true,
  variableText: true,
  professionalFilters: true,
  
  // Phase 3 - AI Suite
  aiPredictiveSimulation: true,
  aiOptimization: true,
  aiMaterialScan: true,
  aiDesignGeneration: true,       // Show in dev for testing
  
  // Phase 3 - Cloud
  cloudSync: true,                // Show in dev for UI testing
  cloudCollaboration: true,       // Show in dev for UI testing
  remoteFleetManagement: true,    // Show in dev for UI testing
  
  // Phase 3 - Enterprise
  enterpriseAPI: true,            // Show in dev for UI testing
  erpIntegration: true,           // Show in dev for UI testing
  crmIntegration: true,           // Show in dev for UI testing
  productionAnalytics: true,      // Show in dev for UI testing
  
  // Phase 3 - Hybrid
  hybridWorkflows: true,
  threeDPrintExport: true,
  cncExport: true,
  
  // Phase 3 - VR/AR
  vrPreview: true,                // Show in dev for UI testing
  arAlignment: true,              // Show in dev for UI testing
};

/**
 * Get current feature flags based on environment
 */
export function getFeatureFlags(): FeatureFlags {
  const isDevelopment = import.meta.env.DEV || 
                       import.meta.env.MODE === 'development' ||
                       process.env.NODE_ENV === 'development';
  
  return isDevelopment ? DEVELOPMENT_FLAGS : PRODUCTION_FLAGS;
}

/**
 * Check if a specific feature is enabled
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const flags = getFeatureFlags();
  return flags[feature];
}

/**
 * Get list of disabled features for user communication
 */
export function getDisabledFeatures(): Array<{ feature: string; reason: string }> {
  const flags = getFeatureFlags();
  const disabled: Array<{ feature: string; reason: string }> = [];
  
  if (!flags.aiDesignGeneration) {
    disabled.push({
      feature: 'AI Design Generation',
      reason: 'Requires AI model integration - Coming in future release'
    });
  }
  
  if (!flags.cloudSync || !flags.cloudCollaboration) {
    disabled.push({
      feature: 'Cloud Collaboration',
      reason: 'Requires cloud backend service - Available in Premium tier soon'
    });
  }
  
  if (!flags.remoteFleetManagement) {
    disabled.push({
      feature: 'Remote Fleet Management',
      reason: 'Enterprise feature - Contact sales for early access'
    });
  }
  
  if (!flags.enterpriseAPI || !flags.erpIntegration || !flags.crmIntegration) {
    disabled.push({
      feature: 'Enterprise Integrations',
      reason: 'Enterprise feature - Contact sales for custom integration'
    });
  }
  
  if (!flags.vrPreview || !flags.arAlignment) {
    disabled.push({
      feature: 'VR/AR Preview',
      reason: 'Future feature - In development for next major release'
    });
  }
  
  return disabled;
}

/**
 * Get enabled Phase 3 features for marketing/display
 */
export function getEnabledPhase3Features(): string[] {
  const flags = getFeatureFlags();
  const enabled: string[] = [];
  
  if (flags.aiPredictiveSimulation && flags.aiOptimization) {
    enabled.push('AI-Powered Job Optimization');
  }
  
  if (flags.aiMaterialScan) {
    enabled.push('Intelligent Material Detection');
  }
  
  if (flags.hybridWorkflows) {
    enabled.push('3D Print & CNC Integration');
  }
  
  return enabled;
}

// Export current flags as default
export default getFeatureFlags();
