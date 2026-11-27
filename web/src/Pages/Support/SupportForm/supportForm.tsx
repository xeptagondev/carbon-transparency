import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message, Spin, Tooltip } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import './supportForm.scss';
import { FinanceNature, FinancingStatus, SupportDirection } from '../../../Enums/support.enum';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { getValidationRules } from '../../../Utils/validationRules';
import { delay, doesUserHaveValidatePermission, getFormTitle } from '../../../Utils/utilServices';
import { Action } from '../../../Enums/action.enum';
import { SupportEntity } from '../../../Entities/support';
import { useAbilityContext } from '../../../Casl/Can';
import { processOptionalFields } from '../../../Utils/optionalValueHandler';
import {
  halfColumnBps,
  quarterColumnBps,
  shortButtonBps,
} from '../../../Definitions/breakpoints/breakpoints';
import { displayErrorMessage } from '../../../Utils/errorMessageHandler';
import { useUserContext } from '../../../Context/UserInformationContext/userInformationContext';
import ConfirmPopup from '../../../Components/Popups/Confirmation/confirmPopup';
import { DeleteOutlined } from '@ant-design/icons';
import { useReferenceOptions } from '../../../Utils/useReferenceOptions';
import OtherSpecify from '../../../Components/OtherSpecify/otherSpecify';
import { ReferenceDataList } from '../../../Enums/referenceData.enum';
import { INFORMATION_NOT_AVAILABLE } from '../../../Utils/informationNotAvailable';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import { StoredData, UploadData } from '../../../Definitions/uploadDefinitions';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

// Vatu per US dollar, pre-filled on a new support record (the user can change it).
const DEFAULT_EXCHANGE_RATE = 119;

interface Props {
  method: 'create' | 'view' | 'update';
}

type ParentData = {
  id: string;
  title: string;
  status?: string;
  startYear?: number;
  endYear?: number;
};

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

// Domestic currency amount = US dollar amount x exchange rate; empty until both are entered.
const toDomestic = (usd: any, rate: any): number | undefined => {
  const amount = parseFloat(usd);
  const exchange = parseFloat(rate);
  if (Number.isNaN(amount) || Number.isNaN(exchange)) {
    return undefined;
  }
  return round2(amount * exchange);
};

const budgetField = (year: number) => `budget_${year}`;

const SupportForm: React.FC<Props> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['supportForm', 'entityAction', 'error', 'formHeader']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Support', method);

  const navigate = useNavigate();
  const { get, post, put, delete: del } = useConnection();
  const channelOptions = useReferenceOptions(ReferenceDataList.CHANNEL_OF_SUPPORT);
  const intInstrumentOptions = useReferenceOptions(
    ReferenceDataList.INTERNATIONAL_FINANCIAL_INSTRUMENT
  );
  const natInstrumentOptions = useReferenceOptions(ReferenceDataList.NATIONAL_FINANCIAL_INSTRUMENT);
  const intSourceOptions = useReferenceOptions(ReferenceDataList.INTERNATIONAL_SOURCE);
  const pipelineOptions = useReferenceOptions(ReferenceDataList.PIPELINE_STATUS);
  const ability = useAbilityContext();
  const { isValidationAllowed, setIsValidationAllowed } = useUserContext();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // First Render Check

  const [isFirstRenderDone, setIsFirstRenderDone] = useState<boolean>(false);

  // Entity Validation Status

  const [isValidated, setIsValidated] = useState<boolean>(false);

  // Form General State

  const [isSaveButtonDisabled, setIsSaveButtonDisabled] = useState(true);

  // Spinner When Form Submit Occurs

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);
  const [waitingForValidation, setWaitingForValidation] = useState<boolean>(false);

  // Popup Definition

  const [openDeletePopup, setOpenDeletePopup] = useState<boolean>(false);

  // Documents

  const [uploadedFiles, setUploadedFiles] = useState<UploadData[]>([]);
  const [storedFiles, setStoredFiles] = useState<StoredData[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Parent Selection State

  const [parentList, setParentList] = useState<ParentData[]>([]);

  // Values that decide which fields are shown and what is calculated

  const activityId = Form.useWatch('activityId', form);
  const direction = Form.useWatch('direction', form);
  const financeNature = Form.useWatch('financeNature', form);
  const financingStatus = Form.useWatch('financingStatus', form);
  const nationallyBudgetSupported = Form.useWatch('nationallyBudgetSupported', form);

  const isInternational = financeNature === FinanceNature.INTERNATIONAL;
  const isNational = financeNature === FinanceNature.NATIONAL;
  const isNeeded = direction === SupportDirection.NEEDED;
  const isReceived = direction === SupportDirection.RECEIVED;
  const isCommitted = isReceived && financingStatus === FinancingStatus.COMMITTED;
  const isReceivedStatus = isReceived && financingStatus === FinancingStatus.RECEIVED;

  // Years of the selected activity, one national budget entry per year

  const selectedActivity = parentList.find((parent) => parent.id === activityId);
  const budgetYears: number[] = [];
  if (
    selectedActivity?.startYear &&
    selectedActivity?.endYear &&
    selectedActivity.endYear >= selectedActivity.startYear
  ) {
    for (let year = selectedActivity.startYear; year <= selectedActivity.endYear; year++) {
      budgetYears.push(year);
    }
  }

  // DB Queries

  const fetchNonValidatedActivities = async () => {
    try {
      const payload = {
        sort: {
          key: 'activityId',
          order: 'ASC',
        },
      };
      const response: any = await post('national/activities/query', payload);
      const tempActivityData: ParentData[] = [];
      response.data.forEach((activity: any) => {
        tempActivityData.push({
          id: activity.activityId,
          title: activity.title,
          status: activity.status,
          startYear: activity.startYear ?? undefined,
          endYear: activity.endYear ?? undefined,
        });
      });
      setParentList(tempActivityData);
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const fetchSupportData = async () => {
    if (method !== 'create' && entId) {
      let response: any;
      try {
        const payload = {
          filterAnd: [
            {
              key: 'supportId',
              operation: '=',
              value: entId,
            },
          ],
        };
        response = await post('national/supports/query', payload);

        if (response.response.data.total === 1) {
          const entityData: any = response.data[0];
          // Populating Support owned data fields
          form.setFieldsValue({
            activityId: entityData.activity?.activityId ?? undefined,
            direction: entityData.direction,
            financeNature: entityData.financeNature,
            internationalSupportChannel: entityData.internationalSupportChannel ?? undefined,
            internationalFinancialInstrument:
              entityData.internationalFinancialInstrument ?? undefined,
            nationalFinancialInstrument: entityData.nationalFinancialInstrument ?? undefined,
            financingStatus: entityData.financingStatus ?? undefined,
            pipelineStatus: entityData.pipelineStatus ?? undefined,
            pipelineStatusOther: entityData.pipelineStatusOther ?? undefined,
            internationalSource: entityData.internationalSource ?? undefined,
            nationallyBudgetSupported: entityData.nationallyBudgetSupported ?? undefined,
            requiredAmount: entityData.requiredAmount,
            receivedAmount: entityData.receivedAmount,
            exchangeRate: entityData.exchangeRate,
            comments: entityData.comments ?? undefined,
          });

          (entityData.nationalBudgetAllocation ?? []).forEach((entry: any) => {
            form.setFieldsValue({ [budgetField(entry.year)]: entry.amount });
          });

          // Setting up uploaded files

          if (entityData.documents?.length > 0) {
            const tempFiles: StoredData[] = [];
            entityData.documents.forEach((document: any) => {
              tempFiles.push({
                key: document.createdTime,
                title: document.title,
                url: document.url,
              });
            });
            setStoredFiles(tempFiles);
          }

          // Setting validation status

          setIsValidated(entityData.validated ?? false);
        }
      } catch {
        navigate('/support');
      }
      setIsSaveButtonDisabled(true);
    }
  };

  // Form Submit

  const buildPayload = (values: any) => {
    const payload: any = {
      activityId: values.activityId,
      direction: values.direction,
      financeNature: values.financeNature,
      exchangeRate: parseFloat(values.exchangeRate),
    };

    if (values.financeNature === FinanceNature.INTERNATIONAL) {
      payload.internationalSupportChannel = values.internationalSupportChannel;
      payload.internationalFinancialInstrument = values.internationalFinancialInstrument;
      payload.internationalSource = values.internationalSource;
    } else {
      payload.nationalFinancialInstrument = values.nationalFinancialInstrument;
      payload.nationallyBudgetSupported = values.nationallyBudgetSupported;
      if (values.nationallyBudgetSupported === true) {
        payload.nationalBudgetAllocation = budgetYears.map((year) => ({
          year,
          amount: parseFloat(values[budgetField(year)]),
        }));
      }
    }

    if (values.direction === SupportDirection.NEEDED) {
      payload.pipelineStatus = values.pipelineStatus;
      payload.pipelineStatusOther = values.pipelineStatusOther;
      payload.requiredAmount = parseFloat(values.requiredAmount);
    } else {
      payload.financingStatus = values.financingStatus;
      payload.receivedAmount = parseFloat(values.receivedAmount);
    }

    if (values.comments?.trim()) {
      payload.comments = values.comments.trim();
    }

    return payload;
  };

  const handleSubmit = async (values: any) => {
    try {
      setWaitingForBE(true);

      const payload = buildPayload(values);

      if (uploadedFiles.length > 0) {
        const files = uploadedFiles.map((file) => ({ title: file.title, data: file.data }));
        if (method === 'create') {
          payload.documents = files;
        } else {
          payload.newDocuments = files;
        }
      }

      if (method === 'update' && filesToRemove.length > 0) {
        payload.removedDocuments = filesToRemove.map(
          (removedFileKey) => storedFiles.find((file) => file.key === removedFileKey)?.url
        );
      }

      let response: any;

      if (method === 'create') {
        response = await post('national/supports/add', processOptionalFields(payload, 'support'));
      } else if (method === 'update') {
        payload.supportId = entId;
        response = await put('national/supports/update', processOptionalFields(payload, 'support'));
      }

      const successMsg =
        method === 'create' ? t('supportCreationSuccess') : t('supportUpdateSuccess');

      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: successMsg,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/support');
      }
    } catch (error: any) {
      displayErrorMessage(error);
    } finally {
      setWaitingForBE(false);
    }
  };

  // Entity Validate

  const validateEntity = async () => {
    try {
      setWaitingForValidation(true);

      if (entId) {
        const payload = {
          entityId: entId,
          validateStatus: !isValidated,
        };
        const response: any = await post('national/supports/validateStatus', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: isValidated ? t('supportUnvalidateSuccess') : t('supportValidateSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/support');
        }
      }
    } catch (error: any) {
      if (error?.status) {
        if (error.status === 403) {
          setIsValidationAllowed(await doesUserHaveValidatePermission(get));
        }
        displayErrorMessage(error);
      } else {
        displayErrorMessage(error, `${entId} Validation Failed`);
      }
    } finally {
      setWaitingForValidation(false);
    }
  };

  // Entity Delete

  const deleteClicked = () => {
    setOpenDeletePopup(true);
  };

  const deleteEntity = async () => {
    try {
      setWaitingForBE(true);
      await delay(1000);

      if (entId) {
        const payload = {
          entityId: entId,
        };
        const response: any = await del('national/supports/delete', payload);

        if (response.status === 200 || response.status === 201) {
          message.open({
            type: 'success',
            content: t('supportDeleteSuccess'),
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });

          navigate('/support');
        }
      }
    } catch (error: any) {
      if (error?.message) {
        displayErrorMessage(error);
      } else {
        displayErrorMessage(error, `${entId} Delete Failed`);
      }
    }
  };

  // Save Button Enable when form value change

  const handleValuesChange = () => {
    setIsSaveButtonDisabled(false);
  };

  // Number inputs: no sign or exponent

  const blockNonNumericKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+') {
      e.preventDefault();
    }
  };

  // Init Job

  useEffect(() => {
    if (method === 'create') {
      form.setFieldsValue({ exchangeRate: DEFAULT_EXCHANGE_RATE });
    }
    Promise.all([fetchNonValidatedActivities(), fetchSupportData()]).then(() => {
      setIsFirstRenderDone(true);
    });
  }, []);

  // A currency amount in US dollars next to its calculated domestic currency amount

  const renderAmountPair = (
    name: 'requiredAmount' | 'receivedAmount',
    usdTitle: string,
    domesticTitle: string
  ) => (
    <Row gutter={gutterSize}>
      <Col {...halfColumnBps}>
        <Form.Item
          label={<label className="form-item-header">{t(usdTitle)}</label>}
          name={name}
          rules={[validation.required, validation.greaterThanZero]}
        >
          <Input
            type="number"
            min={0}
            step={0.01}
            className="form-input-box"
            onKeyDown={blockNonNumericKeys}
            disabled={isView}
          />
        </Form.Item>
      </Col>
      <Col {...halfColumnBps}>
        <Form.Item
          label={<label className="form-item-header-small">{t(domesticTitle)}</label>}
          shouldUpdate
        >
          {() => (
            <Input
              type="number"
              className="form-input-box"
              disabled
              value={toDomestic(form.getFieldValue(name), form.getFieldValue('exchangeRate'))}
            />
          )}
        </Form.Item>
      </Col>
    </Row>
  );

  return (
    <div className="content-container">
      <ConfirmPopup
        key={'delete_popup'}
        icon={<DeleteOutlined style={{ color: '#ff4d4f', fontSize: '120px' }} />}
        isDanger={true}
        content={{
          primaryMsg: `${t('deletePrimaryMsg')} ${entId}`,
          secondaryMsg: t('deleteSecondaryMsg'),
          cancelTitle: t('entityAction:cancel'),
          actionTitle: t('entityAction:delete'),
        }}
        actionRef={entId}
        doAction={deleteEntity}
        open={openDeletePopup}
        setOpen={setOpenDeletePopup}
      />
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
      </div>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        onValuesChange={handleValuesChange}
      >
        {!waitingForBE && isFirstRenderDone ? (
          <div className="support-form">
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard
                  calledIn="Support"
                  entId={entId}
                  isValidated={isValidated}
                ></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('selectActivityTitle')}</label>}
                    name="activityId"
                    rules={[validation.required]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      disabled={isView}
                      showSearch
                      optionFilterProp="children"
                      onChange={(id) => {
                        // Planned activities need support; ongoing or completed ones have received it;
                        // when the status is "Information not available" the user picks the direction
                        const activity = parentList.find((parent) => parent.id === id);
                        if (activity?.status) {
                          let nextDirection;
                          if (activity.status === INFORMATION_NOT_AVAILABLE) {
                            nextDirection = undefined;
                          } else if (activity.status === 'Planned') {
                            nextDirection = SupportDirection.NEEDED;
                          } else {
                            nextDirection = SupportDirection.RECEIVED;
                          }
                          form.setFieldsValue({
                            direction: nextDirection,
                            financingStatus: undefined,
                            pipelineStatus: undefined,
                          });
                        }
                      }}
                    >
                      {parentList.map((parent) => (
                        <Option key={parent.id} value={parent.id}>
                          {`${parent.id} - ${parent.title}`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('supportDirectionTitle')}</label>}
                    name="direction"
                    rules={[validation.required]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      disabled={isView}
                      showSearch
                      onChange={() => {
                        form.setFieldsValue({
                          financingStatus: undefined,
                          pipelineStatus: undefined,
                        });
                      }}
                    >
                      {Object.values(SupportDirection).map((support) => (
                        <Option key={support} value={support}>
                          {support}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('financeNatureTitle')}</label>}
                    name="financeNature"
                    rules={[validation.required]}
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      disabled={isView}
                      showSearch
                      onChange={() => {
                        form.setFieldsValue({
                          internationalSupportChannel: undefined,
                          internationalFinancialInstrument: undefined,
                          nationalFinancialInstrument: undefined,
                          internationalSource: undefined,
                          nationallyBudgetSupported: undefined,
                        });
                      }}
                    >
                      {Object.values(FinanceNature).map((nature) => (
                        <Option key={nature} value={nature}>
                          {nature}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {isInternational && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={<label className="form-item-header">{t('supportChannelTitle')}</label>}
                      name="internationalSupportChannel"
                      rules={[validation.required]}
                    >
                      <Select
                        optionFilterProp="children"
                        size={'large'}
                        style={{ fontSize: inputFontSize }}
                        disabled={isView}
                        showSearch
                      >
                        {channelOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={gutterSize}>
                {isInternational && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {t('intFinancialInstrumentTitle')}
                        </label>
                      }
                      name="internationalFinancialInstrument"
                      rules={[validation.required]}
                    >
                      <Select
                        optionFilterProp="children"
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled={isView}
                        showSearch
                      >
                        {intInstrumentOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
                {isInternational && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">{t('internationalSourceTitle')}</label>
                      }
                      name="internationalSource"
                    >
                      <Select
                        optionFilterProp="children"
                        size="large"
                        mode="multiple"
                        style={{ fontSize: inputFontSize }}
                        allowClear
                        disabled={isView}
                        showSearch
                      >
                        {intSourceOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
                {isNational && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">{t('nationalFinanceInstrument')}</label>
                      }
                      name="nationalFinancialInstrument"
                      rules={[validation.required]}
                    >
                      <Select
                        optionFilterProp="children"
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled={isView}
                        showSearch
                      >
                        {natInstrumentOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
                {isNational && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={
                        <label className="form-item-header">
                          {t('nationallyBudgetSupportedTitle')}
                        </label>
                      }
                      name="nationallyBudgetSupported"
                      rules={[validation.required]}
                    >
                      <Select size="large" style={{ fontSize: inputFontSize }} disabled={isView}>
                        <Option key="yes" value={true}>
                          {t('yes')}
                        </Option>
                        <Option key="no" value={false}>
                          {t('no')}
                        </Option>
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
              <Row gutter={gutterSize}>
                {isNeeded && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={<label className="form-item-header">{t('pipelineStatusTitle')}</label>}
                      name="pipelineStatus"
                      rules={[validation.required]}
                    >
                      <Select
                        optionFilterProp="children"
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled={isView}
                        showSearch
                      >
                        {pipelineOptions.map((option) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <OtherSpecify
                      valueName="pipelineStatus"
                      textName="pipelineStatusOther"
                      isView={isView}
                    />
                  </Col>
                )}
                {isReceived && (
                  <Col {...halfColumnBps}>
                    <Form.Item
                      label={<label className="form-item-header">{t('financeStatus')}</label>}
                      name="financingStatus"
                      rules={[validation.required]}
                    >
                      <Select
                        size="large"
                        style={{ fontSize: inputFontSize }}
                        disabled={isView}
                        showSearch
                      >
                        {Object.values(FinancingStatus).map((status) => (
                          <Option key={status} value={status}>
                            {status}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            </div>
            <div className="form-section-card">
              <div className="form-section-header">{t('climateFinanceInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col {...halfColumnBps}>
                  <Form.Item
                    label={<label className="form-item-header">{t('exchangeRateTitle')}</label>}
                    name="exchangeRate"
                    rules={[validation.required, validation.greaterThanZero]}
                  >
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      className="form-input-box"
                      onKeyDown={blockNonNumericKeys}
                      disabled={isView}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {isNeeded && renderAmountPair('requiredAmount', 'neededUSDTitle', 'neededLocalTitle')}
              {isCommitted &&
                renderAmountPair('receivedAmount', 'committedUSDTitle', 'committedLocalTitle')}
              {isReceivedStatus &&
                renderAmountPair('receivedAmount', 'receivedUSDTitle', 'receivedLocalTitle')}
              {isNational && nationallyBudgetSupported === true && (
                <div className="national-budget">
                  <div className="form-section-sub-header">{t('nationalBudgetTitle')}</div>
                  {budgetYears.length === 0 && (
                    <div className="form-section-note">{t('nationalBudgetNoYears')}</div>
                  )}
                  <Row gutter={gutterSize}>
                    {budgetYears.map((year) => (
                      <Col key={year} {...quarterColumnBps}>
                        <Form.Item
                          label={
                            <label className="form-item-header">
                              {`${t('nationalBudgetYearTitle')} ${year}`}
                            </label>
                          }
                          name={budgetField(year)}
                          rules={[validation.required]}
                        >
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            className="form-input-box"
                            onKeyDown={blockNonNumericKeys}
                            disabled={isView}
                          />
                        </Form.Item>
                      </Col>
                    ))}
                  </Row>
                  {budgetYears.length > 0 && (
                    <Row gutter={gutterSize}>
                      <Form.Item shouldUpdate noStyle>
                        {() => {
                          const totalDomestic = round2(
                            budgetYears.reduce(
                              (sum, year) =>
                                sum + (parseFloat(form.getFieldValue(budgetField(year))) || 0),
                              0
                            )
                          );
                          const rate = parseFloat(form.getFieldValue('exchangeRate'));
                          return (
                            <>
                              <Col {...halfColumnBps}>
                                <Form.Item
                                  label={
                                    <label className="form-item-header-small">
                                      {t('nationalBudgetTotalLocalTitle')}
                                    </label>
                                  }
                                >
                                  <Input
                                    type="number"
                                    className="form-input-box"
                                    disabled
                                    value={totalDomestic}
                                  />
                                </Form.Item>
                              </Col>
                              <Col {...halfColumnBps}>
                                <Form.Item
                                  label={
                                    <label className="form-item-header-small">
                                      {t('nationalBudgetTotalUSDTitle')}
                                    </label>
                                  }
                                >
                                  <Input
                                    type="number"
                                    className="form-input-box"
                                    disabled
                                    value={rate > 0 ? round2(totalDomestic / rate) : undefined}
                                  />
                                </Form.Item>
                              </Col>
                            </>
                          );
                        }}
                      </Form.Item>
                    </Row>
                  )}
                </div>
              )}
              <Row gutter={gutterSize}>
                <Col span={24}>
                  <Form.Item
                    label={<label className="form-item-header">{t('commentsTitle')}</label>}
                    name="comments"
                  >
                    <TextArea maxLength={2000} rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-sub-header">{t('formHeader:documentsHeader')}</div>
              <UploadFileGrid
                isSingleColumn={false}
                usedIn={method}
                buttonText={t('entityAction:upload')}
                storedFiles={storedFiles}
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                removedFiles={filesToRemove}
                setRemovedFiles={setFilesToRemove}
                setIsSaveButtonDisabled={setIsSaveButtonDisabled}
              ></UploadFileGrid>
            </div>
            {method === 'create' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/support');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                <Col {...shortButtonBps}>
                  <Form.Item>
                    <Button type="primary" size="large" block htmlType="submit">
                      {t('entityAction:add')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
            {method === 'view' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/support');
                    }}
                  >
                    {t('entityAction:back')}
                  </Button>
                </Col>
                {ability.can(Action.Validate, SupportEntity) && (
                  <Col>
                    <Form.Item>
                      <Tooltip
                        placement="topRight"
                        title={
                          !isValidationAllowed ? t('error:validationPermissionRequired') : undefined
                        }
                        showArrow={false}
                      >
                        <Button
                          type="primary"
                          size="large"
                          block
                          onClick={() => {
                            validateEntity();
                          }}
                          loading={waitingForValidation}
                          disabled={!isValidationAllowed}
                        >
                          {isValidated ? t('entityAction:unvalidate') : t('entityAction:validate')}
                        </Button>
                      </Tooltip>
                    </Form.Item>
                  </Col>
                )}
              </Row>
            )}
            {method === 'update' && (
              <Row className="sticky-footer" gutter={20} justify={'end'}>
                <Col>
                  <Button
                    type="default"
                    size="large"
                    block
                    onClick={() => {
                      navigate('/support');
                    }}
                  >
                    {t('entityAction:cancel')}
                  </Button>
                </Col>
                {ability.can(Action.Delete, SupportEntity) && (
                  <Col>
                    <Button
                      type="default"
                      size="large"
                      block
                      onClick={() => {
                        deleteClicked();
                      }}
                      style={{ color: 'red', borderColor: 'red' }}
                    >
                      {t('entityAction:delete')}
                    </Button>
                  </Col>
                )}
                <Col {...shortButtonBps}>
                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      block
                      htmlType="submit"
                      disabled={isSaveButtonDisabled}
                    >
                      {t('entityAction:update')}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>
        ) : (
          <Spin className="loading-center" size="large" />
        )}
      </Form>
    </div>
  );
};

export default SupportForm;
