import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    const { sector, limit = 50, offset = 0 } = req.query;

    const where = {
      scrapedAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    };

    if (sector && sector !== 'all') {
      where.sector = sector;
    }

    const jobs = await prisma.jobListing.findMany({
      where,
      orderBy: { scrapedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    const total = await prisma.jobListing.count({ where });

    res.json({
      jobs,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/map
router.get('/map', async (req, res) => {
  try {
    const jobs = await prisma.jobListing.findMany({
      where: {
        scrapedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        lat: { not: null },
        lon: { not: null }
      },
      select: {
        id: true,
        title: true,
        company: true,
        sector: true,
        lat: true,
        lon: true
      },
      take: 500
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jobs/businesses
router.get('/businesses', async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      take: 200,
      select: {
        id: true,
        name: true,
        type: true,
        lat: true,
        lon: true,
        quarter: true
      }
    });

    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
