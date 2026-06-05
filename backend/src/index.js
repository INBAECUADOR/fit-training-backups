const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./database');
const authRoutes = require('./routes/auth');
const routineRoutes = require('./routes/routines');
const measurementRoutes = require('./routes/measurements');
const dashboardRoutes = require('./routes/dashboard');
const prRoutes = require('./routes/prs');
const exportRoutes = require('./routes/export');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/prs', prRoutes);
app.use('/api/export', exportRoutes);

app.use(express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
});

async function start() {
  await getDb();
  console.log('Database initialized');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch(console.error);
