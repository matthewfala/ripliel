/**
 * Integration tests for Ripliel
 * Designed by Matthew Fala
 */

const fs = require('fs');
const path = require('path');

describe('Manifest file', () => {
  let manifest;

  beforeAll(() => {
    const manifestPath = path.join(__dirname, '..', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
  });

  test('has correct manifest version', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  test('has correct name', () => {
    expect(manifest.name).toBe('Ripliel');
  });

  test('has version', () => {
    expect(manifest.version).toBeDefined();
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('has description with credit', () => {
    expect(manifest.description).toContain('Matthew Fala');
  });

  test('has required permissions', () => {
    expect(manifest.permissions).toContain('storage');
    expect(manifest.host_permissions).toContain('<all_urls>');
  });

  test('has popup configuration', () => {
    expect(manifest.action).toBeDefined();
    expect(manifest.action.default_popup).toBe('popup/popup.html');
  });

  test('has content scripts configuration', () => {
    expect(manifest.content_scripts).toBeDefined();
    expect(manifest.content_scripts.length).toBeGreaterThan(0);
    expect(manifest.content_scripts[0].js).toContain('src/content.js');
    expect(manifest.content_scripts[0].css).toContain('src/styles.css');
  });

  test('has Firefox-specific settings', () => {
    expect(manifest.browser_specific_settings).toBeDefined();
    expect(manifest.browser_specific_settings.gecko).toBeDefined();
    expect(manifest.browser_specific_settings.gecko.id).toBeDefined();
  });

  test('has icon definitions', () => {
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons['16']).toBeDefined();
    expect(manifest.icons['48']).toBeDefined();
    expect(manifest.icons['128']).toBeDefined();
  });
});

describe('File structure', () => {
  const basePath = path.join(__dirname, '..');

  test('content script exists', () => {
    const filePath = path.join(basePath, 'src', 'content.js');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('styles file exists', () => {
    const filePath = path.join(basePath, 'src', 'styles.css');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('background script exists', () => {
    const filePath = path.join(basePath, 'src', 'background.js');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  test('popup files exist', () => {
    const popupPath = path.join(basePath, 'popup');
    expect(fs.existsSync(path.join(popupPath, 'popup.html'))).toBe(true);
    expect(fs.existsSync(path.join(popupPath, 'popup.css'))).toBe(true);
    expect(fs.existsSync(path.join(popupPath, 'popup.js'))).toBe(true);
    expect(fs.existsSync(path.join(popupPath, 'info.html'))).toBe(true);
  });

  test('icon files exist', () => {
    const iconsPath = path.join(basePath, 'icons');
    expect(fs.existsSync(path.join(iconsPath, 'icon16.png'))).toBe(true);
    expect(fs.existsSync(path.join(iconsPath, 'icon48.png'))).toBe(true);
    expect(fs.existsSync(path.join(iconsPath, 'icon128.png'))).toBe(true);
  });
});

describe('Popup HTML structure', () => {
  let popupContent;

  beforeAll(() => {
    const popupPath = path.join(__dirname, '..', 'popup', 'popup.html');
    popupContent = fs.readFileSync(popupPath, 'utf8');
  });

  test('has proper HTML structure', () => {
    expect(popupContent).toContain('<!DOCTYPE html>');
    expect(popupContent).toContain('<html');
    expect(popupContent).toContain('</html>');
  });

  test('includes CSS file', () => {
    expect(popupContent).toContain('popup.css');
  });

  test('includes JS file', () => {
    expect(popupContent).toContain('popup.js');
  });

  test('has enable toggle', () => {
    expect(popupContent).toContain('id="enabled"');
  });

  test('has sentence interval input', () => {
    expect(popupContent).toContain('id="sentenceInterval"');
  });

  test('has serif font toggle', () => {
    expect(popupContent).toContain('id="useSerifFont"');
  });

  test('has font selection dropdown', () => {
    expect(popupContent).toContain('id="serifFont"');
    expect(popupContent).toContain('Libre Clarendon');
  });

  test('has fallback font dropdown', () => {
    expect(popupContent).toContain('id="fallbackFont"');
    expect(popupContent).toContain('Fallback Font');
  });

  test('has link to info page', () => {
    expect(popupContent).toContain('info.html');
    expect(popupContent).toContain('About Ripliel');
  });

  test('does not use X in UI text', () => {
    expect(popupContent).not.toContain('every X sentences');
  });

  test('credits Matthew Fala', () => {
    expect(popupContent).toContain('Matthew Fala');
  });
});

describe('CSS styles', () => {
  let cssContent;

  beforeAll(() => {
    const cssPath = path.join(__dirname, '..', 'src', 'styles.css');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  });

  test('has serif font class', () => {
    expect(cssContent).toContain('.ripliel-serif');
  });

  test('has anchor container styles', () => {
    expect(cssContent).toContain('#ripliel-anchor-container');
  });

  test('has anchor styles', () => {
    expect(cssContent).toContain('.ripliel-anchor');
  });

  test('uses Georgia font for serif', () => {
    expect(cssContent).toContain('Georgia');
  });
});

describe('Content script structure', () => {
  let contentScript;

  beforeAll(() => {
    const scriptPath = path.join(__dirname, '..', 'src', 'content.js');
    contentScript = fs.readFileSync(scriptPath, 'utf8');
  });

  test('is wrapped in IIFE', () => {
    expect(contentScript).toContain('(function()');
    expect(contentScript).toContain('})();');
  });

  test('uses strict mode', () => {
    expect(contentScript).toContain("'use strict'");
  });

  test('has hashString function', () => {
    expect(contentScript).toContain('function hashString');
  });

  test('has getAnchorStyle function', () => {
    expect(contentScript).toContain('function getAnchorStyle');
  });

  test('has splitIntoSentences function', () => {
    expect(contentScript).toContain('function splitIntoSentences');
  });

  test('has createAnchorSVG function', () => {
    expect(contentScript).toContain('function createAnchorSVG');
  });

  test('handles window resize', () => {
    expect(contentScript).toContain('handleResize');
    expect(contentScript).toContain("addEventListener('resize'");
  });

  test('uses MutationObserver for dynamic content', () => {
    expect(contentScript).toContain('MutationObserver');
  });

  test('credits Matthew Fala', () => {
    expect(contentScript).toContain('Matthew Fala');
  });

  test('supports both Chrome and Firefox storage APIs', () => {
    expect(contentScript).toContain('chrome.storage');
    expect(contentScript).toContain('browser.storage');
  });

  test('has fade-in animation for anchors', () => {
    expect(contentScript).toContain('opacity');
    expect(contentScript).toContain('transition');
  });
});
