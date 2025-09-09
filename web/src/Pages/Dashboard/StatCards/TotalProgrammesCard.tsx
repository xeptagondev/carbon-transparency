import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useNavigate } from 'react-router-dom';

const TotalProgrammesCard = () => {
  const { post } = useConnection();
  const [programmeCount, setProgrammeCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProgrammes = async () => {
      const response: any = await post('national/programmes/query');
      const totalProgrammesCount = response.response.data.total;
      setProgrammeCount(totalProgrammesCount);
    };
    fetchProgrammes();
  }, []);

  return (
    <StatCard
      topic="Programmes"
      preTopic="Total"
      value={programmeCount}
      onClick={() => {
        navigate('/programmes');
      }}
    />
  );
};

export default TotalProgrammesCard;
