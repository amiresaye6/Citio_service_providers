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

const { Title } = Typography;
const { TextArea } = Input;

const VendorMenuItemAddPage = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux store - changed state.product to state.products
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
      message.success('Menu item added successfully!');
      form.resetFields();
      setFileList([]);
      navigate('/vendor/menu');
    }
  }, [product, navigate, form]);

  // Show error message if creation fails
  useEffect(() => {
    if (error) {
      message.error(error.detail || 'Failed to add menu item. Please try again.');
    }
  }, [error]);

  // Form submission
  const handleFinish = (values) => {
    if (fileList.length === 0) {
      message.error('Please upload an image');
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

  // Rest of the component remains the same...
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
      <div className="mt-2">Upload</div>
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
      message.error('You can only upload image files!');
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }

    return isImage && isLt2M;
  };

  // Check if we're loading
  const isLoading = loading || subcategoriesLoading;

  return (
    <div className="p-6 min-h-screen ">
      <div className="flex items-center mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/vendor/menu')}
          type="text"
          style={{ marginRight: '16px' }}
        >
          Back to Menu
        </Button>
        <Title level={2} style={{ margin: 0 }}>Menu Management</Title>
      </div>

      <Card
        style={{
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
        }}
        className="bg-white"
      >
        <Title level={3} style={{ marginBottom: '24px', color: '#1a1a1a' }}>
          <PlusOutlined style={{ color: '#1890ff', marginRight: '10px' }} /> Add New Menu Item
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
            {/* Form content remains the same... */}
            <Row gutter={32}>
              <Col xs={24} lg={14}>
                {/* Form fields remain the same... */}
                <div className=" p-6 rounded-lg mb-6">
                  <Title level={4} className="mb-4">Basic Information</Title>

                  {/* English Fields */}
                  <div className="mb-4 border-l-4 border-blue-400 pl-4">
                    <Title level={5} className="mb-2 flex items-center">
                      <TranslationOutlined className="mr-2" /> English Information
                    </Title>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="nameEn"
                          label="Name (English)"
                          rules={[{ required: true, message: 'Please enter English name' }]}
                        >
                          <Input placeholder="e.g. Cheeseburger" />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item
                          name="descriptionEn"
                          label="Description (English)"
                          rules={[{ required: true, message: 'Please enter English description' }]}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Describe your menu item..."
                            showCount
                            maxLength={200}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* Arabic Fields */}
                  <div className="mb-4 border-l-4 border-green-400 pl-4">
                    <Title level={5} className="mb-2 flex items-center">
                      <TranslationOutlined className="mr-2" /> Arabic Information
                    </Title>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          name="nameAr"
                          label="Name (Arabic)"
                          rules={[{ required: true, message: 'Please enter Arabic name' }]}
                        >
                          <Input placeholder="e.g. تشيز برجر" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>

                  {/* Price and Category */}
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <Title level={5} className="mb-2 flex items-center">
                      <DollarOutlined className="mr-2" /> Price & Category
                    </Title>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="price"
                          label="Price"
                          rules={[{ required: true, message: 'Please enter price' }]}
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
                          label="Subcategory"
                          rules={[{ required: true, message: 'Please select a subcategory' }]}
                        >
                          <Select
                            placeholder="Select a subcategory"
                            loading={subcategoriesLoading}
                            options={providerSubcategories?.map((s) => ({
                              value: s.id,
                              label: `${s.nameEn} (${s.nameAr})`,
                            }))}
                            showSearch
                            optionFilterProp="label"
                          />
                        </Form.Item>
                        {providerSubcategories.length === 0 && !subcategoriesLoading && (
                          <div className="text-xs text-red-500 mt-1">
                            No subcategories available for your account. Please contact support.
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
                    Add Menu Item
                  </Button>
                  <Button
                    style={{ marginLeft: '12px' }}
                    onClick={() => navigate('/vendor/menu')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </Form.Item>
              </Col>

              <Col xs={24} lg={10}>
                <div className=" p-6 rounded-lg h-full">
                  <Title level={4} className="flex items-center mb-4">
                    <PictureOutlined className="mr-2" /> Product Image
                    <Tooltip title="Upload an image for your product.">
                      <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 16 }} />
                    </Tooltip>
                  </Title>

                  <Form.Item
                    required
                    tooltip="Image is required"
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
                      <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
                    </Modal>
                  </Form.Item>

                  {fileList.length === 0 ? (
                    <Alert
                      message="Product Image Required"
                      description="Please upload an image for your product."
                      type="warning"
                      showIcon
                    />
                  ) : null}

                  <Alert
                    message="Information"
                    description="This version only supports uploading one image per product."
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