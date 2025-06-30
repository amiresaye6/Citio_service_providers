import React, { useState, useEffect } from 'react';
import {
  Card, Descriptions, Tag, Button, Form, Input, InputNumber,
  Select, Upload, Row, Col, Divider, message, Spin, Typography,
  Image, Space, Breadcrumb, Alert, Empty, Modal, Tabs, List,
  Avatar, Rate, Pagination
} from 'antd';
import { Comment } from '@ant-design/compatible';
import {
  EditOutlined, SaveOutlined, CloseOutlined, UploadOutlined,
  ArrowLeftOutlined, ShopOutlined, DollarOutlined, TagOutlined,
  LoadingOutlined, EyeOutlined, MessageOutlined, StarOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProductById,
  updateProduct,
  clearCurrentProduct,
  clearProductError,
  fetchProviderSubcategories,
  clearProviderSubcategories,
  fetchProductReviews,
  clearProductReviews
} from '../redux/slices/productsSlice';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const VendorMenuItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Current user and datetime
  const currentUser = 'amiresaye6';
  const currentDateTime = '2025-06-30 17:47:56';

  // Get data from Redux store
  const product = useSelector(state => state.products.currentProduct);
  const productLoading = useSelector(state => state.products.productLoading);
  const productError = useSelector(state => state.products.productError);
  const updateLoading = useSelector(state => state.products.productUpdateLoading);
  const updateError = useSelector(state => state.products.productUpdateError);
  const subcategories = useSelector(state => state.products.providerSubcategories);
  const subcategoriesLoading = useSelector(state => state.products.providerSubcategoriesLoading);

  // Reviews data
  const productReviews = useSelector(state => state.products.productReviews);
  const reviewsLoading = useSelector(state => state.products.productReviewsLoading);
  const reviewsError = useSelector(state => state.products.productReviewsError);

  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Reviews pagination and filters
  const [reviewFilters, setReviewFilters] = useState({
    pageNumber: 1,
    pageSize: 5,
    sortColumn: 'createdAt',
    sortDirection: 'desc',
    minRating: undefined
  });

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
      dispatch(clearProductReviews());
    };
  }, [dispatch, id]);

  // Fetch reviews when tab changes to reviews or filters change
  useEffect(() => {
    if (id && activeTab === 'reviews') {
      dispatch(fetchProductReviews({
        productId: parseInt(id),
        params: reviewFilters
      }));
    }
  }, [dispatch, id, activeTab, reviewFilters]);

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
    if (reviewsError) {
      message.error(`Failed to load reviews: ${reviewsError.detail || 'Unknown error'}`);
    }
  }, [productError, updateError, reviewsError]);

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

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  // Handle reviews pagination change
  const handleReviewsPageChange = (page, pageSize) => {
    setReviewFilters({
      ...reviewFilters,
      pageNumber: page,
      pageSize
    });
  };

  // Filter reviews by rating
  const handleRatingFilter = (minRating) => {
    setReviewFilters({
      ...reviewFilters,
      pageNumber: 1,  // Reset to first page
      minRating
    });
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

  // Calculate average rating from reviews
  const calculateAverageRating = () => {
    const reviews = productReviews?.items || [];
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Render reviews tab content
  const renderReviewsTab = () => {
    const reviews = productReviews?.items || [];

    return (
      <div>
        <div className="mb-6">
          <Row gutter={24} align="middle">
            <Col xs={24} md={8}>
              <Card className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {calculateAverageRating()}
                </div>
                <Rate disabled allowHalf defaultValue={calculateAverageRating()} />
                <div className="mt-2 text-gray-500">
                  Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card title="Filter Reviews">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type={reviewFilters.minRating === undefined ? 'primary' : 'default'}
                    onClick={() => handleRatingFilter(undefined)}
                  >
                    All
                  </Button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <Button
                      key={rating}
                      type={reviewFilters.minRating === rating ? 'primary' : 'default'}
                      icon={<StarOutlined />}
                      onClick={() => handleRatingFilter(rating)}
                    >
                      {rating}+ Stars
                    </Button>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <Card
          className="mb-6"
          title={
            <div className="flex justify-between items-center">
              <span>Customer Reviews</span>
              <Text type="secondary">
                Last updated: {new Date().toLocaleString()}
              </Text>
            </div>
          }
        >
          <Spin spinning={reviewsLoading}>
            {reviews.length > 0 ? (
              <List
                dataSource={reviews}
                renderItem={review => (
                  <List.Item>
                    <Comment
                      author={<Text strong>{review.userFullName}</Text>}
                      avatar={
                        <Avatar style={{ backgroundColor: '#1890ff' }}>
                          {review.userFullName?.charAt(0) || 'U'}
                        </Avatar>
                      }
                      content={
                        <>
                          <Rate disabled defaultValue={review.rating} />
                          <Paragraph>{review.comment}</Paragraph>
                        </>
                      }
                      datetime={
                        <Text type="secondary">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
                pagination={false}
                locale={{ emptyText: 'No reviews found' }}
              />
            ) : (
              <Empty
                description={
                  <div>
                    <p>No reviews yet</p>
                    <p className="text-gray-500 text-sm">Be the first to receive customer feedback</p>
                  </div>
                }
              />
            )}
          </Spin>

          {productReviews?.totalPages > 0 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                current={productReviews.pageNumber + 1} // API returns 0-based index
                pageSize={reviewFilters.pageSize}
                total={productReviews.totalPages * reviewFilters.pageSize}
                onChange={handleReviewsPageChange}
                showSizeChanger
                pageSizeOptions={['5', '10', '20']}
              />
            </div>
          )}
        </Card>
      </div>
    );
  };

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
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <TagOutlined /> Details
              </span>
            }
            key="details"
          >
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
                          <Button icon={<UploadOutlined />} className="bg-white">
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
                        <Space>
                          {product.rating} / 5
                          <Rate disabled defaultValue={product.rating} />
                        </Space>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Last Updated">
                      <div className="text-xs text-gray-500">{currentDateTime}</div>
                      <div className="text-xs text-gray-500">by {currentUser}</div>
                    </Descriptions.Item>
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

                      <div>
                        <Title level={5}>Description</Title>
                        <Text className="block whitespace-pre-wrap">{product.description}</Text>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200 text-right">
                        <Button
                          type="link"
                          icon={<MessageOutlined />}
                          onClick={() => setActiveTab('reviews')}
                        >
                          View Customer Reviews
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span>
                <MessageOutlined /> Reviews
                {productReviews?.items?.length > 0 && ` (${productReviews.items.length})`}
              </span>
            }
            key="reviews"
          >
            {renderReviewsTab()}
          </TabPane>
        </Tabs>

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