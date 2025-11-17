<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900">Analisi Disoccupazione</h2>
      <p class="text-gray-600 mt-2">Ultimi {{ years }} anni - Dati ISTAT</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div
        class="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg"
      >
        <h3 class="text-sm font-medium opacity-90">Tasso Attuale</h3>
        <p class="text-4xl font-bold mt-2">{{ currentRate }}%</p>
        <span
          class="text-sm mt-2 inline-block"
          :class="trend >= 0 ? 'opacity-75' : 'opacity-90'"
        >
          {{ trend >= 0 ? "↑" : "↓" }} {{ Math.abs(trend).toFixed(1) }}% vs anno
          scorso
        </span>
      </div>

      <div
        class="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg"
      >
        <h3 class="text-sm font-medium opacity-90">Offerte Attive</h3>
        <p class="text-4xl font-bold mt-2">{{ activeJobs }}</p>
        <span class="text-sm mt-2 inline-block opacity-75"
          >Ultimi 30 giorni</span
        >
      </div>

      <div
        class="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg"
      >
        <h3 class="text-sm font-medium opacity-90">Settore Top</h3>
        <p class="text-3xl font-bold mt-2">{{ topSector }}</p>
        <span class="text-sm mt-2 inline-block opacity-75"
          >{{ topSectorCount }} offerte</span
        >
      </div>
    </div>

    <!-- Chart -->
    <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h3 class="text-xl font-bold mb-4">Andamento Storico</h3>
      <div v-if="loading" class="h-96 flex items-center justify-center">
        <div class="text-gray-400">Caricamento dati...</div>
      </div>
      <div v-else-if="error" class="h-96 flex items-center justify-center">
        <div class="text-red-500">{{ error }}</div>
      </div>
      <div v-else style="position: relative; height: 400px; width: 100%;">
        <canvas ref="chartCanvas" style="display: block; width: 100%; height: 100%;"></canvas>
      </div>
    </div>

    <!-- Sectors Breakdown -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h3 class="text-xl font-bold mb-4">Settori con Più Offerte</h3>
      <div class="space-y-3">
        <div
          v-for="sector in sectors"
          :key="sector.sector"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <span class="font-medium">{{ sector.sector }}</span>
          <div class="flex items-center space-x-3">
            <div class="w-32 bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-500 h-2 rounded-full"
                :style="{
                  width: `${(sector.count / sectors[0].count) * 100}%`,
                }"
              ></div>
            </div>
            <span class="text-sm font-bold text-gray-700 w-12 text-right">{{
              sector.count
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { Chart } from "chart.js/auto";
import axios from "axios";

const chartCanvas = ref(null);
const loading = ref(true);
const error = ref(null);
const currentRate = ref(0);
const trend = ref(0);
const activeJobs = ref(0);
const topSector = ref("");
const topSectorCount = ref(0);
const sectors = ref([]);
const years = ref(5);

onMounted(async () => {
  try {
    console.log('📊 Dashboard: Starting data fetch...');
    
    // Fetch current stats
    const currentResponse = await axios.get("/api/stats/current");
    console.log('✓ Current stats:', currentResponse.data);
    currentRate.value = currentResponse.data.currentUnemploymentRate.toFixed(1);
    activeJobs.value = currentResponse.data.activeJobs;
    topSector.value = currentResponse.data.topSector;
    topSectorCount.value = currentResponse.data.topSectorCount;

    // Fetch trend data
    const trendResponse = await axios.get(
      `/api/stats/unemployment/trend?years=${years.value}`
    );
    const data = trendResponse.data.data;
    console.log('✓ Trend data received:', data.length, 'records');
    console.log('First record:', data[0]);
    console.log('Last record:', data[data.length - 1]);

    // Calculate trend
    if (data.length > 12) {
      const lastYear = data[data.length - 12].rate;
      trend.value = ((currentRate.value - lastYear) / lastYear) * 100;
    }

    // Fetch sectors
    const sectorsResponse = await axios.get("/api/stats/sectors");
    sectors.value = sectorsResponse.data;
    console.log('✓ Sectors received:', sectors.value.length);

    // Set loading to false first to render the canvas
    loading.value = false;

    // Wait for DOM to update
    await nextTick();

    // Check if canvas exists
    if (!chartCanvas.value) {
      console.error('❌ Canvas ref is null after nextTick!');
      error.value = 'Errore: canvas non trovato';
      return;
    }
    
    console.log('✓ Canvas element found, creating chart...');
    console.log('Canvas dimensions:', chartCanvas.value.width, 'x', chartCanvas.value.height);
    console.log('Canvas parent dimensions:', chartCanvas.value.parentElement.offsetWidth, 'x', chartCanvas.value.parentElement.offsetHeight);

    // Prepare chart data
    const labels = data.map((d) => {
      const date = new Date(d.date);
      return date.toLocaleDateString("it-IT", {
        month: "short",
        year: "numeric",
      });
    });
    const rates = data.map((d) => d.rate);
    
    console.log('Chart labels sample:', labels.slice(0, 3));
    console.log('Chart rates sample:', rates.slice(0, 3));

    try {
      // Create chart
      const chartInstance = new Chart(chartCanvas.value, {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Tasso Disoccupazione (%)",
              data: rates,
              borderColor: "#3b82f6",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.parsed.y.toFixed(1)}%`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: (value) => `${value}%`,
              },
            },
          },
        },
      });

      console.log('✅ Chart created successfully!');
      console.log('Chart instance:', chartInstance);
    } catch (chartError) {
      console.error('❌ Error creating chart:', chartError);
      error.value = `Errore nella creazione del grafico: ${chartError.message}`;
    }
  } catch (err) {
    console.error("❌ Error loading dashboard:", err);
    console.error("Error details:", err.response?.data || err.message);
    error.value = `Errore nel caricamento dei dati: ${err.message}`;
    loading.value = false;
  }
});
</script>
