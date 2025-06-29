import React, { useState, useEffect } from 'react';
import {
  Card, Descriptions, Tag, Button, Form, Input, InputNumber,
  Select, Upload, Row, Col, Divider, message, Spin, Typography,
  Image, Space, Breadcrumb, Alert, Empty, Modal
} from 'antd';
import {
  EditOutlined, SaveOutlined, CloseOutlined, UploadOutlined,
  ArrowLeftOutlined, ShopOutlined,
  DollarOutlined, TagOutlined, LoadingOutlined, EyeOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductById,
  updateProduct,
  clearCurrentProduct,
  clearProductError,
  fetchProviderSubcategories,
  clearProviderSubcategories
} from '../redux/slices/productsSlice';

const { Title, Text } = Typography;

const VendorMenuItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data from Redux store
  const product = useSelector(state => state.products.currentProduct);
  const productLoading = useSelector(state => state.products.productLoading);
  const productError = useSelector(state => state.products.productError);
  const updateLoading = useSelector(state => state.products.productUpdateLoading);
  const updateError = useSelector(state => state.products.productUpdateError);
  const subcategories = useSelector(state => state.products.providerSubcategories);
  const subcategoriesLoading = useSelector(state => state.products.providerSubcategoriesLoading);

  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  // Fetch product and subcategories when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(parseInt(id)));
      dispatch(fetchProviderSubcategories());
    }

    // Clean up when component unmounts
    return () => {
      dispatch(clearCurrentProduct());
      dispatch(clearProviderSubcategories());
      dispatch(clearProductError());
    };
  }, [dispatch, id]);

  // Set form values when product data is loaded or edit mode is toggled
  useEffect(() => {
    if (product && editMode) {
      form.setFieldsValue({
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        description: product.description,
        price: product.price,
        subCategoryId: product.subCategoryId,
      });
    }
  }, [product, editMode, form]);

  // Show error messages if any
  useEffect(() => {
    if (productError) {
      message.error(`Failed to load product: ${productError.detail || 'Unknown error'}`);
    }
    if (updateError) {
      message.error(`Failed to update product: ${updateError.detail || 'Unknown error'}`);
    }
  }, [productError, updateError]);

  // Handle image preview
  const handlePreview = () => {
    const imageUrl = getImageUrl();
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  // Handle image upload for product main image
  const handleImageUpload = (info) => {
    if (info.file) {
      // Get a preview URL
      const file = info.file;
      file.preview = URL.createObjectURL(file);
      setImageFile(file);
      
      // Show preview automatically after selecting
      setPreviewImage(file.preview);
      setPreviewVisible(true);
    }
    return false; // Prevent automatic upload
  };

  // Toggle edit mode
  const handleEdit = () => setEditMode(true);

  // Cancel edit mode
  const handleCancel = () => {
    setEditMode(false);
    setImageFile(null);
    form.resetFields();
  };

  // Save product changes
  const handleSave = (values) => {
    const updateData = {
      ...values
    };
    
    if (imageFile) {
      updateData.image = imageFile;
    }
    
    dispatch(updateProduct({ 
      productId: product.id, 
      productData: updateData 
    })).then((result) => {
      if (!result.error) {
        message.success('Menu item updated successfully!');
        setEditMode(false);
        setImageFile(null);
        handleBack()
      }
    });
  };

  // Navigate back to menu list
  const handleBack = () => {
    navigate('/vendor/menu');
  };

  // Get image URL for display
  const getImageUrl = () => {
    if (imageFile) {
      return imageFile.preview;
    } else if (product?.mainImageUrl) {
      // Handle properly formatted URL
      return product.mainImageUrl.startsWith('http')
        ? product.mainImageUrl
        : `https://service-provider.runasp.net${product.mainImageUrl}`;
    }
    return '';
  };

  const isLoading = productLoading || updateLoading;

  // Render loading state
  if (productLoading && !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading product details..." />
      </div>
    );
  }

  // Render error state
  if (productError && !product) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert
          message="Error Loading Product"
          description={productError.detail || "Failed to load product details. Please try again."}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => dispatch(fetchProductById(parseInt(id)))}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  // Render empty state
  if (!product) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Empty description="No product found" />
      </div>
    );
  }

  // Main component render
  return (
    <div className="p-6 min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <a onClick={handleBack}>
            <ShopOutlined /> Menu Items
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{product.nameEn}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            type="text"
            style={{ marginRight: 16 }}
          />
          <Title level={2} style={{ margin: 0 }}>
            Product Details
          </Title>
        </div>
        <Space>
          {editMode ? (
            <>
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                icon={updateLoading ? <LoadingOutlined /> : <SaveOutlined />}
                type="primary"
                onClick={() => form.submit()}
                loading={updateLoading}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={handleEdit}
            >
              Edit Item
            </Button>
          )}
        </Space>
      </div>

      <Spin spinning={isLoading}>
        <Row gutter={24}>
          {/* Left column with product image */}
          <Col xs={24} md={10}>
            <Card className="mb-6" style={{ padding: 0 }}>
              <div className="relative">
                <Image
                  src={getImageUrl()}
                  alt={product.nameEn}
                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                />
                {editMode && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={() => false}
                      onChange={handleImageUpload}
                    >
                      <Button icon={<UploadOutlined />}  className="bg-white">
                        Change Image
                      </Button>
                    </Upload>
                  </div>
                )}
                {!editMode && (
                  <div className="absolute bottom-0 right-0 p-2">
                    <Button
                      icon={<EyeOutlined />}
                      shape="circle"
                      onClick={handlePreview}
                    />
                  </div>
                )}
              </div>
            </Card>

            {/* Additional info in card */}
            <Card className="mb-6">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="ID">#{product.id}</Descriptions.Item>
                {product.vendorBusinessName && (
                  <Descriptions.Item label="Vendor">
                    {product.vendorBusinessName}
                  </Descriptions.Item>
                )}
                {product.vendorFullName && (
                  <Descriptions.Item label="Vendor Full Name">
                    {product.vendorFullName}
                  </Descriptions.Item>
                )}
                {product.rating !== undefined && (
                  <Descriptions.Item label="Rating">
                    {product.rating} / 5
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          </Col>

          {/* Right column with product details */}
          <Col xs={24} md={14}>
            <Card className="mb-6">
              {editMode ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSave}
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <Title level={4}>Product Information</Title>
                      <Divider />
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="nameEn"
                        label="Name (English)"
                        rules={[{ required: true, message: 'Please enter English name' }]}
                      >
                        <Input placeholder="e.g. Beef Burger" />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="nameAr"
                        label="Name (Arabic)"
                        rules={[{ required: true, message: 'Please enter Arabic name' }]}
                      >
                        <Input placeholder="e.g. برجر لحم" />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Describe your product..."
                          showCount
                          maxLength={500}
                        />
                      </Form.Item>
                    </Col>

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
                          options={subcategories?.map((s) => ({
                            value: s.id,
                            label: `${s.nameEn} (${s.nameAr})`,
                          }))}
                          showSearch
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Title level={3} className="mb-1">{product.nameEn}</Title>
                      <Text type="secondary" className="block text-lg">{product.nameAr}</Text>
                    </div>
                    <div className="border border-blue-100 rounded-lg p-3">
                      <Title level={3} className="m-0">
                        <DollarOutlined className="mr-1" />
                        ${Number(product.price).toFixed(2)}
                      </Title>
                    </div>
                  </div>

                  <Divider />
                  
                  <div className="mb-6">
                    <Title level={5} className="flex items-center">
                      <TagOutlined className="mr-2" /> Category
                    </Title>
                    <Tag color="blue" className="text-base py-1 px-3">
                      {subcategories?.find(s => s.id === product.subCategoryId)?.nameEn || 'Loading...'}
                    </Tag>
                  </div>

                  <div>
                    <Title level={5}>Description</Title>
                    <Text className="block whitespace-pre-wrap">{product.description}</Text>
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>

        {/* Image preview modal */}
        <Modal
          open={previewVisible}
          title="Image Preview"
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img
            alt="Preview"
            style={{ width: '100%' }}
            src={previewImage}
          />
        </Modal>
      </Spin>
    </div>
  );
};

export default VendorMenuItemPage;