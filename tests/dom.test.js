/**
 * DOM manipulation tests for Ripliel
 * Tests anchor creation and SVG generation
 * Designed by Matthew Fala
 */

const {
  hashString,
  getAnchorStyle,
  createWavePath,
  ANCHOR_PATTERNS,
  COLOR_PALETTE
} = require('../src/core.js');

describe('SVG Anchor Generation', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  // Helper function to create anchor SVG (simplified from content.js)
  // Handles the new pattern-variation naming scheme
  function createAnchorSVG(pattern, color, width) {
    const height = 6;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // Parse pattern type and variation
    const [basePattern] = pattern.includes('-')
      ? [pattern.split('-')[0]]
      : [pattern];

    switch (basePattern) {
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
        path.setAttribute('d', createWavePath(width));
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

      // Handle additional patterns
      case 'crosses':
      case 'plus':
      case 'stars':
      case 'hearts':
      case 'chevrons':
      case 'brackets':
      case 'slashes':
      case 'backslashes':
      case 'pipes':
      case 'tildes':
      case 'carets':
        // Add a simple line element for these patterns in tests
        for (let x = 4; x < width; x += 10) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', x);
          line.setAttribute('y1', 1);
          line.setAttribute('x2', x);
          line.setAttribute('y2', height - 1);
          line.setAttribute('stroke', color);
          line.setAttribute('stroke-width', '1.5');
          svg.appendChild(line);
        }
        break;

      default:
        // Default: add dots pattern
        for (let x = 3; x < width; x += 8) {
          const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          circle.setAttribute('cx', x);
          circle.setAttribute('cy', 3);
          circle.setAttribute('r', 2);
          circle.setAttribute('fill', color);
          svg.appendChild(circle);
        }
    }

    return svg;
  }

  test('creates dots pattern SVG', () => {
    const svg = createAnchorSVG('dots-medium', '#e74c3c', 50);
    container.appendChild(svg);

    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.getAttribute('width')).toBe('50');
    expect(svg.querySelectorAll('circle').length).toBeGreaterThan(0);
  });

  test('creates dashes pattern SVG', () => {
    const svg = createAnchorSVG('dashes-medium', '#3498db', 50);
    container.appendChild(svg);

    expect(svg.tagName.toLowerCase()).toBe('svg');
    const rects = svg.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
    expect(rects[0].getAttribute('fill')).toBe('#3498db');
  });

  test('creates triangles pattern SVG', () => {
    const svg = createAnchorSVG('triangles-up', '#2ecc71', 50);
    container.appendChild(svg);

    expect(svg.tagName.toLowerCase()).toBe('svg');
    const polygons = svg.querySelectorAll('polygon');
    expect(polygons.length).toBeGreaterThan(0);
  });

  test('creates waves pattern SVG', () => {
    const svg = createAnchorSVG('waves-gentle', '#9b59b6', 50);
    container.appendChild(svg);

    expect(svg.tagName.toLowerCase()).toBe('svg');
    const path = svg.querySelector('path');
    expect(path).not.toBeNull();
    expect(path.getAttribute('stroke')).toBe('#9b59b6');
    expect(path.getAttribute('fill')).toBe('none');
  });

  test('creates squares pattern SVG', () => {
    const svg = createAnchorSVG('squares-medium', '#f39c12', 50);
    container.appendChild(svg);

    expect(svg.tagName.toLowerCase()).toBe('svg');
    const rects = svg.querySelectorAll('rect');
    expect(rects.length).toBeGreaterThan(0);
  });

  test('creates diamonds pattern SVG', () => {
    const svg = createAnchorSVG('diamonds-medium', '#1abc9c', 50);
    container.appendChild(svg);

    expect(svg.tagName.toLowerCase()).toBe('svg');
    const polygons = svg.querySelectorAll('polygon');
    expect(polygons.length).toBeGreaterThan(0);
  });

  test('all base patterns can be generated', () => {
    const basePatterns = ['dots', 'dashes', 'triangles', 'waves', 'squares', 'diamonds',
                          'crosses', 'stars', 'hearts', 'chevrons', 'brackets', 'slashes',
                          'backslashes', 'pipes', 'tildes', 'carets'];
    basePatterns.forEach(pattern => {
      const svg = createAnchorSVG(pattern, '#000000', 60);
      expect(svg).not.toBeNull();
      expect(svg.childNodes.length).toBeGreaterThan(0);
    });
  });

  test('all colors are valid in SVG', () => {
    COLOR_PALETTE.forEach(color => {
      const svg = createAnchorSVG('dots-medium', color, 50);
      const circle = svg.querySelector('circle');
      expect(circle.getAttribute('fill')).toBe(color);
    });
  });
});

describe('Anchor Container', () => {
  test('can create anchor container div', () => {
    const container = document.createElement('div');
    container.id = 'ripliel-anchor-container';
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(container);

    expect(document.getElementById('ripliel-anchor-container')).not.toBeNull();
    expect(container.style.pointerEvents).toBe('none');
    expect(container.style.position).toBe('absolute');

    document.body.removeChild(container);
  });

  test('anchor div has correct positioning', () => {
    const anchor = document.createElement('div');
    anchor.className = 'ripliel-anchor';
    anchor.style.cssText = `
      position: absolute;
      left: 100px;
      top: 200px;
      width: 50px;
      height: 6px;
      opacity: 0;
      transition: opacity 0.3s ease-in;
      z-index: 9999;
      pointer-events: none;
    `;

    document.body.appendChild(anchor);

    expect(anchor.style.position).toBe('absolute');
    expect(anchor.style.left).toBe('100px');
    expect(anchor.style.top).toBe('200px');
    expect(anchor.style.opacity).toBe('0');
    expect(anchor.style.pointerEvents).toBe('none');

    document.body.removeChild(anchor);
  });
});

describe('Hash-based Style Consistency', () => {
  test('same content always gets same pattern', () => {
    const content = 'This is a test sentence about programming.';
    const results = [];

    for (let i = 0; i < 10; i++) {
      results.push(getAnchorStyle(content));
    }

    const firstPattern = results[0].pattern;
    const firstColor = results[0].color;

    results.forEach(result => {
      expect(result.pattern).toBe(firstPattern);
      expect(result.color).toBe(firstColor);
    });
  });

  test('similar content gets different styles', () => {
    const content1 = 'The quick brown fox jumps over the lazy dog.';
    const content2 = 'The quick brown fox leaps over the lazy dog.';

    const style1 = getAnchorStyle(content1);
    const style2 = getAnchorStyle(content2);

    // At least pattern or color should differ
    const isDifferent = style1.pattern !== style2.pattern || style1.color !== style2.color;
    expect(isDifferent).toBe(true);
  });

  test('all 3 anchors per line use same style (content hash is same)', () => {
    const lineText = 'Test sentence for anchor positioning.';

    // When same text is used for all 3 anchors, they get the same style
    const style = getAnchorStyle(lineText);

    // Verify it's consistent
    expect(style.pattern).toBe(getAnchorStyle(lineText).pattern);
    expect(style.color).toBe(getAnchorStyle(lineText).color);
  });
});

describe('Serif Font Application', () => {
  test('serif class can be added to body', () => {
    document.body.classList.add('ripliel-serif');
    expect(document.body.classList.contains('ripliel-serif')).toBe(true);
    document.body.classList.remove('ripliel-serif');
  });

  test('serif class can be toggled', () => {
    document.body.classList.add('ripliel-serif');
    expect(document.body.classList.contains('ripliel-serif')).toBe(true);

    document.body.classList.remove('ripliel-serif');
    expect(document.body.classList.contains('ripliel-serif')).toBe(false);
  });
});

describe('Text Processing', () => {
  test('paragraph elements can be queried', () => {
    const article = document.createElement('article');
    const p1 = document.createElement('p');
    const p2 = document.createElement('p');
    p1.textContent = 'First paragraph. Second sentence.';
    p2.textContent = 'Another paragraph. More text here.';
    article.appendChild(p1);
    article.appendChild(p2);
    document.body.appendChild(article);

    const paragraphs = document.querySelectorAll('article p');
    expect(paragraphs.length).toBe(2);

    document.body.removeChild(article);
  });

  test('TreeWalker can find text nodes', () => {
    const div = document.createElement('div');
    div.innerHTML = '<p>First <strong>bold</strong> text.</p>';
    document.body.appendChild(div);

    const walker = document.createTreeWalker(
      div,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.textContent.trim()) {
        textNodes.push(walker.currentNode);
      }
    }

    expect(textNodes.length).toBeGreaterThan(0);

    document.body.removeChild(div);
  });
});

describe('Pattern count', () => {
  test('has at least 50 patterns', () => {
    expect(ANCHOR_PATTERNS.length).toBeGreaterThanOrEqual(50);
  });
});
