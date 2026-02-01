// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod serial;
mod licensing;

use std::sync::{Arc, Mutex};
use serial::{SerialState, list_serial_ports, connect_serial, disconnect_serial, send_gcode, is_serial_connected};
use licensing::{LicenseInfo, get_hardware_id, load_license, activate_license, is_feature_available};
use tauri::{Manager, State};

// License state management
pub struct LicenseState(Arc<Mutex<LicenseInfo>>);

// Tauri commands for license management
#[tauri::command]
fn get_license_info(license_state: State<LicenseState>) -> LicenseInfo {
    let license = license_state.0.lock().unwrap();
    license.clone()
}

#[tauri::command]
fn get_hardware_id_cmd() -> String {
    get_hardware_id()
}

#[tauri::command]
fn activate_license_key(
    key: String,
    app_handle: tauri::AppHandle,
    license_state: State<LicenseState>,
) -> Result<LicenseInfo, String> {
    let hardware_id = get_hardware_id();
    let config = app_handle.config();
    
    // Activate license
    let license = activate_license(config, &key, &hardware_id)?;
    
    // Update state
    let mut state = license_state.0.lock().unwrap();
    *state = license.clone();
    
    Ok(license)
}

#[tauri::command]
fn check_feature_access(
    feature: String,
    license_state: State<LicenseState>,
) -> bool {
    let license = license_state.0.lock().unwrap();
    is_feature_available(&license.tier, &feature)
}

#[tauri::command]
fn deactivate_license(
    app_handle: tauri::AppHandle,
    license_state: State<LicenseState>,
) -> Result<(), String> {
    let config = app_handle.config();
    let default_license = LicenseInfo::default();
    
    // Save default (free) license
    licensing::save_license(config, &default_license)?;
    
    // Update state
    let mut state = license_state.0.lock().unwrap();
    *state = default_license;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            // Load existing license or create default
            let config = app.config();
            let license = load_license(config);
            
            // Initialize license state
            app.manage(LicenseState(Arc::new(Mutex::new(license))));
            
            Ok(())
        })
        .manage(SerialState {
            port: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![
            list_serial_ports,
            connect_serial,
            disconnect_serial,
            send_gcode,
            is_serial_connected,
            get_license_info,
            get_hardware_id_cmd,
            activate_license_key,
            check_feature_access,
            deactivate_license,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
