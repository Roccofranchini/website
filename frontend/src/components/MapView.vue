<template>
  <div class="relative h-[calc(100vh-120px)]">
    <div id="map" class="w-full h-full"></div>

    <!-- Legend -->
    <div
      class="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-xs z-[1000]"
    >
      <h3 class="font-bold mb-3 text-gray-900">Legenda</h3>

      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Aziende/Negozi</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Offerte di Lavoro</span>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t">
        <p class="text-xs text-gray-600">Click sui marker per dettagli</p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-[999]"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Caricamento mappa...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const loading = ref(true);

// Fix per icone Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

onMounted(async () => {
  try {
    // Inizializza mappa centrata su Napoli
    const map = L.map("map").setView([40.8518, 14.2681], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // Fetch businesses
    const businessesResponse = await axios.get("/api/jobs/businesses");
    const businesses = businessesResponse.data;

    // Aggiungi marker businesses (blu)
    businesses.forEach((biz) => {
      L.circleMarker([biz.lat, biz.lon], {
        radius: 5,
        fillColor: "#3b82f6",
        color: "#1e40af",
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.6,
      })
        .bindPopup(
          `
        <div class="p-2">
          <h4 class="font-bold text-sm">${biz.name}</h4>
          <p class="text-xs text-gray-600">${biz.type}</p>
          ${biz.quarter ? `<p class="text-xs mt-1">📍 ${biz.quarter}</p>` : ""}
        </div>
      `
        )
        .addTo(map);
    });

    // Fetch job listings
    const jobsResponse = await axios.get("/api/jobs/map");
    const jobs = jobsResponse.data;

    // Aggiungi marker jobs (verde)
    jobs.forEach((job) => {
      if (job.lat && job.lon) {
        L.circleMarker([job.lat, job.lon], {
          radius: 6,
          fillColor: "#22c55e",
          color: "#15803d",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
        })
          .bindPopup(
            `
          <div class="p-2 max-w-xs">
            <h4 class="font-bold text-sm">${job.title}</h4>
            <p class="text-xs text-gray-600">${job.company}</p>
            <span class="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
              ${job.sector}
            </span>
          </div>
        `
          )
          .addTo(map);
      }
    });

    loading.value = false;
  } catch (error) {
    console.error("Error loading map:", error);
    loading.value = false;
  }
});
</script>
