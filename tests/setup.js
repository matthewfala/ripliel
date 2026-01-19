/**
 * Jest test setup for Ripliel
 */

// Mock chrome storage API
global.chrome = {
  storage: {
    sync: {
      get: jest.fn((defaults, callback) => {
        if (callback) callback(defaults);
        return Promise.resolve(defaults);
      }),
      set: jest.fn((data, callback) => {
        if (callback) callback();
        return Promise.resolve();
      })
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  runtime: {
    onInstalled: {
      addListener: jest.fn()
    }
  }
};

// Mock browser API for Firefox
global.browser = {
  storage: {
    sync: {
      get: jest.fn((defaults) => Promise.resolve(defaults)),
      set: jest.fn(() => Promise.resolve())
    },
    onChanged: {
      addListener: jest.fn()
    }
  },
  runtime: {
    onInstalled: {
      addListener: jest.fn()
    }
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  disconnect() {}
};
