export type IndicatorType = 'safety' | 'quality' | 'experience' | 'value' | 'people';

export type GoalStatus = 'meeting' | 'not_meeting';

export interface KPIItem {
  id: string;
  type: IndicatorType;
  lastUpdated: string;
  title: string;
  currentMeasure: string;
  goal: string;
  status: GoalStatus;
  unit?: string;
  notes?: string;
}

export interface BoardData {
  title: string;
  subtitle: string;
  lastSync: string;
  kpis: KPIItem[];
}

export const DEFAULT_KPIS: KPIItem[] = [
  {
    id: 'kpi-1',
    type: 'safety',
    title: '',
    currentMeasure: '',
    goal: '',
    status: 'meeting',
    lastUpdated: '',
    unit: '',
    notes: ''
  },
  {
    id: 'kpi-2',
    type: 'quality',
    title: '',
    currentMeasure: '',
    goal: '',
    status: 'meeting',
    lastUpdated: '',
    unit: '',
    notes: ''
  },
  {
    id: 'kpi-3',
    type: 'experience',
    title: '',
    currentMeasure: '',
    goal: '',
    status: 'meeting',
    lastUpdated: '',
    unit: '',
    notes: ''
  },
  {
    id: 'kpi-4',
    type: 'value',
    title: '',
    currentMeasure: '',
    goal: '',
    status: 'meeting',
    lastUpdated: '',
    unit: '',
    notes: ''
  },
  {
    id: 'kpi-5',
    type: 'people',
    title: '',
    currentMeasure: '',
    goal: '',
    status: 'meeting',
    lastUpdated: '',
    unit: '',
    notes: ''
  },
  {
    id: 'kpi-6',
    type: 'quality',
    title: '',
    currentMeasure: '',
    goal: '',
    status: 'meeting',
    lastUpdated: '',
    unit: '',
    notes: ''
  }
];

export const DEFAULT_BOARD_DATA: BoardData = {
  title: 'Executive Performance Board',
  subtitle: 'Six-Block Key Performance Indicators',
  lastSync: '',
  kpis: DEFAULT_KPIS
};
