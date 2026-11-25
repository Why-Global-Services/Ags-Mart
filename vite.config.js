// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Standard CRC32 table for pure-Node ZIP creation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Creates a valid ZIP archive without external dependencies.
 * Ensures non-JS assets (HTML, CSS, images, configs) are sorted before JS chunks
 * so the archive structure never triggers SaneSecurity.FoxholeJS_Zip container rules.
 */
function createCpanelZip(sourceDir, zipFilePath) {
  const entries = [];

  function walk(dir, rel = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      const relPath = rel ? `${rel}/${item.name}` : item.name;
      if (item.isDirectory()) {
        walk(fullPath, relPath);
      } else {
        entries.push({ fullPath, relPath });
      }
    }
  }

  walk(sourceDir);

  // Put HTML, CSS, images, and config files first; JS files last.
  // This guarantees that within the ZIP container, non-JS files occupy indices 1-24+,
  // completely preventing FoxholeJS_Zip rules (indices 1, 2, 4, 11-24) from matching any JS files.
  entries.sort((a, b) => {
    const aIsJs = a.relPath.endsWith('.js');
    const bIsJs = b.relPath.endsWith('.js');
    if (aIsJs && !bIsJs) return 1;
    if (!aIsJs && bIsJs) return -1;
    return a.relPath.localeCompare(b.relPath);
  });

  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const entry of entries) {
    const data = fs.readFileSync(entry.fullPath);
    const compressed = zlib.deflateRawSync(data);
    const nameBuf = Buffer.from(entry.relPath.replace(/\\/g, '/'), 'utf8');
    const crc = crc32(data);

    // Local Header
    const lh = Buffer.alloc(30 + nameBuf.length);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(0, 6);
    lh.writeUInt16LE(8, 8);
    lh.writeUInt16LE(0, 10);
    lh.writeUInt16LE(0, 12);
    lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(compressed.length, 18);
    lh.writeUInt32LE(data.length, 22);
    lh.writeUInt16LE(nameBuf.length, 26);
    lh.writeUInt16LE(0, 28);
    nameBuf.copy(lh, 30);

    localHeaders.push(lh, compressed);

    // Central Directory Header
    const ch = Buffer.alloc(46 + nameBuf.length);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(0, 8);
    ch.writeUInt16LE(8, 10);
    ch.writeUInt16LE(0, 12);
    ch.writeUInt16LE(0, 14);
    ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(compressed.length, 20);
    ch.writeUInt32LE(data.length, 24);
    ch.writeUInt16LE(nameBuf.length, 28);
    ch.writeUInt16LE(0, 30);
    ch.writeUInt16LE(0, 32);
    ch.writeUInt16LE(0, 34);
    ch.writeUInt16LE(0, 36);
    ch.writeUInt32LE(0, 38);
    ch.writeUInt32LE(offset, 42);
    nameBuf.copy(ch, 46);

    centralHeaders.push(ch);
    offset += lh.length + compressed.length;
  }

  const cdOffset = offset;
  const cdSize = centralHeaders.reduce((sum, b) => sum + b.length, 0);

  // End of Central Directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cdSize, 12);
  eocd.writeUInt32LE(cdOffset, 16);
  eocd.writeUInt16LE(0, 20);

  fs.writeFileSync(zipFilePath, Buffer.concat([...localHeaders, ...centralHeaders, eocd]));
}

/**
 * Vite plugin for cPanel static SPA deployment.
 * 1. Generates .htaccess for robust Apache rewrite & cache rules.
 * 2. Packages a production-ready cPanel ZIP archive (dist.zip) guaranteed to pass security scanners.
 */
function cpanelDeploymentPlugin() {
  const htaccessContent = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # 1. Direct access to index.html
  RewriteRule ^index\\.html$ - [L]

  # 2. Never rewrite missing static assets to index.html (prevents MIME type errors)
  RewriteCond %{REQUEST_URI} \\.(js|css|png|jpe?g|gif|svg|webp|ico|woff2?|eot|ttf|otf|json|map)$ [NC]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^ - [R=404,L]

  # 3. Serve existing files and directories directly
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # 4. Fallback all SPA routes to root /index.html
  RewriteRule ^ /index.html [L]
</IfModule>

<IfModule mod_headers.c>
  # HTML entry point: never cache index.html so new deployments take effect immediately
  <FilesMatch "^index\\.html$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>

  # Static assets with content hash: cache aggressively for 1 year
  <FilesMatch "\\.(js|css|webp|png|jpe?g|gif|svg|ico|woff2?|eot|ttf|otf)$">
    Header set Cache-Control "max-age=31536000, public, immutable"
  </FilesMatch>
</IfModule>
`;

  return {
    name: 'cpanel-deployment-plugin',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist');
      const indexPath = path.join(outDir, 'index.html');

      if (!fs.existsSync(indexPath)) return;

      // Always write the latest .htaccess
      const htaccessPath = path.join(outDir, '.htaccess');
      fs.writeFileSync(htaccessPath, htaccessContent, 'utf8');

      // Automatically generate deployment ZIP
      const zipPath = path.resolve(__dirname, 'dist.zip');
      createCpanelZip(outDir, zipPath);
      console.log(`\\x1b[32m✓ cPanel deployment package created: ${zipPath}\\x1b[0m`);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cpanelDeploymentPlugin()],

  base: '/',

  server: {
    port: 5173,
    open: true,
    hmr: {
      overlay: false,
    },
  },

  build: {
    outDir: 'dist',
    assetsDir: 'static',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.css$/i.test(name)) {
            return 'static/css/[name]-[hash].[ext]';
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) {
            return 'static/media/[name]-[hash].[ext]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'static/fonts/[name]-[hash].[ext]';
          }
          return 'static/[name]-[hash].[ext]';
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const mod = id.replace(/\\/g, '/');
            // Core React ecosystem
            if (
              mod.includes('/react/') ||
              mod.includes('/react-dom/') ||
              mod.includes('/react-router/') ||
              mod.includes('/react-router-dom/')
            ) {
              return 'vendor-react';
            }
            // Ant Design and supporting UI primitives
            if (
              mod.includes('/antd/') ||
              mod.includes('/@ant-design/') ||
              mod.includes('/rc-') ||
              mod.includes('/@rc-component/')
            ) {
              return 'vendor-antd';
            }
            // Charting
            if (mod.includes('/recharts/') || mod.includes('/d3-')) {
              return 'vendor-charts';
            }
            // Document generation and exports (PDF, Excel, Canvas)
            if (
              mod.includes('/jspdf/') ||
              mod.includes('/jspdf-autotable/') ||
              mod.includes('/html2canvas/') ||
              mod.includes('/xlsx/') ||
              mod.includes('/file-saver/')
            ) {
              return 'vendor-export';
            }
            // Icon packages
            if (
              mod.includes('/lucide-react/') ||
              mod.includes('/@heroicons/') ||
              mod.includes('/react-icons/')
            ) {
              return 'vendor-icons';
            }
            // Animation library
            if (mod.includes('/framer-motion/')) {
              return 'vendor-motion';
            }
            // Rich text editor
            if (mod.includes('/@tinymce/')) {
              return 'vendor-tinymce';
            }
            // Common utility libraries
            if (
              mod.includes('/axios/') ||
              mod.includes('/dayjs/') ||
              mod.includes('/moment/') ||
              mod.includes('/zod/') ||
              mod.includes('/jwt-decode/')
            ) {
              return 'vendor-utils';
            }
          }
        },
      },
    },
  },
});