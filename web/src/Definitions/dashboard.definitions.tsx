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
    '#93D1D7',
    '#0468B1',
    '#FF9FDE',
    '#7FEABF',
    '#FFD086',
    '#C1867B',
    '#FF8183',
    '#B7A4FE',
    '#6B8E23',
    '#B44DD3',
  ],
  finance: ['#A5D6A7', '#93D1D7'],
  support: ['#A5D6A7', '#93D1D7'],
};
