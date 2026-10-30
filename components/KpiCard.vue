<template>
  <div
    class="kpi-card"
    :class="[
      `status-${kpi.status}`,
      `type-${kpi.type}`
    ]"
    @click="$emit('edit', kpi)"
    role="button"
    tabindex="0"
    :aria-label="`KPI Card: ${kpi.title}`"
  >
    <!-- Card Header: Type Badge & Last Update Date -->
    <div class="card-top-bar">
      <div class="type-badge" :class="kpi.type">
        <span class="type-icon">{{ typeIcon(kpi.type) }}</span>
        <span class="type-name">{{ formatType(kpi.type) }}</span>
      </div>

      <div class="date-badge" title="Date of last update">
        <svg class="icon-clock" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
        <span>{{ formatDate(kpi.lastUpdated) }}</span>
      </div>
    </div>

    <!-- Metric Title -->
    <div class="metric-header">
      <h3 class="metric-title" :class="{ 'is-blank': !kpi.title }" :title="kpi.title || 'Blank Metric'">
        {{ kpi.title || '—' }}
      </h3>
    </div>

    <!-- Current Measure / Number -->
    <div class="measure-section">
      <div class="measure-display">
        <span class="measure-number" :class="{ 'is-blank': !kpi.currentMeasure }">{{ kpi.currentMeasure || '—' }}</span>
      </div>
      <div v-if="kpi.goal" class="goal-reference">
        <span class="goal-label">Target Goal:</span>
        <span class="goal-value">{{ kpi.goal }}</span>
      </div>
    </div>

    <!-- Goal Comparison Status (Color Coded Red / Green) -->
    <div class="card-footer">
      <div
        class="status-pill"
        :class="kpi.status === 'meeting' ? 'status-meeting' : 'status-not-meeting'"
      >
        <span class="status-indicator-dot"></span>
        <span class="status-text">
          {{ kpi.status === 'meeting' ? 'Meeting Goal' : 'Not Meeting Goal' }}
        </span>
        <span class="status-symbol">
          {{ kpi.status === 'meeting' ? '✓' : '✕' }}
        </span>
      </div>

      <button
        class="edit-action-btn"
        @click.stop="$emit('edit', kpi)"
        title="Edit this KPI"
      >
        <svg class="icon-edit" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        <span>Update</span>
      </button>
    </div>

    <!-- Optional Notes/Context Footer -->
    <div v-if="kpi.notes" class="kpi-notes" :title="kpi.notes">
      <span class="notes-icon">ℹ</span>
      <span class="notes-text">{{ kpi.notes }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { KPIItem, IndicatorType } from '../../types/kpi';

const props = defineProps<{
  kpi: KPIItem;
}>();

defineEmits<{
  (e: 'edit', kpi: KPIItem): void;
}>();

function formatType(type: IndicatorType): string {
  const map: Record<IndicatorType, string> = {
    safety: 'Safety',
    quality: 'Quality',
    experience: 'Experience',
    value: 'Value',
    people: 'People'
  };
  return map[type] || type.toUpperCase();
}

function typeIcon(type: IndicatorType): string {
  const icons: Record<IndicatorType, string> = {
    safety: '🛡️',
    quality: '⭐',
    experience: '💬',
    value: '💰',
    people: '👥'
  };
  return icons[type] || '📊';
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Not set';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    if (year && month && day) {
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}
</script>

<style scoped>
.kpi-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
  border: 2px solid transparent;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  min-height: 280px;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06);
}

/* Status: Meeting Goal (GREEN) */
.kpi-card.status-meeting {
  border-color: #10b981;
  background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 40%);
}

.kpi-card.status-meeting:hover {
  border-color: #059669;
  box-shadow: 0 12px 28px -4px rgba(16, 185, 129, 0.2);
}

/* Status: Not Meeting Goal (RED) */
.kpi-card.status-not_meeting {
  border-color: #ef4444;
  background: linear-gradient(180deg, #fef2f2 0%, #ffffff 40%);
}

.kpi-card.status-not_meeting:hover {
  border-color: #dc2626;
  box-shadow: 0 12px 28px -4px rgba(239, 68, 68, 0.2);
}

/* Card Top Bar */
.card-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  border-radius: 9999px;
  font-size: 1.35rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-badge.safety {
  background: #e0e7ff;
  color: #3730a3;
}

.type-badge.quality {
  background: #fef3c7;
  color: #92400e;
}

.type-badge.experience {
  background: #e0f2fe;
  color: #0369a1;
}

.type-badge.value {
  background: #f3e8ff;
  color: #6b21a8;
}

.type-badge.people {
  background: #fce7f3;
  color: #9d174d;
}

.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
  background: #f8fafc;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.icon-clock {
  width: 14px;
  height: 14px;
  color: #94a3b8;
}

/* Metric Title */
.metric-header {
  margin-bottom: 1rem;
  text-align: center;
}

.metric-title {
  margin: 0;
  font-size: 1.95rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
  text-align: center;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.metric-title.is-blank {
  color: #94a3b8;
  font-weight: 500;
}

/* Measure / Number */
.measure-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  padding: 1.25rem 0.85rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  text-align: center;
}

.measure-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

.measure-number {
  font-size: 9.2rem;
  font-weight: 800;
  line-height: 1.02;
  color: #0f172a;
  font-feature-settings: 'tnum';
  letter-spacing: -0.03em;
  text-align: center;
}

.measure-number.is-blank {
  color: #cbd5e1;
}

.goal-reference {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-size: 1.28rem;
  color: #64748b;
}

.goal-label {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 1.08rem;
  letter-spacing: 0.04em;
}

.goal-value {
  font-weight: 600;
  color: #334155;
  font-size: 1.28rem;
}

/* Status Pill & Goal Comparison */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 1.28rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  transition: all 0.2s ease;
}

/* Green Status */
.status-pill.status-meeting {
  background-color: #10b981;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
}

/* Red Status */
.status-pill.status-not-meeting {
  background-color: #ef4444;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35);
}

.status-indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ffffff;
  animation: pulse-dot 2s infinite ease-in-out;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.85); }
}

.status-symbol {
  font-weight: 800;
  font-size: 1.4rem;
}

.edit-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.4rem 0.7rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.edit-action-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.icon-edit {
  width: 14px;
  height: 14px;
}

/* Notes */
.kpi-notes {
  margin-top: 0.75rem;
  padding-top: 0.6rem;
  border-top: 1px dashed #e2e8f0;
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notes-icon {
  font-size: 0.75rem;
  color: #94a3b8;
}

.notes-text {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
