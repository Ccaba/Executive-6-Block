import { updateSingleKpi } from '../../utils/kpiStorage';
import type { KPIItem } from '../../../types/kpi';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'KPI ID is required'
    });
  }

  const body = await readBody<Partial<KPIItem>>(event);
  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payload'
    });
  }

  return updateSingleKpi(id, body);
});
