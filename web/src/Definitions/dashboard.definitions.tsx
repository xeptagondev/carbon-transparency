export type ChartData = {
  chartId: 1 | 2 | 3 | 4 | 5 | 6;
  categories: string[];
  values: number[];
  chartTitle: string;
  chartDescription: string;
  lastUpdatedTime: number;
};

export type DashboardActionItem = {
  key: number;
  actionId: number;
  title: string;
  actionType: string;
  affectedSectors: string[];
  financeNeeded: number;
  financeReceived: number;
  status: string;
  nationalImplementingEntity: string[];
};

export const chartColorMappings = {
  sectors: [
    '#16B1FF',
    '#0468B1',
    '#FF9FDE',
    '#7FEABF',
    '#FFD086',
    '#C1867B',
    '#FF8183',
    '#B7A4FE',
    '#6B8E23',
    '#B44DD3',
    '#2E8B57',
    '#4682B4',
    '#D2691E',
    '#708090',
    '#9370DB',
    '#20B2AA',
    '#CD5C5C',
    '#F4A460',
    '#5F9EA0',
    '#BC8F8F',
    '#6495ED',
    '#DA70D6',
    '#3CB371',
    '#778899',
    '#E9967A',
    '#87CEEB',
  ],
  finance: ['#FF8183', '#16B1FF'],
  support: ['#FF8183', '#16B1FF'],
};
