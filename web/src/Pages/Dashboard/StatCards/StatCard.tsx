import { useMotionValue, useTransform, motion, animate } from 'framer-motion';
import { useEffect } from 'react';

interface IStatCard {
  topic: string;
  preTopic?: string;
  value?: number;
  onClick?: VoidFunction;
  bgColor?: string;
}

const StatCard = ({ topic, value = 0, preTopic, onClick, bgColor }: IStatCard) => {
  const count = useMotionValue(0);
  const rounded = useTransform(() => Math.round(count.get()));

  useEffect(() => {
    const controls = animate(count, value, { duration: 5 });
    return () => controls.stop();
  }, [value]);

  return (
    <div className="stat-card">
      <div className="card" onClick={onClick} style={{ backgroundColor: bgColor }}>
        <h3 className="pre-topic">{preTopic}</h3>
        <h2 className="topic">{topic}</h2>
        <motion.pre className="motion-elemet">{rounded}</motion.pre>
      </div>
    </div>
  );
};

export default StatCard;
