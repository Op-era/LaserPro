/**
 * Variable Text System - LightBurn-style implementation
 * Enhanced Phase 1 of 10 from ROADMAP-v0.2.0.md
 * 
 * Supports dynamic text variables like LightBurn:
 * - ${Counter} or ${Counter:000000} for auto-increment
 * - ${Date} or ${Date:YYYY-MM-DD} for current date
 * - ${Time} or ${Time:HH:mm:ss} for current time
 * - ${Filename} for project filename
 * 
 * Multiple variables can be used in single text: "S/N ${Counter:000000} ${Date}"
 */

export interface VariableTextState {
  counter: number;
  counterStart: number;
  counterStep: number;
  filename: string;
}

export interface VariableDefinition {
  name: string;
  defaultFormat: string;
  description: string;
  generator: (format?: string, state?: VariableTextState) => string;
}

/**
 * Parse and process variable text string
 * Example: "Serial: ${Counter:000000} Date: ${Date:YYYY-MM-DD}"
 */
export function processVariableText(
  text: string,
  state: VariableTextState
): string {
  // Match ${VariableName} or ${VariableName:format}
  const variablePattern = /\$\{([^:}]+)(?::([^}]+))?\}/g;
  
  return text.replace(variablePattern, (match, varName, format) => {
    const variable = VARIABLES[varName as keyof typeof VARIABLES];
    if (!variable) {
      return match; // Return original if variable not found
    }
    
    return variable.generator(format, state);
  });
}

/**
 * Extract all variables used in text
 */
export function extractVariables(text: string): string[] {
  const variablePattern = /\$\{([^:}]+)(?::([^}]+))?\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variablePattern.exec(text)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  
  return variables;
}

/**
 * Check if text contains any variables
 */
export function hasVariables(text: string): boolean {
  return /\$\{[^}]+\}/.test(text);
}

/**
 * Available variables
 */
export const VARIABLES: Record<string, VariableDefinition> = {
  Counter: {
    name: 'Counter',
    defaultFormat: '000000',
    description: 'Auto-increment counter for serialization',
    generator: (format?: string, state?: VariableTextState) => {
      const counter = state?.counter ?? 1;
      if (format) {
        // Format like "000000" means pad to that many digits
        const padLength = format.replace(/[^0]/g, '').length || format.length;
        return counter.toString().padStart(padLength, '0');
      }
      return counter.toString();
    }
  },
  
  Date: {
    name: 'Date',
    defaultFormat: 'YYYY-MM-DD',
    description: 'Current date',
    generator: (format?: string) => {
      const now = new Date();
      const fmt = format || 'YYYY-MM-DD';
      
      return fmt
        .replace('YYYY', now.getFullYear().toString())
        .replace('YY', now.getFullYear().toString().slice(-2))
        .replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
        .replace('M', (now.getMonth() + 1).toString())
        .replace('DD', now.getDate().toString().padStart(2, '0'))
        .replace('D', now.getDate().toString());
    }
  },
  
  Time: {
    name: 'Time',
    defaultFormat: 'HH:mm:ss',
    description: 'Current time',
    generator: (format?: string) => {
      const now = new Date();
      const fmt = format || 'HH:mm:ss';
      
      return fmt
        .replace('HH', now.getHours().toString().padStart(2, '0'))
        .replace('H', now.getHours().toString())
        .replace('mm', now.getMinutes().toString().padStart(2, '0'))
        .replace('m', now.getMinutes().toString())
        .replace('ss', now.getSeconds().toString().padStart(2, '0'))
        .replace('s', now.getSeconds().toString());
    }
  },
  
  DateTime: {
    name: 'DateTime',
    defaultFormat: 'YYYY-MM-DD HH:mm:ss',
    description: 'Current date and time',
    generator: (format?: string) => {
      const now = new Date();
      const fmt = format || 'YYYY-MM-DD HH:mm:ss';
      
      return fmt
        .replace('YYYY', now.getFullYear().toString())
        .replace('YY', now.getFullYear().toString().slice(-2))
        .replace('MM', (now.getMonth() + 1).toString().padStart(2, '0'))
        .replace('M', (now.getMonth() + 1).toString())
        .replace('DD', now.getDate().toString().padStart(2, '0'))
        .replace('D', now.getDate().toString())
        .replace('HH', now.getHours().toString().padStart(2, '0'))
        .replace('H', now.getHours().toString())
        .replace('mm', now.getMinutes().toString().padStart(2, '0'))
        .replace('m', now.getMinutes().toString())
        .replace('ss', now.getSeconds().toString().padStart(2, '0'))
        .replace('s', now.getSeconds().toString());
    }
  },
  
  Filename: {
    name: 'Filename',
    defaultFormat: '',
    description: 'Current project filename',
    generator: (format?: string, state?: VariableTextState) => {
      return state?.filename || 'untitled';
    }
  },
  
  Year: {
    name: 'Year',
    defaultFormat: 'YYYY',
    description: 'Current year',
    generator: (format?: string) => {
      const now = new Date();
      const fmt = format || 'YYYY';
      
      if (fmt === 'YY') {
        return now.getFullYear().toString().slice(-2);
      }
      return now.getFullYear().toString();
    }
  },
  
  Month: {
    name: 'Month',
    defaultFormat: 'MM',
    description: 'Current month',
    generator: (format?: string) => {
      const now = new Date();
      const month = now.getMonth() + 1;
      
      if (format === 'M') {
        return month.toString();
      }
      return month.toString().padStart(2, '0');
    }
  },
  
  Day: {
    name: 'Day',
    defaultFormat: 'DD',
    description: 'Current day',
    generator: (format?: string) => {
      const now = new Date();
      const day = now.getDate();
      
      if (format === 'D') {
        return day.toString();
      }
      return day.toString().padStart(2, '0');
    }
  }
};

/**
 * Get preview of variable text
 */
export function getVariableTextPreview(
  text: string,
  state: VariableTextState
): string {
  return processVariableText(text, state);
}

/**
 * Increment counter and return new state
 */
export function incrementCounter(state: VariableTextState): VariableTextState {
  return {
    ...state,
    counter: state.counter + state.counterStep
  };
}

/**
 * Reset counter to start value
 */
export function resetCounter(state: VariableTextState): VariableTextState {
  return {
    ...state,
    counter: state.counterStart
  };
}

/**
 * Format examples for each variable
 */
export const VARIABLE_EXAMPLES: Record<string, string[]> = {
  Counter: [
    '${Counter}',
    '${Counter:000000}',
    '${Counter:0000}',
    'S/N ${Counter:000000}'
  ],
  Date: [
    '${Date}',
    '${Date:YYYY-MM-DD}',
    '${Date:MM/DD/YYYY}',
    '${Date:DD.MM.YYYY}'
  ],
  Time: [
    '${Time}',
    '${Time:HH:mm:ss}',
    '${Time:HH:mm}',
    '${Time:HH.mm.ss}'
  ],
  DateTime: [
    '${DateTime}',
    '${DateTime:YYYY-MM-DD HH:mm}',
    '${DateTime:MM/DD/YY HH:mm}'
  ],
  Combined: [
    'Serial: ${Counter:000000} Date: ${Date}',
    '${Filename} - ${Counter} - ${Date:YYYY-MM-DD}',
    'Part ${Counter:0000} Lot ${Date:YYYYMMDD}',
    '${Date:YYYY}-${Counter:00000}'
  ]
};

/**
 * Parse variable text and extract variable references
 * Used by tests to validate variable text handling
 */
export function parseVariableText(text: string): string[] {
  if (!text) return [];
  
  const variablePattern = /\$\{([^:}]+)(?::([^}]+))?\}/g;
  const variables: string[] = [];
  let match;
  
  while ((match = variablePattern.exec(text)) !== null) {
    variables.push(match[1]);
  }
  
  return variables;
}

/**
 * Evaluate a single variable with format
 * Used by tests to validate individual variable evaluation
 */
export function evaluateVariable(varName: string, format?: string, counter?: number): string {
  const variable = VARIABLES[varName as keyof typeof VARIABLES];
  if (!variable) {
    return `\${${varName}}`;
  }
  
  const state: VariableTextState = {
    counter: counter || 1,
    counterStart: 1,
    counterStep: 1,
    filename: 'untitled'
  };
  
  try {
    return variable.generator(format, state);
  } catch (e) {
    // Return safe fallback on error
    return `\${${varName}}`;
  }
}

/**
 * Generate serial number string
 * Used for serialization features and tests
 */
export function generateSerialNumber(
  prefix: string,
  number: number,
  increment: number,
  suffix: string,
  format: 'numeric' | 'alphanumeric' | 'custom'
): string {
  // Handle negative numbers
  const safeNumber = Math.abs(number);
  
  let numberStr: string;
  
  switch (format) {
    case 'numeric':
      numberStr = safeNumber.toString();
      break;
    case 'alphanumeric':
      // Convert to base-36 (0-9, A-Z)
      numberStr = safeNumber.toString(36).toUpperCase();
      break;
    case 'custom':
    default:
      numberStr = safeNumber.toString();
      break;
  }
  
  return `${prefix}${numberStr}${suffix}`;
}
