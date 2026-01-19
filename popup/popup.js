/**
 * Ripliel Popup Script
 * Designed by Matthew Fala
 */

(function() {
  'use strict';

  const DEFAULT_CONFIG = {
    enabled: true,
    sentenceInterval: 2,
    useSerifFont: true,
    serifFont: 'petit-medieval',
    fallbackFont: 'georgia'
  };

  // Get storage API (works for both Chrome and Firefox)
  function getStorageAPI() {
    if (typeof browser !== 'undefined' && browser.storage) {
      return browser.storage;
    }
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage;
    }
    return null;
  }

  // Update font section visibility
  function updateFontSectionVisibility() {
    const useSerifFont = document.getElementById('useSerifFont').checked;
    const fontSection = document.getElementById('fontSelectionSection');
    const fallbackSection = document.getElementById('fallbackFontSection');
    if (fontSection) {
      fontSection.classList.toggle('hidden', !useSerifFont);
    }
    if (fallbackSection) {
      fallbackSection.classList.toggle('hidden', !useSerifFont);
    }
  }

  // Load settings from storage
  function loadSettings() {
    const storage = getStorageAPI();

    if (!storage) {
      console.warn('Storage API not available');
      return;
    }

    const result = storage.sync.get(DEFAULT_CONFIG);

    if (result && typeof result.then === 'function') {
      // Promise-based (Firefox)
      result.then((config) => {
        applyConfigToUI(config);
      }).catch((err) => {
        console.warn('Error loading settings:', err);
        applyConfigToUI(DEFAULT_CONFIG);
      });
    } else {
      // Callback-based (Chrome)
      storage.sync.get(DEFAULT_CONFIG, (config) => {
        applyConfigToUI(config);
      });
    }
  }

  // Apply config values to UI elements
  function applyConfigToUI(config) {
    document.getElementById('enabled').checked = config.enabled;
    document.getElementById('sentenceInterval').value = config.sentenceInterval;
    document.getElementById('useSerifFont').checked = config.useSerifFont;
    document.getElementById('serifFont').value = config.serifFont || 'petit-medieval';
    document.getElementById('fallbackFont').value = config.fallbackFont || 'georgia';
    updateFontSectionVisibility();
  }

  // Save settings to storage
  function saveSettings() {
    const storage = getStorageAPI();

    if (!storage) {
      console.warn('Storage API not available');
      return;
    }

    const config = {
      enabled: document.getElementById('enabled').checked,
      sentenceInterval: parseInt(document.getElementById('sentenceInterval').value, 10) || 2,
      useSerifFont: document.getElementById('useSerifFont').checked,
      serifFont: document.getElementById('serifFont').value,
      fallbackFont: document.getElementById('fallbackFont').value
    };

    // Validate sentenceInterval
    if (config.sentenceInterval < 1) config.sentenceInterval = 1;
    if (config.sentenceInterval > 20) config.sentenceInterval = 20;

    storage.sync.set(config);
    updateFontSectionVisibility();
  }

  // Initialize popup
  function init() {
    loadSettings();

    // Add event listeners
    document.getElementById('enabled').addEventListener('change', saveSettings);
    document.getElementById('sentenceInterval').addEventListener('change', saveSettings);
    document.getElementById('sentenceInterval').addEventListener('input', saveSettings);
    document.getElementById('useSerifFont').addEventListener('change', saveSettings);
    document.getElementById('serifFont').addEventListener('change', saveSettings);
    document.getElementById('fallbackFont').addEventListener('change', saveSettings);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
