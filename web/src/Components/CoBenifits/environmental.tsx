import { Form, Radio } from 'antd';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RadioButtonStatus } from '../../Definitions/commonEnums';

const Environmental = (props: any) => {
  const { onFormSubmit, environmentalViewData } = props;
  const { t } = useTranslation(['environment']);
  const environmentalDetailsInitial: any[] = [
    {
      section: t('air'),
      fields: [
        {
          name: 'airQ1',
          label: t('airQ1'),
          hide: false,
          required: true,
        },
        {
          name: 'airQ2',
          label: t('airQ2'),
          hide: true,
          required: true,
        },
        {
          name: 'airQ3',
          label: t('airQ3'),
          hide: true,
          required: true,
        },
        {
          name: 'airQ4',
          label: t('airQ4'),
          hide: true,
          required: true,
        },
        {
          name: 'airQ5',
          label: t('airQ5'),
          hide: true,
          required: true,
        },
        {
          name: 'airQ6',
          label: t('airQ6'),
          hide: true,
          required: true,
        },
        {
          name: 'airQ7',
          label: t('airQ7'),
          hide: true,
          required: true,
        },
        {
          name: 'airQ8',
          label: t('airQ8'),
          hide: true,
          required: true,
        },
        {
          name: 'airQ9',
          label: t('airQ9'),
          hide: true,
          required: true,
        },
      ],
    },
    {
      section: t('land'),
      fields: [
        {
          name: 'landQ1',
          label: t('landQ1'),
          hide: false,
          required: true,
        },
        {
          name: 'landQ2',
          label: t('landQ2'),
          hide: true,
          required: true,
        },
        {
          name: 'landQ3',
          label: t('landQ3'),
          hide: true,
          required: true,
        },
        {
          name: 'landQ4',
          label: t('landQ4'),
          hide: true,
          required: true,
        },
        {
          name: 'landQ5',
          label: t('landQ5'),
          hide: true,
          required: true,
        },
        {
          name: 'landQ6',
          label: t('landQ6'),
          hide: true,
          required: true,
        },
        {
          name: 'landQ7',
          label: t('landQ7'),
          hide: true,
          required: true,
        },
        {
          name: 'landQ8',
          label: t('landQ8'),
          hide: true,
          required: true,
        },
      ],
    },
    {
      section: t('water'),
      fields: [
        {
          name: 'waterQ1',
          label: t('waterQ1'),
          hide: false,
          required: true,
        },
        {
          name: 'waterQ2',
          label: t('waterQ2'),
          hide: true,
          required: true,
        },
        {
          name: 'waterQ3',
          label: t('waterQ3'),
          hide: true,
          required: true,
        },
        {
          name: 'waterQ4',
          label: t('waterQ4'),
          hide: true,
          required: true,
        },
        {
          name: 'waterQ5',
          label: t('waterQ5'),
          hide: true,
          required: true,
        },
        {
          name: 'waterQ6',
          label: t('waterQ6'),
          hide: true,
          required: true,
        },
        {
          name: 'waterQ7',
          label: t('waterQ7'),
          hide: true,
          required: true,
        },
      ],
    },
    {
      section: t('naturalResource'),
      fields: [
        {
          name: 'naturalResourceQ1',
          label: t('naturalResourceQ1'),
          hide: false,
          required: true,
        },
        {
          name: 'naturalResourceQ2',
          label: t('naturalResourceQ2'),
          hide: true,
          required: true,
        },
        {
          name: 'naturalResourceQ3',
          label: t('naturalResourceQ3'),
          hide: true,
          required: true,
        },
        {
          name: 'naturalResourceQ4',
          label: t('naturalResourceQ4'),
          hide: true,
          required: true,
        },
        {
          name: 'naturalResourceQ5',
          label: t('naturalResourceQ5'),
          hide: true,
          required: true,
        },
        {
          name: 'naturalResourceQ6',
          label: t('naturalResourceQ6'),
          hide: true,
          required: true,
        },
      ],
    },
  ];
  const [formOne] = Form.useForm();
  const [environmentalDetails, setEnvironmentalDetails] = useState<any[]>(
    environmentalDetailsInitial
  );
  const [environmentalFormDetails, setEnvironmentalFormDetails] = useState<any>();
  const onFieldsChange = (changedFields: any) => {
    const changedFieldName = changedFields[0]?.name[0];
    const changedFieldValue = changedFields[0]?.value;
    if (changedFieldName.includes('1')) {
      const sectionName = changedFieldName.replace(/\d/g, '').replace('Q', '');
      const updatedEnvironmentalDetails = [...environmentalDetails];
      const sectionIndex = updatedEnvironmentalDetails.findIndex(
        (section) => section.section === t(sectionName)
      );

      updatedEnvironmentalDetails[sectionIndex].fields.forEach((field: any) => {
        if (field.name !== changedFieldName) {
          field.hide = changedFieldValue !== RadioButtonStatus.YES;
        }
      });

      setEnvironmentalDetails(updatedEnvironmentalDetails);
    }
  };

  useEffect(() => {
    onFormSubmit(environmentalFormDetails);
  }, [environmentalFormDetails]);

  const onEnvironmentalValuesChanged = (changedValues: any) => {
    setEnvironmentalFormDetails((pre: any) => ({ ...pre, ...changedValues }));
  };

  useEffect(() => {
    console.log('data view---------> ');
    console.log(environmentalViewData);
  }, []);

  return (
    <div className="co-benifits-tab-item">
      <Form
        name="environmental-details"
        className="benifits-details-environmental"
        labelCol={{ md: 16, lg: 19, xl: 19 }}
        wrapperCol={{ md: 8, lg: 5, xl: 5 }}
        layout="horizontal"
        requiredMark={true}
        form={formOne}
        onFieldsChange={onFieldsChange}
        onValuesChange={onEnvironmentalValuesChanged}
      >
        <div className="section">
          {environmentalDetails?.map((environmentalDetail: any) => (
            <>
              <div className="title">{environmentalDetail?.section}</div>
              {environmentalDetail?.fields?.map(
                (field: any) =>
                  !field?.hide && (
                    <Form.Item
                      label={field?.label}
                      className="form-item"
                      name={field?.name}
                      rules={[
                        {
                          required: field?.required,
                          message: field?.required && `${t(field?.name)} ${t('isRequired')}`,
                        },
                      ]}
                    >
                      <Radio.Group size="middle" onChange={() => {}}>
                        <div className="yes-no-radio-container">
                          <Radio.Button className="yes-no-radio" value={RadioButtonStatus.YES}>
                            {t('yes')}
                          </Radio.Button>
                        </div>
                        <div className="yes-no-radio-container">
                          <Radio.Button className="yes-no-radio" value={RadioButtonStatus.NO}>
                            {t('no')}
                          </Radio.Button>
                        </div>
                        <div className="yes-no-radio-container">
                          <Radio.Button className="yes-no-radio" value={RadioButtonStatus.NA}>
                            {t('na')}
                          </Radio.Button>
                        </div>
                      </Radio.Group>
                    </Form.Item>
                  )
              )}
            </>
          ))}
        </div>
      </Form>
    </div>
  );
};

export default Environmental;
