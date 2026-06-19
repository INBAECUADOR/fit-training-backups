const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { getDb } = require('./database');
const authRoutes = require('./routes/auth');
const routineRoutes = require('./routes/routines');
const measurementRoutes = require('./routes/measurements');
const dashboardRoutes = require('./routes/dashboard');
const prRoutes = require('./routes/prs');
const exportRoutes = require('./routes/export');
const dietRoutes = require('./routes/diet');
const calorieRoutes = require('./routes/calories');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const avatarRoutes = require('./routes/avatar');

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// CORS
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://app.enriquezmania.com';
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? CORS_ORIGIN : '*',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Global rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' },
});
app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prs', prRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/calories', calorieRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/avatar', avatarRoutes);

app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: https://app.enriquezmania.com/sitemap.xml`);
});

app.get('/sitemap.xml', (req, res) => {
  const urls = [
    { loc: 'https://app.enriquezmania.com/', priority: '1.0', changefreq: 'weekly' },
    { loc: 'https://app.enriquezmania.com/login', priority: '0.6', changefreq: 'monthly' },
    { loc: 'https://app.enriquezmania.com/routine', priority: '0.7', changefreq: 'weekly' },
    { loc: 'https://app.enriquezmania.com/diet', priority: '0.7', changefreq: 'weekly' },
    { loc: 'https://app.enriquezmania.com/evolution', priority: '0.8', changefreq: 'weekly' },
    { loc: 'https://app.enriquezmania.com/pr-board', priority: '0.6', changefreq: 'weekly' },
    { loc: 'https://app.enriquezmania.com/calories', priority: '0.6', changefreq: 'monthly' },
    { loc: 'https://app.enriquezmania.com/manual', priority: '0.5', changefreq: 'monthly' },
    { loc: 'https://app.enriquezmania.com/ai-agent', priority: '0.8', changefreq: 'weekly' },
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  res.header('Content-Type', 'application/xml').send(xml);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.message?.includes('Solo se permiten') || err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: err.message || 'El archivo excede el tamaño permitido (10MB)' });
  }
  if (err.name === 'UnauthorizedError' || err.message?.includes('token')) {
    return res.status(401).json({ error: 'Sesión inválida' });
  }
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : err.message });
});

async function start() {
  const db = await getDb();
  console.log('Database initialized');
  const { migrate } = require('./migrate');
  await migrate(db);
  const { seed, seedGlobalExercises, seedTestUsers } = require('./seed');
  await seed();
  await seedGlobalExercises();
  await seedTestUsers();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
