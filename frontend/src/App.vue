<template>
  <div class="min-h-screen">
    <nav class="bg-white shadow-sm border-b">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="text-3xl">📊</div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Napoli Pulse</h1>
              <p class="text-sm text-gray-500">Monitor Socio-Economico</p>
            </div>
          </div>

          <div class="flex space-x-4">
            <button
              @click="currentView = 'dashboard'"
              :class="
                currentView === 'dashboard'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600'
              "
              class="px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Dashboard
            </button>
            <button
              @click="currentView = 'map'"
              :class="
                currentView === 'map'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600'
              "
              class="px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Mappa
            </button>
            <button
              @click="currentView = 'jobs'"
              :class="
                currentView === 'jobs'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600'
              "
              class="px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Offerte
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main>
      <TrendDashboard v-if="currentView === 'dashboard'" />
      <MapView v-else-if="currentView === 'map'" />
      <JobsList v-else-if="currentView === 'jobs'" />
    </main>

    <footer class="bg-white border-t mt-16 py-8">
      <div class="container mx-auto px-4 text-center text-gray-600">
        <p>🚀 Napoli Pulse - Dati aperti per il territorio</p>
        <p class="text-sm mt-2">Fonti: ISTAT, OpenStreetMap, Indeed</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import TrendDashboard from "./components/TrendDashboard.vue";
import MapView from "./components/MapView.vue";
import JobsList from "./components/JobsList.vue";

const currentView = ref("dashboard");
</script>
