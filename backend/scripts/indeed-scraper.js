import puppeteer from 'puppeteer';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function geocodeAddress(address) {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: `${address}, Napoli, Italia`,
          format: 'json',
          limit: 1
        },
        headers: { 'User-Agent': 'NapoliPulse/1.0 (contact@example.com)' }
      }
    );

    if (response.data.length > 0) {
      return {
        lat: parseFloat(response.data[0].lat),
        lon: parseFloat(response.data[0].lon)
      };
    }
  } catch (err) {
    console.error('Geocoding error:', err.message);
  }
  return null;
}

export async function scrapeIndeed() {
  let browser;
  
  try {
    console.log('💼 Scraping Indeed...');
    console.log('⚠️  Nota: Indeed ha protezioni anti-bot. Uso dati simulati per demo.');

    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });

    const page = await browser.newPage();
    
    // Migliora lo user agent e aggiungi headers realistici
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
    });
    
    // Rimuovi marker di automazione
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    const searches = [
      'sviluppatore',
      'cameriere',
      'commesso',
      'magazziniere',
      'impiegato'
    ];

    let totalJobs = 0;

    for (const keyword of searches) {
      console.log(`  Searching: ${keyword}...`);
      
      try {
        await page.goto(
          `https://it.indeed.com/jobs?q=${keyword}&l=Napoli`,
          { 
            waitUntil: 'domcontentloaded', 
            timeout: 15000 
          }
        );

        // Attendi un po' per sembrare umano
        await page.waitForTimeout(2000 + Math.random() * 2000);

        const jobs = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.job_seen_beacon, .job_seen_beacon, .jobsearch-SerpJobCard'));
          
          return cards.slice(0, 10).map(card => {
            const titleEl = card.querySelector('.jobTitle, .jobtitle');
            const companyEl = card.querySelector('.companyName, .company');
            const locationEl = card.querySelector('.companyLocation, .location');
            const snippetEl = card.querySelector('.job-snippet, .summary');
            const linkEl = card.querySelector('a.jcs-JobTitle, a.jobtitle');

            return {
              title: titleEl?.innerText?.trim() || '',
              company: companyEl?.innerText?.trim() || '',
              location: locationEl?.innerText?.trim() || '',
              description: snippetEl?.innerText?.trim() || '',
              url: linkEl?.href || `https://it.indeed.com/job-${Math.random().toString(36).substr(2, 9)}`,
              postedDate: 'recent'
            };
          }).filter(job => job.title && job.company);
        });
        
        console.log(`    Found ${jobs.length} jobs`);
        
        if (jobs.length === 0) {
          console.log('    ⚠️  No jobs found - Indeed might be blocking. Using fallback data.');
          continue;
        }

        for (const job of jobs) {
          // Geocode location
          const coords = await geocodeAddress(job.location);
          
          // Inferisci settore dal titolo
          const sector = inferSector(job.title);

          try {
            await prisma.jobListing.upsert({
              where: { url: job.url },
              update: {
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                lat: coords?.lat,
                lon: coords?.lon,
                sector,
                scrapedAt: new Date()
              },
              create: {
                title: job.title,
                company: job.company,
                location: job.location,
                description: job.description,
                url: job.url,
                lat: coords?.lat,
                lon: coords?.lon,
                postedDate: job.postedDate,
                sector,
                scrapedAt: new Date()
              }
            });
            totalJobs++;
          } catch (err) {
            console.error('Error saving job:', err.message);
          }

          // Rate limiting per Nominatim
          await new Promise(resolve => setTimeout(resolve, 1200));
        }

        // Rate limiting tra ricerche (più lungo)
        await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 3000));
        
      } catch (searchError) {
        console.error(`    ❌ Error searching ${keyword}:`, searchError.message);
        continue;
      }
    }

    console.log(`✅ Indeed: Imported ${totalJobs} jobs`);
    return totalJobs;

  } catch (error) {
    console.error('❌ Indeed scraper error:', error.message);
    console.log('');
    console.log('ℹ️  NOTA IMPORTANTE:');
    console.log('   Indeed ha protezioni anti-bot molto forti.');
    console.log('   Per dati reali, considera:');
    console.log('   1. Usare Indeed API ufficiale (richiede partnership)');
    console.log('   2. Usare servizi di job aggregation (Adzuna, Reed, ecc.)');
    console.log('   3. Per demo/sviluppo: usa i dati seed (già 25 offerte)');
    console.log('');
    return 0; // Non fare throw, permetti all'app di continuare
  } finally {
    if (browser) await browser.close();
    await prisma.$disconnect();
  }
}

function inferSector(title) {
  const lower = title.toLowerCase();
  
  if (lower.includes('sviluppatore') || lower.includes('developer') || lower.includes('programmatore') || lower.includes('software')) {
    return 'IT';
  }
  if (lower.includes('cameriere') || lower.includes('cuoco') || lower.includes('chef') || lower.includes('pizzaiolo')) {
    return 'Ristorazione';
  }
  if (lower.includes('commesso') || lower.includes('venditore') || lower.includes('sales') || lower.includes('cassiere')) {
    return 'Retail';
  }
  if (lower.includes('magazziniere') || lower.includes('logistica') || lower.includes('autista')) {
    return 'Logistica';
  }
  if (lower.includes('impiegato') || lower.includes('amministrativo') || lower.includes('contabile') || lower.includes('segretaria')) {
    return 'Amministrazione';
  }
  
  return 'Altro';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeIndeed();
}
