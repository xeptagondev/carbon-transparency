import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';
import { useEffect, useState } from 'react';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';

const ProjectsSummaryChart = () => {
  const { get, statServerUrl } = useConnection();
  const [sectors, setSectors] = useState(['Loading...']);
  const [series, setSeries] = useState<Array<number>>([0]);
  const [seriesLabels, setSeriesLabels] = useState<Array<number>>([0]);
  const [maxValue, setMaxValue] = useState(10);

  const getLabel = (val: number) => {
    return `${seriesLabels[series.findIndex((item) => item === val)]}`;
  };
  useEffect(() => {
    const fetchActionData = async () => {
      const response: any = await get('stats/analytics/projectSummary', undefined, statServerUrl);
      const dataList = response.data;
      const tempSeries: Array<number> = dataList.stats.counts.map((count: string) =>
        parseInt(count)
      );
      const tempMaxValue = tempSeries.length > 0 ? Math.max(...tempSeries) : 10;
      setSeriesLabels(tempSeries);

      const percentages = tempSeries.map((value) =>
        Math.round((value * 100) / Math.max(tempMaxValue, 1))
      );
      setSeries(percentages);
      setSectors(dataList.stats.sectors);
    };
    fetchActionData();
  }, []);

  useEffect(() => {
    if (series.length > 0) {
      const currentMax = Math.max(...series);
      setMaxValue(currentMax + Math.ceil(currentMax * 0.1)); // Add 10% padding to the max value
    }
  }, [series]);

  if (series.length === 0) {
    return (
      <ChartWrapper title="Projects Summary" height="50%">
        <div
          style={{
            height: 200,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              color: '#8a1538',
              fontSize: 24,
              fontWeight: 700,
              opacity: 0.3,
            }}
          >
            No Projects Data Yet
          </h3>
        </div>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper title="Projects Summary" height="50%">
      <div>
        <Chart
          key={`radial-bar-${maxValue}`}
          options={{
            chart: {
              animations: {
                enabled: true,
                speed: 2000,
                animateGradually: {
                  enabled: true,
                  delay: 1500,
                },
                dynamicAnimation: {
                  enabled: true,
                  speed: 2000,
                },
              },
            },
            plotOptions: {
              radialBar: {
                startAngle: 0,
                endAngle: 270,
                offsetY: -10,
                hollow: {
                  margin: 5,
                  size: '40%',
                  background: 'transparent',
                  image: undefined,
                },
                dataLabels: {
                  show: true,
                  name: {
                    fontSize: '20px',
                    color: '#8a1538',
                    offsetY: 0,
                  },
                  value: {
                    offsetY: -20,
                    fontSize: '32px',
                    color: undefined,
                    formatter: function () {
                      return '';
                    },
                  },
                },
                barLabels: {
                  enabled: true,
                  useSeriesColors: true,
                  offsetX: -30,
                  offsetY: 0,
                  fontSize: '16px',
                  formatter(barName, opts) {
                    return barName + ': ' + seriesLabels[opts.seriesIndex];
                  },
                },
              },
            },
            // colors: ['#8a1538', '#8a1538BB', '#8a153888', '#8a153866', '#8a153844'],
            labels: sectors,
            fill: {
              type: 'gradient',
              colors: ['#8a1538', '#915366'],
              gradient: {
                shade: 'dark',
                shadeIntensity: 0.15,
                inverseColors: false,
                opacityFrom: 0.5,
                opacityTo: 1,
                stops: [0, 50, 65, 91],
              },
            },
            stroke: {
              //   dashArray: 3,
            },
          }}
          series={series}
          type="radialBar"
        />
      </div>
    </ChartWrapper>
  );
};

export default ProjectsSummaryChart;
