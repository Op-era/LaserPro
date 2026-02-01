/**
 * Test suite for LightBurn-style variable text system
 * Enhanced Phase 1 of 10 from ROADMAP-v0.2.0.md
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  processVariableText,
  extractVariables,
  hasVariables,
  incrementCounter,
  resetCounter,
  VARIABLES,
  VariableTextState
} from '../utils/variableText';

describe('Variable Text - LightBurn Style', () => {
  let state: VariableTextState;

  beforeEach(() => {
    state = {
      counter: 1,
      counterStart: 1,
      counterStep: 1,
      filename: 'test-project'
    };
  });

  describe('Counter Variable', () => {
    it('processes simple counter', () => {
      const result = processVariableText('${Counter}', state);
      expect(result).toBe('1');
    });

    it('processes counter with padding format', () => {
      const result = processVariableText('${Counter:000000}', state);
      expect(result).toBe('000001');
    });

    it('processes counter with different padding', () => {
      state.counter = 42;
      const result = processVariableText('${Counter:0000}', state);
      expect(result).toBe('0042');
    });

    it('increments counter correctly', () => {
      const newState = incrementCounter(state);
      expect(newState.counter).toBe(2);
      
      const result = processVariableText('${Counter:000}', newState);
      expect(result).toBe('002');
    });

    it('resets counter to start value', () => {
      state.counter = 100;
      state.counterStart = 1;
      
      const newState = resetCounter(state);
      expect(newState.counter).toBe(1);
    });

    it('handles custom counter step', () => {
      state.counterStep = 5;
      let currentState = state;
      
      currentState = incrementCounter(currentState);
      expect(currentState.counter).toBe(6);
      
      currentState = incrementCounter(currentState);
      expect(currentState.counter).toBe(11);
    });
  });

  describe('Date Variable', () => {
    it('processes date with default format', () => {
      const result = processVariableText('${Date}', state);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('processes date with YYYY-MM-DD format', () => {
      const result = processVariableText('${Date:YYYY-MM-DD}', state);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('processes date with MM/DD/YYYY format', () => {
      const result = processVariableText('${Date:MM/DD/YYYY}', state);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('processes date with DD.MM.YYYY format', () => {
      const result = processVariableText('${Date:DD.MM.YYYY}', state);
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    it('processes short year format', () => {
      const result = processVariableText('${Date:YY-MM-DD}', state);
      expect(result).toMatch(/\d{2}-\d{2}-\d{2}/);
    });
  });

  describe('Time Variable', () => {
    it('processes time with default format', () => {
      const result = processVariableText('${Time}', state);
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    it('processes time with HH:mm format', () => {
      const result = processVariableText('${Time:HH:mm}', state);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('processes time with custom separator', () => {
      const result = processVariableText('${Time:HH.mm.ss}', state);
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{2}/);
    });
  });

  describe('DateTime Variable', () => {
    it('processes datetime with default format', () => {
      const result = processVariableText('${DateTime}', state);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
    });

    it('processes datetime with custom format', () => {
      const result = processVariableText('${DateTime:YYYY-MM-DD HH:mm}', state);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
    });
  });

  describe('Filename Variable', () => {
    it('processes filename variable', () => {
      const result = processVariableText('${Filename}', state);
      expect(result).toBe('test-project');
    });

    it('uses default when filename not set', () => {
      state.filename = '';
      const result = processVariableText('${Filename}', state);
      expect(result).toBe('untitled');
    });
  });

  describe('Year, Month, Day Variables', () => {
    it('processes year variable', () => {
      const result = processVariableText('${Year}', state);
      expect(result).toMatch(/\d{4}/);
    });

    it('processes month variable', () => {
      const result = processVariableText('${Month}', state);
      expect(result).toMatch(/\d{2}/);
    });

    it('processes day variable', () => {
      const result = processVariableText('${Day}', state);
      expect(result).toMatch(/\d{2}/);
    });
  });

  describe('Multiple Variables', () => {
    it('processes multiple variables in one string', () => {
      const text = 'Serial: ${Counter:000000} Date: ${Date}';
      const result = processVariableText(text, state);
      
      expect(result).toContain('Serial: 000001');
      expect(result).toContain('Date:');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('processes complex multi-variable text', () => {
      state.counter = 42;
      const text = '${Filename} - Part ${Counter:0000} - ${Date:YYYY-MM-DD} ${Time:HH:mm}';
      const result = processVariableText(text, state);
      
      expect(result).toContain('test-project');
      expect(result).toContain('Part 0042');
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('handles mixed variables and text', () => {
      const text = 'Batch ${Date:YYYYMMDD}-${Counter:000}';
      const result = processVariableText(text, state);
      
      expect(result).toContain('Batch');
      expect(result).toContain('-001');
      expect(result).toMatch(/\d{8}/);
    });
  });

  describe('Variable Detection', () => {
    it('detects if text has variables', () => {
      expect(hasVariables('Plain text')).toBe(false);
      expect(hasVariables('Text with ${Counter}')).toBe(true);
      expect(hasVariables('${Date} and ${Time}')).toBe(true);
    });

    it('extracts variable names from text', () => {
      const text = 'Serial: ${Counter} Date: ${Date} Time: ${Time}';
      const variables = extractVariables(text);
      
      expect(variables).toContain('Counter');
      expect(variables).toContain('Date');
      expect(variables).toContain('Time');
      expect(variables.length).toBe(3);
    });

    it('extracts unique variable names', () => {
      const text = '${Counter} and ${Counter:0000} and ${Counter}';
      const variables = extractVariables(text);
      
      expect(variables).toEqual(['Counter']);
      expect(variables.length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles text without variables', () => {
      const result = processVariableText('Plain text', state);
      expect(result).toBe('Plain text');
    });

    it('handles empty text', () => {
      const result = processVariableText('', state);
      expect(result).toBe('');
    });

    it('handles unknown variables', () => {
      const text = 'Unknown ${UnknownVar} variable';
      const result = processVariableText(text, state);
      expect(result).toBe('Unknown ${UnknownVar} variable');
    });

    it('handles malformed variables', () => {
      const text = 'Bad ${Counter variable';
      const result = processVariableText(text, state);
      expect(result).toBe('Bad ${Counter variable');
    });

    it('handles large counter values', () => {
      state.counter = 999999;
      const result = processVariableText('${Counter:000000}', state);
      expect(result).toBe('999999');
    });

    it('handles counter exceeding padding', () => {
      state.counter = 12345;
      const result = processVariableText('${Counter:000}', state);
      expect(result).toBe('12345'); // Doesn't truncate
    });
  });

  describe('LightBurn Compatibility', () => {
    it('matches LightBurn counter format', () => {
      // LightBurn uses ${Counter:000000} format
      state.counter = 42;
      const result = processVariableText('S/N ${Counter:000000}', state);
      expect(result).toBe('S/N 000042');
    });

    it('matches LightBurn date format', () => {
      // LightBurn supports YYYY-MM-DD
      const result = processVariableText('${Date:YYYY-MM-DD}', state);
      expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('supports LightBurn-style combined variables', () => {
      // LightBurn allows multiple variables in one text
      state.counter = 100;
      const text = 'Part ${Counter:0000} Lot ${Date:YYYYMMDD}';
      const result = processVariableText(text, state);
      
      expect(result).toContain('Part 0100');
      expect(result).toContain('Lot');
      expect(result).toMatch(/\d{8}/);
    });
  });
});
