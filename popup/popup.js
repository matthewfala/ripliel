/**
 * Ripliel Popup Script
 * Designed by Matthew Fala
 */

(function() {
  'use strict';

  const DEFAULT_CONFIG = {
    enabled: true,
    sentenceInterval: 3,
    useSerifFont: true
  };

  // Get storage API (works for both Chrome and Firefox)
  function getStorageAPI() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return chrome.storage;
    }
    if (typeof browser !== 'undefined' && browser.storage) {
      return browser.storage;
    }
    return null;
  }

  // Load settings from storage
  function loadSettings() {
    const storage = getStorageAPI();

    if (!storage) {
      console.warn('Storage API not available');
      return;
    }

    storage.sync.get(DEFAULT_CONFIG, (config) => {
      document.getElementById('enabled').checked = config.enabled;
      document.getElementById('sentenceInterval').value = config.sentenceInterval;
      document.getElementById('useSerifFont').checked = config.useSerifFont;
    });
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
      sentenceInterval: parseInt(document.getElementById('sentenceInterval').value, 10) || 3,
      useSerifFont: document.getElementById('useSerifFont').checked
    };

    // Validate sentenceInterval
    if (config.sentenceInterval < 1) config.sentenceInterval = 1;
    if (config.sentenceInterval > 20) config.sentenceInterval = 20;

    storage.sync.set(config);
  }

  // Initialize popup
  function init() {
    loadSettings();

    // Add event listeners
    document.getElementById('enabled').addEventListener('change', saveSettings);
    document.getElementById('sentenceInterval').addEventListener('change', saveSettings);
    document.getElementById('sentenceInterval').addEventListener('input', saveSettings);
    document.getElementById('useSerifFont').addEventListener('change', saveSettings);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
