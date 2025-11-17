import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/livability/current - Dati vivibilità più recenti
router.get('/current', async (req, res) => {
  try {
    const latest = await prisma.livabilityStats.findFirst({
      orderBy: { date: 'desc' }
    });

    if (!latest) {
      return res.json({
        avgRentPrice: null,
        avgHousePrice: null,
        costOfLivingIndex: null,
        transportCost: null,
        groceriesCost: null
      });
    }

    res.json(latest);
  } catch (error) {
    console.error('Error fetching current livability:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/livability/trend - Andamento storico vivibilità
router.get('/trend', async (req, res) => {
  try {
    const { years = 3 } = req.query;
    const yearsAgo = new Date();
    yearsAgo.setFullYear(yearsAgo.getFullYear() - parseInt(years));

    const data = await prisma.livabilityStats.findMany({
      where: {
        date: { gte: yearsAgo }
      },
      orderBy: { date: 'asc' }
    });

    res.json({ data });
  } catch (error) {
    console.error('Error fetching livability trend:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
