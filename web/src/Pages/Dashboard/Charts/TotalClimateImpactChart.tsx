import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';
import { useEffect, useState } from 'react';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';

interface ITotalClimateImpactChart {
  height?: string;
  primaryColor?: string;
}

const zeroFillArray = Array(51).fill(0);

// Function to create cumulative data
const createCumulativeData = (originalData: number[]): number[] => {
  let runningTotal = 0;
  return originalData.map((value) => {
    runningTotal += value;
    return runningTotal;
  });
};

const TotalClimateImpactChart = ({
  height = '100%',
  primaryColor = '#3498DB',
}: ITotalClimateImpactChart) => {
  const { get, statServerUrl } = useConnection();
  const [impactSeries, setImpactSeries] = useState(zeroFillArray);
  const categories = Array.from({ length: 51 }, (_, i) => i + 2000);

  useEffect(() => {
    const fetchGhgReductionData = async () => {
      const response: any = await get(
        'stats/analytics/getCombinedGHGReductionTimeline',
        undefined,
        statServerUrl
      );
      const dataList = response.data;
      const cumulativeData = createCumulativeData(dataList);
      setImpactSeries(cumulativeData);
    };
    fetchGhgReductionData();
  }, []);

  return (
    <ChartWrapper height={height} title="Total Climate Impact (GHG Reduction) Timeline">
      <Chart
        options={{
          chart: {
            id: 'total-impact',
            toolbar: {
              show: false,
            },
          },
          xaxis: {
            categories: categories,
            type: 'numeric',
            min: 2013,
            max: 2050,
            tickAmount: 5,
            labels: {
              formatter: (val) => parseInt(val).toFixed(0),
            },
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return val + ' ktCO2e';
              },
            },
          },
          stroke: {
            curve: 'monotoneCubic',
          },
        }}
        series={[
          {
            name: 'Cumulative GHG Reduction',
            data: impactSeries,
            color: primaryColor,
          },
        ]}
        type="area"
      />
    </ChartWrapper>
  );
};

export default TotalClimateImpactChart;
