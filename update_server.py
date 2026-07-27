import re

with open("server.ts", "r") as f:
    content = f.read()

valid_routes_logic = """
const validPrefixes = [
  '/pagina/', '/blog', '/explorar', '/admin', '/login', '/registro',
  '/mensajes', '/mis-anuncios', '/favoritos', '/estadisticas', '/monederos',
  '/configuracion/', '/anuncio/', '/publicar', '/perfil'
];

function isKnownRoute(url: string): boolean {
  if (url === '/' || url.startsWith('/?')) return true;
  const path = url.split('?')[0];
  if (path === '/configuracion') return true;
  return validPrefixes.some(prefix => path === prefix || path.startsWith(prefix + '/'));
}
"""

# Insert logic before app.use('*'
if "const validPrefixes" not in content:
    content = content.replace("app.use('*', async (req, res, next) => {", valid_routes_logic + "\n    app.use('*', async (req, res, next) => {")

# Update development wildcard
dev_fallback_old = """    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);"""

dev_fallback_new = """    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const fs = await import('fs');
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const status = isKnownRoute(url) ? 200 : 404;
        res.status(status).set({ 'Content-Type': 'text/html' }).end(template);"""

content = content.replace(dev_fallback_old, dev_fallback_new)

# Update production wildcard
prod_fallback_old = """    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });"""

prod_fallback_new = """    app.get('*', (req, res) => {
      const status = isKnownRoute(req.originalUrl) ? 200 : 404;
      res.status(status).sendFile(path.join(distPath, 'index.html'));
    });"""

content = content.replace(prod_fallback_old, prod_fallback_new)

with open("server.ts", "w") as f:
    f.write(content)
