import { Card, Col, Row, Statistic } from 'antd';
import './dashboard.scss';
import Chart from 'react-apexcharts';
import ChartWrapper from './Components/ChartWrapper';
import TotalClimateImpactChart from './Charts/TotalClimateImpactChart';
import TotalActionsCard from './StatCards/TotalActionsCard';
import TotalActivitiesCard from './StatCards/TotalActivitiesCard';
import TotalProgrammesCard from './StatCards/TotalProgrammesCard';
import TotalProjectsCard from './StatCards/TotalProjectsCard';
import SupportRecievedChart from './Charts/SupportRecievedChart';
import GhgEmissionChart from './Charts/GhgEmissionChart';
import ActionsSummaryChart from './Charts/ActionsSummaryChart';
import ProjectsSummaryChart from './Charts/ProjectsSummaryChart';
import KpiAchievedChart from './Charts/KpiAchievedChart';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <Row
        className="card-wrapper"
        style={{
          height: '200px',
        }}
      >
        <Col md={6}>
          <TotalActionsCard />
        </Col>
        <Col md={6}>
          <TotalProgrammesCard />
        </Col>
        <Col md={6}>
          <TotalProjectsCard />
        </Col>
        <Col md={6}>
          <TotalActivitiesCard />
        </Col>
      </Row>
      <Row className="card-wrapper">
        <Col md={16}>
          <TotalClimateImpactChart />
        </Col>
        <Col md={8}>
          <SupportRecievedChart />
          <KpiAchievedChart />
        </Col>
      </Row>
      <Row className="card-wrapper">
        <Col md={16}>
          <GhgEmissionChart />
        </Col>
        <Col md={8}>
          <ActionsSummaryChart />
          <ProjectsSummaryChart />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
