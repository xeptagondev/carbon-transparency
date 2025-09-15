import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useNavigate } from 'react-router-dom';

const TotalActionsCard = () => {
  const { post } = useConnection();
  const [actionCount, setActionCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActions = async () => {
      const response: any = await post('national/actions/query');
      const totalActionsCount = response.response.data.total;
      setActionCount(totalActionsCount);
    };
    fetchActions();
  }, []);

  return (
    <StatCard
      topic="Actions"
      preTopic="Total"
      value={actionCount}
      onClick={() => navigate('/actions')}
      bgColor="#a1e7e1"
    />
  );
};

export default TotalActionsCard;
