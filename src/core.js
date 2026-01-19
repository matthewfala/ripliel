/**
 * Ripliel Core Module
 * Designed by Matthew Fala
 *
 * Contains core logic for anchor generation that can be tested independently.
 */

// Anchor pattern types
const ANCHOR_PATTERNS = [
  'dots',
  'dashes',
  'triangles',
  'waves',
  'squares',
  'diamonds'
];

// Color palette - visible colors that work well as underlines
const COLOR_PALETTE = [
  '#e74c3c', // red
  '#3498db', // blue
  '#2ecc71', // green
  '#9b59b6', // purple
  '#f39c12', // orange
  '#1abc9c', // teal
  '#e91e63', // pink
  '#00bcd4', // cyan
  '#ff5722', // deep orange
  '#607d8b'  // blue grey
];

// Configuration defaults
const DEFAULT_CONFIG = {
  enabled: true,
  sentenceInterval: 3,
  useSerifFont: true
};

/**
 * Simple hash function for consistent anchor generation
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function hashString(str) {
  let hash = 0;
  if (!str || str.length === 0) return hash;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get anchor style based on content hash
 * @param {string} content - Text content to hash
 * @returns {Object} - Pattern and color
 */
function getAnchorStyle(content) {
  const hash = hashString(content);
  const patternIndex = hash % ANCHOR_PATTERNS.length;
  const colorIndex = (hash >> 4) % COLOR_PALETTE.length;

  return {
    pattern: ANCHOR_PATTERNS[patternIndex],
    color: COLOR_PALETTE[colorIndex]
  };
}

/**
 * Split text into sentences
 * @param {string} text - Text to split
 * @returns {string[]} - Array of sentences
 */
function splitIntoSentences(text) {
  if (!text || typeof text !== 'string') return [];
  // Match sentences ending with . ! or ? followed by space or end of string
  const sentences = text.match(/[^.!?]*[.!?]+[\s]*/g) || [text];
  return sentences.filter(s => s.trim().length > 0);
}

/**
 * Check if an element should be skipped for processing
 * @param {Element} element - DOM element to check
 * @returns {boolean} - True if element should be skipped
 */
function shouldSkipElement(element) {
  if (!element || !element.tagName) return true;

  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG'];
  if (skipTags.includes(element.tagName)) return true;

  if (element.isContentEditable === true || element.contentEditable === 'true') return true;

  return false;
}

/**
 * Validate configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} - Validated configuration
 */
function validateConfig(config) {
  const validated = { ...DEFAULT_CONFIG };

  if (typeof config.enabled === 'boolean') {
    validated.enabled = config.enabled;
  }

  if (typeof config.sentenceInterval === 'number') {
    validated.sentenceInterval = Math.max(1, Math.min(20, Math.floor(config.sentenceInterval)));
  }

  if (typeof config.useSerifFont === 'boolean') {
    validated.useSerifFont = config.useSerifFont;
  }

  return validated;
}

/**
 * Create SVG path for wave pattern
 * @param {number} width - Width of the anchor
 * @returns {string} - SVG path d attribute
 */
function createWavePath(width) {
  let d = 'M 0 3';
  for (let x = 0; x < width; x += 8) {
    d += ` Q ${x + 2} 0, ${x + 4} 3 Q ${x + 6} 6, ${x + 8} 3`;
  }
  return d;
}

/**
 * Calculate anchor positions for a line
 * @param {Object} rect - Bounding rectangle {left, right, width}
 * @param {number} anchorWidth - Width of each anchor
 * @returns {Object} - Positions {start, middle, end}
 */
function calculateAnchorPositions(rect, anchorWidth) {
  return {
    start: rect.left,
    middle: rect.left + (rect.width - anchorWidth) / 2,
    end: rect.right - anchorWidth
  };
}

// Export for testing and use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
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
  };
}
