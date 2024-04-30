import { useTranslation } from 'react-i18next';
import {
  Row,
  Col,
  Input,
  Button,
  Form,
  Select,
  message,
  Popover,
  List,
  Typography,
  Spin,
} from 'antd';
import { CloseCircleOutlined, EllipsisOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import LayoutTable from '../../../Components/common/Table/layout.table';
import { useNavigate, useParams } from 'react-router-dom';
import UploadFileGrid from '../../../Components/Upload/uploadFiles';
import AttachEntity from '../../../Components/Popups/attach';
import { useConnection } from '../../../Context/ConnectionContext/connectionContext';
import { Sector } from '../../../Enums/sector.enum';
import { SubSector, NatImplementor } from '../../../Enums/shared.enum';
import { ProgrammeStatus } from '../../../Enums/programme.enum';
import { Layers } from 'react-bootstrap-icons';
import './programmeForm.scss';
import { KpiGrid } from '../../../Components/KPI/kpiGrid';
import EntityIdCard from '../../../Components/EntityIdCard/entityIdCard';
import { NewKpiData } from '../../../Definitions/kpiDefinitions';
import { ActionSelectData } from '../../../Definitions/actionDefinitions';
import { ProjectData } from '../../../Definitions/projectDefinitions';
import { FormLoadProps } from '../../../Definitions/InterfacesAndType/formInterface';
import { getValidationRules } from '../../../Utils/validationRules';
import { getFormTitle, joinTwoArrays } from '../../../Utils/utilServices';
import { ProgrammeMigratedData } from '../../../Definitions/programmeDefinitions';
// import { ActivityData } from '../../../Definitions/activityDefinitions';
// import { SupportData } from '../../../Definitions/supportDefinitions';

const { Option } = Select;
const { TextArea } = Input;

const gutterSize = 30;
const inputFontSize = '13px';

const ProgrammeForm: React.FC<FormLoadProps> = ({ method }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation(['programmeForm']);

  const isView: boolean = method === 'view' ? true : false;
  const formTitle = getFormTitle('Programme', method)[0];
  const formDesc = getFormTitle('Programme', method)[1];

  const navigate = useNavigate();
  const { get, post, put } = useConnection();
  const { entId } = useParams();

  // Form Validation Rules

  const validation = getValidationRules(method);

  // Parent Select state

  const [actionList, setActionList] = useState<ActionSelectData[]>([]);

  // Form General State

  const [programmeMigratedData, setProgrammeMigratedData] = useState<ProgrammeMigratedData>();
  const [uploadedFiles, setUploadedFiles] = useState<
    { key: string; title: string; data: string }[]
  >([]);
  const [storedFiles, setStoredFiles] = useState<{ key: string; title: string; url: string }[]>([]);
  const [filesToRemove, setFilesToRemove] = useState<string[]>([]);

  // Spinner When Form Submit Occurs

  const [waitingForBE, setWaitingForBE] = useState<boolean>(false);

  // Popover state

  const [detachOpen, setDetachOpen] = useState<boolean[]>([]);

  // Project Attachment state

  const [allProjectIds, setAllProjectIdList] = useState<string[]>([]);
  const [attachedProjectIds, setAttachedProjectIds] = useState<string[]>([]);
  const [tempProjectIds, setTempProjectIds] = useState<string[]>([]);

  const [projectData, setProjectData] = useState<ProjectData[]>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Activity Attachment state

  // const [allActivityIds, setAllActivityIdList] = useState<string[]>([]);
  // const [attachedActivityIds, setAttachedActivityIds] = useState<string[]>([]);
  // const [tempActivityIds, setTempActivityIds] = useState<string[]>([]);

  // const [activityData, setActivityData] = useState<ActivityData[]>([]);
  // const [activityCurrentPage, setActivityCurrentPage] = useState<any>(1);
  // const [activityPageSize, setActivityPageSize] = useState<number>(10);

  // const [supportData, setSupportData] = useState<SupportData[]>([]);
  // const [supportCurrentPage, setSupportCurrentPage] = useState<any>(1);
  // const [supportPageSize, setSupportPageSize] = useState<number>(10);

  // KPI State

  const [newKpiList, setNewKpiList] = useState<NewKpiData[]>([]);
  const [migratedKpiList, setMigratedKpiList] = useState<number[]>([]);

  // Initialization Logic

  const yearsList: number[] = [];

  for (let year = 2013; year <= 2050; year++) {
    yearsList.push(year);
  }

  useEffect(() => {
    // Initially Loading Free Actions that can be parent

    const fetchFreeActions = async () => {
      const payload = {
        page: 1,
        size: 100,
        sort: {
          key: 'actionId',
          order: 'ASC',
        },
      };
      const response: any = await post('national/actions/query', payload);

      const tempActionData: ActionSelectData[] = [];
      response.data.forEach((action: any) => {
        tempActionData.push({
          id: action.actionId,
          title: action.title,
          instrumentType: action.instrumentType,
        });
      });
      setActionList(tempActionData);
    };

    fetchFreeActions();

    // Initially Loading Free Projects that can be attached

    const fetchFreeProjects = async () => {
      if (method !== 'view') {
        const response: any = await get('national/projects/link/eligible');

        const freeProjectIds: string[] = [];
        response.data.forEach((prj: any) => {
          freeProjectIds.push(prj.projectId);
        });
        setAllProjectIdList(freeProjectIds);
      }
    };
    fetchFreeProjects();

    // Initially Loading the underlying programme data when not in create mode

    const fetchData = async () => {
      if (method !== 'create' && entId) {
        let response: any;
        try {
          response = await get(`national/programmes/${entId}`);

          if (response.status === 200 || response.status === 201) {
            const entityData: any = response.data;

            // Populating Action owned data fields
            form.setFieldsValue({
              actionId: entityData.actionId,
              instrumentType: entityData.instrumentType,
              title: entityData.title,
              description: entityData.description,
              objective: entityData.objectives,
              programmeStatus: entityData.programmeStatus,
              startYear: entityData.startYear,
              natAnchor: entityData.natAnchor,
              affectedSectors: entityData.affectedSectors,
              affectedSubSector: entityData.affectedSubSector,
              natImplementor: entityData.nationalImplementor,
              investment: entityData.investment,
              comments: entityData.comments,
            });

            if (entityData.documents?.length > 0) {
              const tempFiles: { key: string; title: string; url: string }[] = [];
              entityData.documents.forEach((document: any) => {
                tempFiles.push({
                  key: document.createdTime,
                  title: document.title,
                  url: document.url,
                });
              });
              setStoredFiles(tempFiles);
            }

            // Populating Migrated Fields (Will be overwritten when attachments change)
            setProgrammeMigratedData({
              type: entityData.types ?? [],
              intImplementor: entityData.interNationalImplementor ?? [],
              recipientEntity: entityData.recipientEntity ?? [],
              ghgsAffected: entityData.ghgsAffected,
              achievedReduct: entityData.achievedGHGReduction,
              expectedReduct: entityData.expectedGHGReduction,
            });
          }
        } catch {
          navigate('/programmes');
          message.open({
            type: 'error',
            content: "Requested Programme doesn't exist !",
            duration: 3,
            style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
          });
        }
      }
    };
    fetchData();

    // Initially Loading the attached project data when not in create mode

    const fetchConnectedProjectIds = async () => {
      if (method !== 'create') {
        const payload = {
          page: 1,
          size: 100,
          filterAnd: [
            {
              key: 'programmeId',
              operation: '=',
              value: entId,
            },
          ],
          sort: {
            key: 'projectId',
            order: 'ASC',
          },
        };
        const response: any = await post('national/projects/query', payload);

        const connectedProjectIds: string[] = [];
        response.data.forEach((prj: any) => {
          connectedProjectIds.push(prj.projectId);
        });
        setAttachedProjectIds(connectedProjectIds);
        setTempProjectIds(connectedProjectIds);
      }
    };
    fetchConnectedProjectIds();

    // const fetchConnectedActivityIds = async () => {
    //   if (method !== 'create') {
    //     const connectedActivityIds: string[] = [];
    //     const payload = {
    //       page: 1,
    //       size: 100,
    //       filterAnd: [
    //         {
    //           key: 'actionId',
    //           operation: '=',
    //           value: entId,
    //         },
    //       ],
    //       sort: {
    //         key: 'activityId',
    //         order: 'ASC',
    //       },
    //     };
    //     const response: any = await post('national/activities/query', payload);
    //     response.data.forEach((act: any) => {
    //       connectedActivityIds.push(act.activityId);
    //     });
    //     setAttachedActivityIds(connectedActivityIds);
    //     setTempActivityIds(connectedActivityIds);
    //   }
    // };
    // fetchConnectedActivityIds();
  }, []);

  // Populating Form Migrated Fields, when migration data changes

  useEffect(() => {
    if (programmeMigratedData) {
      form.setFieldsValue({
        type: programmeMigratedData.type,
        intImplementor: programmeMigratedData.intImplementor,
        recipientEntity: programmeMigratedData.recipientEntity,
        ghgsAffected: programmeMigratedData.ghgsAffected,
        achievedReduct: programmeMigratedData.achievedReduct,
        expectedReduct: programmeMigratedData.expectedReduct,
      });
    }
  }, [programmeMigratedData]);

  // Fetching Project data and calculating migrated fields when attachment changes

  useEffect(() => {
    const payload = {
      page: 1,
      size: tempProjectIds.length,
      filterOr: [] as any[],
    };

    const tempMigratedData: ProgrammeMigratedData = {
      type: [],
      intImplementor: [],
      recipientEntity: [],
      ghgsAffected: '',
      achievedReduct: 0,
      expectedReduct: 0,
    };

    const fetchData = async () => {
      if (tempProjectIds.length > 0) {
        tempProjectIds.forEach((projId) => {
          payload.filterOr.push({
            key: 'projectId',
            operation: '=',
            value: projId,
          });
        });
        const response: any = await post('national/projects/query', payload);

        const tempPRJData: ProjectData[] = [];

        response.data.forEach((prj: any, index: number) => {
          tempPRJData.push({
            key: index.toString(),
            projectId: prj.projectId,
            projectName: prj.title,
          });

          tempMigratedData.type.push(prj.type);

          tempMigratedData.intImplementor = joinTwoArrays(
            tempMigratedData.intImplementor,
            prj.internationalImplementingEntities ?? []
          );

          tempMigratedData.recipientEntity = joinTwoArrays(
            tempMigratedData.recipientEntity,
            prj.recipientEntities ?? []
          );

          const prgGHGAchievement = prj.migratedData[0]?.achievedGHGReduction;
          const prgGHGExpected = prj.migratedData[0]?.expectedGHGReduction;

          tempMigratedData.achievedReduct =
            tempMigratedData.achievedReduct + prgGHGAchievement !== null ? prgGHGAchievement : 0;

          tempMigratedData.expectedReduct =
            tempMigratedData.expectedReduct + prgGHGExpected !== null ? prgGHGExpected : 0;
        });
        setProjectData(tempPRJData);
        setProgrammeMigratedData(tempMigratedData);
      } else {
        setProjectData([]);
        setProgrammeMigratedData(tempMigratedData);
      }
    };
    fetchData();

    setDetachOpen(Array(tempProjectIds.length).fill(false));
  }, [tempProjectIds]);

  useEffect(() => {
    console.log('Running KPI Migration Update');

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
  }, [projectData]);

  // Attachment resolve before updating an already created programme

  const resolveAttachments = async () => {
    const toAttach = tempProjectIds.filter((prj) => !attachedProjectIds.includes(prj));
    const toDetach = attachedProjectIds.filter((prj) => !tempProjectIds.includes(prj));

    if (toDetach.length > 0) {
      await post('national/projects/unlink', { projects: toDetach });
    }

    if (toAttach.length > 0) {
      await post('national/projects/link', { programmeId: entId, projectIds: toAttach });
    }
  };

  // Form Submit

  const handleSubmit = async (payload: any) => {
    try {
      setWaitingForBE(true);

      for (const key in payload) {
        if (key.startsWith('kpi_')) {
          delete payload[key];
        }
      }

      if (uploadedFiles.length > 0) {
        if (method === 'create') {
          payload.documents = [];
          uploadedFiles.forEach((file) => {
            payload.documents.push({ title: file.title, data: file.data });
          });
        } else if (method === 'update') {
          payload.newDocuments = [];
          uploadedFiles.forEach((file) => {
            payload.newDocuments.push({ title: file.title, data: file.data });
          });
        }
      }

      if (filesToRemove.length > 0) {
        payload.removedDocuments = [];
        filesToRemove.forEach((removedFileKey) => {
          payload.removedDocuments.push(
            storedFiles.find((file) => file.key === removedFileKey)?.url
          );
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

      if (projectData.length > 0 && method === 'create') {
        payload.linkedProjects = [];
        projectData.forEach((project) => {
          payload.linkedProgrammes.push(project.projectId);
        });
      }

      payload.investment = parseFloat(payload.investment);

      let response: any;

      if (method === 'create') {
        response = await post('national/programmes/add', payload);
      } else if (method === 'update') {
        payload.programmeId = entId;
        response = await put('national/programmes/update', payload);

        resolveAttachments();
      }

      const successMsg =
        method === 'create' ? t('programmeCreationSuccess') : t('programmeUpdateSuccess');

      if (response.status === 200 || response.status === 201) {
        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });

        message.open({
          type: 'success',
          content: successMsg,
          duration: 3,
          style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
        });

        await new Promise((resolve) => {
          setTimeout(resolve, 500);
        });

        setWaitingForBE(false);
        navigate('/programmes');
      }
    } catch (error: any) {
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
      creatorType: 'programme',
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

  // Detach Programme

  const handleDetachOpen = (record: ProjectData) => {
    const newOpenList = Array(tempProjectIds.length).fill(false);
    newOpenList[tempProjectIds.indexOf(record.projectId)] = true;
    setDetachOpen(newOpenList);
  };

  const detachProject = async (prjId: string) => {
    const filteredIds = tempProjectIds.filter((id) => id !== prjId);
    setTempProjectIds(filteredIds);
  };

  // Action Menu definition

  const actionMenu = (record: ProjectData) => {
    return (
      <List
        className="action-menu"
        size="small"
        dataSource={[
          {
            text: t('detach'),
            icon: <CloseCircleOutlined style={{ color: 'red' }} />,
            click: () => {
              {
                detachProject(record.projectId);
              }
            },
          },
        ]}
        renderItem={(item) => (
          <List.Item onClick={item.click}>
            <Typography.Text className="action-icon">{item.icon}</Typography.Text>
            <span>{item.text}</span>
          </List.Item>
        )}
      />
    );
  };

  // Column Definition
  const projTableColumns = [
    { title: t('projectId'), dataIndex: 'projectId', key: 'projectId' },
    { title: t('projectName'), dataIndex: 'projectName', key: 'projectName' },
    {
      title: '',
      key: 'projectAction',
      align: 'right' as const,
      width: 6,
      render: (record: any) => {
        return (
          <>
            {!isView && (
              <Popover
                placement="bottomRight"
                content={actionMenu(record)}
                trigger="click"
                open={detachOpen[tempProjectIds.indexOf(record.projectId)]}
              >
                <EllipsisOutlined
                  rotate={90}
                  style={{ fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}
                  onClick={() => handleDetachOpen(record)}
                />
              </Popover>
            )}
          </>
        );
      },
    },
  ];

  // Table Behaviour

  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  return (
    <div className="content-container">
      <div className="title-bar">
        <div className="body-title">{t(formTitle)}</div>
        <div className="body-sub-title">{t(formDesc)}</div>
      </div>
      {!waitingForBE ? (
        <div className="programme-form">
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <div className="form-section-card">
              <div className="form-section-header">{t('generalInfoTitle')}</div>
              {method !== 'create' && entId && (
                <EntityIdCard calledIn="Programme" entId={entId}></EntityIdCard>
              )}
              <Row gutter={gutterSize}>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('selectActionHeader')}</label>}
                    name="actionId"
                  >
                    <Select
                      size={'large'}
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                      onChange={(value: any) => {
                        form.setFieldsValue({
                          instrumentType: actionList.find((action) => action.id === value)
                            ?.instrumentType,
                        });
                      }}
                    >
                      {actionList.map((action) => (
                        <Option key={action.id} value={action.id}>
                          {action.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('typesHeader')}</label>}
                    name="type"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      disabled={true}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('progTitleHeader')}</label>}
                    name="title"
                    rules={[validation.required]}
                  >
                    <Input className="form-input-box" disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('progDescTitle')}</label>}
                    name="description"
                    rules={[validation.required]}
                  >
                    <TextArea maxLength={250} rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('progObjectivesTitle')}</label>}
                    name="objective"
                    rules={[validation.required]}
                  >
                    <TextArea maxLength={250} rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('instrTypeTitle')}</label>}
                    name="instrumentType"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('progStatusTitle')}</label>}
                    name="programmeStatus"
                    rules={[validation.required]}
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      allowClear
                      disabled={isView}
                      showSearch
                    >
                      {Object.values(ProgrammeStatus).map((instrument) => (
                        <Option key={instrument} value={instrument}>
                          {instrument}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('sectorsAffTitle')}</label>}
                    name="affectedSectors"
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
                      {Object.values(Sector).map((instrument) => (
                        <Option key={instrument} value={instrument}>
                          {instrument}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label={<label className="form-item-header">{t('subSectorsAffTitle')}</label>}
                    name="affectedSubSector"
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
                      {Object.values(SubSector).map((instrument) => (
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
                    label={<label className="form-item-header">{t('startYearTitle')}</label>}
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
                    label={<label className="form-item-header">{t('intImplementorTitle')}</label>}
                    name="intImplementor"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      disabled={true}
                    ></Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('recipientEntityTitle')}</label>}
                    name="recipientEntity"
                  >
                    <Select
                      size="large"
                      style={{ fontSize: inputFontSize }}
                      mode="multiple"
                      disabled={true}
                    ></Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('natImplementorTitle')}</label>}
                    name="natImplementor"
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
                      {Object.values(NatImplementor).map((instrument) => (
                        <Option key={instrument} value={instrument}>
                          {instrument}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<number>
                    label={<label className="form-item-header">{t('investmentNeedsTitle')}</label>}
                    name="investment"
                    rules={[validation.required]}
                  >
                    <Input className="form-input-box" type="number" disabled={isView} />
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
              <Row gutter={gutterSize}>
                <Col span={24}>
                  <Form.Item
                    label={
                      <label className="form-item-header">{t('programmeCommentsTitle')}</label>
                    }
                    name="comments"
                    rules={[validation.required]}
                  >
                    <TextArea rows={3} disabled={isView} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <div style={{ color: '#3A3541', opacity: 0.8, margin: '8px 0' }}>
                    {t('projectListTitle')}
                  </div>
                  <LayoutTable
                    tableData={projectData}
                    columns={projTableColumns}
                    loading={false}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      total: projectData.length,
                      showQuickJumper: true,
                      pageSizeOptions: ['10', '20', '30'],
                      showSizeChanger: true,
                      style: { textAlign: 'center' },
                      locale: { page: '' },
                      position: ['bottomRight'],
                    }}
                    handleTableChange={handleTableChange}
                    emptyMessage={t('noProjectsMessage')}
                  />
                </Col>
                <Col
                  span={5}
                  style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}
                >
                  <AttachEntity
                    isDisabled={isView}
                    content={{
                      buttonName: t('attachProjects'),
                      attach: t('attach'),
                      contentTitle: t('attachProjects'),
                      listTitle: t('projectList'),
                      cancel: t('cancel'),
                    }}
                    options={allProjectIds}
                    alreadyAttached={attachedProjectIds}
                    currentAttachments={tempProjectIds}
                    setCurrentAttachments={setTempProjectIds}
                    icon={<Layers style={{ fontSize: '120px' }} />}
                  ></AttachEntity>
                </Col>
              </Row>
            </div>
            <div className="form-section-card">
              <div className="form-section-header">{t('mitigationInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('ghgAffected')}</label>}
                    name="ghgsAffected"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
              </Row>
              <div className="form-section-sub-header">{t('emmissionInfoTitle')}</div>
              <Row gutter={gutterSize}>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('achieved')}</label>}
                    name="achievedReduct"
                  >
                    <Input className="form-input-box" disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<label className="form-item-header">{t('expected')}</label>}
                    name="expectedReduct"
                  >
                    <Input className="form-input-box" disabled />
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
            </div>
            {isView && (
              <div className="form-section-card">
                <div className="form-section-header">{t('updatesInfoTitle')}</div>
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
                      navigate('/programmes');
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
                      navigate('/programmes');
                    }}
                  >
                    {t('back')}
                  </Button>
                </Col>
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
                      navigate('/programmes');
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
      ) : (
        <Spin className="loading-center" size="large" />
      )}
    </div>
  );
};

export default ProgrammeForm;
