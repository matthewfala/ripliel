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
    sentenceInterval: 3,
    useSerifFont: true,
    serifFont: 'petit-medieval' // 'petit-medieval', 'georgia', 'times', 'palatino', etc.
  };

  // 50+ Anchor pattern types - combinations of shapes, sizes, and variations
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

  let config = { ...DEFAULT_CONFIG };
  let anchorContainer = null;
  let resizeTimeout = null;
  let processedParagraphs = new WeakSet();

  /**
   * Simple hash function for consistent anchor generation
   */
  function hashString(str) {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Get anchor style based on content hash - returns SAME style for all 3 anchors on a line
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
   * Create SVG anchor element with 50+ pattern support
   */
  function createAnchorSVG(pattern, color, width) {
    const height = 6;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.display = 'block';
    svg.style.pointerEvents = 'none';

    // Parse pattern type and variation
    const [basePattern, variation] = pattern.includes('-')
      ? [pattern.split('-')[0], pattern.split('-').slice(1).join('-')]
      : [pattern, 'medium'];

    switch (basePattern) {
      case 'dots':
        createDotsPattern(svg, color, width, height, variation);
        break;
      case 'dashes':
        createDashesPattern(svg, color, width, height, variation);
        break;
      case 'triangles':
        createTrianglesPattern(svg, color, width, height, variation);
        break;
      case 'waves':
        createWavesPattern(svg, color, width, height, variation);
        break;
      case 'squares':
        createSquaresPattern(svg, color, width, height, variation);
        break;
      case 'diamonds':
        createDiamondsPattern(svg, color, width, height, variation);
        break;
      case 'crosses':
        createCrossesPattern(svg, color, width, height);
        break;
      case 'plus':
        createPlusPattern(svg, color, width, height);
        break;
      case 'stars':
        createStarsPattern(svg, color, width, height);
        break;
      case 'hearts':
        createHeartsPattern(svg, color, width, height);
        break;
      case 'chevrons':
        createChevronsPattern(svg, color, width, height, variation);
        break;
      case 'brackets':
        createBracketsPattern(svg, color, width, height);
        break;
      case 'slashes':
        createSlashesPattern(svg, color, width, height);
        break;
      case 'backslashes':
        createBackslashesPattern(svg, color, width, height);
        break;
      case 'pipes':
        createPipesPattern(svg, color, width, height);
        break;
      case 'tildes':
        createTildesPattern(svg, color, width, height);
        break;
      case 'carets':
        createCaretsPattern(svg, color, width, height);
        break;
      default:
        // Default to dots
        createDotsPattern(svg, color, width, height, 'medium');
    }

    return svg;
  }

  function createDotsPattern(svg, color, width, height, variation) {
    let radius, spacing;
    switch (variation) {
      case 'small': radius = 1; spacing = 6; break;
      case 'large': radius = 2.5; spacing = 10; break;
      case 'hollow': radius = 2; spacing = 8; break;
      case 'alternating': radius = 1.5; spacing = 6; break;
      case 'gradient': radius = 2; spacing = 8; break;
      case 'spaced': radius = 1.5; spacing = 12; break;
      case 'dense': radius = 1; spacing = 4; break;
      case 'double': radius = 1; spacing = 10; break;
      case 'triple': radius = 1; spacing = 12; break;
      default: radius = 1.5; spacing = 8; // medium
    }

    for (let x = spacing / 2; x < width; x += spacing) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', height / 2);
      circle.setAttribute('r', radius);

      if (variation === 'hollow') {
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke', color);
        circle.setAttribute('stroke-width', '1');
      } else if (variation === 'alternating') {
        circle.setAttribute('r', (Math.floor(x / spacing) % 2 === 0) ? radius : radius * 0.6);
        circle.setAttribute('fill', color);
      } else if (variation === 'double') {
        circle.setAttribute('fill', color);
        const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle2.setAttribute('cx', x + 3);
        circle2.setAttribute('cy', height / 2);
        circle2.setAttribute('r', radius);
        circle2.setAttribute('fill', color);
        svg.appendChild(circle2);
      } else if (variation === 'triple') {
        circle.setAttribute('fill', color);
        for (let i = 1; i <= 2; i++) {
          const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          c.setAttribute('cx', x + i * 2.5);
          c.setAttribute('cy', height / 2);
          c.setAttribute('r', radius);
          c.setAttribute('fill', color);
          svg.appendChild(c);
        }
      } else {
        circle.setAttribute('fill', color);
      }
      svg.appendChild(circle);
    }
  }

  function createDashesPattern(svg, color, width, height, variation) {
    let dashWidth, dashHeight, spacing;
    switch (variation) {
      case 'short': dashWidth = 4; dashHeight = 2; spacing = 8; break;
      case 'long': dashWidth = 10; dashHeight = 2; spacing = 14; break;
      case 'thick': dashWidth = 6; dashHeight = 3; spacing = 10; break;
      case 'thin': dashWidth = 6; dashHeight = 1; spacing = 10; break;
      case 'double': dashWidth = 5; dashHeight = 1; spacing = 10; break;
      case 'dotted': dashWidth = 2; dashHeight = 2; spacing = 5; break;
      case 'spaced': dashWidth = 6; dashHeight = 2; spacing = 14; break;
      case 'dense': dashWidth = 4; dashHeight = 2; spacing = 6; break;
      case 'tapered': dashWidth = 8; dashHeight = 2; spacing = 12; break;
      default: dashWidth = 6; dashHeight = 2; spacing = 10;
    }

    for (let x = 0; x < width; x += spacing) {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', (height - dashHeight) / 2);
      rect.setAttribute('width', Math.min(dashWidth, width - x));
      rect.setAttribute('height', dashHeight);
      rect.setAttribute('fill', color);

      if (variation === 'tapered') {
        rect.setAttribute('rx', '1');
      }
      svg.appendChild(rect);

      if (variation === 'double') {
        const rect2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect2.setAttribute('x', x);
        rect2.setAttribute('y', (height - dashHeight) / 2 + 2);
        rect2.setAttribute('width', Math.min(dashWidth, width - x));
        rect2.setAttribute('height', dashHeight);
        rect2.setAttribute('fill', color);
        svg.appendChild(rect2);
      }
    }
  }

  function createTrianglesPattern(svg, color, width, height, variation) {
    let size, spacing;
    switch (variation) {
      case 'small': size = 4; spacing = 6; break;
      case 'large': size = 8; spacing = 12; break;
      case 'hollow': size = 6; spacing = 10; break;
      case 'arrows': size = 6; spacing = 10; break;
      default: size = 6; spacing = 10;
    }

    for (let x = 0; x < width; x += spacing) {
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const halfSize = size / 2;

      let points;
      if (variation === 'down' || (variation === 'alternating' && Math.floor(x / spacing) % 2 === 1)) {
        points = `${x},1 ${x + halfSize},${height - 1} ${x + size},1`;
      } else {
        points = `${x},${height - 1} ${x + halfSize},1 ${x + size},${height - 1}`;
      }

      polygon.setAttribute('points', points);

      if (variation === 'hollow') {
        polygon.setAttribute('fill', 'none');
        polygon.setAttribute('stroke', color);
        polygon.setAttribute('stroke-width', '1');
      } else {
        polygon.setAttribute('fill', color);
      }
      svg.appendChild(polygon);
    }
  }

  function createWavesPattern(svg, color, width, height, variation) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let d = `M 0 ${height / 2}`;
    let amplitude, wavelength;

    switch (variation) {
      case 'gentle': amplitude = 1.5; wavelength = 12; break;
      case 'steep': amplitude = 2.5; wavelength = 6; break;
      case 'double': amplitude = 1.5; wavelength = 8; break;
      case 'zigzag': amplitude = 2; wavelength = 8; break;
      case 'sine': amplitude = 2; wavelength = 10; break;
      default: amplitude = 2; wavelength = 8;
    }

    if (variation === 'zigzag') {
      for (let x = 0; x < width; x += wavelength) {
        d += ` L ${x + wavelength / 2} ${height / 2 - amplitude} L ${x + wavelength} ${height / 2 + amplitude}`;
      }
    } else {
      for (let x = 0; x < width; x += wavelength) {
        d += ` Q ${x + wavelength / 4} ${height / 2 - amplitude}, ${x + wavelength / 2} ${height / 2}`;
        d += ` Q ${x + wavelength * 3 / 4} ${height / 2 + amplitude}, ${x + wavelength} ${height / 2}`;
      }
    }

    path.setAttribute('d', d);
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', variation === 'double' ? '1' : '1.5');
    path.setAttribute('fill', 'none');
    svg.appendChild(path);

    if (variation === 'double') {
      const path2 = path.cloneNode();
      path2.setAttribute('transform', `translate(0, 2)`);
      svg.appendChild(path2);
    }
  }

  function createSquaresPattern(svg, color, width, height, variation) {
    let size, spacing;
    switch (variation) {
      case 'small': size = 3; spacing = 6; break;
      case 'large': size = 5; spacing = 9; break;
      case 'hollow': size = 4; spacing = 8; break;
      case 'rotated': size = 4; spacing = 8; break;
      case 'checkered': size = 3; spacing = 6; break;
      default: size = 4; spacing = 8;
    }

    for (let x = spacing / 2 - size / 2; x < width; x += spacing) {
      if (variation === 'rotated') {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const cx = x + size / 2;
        const cy = height / 2;
        const half = size / 2;
        polygon.setAttribute('points', `${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}`);
        polygon.setAttribute('fill', color);
        svg.appendChild(polygon);
      } else {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', x);
        rect.setAttribute('y', (height - size) / 2);
        rect.setAttribute('width', size);
        rect.setAttribute('height', size);

        if (variation === 'hollow') {
          rect.setAttribute('fill', 'none');
          rect.setAttribute('stroke', color);
          rect.setAttribute('stroke-width', '1');
        } else if (variation === 'alternating' || variation === 'checkered') {
          rect.setAttribute('fill', Math.floor(x / spacing) % 2 === 0 ? color : 'none');
          rect.setAttribute('stroke', color);
          rect.setAttribute('stroke-width', '0.5');
        } else {
          rect.setAttribute('fill', color);
        }
        svg.appendChild(rect);
      }
    }
  }

  function createDiamondsPattern(svg, color, width, height, variation) {
    let sizeX, sizeY, spacing;
    switch (variation) {
      case 'small': sizeX = 3; sizeY = 4; spacing = 7; break;
      case 'large': sizeX = 5; sizeY = 6; spacing = 11; break;
      case 'hollow': sizeX = 4; sizeY = 5; spacing = 9; break;
      case 'stretched': sizeX = 6; sizeY = 4; spacing = 10; break;
      default: sizeX = 4; sizeY = 5; spacing = 9;
    }

    for (let x = spacing / 2; x < width; x += spacing) {
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const cy = height / 2;
      polygon.setAttribute('points',
        `${x},${cy - sizeY / 2} ${x + sizeX / 2},${cy} ${x},${cy + sizeY / 2} ${x - sizeX / 2},${cy}`
      );

      if (variation === 'hollow') {
        polygon.setAttribute('fill', 'none');
        polygon.setAttribute('stroke', color);
        polygon.setAttribute('stroke-width', '1');
      } else if (variation === 'alternating') {
        polygon.setAttribute('fill', Math.floor(x / spacing) % 2 === 0 ? color : 'none');
        polygon.setAttribute('stroke', color);
      } else {
        polygon.setAttribute('fill', color);
      }
      svg.appendChild(polygon);
    }
  }

  function createCrossesPattern(svg, color, width, height) {
    for (let x = 4; x < width; x += 10) {
      const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line1.setAttribute('x1', x - 2);
      line1.setAttribute('y1', 1);
      line1.setAttribute('x2', x + 2);
      line1.setAttribute('y2', height - 1);
      line1.setAttribute('stroke', color);
      line1.setAttribute('stroke-width', '1.5');
      svg.appendChild(line1);

      const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line2.setAttribute('x1', x - 2);
      line2.setAttribute('y1', height - 1);
      line2.setAttribute('x2', x + 2);
      line2.setAttribute('y2', 1);
      line2.setAttribute('stroke', color);
      line2.setAttribute('stroke-width', '1.5');
      svg.appendChild(line2);
    }
  }

  function createPlusPattern(svg, color, width, height) {
    for (let x = 4; x < width; x += 10) {
      const h = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      h.setAttribute('x1', x - 2);
      h.setAttribute('y1', height / 2);
      h.setAttribute('x2', x + 2);
      h.setAttribute('y2', height / 2);
      h.setAttribute('stroke', color);
      h.setAttribute('stroke-width', '1.5');
      svg.appendChild(h);

      const v = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      v.setAttribute('x1', x);
      v.setAttribute('y1', 1);
      v.setAttribute('x2', x);
      v.setAttribute('y2', height - 1);
      v.setAttribute('stroke', color);
      v.setAttribute('stroke-width', '1.5');
      svg.appendChild(v);
    }
  }

  function createStarsPattern(svg, color, width, height) {
    for (let x = 5; x < width; x += 12) {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const cx = x, cy = height / 2, r = 2.5, ir = 1;
      let points = '';
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * Math.PI / 180;
        const innerAngle = ((i * 72) + 36 - 90) * Math.PI / 180;
        points += `${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)} `;
        points += `${cx + ir * Math.cos(innerAngle)},${cy + ir * Math.sin(innerAngle)} `;
      }
      star.setAttribute('points', points.trim());
      star.setAttribute('fill', color);
      svg.appendChild(star);
    }
  }

  function createHeartsPattern(svg, color, width, height) {
    for (let x = 5; x < width; x += 12) {
      const heart = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const size = 2;
      heart.setAttribute('d',
        `M ${x} ${height / 2 + size} ` +
        `C ${x - size * 2} ${height / 2 - size} ${x} ${height / 2 - size * 1.5} ${x} ${height / 2 - size * 0.5} ` +
        `C ${x} ${height / 2 - size * 1.5} ${x + size * 2} ${height / 2 - size} ${x} ${height / 2 + size}`
      );
      heart.setAttribute('fill', color);
      svg.appendChild(heart);
    }
  }

  function createChevronsPattern(svg, color, width, height, variation) {
    const direction = variation === 'left' ? -1 : 1;
    for (let x = 5; x < width; x += 10) {
      const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      chevron.setAttribute('points',
        `${x - direction * 2},1 ${x + direction * 2},${height / 2} ${x - direction * 2},${height - 1}`
      );
      chevron.setAttribute('fill', 'none');
      chevron.setAttribute('stroke', color);
      chevron.setAttribute('stroke-width', '1.5');
      chevron.setAttribute('stroke-linecap', 'round');
      chevron.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(chevron);
    }
  }

  function createBracketsPattern(svg, color, width, height) {
    for (let x = 3; x < width; x += 14) {
      // Opening bracket
      const open = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      open.setAttribute('points', `${x + 2},1 ${x},1 ${x},${height - 1} ${x + 2},${height - 1}`);
      open.setAttribute('fill', 'none');
      open.setAttribute('stroke', color);
      open.setAttribute('stroke-width', '1');
      svg.appendChild(open);

      // Closing bracket
      const close = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      close.setAttribute('points', `${x + 5},1 ${x + 7},1 ${x + 7},${height - 1} ${x + 5},${height - 1}`);
      close.setAttribute('fill', 'none');
      close.setAttribute('stroke', color);
      close.setAttribute('stroke-width', '1');
      svg.appendChild(close);
    }
  }

  function createSlashesPattern(svg, color, width, height) {
    for (let x = 2; x < width; x += 8) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', height - 1);
      line.setAttribute('x2', x + 4);
      line.setAttribute('y2', 1);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '1.5');
      svg.appendChild(line);
    }
  }

  function createBackslashesPattern(svg, color, width, height) {
    for (let x = 2; x < width; x += 8) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', 1);
      line.setAttribute('x2', x + 4);
      line.setAttribute('y2', height - 1);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '1.5');
      svg.appendChild(line);
    }
  }

  function createPipesPattern(svg, color, width, height) {
    for (let x = 4; x < width; x += 8) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x);
      line.setAttribute('y1', 1);
      line.setAttribute('x2', x);
      line.setAttribute('y2', height - 1);
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '1.5');
      svg.appendChild(line);
    }
  }

  function createTildesPattern(svg, color, width, height) {
    for (let x = 0; x < width; x += 12) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M ${x} ${height / 2} Q ${x + 3} ${height / 2 - 2}, ${x + 6} ${height / 2} Q ${x + 9} ${height / 2 + 2}, ${x + 12} ${height / 2}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', '1.5');
      svg.appendChild(path);
    }
  }

  function createCaretsPattern(svg, color, width, height) {
    for (let x = 4; x < width; x += 10) {
      const caret = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      caret.setAttribute('points', `${x - 3},${height - 1} ${x},1 ${x + 3},${height - 1}`);
      caret.setAttribute('fill', 'none');
      caret.setAttribute('stroke', color);
      caret.setAttribute('stroke-width', '1.5');
      caret.setAttribute('stroke-linecap', 'round');
      caret.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(caret);
    }
  }

  /**
   * Get visual line boundaries for a paragraph element
   * This properly handles inline elements like links and spans
   */
  function getVisualLines(element) {
    const lines = [];
    const range = document.createRange();

    // Get all text content and create a range for the entire element
    const text = element.textContent;
    if (!text || text.trim().length === 0) return lines;

    // Walk through the element and identify line boundaries using Range API
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    let currentLine = null;
    let lineText = '';

    while (walker.nextNode()) {
      const textNode = walker.currentNode;
      const nodeText = textNode.textContent;

      if (!nodeText || nodeText.trim().length === 0) continue;

      // Get character-by-character positions to find line breaks
      for (let i = 0; i < nodeText.length; i++) {
        range.setStart(textNode, i);
        range.setEnd(textNode, Math.min(i + 1, nodeText.length));

        const rects = range.getClientRects();
        if (rects.length === 0) continue;

        const rect = rects[0];
        if (rect.width === 0 || rect.height === 0) continue;

        // Check if this is a new line (different top position)
        if (!currentLine || Math.abs(rect.top - currentLine.top) > 3) {
          // Save previous line if it exists and has content
          if (currentLine && lineText.trim().length > 0) {
            currentLine.text = lineText.trim();
            lines.push(currentLine);
          }

          // Start new line
          currentLine = {
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            height: rect.height
          };
          lineText = nodeText[i];
        } else {
          // Same line - extend boundaries
          currentLine.left = Math.min(currentLine.left, rect.left);
          currentLine.right = Math.max(currentLine.right, rect.right);
          currentLine.bottom = Math.max(currentLine.bottom, rect.bottom);
          lineText += nodeText[i];
        }
      }
    }

    // Don't forget the last line
    if (currentLine && lineText.trim().length > 0) {
      currentLine.text = lineText.trim();
      lines.push(currentLine);
    }

    // Calculate width for each line
    lines.forEach(line => {
      line.width = line.right - line.left;
    });

    return lines;
  }

  /**
   * Split text into sentences
   */
  function splitIntoSentences(text) {
    if (!text || typeof text !== 'string') return [];
    const sentences = text.match(/[^.!?]*[.!?]+[\s]*/g) || [];
    return sentences.filter(s => s.trim().length > 0);
  }

  /**
   * Count sentences in text
   */
  function countSentences(text) {
    return splitIntoSentences(text).length;
  }

  /**
   * Create anchor element at a specific position
   */
  function createAnchor(left, top, width, style) {
    const anchor = document.createElement('div');
    anchor.className = 'ripliel-anchor';

    anchor.style.cssText = `
      position: absolute;
      left: ${left + window.scrollX}px;
      top: ${top + window.scrollY}px;
      width: ${width}px;
      height: 6px;
      opacity: 0;
      transition: opacity 0.3s ease-in;
      z-index: 9999;
      pointer-events: none;
    `;

    const svg = createAnchorSVG(style.pattern, style.color, width);
    anchor.appendChild(svg);

    return anchor;
  }

  /**
   * Process a paragraph and add anchors based on visual lines and sentence count
   */
  function processParagraph(paragraph) {
    if (processedParagraphs.has(paragraph)) return;

    // Skip certain elements
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG', 'TITLE'];
    if (skipTags.includes(paragraph.tagName)) return;
    if (paragraph.isContentEditable) return;
    if (paragraph.closest('title')) return;

    const text = paragraph.textContent.trim();
    if (text.length < 20) return;

    processedParagraphs.add(paragraph);

    // Get visual lines
    const lines = getVisualLines(paragraph);
    if (lines.length === 0) return;

    // Track cumulative sentence count across lines
    let cumulativeSentences = 0;

    for (const line of lines) {
      if (!line.text || line.width < 50) continue; // Skip very short lines

      const lineSentences = countSentences(line.text);
      const previousCount = cumulativeSentences;
      cumulativeSentences += lineSentences;

      // Check if this line crosses a sentence interval threshold
      // A line should be anchored if the cumulative count crosses an interval boundary
      const intervalsBeforeLine = Math.floor(previousCount / config.sentenceInterval);
      const intervalsAfterLine = Math.floor(cumulativeSentences / config.sentenceInterval);

      if (intervalsAfterLine > intervalsBeforeLine ||
          (lineSentences > 0 && cumulativeSentences >= config.sentenceInterval && cumulativeSentences % config.sentenceInterval === 0)) {

        // This line should have anchors - use SAME style for all 3 anchors
        const style = getAnchorStyle(line.text);
        const anchorWidth = Math.min(line.width * 0.12, 50);

        // Calculate visual start, middle, end positions
        const startLeft = line.left;
        const middleLeft = line.left + (line.width - anchorWidth) / 2;
        const endLeft = line.right - anchorWidth;
        const anchorTop = line.bottom + 1;

        // Create three anchors with the SAME style
        const startAnchor = createAnchor(startLeft, anchorTop, anchorWidth, style);
        const middleAnchor = createAnchor(middleLeft, anchorTop, anchorWidth, style);
        const endAnchor = createAnchor(endLeft, anchorTop, anchorWidth, style);

        anchorContainer.appendChild(startAnchor);
        anchorContainer.appendChild(middleAnchor);
        anchorContainer.appendChild(endAnchor);

        // Fade in
        requestAnimationFrame(() => {
          startAnchor.style.opacity = '1';
          middleAnchor.style.opacity = '1';
          endAnchor.style.opacity = '1';
        });
      }
    }
  }

  /**
   * Apply selected serif font
   */
  function applySerifFont() {
    // Remove any existing font style
    const existingStyle = document.getElementById('ripliel-font-style');
    if (existingStyle) existingStyle.remove();

    if (!config.useSerifFont) {
      document.body.classList.remove('ripliel-serif');
      return;
    }

    document.body.classList.add('ripliel-serif');

    // Create font style based on selection
    const style = document.createElement('style');
    style.id = 'ripliel-font-style';

    let fontFamily;
    switch (config.serifFont) {
      case 'petit-medieval':
        // Libre Clarendon (embedded, OFL licensed) with fallback
        fontFamily = '"Libre Clarendon", Georgia, "Times New Roman", Times, serif';
        break;
      case 'georgia':
        fontFamily = 'Georgia, "Times New Roman", Times, serif';
        break;
      case 'times':
        fontFamily = '"Times New Roman", Times, Georgia, serif';
        break;
      case 'palatino':
        fontFamily = '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif';
        break;
      case 'garamond':
        fontFamily = 'Garamond, "EB Garamond", Georgia, serif';
        break;
      case 'baskerville':
        fontFamily = 'Baskerville, "Libre Baskerville", Georgia, serif';
        break;
      default:
        fontFamily = '"Libre Clarendon", Georgia, "Times New Roman", Times, serif';
    }

    style.textContent = `
      .ripliel-serif,
      .ripliel-serif p,
      .ripliel-serif article,
      .ripliel-serif main,
      .ripliel-serif .content,
      .ripliel-serif .post,
      .ripliel-serif .entry-content,
      .ripliel-serif div,
      .ripliel-serif span,
      .ripliel-serif li {
        font-family: ${fontFamily} !important;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Process the entire page
   */
  function processPage() {
    console.log('[Ripliel] Processing page...');

    // Clear existing anchors
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
        pointer-events: none;
        z-index: 9998;
      `;
      document.body.appendChild(anchorContainer);
    }

    processedParagraphs = new WeakSet();

    // Apply serif font
    applySerifFont();

    // Find all text-containing elements
    const selectors = [
      'article p', 'main p', '[role="main"] p',
      '.content p', '.post p', '.article p',
      '.entry-content p', '.post-content p',
      'p'
    ];

    const elements = new Set();

    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(el => {
        // Skip if inside title, script, or other non-content elements
        if (!el.closest('title') && !el.closest('script') && !el.closest('style')) {
          elements.add(el);
        }
      });
    }

    // Process asynchronously
    const elementArray = Array.from(elements);
    console.log('[Ripliel] Found', elementArray.length, 'paragraphs to process');

    let index = 0;
    function processNext() {
      const batchSize = 3;
      const end = Math.min(index + batchSize, elementArray.length);

      for (; index < end; index++) {
        processParagraph(elementArray[index]);
      }

      if (index < elementArray.length) {
        requestAnimationFrame(processNext);
      }
    }

    if (elementArray.length > 0) {
      requestAnimationFrame(processNext);
    }
  }

  /**
   * Handle resize with debounce
   */
  function handleResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(processPage, 250);
  }

  /**
   * Get storage API
   */
  function getStorageAPI() {
    if (typeof browser !== 'undefined' && browser.storage && browser.storage.sync) {
      return browser.storage;
    }
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      return chrome.storage;
    }
    return null;
  }

  /**
   * Load configuration
   */
  function loadConfig() {
    console.log('[Ripliel] Loading configuration...');

    const storageAPI = getStorageAPI();

    if (storageAPI) {
      try {
        const result = storageAPI.sync.get(DEFAULT_CONFIG);

        if (result && typeof result.then === 'function') {
          result.then((stored) => {
            config = { ...DEFAULT_CONFIG, ...stored };
            console.log('[Ripliel] Config loaded:', config);
            if (config.enabled) processPage();
          }).catch((err) => {
            console.warn('[Ripliel] Storage error:', err);
            config = { ...DEFAULT_CONFIG };
            processPage();
          });
        } else {
          storageAPI.sync.get(DEFAULT_CONFIG, (stored) => {
            if (chrome.runtime && chrome.runtime.lastError) {
              console.warn('[Ripliel] Storage error:', chrome.runtime.lastError);
              config = { ...DEFAULT_CONFIG };
            } else {
              config = { ...DEFAULT_CONFIG, ...stored };
            }
            console.log('[Ripliel] Config loaded:', config);
            if (config.enabled) processPage();
          });
        }
      } catch (err) {
        console.warn('[Ripliel] Storage exception:', err);
        config = { ...DEFAULT_CONFIG };
        processPage();
      }
    } else {
      console.log('[Ripliel] No storage API, using defaults');
      config = { ...DEFAULT_CONFIG };
      processPage();
    }
  }

  /**
   * Setup storage change listener
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
            if (anchorContainer) anchorContainer.innerHTML = '';
            document.body.classList.remove('ripliel-serif');
            const fontStyle = document.getElementById('ripliel-font-style');
            if (fontStyle) fontStyle.remove();
          }
        }
      });
    }
  }

  /**
   * Initialize
   */
  function init() {
    console.log('[Ripliel] Initializing...');
    loadConfig();
    setupStorageListener();
    window.addEventListener('resize', handleResize);

    // Watch for dynamic content
    const observer = new MutationObserver((mutations) => {
      let shouldReprocess = false;
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE &&
                !node.classList?.contains('ripliel-anchor') &&
                node.id !== 'ripliel-anchor-container' &&
                node.id !== 'ripliel-font-style' &&
                node.tagName !== 'TITLE') {
              shouldReprocess = true;
              break;
            }
          }
        }
        if (shouldReprocess) break;
      }
      if (shouldReprocess) handleResize();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Start
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
      ANCHOR_PATTERNS,
      COLOR_PALETTE,
      DEFAULT_CONFIG
    };
  }
})();
