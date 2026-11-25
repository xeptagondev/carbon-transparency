import { useCallback, useEffect, useState } from 'react';
import { Button, Collapse, Form, Input, message, Modal, Space, Table, Tag } from 'antd';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useConnection } from '../../Context/ConnectionContext/connectionContext';
import { useUserContext } from '../../Context/UserInformationContext/userInformationContext';
import { displayErrorMessage } from '../../Utils/errorMessageHandler';
import { Role } from '../../Enums/role.enum';
import './nationalConfigurations.scss';

const { Panel } = Collapse;

type EditLevel = 'FULL_EDIT' | 'ADD_ONLY';

interface ReferenceValue {
  id: number;
  code: string;
  label: string;
  isActive: boolean;
}

interface ReferenceList {
  listKey: string;
  editLevel: EditLevel;
  values: ReferenceValue[];
}

// Same toast placement as the rest of the app: top right corner.
const showMessage = (type: 'success' | 'error', content: string) =>
  message.open({
    type,
    content,
    duration: 3,
    style: { textAlign: 'right', marginRight: 15, marginTop: 10 },
  });

interface AddValueFormProps {
  onAdd: (label: string) => Promise<boolean>;
  placeholder: string;
  addLabel: string;
  requiredMessage: string;
}

const AddValueForm = ({ onAdd, placeholder, addLabel, requiredMessage }: AddValueFormProps) => {
  const [form] = Form.useForm();

  const submit = async (values: { label: string }) => {
    const added = await onAdd(values.label);
    if (added) form.resetFields();
  };

  return (
    <Form form={form} layout="inline" onFinish={submit} className="add-value-form">
      <Form.Item
        name="label"
        rules={[{ required: true, whitespace: true, message: requiredMessage }]}
      >
        <Input placeholder={placeholder} maxLength={500} style={{ width: 360 }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          {addLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};

const NationalConfigurations = () => {
  const { t } = useTranslation(['nationalConfiguration']);
  const { get, post } = useConnection();
  const { userInfoState } = useUserContext();

  const [lists, setLists] = useState<ReferenceList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [renaming, setRenaming] = useState<ReferenceValue>();
  const [renameForm] = Form.useForm();

  const isAllowed = userInfoState?.userRole === Role.Root || userInfoState?.userRole === Role.Admin;

  const loadLists = useCallback(async () => {
    try {
      const response: any = await get('national/reference-data/lists');
      setLists(response.data);
    } catch (error: any) {
      showMessage('error', t('nationalConfiguration:loadError') as string);
    } finally {
      setLoading(false);
    }
  }, [get, t]);

  useEffect(() => {
    if (isAllowed) {
      loadLists();
    }
  }, [isAllowed, loadLists]);

  // Government users and Observers cannot open this page, even by typing its address.
  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  const addValue = async (listKey: string, label: string) => {
    try {
      await post('national/reference-data/add', { listKey, label });
      showMessage('success', t('nationalConfiguration:addSuccess') as string);
      await loadLists();
      return true;
    } catch (error: any) {
      displayErrorMessage(error);
      return false;
    }
  };

  const renameValue = async (values: { label: string }) => {
    if (!renaming) return;
    try {
      await post('national/reference-data/rename', { id: renaming.id, label: values.label });
      showMessage('success', t('nationalConfiguration:renameSuccess') as string);
      setRenaming(undefined);
      await loadLists();
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const setStatus = async (value: ReferenceValue) => {
    try {
      await post('national/reference-data/status', { id: value.id, isActive: !value.isActive });
      showMessage('success', t('nationalConfiguration:statusSuccess') as string);
      await loadLists();
    } catch (error: any) {
      displayErrorMessage(error);
    }
  };

  const columnsFor = (list: ReferenceList) => [
    {
      title: t('nationalConfiguration:value'),
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: t('nationalConfiguration:status'),
      dataIndex: 'isActive',
      key: 'isActive',
      width: 140,
      render: (isActive: boolean) =>
        isActive ? (
          <Tag color="green">{t('nationalConfiguration:active')}</Tag>
        ) : (
          <Tag>{t('nationalConfiguration:disabled')}</Tag>
        ),
    },
    ...(list.editLevel === 'FULL_EDIT'
      ? [
          {
            title: t('nationalConfiguration:actions'),
            key: 'actions',
            width: 220,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            render: (_: any, value: ReferenceValue) => (
              <Space>
                <Button
                  type="link"
                  onClick={() => {
                    setRenaming(value);
                    renameForm.setFieldsValue({ label: value.label });
                  }}
                >
                  {t('nationalConfiguration:rename')}
                </Button>
                <Button type="link" onClick={() => setStatus(value)}>
                  {value.isActive
                    ? t('nationalConfiguration:disable')
                    : t('nationalConfiguration:enable')}
                </Button>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="content-container national-configurations">
      <div className="title-bar">
        <div className="body-title">{t('nationalConfiguration:title')}</div>
      </div>
      <div className="national-configurations-description">
        {t('nationalConfiguration:description')}
      </div>

      <Collapse accordion bordered={false} className="national-configurations-collapse">
        {lists.map((list) => (
          <Panel
            key={list.listKey}
            header={
              <div className="national-configurations-panel-header">
                <span className="list-name">
                  {t(`nationalConfiguration:lists.${list.listKey}`)}
                </span>
                <span className="list-meta">
                  {t('nationalConfiguration:valueCount', { count: list.values.length })}
                </span>
                <Tag color={list.editLevel === 'FULL_EDIT' ? 'blue' : 'orange'}>
                  {list.editLevel === 'FULL_EDIT'
                    ? t('nationalConfiguration:fullEdit')
                    : t('nationalConfiguration:addOnly')}
                </Tag>
              </div>
            }
          >
            {list.editLevel === 'ADD_ONLY' && (
              <div className="add-only-hint">{t('nationalConfiguration:addOnlyHint')}</div>
            )}
            <AddValueForm
              onAdd={(label) => addValue(list.listKey, label)}
              placeholder={t('nationalConfiguration:addPlaceholder')}
              addLabel={t('nationalConfiguration:add')}
              requiredMessage={t('nationalConfiguration:valueRequired')}
            />
            <Table
              size="small"
              rowKey="id"
              loading={loading}
              dataSource={list.values}
              columns={columnsFor(list)}
              pagination={list.values.length > 10 ? { pageSize: 10 } : false}
              locale={{ emptyText: t('nationalConfiguration:noValues') as string }}
              rowClassName={(value) => (value.isActive ? '' : 'disabled-row')}
            />
          </Panel>
        ))}
      </Collapse>

      <Modal
        title={t('nationalConfiguration:renameTitle')}
        open={!!renaming}
        onCancel={() => setRenaming(undefined)}
        onOk={() => renameForm.submit()}
        okText={t('nationalConfiguration:save')}
        cancelText={t('nationalConfiguration:cancel')}
        destroyOnClose
      >
        <Form form={renameForm} layout="vertical" onFinish={renameValue}>
          <Form.Item
            name="label"
            rules={[
              {
                required: true,
                whitespace: true,
                message: t('nationalConfiguration:valueRequired') as string,
              },
            ]}
          >
            <Input maxLength={500} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NationalConfigurations;
