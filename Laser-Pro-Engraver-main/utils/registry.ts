
import { MachineProfile, ProductPlugin, PluginStatus } from '../types';
import { EXTERNAL_HUB_URL } from '../gearAds';

const REGISTRY_STORAGE_KEY = 'laserpro_plugin_registry_v1';
const LAST_CHECK_KEY = 'laserpro_last_update_check';

export interface RemoteManifest {
  version: string;
  releaseDate: string;
  hasEOLChanges: boolean;
  changelog: string;
  machines: MachineProfile[];
  products: ProductPlugin[];
}

export interface VersionEntry {
  version: string;
  date: string;
  url: string;
}

export interface PluginRegistry {
  version: string;
  machines: MachineProfile[];
  products: ProductPlugin[];
  lastUpdated: number;
}

const DEFAULT_MACHINES: MachineProfile[] = [
  { id: 'acmer-s1', brand: 'ACMER', name: 'ACMER S1', width: 140, height: 140, type: 'diode', version: '1.0', status: 'active' },
  { id: 'xtool-d1-pro', brand: 'xTool', name: 'xTool D1 Pro', width: 430, height: 390, type: 'diode', version: '1.1', status: 'active' },
  { id: 'ortur-lm3', brand: 'Ortur', name: 'Laser Master 3', width: 400, height: 400, type: 'diode', version: '1.0', status: 'active' },
  { id: 'sculpfun-s30', brand: 'Sculpfun', name: 'Sculpfun S30', width: 400, height: 400, type: 'diode', version: '1.0', status: 'active' },
  { id: 'atomstack-a20', brand: 'Atomstack', name: 'A20 Pro', width: 400, height: 400, type: 'diode', version: '1.0', status: 'active' },
  { id: 'creality-f2', brand: 'Creality', name: 'Falcon 2', width: 400, height: 400, type: 'diode', version: '1.0', status: 'active' }
];

const DEFAULT_PRODUCTS: ProductPlugin[] = [
  { id: 'cam-acmer', brand: 'ACMER', name: 'H500 Camera', targetBrand: 'ACMER', desc: 'Precision bed mapping system.', status: 'active' },
  { id: 'air-generic', brand: 'Generic', name: 'Smart Air Assist', targetBrand: 'Generic', desc: 'Universal M8 control module.', status: 'active' }
];

export class RegistryManager {
  private registry: PluginRegistry;

  constructor() {
    const saved = localStorage.getItem(REGISTRY_STORAGE_KEY);
    if (saved) {
      this.registry = JSON.parse(saved);
    } else {
      this.registry = {
        version: '1.0.0',
        machines: DEFAULT_MACHINES,
        products: DEFAULT_PRODUCTS,
        lastUpdated: Date.now()
      };
      this.save();
    }
  }

  save() {
    this.registry.lastUpdated = Date.now();
    localStorage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(this.registry));
  }

  getRegistry() { return this.registry; }

  getMachines(includeEOL = false) {
    return this.registry.machines.filter(m => includeEOL || m.status !== 'eol');
  }

  getProducts(targetBrand?: string) {
    const active = this.registry.products.filter(p => p.status === 'active');
    if (!targetBrand) return active;
    const specific = active.filter(p => p.targetBrand === targetBrand);
    const universal = active.filter(p => p.targetBrand === 'Generic');
    return [...specific, ...universal];
  }

  async checkForUpdates(force = false): Promise<RemoteManifest | null> {
    const now = Date.now();
    const lastCheck = parseInt(localStorage.getItem(LAST_CHECK_KEY) || '0');
    if (!force && (now - lastCheck < 2592000000)) return null;

    try {
      localStorage.setItem(LAST_CHECK_KEY, now.toString());
      const response = await fetch(`${EXTERNAL_HUB_URL}/manifest.json?t=${now}`);
      if (!response.ok) return null;
      const manifest: RemoteManifest = await response.json();
      if (manifest.version !== this.registry.version) return manifest;
      return null;
    } catch (e) { return null; }
  }

  async fetchVersionHistory(): Promise<VersionEntry[]> {
    try {
      const response = await fetch(`${EXTERNAL_HUB_URL}/versions.json?t=${Date.now()}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (e) { return []; }
  }

  async fetchSpecificVersion(entry: VersionEntry): Promise<RemoteManifest | null> {
    try {
      const response = await fetch(`${EXTERNAL_HUB_URL}/${entry.url}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) { return null; }
  }

  applyUpdate(manifest: RemoteManifest) {
    this.registry = { version: manifest.version, machines: manifest.machines, products: manifest.products, lastUpdated: Date.now() };
    this.save();
  }

  addMachine(machine: MachineProfile) {
    this.registry.machines = [machine, ...this.registry.machines.filter(m => m.id !== machine.id)];
    this.save();
  }
}

export const registry = new RegistryManager();
