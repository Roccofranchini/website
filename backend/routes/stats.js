import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/stats/unemployment/trend
router.get('/unemployment/trend', async (req, res) => {
  try {
    const { territory = 'Napoli', years = 5 } = req.query;
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - parseInt(years));

    const stats = await prisma.unemploymentStats.findMany({
      where: {
        territory: { contains: territory },
        date: { gte: startDate },
        gender: 'T',
        ageGroup: { contains: '15-64' }
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        rate: true,
        territory: true
      }
    });

    res.json({
      territory,
      data: stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/current
router.get('/current', async (req, res) => {
  try {
    const latest = await prisma.unemploymentStats.findFirst({
      where: {
        territory: { contains: 'Napoli' },
        gender: 'T'
      },
      orderBy: { date: 'desc' }
    });

    const jobCount = await prisma.jobListing.count({
      where: {
        scrapedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const sectors = await prisma.jobListing.groupBy({
      by: ['sector'],
      where: {
        scrapedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    res.json({
      currentUnemploymentRate: latest?.rate || 0,
      activeJobs: jobCount,
      topSector: sectors[0]?.sector || 'N/A',
      topSectorCount: sectors[0]?._count.id || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stats/sectors
router.get('/sectors', async (req, res) => {
  try {
    const sectors = await prisma.jobListing.groupBy({
      by: ['sector'],
      where: {
        scrapedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    res.json(sectors.map(s => ({
      sector: s.sector,
      count: s._count.id
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
