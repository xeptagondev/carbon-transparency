import { InvestmentManagementComponent } from '@undp/carbon-library';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useSettingsContext } from '../../Context/SettingsContext/settingsContext';
import './investmentCreationStyles.scss';

const InvestmentManagement = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['common', 'programme', 'creditTransfer', 'view']);

  const onNavigateToProgrammeView = (programmeId: any) => {
    navigate(`/programmeManagement/view/${programmeId}`);
  };

  const onNavigateToInvestmentCreation = () => {
    navigate('/investmentManagement/addInvestment', { state: { ownership: true } });
  };

  return (
    <InvestmentManagementComponent
      translator={i18n}
      useConnection={useConnection}
      onNavigateToProgrammeView={onNavigateToProgrammeView}
      useUserContext={useUserContext}
      useSettingsContext={useSettingsContext}
      onClickAddOwnership={onNavigateToInvestmentCreation}
      enableAddOwnership={true}
    ></InvestmentManagementComponent>
  );
};

export default InvestmentManagement;
