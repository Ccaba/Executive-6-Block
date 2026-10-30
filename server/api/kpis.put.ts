import { saveStoredBoardData } from '../utils/kpiStorage';
import type { BoardData } from '../../types/kpi';

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<BoardData>>(event);
  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid payload'
    });
  }
  return saveStoredBoardData(body);
});
