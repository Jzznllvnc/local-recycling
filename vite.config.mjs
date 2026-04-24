import { defineConfig } from 'vite';
import { resolve } from 'path';

const cleanUrlRewrites = {
  '/docs': '/docs.html',
  '/docs/': '/docs.html',
  '/report': '/report.html',
  '/report/': '/report.html',
  '/index': '/index.html',
  '/index/': '/index.html'
};

function rewriteCleanUrl(req) {
  if (!req.url) {
    return;
  }

  const [pathname, query = ''] = req.url.split('?');
  const rewrittenPath = cleanUrlRewrites[pathname];

  if (!rewrittenPath) {
    return;
  }

  req.url = query ? `${rewrittenPath}?${query}` : rewrittenPath;
}

function cleanUrlPlugin() {
  return {
    name: 'clean-url-plugin',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteCleanUrl(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteCleanUrl(req);
        next();
      });
    }
  };
}

export default defineConfig({
  root: 'public',
  publicDir: false,
  plugins: [cleanUrlPlugin()],
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true
  },
  preview: {
    host: 'localhost',
    port: 3000,
    strictPort: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html'),
        docs: resolve(__dirname, 'public/docs.html'),
        report: resolve(__dirname, 'public/report.html')
      }
    }
  }
});
