import { InvestmentCreationComponent } from '@undp/carbon-library';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AddInvestmentComponent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['common', 'programme']);

  const onNavigateToProgrammeView = (programmeId: any) => {
    navigate(`/programmeManagement/view/${programmeId}`);
  };

  const onNavigateToProgrammeManagementView = () => {
    navigate('/programmeManagement/viewAll');
  };

  return (
    <InvestmentCreationComponent
      t={t}
      useLocation={useLocation}
      onNavigateToProgrammeManagementView={onNavigateToProgrammeManagementView}
      onNavigateToProgrammeView={onNavigateToProgrammeView}
    ></InvestmentCreationComponent>
  );
};

export default AddInvestmentComponent;
