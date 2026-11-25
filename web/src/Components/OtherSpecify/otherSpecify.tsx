import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { isOtherSelected, OTHER_TEXT_MAX_LENGTH } from '../../Utils/otherSpecify';

const { TextArea } = Input;

interface OtherSpecifyProps {
  /** Name of the form field that holds the list value (or values). */
  valueName: string;
  /** Name of the form field that holds the text. */
  textName: string;
  isView?: boolean;
  /** The saved text, for forms that fill their fields through `initialValue` instead of `setFieldsValue`. */
  initialValue?: string;
}

/**
 * The text box that appears under a list field while its "Other" / "Others" value is selected.
 * The text is required, up to 250 characters, and read-only on the view pages.
 */
const OtherSpecify = ({ valueName, textName, isView = false, initialValue }: OtherSpecifyProps) => {
  const { t } = useTranslation(['common']);

  return (
    <Form.Item
      noStyle
      shouldUpdate={(previous, current) => previous[valueName] !== current[valueName]}
    >
      {({ getFieldValue }) =>
        isOtherSelected(getFieldValue(valueName)) ? (
          <Form.Item
            label={<label className="form-item-header">{t('common:otherSpecify')}</label>}
            name={textName}
            initialValue={initialValue}
            rules={[
              {
                required: !isView,
                whitespace: true,
                message: `${t('common:otherSpecifyRequired')}`,
              },
            ]}
          >
            <TextArea maxLength={OTHER_TEXT_MAX_LENGTH} rows={2} showCount disabled={isView} />
          </Form.Item>
        ) : null
      }
    </Form.Item>
  );
};

export default OtherSpecify;
