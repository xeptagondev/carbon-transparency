import { AddNdcActionComponent } from '@undp/carbon-library';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSdgGoalImages } from '../../Definitions/InterfacesAndType/ndcAction.definitions';

const AddNdcAction = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation([
    'ndcAction',
    'coBenifits',
    'common',
    'economic',
    'environment',
    'genderParity',
    'safeguards',
    'social',
    'unfcccSdTool',
    'socialEnvironmentalRisk',
  ]);
  const sdgGoalImages = getSdgGoalImages();

  const onNavigateToProgrammeManagementView = (programmeId: any) => {
    navigate('/programmeManagement/viewAll', { state: { id: programmeId } });
  };

  const onNavigateToProgrammeView = (programmeDetails: any) => {
    navigate(`/programmeManagement/view/${programmeDetails.programmeId}`, {
      state: { record: programmeDetails },
    });
  };

  return (
    <AddNdcActionComponent
      translator={i18n}
      useLocation={useLocation}
      onNavigateToProgrammeView={onNavigateToProgrammeView}
      onNavigateToProgrammeManagementView={onNavigateToProgrammeManagementView}
      sdgGoalImages={sdgGoalImages}
    ></AddNdcActionComponent>
  );
};

export default AddNdcAction;
