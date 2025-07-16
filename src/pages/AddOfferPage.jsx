import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Row,
  Col,
  Typography,
  Modal,
  Divider,
  Spin
} from 'antd';
import {
  PlusOutlined,
  ArrowLeftOutlined,
  TagOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addOffer, fetchVendorMenu, fetchVendorOffers } from '../redux/slices/vendorsSlice';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { TextArea } = Input;

const AddOfferPage = () => {
  const { t, i18n } = useTranslation('addOffer');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { vendorMenu } = useSelector(state => state.vendors);
  const { user } = useSelector(state => state.auth);
  const vendorId = user?.id || localStorage.getItem("userId");
  const direction = i18n.dir();
  const isRTL = direction === "rtl";

  useEffect(() => {
    if (!vendorMenu.items || vendorMenu.items.length === 0) {
      dispatch(fetchVendorMenu({ vendorId }));
    }
  }, [dispatch, vendorId, vendorMenu.items]);

  // Form submission
  const handleFinish = (values) => {
    if (!fileList[0] || !fileList[0].originFileObj) {
      setImageError(t('validation.imageRequired') || 'Image is required');
      message.error(t('validation.imageRequired') || 'Image is required');
      return;
    }
    setImageError('');
    setLoading(true);
    // Pass a plain object, not FormData
    const offerData = {
      ProductId: values.productId,
      Description: values.description,
      DiscountPercentage: values.discountPercentage,
      DiscountCode: values.discountCode || '',
      image: fileList[0].originFileObj
    };
    dispatch(addOffer(offerData)).then((result) => {
      setLoading(false);
      if (!result.error) {
        message.success(t('notifications.addOfferSuccess') || 'Offer added successfully!');
        form.resetFields();
        setFileList([]);
        dispatch(fetchVendorOffers({ PageNumer: 1, PageSize: 10 }));
        navigate('/vendor/offers');
      } else {
        // Enhanced error handling for duplicate offers
        const errorMsg = result.error?.message || result.error;
        if (errorMsg && (errorMsg.toLowerCase().includes('already exists') || errorMsg.toLowerCase().includes('duplicate'))) {
          message.error(t('notifications.duplicateOffer') || 'This offer has already been used before.');
        } else {
          message.error(t('notifications.addOfferFailed') || 'Failed to add offer.');
        }
      }
    });
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(0, 1));
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isImage) {
      message.error(t('validation.imageTypeInvalid') || 'Invalid image type');
      return Upload.LIST_IGNORE;
    }
    if (!isLt2M) {
      message.error(t('validation.imageSizeInvalid') || 'Image must be smaller than 2MB');
      return Upload.LIST_IGNORE;
    }
    return false; // Prevent auto-upload, but add to fileList
  };

  return (
    <div className="p-6 min-h-screen" dir={direction}>
      <div className="flex items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/vendor/menu')}
          type="text"
          style={{ marginRight: isRTL ? 0 : '16px', marginLeft: isRTL ? '16px' : 0 }}
        >
          {t('buttons.backToMenu') || 'Back to Menu'}
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          {t('pageHeader.title') || 'Add Offer'}
        </Title>
      </div>
      <Card
        style={{
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
        className="bg-white"
      >
        <Title level={3} style={{ marginBottom: '24px', color: '#1a1a1a' }}>
          <TagOutlined style={{ color: '#1890ff', marginRight: isRTL ? 0 : '10px', marginLeft: isRTL ? '10px' : 0 }} /> {t('cardHeader.title') || 'Add Offer'}
        </Title>
        <Divider />
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="mt-6"
          >
            <Row gutter={32}>
              <Col xs={24} lg={14}>
                <Form.Item
                  name="productId"
                  label={t('product')}
                  rules={[{ required: true, message: t('productRequired') }]}
                >
                  <Select
                    showSearch
                    placeholder={t('productPlaceholder')}
                    options={(vendorMenu.items || []).map(item => ({ label: item.nameEn, value: item.id }))}
                  />
                </Form.Item>
                <Form.Item
                  name="description"
                  label={t('description')}
                  rules={[{ required: true, message: t('descriptionRequired') }]}
                >
                  <TextArea rows={3} />
                </Form.Item>
                <Form.Item
                  name="discountPercentage"
                  label={t('discountPercentage')}
                  rules={[{ required: true, message: t('discountRequired') }]}
                >
                  <InputNumber min={1} max={100} addonAfter="%" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item
                  name="discountCode"
                  label={t('discountCode')}
                >
                  <Input />
                </Form.Item>

                {/* Upload before the submit button */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontWeight: 500 }}>{t('image')}</label>
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={info => {
                      handleChange(info);
                      if (info.fileList.length > 0) setImageError('');
                    }}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                    accept="image/*"
                  >
                    {fileList.length >= 1 ? null : (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>{t('upload.button')}</div>
                      </div>
                    )}
                  </Upload>
                  <Modal open={previewVisible} title={previewTitle} footer={null} onCancel={() => setPreviewVisible(false)}>
                    <img alt="preview" style={{ width: '100%' }} src={previewImage} />
                  </Modal>
                  {imageError && <div style={{ color: 'red', marginTop: 8 }}>{imageError}</div>}
                </div>

                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    {t('submit')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default AddOfferPage; 