import Chart from 'react-apexcharts';
import ChartWrapper from '../Components/ChartWrapper';
import { useEffect, useState } from 'react';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { animate, useMotionValue, useTransform, motion } from 'framer-motion';

const SupportRecievedChart = () => {
  const { get, statServerUrl } = useConnection();
  const [percentage, setPercentage] = useState(0);
  const count = useMotionValue(0);
  const fixedValue = useTransform(count, (latest) => `${latest.toFixed(2)}%`);

  useEffect(() => {
    const fetchSupportData = async () => {
      const response: any = await get(
        'stats/analytics/supportFinanceSummary',
        undefined,
        statServerUrl
      );
      const supportReceived: number = response.data.stats.supportReceived;
      const supportNeeded: number = response.data.stats.supportNeeded;
      const recievedPercentage = (supportReceived * 100) / Math.max(supportNeeded, 1);
      setPercentage(recievedPercentage);
    };
    fetchSupportData();
  }, []);

  useEffect(() => {
    const controls = animate(count, percentage, { duration: 2 });
    return controls.stop;
  }, [percentage]);

  return (
    <ChartWrapper title="" height="50%">
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        <Chart
          options={{
            chart: {
              animations: {
                enabled: true,
                speed: 1500,
                animateGradually: { enabled: true, delay: 1500 },
                dynamicAnimation: { enabled: true, speed: 1500 },
              },
            },
            plotOptions: {
              radialBar: {
                startAngle: -135,
                endAngle: 135,
                offsetY: -30,
                dataLabels: {
                  name: {
                    fontSize: '14px',
                    color: '#8a1538',
                    offsetY: 20,
                  },
                  value: {
                    offsetY: -20,
                    fontSize: '32px',
                    color: undefined,
                    formatter: () => '',
                  },
                },
              },
            },
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
              dashArray: 3,
            },
            labels: ['Support Received'],
          }}
          series={[percentage]}
          type="radialBar"
        />
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '28px',
          }}
        >
          {fixedValue}
        </motion.div>
      </div>
    </ChartWrapper>
  );
};

export default SupportRecievedChart;
