import { useEffect, useState } from 'react';
import StatCard from './StatCard';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { useNavigate } from 'react-router-dom';

const TotalActivitiesCard = () => {
  const { post } = useConnection();
  const [activityCount, setActivityCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      const response: any = await post('national/activities/query');
      const totalActivitiesCount = response.response.data.total;
      setActivityCount(totalActivitiesCount);
    };
    fetchActivities();
  }, []);

  return (
    <StatCard
      topic="Activities"
      preTopic="Total"
      value={activityCount}
      onClick={() => {
        navigate('/activities');
      }}
    />
  );
};

export default TotalActivitiesCard;
