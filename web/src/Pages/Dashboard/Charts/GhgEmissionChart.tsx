import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useEffect, useState } from 'react';

type GhgEmissionCategory = {
  category: string;
  withM: number[];
  withAM: number[];
  withoutM: number[];
};

type GhgEmissionDataResponse = {
  data: GhgEmissionCategory[];
};

const zeroFillArray = Array(51).fill(0);

const GhgEmissionChart = () => {
  const { get, statServerUrl } = useConnection();
  const [withoutMSeries, setWithoutMSeries] = useState(zeroFillArray);
  const [withMSeries, setWithMSeries] = useState(zeroFillArray);
  const [withAMSeries, setWithAMSeries] = useState(zeroFillArray);

  const categories = Array.from({ length: 51 }, (_, i) => i + 2000);
  function createSummedArrays(data: GhgEmissionCategory[]) {
    const arrayLength = data[0].withM.length;
    const withM = new Array<number>(arrayLength).fill(0);
    const withAM = new Array<number>(arrayLength).fill(0);
    const withoutM = new Array<number>(arrayLength).fill(0);

    data.forEach((category) => {
      category.withM.forEach((value, index) => {
        withM[index] += value;
      });

      category.withAM.forEach((value, index) => {
        withAM[index] += value;
      });

      category.withoutM.forEach((value, index) => {
        withoutM[index] += value;
      });
    });

    return { withM, withAM, withoutM };
  }
  useEffect(() => {
    const fetchGhgReductionData = async () => {
      const response: GhgEmissionDataResponse = await get(
        'stats/analytics/getCombinedGHGEmissionsTimeline',
        undefined,
        statServerUrl
      );
      const dataList = response.data;
      const result = createSummedArrays(dataList);
      setWithoutMSeries(result.withoutM);
      setWithMSeries(result.withM);
      setWithAMSeries(result.withAM);
    };
    fetchGhgReductionData();
  }, []);

  return (
    <ChartWrapper height={'100%'} title="GHG Emission Comparison Timeline">
      <Chart
        key={withAMSeries.join('-')}
        options={{
          chart: {
            id: 'GHG-emission',
            toolbar: {
              show: false,
            },
          },
          xaxis: {
            categories: categories,
            type: 'numeric',
            min: 2015,
            max: 2025,
            tickAmount: 5,
            labels: {
              formatter: (val) => parseInt(val).toFixed(0),
            },
          },
          dataLabels: {
            enabled: false,
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return val + ' ktCO2e';
              },
            },
          },
          stroke: {
            curve: 'smooth',
            width: [3, 3, 3],
          },
        }}
        series={[
          {
            name: 'Without Measures',
            data: withAMSeries,
            color: '#333232',
          },
          {
            name: 'With Measures',
            data: withMSeries,
            color: '#1567FF',
          },
          {
            name: 'With Additional Measures',
            data: withoutMSeries,
            color: '#8a1538',
          },
        ]}
        type="line"
      />
    </ChartWrapper>
  );
};

export default GhgEmissionChart;
