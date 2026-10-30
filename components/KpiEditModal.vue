<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-dialog">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-titles">
          <span class="modal-badge">Central Update Manager</span>
          <h2 class="modal-title">
            {{ activeIndex !== null ? `Edit KPI #${activeIndex + 1}` : 'Central KPI Manager' }}
          </h2>
        </div>
        <button class="close-btn" @click="$emit('close')" aria-label="Close modal">
          ✕
        </button>
      </div>

      <!-- KPI Navigation Tabs (KPI 1 to 6) -->
      <div class="kpi-tabs">
        <button
          v-for="(item, idx) in localKpis"
          :key="item.id"
          class="tab-btn"
          :class="{
            active: selectedId === item.id,
            'status-pill-meeting': item.status === 'meeting',
            'status-pill-not-meeting': item.status === 'not_meeting'
          }"
          @click="selectedId = item.id"
        >
          <span class="tab-index">#{{ idx + 1 }}</span>
          <span class="tab-type">{{ formatType(item.type) }}</span>
          <span class="tab-indicator" :class="item.status"></span>
        </button>
      </div>

      <!-- Form Body for the currently selected KPI -->
      <div v-if="currentKpi" class="modal-body">
        <div class="form-grid">
          <!-- 1) Indicator Type -->
          <div class="form-group full-width">
            <label class="form-label">
              <span class="num-badge">1</span>
              Indicator Type
              <span class="required">*</span>
            </label>
            <div class="type-selector-group">
              <label
                v-for="t in typeOptions"
                :key="t.value"
                class="type-radio-card"
                :class="{ selected: currentKpi.type === t.value, [t.value]: true }"
              >
                <input
                  type="radio"
                  name="indicatorType"
                  :value="t.value"
                  v-model="currentKpi.type"
                  class="sr-only"
                />
                <span class="type-radio-icon">{{ t.icon }}</span>
                <span class="type-radio-label">{{ t.label }}</span>
              </label>
            </div>
          </div>

          <!-- 2) Date of Last Update -->
          <div class="form-group">
            <label class="form-label" for="lastUpdatedInput">
              <span class="num-badge">2</span>
              Date of Last Update
              <span class="required">*</span>
            </label>
            <div class="date-input-wrapper">
              <input
                id="lastUpdatedInput"
                type="date"
                v-model="currentKpi.lastUpdated"
                class="form-control"
                required
              />
              <button
                type="button"
                class="btn-today"
                @click="setToday"
                title="Set to today's date"
              >
                Today
              </button>
            </div>
          </div>

          <!-- 3) Title of the Metric -->
          <div class="form-group full-width">
            <label class="form-label" for="titleInput">
              <span class="num-badge">3</span>
              Title of the Metric
              <span class="required">*</span>
            </label>
            <input
              id="titleInput"
              type="text"
              v-model="currentKpi.title"
              placeholder="e.g. Total Recordable Incident Rate (TRIR)"
              class="form-control"
              required
            />
          </div>

          <!-- 4) Current Measure / Number -->
          <div class="form-group">
            <label class="form-label" for="measureInput">
              <span class="num-badge">4</span>
              Current Measure / Number
              <span class="required">*</span>
            </label>
            <input
              id="measureInput"
              type="text"
              v-model="currentKpi.currentMeasure"
              placeholder="e.g. 0.42, 99.4%, $14.20"
              class="form-control font-bold"
              required
            />
          </div>

          <!-- Target / Goal Reference -->
          <div class="form-group">
            <label class="form-label" for="goalInput">
              Target Goal Reference
            </label>
            <input
              id="goalInput"
              type="text"
              v-model="currentKpi.goal"
              placeholder="e.g. < 0.75, ≥ 98.5%"
              class="form-control"
            />
          </div>

          <!-- 5) Goal Comparison (Red / Green) -->
          <div class="form-group full-width">
            <label class="form-label">
              <span class="num-badge">5</span>
              Comparison to Goal (Color Coded)
              <span class="required">*</span>
            </label>
            <div class="status-choice-group">
              <label
                class="status-choice-card status-meeting-card"
                :class="{ active: currentKpi.status === 'meeting' }"
              >
                <input
                  type="radio"
                  name="goalStatus"
                  value="meeting"
                  v-model="currentKpi.status"
                  class="sr-only"
                />
                <div class="status-card-inner">
                  <span class="status-badge-circle green-circle">✓</span>
                  <div>
                    <div class="status-card-title green-text">Meeting Goal (Green)</div>
                    <div class="status-card-desc">Performance is currently achieving or exceeding target</div>
                  </div>
                </div>
              </label>

              <label
                class="status-choice-card status-not-meeting-card"
                :class="{ active: currentKpi.status === 'not_meeting' }"
              >
                <input
                  type="radio"
                  name="goalStatus"
                  value="not_meeting"
                  v-model="currentKpi.status"
                  class="sr-only"
                />
                <div class="status-card-inner">
                  <span class="status-badge-circle red-circle">✕</span>
                  <div>
                    <div class="status-card-title red-text">Not Meeting Goal (Red)</div>
                    <div class="status-card-desc">Performance is below target or requires corrective action</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Notes / Context (optional) -->
          <div class="form-group full-width">
            <label class="form-label" for="notesInput">
              Notes / Context (Optional)
            </label>
            <input
              id="notesInput"
              type="text"
              v-model="currentKpi.notes"
              placeholder="e.g. Operational notes, root causes, or mitigation actions"
              class="form-control"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer Actions -->
      <div class="modal-footer">
        <div class="footer-left">
          <button
            type="button"
            class="btn-secondary btn-reset"
            @click="$emit('reset')"
            title="Reset all 6 KPIs to default preset"
          >
            Reset Defaults
          </button>
        </div>

        <div class="footer-right">
          <button type="button" class="btn-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button
            type="button"
            class="btn-primary"
            :disabled="saving"
            @click="handleSave"
          >
            <span v-if="saving">Saving...</span>
            <span v-else>Save & Publish Centrally</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { KPIItem, IndicatorType } from '../../types/kpi';

const props = defineProps<{
  kpis: KPIItem[];
  initialSelectedId?: string;
  saving?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', updatedKpis: KPIItem[]): void;
  (e: 'reset'): void;
}>();

const localKpis = ref<KPIItem[]>(JSON.parse(JSON.stringify(props.kpis)));
const selectedId = ref<string>(props.initialSelectedId || props.kpis[0]?.id || '');

watch(() => props.initialSelectedId, (newId) => {
  if (newId) {
    selectedId.value = newId;
  }
});

const currentKpi = computed(() => {
  return localKpis.value.find((k) => k.id === selectedId.value) || localKpis.value[0];
});

const activeIndex = computed(() => {
  return localKpis.value.findIndex((k) => k.id === selectedId.value);
});

const typeOptions: { value: IndicatorType; label: string; icon: string }[] = [
  { value: 'safety', label: 'Safety', icon: '🛡️' },
  { value: 'quality', label: 'Quality', icon: '⭐' },
  { value: 'experience', label: 'Experience', icon: '💬' },
  { value: 'value', label: 'Value', icon: '💰' },
  { value: 'people', label: 'People', icon: '👥' }
];

function formatType(type: IndicatorType): string {
  const map: Record<IndicatorType, string> = {
    safety: 'Safety',
    quality: 'Quality',
    experience: 'Experience',
    value: 'Value',
    people: 'People'
  };
  return map[type] || type;
}

function setToday() {
  if (currentKpi.value) {
    currentKpi.value.lastUpdated = new Date().toISOString().split('T')[0];
  }
}

function handleSave() {
  // Ensure date is set
  localKpis.value.forEach((k) => {
    if (!k.lastUpdated) {
      k.lastUpdated = new Date().toISOString().split('T')[0];
    }
  });
  emit('save', localKpis.value);
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 820px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  animation: modal-appear 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modal-appear {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-header {
  padding: 1.25rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #4f46e5;
  background: #e0e7ff;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.modal-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
}

.close-btn {
  background: #e2e8f0;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-size: 1rem;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: #cbd5e1;
  color: #0f172a;
}

/* Tabs */
.kpi-tabs {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.35rem;
  padding: 0.75rem 1.75rem;
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.5rem 0.35rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: #ffffff;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.tab-btn.active {
  background: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.tab-index {
  font-size: 0.72rem;
  font-weight: 800;
  color: #64748b;
}

.tab-type {
  font-size: 0.75rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.tab-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tab-indicator.meeting {
  background: #10b981;
}

.tab-indicator.not_meeting {
  background: #ef4444;
}

/* Modal Body */
.modal-body {
  padding: 1.5rem 1.75rem;
  overflow-y: auto;
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.num-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 800;
}

.required {
  color: #ef4444;
}

.form-control {
  padding: 0.65rem 0.85rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
  background: #ffffff;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.font-bold {
  font-weight: 700;
  font-size: 1.15rem;
}

/* Indicator Type Selector */
.type-selector-group {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.5rem;
}

.type-radio-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.4rem;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.type-radio-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.type-radio-card.selected {
  border-color: #4f46e5;
  background: #eef2ff;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.type-radio-icon {
  font-size: 1.3rem;
  margin-bottom: 0.2rem;
}

.type-radio-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #1e293b;
}

/* Date input wrapper */
.date-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.date-input-wrapper input {
  flex: 1;
}

.btn-today {
  padding: 0.65rem 0.9rem;
  background: #f1f5f9;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-today:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Goal Status Cards (Meeting / Not Meeting) */
.status-choice-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.status-choice-card {
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.85rem;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #ffffff;
}

.status-choice-card:hover {
  border-color: #cbd5e1;
}

.status-choice-card.status-meeting-card.active {
  border-color: #10b981;
  background: #f0fdf4;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
}

.status-choice-card.status-not-meeting-card.active {
  border-color: #ef4444;
  background: #fef2f2;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25);
}

.status-card-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-badge-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  flex-shrink: 0;
}

.green-circle {
  background: #10b981;
  color: #ffffff;
}

.red-circle {
  background: #ef4444;
  color: #ffffff;
}

.status-card-title {
  font-size: 0.95rem;
  font-weight: 800;
}

.green-text {
  color: #047857;
}

.red-text {
  color: #b91c1c;
}

.status-card-desc {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.15rem;
}

/* Modal Footer */
.modal-footer {
  padding: 1.25rem 1.75rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 0.75rem;
}

.btn-secondary {
  padding: 0.65rem 1.2rem;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-secondary:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.btn-reset {
  color: #dc2626;
  border-color: #fca5a5;
  background: #fff5f5;
}

.btn-reset:hover {
  background: #fee2e2;
  color: #991b1b;
}

.btn-primary {
  padding: 0.65rem 1.4rem;
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
  transition: all 0.15s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (max-width: 640px) {
  .type-selector-group {
    grid-template-columns: repeat(3, 1fr);
  }
  .status-choice-group {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
