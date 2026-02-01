use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use serde_json;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LicenseInfo {
    pub key: String,
    pub activated: bool,
    pub tier: LicenseTier,
    pub hardware_id: String,
    pub activation_date: Option<String>,
    pub expiry_date: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum LicenseTier {
    Free,
    Premium,
}

impl Default for LicenseInfo {
    fn default() -> Self {
        LicenseInfo {
            key: String::new(),
            activated: false,
            tier: LicenseTier::Free,
            hardware_id: String::new(),
            activation_date: None,
            expiry_date: None,
        }
    }
}

// Generate hardware fingerprint for license binding
pub fn get_hardware_id() -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    
    // Combine multiple hardware identifiers
    #[cfg(target_os = "windows")]
    {
        if let Ok(output) = std::process::Command::new("wmic")
            .args(&["csproduct", "get", "UUID"])
            .output()
        {
            String::from_utf8_lossy(&output.stdout).hash(&mut hasher);
        }
    }
    
    #[cfg(target_os = "macos")]
    {
        if let Ok(output) = std::process::Command::new("system_profiler")
            .args(&["SPHardwareDataType"])
            .output()
        {
            String::from_utf8_lossy(&output.stdout).hash(&mut hasher);
        }
    }
    
    #[cfg(target_os = "linux")]
    {
        if let Ok(machine_id) = fs::read_to_string("/etc/machine-id") {
            machine_id.hash(&mut hasher);
        } else if let Ok(machine_id) = fs::read_to_string("/var/lib/dbus/machine-id") {
            machine_id.hash(&mut hasher);
        }
    }
    
    // Fallback: use hostname
    if let Ok(hostname) = hostname::get() {
        hostname.to_string_lossy().to_string().hash(&mut hasher);
    }
    
    format!("{:x}", hasher.finish())
}

// Validate license key format and checksum
pub fn validate_license_key(key: &str) -> bool {
    // License key format: XXXXX-XXXXX-XXXXX-XXXXX (20 chars + 3 hyphens)
    if key.len() != 23 {
        return false;
    }
    
    let parts: Vec<&str> = key.split('-').collect();
    if parts.len() != 4 {
        return false;
    }
    
    // Each part should be 5 alphanumeric characters
    for part in &parts {
        if part.len() != 5 || !part.chars().all(|c| c.is_ascii_alphanumeric()) {
            return false;
        }
    }
    
    // Simple checksum validation (last segment contains checksum)
    let data = format!("{}-{}-{}", parts[0], parts[1], parts[2]);
    let checksum = calculate_checksum(&data);
    let expected = &parts[3][0..4]; // First 4 chars of last segment
    
    checksum == expected
}

// Calculate simple checksum for license key
fn calculate_checksum(data: &str) -> String {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};
    
    let mut hasher = DefaultHasher::new();
    data.hash(&mut hasher);
    let hash = hasher.finish();
    
    format!("{:04X}", (hash % 0xFFFF) as u16)
}

// Get license file path
fn get_license_file_path(config: &tauri::Config) -> PathBuf {
    // For v2, we'll use the app identifier from config to construct the path
    let app_dir = dirs::data_dir()
        .map(|p| p.join(&config.identifier))
        .unwrap_or_else(|| PathBuf::from("."));
    
    app_dir.join("license.json")
}

// Load license from disk
pub fn load_license(config: &tauri::Config) -> LicenseInfo {
    let license_path = get_license_file_path(config);
    
    if let Ok(contents) = fs::read_to_string(&license_path) {
        if let Ok(license) = serde_json::from_str::<LicenseInfo>(&contents) {
            return license;
        }
    }
    
    LicenseInfo::default()
}

// Save license to disk
pub fn save_license(config: &tauri::Config, license: &LicenseInfo) -> Result<(), String> {
    let license_path = get_license_file_path(config);
    
    // Ensure parent directory exists
    if let Some(parent) = license_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create license directory: {}", e))?;
    }
    
    let json = serde_json::to_string_pretty(license)
        .map_err(|e| format!("Failed to serialize license: {}", e))?;
    
    fs::write(&license_path, json)
        .map_err(|e| format!("Failed to write license file: {}", e))?;
    
    Ok(())
}

// Activate a license key
pub fn activate_license(
    config: &tauri::Config,
    key: &str,
    hardware_id: &str,
) -> Result<LicenseInfo, String> {
    // Validate key format
    if !validate_license_key(key) {
        return Err("Invalid license key format".to_string());
    }
    
    // In a real implementation, this would call a remote API to validate
    // and activate the key. For now, we'll do basic validation.
    
    let mut license = LicenseInfo {
        key: key.to_string(),
        activated: true,
        tier: LicenseTier::Premium,
        hardware_id: hardware_id.to_string(),
        activation_date: Some(chrono::Local::now().to_rfc3339()),
        expiry_date: None, // Premium license doesn't expire
    };
    
    // Save license
    save_license(config, &license)?;
    
    Ok(license)
}

// Check if feature is available based on license tier
pub fn is_feature_available(license_tier: &LicenseTier, feature: &str) -> bool {
    match license_tier {
        LicenseTier::Premium => true, // All features available
        LicenseTier::Free => {
            // Only basic features available in free tier
            matches!(
                feature,
                "basic_load" | "basic_save" | "grayscale" | "threshold" | "basic_export"
            )
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_license_key_validation() {
        // Valid format
        assert!(validate_license_key("ABC12-DEF34-GHI56-JKL78"));
        
        // Invalid formats
        assert!(!validate_license_key("ABC12-DEF34-GHI56")); // Too short
        assert!(!validate_license_key("ABC12-DEF34-GHI56-JKL789")); // Last part too long
        assert!(!validate_license_key("ABC12_DEF34_GHI56_JKL78")); // Wrong separator
    }
    
    #[test]
    fn test_hardware_id_generation() {
        let hw_id = get_hardware_id();
        assert!(!hw_id.is_empty());
        assert_eq!(hw_id, get_hardware_id()); // Should be consistent
    }
}
