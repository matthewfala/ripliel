/**
 * Core module tests for Ripliel
 * Designed by Matthew Fala
 */

const {
  hashString,
  getAnchorStyle,
  splitIntoSentences,
  shouldSkipElement,
  validateConfig,
  createWavePath,
  calculateAnchorPositions,
  ANCHOR_PATTERNS,
  COLOR_PALETTE,
  DEFAULT_CONFIG
} = require('../src/core.js');

describe('hashString', () => {
  test('returns 0 for empty string', () => {
    expect(hashString('')).toBe(0);
  });

  test('returns 0 for null/undefined', () => {
    expect(hashString(null)).toBe(0);
    expect(hashString(undefined)).toBe(0);
  });

  test('returns consistent hash for same input', () => {
    const input = 'Hello World';
    const hash1 = hashString(input);
    const hash2 = hashString(input);
    expect(hash1).toBe(hash2);
  });

  test('returns different hashes for different inputs', () => {
    const hash1 = hashString('Hello');
    const hash2 = hashString('World');
    expect(hash1).not.toBe(hash2);
  });

  test('returns positive numbers', () => {
    const inputs = ['test', 'another test', 'a very long string with many words'];
    inputs.forEach(input => {
      expect(hashString(input)).toBeGreaterThanOrEqual(0);
    });
  });

  test('handles special characters', () => {
    const hash = hashString('Hello! How are you? Fine.');
    expect(typeof hash).toBe('number');
    expect(hash).toBeGreaterThanOrEqual(0);
  });
});

describe('getAnchorStyle', () => {
  test('returns valid pattern and color', () => {
    const style = getAnchorStyle('test content');
    expect(ANCHOR_PATTERNS).toContain(style.pattern);
    expect(COLOR_PALETTE).toContain(style.color);
  });

  test('returns consistent style for same content', () => {
    const content = 'This is a test sentence.';
    const style1 = getAnchorStyle(content);
    const style2 = getAnchorStyle(content);
    expect(style1.pattern).toBe(style2.pattern);
    expect(style1.color).toBe(style2.color);
  });

  test('returns different styles for different content', () => {
    const style1 = getAnchorStyle('First sentence about cats.');
    const style2 = getAnchorStyle('Second sentence about dogs.');
    // At least one should be different (pattern or color)
    const isDifferent = style1.pattern !== style2.pattern || style1.color !== style2.color;
    expect(isDifferent).toBe(true);
  });

  test('handles empty content', () => {
    const style = getAnchorStyle('');
    expect(ANCHOR_PATTERNS).toContain(style.pattern);
    expect(COLOR_PALETTE).toContain(style.color);
  });
});

describe('splitIntoSentences', () => {
  test('splits text by periods', () => {
    const text = 'First sentence. Second sentence. Third sentence.';
    const sentences = splitIntoSentences(text);
    expect(sentences).toHaveLength(3);
  });

  test('splits text by question marks', () => {
    const text = 'What is this? Is it working? Yes it is.';
    const sentences = splitIntoSentences(text);
    expect(sentences).toHaveLength(3);
  });

  test('splits text by exclamation marks', () => {
    const text = 'Hello! How exciting! Great news.';
    const sentences = splitIntoSentences(text);
    expect(sentences).toHaveLength(3);
  });

  test('handles mixed punctuation', () => {
    const text = 'Is this a test? Yes it is! That is great.';
    const sentences = splitIntoSentences(text);
    expect(sentences).toHaveLength(3);
  });

  test('returns empty array for empty string', () => {
    expect(splitIntoSentences('')).toEqual([]);
  });

  test('returns empty array for null/undefined', () => {
    expect(splitIntoSentences(null)).toEqual([]);
    expect(splitIntoSentences(undefined)).toEqual([]);
  });

  test('filters out empty sentences', () => {
    const text = 'First.   Second.';
    const sentences = splitIntoSentences(text);
    sentences.forEach(s => {
      expect(s.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('shouldSkipElement', () => {
  test('returns true for null element', () => {
    expect(shouldSkipElement(null)).toBe(true);
  });

  test('returns true for element without tagName', () => {
    expect(shouldSkipElement({})).toBe(true);
  });

  test('returns true for SCRIPT elements', () => {
    const el = document.createElement('script');
    expect(shouldSkipElement(el)).toBe(true);
  });

  test('returns true for STYLE elements', () => {
    const el = document.createElement('style');
    expect(shouldSkipElement(el)).toBe(true);
  });

  test('returns true for TEXTAREA elements', () => {
    const el = document.createElement('textarea');
    expect(shouldSkipElement(el)).toBe(true);
  });

  test('returns true for INPUT elements', () => {
    const el = document.createElement('input');
    expect(shouldSkipElement(el)).toBe(true);
  });

  test('returns true for CODE elements', () => {
    const el = document.createElement('code');
    expect(shouldSkipElement(el)).toBe(true);
  });

  test('returns true for PRE elements', () => {
    const el = document.createElement('pre');
    expect(shouldSkipElement(el)).toBe(true);
  });

  test('returns true for TITLE elements', () => {
    const el = document.createElement('title');
    expect(shouldSkipElement(el)).toBe(true);
  });

  test('returns true for contentEditable elements', () => {
    const el = document.createElement('div');
    el.contentEditable = 'true';
    expect(shouldSkipElement(el)).toBe(true);
  });

  test('returns false for P elements', () => {
    const el = document.createElement('p');
    expect(shouldSkipElement(el)).toBe(false);
  });

  test('returns false for DIV elements', () => {
    const el = document.createElement('div');
    expect(shouldSkipElement(el)).toBe(false);
  });

  test('returns false for ARTICLE elements', () => {
    const el = document.createElement('article');
    expect(shouldSkipElement(el)).toBe(false);
  });
});

describe('validateConfig', () => {
  test('returns default config for empty object', () => {
    const config = validateConfig({});
    expect(config.enabled).toBe(DEFAULT_CONFIG.enabled);
    expect(config.sentenceInterval).toBe(DEFAULT_CONFIG.sentenceInterval);
    expect(config.useSerifFont).toBe(DEFAULT_CONFIG.useSerifFont);
    expect(config.serifFont).toBe(DEFAULT_CONFIG.serifFont);
  });

  test('validates enabled boolean', () => {
    expect(validateConfig({ enabled: false }).enabled).toBe(false);
    expect(validateConfig({ enabled: true }).enabled).toBe(true);
    expect(validateConfig({ enabled: 'invalid' }).enabled).toBe(true); // default
  });

  test('validates sentenceInterval range', () => {
    expect(validateConfig({ sentenceInterval: 5 }).sentenceInterval).toBe(5);
    expect(validateConfig({ sentenceInterval: 0 }).sentenceInterval).toBe(1); // min
    expect(validateConfig({ sentenceInterval: -5 }).sentenceInterval).toBe(1); // min
    expect(validateConfig({ sentenceInterval: 25 }).sentenceInterval).toBe(20); // max
    expect(validateConfig({ sentenceInterval: 10.5 }).sentenceInterval).toBe(10); // floor
  });

  test('validates useSerifFont boolean', () => {
    expect(validateConfig({ useSerifFont: false }).useSerifFont).toBe(false);
    expect(validateConfig({ useSerifFont: true }).useSerifFont).toBe(true);
    expect(validateConfig({ useSerifFont: 'yes' }).useSerifFont).toBe(true); // default
  });

  test('validates serifFont string', () => {
    expect(validateConfig({ serifFont: 'georgia' }).serifFont).toBe('georgia');
    expect(validateConfig({ serifFont: 'times' }).serifFont).toBe('times');
    expect(validateConfig({}).serifFont).toBe('petit-medieval'); // default
  });
});

describe('createWavePath', () => {
  test('starts at M 0 3', () => {
    const path = createWavePath(50);
    expect(path.startsWith('M 0 3')).toBe(true);
  });

  test('contains Q commands for curves', () => {
    const path = createWavePath(50);
    expect(path).toContain('Q');
  });

  test('handles small width', () => {
    const path = createWavePath(8);
    expect(path).toBeTruthy();
  });

  test('handles large width', () => {
    const path = createWavePath(500);
    expect(path).toBeTruthy();
    // Should have multiple Q commands for large width
    const qCount = (path.match(/Q/g) || []).length;
    expect(qCount).toBeGreaterThan(10);
  });
});

describe('calculateAnchorPositions', () => {
  test('calculates correct positions', () => {
    const rect = { left: 100, right: 600, width: 500 };
    const anchorWidth = 50;
    const positions = calculateAnchorPositions(rect, anchorWidth);

    expect(positions.start).toBe(100);
    expect(positions.middle).toBe(325); // 100 + (500 - 50) / 2
    expect(positions.end).toBe(550); // 600 - 50
  });

  test('handles narrow lines', () => {
    const rect = { left: 0, right: 100, width: 100 };
    const anchorWidth = 30;
    const positions = calculateAnchorPositions(rect, anchorWidth);

    expect(positions.start).toBe(0);
    expect(positions.middle).toBe(35);
    expect(positions.end).toBe(70);
  });

  test('handles edge case where anchor is same width as line', () => {
    const rect = { left: 50, right: 150, width: 100 };
    const anchorWidth = 100;
    const positions = calculateAnchorPositions(rect, anchorWidth);

    expect(positions.start).toBe(50);
    expect(positions.middle).toBe(50);
    expect(positions.end).toBe(50);
  });
});

describe('Constants', () => {
  test('ANCHOR_PATTERNS has at least 50 patterns', () => {
    expect(ANCHOR_PATTERNS.length).toBeGreaterThanOrEqual(50);
  });

  test('ANCHOR_PATTERNS includes expected base patterns', () => {
    const basePatterns = ['dots', 'dashes', 'triangles', 'waves', 'squares', 'diamonds'];
    basePatterns.forEach(base => {
      const hasPattern = ANCHOR_PATTERNS.some(p => p.startsWith(base));
      expect(hasPattern).toBe(true);
    });
  });

  test('ANCHOR_PATTERNS includes additional shapes', () => {
    expect(ANCHOR_PATTERNS).toContain('crosses');
    expect(ANCHOR_PATTERNS).toContain('stars');
    expect(ANCHOR_PATTERNS).toContain('hearts');
  });

  test('COLOR_PALETTE has valid hex colors', () => {
    const hexColorRegex = /^#[0-9a-f]{6}$/i;
    COLOR_PALETTE.forEach(color => {
      expect(color).toMatch(hexColorRegex);
    });
    expect(COLOR_PALETTE.length).toBe(20);
  });

  test('DEFAULT_CONFIG has expected values', () => {
    expect(DEFAULT_CONFIG.enabled).toBe(true);
    expect(DEFAULT_CONFIG.sentenceInterval).toBe(3);
    expect(DEFAULT_CONFIG.useSerifFont).toBe(true);
    expect(DEFAULT_CONFIG.serifFont).toBe('petit-medieval');
  });
});
