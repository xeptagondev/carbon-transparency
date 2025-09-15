import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useNavigate } from 'react-router-dom';

const TotalProjectsCard = () => {
  const { post } = useConnection();
  const [projectCount, setProjectCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const response: any = await post('national/projects/query');
      const totalProjectsCount = response.response.data.total;
      setProjectCount(totalProjectsCount);
    };
    fetchProjects();
  }, []);

  return (
    <StatCard
      topic="Projects"
      preTopic="Total"
      value={projectCount}
      onClick={() => {
        navigate('/projects');
      }}
      bgColor="#be63fa4d"
    />
  );
};

export default TotalProjectsCard;
