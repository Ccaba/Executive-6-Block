<template>
  <div class="dashboard-container" :class="{ 'fullscreen-mode': isFullscreen }">
    <!-- Top Header -->
    <header class="header">
      <div class="header-main">
        <div class="header-title-block">
          <div class="brand-pill">
            <span class="live-dot"></span>
            <span class="brand-text">Centralized Executive Board</span>
          </div>
          <h1 class="board-title">{{ boardData.title || 'Executive Performance Board' }}</h1>
          <p class="board-subtitle">{{ boardData.subtitle || 'Six-Block Key Performance Indicators' }}</p>
        </div>

        <div class="header-actions">
          <!-- Central Edit Trigger -->
          <button v-if="!isFullscreen" class="btn-action btn-manage" @click="openManager()">
            <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" />
            </svg>
            <span>Central Update Panel</span>
          </button>

          <!-- Refresh Button -->
          <button
            v-if="!isFullscreen"
            class="btn-action btn-refresh"
            :class="{ spinning: isRefreshing }"
            @click="fetchBoardData(true)"
            title="Refresh KPI Board"
          >
            <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            <span>Sync</span>
          </button>

          <!-- Fullscreen / Display Mode -->
          <button
            class="btn-action btn-fullscreen"
            @click="toggleFullscreen"
            :title="isFullscreen ? 'Exit Fullscreen Mode' : 'Enter TV / Fullscreen Board Mode'"
          >
            <svg v-if="!isFullscreen" class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5v3a1 1 0 01-2 0V4zm14 0a1 1 0 00-1-1h-4a1 1 0 100 2h3v3a1 1 0 102 0V4zM3 16a1 1 0 001 1h4a1 1 0 100-2H5v-3a1 1 0 10-2 0v4zm14 0a1 1 0 01-1 1h-4a1 1 0 110-2h3v-3a1 1 0 112 0v4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 3a1 1 0 011 1v3h3a1 1 0 110 2H8a1 1 0 01-1-1V4a1 1 0 011-1zm4 14a1 1 0 01-1-1v-3H8a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 01-1 1z" clip-rule="evenodd" />
            </svg>
            <span>{{ isFullscreen ? 'Exit TV Mode' : 'TV / Display Mode' }}</span>
          </button>
        </div>
      </div>

      <!-- Overview Stats Summary Bar -->
      <div class="summary-bar">
        <div class="status-counters">
          <div class="summary-pill total">
            <span class="pill-label">Total Indicators:</span>
            <span class="pill-val">6</span>
          </div>

          <div class="summary-pill meeting">
            <span class="dot-green"></span>
            <span class="pill-label">Meeting Goal:</span>
            <span class="pill-val">{{ meetingCount }}</span>
          </div>

          <div class="summary-pill not-meeting">
            <span class="dot-red"></span>
            <span class="pill-label">Not Meeting Goal:</span>
            <span class="pill-val">{{ notMeetingCount }}</span>
          </div>
        </div>

        <div class="sync-info">
          <span class="sync-text">
            Central Sync: <strong>{{ lastSyncFormatted }}</strong>
          </span>
          <span class="auto-sync-badge">Auto-sync active</span>
        </div>
      </div>
    </header>

    <!-- KPI 6-Block Grid -->
    <main class="grid-container">
      <div class="kpi-grid">
        <KpiCard
          v-for="kpi in boardData.kpis"
          :key="kpi.id"
          :kpi="kpi"
          @edit="openManager(kpi.id)"
        />
      </div>
    </main>

    <!-- Toast Notification -->
    <div v-if="toastMessage" class="toast-notification">
      <span class="toast-icon">✓</span>
      <span>{{ toastMessage }}</span>
    </div>

    <!-- Central KPI Edit Modal -->
    <KpiEditModal
      v-if="isModalOpen"
      :kpis="boardData.kpis"
      :initial-selected-id="selectedKpiId"
      :saving="isSaving"
      @close="isModalOpen = false"
      @save="handleSaveKpis"
      @reset="handleResetDefaults"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { BoardData, KPIItem } from '../types/kpi';
import { DEFAULT_BOARD_DATA } from '../types/kpi';

const boardData = ref<BoardData>(JSON.parse(JSON.stringify(DEFAULT_BOARD_DATA)));
const isModalOpen = ref(false);
const selectedKpiId = ref<string | undefined>(undefined);
const isRefreshing = ref(false);
const isSaving = ref(false);
const isFullscreen = ref(false);
const toastMessage = ref<string | null>(null);
let pollTimer: ReturnType<typeof setInterval> | null = null;

const meetingCount = computed(() => {
  return boardData.value.kpis.filter((k) => k.status === 'meeting').length;
});

const notMeetingCount = computed(() => {
  return boardData.value.kpis.filter((k) => k.status === 'not_meeting').length;
});

const lastSyncFormatted = computed(() => {
  if (!boardData.value.lastSync) return 'Never';
  try {
    const d = new Date(boardData.value.lastSync);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return boardData.value.lastSync;
  }
});

async function fetchBoardData(showToast = false) {
  // Do not perform background poll updates while the edit modal is open
  if (isModalOpen.value && !showToast) {
    return;
  }
  isRefreshing.value = true;
  try {
    const data = await $fetch<BoardData>('/api/kpis');
    if (data && data.kpis && data.kpis.length === 6) {
      boardData.value = data;
      if (showToast) {
        showToastNotification('Synced with central storage');
      }
    }
  } catch (err) {
    console.error('Failed to load KPIs:', err);
  } finally {
    setTimeout(() => {
      isRefreshing.value = false;
    }, 400);
  }
}

async function handleSaveKpis(updatedKpis: KPIItem[]) {
  isSaving.value = true;
  try {
    const response = await $fetch<BoardData>('/api/kpis', {
      method: 'PUT',
      body: {
        kpis: updatedKpis
      }
    });
    boardData.value = response;
    isModalOpen.value = false;
    showToastNotification('All 6 KPIs updated & published centrally!');
  } catch (err) {
    console.error('Failed to save KPIs:', err);
    alert('Failed to save KPI updates. Please try again.');
  } finally {
    isSaving.value = false;
  }
}

async function handleResetDefaults() {
  if (confirm('Are you sure you want to reset all 6 KPIs to the default values?')) {
    isSaving.value = true;
    try {
      const response = await $fetch<BoardData>('/api/kpis/reset', {
        method: 'POST'
      });
      boardData.value = response;
      isModalOpen.value = false;
      showToastNotification('KPIs reset to default values.');
    } catch (err) {
      console.error('Failed to reset KPIs:', err);
    } finally {
      isSaving.value = false;
    }
  }
}

function openManager(kpiId?: string) {
  selectedKpiId.value = kpiId || boardData.value.kpis[0]?.id;
  isModalOpen.value = true;
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      isFullscreen.value = true;
    }).catch(() => {
      isFullscreen.value = !isFullscreen.value;
    });
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false;
    }).catch(() => {
      isFullscreen.value = false;
    });
  }
}

function showToastNotification(msg: string) {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = null;
    }
  }, 3000);
}

onMounted(() => {
  fetchBoardData();
  // Poll centrally every 5 seconds so any other screen updates automatically
  pollTimer = setInterval(() => {
    fetchBoardData(false);
  }, 5000);

  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement;
  });
});

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer);
  }
});
</script>

<style>
/* Global Resets & Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #0f172a;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: radial-gradient(circle at top, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  color: #f8fafc;
  transition: all 0.3s ease;
}

.dashboard-container.fullscreen-mode {
  padding: 1rem 1.5rem;
}

/* Header */
.header {
  margin-bottom: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.header-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.25rem;
}

.header-title-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.brand-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  width: fit-content;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-live 2s infinite;
}

@keyframes pulse-live {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.brand-text {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #60a5fa;
}

.board-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.board-subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #94a3b8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.btn-manage {
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
}

.btn-manage:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(59, 130, 246, 0.45);
}

.btn-refresh {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
}

.btn-refresh:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-refresh.spinning .btn-icon {
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.btn-fullscreen {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: #f8fafc;
}

.btn-fullscreen:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* Summary Bar */
.summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 1rem;
  backdrop-filter: blur(8px);
}

.status-counters {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.summary-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
}

.summary-pill.total {
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
}

.summary-pill.meeting {
  background: rgba(16, 185, 129, 0.18);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.dot-green {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.summary-pill.not-meeting {
  background: rgba(239, 68, 68, 0.18);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.dot-red {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
}

.pill-val {
  font-weight: 800;
  font-size: 0.95rem;
}

.sync-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: #94a3b8;
}

.auto-sync-badge {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 700;
}

/* 6-Block Grid Layout */
.grid-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  flex: 1;
}

@media (max-width: 1024px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 680px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .dashboard-container {
    padding: 1rem;
  }
  .header-main {
    flex-direction: column;
  }
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #065f46;
  color: #ecfdf5;
  border: 1px solid #10b981;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 10000;
  animation: toast-in 0.2s ease-out;
}

.toast-icon {
  background: #10b981;
  color: #ffffff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
}

@keyframes toast-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
