import { invoke } from '@tauri-apps/api/core';

export interface LicenseInfo {
  key: string;
  activated: boolean;
  tier: 'Free' | 'Premium';
  hardware_id: string;
  activation_date: string | null;
  expiry_date: string | null;
}

export class LicenseManager {
  /**
   * Get current license information
   */
  static async getLicenseInfo(): Promise<LicenseInfo> {
    return await invoke('get_license_info');
  }

  /**
   * Get hardware ID for this device
   */
  static async getHardwareId(): Promise<string> {
    return await invoke('get_hardware_id_cmd');
  }

  /**
   * Activate a license key
   */
  static async activateLicense(key: string): Promise<LicenseInfo> {
    return await invoke('activate_license_key', { key });
  }

  /**
   * Check if a specific feature is available
   */
  static async checkFeatureAccess(feature: string): Promise<boolean> {
    return await invoke('check_feature_access', { feature });
  }

  /**
   * Deactivate current license
   */
  static async deactivateLicense(): Promise<void> {
    return await invoke('deactivate_license');
  }

  /**
   * Check if user has premium access
   */
  static async isPremium(): Promise<boolean> {
    const license = await this.getLicenseInfo();
    return license.tier === 'Premium' && license.activated;
  }

  /**
   * Validate license key format (client-side check)
   */
  static validateKeyFormat(key: string): boolean {
    // Format: XXXXX-XXXXX-XXXXX-XXXXX
    const pattern = /^[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
    return pattern.test(key);
  }
}

// Feature identifiers
export const FEATURES = {
  // Free features
  BASIC_LOAD: 'basic_load',
  BASIC_SAVE: 'basic_save',
  GRAYSCALE: 'grayscale',
  THRESHOLD: 'threshold',
  BASIC_EXPORT: 'basic_export',
  
  // Premium features
  ADVANCED_FILTERS: 'advanced_filters',
  DITHERING: 'dithering',
  FILTER_GALLERY: 'filter_gallery',
  PATH_GENERATION: 'path_generation',
  MATERIAL_LIBRARY: 'material_library',
  PROJECT_SAVE_LOAD: 'project_save_load',
  SERIAL_CONTROL: 'serial_control',
  PROFESSIONAL_FEATURES: 'professional_features',
} as const;
