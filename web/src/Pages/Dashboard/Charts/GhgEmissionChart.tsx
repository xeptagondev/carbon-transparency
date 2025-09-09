import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useEffect, useState } from 'react';

const zeroFillArray = Array(51).fill(0);

const GhgEmissionChart = () => {
  const { get, statServerUrl } = useConnection();
  const [withoutMSeries, setWithoutMSeries] = useState(zeroFillArray);
  const [withMSeries, setWithMSeries] = useState(zeroFillArray);
  const [withAMSeries, setWithAMSeries] = useState(zeroFillArray);

  const categories = Array.from({ length: 51 }, (_, i) => i + 2000);

  useEffect(() => {
    const fetchGhgReductionData = async () => {
      const response: any = await get(
        'stats/analytics/getCombinedGHGEmissionsTimeline',
        undefined,
        statServerUrl
      );
      const dataList = response.data;
      const withoutM = zeroFillArray;
      const withM = zeroFillArray;
      const withAM = zeroFillArray;
      dataList.forEach((category: any) => {
        for (let i = 0; i < 51; i++) {
          withoutM[i] += category.withoutM[i];
          withM[i] += category.withM[i];
          withAM[i] += category.withAM[i];
        }
      });
      setWithoutMSeries(withoutM);
      setWithMSeries(withM);
      setWithAMSeries(withAM);
    };
    fetchGhgReductionData();
  }, []);

  return (
    <ChartWrapper height={'100%'} title="GHG Emission Comparison Timeline">
      <Chart
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
          yaxis: {
            labels: {
              formatter: function (val) {
                return val + ' ktCO2e';
              },
            },
          },
          stroke: {
            curve: 'smooth',
          },
        }}
        series={[
          {
            name: 'Without Measures',
            data: withAMSeries,
            color: '#000000',
          },
          {
            name: 'With Measures',
            data: withMSeries,
            color: '#0000FF',
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
