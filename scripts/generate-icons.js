/**
 * Icon generation script for Ripliel
 * Creates PNG icons from SVG
 */

const fs = require('fs');
const path = require('path');

// Simple PNG generation using pure JavaScript
// Creates a basic icon with a colored background and simple shapes

function createPNG(size) {
  // PNG file structure
  const width = size;
  const height = size;

  // Create raw pixel data (RGBA)
  const pixels = new Uint8Array(width * height * 4);

  // Colors
  const bgColor = { r: 52, g: 152, b: 219, a: 255 }; // #3498db
  const textColor = { r: 255, g: 255, b: 255, a: 230 };
  const anchorColor = { r: 231, g: 76, b: 60, a: 255 }; // #e74c3c

  // Fill background
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // Rounded corners
      const cornerRadius = Math.floor(size / 8);
      const inCorner = (
        (x < cornerRadius && y < cornerRadius && Math.sqrt((cornerRadius - x) ** 2 + (cornerRadius - y) ** 2) > cornerRadius) ||
        (x >= width - cornerRadius && y < cornerRadius && Math.sqrt((x - (width - cornerRadius - 1)) ** 2 + (cornerRadius - y) ** 2) > cornerRadius) ||
        (x < cornerRadius && y >= height - cornerRadius && Math.sqrt((cornerRadius - x) ** 2 + (y - (height - cornerRadius - 1)) ** 2) > cornerRadius) ||
        (x >= width - cornerRadius && y >= height - cornerRadius && Math.sqrt((x - (width - cornerRadius - 1)) ** 2 + (y - (height - cornerRadius - 1)) ** 2) > cornerRadius)
      );

      if (inCorner) {
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
      } else {
        pixels[idx] = bgColor.r;
        pixels[idx + 1] = bgColor.g;
        pixels[idx + 2] = bgColor.b;
        pixels[idx + 3] = bgColor.a;
      }
    }
  }

  // Draw text lines
  const lineHeight = Math.floor(size / 16);
  const lineSpacing = Math.floor(size / 6.4);
  const margin = Math.floor(size / 6.4);

  for (let lineNum = 0; lineNum < 4; lineNum++) {
    const y = Math.floor(size * 0.23) + lineNum * lineSpacing;
    const lineWidth = lineNum === 3 ? Math.floor(size * 0.47) : Math.floor(size * 0.69);

    for (let dy = 0; dy < lineHeight; dy++) {
      for (let dx = 0; dx < lineWidth; dx++) {
        const px = margin + dx;
        const py = y + dy;
        if (px < width && py < height) {
          const idx = (py * width + px) * 4;
          if (pixels[idx + 3] !== 0) { // Only draw on non-transparent pixels
            pixels[idx] = textColor.r;
            pixels[idx + 1] = textColor.g;
            pixels[idx + 2] = textColor.b;
            pixels[idx + 3] = textColor.a;
          }
        }
      }
    }
  }

  // Draw anchor dots below second line
  const dotY = Math.floor(size * 0.5);
  const dotRadius = Math.max(2, Math.floor(size / 42));
  const dotPositions = [
    Math.floor(size * 0.22),
    Math.floor(size * 0.5),
    Math.floor(size * 0.78)
  ];

  for (const dotX of dotPositions) {
    for (let dy = -dotRadius; dy <= dotRadius; dy++) {
      for (let dx = -dotRadius; dx <= dotRadius; dx++) {
        if (dx * dx + dy * dy <= dotRadius * dotRadius) {
          const px = dotX + dx;
          const py = dotY + dy;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const idx = (py * width + px) * 4;
            if (pixels[idx + 3] !== 0) {
              pixels[idx] = anchorColor.r;
              pixels[idx + 1] = anchorColor.g;
              pixels[idx + 2] = anchorColor.b;
              pixels[idx + 3] = anchorColor.a;
            }
          }
        }
      }
    }
  }

  return createPNGBuffer(width, height, pixels);
}

function createPNGBuffer(width, height, pixels) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = createIHDRChunk(width, height);

  // IDAT chunk
  const idat = createIDATChunk(width, height, pixels);

  // IEND chunk
  const iend = createIENDChunk();

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createIHDRChunk(width, height) {
  const data = Buffer.alloc(13);
  data.writeUInt32BE(width, 0);
  data.writeUInt32BE(height, 4);
  data[8] = 8;  // bit depth
  data[9] = 6;  // color type (RGBA)
  data[10] = 0; // compression
  data[11] = 0; // filter
  data[12] = 0; // interlace

  return createChunk('IHDR', data);
}

function createIDATChunk(width, height, pixels) {
  const zlib = require('zlib');

  // Add filter byte (0 = no filter) at start of each row
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0; // filter byte
    for (let x = 0; x < width * 4; x++) {
      rawData[y * rowSize + 1 + x] = pixels[y * width * 4 + x];
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  return createChunk('IDAT', compressed);
}

function createIENDChunk() {
  return createChunk('IEND', Buffer.alloc(0));
}

function createChunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = getCRC32Table();

  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }

  return (crc ^ 0xFFFFFFFF) >>> 0;
}

let crcTable = null;
function getCRC32Table() {
  if (crcTable) return crcTable;

  crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xEDB88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[n] = c;
  }

  return crcTable;
}

// Generate icons
const iconsDir = path.join(__dirname, '..', 'icons');

const sizes = [16, 48, 128];

for (const size of sizes) {
  const png = createPNG(size);
  const filename = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename}`);
}

console.log('Icon generation complete!');
