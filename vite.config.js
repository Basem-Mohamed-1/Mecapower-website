const cleanRoutes = new Map([
  ['/about', '/about.html'],
  ['/services', '/services.html'],
  ['/projects', '/projects.html'],
  ['/approach', '/approach.html'],
  ['/contact', '/index.html'],
  ['/admin', '/admin.html'],
]);

const legacyRoutes = new Map([
  ['/index.html', '/'],
  ['/about.html', '/about'],
  ['/services.html', '/services'],
  ['/projects.html', '/projects'],
  ['/approach.html', '/approach'],
  ['/contact.html', '/contact'],
  ['/admin.html', '/admin'],
]);

function cleanUrlMiddleware() {
  return (request, response, next) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') return next();

    const requestUrl = new URL(request.url, 'http://vite.local');
    const pathname = requestUrl.pathname;
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

    if (cleanPath !== pathname && (cleanRoutes.has(cleanPath) || cleanPath === '/')) {
      response.statusCode = 301;
      response.setHeader('Location', `${cleanPath || '/'}${requestUrl.search}`);
      return response.end();
    }

    const legacyTarget = legacyRoutes.get(pathname);
    if (legacyTarget) {
      response.statusCode = 301;
      response.setHeader('Location', `${legacyTarget}${requestUrl.search}`);
      return response.end();
    }

    const htmlEntry = cleanRoutes.get(pathname);
    if (htmlEntry) request.url = `${htmlEntry}${requestUrl.search}`;
    return next();
  };
}

const cleanUrls = {
  name: 'ultra-clean-urls',
  configureServer(server) {
    server.middlewares.use(cleanUrlMiddleware());
  },
  configurePreviewServer(server) {
    server.middlewares.use(cleanUrlMiddleware());
  },
};

export default {
  plugins: [cleanUrls],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        services: 'services.html',
        approach: 'approach.html',
        projects: 'projects.html',
        admin: 'admin.html',
      },
    },
  },
};
