import './updates.scss';
import { Skeleton, Steps } from 'antd';
import { useEffect, useState } from 'react';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useTranslation } from 'react-i18next';
import * as Icon from 'react-bootstrap-icons';
import { CustomFormatDate } from '../../Utils/utilServices';
import { UpdateProps } from '../../Definitions/InterfacesAndType/updatesInterface';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';

const UpdatesTimeline: React.FC<UpdateProps> = ({ recordType, recordId }) => {
  const { post } = useConnection();
  const { t } = useTranslation(['updateTimeline']);

  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyData, setHistoryData] = useState<any>([]);

  const getAllData = async () => {
    setLoadingHistory(true);
    try {
      const payload: any = {
        recordType: recordType,
        recordId: recordId,
      };
      const response: any = await post('national/log/query', payload);
      if (response) {
        setHistoryData(response.data);
      }
    } catch (error: any) {
      displayErrorMessage(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  const getClassByEventType = (eventType: string) => {
    switch (eventType) {
      case '0': //created steps
      case '5':
      case '8':
      case '12':
      case '22':
        return (
          <span className="step-icon created-step">
            <Icon.CaretRight />
          </span>
        );
      case '3': //Linked steps
      case '6':
      case '9':
      case '10':
      case '13':
      case '14':
      case '23':
      case '24':
        return (
          <span className="step-icon link-step">
            <Icon.Link45deg />
          </span>
        );
      case '7': //Unlinked steps
      case '11':
      case '15':
      case '27':
        return (
          <span className="step-icon unlink-step">
            <Icon.Link45deg />
          </span>
        );
      case '1': //KPI ADD steps
        return (
          <span className="step-icon addkpi-step">
            <Icon.PlusLg />
          </span>
        );
      case '18': //Validated steps
      case '19':
      case '21':
      case '25':
      case '28':
        return (
          <span className="step-icon verify-step">
            <Icon.FileEarmarkCheck />
          </span>
        );
      case '30': //Unvalidated steps
      case '31':
      case '32':
      case '33':
      case '34':
      case '35':
      case '36':
      case '37':
      case '38':
      case '39':
      case '40':
      case '41':
      case '42':
      case '43':
      case '44':
      case '45':
      case '46':
      case '47':
      case '48':
      case '49':
      case '50':
      case '51':
      case '52':
      case '53':
      case '54':
        return (
          <span className="step-icon unverify-step">
            <Icon.FileEarmarkExcel />
          </span>
        );
      default:
        return (
          <span className="step-icon default-step">
            <Icon.RecordCircleFill />
          </span>
        );
    }
  };

  const stepsItems = historyData.map((item: any, index: number) => ({
    key: index,
    title: (
      <span>
        <strong>{item.user_id === null ? 'System' : item.user_name} </strong> {t(item.eventType)}{' '}
        {item.logData && ` - ${item.logData}`}
        <span className="date">
          {' - '}
          {`${CustomFormatDate(Number(item.createdTime))}`}
        </span>
      </span>
    ),
    icon: getClassByEventType(item.eventType),
    status: 'process',
  }));

  return (
    <div className="info-view">
      <div className="content">
        {loadingHistory ? (
          <Skeleton />
        ) : (
          <Steps direction="vertical" current={0} items={stepsItems} />
        )}
      </div>
    </div>
  );
};

export default UpdatesTimeline;
