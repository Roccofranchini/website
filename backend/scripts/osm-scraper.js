import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export async function fetchOSM() {
  try {
    console.log('🗺️  Fetching OSM data...');

    const query = `
      [out:json][timeout:90];
      area["name"="Napoli"]["boundary"="administrative"]->.napoli;
      (
        node["office"](area.napoli);
        way["office"](area.napoli);
        node["shop"](area.napoli);
        way["shop"](area.napoli);
        node["amenity"="coworking_space"](area.napoli);
        node["amenity"="restaurant"](area.napoli);
        node["amenity"="cafe"](area.napoli);
      );
      out center 1000;
    `;

    const response = await axios.post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`,
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 120000
      }
    );

    const elements = response.data.elements;
    let imported = 0;

    for (const el of elements) {
      const lat = el.lat || el.center?.lat;
      const lon = el.lon || el.center?.lon;

      if (!lat || !lon) continue;

      try {
        await prisma.business.upsert({
          where: { osmId: el.id },
          update: {
            name: el.tags?.name || 'Unnamed',
            type: el.tags?.office || el.tags?.shop || el.tags?.amenity || 'other',
            lat,
            lon,
            address: el.tags?.['addr:street'],
            quarter: el.tags?.['addr:suburb']
          },
          create: {
            osmId: el.id,
            name: el.tags?.name || 'Unnamed',
            type: el.tags?.office || el.tags?.shop || el.tags?.amenity || 'other',
            lat,
            lon,
            address: el.tags?.['addr:street'],
            quarter: el.tags?.['addr:suburb']
          }
        });
        imported++;
      } catch (err) {
        console.error('Error importing business:', err.message);
      }
    }

    console.log(`✅ OSM: Imported ${imported} businesses`);
    return imported;

  } catch (error) {
    console.error('❌ OSM scraper error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fetchOSM();
}
