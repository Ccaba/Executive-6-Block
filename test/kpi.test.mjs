import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DEFAULT_BOARD_DATA, DEFAULT_KPIS } from '../types/kpi.ts';
import { getStoredBoardData, saveStoredBoardData, updateSingleKpi, resetBoardData } from '../server/utils/kpiStorage.ts';

describe('Six Block KPI Performance Board', () => {
  it('should have exactly six KPI items defined', () => {
    assert.strictEqual(DEFAULT_KPIS.length, 6);
    assert.strictEqual(DEFAULT_BOARD_DATA.kpis.length, 6);
  });

  it('each KPI item must contain all 5 required component properties', () => {
    const validTypes = ['safety', 'quality', 'experience', 'value', 'people'];
    const validStatuses = ['meeting', 'not_meeting'];

    DEFAULT_KPIS.forEach((kpi, index) => {
      // 1) The type of indicator (safety, quality, experience, value, or people)
      assert.ok(validTypes.includes(kpi.type), `KPI #${index + 1} has invalid type: ${kpi.type}`);

      // 2) The date of last update
      assert.ok(typeof kpi.lastUpdated === 'string', `KPI #${index + 1} missing lastUpdated date field`);

      // 3) The title of the metric
      assert.ok(typeof kpi.title === 'string', `KPI #${index + 1} missing title field`);

      // 4) The current measure / number
      assert.ok(typeof kpi.currentMeasure === 'string', `KPI #${index + 1} missing currentMeasure field`);

      // 5) How the stated value compares to the goal (color coded meeting / not meeting)
      assert.ok(validStatuses.includes(kpi.status), `KPI #${index + 1} missing valid goal status`);
    });
  });

  it('all KPIs start blank by default', () => {
    DEFAULT_KPIS.forEach((kpi, index) => {
      assert.strictEqual(kpi.title, '', `KPI #${index + 1} should have blank title to start`);
      assert.strictEqual(kpi.currentMeasure, '', `KPI #${index + 1} should have blank currentMeasure to start`);
      assert.strictEqual(kpi.goal, '', `KPI #${index + 1} should have blank goal to start`);
    });
  });

  it('covers all five required indicator types across the board', () => {
    const typesInDefault = new Set(DEFAULT_KPIS.map(k => k.type));
    const requiredTypes = ['safety', 'quality', 'experience', 'value', 'people'];
    requiredTypes.forEach(t => {
      assert.ok(typesInDefault.has(t), `Board should have indicator of type: ${t}`);
    });
  });

  it('supports updating a single KPI centrally', () => {
    const updated = updateSingleKpi('kpi-1', {
      title: 'Updated Safety Metric',
      currentMeasure: '0.15',
      status: 'meeting',
      lastUpdated: '2026-09-11'
    });

    const targetKpi = updated.kpis.find(k => k.id === 'kpi-1');
    assert.ok(targetKpi);
    assert.strictEqual(targetKpi.title, 'Updated Safety Metric');
    assert.strictEqual(targetKpi.currentMeasure, '0.15');
    assert.strictEqual(targetKpi.status, 'meeting');
    assert.strictEqual(targetKpi.lastUpdated, '2026-09-11');
  });

  it('supports full board data save and reset to defaults', () => {
    const resetResult = resetBoardData();
    assert.strictEqual(resetResult.kpis.length, 6);
    assert.strictEqual(resetResult.kpis[0].title, DEFAULT_KPIS[0].title);
    assert.strictEqual(resetResult.kpis[0].currentMeasure, DEFAULT_KPIS[0].currentMeasure);
  });
});
