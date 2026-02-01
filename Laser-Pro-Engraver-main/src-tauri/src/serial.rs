use serialport::{SerialPort, SerialPortInfo, SerialPortType};
use std::io::Write;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::State;

pub struct SerialState {
    pub port: Arc<Mutex<Option<Box<dyn SerialPort>>>>,
}

#[derive(serde::Serialize)]
pub struct PortInfo {
    port_name: String,
    port_type: String,
}

impl From<SerialPortInfo> for PortInfo {
    fn from(info: SerialPortInfo) -> Self {
        let port_type = match info.port_type {
            SerialPortType::UsbPort(_) => "USB".to_string(),
            SerialPortType::PciPort => "PCI".to_string(),
            SerialPortType::BluetoothPort => "Bluetooth".to_string(),
            SerialPortType::Unknown => "Unknown".to_string(),
        };
        
        PortInfo {
            port_name: info.port_name,
            port_type,
        }
    }
}

#[tauri::command]
pub fn list_serial_ports() -> Result<Vec<PortInfo>, String> {
    serialport::available_ports()
        .map(|ports| ports.into_iter().map(PortInfo::from).collect())
        .map_err(|e| format!("Failed to list ports: {}", e))
}

#[tauri::command]
pub fn connect_serial(
    port_name: String,
    baud_rate: u32,
    state: State<SerialState>,
) -> Result<String, String> {
    let port = serialport::new(&port_name, baud_rate)
        .timeout(Duration::from_millis(100))
        .open()
        .map_err(|e| format!("Failed to open port {}: {}", port_name, e))?;

    *state.port.lock().unwrap() = Some(port);
    Ok(format!("Connected to {} at {} baud", port_name, baud_rate))
}

#[tauri::command]
pub fn disconnect_serial(state: State<SerialState>) -> Result<String, String> {
    *state.port.lock().unwrap() = None;
    Ok("Disconnected".to_string())
}

#[tauri::command]
pub fn send_gcode(command: String, state: State<SerialState>) -> Result<String, String> {
    let mut port_guard = state.port.lock().unwrap();

    if let Some(ref mut port) = *port_guard {
        let cmd_with_newline = format!("{}\n", command.trim());
        port.write_all(cmd_with_newline.as_bytes())
            .map_err(|e| format!("Write failed: {}", e))?;
        port.flush().map_err(|e| format!("Flush failed: {}", e))?;

        Ok(format!("Sent: {}", command))
    } else {
        Err("No serial port connected".to_string())
    }
}

#[tauri::command]
pub fn is_serial_connected(state: State<SerialState>) -> bool {
    state.port.lock().unwrap().is_some()
}
