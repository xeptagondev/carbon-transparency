import { useTranslation } from 'react-i18next';
import { Row, Col, Input, Button, Form, Select, message } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { GraphUpArrow } from 'react-bootstrap-icons';
import './projectForm.scss';
import { ProjectStatus, ProjectType } from '../../../Enums/project.enum';
import { IntImplementor, Recipient } from '../../../Enums/shared.enum';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { NewKpiData } from '../../../Definitions/kpiDefinitions';
import { ProgrammeSelectData } from '../../../Definitions/programmeDefinitions';
import { ActivityData } from '../../../Definitions/activityDefinitions';
import { SupportData } from '../../../Definitions/supportDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getValidationRules } from '../../../Utils/validationRules';
import { getFormTitle } from '../../../Utils/utilServices';
import { Action } from '../../../Enums/action.enum';
import { ProjectEntity } from '../../../Entities/project';
import { useAbilityContext } from '../../../Casl/Can';
import { getSupportTableColumns } from '../../../Definitions/columns/supportColumns';
import { getActivityTableColumns } from '../../../Definitions/columns/activityColumns';
import UpdatesTimeline from '../../../Components/UpdateTimeline/updates';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ProjectForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['projectForm']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Project', method)[0];
  const formDesc = getFormTitle('Project', method)[1];

  const navigate = useNavigate();
  const { post } = useConnection();
  const ability = useAbilityContext();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // form state

  const [programmeList, setProgrammeList] = useState<ProgrammeSelectData[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Activities state

  const [allActivityIds, setAllActivityList] = useState<string[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);

  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [activityCurrentPage, setActivityCurrentPage] = useState<any>(1);
  const [activityPageSize, setActivityPageSize] = useState<number>(10);

  // Supports state

  const [supportData, setSupportData] = useState<SupportData[]>([]);
  const [supportCurrentPage, setSupportCurrentPage] = useState<any>(1);
  const [supportPageSize, setSupportPageSize] = useState<number>(10);

  // KPI State

  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);
  const [migratedKpiList, setMigratedKpiList] = useState<number[]>([]);

  // TODO : Connect to the BE Endpoints for data fetching
  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    const programmeData: ProgrammeSelectData[] = [];
    for (let i = 0; i < 5; i++) {
      programmeData.push({
        id: `P00${i}`,
        title: `Xep Energy 00${i}`,
      });
    }
    setProgrammeList(programmeData);

    const activityIds: string[] = [];
    for (let i = 0; i < 15; i++) {
      activityIds.push(`T00${i}`);
    }
    setAllActivityList(activityIds);

    if (method !== 'create') {
      const tempFiles: { key: string; title: string; url: string }[] = [];
      for (let i = 0; i < 6; i++) {
        tempFiles.push({ key: `${i}`, title: `title_${i}.pdf`, url: `url_${i}` });
      }
      setStoredFiles(tempFiles);
    }
  }, []);

  useEffect(() => {
    const tempActivityData: ActivityData[] = [];
    selectedActivityIds.forEach((actId) => {
      tempActivityData.push({
        key: actId,
        activityId: actId,
        title: 'Title',
        reductionMeasures: 'With Measures',
        status: 'Planned',
        startYear: 2014,
        endYear: 2016,
        natImplementor: 'Department of Energy',
      });
    });
    setActivityData(tempActivityData);

    // Get the Support Data for each attached Activity
    setSupportData([]);

    // Setting Pagination
    setActivityCurrentPage(1);
    setActivityPageSize(10);
  }, [selectedActivityIds]);

  useEffect(() => {
    console.log('Running Migration Update');

    if (method !== 'create') {
      console.log('Get the Action Information and load them');
    }

    // Get Migrated Data for the Activities
    form.setFieldsValue({
      actionTitle: 'Increase Renewable Electricity Generation',
      programmeTitle: 'Increase Grid Connected generation',
      natAnchor: 'NDC',
      instrTypes: 'Policy',
      sectorsAffected: 'Energy',
      subSectorsAffected: 'Grid-Connected Generation',
      natImplementor: 'Department of Energy',
      techDevContribution: 'Yes',
      capBuildObjectives: 'Yes',
      techType: 'Renewable Energy',
      neededUSD: 1000000,
      neededLCL: 2500000,
      recievedUSD: 50000,
      recievedLCL: 86520,
    });

    const migratedKpis = [];
    for (let i = 0; i < 2; i++) {
      const updatedValues = {
        [`kpi_name_${i}`]: `Name_${i}`,
        [`kpi_unit_${i}`]: `Unit_${i}`,
        [`kpi_ach_${i}`]: 35,
        [`kpi_exp_${i}`]: 55,
      };

      form.setFieldsValue(updatedValues);
      migratedKpis.push(i);
    }

    setMigratedKpiList(migratedKpis);
  }, [activityData]);

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      for (const key in payload) {
        if (key.startsWith('kpi_')) {
          delete payload[key];
        }
      }

      if (uploadedFiles.length > 0) {
        payload.documents = [];
        uploadedFiles.forEach((file) => {
          payload.documents.push({ title: file.title, data: file.data });
        });
      }

      if (newKpiList.length > 0) {
        payload.kpis = [];
        newKpiList.forEach((kpi) => {
          payload.kpis.push({
            name: kpi.name,
            creatorType: kpi.creatorType,
            expected: kpi.expected,
          });
        });
      }

      if (selectedActivityIds.length > 0) {
        payload.linkedActivities = selectedActivityIds;
      }

      payload.timeFrame = parseFloat(payload.timeFrame);
      payload.startYear = parseInt(payload.startYear);
      payload.endYear = parseInt(payload.endYear);
      payload.achievedGHGReduction = parseFloat(payload.achievedGHGReduction);
      payload.expectedGHGReduction = parseFloat(payload.expectedGHGReduction);

      console.log(payload);

      const response = await post('national/projects/add', payload);
      if (response.status === 200 || response.status === 201) {
        message.open({
          type: 'success',
          content: t('projectCreationSuccess'),
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });
        navigate('/projects');
      }
    } catch (error: any) {
      console.log('Error in project creation', error);
      message.open({
        type: 'error',
        content: `${error.message}`,
        duration: 3,
        style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
      });
    }
  };

  // Entity Validate

  const validateEntity = () => {
    console.log('Validate Clicked');
  };

  // Entity Delete

  const deleteEntity = () => {
    console.log('Delete Clicked');
  };

  // Add New KPI

  const createKPI = () => {
    const kpiIndex = Math.floor(Date.now() / 1000);
    const newItem: NewKpiData = {
      index: kpiIndex,
      name: '',
      unit: '',
      creatorType: 'project',
      expected: 0,
    };
    const updatedValues = {
      [`kpi_ach_${kpiIndex}`]: 0,
    };

    form.setFieldsValue(updatedValues);
    setNewKpiList((prevList) => [...prevList, newItem]);
  };

  const removeKPI = (kpiIndex: number) => {
    setNewKpiList(newKpiList.filter((obj) => obj.index !== kpiIndex));

    const updatedValues = {
      [`kpi_name_${kpiIndex}`]: '',
      [`kpi_unit_${kpiIndex}`]: '',
      [`kpi_exp_${kpiIndex}`]: '',
    };

    form.setFieldsValue(updatedValues);
  };

  const updateKPI = (id: number, property: keyof NewKpiData, value: any): void => {
    setNewKpiList((prevKpiList) => {
      const updatedKpiList = prevKpiList.map((kpi) => {
        if (kpi.index === id) {
          return { ...kpi, [property]: value };
        }
        return kpi;
      });
      return updatedKpiList;
    });
  };

  // Detach Project

  const detachActivity = (actId: string) => {
    console.log(actId);
    const filteredData = activityData.filter((act) => act.activityId !== actId);
    const filteredIds = selectedActivityIds.filter((id) => id !== actId);
    setActivityData(filteredData);
    setSelectedActivityIds(filteredIds);
  };

  // Activity Column Definition

  const activityTableColumns = getActivityTableColumns(isView, detachActivity);

  // Support Column Definition

  const supportTableColumns = getSupportTableColumns();

  // Activity Table Behaviour

  const handleActivityTableChange = (pagination: any) => {
    setActivityCurrentPage(pagination.current);
    setActivityPageSize(pagination.pageSize);
  };

  // Support Table Behaviour

  const handleSupportTableChange = (pagination: any) => {
    setSupportCurrentPage(pagination.current);
    setSupportPageSize(pagination.pageSize);
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
        <div className="body-sub-title">{t(formDesc)}</div>
      </div>
      <div className="project-form">
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <div className="form-section-card">
            <div className="form-section-header">{t('generalInfoTitle')}</div>
            {method !== 'create' && entId && (
              <EntityIdCard calledIn="Project" entId={entId}></EntityIdCard>
            )}
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('selectProgrammeHeader')}</label>}
                  name="programmeId"
                >
                  <Select
                    size={'large'}
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {programmeList.map((program) => (
                      <Option key={program.id} value={program.id}>
                        {program.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('typeHeader')}</label>}
                  name="type"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(ProjectType).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('projTitleHeader')}</label>}
                  name="title"
                  rules={[validation.required]}
                >
                  <Input className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('projDescHeader')}</label>}
                  name="description"
                  rules={[validation.required]}
                >
                  <TextArea maxLength={250} rows={3} disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('projectNumberHeader')}</label>}
                  name="addProjectNumber"
                >
                  <Input className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('actionTitleHeader')}</label>}
                  name="actionTitle"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('programmeTitleHeader')}</label>}
                  name="programmeTitle"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('natAnchorHeader')}</label>}
                  name="natAnchor"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('instrTypesHeader')}</label>}
                  name="instrTypes"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('projectStatusHeader')}</label>}
                  name="projectStatus"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(ProjectStatus).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('sectorsAffectedHeader')}</label>}
                  name="sectorsAffected"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={
                    <label className="form-item-header">{t('subSectorsAffectedHeader')}</label>
                  }
                  name="subSectorsAffected"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('startYearHeader')}</label>}
                  name="startYear"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {yearsList.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('endYearHeader')}</label>}
                  name="endYear"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {yearsList.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('timeFrameHeader')}</label>}
                  name="timeFrame"
                  rules={[validation.required]}
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('natImplementorHeader')}</label>}
                  name="natImplementor"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('techTypeHeader')}</label>}
                  name="techType"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('recipientHeader')}</label>}
                  name="recipientEntities"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    mode="multiple"
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(Recipient).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('intImplementorHeader')}</label>}
                  name="internationalImplementingEntities"
                  rules={[validation.required]}
                >
                  <Select
                    size="large"
                    style={{ fontSize: inputFontSize }}
                    mode="multiple"
                    allowClear
                    disabled={isView}
                    showSearch
                  >
                    {Object.values(IntImplementor).map((instrument) => (
                      <Option key={instrument} value={instrument}>
                        {instrument}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('techDevHeader')}</label>}
                  name="techDevContribution"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<number>
                  label={<label className="form-item-header">{t('capBuildHeader')}</label>}
                  name="capBuildObjectives"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-section-sub-header">{t('documentsHeader')}</div>
            <UploadFileGrid
              isSingleColumn={false}
              usedIn={method}
              buttonText={t('upload')}
              acceptedFiles=".xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg"
              storedFiles={storedFiles}
              uploadedFiles={uploadedFiles}
              setUploadedFiles={setUploadedFiles}
              removedFiles={filesToRemove}
              setRemovedFiles={setFilesToRemove}
            ></UploadFileGrid>
            <div className="form-section-header">{t('mitigationInfoTitle')}</div>
            <div className="form-section-sub-header">{t('emmissionInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('achieved')}</label>}
                  name="achievedGHGReduction"
                  rules={[validation.required]}
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className="form-item-header">{t('expected')}</label>}
                  name="expectedGHGReduction"
                  rules={[validation.required]}
                >
                  <Input type="number" className="form-input-box" />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-section-sub-header">{t('kpiInfoTitle')}</div>
            {migratedKpiList.map((index: number) => (
              <KpiGrid
                key={index}
                form={form}
                rules={[]}
                index={index}
                calledTo={'view'}
                gutterSize={gutterSize}
                headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
              ></KpiGrid>
            ))}
            {newKpiList.map((kpi: any) => (
              <KpiGrid
                key={kpi.index}
                form={form}
                rules={[validation.required]}
                index={kpi.index}
                calledTo={'create'}
                gutterSize={gutterSize}
                headerNames={[t('kpiName'), t('kpiUnit'), t('achieved'), t('expected')]}
                updateKPI={updateKPI}
                removeKPI={removeKPI}
              ></KpiGrid>
            ))}
            <Row justify={'start'}>
              <Col span={2}>
                {!isView && (
                  <Button
                    icon={<PlusCircleOutlined />}
                    className="create-kpi-button"
                    onClick={createKPI}
                  >
                    {t('addKPI')}
                  </Button>
                )}
              </Col>
            </Row>
            <Row gutter={gutterSize}>
              <Col span={24}>
                <Form.Item
                  label={<label className="form-item-header">{t('programmeCommentsTitle')}</label>}
                  name="comment"
                  rules={[validation.required]}
                >
                  <TextArea rows={3} disabled={isView} />
                </Form.Item>
              </Col>
            </Row>
            <div className="form-section-header">{t('financeInfoTitle')}</div>
            <Row gutter={gutterSize}>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('neededUSDHeader')}</label>}
                  name="neededUSD"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('neededLCLHeader')}</label>}
                  name="neededLCL"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('recievedUSDHeader')}</label>}
                  name="recievedUSD"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={<label className="form-item-header">{t('recievedLCLHeader')}</label>}
                  name="recievedLCL"
                >
                  <Input className="form-input-box" disabled />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="form-section-card">
            <Row>
              <Col span={6} style={{ paddingTop: '6px' }}>
                <div className="form-section-header">{t('activityInfoTitle')}</div>
              </Col>
              <Col span={4}>
                <AttachEntity
                  isDisabled={isView}
                  content={{
                    buttonName: t('attachActivity'),
                    attach: t('attach'),
                    contentTitle: t('attachActivity'),
                    listTitle: t('activityList'),
                    cancel: t('cancel'),
                  }}
                  options={allActivityIds}
                  alreadyAttached={[]} // Need to be defined
                  currentAttachments={selectedActivityIds}
                  setCurrentAttachments={setSelectedActivityIds}
                  icon={<GraphUpArrow style={{ fontSize: '120px' }} />}
                ></AttachEntity>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <div style={{ overflowX: 'auto' }}>
                  <LayoutTable
                    tableData={activityData.slice(
                      (activityCurrentPage - 1) * activityPageSize,
                      (activityCurrentPage - 1) * activityPageSize + activityPageSize
                    )}
                    columns={activityTableColumns}
                    loading={false}
                    pagination={{
                      current: activityCurrentPage,
                      pageSize: activityPageSize,
                      total: activityData.length,
                      showQuickJumper: true,
                      pageSizeOptions: ['10', '20', '30'],
                      showSizeChanger: true,
                      style: { textAlign: 'center' },
                      locale: { page: '' },
                      position: ['bottomRight'],
                    }}
                    handleTableChange={handleActivityTableChange}
                    emptyMessage={t('noActivityMessage')}
                  />{' '}
                </div>
              </Col>
            </Row>
          </div>
          <div className="form-section-card">
            <Row>
              <Col span={6}>
                <div className="form-section-header">{t('supportInfoTitle')}</div>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <LayoutTable
                  tableData={supportData}
                  columns={supportTableColumns}
                  loading={false}
                  pagination={{
                    current: supportCurrentPage,
                    pageSize: supportPageSize,
                    total: supportData.length,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '30'],
                    showSizeChanger: true,
                    style: { textAlign: 'center' },
                    locale: { page: '' },
                    position: ['bottomRight'],
                  }}
                  handleTableChange={handleSupportTableChange}
                  emptyMessage={t('noSupportMessage')}
                />
              </Col>
            </Row>
          </div>
          {isView && (
            <div className="form-section-timelinecard">
              <div className="form-section-header">{t('updatesInfoTitle')}</div>
              <UpdatesTimeline recordType={'project'} recordId={entId} />
            </div>
          )}
          {method === 'create' && (
            <Row gutter={20} justify={'end'}>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    navigate('/projects');
                  }}
                >
                  {t('cancel')}
                </Button>
              </Col>
              <Col span={2}>
                <Form.Item>
                  <Button type="primary" size="large" block htmlType="submit">
                    {t('add')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          )}
          {method === 'view' && (
            <Row gutter={20} justify={'end'}>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    navigate('/projects');
                  }}
                >
                  {t('back')}
                </Button>
              </Col>
              {ability.can(Action.Validate, ProjectEntity) && (
                <Col span={2.5}>
                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      block
                      onClick={() => {
                        validateEntity();
                      }}
                    >
                      {t('validate')}
                    </Button>
                  </Form.Item>
                </Col>
              )}
            </Row>
          )}
          {method === 'update' && (
            <Row gutter={20} justify={'end'}>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    navigate('/projects');
                  }}
                >
                  {t('cancel')}
                </Button>
              </Col>
              <Col span={2}>
                <Button
                  type="default"
                  size="large"
                  block
                  onClick={() => {
                    deleteEntity();
                  }}
                  style={{ color: 'red', borderColor: 'red' }}
                >
                  {t('delete')}
                </Button>
              </Col>
              <Col span={2.5}>
                <Form.Item>
                  <Button type="primary" size="large" block htmlType="submit">
                    {t('update')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
      </div>
    </div>
  );
};

export default ProjectForm;
