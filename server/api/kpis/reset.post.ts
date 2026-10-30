import { resetBoardData } from '../../utils/kpiStorage';

export default defineEventHandler(() => {
  return resetBoardData();
});
