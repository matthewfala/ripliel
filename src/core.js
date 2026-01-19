/**
 * Ripliel Core Module
 * Designed by Matthew Fala
 *
 * Contains core logic for anchor generation that can be tested independently.
 */

// 50+ Anchor pattern types
const ANCHOR_PATTERNS = [
  // Dots variations
  'dots-small', 'dots-medium', 'dots-large', 'dots-hollow', 'dots-alternating',
  'dots-gradient', 'dots-spaced', 'dots-dense', 'dots-double', 'dots-triple',
  // Dashes variations
  'dashes-short', 'dashes-medium', 'dashes-long', 'dashes-thick', 'dashes-thin',
  'dashes-double', 'dashes-dotted', 'dashes-spaced', 'dashes-dense', 'dashes-tapered',
  // Triangles variations
  'triangles-up', 'triangles-down', 'triangles-alternating', 'triangles-small',
  'triangles-large', 'triangles-hollow', 'triangles-filled', 'triangles-arrows',
  // Waves variations
  'waves-gentle', 'waves-steep', 'waves-double', 'waves-zigzag', 'waves-sine',
  // Squares variations
  'squares-small', 'squares-medium', 'squares-large', 'squares-hollow',
  'squares-rotated', 'squares-alternating', 'squares-checkered',
  // Diamonds variations
  'diamonds-small', 'diamonds-medium', 'diamonds-large', 'diamonds-hollow',
  'diamonds-stretched', 'diamonds-alternating',
  // Other shapes
  'crosses', 'plus-signs', 'stars', 'hearts', 'chevrons-right', 'chevrons-left',
  'brackets', 'slashes', 'backslashes', 'pipes', 'tildes', 'carets'
];

// Expanded color palette - 20 visible colors
const COLOR_PALETTE = [
  '#e74c3c', '#c0392b', // reds
  '#3498db', '#2980b9', // blues
  '#2ecc71', '#27ae60', // greens
  '#9b59b6', '#8e44ad', // purples
  '#f39c12', '#e67e22', // oranges
  '#1abc9c', '#16a085', // teals
  '#e91e63', '#c2185b', // pinks
  '#00bcd4', '#0097a7', // cyans
  '#ff5722', '#d84315', // deep oranges
  '#607d8b', '#455a64'  // blue greys
];

// Configuration defaults
const DEFAULT_CONFIG = {
  enabled: true,
  sentenceInterval: 2,
  useSerifFont: true,
  serifFont: 'petit-medieval',
  fallbackFont: 'georgia'
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
  const sentences = text.match(/[^.!?]*[.!?]+[\s]*/g) || [];
  return sentences.filter(s => s.trim().length > 0);
}

/**
 * Check if an element should be skipped for processing
 * @param {Element} element - DOM element to check
 * @returns {boolean} - True if element should be skipped
 */
function shouldSkipElement(element) {
  if (!element || !element.tagName) return true;

  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG', 'TITLE'];
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

  if (typeof config.serifFont === 'string') {
    validated.serifFont = config.serifFont;
  }

  if (typeof config.fallbackFont === 'string') {
    validated.fallbackFont = config.fallbackFont;
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
