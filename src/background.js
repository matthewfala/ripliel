/**
 * Ripliel Background Service Worker
 * Designed by Matthew Fala
 */

// Set default configuration on install
const DEFAULT_CONFIG = {
  enabled: true,
  sentenceInterval: 3,
  useSerifFont: true
};

// Handle extension installation
if (typeof chrome !== 'undefined') {
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.storage.sync.set(DEFAULT_CONFIG);
    }
  });
} else if (typeof browser !== 'undefined') {
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      browser.storage.sync.set(DEFAULT_CONFIG);
    }
  });
}
