import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import statsRoutes from './routes/stats.js';
import jobsRoutes from './routes/jobs.js';
import livabilityRoutes from './routes/livability.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.use('/api/stats', statsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/livability', livabilityRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Cron jobs (solo in produzione)
if (process.env.NODE_ENV === 'production') {
  // ISTAT update - ogni domenica alle 2am
  cron.schedule('0 2 * * 0', async () => {
    console.log('🔄 Running ISTAT scraper...');
    const { fetchISTAT } = await import('./scripts/istat-scraper.js');
    await fetchISTAT();
  });

  // OSM update - 1° e 15° giorno del mese alle 3am
  cron.schedule('0 3 1,15 * *', async () => {
    console.log('🔄 Running OSM scraper...');
    const { fetchOSM } = await import('./scripts/osm-scraper.js');
    await fetchOSM();
  });

  // Indeed update - ogni giorno alle 4am
  cron.schedule('0 4 * * *', async () => {
    console.log('🔄 Running Indeed scraper...');
    const { scrapeIndeed } = await import('./scripts/indeed-scraper.js');
    await scrapeIndeed();
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
