import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { Layer, Path, EngraverSettings } from '../types';

export interface ProjectFile {
  version: string;
  settings: EngraverSettings;
  layers: Layer[];
  paths: Path[];
  timestamp: string;
}

/**
 * Save current project to a .ltp (LaserTrace Project) file
 */
export async function saveProject(
  settings: EngraverSettings,
  layers: Layer[],
  paths: Path[]
): Promise<boolean> {
  try {
    const filePath = await save({
      filters: [
        {
          name: 'LaserTrace Project',
          extensions: ['ltp'],
        },
      ],
      defaultPath: 'project.ltp',
    });

    if (!filePath) return false;

    const projectData: ProjectFile = {
      version: '1.0.0',
      settings,
      layers,
      paths,
      timestamp: new Date().toISOString(),
    };

    await writeTextFile(filePath, JSON.stringify(projectData, null, 2));
    return true;
  } catch (err) {
    console.error('Save failed:', err);
    return false;
  }
}

/**
 * Load project from a .ltp file
 */
export async function loadProject(): Promise<ProjectFile | null> {
  try {
    const filePath = await open({
      filters: [
        {
          name: 'LaserTrace Project',
          extensions: ['ltp'],
        },
      ],
      multiple: false,
    });

    if (!filePath || typeof filePath !== 'string') return null;

    const contents = await readTextFile(filePath);
    const project = JSON.parse(contents) as ProjectFile;

    // Validate project structure
    if (!project.version || !project.settings || !project.layers || !project.paths) {
      throw new Error('Invalid project file format');
    }

    return project;
  } catch (err) {
    console.error('Load failed:', err);
    return null;
  }
}

/**
 * Export G-code to a file
 */
export async function exportGCode(gcode: string): Promise<boolean> {
  try {
    const filePath = await save({
      filters: [
        {
          name: 'G-code',
          extensions: ['gcode', 'nc', 'txt'],
        },
      ],
      defaultPath: 'output.gcode',
    });

    if (!filePath) return false;

    await writeTextFile(filePath, gcode);
    return true;
  } catch (err) {
    console.error('G-code export failed:', err);
    return false;
  }
}
