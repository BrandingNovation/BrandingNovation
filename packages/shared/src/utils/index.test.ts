import { describe, it, expect } from 'vitest';

import {
  slugify,
  truncate,
  capitalize,
  formatBytes,
  isValidEmail,
  generateId,
  validateWorkflowConnections,
  getWorkflowExecutionOrder,
} from './index.js';

describe('utils', () => {
  it('slugify converts text to slug', () => {
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('   Multiple   Spaces   ')).toBe('multiple-spaces');
  });

  it('truncate shortens strings correctly', () => {
    expect(truncate('abcdefghij', 5)).toBe('ab...');
    expect(truncate('short', 10)).toBe('short');
  });

  it('capitalize capitalizes the first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('formatBytes formats bytes into human-readable strings', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('isValidEmail validates e-mail addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('generateId creates unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('validateWorkflowConnections detects invalid or cyclic graphs', () => {
    const nodes = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
    ];

    const validConnections = [
      { sourceNodeId: 'a', targetNodeId: 'b' },
      { sourceNodeId: 'b', targetNodeId: 'c' },
    ];

    expect(validateWorkflowConnections(nodes as any[], validConnections as any[])).toBe(true);

    const invalidConnections = [
      { sourceNodeId: 'a', targetNodeId: 'x' }, // target doesn\'t exist
    ];
    expect(validateWorkflowConnections(nodes as any[], invalidConnections as any[])).toBe(false);

    const cyclic = [
      { sourceNodeId: 'a', targetNodeId: 'b' },
      { sourceNodeId: 'b', targetNodeId: 'a' },
    ];
    expect(validateWorkflowConnections(nodes as any[], cyclic as any[])).toBe(false);
  });

  it('getWorkflowExecutionOrder returns topological order', () => {
    const nodes = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
    ];
    const connections = [
      { sourceNodeId: '1', targetNodeId: '2' },
      { sourceNodeId: '2', targetNodeId: '3' },
    ];
    const order = getWorkflowExecutionOrder(nodes as any[], connections as any[]);
    expect(order).toEqual(['1', '2', '3']);
  });
});