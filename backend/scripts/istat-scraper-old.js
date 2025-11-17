import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

export async function fetchISTAT() {
  try {
    console.log('📊 Fetching ISTAT data...');
    
    // URL dataset disoccupazione ISTAT (API SDMX)
    // Nota: questo è un esempio semplificato. Per dati reali usa l'API SDMX ufficiale
    // http://dati.istat.it/OECDStat_Metadata/ShowMetadata.ashx?Dataset=DCCV_TAXDISOCCUMENS
    
    const url = 'http://sdmx.istat.it/SDMXWS/rest/data/47_850/';
    
    const response = await axios.get(url, {
      timeout: 30000,
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'NapoliPulse/1.0'
      }
    });

    // Parsing dei dati ISTAT
    // Nota: la struttura reale dipende dall'API ISTAT, questo è un esempio
    const records = response.data?.dataSets?.[0]?.observations || {};
    
    let imported = 0;

    for (const [key, value] of Object.entries(records)) {
      try {
        // Parsing della chiave e del valore
        const rate = value[0];
        
        await prisma.unemploymentStats.upsert({
          where: {
            territory_date_ageGroup_gender: {
              territory: 'Napoli',
              date: new Date(),
              ageGroup: '15-64',
              gender: 'T'
            }
          },
          update: {
            rate: parseFloat(rate)
          },
          create: {
            territory: 'Napoli',
            date: new Date(),
            rate: parseFloat(rate),
            ageGroup: '15-64',
            gender: 'T'
          }
        });
        imported++;
      } catch (err) {
        console.error('Error importing record:', err.message);
      }
    }

    console.log(`✅ ISTAT: Imported ${imported} records`);
    return imported;

  } catch (error) {
    console.error('❌ ISTAT scraper error:', error.message);
    console.log('ℹ️  Nota: Per usare dati reali ISTAT, configura l\'API SDMX correttamente');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchISTAT();
}
