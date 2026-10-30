import { getStoredBoardData } from '../utils/kpiStorage';

export default defineEventHandler((event) => {
  return getStoredBoardData();
});
