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
  Tooltip,
  Modal,
  Divider,
  Alert,
  Spin
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  TranslationOutlined,
  PictureOutlined,
  TagOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearProductCreationError, clearProviderSubcategories, createProduct, fetchProviderSubcategories } from '../redux/slices/productsSlice';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;
const { TextArea } = Input;

const VendorMenuItemAddPage = () => {
  const { t, i18n } = useTranslation('menuItemAdd');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const direction = i18n.dir();
  const isRTL = direction === "rtl";

  // Get data from Redux store
  const providerSubcategories = useSelector(state => state.products.providerSubcategories);
  const subcategoriesLoading = useSelector(state => state.products.providerSubcategoriesLoading);
  const loading = useSelector(state => state.products.productCreationLoading);
  const error = useSelector(state => state.products.productCreationError);
  const product = useSelector(state => state.products.product);

  // Fetch provider's allowed subcategories on component mount
  useEffect(() => {
    dispatch(fetchProviderSubcategories());

    // Clean up when component unmounts
    return () => {
      dispatch(clearProviderSubcategories());
    };
  }, [dispatch]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearProductCreationError());
    };
  }, [dispatch]);

  // Navigate to menu page after successful product creation
  useEffect(() => {
    if (product) {
      message.success(t('notifications.addSuccess'));
      form.resetFields();
      setFileList([]);
      navigate('/vendor/menu');
    }
  }, [product, navigate, form, t]);

  // Show error message if creation fails
  useEffect(() => {
    if (error) {
      message.error(error.detail || t('errors.addFailed'));
    }
  }, [error, t]);

  // Form submission
  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error(t('validation.imageRequired'));
      return;
    }

    // Prepare form data according to API requirements
    const productData = {
      nameEn: values.nameEn,
      nameAr: values.nameAr,
      description: values.descriptionEn, // Using English description as API only has one description field
      price: values.price,
      subCategoryId: values.subCategoryId,
      image: fileList[0].originFileObj // API only accepts one image
    };

    console.log(productData);

    dispatch(createProduct(productData));
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
    // Limit to 1 file since API only accepts one image
    setFileList(newFileList.slice(0, 1));
  };

  const uploadButton = (
    <div className="flex flex-col items-center justify-center p-6 h-full">
      <PlusOutlined className="text-2xl mb-2" />
      <div className="mt-2">{t('upload.button')}</div>
    </div>
  );

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Check file type and size before upload
  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error(t('validation.imageTypeInvalid'));
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error(t('validation.imageSizeInvalid'));
    }

    return isImage && isLt2M;
  };

  // Check if we're loading
  const isLoading = loading || subcategoriesLoading;

  return (
    <div className="p-6 min-h-screen" dir={direction}>
      <div className="flex items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/vendor/menu')}
          type="text"
          style={{ marginRight: isRTL ? 0 : '16px', marginLeft: isRTL ? '16px' : 0 }}
        >
          {t('buttons.backToMenu')}
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          {t('pageHeader.title')}
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
          <PlusOutlined style={{ color: '#1890ff', marginRight: isRTL ? 0 : '10px', marginLeft: isRTL ? '10px' : 0 }} /> {t('cardHeader.title')}
        </Title>

        <Divider />

        <Spin spinning={isLoading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              price: 0,
            }}
            className="mt-6"
          >
            <Row gutter={32}>
              <Col xs={24} lg={14}>
                <div className="p-6 rounded-lg mb-6">
                  <Title level={4} className="mb-4">{t('form.basicInfo')}</Title>

                  {/* English Fields */}
                  <div className={`mb-4 ${isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4'} border-blue-400`}>
                    <Title level={5} className="mb-2 flex items-center">
                      <TranslationOutlined className={isRTL ? "ml-2" : "mr-2"} /> {t('form.englishInfo')}
                    </Title>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="nameEn"
                          label={t('form.nameEn')}
                          rules={[{ required: true, message: t('validation.nameEnRequired') }]}
                        >
                          <Input placeholder={t('placeholders.nameEn')} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="descriptionEn"
                          label={t('form.descriptionEn')}
                          rules={[{ required: true, message: t('validation.descriptionEnRequired') }]}
                        >
                          <TextArea
                            rows={3}
                            placeholder={t('placeholders.descriptionEn')}
                            showCount
                            maxLength={200}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* Arabic Fields */}
                  <div className={`mb-4 ${isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4'} border-green-400`}>
                    <Title level={5} className="mb-2 flex items-center">
                      <TranslationOutlined className={isRTL ? "ml-2" : "mr-2"} /> {t('form.arabicInfo')}
                    </Title>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="nameAr"
                          label={t('form.nameAr')}
                          rules={[{ required: true, message: t('validation.nameArRequired') }]}
                        >
                          <Input placeholder={t('placeholders.nameAr')} />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* Price and Category */}
                  <div className={`${isRTL ? 'border-r-4 pr-4' : 'border-l-4 pl-4'} border-yellow-400`}>
                    <Title level={5} className="mb-2 flex items-center">
                      <DollarOutlined className={isRTL ? "ml-2" : "mr-2"} /> {t('form.priceCategory')}
                    </Title>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="price"
                          label={t('form.price')}
                          rules={[{ required: true, message: t('validation.priceRequired') }]}
                        >
                          <InputNumber
                            min={0}
                            step={0.01}
                            style={{ width: '100%' }}
                            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="subCategoryId"
                          label={t('form.subcategory')}
                          rules={[{ required: true, message: t('validation.subcategoryRequired') }]}
                        >
                          <Select
                            placeholder={t('placeholders.subcategory')}
                            loading={subcategoriesLoading}
                            options={providerSubcategories?.map((s) => ({
                              value: s.id,
                              label: isRTL ? `${s.nameAr} (${s.nameEn})` : `${s.nameEn} (${s.nameAr})`,
                            }))}
                            showSearch
                            optionFilterProp="label"
                          />
                        </Form.Item>
                        {providerSubcategories.length === 0 && !subcategoriesLoading && (
                          <div className="text-xs text-red-500 mt-1">
                            {t('errors.noSubcategories')}
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                </div>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<PlusOutlined />}
                    size="large"
                    disabled={fileList.length === 0 || isLoading || providerSubcategories.length === 0}
                  >
                    {t('buttons.addMenuItem')}
                  </Button>
                  <Button
                    style={{ marginLeft: isRTL ? 0 : '12px', marginRight: isRTL ? '12px' : 0 }}
                    onClick={() => navigate('/vendor/menu')}
                    disabled={isLoading}
                  >
                    {t('buttons.cancel')}
                  </Button>
                </Form.Item>
              </Col>

              <Col xs={24} lg={10}>
                <div className="p-6 rounded-lg h-full">
                  <Title level={4} className="flex items-center mb-4">
                    <PictureOutlined className={isRTL ? "ml-2" : "mr-2"} /> {t('upload.title')}
                    <Tooltip title={t('upload.tooltip')}>
                      <InfoCircleOutlined style={{ marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0, fontSize: 16 }} />
                    </Tooltip>
                  </Title>

                  <Form.Item
                    required
                    tooltip={t('upload.requiredTooltip')}
                  >
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onPreview={handlePreview}
                      onChange={handleChange}
                      beforeUpload={beforeUpload}
                      accept="image/*"
                    >
                      {fileList.length >= 1 ? null : uploadButton}
                    </Upload>

                    <Modal
                      visible={previewVisible}
                      title={previewTitle}
                      footer={null}
                      onCancel={() => setPreviewVisible(false)}
                    >
                      <img alt={t('upload.preview')} style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                  </Form.Item>

                  {fileList.length === 0 ? (
                    <Alert
                      message={t('upload.requiredTitle')}
                      description={t('upload.requiredDescription')}
                      type="warning"
                      showIcon
                    />
                  ) : null}

                  <Alert
                    message={t('upload.infoTitle')}
                    description={t('upload.infoDescription')}
                    type="info"
                    showIcon
                    style={{ marginTop: '16px' }}
                  />
                </div>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default VendorMenuItemAddPage;