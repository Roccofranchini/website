<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <h2 class="text-3xl font-bold text-gray-900">Offerte di Lavoro</h2>
      <p class="text-gray-600 mt-2">{{ total }} offerte attive a Napoli</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-center">
        <label class="flex items-center gap-2">
          <span class="text-sm font-medium">Settore:</span>
          <select
            v-model="selectedSector"
            @change="loadJobs"
            class="border rounded px-3 py-2 text-sm"
          >
            <option value="all">Tutti</option>
            <option value="IT">IT</option>
            <option value="Ristorazione">Ristorazione</option>
            <option value="Retail">Retail</option>
            <option value="Logistica">Logistica</option>
            <option value="Amministrazione">Amministrazione</option>
            <option value="Altro">Altro</option>
          </select>
        </label>
      </div>
    </div>

    <!-- Jobs Grid -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"
      ></div>
      <p class="mt-4 text-gray-600">Caricamento offerte...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="job in jobs"
        :key="job.id"
        class="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
      >
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-lg font-bold text-gray-900 flex-1">
            {{ job.title }}
          </h3>
          <span
            v-if="job.sector"
            class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium"
          >
            {{ job.sector }}
          </span>
        </div>

        <div class="space-y-2 text-sm text-gray-600 mb-4">
          <div class="flex items-center gap-2">
            <span>🏢</span>
            <span class="font-medium">{{ job.company }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span>📍</span>
            <span>{{ job.location }}</span>
          </div>
        </div>

        <p
          v-if="job.description"
          class="text-sm text-gray-700 mb-4 line-clamp-3"
        >
          {{ job.description }}
        </p>

        <a
          :href="job.url"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Vedi offerta
          <span>→</span>
        </a>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="!loading && total > limit"
      class="mt-8 flex justify-center gap-2"
    >
      <button
        @click="prevPage"
        :disabled="offset === 0"
        class="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        ← Precedente
      </button>
      <span class="px-4 py-2">
        Pagina {{ currentPage }} di {{ totalPages }}
      </span>
      <button
        @click="nextPage"
        :disabled="offset + limit >= total"
        class="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Successiva →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const jobs = ref([]);
const loading = ref(true);
const selectedSector = ref("all");
const total = ref(0);
const limit = ref(20);
const offset = ref(0);

const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
const totalPages = computed(() => Math.ceil(total.value / limit.value));

async function loadJobs() {
  loading.value = true;
  try {
    const response = await axios.get("/api/jobs", {
      params: {
        sector: selectedSector.value,
        limit: limit.value,
        offset: offset.value,
      },
    });
    jobs.value = response.data.jobs;
    total.value = response.data.total;
  } catch (error) {
    console.error("Error loading jobs:", error);
  } finally {
    loading.value = false;
  }
}

function nextPage() {
  if (offset.value + limit.value < total.value) {
    offset.value += limit.value;
    loadJobs();
    window.scrollTo(0, 0);
  }
}

function prevPage() {
  if (offset.value > 0) {
    offset.value -= limit.value;
    loadJobs();
    window.scrollTo(0, 0);
  }
}

onMounted(() => {
  loadJobs();
});
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
