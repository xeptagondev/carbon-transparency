// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
// import LineChart from '../Charts/line chart/lineChart';

interface SeriesType {
  name: string;
  data: number[];
}

const DataLineChart = () => {
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<SeriesType[]>([]);

  useEffect(() => {
    fetch('/api/stats/actual?type=ACTIVITY_EMISSIONS')
      .then((res) => res.json())
      .then((data) => {
        const reductionData = data.reductionData;

        const firstSector = Object.keys(reductionData)[0];
        const years = reductionData[firstSector].map((_: number, idx: number) =>
          (2000 + idx).toString()
        );

        const formattedSeries: SeriesType[] = Object.keys(reductionData).map((sector) => ({
          name: sector,
          data: reductionData[sector],
        }));

        setLabels(years);
        setSeries(formattedSeries);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">GHG Actual Reductions</h1>
      {/* <LineChart labels={labels} series={series} /> */}
    </div>
  );
};

export default DataLineChart;
