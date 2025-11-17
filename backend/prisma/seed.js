
import dotenv from 'dotenv';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Carica le variabili d'ambiente dal file .env
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Seed unemployment data - Ultimi 3 anni con dati mensili
  const unemploymentData = [];
  const startDate = new Date('2022-01-01');
  const endDate = new Date('2024-11-01');
  let currentRate = 16.5; // Punto di partenza
  
  for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
    // Simula una tendenza in diminuzione con piccole oscillazioni
    currentRate = currentRate - 0.05 + (Math.random() * 0.3 - 0.15);
    currentRate = Math.max(13.5, Math.min(17.5, currentRate)); // Limiti realistici
    
    unemploymentData.push({
      territory: 'Napoli',
      date: new Date(d),
      rate: parseFloat(currentRate.toFixed(2)),
      ageGroup: '15-64',
      gender: 'T'
    });
  }
  
  await prisma.unemploymentStats.createMany({
    data: unemploymentData,
    skipDuplicates: true
  });
  console.log(`✅ Created ${unemploymentData.length} unemployment stats records`);

  // Seed businesses - Più aziende distribuite per Napoli
  const businesses = [
    { osmId: 1, name: 'Caffè Gambrinus', type: 'cafe', lat: 40.8359, lon: 14.2488, quarter: 'Centro Storico' },
    { osmId: 2, name: 'Pizzeria Da Michele', type: 'restaurant', lat: 40.8507, lon: 14.2619, quarter: 'Centro Storico' },
    { osmId: 3, name: 'Coworking Startup Napoli', type: 'coworking', lat: 40.8538, lon: 14.2588, quarter: 'Vomero' },
    { osmId: 4, name: 'Tech Hub Napoli', type: 'office', lat: 40.8448, lon: 14.2534, quarter: 'Chiaia' },
    { osmId: 5, name: 'Ristorante Il Golfo', type: 'restaurant', lat: 40.8275, lon: 14.2478, quarter: 'Posillipo' },
    { osmId: 6, name: 'Negozio Elettronica', type: 'shop', lat: 40.8518, lon: 14.2691, quarter: 'Centro' },
    { osmId: 7, name: 'Supermercato Express', type: 'shop', lat: 40.8398, lon: 14.2555, quarter: 'Chiaia' },
    { osmId: 8, name: 'Farmacia Centrale', type: 'pharmacy', lat: 40.8520, lon: 14.2670, quarter: 'Centro' },
    { osmId: 9, name: 'Hotel Grand Napoli', type: 'hotel', lat: 40.8412, lon: 14.2498, quarter: 'Lungomare' },
    { osmId: 10, name: 'Libreria Moderna', type: 'shop', lat: 40.8488, lon: 14.2612, quarter: 'Vomero' }
  ];

  await prisma.business.createMany({
    data: businesses,
    skipDuplicates: true
  });
  console.log(`✅ Created ${businesses.length} businesses`);

  // Seed jobs - Molte più offerte di lavoro variegate
  const jobs = [
    // IT Sector
    { title: 'Sviluppatore Full Stack', company: 'Tech Napoli SRL', location: 'Napoli Centro', url: 'https://example.com/job1', postedDate: 'recent', sector: 'IT', lat: 40.8518, lon: 14.2681, description: 'Cerchiamo sviluppatore full stack con esperienza in React e Node.js' },
    { title: 'Data Analyst', company: 'Digital Solutions', location: 'Napoli Vomero', url: 'https://example.com/job2', postedDate: 'recent', sector: 'IT', lat: 40.8538, lon: 14.2388, description: 'Analisi dati e business intelligence per azienda in crescita' },
    { title: 'DevOps Engineer', company: 'Cloud Systems SpA', location: 'Napoli Chiaia', url: 'https://example.com/job3', postedDate: 'recent', sector: 'IT', lat: 40.8348, lon: 14.2434, description: 'Gestione infrastrutture cloud e automation' },
    { title: 'Frontend Developer', company: 'WebAgency Napoli', location: 'Napoli Centro Direzionale', url: 'https://example.com/job4', postedDate: 'recent', sector: 'IT', lat: 40.8598, lon: 14.2988, description: 'Sviluppo interfacce moderne con Vue.js e React' },
    { title: 'Backend Developer Java', company: 'Enterprise Solutions', location: 'Napoli Fuorigrotta', url: 'https://example.com/job5', postedDate: 'recent', sector: 'IT', lat: 40.8268, lon: 14.1934, description: 'Sviluppo backend enterprise con Spring Boot' },
    
    // Ristorazione
    { title: 'Cameriere di Sala', company: 'Ristorante Il Golfo', location: 'Napoli Posillipo', url: 'https://example.com/job6', postedDate: 'recent', sector: 'Ristorazione', lat: 40.8275, lon: 14.2178, description: 'Cerchiamo cameriere con esperienza per ristorante sul lungomare' },
    { title: 'Pizzaiolo Esperto', company: 'Pizzeria Tradizione', location: 'Napoli Centro Storico', url: 'https://example.com/job7', postedDate: 'recent', sector: 'Ristorazione', lat: 40.8507, lon: 14.2619, description: 'Pizzeria storica cerca pizzaiolo con esperienza' },
    { title: 'Chef de Partie', company: 'Hotel Grand Napoli', location: 'Napoli Lungomare', url: 'https://example.com/job8', postedDate: 'recent', sector: 'Ristorazione', lat: 40.8412, lon: 14.2498, description: 'Hotel 5 stelle cerca chef de partie per cucina gourmet' },
    { title: 'Barista', company: 'Caffè Gambrinus', location: 'Napoli Piazza Plebiscito', url: 'https://example.com/job9', postedDate: 'recent', sector: 'Ristorazione', lat: 40.8359, lon: 14.2488, description: 'Storico caffè cerca barista qualificato' },
    { title: 'Cuoco', company: 'Trattoria da Nonna', location: 'Napoli Vomero', url: 'https://example.com/job10', postedDate: 'recent', sector: 'Ristorazione', lat: 40.8488, lon: 14.2312, description: 'Trattoria familiare cerca cuoco per cucina tradizionale napoletana' },
    
    // Retail
    { title: 'Commesso Vendita', company: 'Negozio Elettronica', location: 'Napoli Centro', url: 'https://example.com/job11', postedDate: 'recent', sector: 'Retail', lat: 40.8518, lon: 14.2691, description: 'Negozio elettronica cerca commesso part-time' },
    { title: 'Addetto Vendite', company: 'Fashion Store', location: 'Napoli Chiaia', url: 'https://example.com/job12', postedDate: 'recent', sector: 'Retail', lat: 40.8398, lon: 14.2455, description: 'Boutique moda cerca addetto vendite con esperienza' },
    { title: 'Cassiere', company: 'Supermercato Express', location: 'Napoli Vomero', url: 'https://example.com/job13', postedDate: 'recent', sector: 'Retail', lat: 40.8438, lon: 14.2355, description: 'Supermercato cerca cassiere per turni flessibili' },
    { title: 'Visual Merchandiser', company: 'Grandi Magazzini', location: 'Napoli Centro', url: 'https://example.com/job14', postedDate: 'recent', sector: 'Retail', lat: 40.8508, lon: 14.2621, description: 'Catena retail cerca visual merchandiser creativo' },
    
    // Logistica
    { title: 'Magazziniere', company: 'Logistics Express', location: 'Napoli Est', url: 'https://example.com/job15', postedDate: 'recent', sector: 'Logistica', lat: 40.8668, lon: 14.3088, description: 'Azienda logistica cerca magazziniere con patentino muletto' },
    { title: 'Autista Consegne', company: 'Delivery Fast', location: 'Napoli Centro Direzionale', url: 'https://example.com/job16', postedDate: 'recent', sector: 'Logistica', lat: 40.8598, lon: 14.2988, description: 'Corriere cerca autista per consegne urbane' },
    { title: 'Addetto Spedizioni', company: 'Cargo Systems', location: 'Napoli Porto', url: 'https://example.com/job17', postedDate: 'recent', sector: 'Logistica', lat: 40.8398, lon: 14.2688, description: 'Società spedizioni cerca addetto per gestione documenti' },
    
    // Amministrazione
    { title: 'Impiegato Amministrativo', company: 'Studio Commercialista', location: 'Napoli Centro', url: 'https://example.com/job18', postedDate: 'recent', sector: 'Amministrazione', lat: 40.8528, lon: 14.2671, description: 'Studio cerca impiegato per contabilità e fatturazione' },
    { title: 'Segretaria di Direzione', company: 'Law Firm Napoli', location: 'Napoli Chiaia', url: 'https://example.com/job19', postedDate: 'recent', sector: 'Amministrazione', lat: 40.8348, lon: 14.2534, description: 'Studio legale cerca segretaria con esperienza' },
    { title: 'Addetto Paghe', company: 'Consulenza del Lavoro', location: 'Napoli Vomero', url: 'https://example.com/job20', postedDate: 'recent', sector: 'Amministrazione', lat: 40.8488, lon: 14.2412, description: 'Studio consulenza cerca addetto paghe e contributi' },
    { title: 'Contabile Junior', company: 'Finance Solutions', location: 'Napoli Centro Direzionale', url: 'https://example.com/job21', postedDate: 'recent', sector: 'Amministrazione', lat: 40.8598, lon: 14.2988, description: 'Società finanziaria cerca contabile junior' },
    
    // Altro
    { title: 'Receptionist', company: 'Hotel Grand Napoli', location: 'Napoli Lungomare', url: 'https://example.com/job22', postedDate: 'recent', sector: 'Altro', lat: 40.8412, lon: 14.2498, description: 'Hotel 5 stelle cerca receptionist bilingue' },
    { title: 'Educatore', company: 'Cooperativa Sociale', location: 'Napoli Soccavo', url: 'https://example.com/job23', postedDate: 'recent', sector: 'Altro', lat: 40.8298, lon: 14.2088, description: 'Cooperativa cerca educatore per centro giovani' },
    { title: 'Farmacista', company: 'Farmacia Centrale', location: 'Napoli Centro', url: 'https://example.com/job24', postedDate: 'recent', sector: 'Altro', lat: 40.8520, lon: 14.2670, description: 'Farmacia cerca farmacista per turni part-time' },
    { title: 'Grafico Designer', company: 'Creative Agency', location: 'Napoli Chiaia', url: 'https://example.com/job25', postedDate: 'recent', sector: 'Altro', lat: 40.8348, lon: 14.2434, description: 'Agenzia creativa cerca grafico con portfolio' }
  ];

  await prisma.jobListing.createMany({
    data: jobs,
    skipDuplicates: true
  });
  console.log(`✅ Created ${jobs.length} job listings`);

  // Seed livability stats - Dati mensili ultimi 3 anni
  const livabilityData = [];
  const startLiv = new Date('2022-01-01');
  const endLiv = new Date('2024-11-01');
  let rentPrice = 11.5; // €/mq al mese
  let housePrice = 2800; // €/mq vendita
  let costIndex = 95; // Indice costo vita (base Italia=100)
  
  for (let d = new Date(startLiv); d <= endLiv; d.setMonth(d.getMonth() + 1)) {
    // Simula incremento graduale dei prezzi
    rentPrice = rentPrice + (Math.random() * 0.3 - 0.1);
    housePrice = housePrice + (Math.random() * 50 - 20);
    costIndex = costIndex + (Math.random() * 2 - 0.5);
    
    livabilityData.push({
      date: new Date(d),
      avgRentPrice: parseFloat(rentPrice.toFixed(2)),
      avgHousePrice: parseFloat(housePrice.toFixed(0)),
      costOfLivingIndex: parseFloat(costIndex.toFixed(1)),
      transportCost: 35 + Math.random() * 5, // €40/mese
      groceriesCost: 280 + Math.random() * 40 // €300/mese
    });
  }
  
  await prisma.livabilityStats.createMany({
    data: livabilityData,
    skipDuplicates: true
  });
  console.log(`✅ Created ${livabilityData.length} livability stats records`);

  console.log('✅ Seed completed successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
