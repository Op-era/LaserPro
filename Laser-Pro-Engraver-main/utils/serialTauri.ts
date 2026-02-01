import { invoke } from '@tauri-apps/api/core';

export interface SerialPortInfo {
  port_name: string;
  port_type: string;
}

/**
 * Tauri-based serial controller for laser communication
 * Replaces Web Serial API with native Rust backend
 */
export class TauriSerialController {
  /**
   * List available serial ports
   */
  static async listPorts(): Promise<SerialPortInfo[]> {
    try {
      return await invoke<SerialPortInfo[]>('list_serial_ports');
    } catch (err) {
      console.error('Failed to list ports:', err);
      throw new Error(`Failed to list serial ports: ${err}`);
    }
  }

  /**
   * Connect to a serial port
   */
  static async connect(portName: string, baudRate: number = 115200): Promise<string> {
    try {
      return await invoke<string>('connect_serial', { portName, baudRate });
    } catch (err) {
      console.error('Connection failed:', err);
      throw new Error(`Connection failed: ${err}`);
    }
  }

  /**
   * Disconnect from current serial port
   */
  static async disconnect(): Promise<string> {
    try {
      return await invoke<string>('disconnect_serial');
    } catch (err) {
      console.error('Disconnect failed:', err);
      throw new Error(`Disconnect failed: ${err}`);
    }
  }

  /**
   * Send G-code command to the laser
   */
  static async sendGCode(command: string): Promise<string> {
    try {
      return await invoke<string>('send_gcode', { command });
    } catch (err) {
      console.error('Send G-code failed:', err);
      throw new Error(`Send G-code failed: ${err}`);
    }
  }

  /**
   * Check if serial port is connected
   */
  static async isConnected(): Promise<boolean> {
    try {
      return await invoke<boolean>('is_serial_connected');
    } catch (err) {
      console.error('Connection check failed:', err);
      return false;
    }
  }
}
