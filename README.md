# Ripliel Browser Extension

**Designed by Matthew Fala**
Email: matthewfala@gmail.com

A browser extension that helps readers track lines of text with visual anchors.

## Overview

Ripliel assists people who struggle to keep track of which line they are reading. It works by:

1. Changing text to a serif font (configurable)
2. Creating visual anchors below lines of text at configurable intervals
3. Using consistent, hash-based styling so anchors remain the same across page visits

## Features

- **Visual Anchors**: Places three anchors per line (start, middle, end) using various patterns (dots, dashes, triangles, waves, squares, diamonds)
- **Consistent Styling**: Anchor colors and patterns are generated based on text content hash, remaining consistent across sessions
- **Configurable Frequency**: Set how often anchors appear (every X sentences)
- **Serif Font Option**: Toggle serif font for improved readability
- **Non-intrusive**: Anchors fade in smoothly and don't interfere with page functionality
- **Responsive**: Anchors adjust when the page is resized

## Browser Support

- Firefox 109+
- Chrome (Manifest V3)

## Installation

### From Source

1. Clone this repository
2. Run `npm install` to install development dependencies
3. Load the extension:

**Firefox:**
- Navigate to `about:debugging#/runtime/this-firefox`
- Click "Load Temporary Add-on"
- Select the `manifest.json` file

**Chrome:**
- Navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the extension directory

## Configuration

Click the extension icon to access settings:

- **Enable Anchors**: Toggle the extension on/off
- **Anchor Frequency**: Set how many sentences between anchor placements (1-20)
- **Use Serif Font**: Toggle serif font styling

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Generate icons
npm run generate-icons
```

## Project Structure

```
ripliel/
├── manifest.json       # Extension manifest (Chrome + Firefox)
├── src/
│   ├── content.js      # Main content script
│   ├── core.js         # Core logic module
│   ├── styles.css      # Anchor and serif styles
│   └── background.js   # Background service worker
├── popup/
│   ├── popup.html      # Settings popup UI
│   ├── popup.css       # Popup styles
│   └── popup.js        # Popup logic
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── tests/
    ├── core.test.js    # Core logic tests
    ├── dom.test.js     # DOM manipulation tests
    └── integration.test.js # Integration tests
```

## Release

See [RELEASE.md](RELEASE.md) for instructions on publishing to Chrome Web Store and Firefox Add-ons.

## How It Works

1. When a page loads, the content script identifies text paragraphs
2. Text is split into sentences
3. At configurable intervals, anchors are placed below lines
4. Each anchor's pattern and color are determined by hashing the sentence content
5. Three anchors are placed per anchored line: start, middle, and end positions
6. Anchors fade in smoothly to avoid distracting from content loading

## License

Copyright Matthew Fala, All Rights Reserved

## Credits

Designed by Matthew Fala
