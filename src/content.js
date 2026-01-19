/**
 * Ripliel Content Script
 * Designed by Matthew Fala
 *
 * Creates visual anchors to help readers track lines of text.
 */

(function() {
  'use strict';

  // Configuration defaults
  const DEFAULT_CONFIG = {
    enabled: true,
    sentenceInterval: 3, // Anchors every X sentences
    useSerifFont: true
  };

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

  let config = { ...DEFAULT_CONFIG };
  let processedElements = new WeakSet();
  let anchorContainer = null;
  let resizeTimeout = null;

  /**
   * Simple hash function for consistent anchor generation
   * @param {string} str - String to hash
   * @returns {number} - Hash value
   */
  function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
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
    // Match sentences ending with . ! or ? followed by space or end of string
    const sentences = text.match(/[^.!?]*[.!?]+[\s]*/g) || [text];
    return sentences.filter(s => s.trim().length > 0);
  }

  /**
   * Create SVG anchor element
   * @param {string} pattern - Pattern type
   * @param {string} color - Color
   * @param {number} width - Width in pixels
   * @returns {SVGElement} - SVG element
   */
  function createAnchorSVG(pattern, color, width) {
    const height = 6;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.display = 'block';
    svg.style.pointerEvents = 'none';

    switch (pattern) {
      case 'dots':
        for (let x = 3; x < width; x += 8) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', x);
          circle.setAttribute('cy', 3);
          circle.setAttribute('r', 2);
          circle.setAttribute('fill', color);
          svg.appendChild(circle);
        }
        break;

      case 'dashes':
        for (let x = 0; x < width; x += 10) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', x);
          rect.setAttribute('y', 2);
          rect.setAttribute('width', 6);
          rect.setAttribute('height', 2);
          rect.setAttribute('fill', color);
          svg.appendChild(rect);
        }
        break;

      case 'triangles':
        for (let x = 0; x < width; x += 10) {
          const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          polygon.setAttribute('points', `${x},5 ${x + 4},1 ${x + 8},5`);
          polygon.setAttribute('fill', color);
          svg.appendChild(polygon);
        }
        break;

      case 'waves':
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let d = `M 0 3`;
        for (let x = 0; x < width; x += 8) {
          d += ` Q ${x + 2} 0, ${x + 4} 3 Q ${x + 6} 6, ${x + 8} 3`;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
        break;

      case 'squares':
        for (let x = 1; x < width; x += 8) {
          const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rect.setAttribute('x', x);
          rect.setAttribute('y', 1);
          rect.setAttribute('width', 4);
          rect.setAttribute('height', 4);
          rect.setAttribute('fill', color);
          svg.appendChild(rect);
        }
        break;

      case 'diamonds':
        for (let x = 0; x < width; x += 10) {
          const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          polygon.setAttribute('points', `${x + 4},0 ${x + 8},3 ${x + 4},6 ${x},3`);
          polygon.setAttribute('fill', color);
          svg.appendChild(polygon);
        }
        break;
    }

    return svg;
  }

  /**
   * Create anchor element for a line
   * @param {DOMRect} rect - Bounding rectangle of the line
   * @param {string} content - Text content for hash
   * @param {string} position - 'start', 'middle', or 'end'
   * @returns {HTMLElement} - Anchor element
   */
  function createAnchor(rect, content, position) {
    const style = getAnchorStyle(content);
    const anchorWidth = Math.min(rect.width * 0.15, 60); // Max 60px, or 15% of line width

    const anchor = document.createElement('div');
    anchor.className = 'ripliel-anchor';
    anchor.dataset.position = position;

    let left;
    switch (position) {
      case 'start':
        left = rect.left;
        break;
      case 'middle':
        left = rect.left + (rect.width - anchorWidth) / 2;
        break;
      case 'end':
        left = rect.right - anchorWidth;
        break;
    }

    anchor.style.cssText = `
      position: absolute;
      left: ${left + window.scrollX}px;
      top: ${rect.bottom + window.scrollY}px;
      width: ${anchorWidth}px;
      height: 6px;
      opacity: 0;
      transition: opacity 0.3s ease-in;
      z-index: 9999;
      pointer-events: none;
    `;

    const svg = createAnchorSVG(style.pattern, style.color, anchorWidth);
    anchor.appendChild(svg);

    return anchor;
  }

  /**
   * Get line rectangles for a text node
   * @param {Text} textNode - Text node
   * @returns {DOMRect[]} - Array of line rectangles
   */
  function getLineRects(textNode) {
    const range = document.createRange();
    range.selectNodeContents(textNode);
    const rects = Array.from(range.getClientRects());

    // Merge rects that are on the same line (similar top position)
    const lineRects = [];
    let currentLine = null;

    for (const rect of rects) {
      if (rect.width === 0 || rect.height === 0) continue;

      if (!currentLine || Math.abs(rect.top - currentLine.top) > 5) {
        if (currentLine) lineRects.push(currentLine);
        currentLine = {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height
        };
      } else {
        currentLine.left = Math.min(currentLine.left, rect.left);
        currentLine.right = Math.max(currentLine.right, rect.right);
        currentLine.width = currentLine.right - currentLine.left;
      }
    }

    if (currentLine) lineRects.push(currentLine);

    return lineRects;
  }

  /**
   * Process a text container and add anchors
   * @param {Element} element - Container element
   */
  function processTextElement(element) {
    if (processedElements.has(element)) return;

    // Skip elements that shouldn't be processed
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG'];
    if (skipTags.includes(element.tagName)) return;

    // Skip editable elements
    if (element.isContentEditable) return;

    const text = element.textContent.trim();
    if (text.length < 20) return; // Skip short text

    const sentences = splitIntoSentences(text);
    if (sentences.length < config.sentenceInterval) return;

    processedElements.add(element);

    // Find text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          if (node.textContent.trim().length > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_REJECT;
        }
      }
    );

    let sentenceCount = 0;
    let textContent = '';
    const textNodes = [];

    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    for (const textNode of textNodes) {
      const nodeText = textNode.textContent;
      textContent += nodeText;

      const nodeSentences = splitIntoSentences(nodeText);

      for (const sentence of nodeSentences) {
        sentenceCount++;

        if (sentenceCount % config.sentenceInterval === 0) {
          // This is an anchor sentence
          const lineRects = getLineRects(textNode);

          if (lineRects.length > 0) {
            // Use the first line rect for anchoring
            const rect = lineRects[0];
            const anchorContent = sentence.trim();

            // Create three anchors: start, middle, end
            const startAnchor = createAnchor(rect, anchorContent + '-start', 'start');
            const middleAnchor = createAnchor(rect, anchorContent + '-middle', 'middle');
            const endAnchor = createAnchor(rect, anchorContent + '-end', 'end');

            anchorContainer.appendChild(startAnchor);
            anchorContainer.appendChild(middleAnchor);
            anchorContainer.appendChild(endAnchor);

            // Fade in anchors
            requestAnimationFrame(() => {
              startAnchor.style.opacity = '1';
              middleAnchor.style.opacity = '1';
              endAnchor.style.opacity = '1';
            });
          }
        }
      }
    }
  }

  /**
   * Find and process all text containers
   */
  function processPage() {
    console.log('[Ripliel] Processing page...');

    // Remove existing anchors
    if (anchorContainer) {
      anchorContainer.innerHTML = '';
    } else {
      anchorContainer = document.createElement('div');
      anchorContainer.id = 'ripliel-anchor-container';
      anchorContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
      `;
      document.body.appendChild(anchorContainer);
    }

    processedElements = new WeakSet();

    // Apply serif font if enabled
    if (config.useSerifFont) {
      document.body.classList.add('ripliel-serif');
    } else {
      document.body.classList.remove('ripliel-serif');
    }

    // Find main content containers
    const selectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post',
      '.article',
      '.entry-content',
      '.post-content',
      'p'
    ];

    const elements = new Set();

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(el => {
        // For paragraphs, add directly; for containers, find paragraphs inside
        if (el.tagName === 'P') {
          elements.add(el);
        } else {
          el.querySelectorAll('p').forEach(p => elements.add(p));
        }
      });
    }

    // If no semantic elements found, process all paragraphs
    if (elements.size === 0) {
      document.querySelectorAll('p').forEach(p => elements.add(p));
    }

    // Process elements asynchronously to not block rendering
    const elementArray = Array.from(elements);
    let index = 0;

    function processNext() {
      const batchSize = 5;
      const end = Math.min(index + batchSize, elementArray.length);

      for (; index < end; index++) {
        processTextElement(elementArray[index]);
      }

      if (index < elementArray.length) {
        requestAnimationFrame(processNext);
      }
    }

    console.log('[Ripliel] Found', elementArray.length, 'text elements to process');

    if (elementArray.length > 0) {
      requestAnimationFrame(processNext);
    }
  }

  /**
   * Handle window resize
   */
  function handleResize() {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
      processPage();
    }, 250);
  }

  /**
   * Get the appropriate storage API
   */
  function getStorageAPI() {
    // Firefox uses browser.storage
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
      return browser.storage;
    }
    // Chrome uses chrome.storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return chrome.storage;
    }
    return null;
  }

  /**
   * Load configuration from storage
   */
  function loadConfig() {
    console.log('[Ripliel] Loading configuration...');

    const storageAPI = getStorageAPI();

    if (storageAPI) {
      try {
        // Use Promise-based API for Firefox, callback for Chrome
        const result = storageAPI.sync.get(DEFAULT_CONFIG);

        if (result && typeof result.then === 'function') {
          // Promise-based (Firefox)
          result.then((stored) => {
            config = { ...DEFAULT_CONFIG, ...stored };
            console.log('[Ripliel] Config loaded (Firefox):', config);
            if (config.enabled) {
              processPage();
            }
          }).catch((err) => {
            console.warn('[Ripliel] Storage error, using defaults:', err);
            config = { ...DEFAULT_CONFIG };
            processPage();
          });
        } else {
          // Callback-based (Chrome) - get was already called, need to call again with callback
          storageAPI.sync.get(DEFAULT_CONFIG, (stored) => {
            if (chrome.runtime.lastError) {
              console.warn('[Ripliel] Storage error:', chrome.runtime.lastError);
              config = { ...DEFAULT_CONFIG };
            } else {
              config = { ...DEFAULT_CONFIG, ...stored };
            }
            console.log('[Ripliel] Config loaded (Chrome):', config);
            if (config.enabled) {
              processPage();
            }
          });
        }
      } catch (err) {
        console.warn('[Ripliel] Storage exception, using defaults:', err);
        config = { ...DEFAULT_CONFIG };
        processPage();
      }
    } else {
      // No storage API available - use defaults and run
      console.log('[Ripliel] No storage API, using defaults');
      config = { ...DEFAULT_CONFIG };
      processPage();
    }
  }

  /**
   * Listen for configuration changes
   */
  function setupStorageListener() {
    const storageAPI = getStorageAPI();

    if (storageAPI && storageAPI.onChanged) {
      storageAPI.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
          console.log('[Ripliel] Config changed:', changes);
          for (const key in changes) {
            config[key] = changes[key].newValue;
          }

          if (config.enabled) {
            processPage();
          } else {
            // Remove anchors
            if (anchorContainer) {
              anchorContainer.innerHTML = '';
            }
            document.body.classList.remove('ripliel-serif');
          }
        }
      });
    }
  }

  /**
   * Initialize the extension
   */
  function init() {
    console.log('[Ripliel] Initializing...');
    loadConfig();
    setupStorageListener();
    window.addEventListener('resize', handleResize);

    // Re-process on dynamic content changes
    const observer = new MutationObserver((mutations) => {
      let shouldReprocess = false;

      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE &&
                !node.classList?.contains('ripliel-anchor') &&
                node.id !== 'ripliel-anchor-container') {
              shouldReprocess = true;
              break;
            }
          }
        }
        if (shouldReprocess) break;
      }

      if (shouldReprocess) {
        handleResize(); // Debounced reprocess
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for testing
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      hashString,
      getAnchorStyle,
      splitIntoSentences,
      createAnchorSVG,
      ANCHOR_PATTERNS,
      COLOR_PALETTE,
      DEFAULT_CONFIG
    };
  }
})();
