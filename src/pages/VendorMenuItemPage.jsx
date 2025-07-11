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
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const VendorMenuItemPage = () => {
  const { t, i18n } = useTranslation('vendorMenuItem');
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const direction = i18n.dir();
  const isRTL = direction === "rtl";

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
      message.error(t('errors.loadFailed', { error: productError.detail || t('errors.unknown') }));
    }
    if (updateError) {
      message.error(t('errors.updateFailed', { error: updateError.detail || t('errors.unknown') }));
    }
    if (reviewsError) {
      message.error(t('errors.reviewsLoadFailed', { error: reviewsError.detail || t('errors.unknown') }));
    }
  }, [productError, updateError, reviewsError, t]);

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
        message.success(t('notifications.updateSuccess'));
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

  // Get product name based on current language
  const getProductName = () => {
    if (!product) return '';
    return isRTL && product.nameAr ? product.nameAr : product.nameEn;
  };

  // Render loading state
  if (productLoading && !product) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir={direction}>
        <Spin size="large" tip={t('loading.productDetails')} />
      </div>
    );
  }

  // Render error state
  if (productError && !product) {
    return (
      <div className="p-6 max-w-4xl mx-auto" dir={direction}>
        <Alert
          message={t('errors.loadingProduct')}
          description={productError.detail || t('errors.failedToLoad')}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => dispatch(fetchProductById(parseInt(id)))}>
              {t('buttons.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  // Render empty state
  if (!product) {
    return (
      <div className="p-6 max-w-4xl mx-auto" dir={direction}>
        <Empty description={t('emptyState.noProduct')} />
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
                  {t('reviews.basedOn', {
                    count: reviews.length,
                    review: t(reviews.length === 1 ? 'reviews.review' : 'reviews.reviews')
                  })}
                </div>
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card title={t('reviews.filterTitle')}>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type={reviewFilters.minRating === undefined ? 'primary' : 'default'}
                    onClick={() => handleRatingFilter(undefined)}
                  >
                    {t('reviews.filters.all')}
                  </Button>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <Button
                      key={rating}
                      type={reviewFilters.minRating === rating ? 'primary' : 'default'}
                      icon={<StarOutlined />}
                      onClick={() => handleRatingFilter(rating)}
                    >
                      {t('reviews.filters.stars', { rating })}
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
              <span>{t('reviews.customerReviews')}</span>
              <Text type="secondary">
                {t('reviews.lastUpdated')}: {new Date().toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
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
                          {new Date(review.createdAt).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
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
                locale={{ emptyText: t('reviews.noReviewsFound') }}
              />
            ) : (
              <Empty
                description={
                  <div>
                    <p>{t('reviews.noReviewsYet')}</p>
                    <p className="text-gray-500 text-sm">{t('reviews.beFirst')}</p>
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
                className={isRTL ? "rtl-pagination" : ""}
              />
            </div>
          )}
        </Card>
      </div>
    );
  };

  // Main component render
  return (
    <div className="p-6 min-h-screen" dir={direction}>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <a onClick={handleBack}>
            <ShopOutlined /> {t('breadcrumb.menuItems')}
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{getProductName()}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            type="text"
            style={{ marginRight: isRTL ? 0 : 16, marginLeft: isRTL ? 16 : 0 }}
          />
          <Title level={2} style={{ margin: 0 }}>
            {t('pageHeader.title')}
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
                {t('buttons.cancel')}
              </Button>
              <Button
                icon={updateLoading ? <LoadingOutlined /> : <SaveOutlined />}
                type="primary"
                onClick={() => form.submit()}
                loading={updateLoading}
              >
                {t('buttons.saveChanges')}
              </Button>
            </>
          ) : (
            <Button
              icon={<EditOutlined />}
              type="primary"
              onClick={handleEdit}
            >
              {t('buttons.editItem')}
            </Button>
          )}
        </Space>
      </div>

      <Spin spinning={isLoading}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane
            tab={
              <span>
                <TagOutlined /> {t('tabs.details')}
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
                      alt={getProductName()}
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
                            {t('buttons.changeImage')}
                          </Button>
                        </Upload>
                      </div>
                    )}
                    {!editMode && (
                      <div className={`absolute bottom-0 ${isRTL ? 'left-0' : 'right-0'} p-2`}>
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
                    <Descriptions.Item label={t('productInfo.id')}>#{product.id}</Descriptions.Item>
                    {product.vendorBusinessName && (
                      <Descriptions.Item label={t('productInfo.vendor')}>
                        {product.vendorBusinessName}
                      </Descriptions.Item>
                    )}
                    {product.vendorFullName && (
                      <Descriptions.Item label={t('productInfo.vendorFullName')}>
                        {product.vendorFullName}
                      </Descriptions.Item>
                    )}
                    {product.rating !== undefined && (
                      <Descriptions.Item label={t('productInfo.rating')}>
                        <Space>
                          {product.rating} / 5
                          <Rate disabled defaultValue={product.rating} />
                        </Space>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label={t('productInfo.lastUpdated')}>
                      <div className="text-xs text-gray-500">{currentDateTime}</div>
                      <div className="text-xs text-gray-500">{t('productInfo.by', { user: currentUser })}</div>
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
                          <Title level={4}>{t('editForm.productInformation')}</Title>
                          <Divider />
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="nameEn"
                            label={t('editForm.nameEn')}
                            rules={[{ required: true, message: t('validation.nameEnRequired') }]}
                          >
                            <Input placeholder={t('placeholders.nameEn')} />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="nameAr"
                            label={t('editForm.nameAr')}
                            rules={[{ required: true, message: t('validation.nameArRequired') }]}
                          >
                            <Input placeholder={t('placeholders.nameAr')} />
                          </Form.Item>
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="description"
                            label={t('editForm.description')}
                            rules={[{ required: true, message: t('validation.descriptionRequired') }]}
                          >
                            <Input.TextArea
                              rows={4}
                              placeholder={t('placeholders.description')}
                              showCount
                              maxLength={500}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="price"
                            label={t('editForm.price')}
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
                            label={t('editForm.subcategory')}
                            rules={[{ required: true, message: t('validation.subcategoryRequired') }]}
                          >
                            <Select
                              placeholder={t('placeholders.subcategory')}
                              loading={subcategoriesLoading}
                              options={subcategories?.map((s) => ({
                                value: s.id,
                                label: isRTL ? `${s.nameAr} (${s.nameEn})` : `${s.nameEn} (${s.nameAr})`,
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
                          <Title level={3} className="mb-1">{isRTL ? product.nameAr : product.nameEn}</Title>
                          <Text type="secondary" className="block text-lg">{isRTL ? product.nameEn : product.nameAr}</Text>
                        </div>
                        <div className="border border-blue-100 rounded-lg p-3">
                          <Title level={3} className="m-0">
                            <DollarOutlined className={isRTL ? "ml-1" : "mr-1"} />
                            ${Number(product.price).toFixed(2)}
                          </Title>
                        </div>
                      </div>

                      <Divider />

                      <div>
                        <Title level={5}>{t('productDetails.description')}</Title>
                        <Text className="block whitespace-pre-wrap">
                          {isRTL && product.descriptionAr ? product.descriptionAr : product.description}
                        </Text>
                      </div>

                      <div className={`mt-6 pt-4 border-t border-gray-200 ${isRTL ? 'text-left' : 'text-right'}`}>
                        <Button
                          type="link"
                          icon={<MessageOutlined />}
                          onClick={() => setActiveTab('reviews')}
                        >
                          {t('buttons.viewReviews')}
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
                <MessageOutlined /> {t('tabs.reviews')}
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
          title={t('modal.imagePreview')}
          footer={null}
          onCancel={() => setPreviewVisible(false)}
        >
          <img
            alt={t('modal.preview')}
            style={{ width: '100%' }}
            src={previewImage}
          />
        </Modal>
      </Spin>
    </div>
  );
};

export default VendorMenuItemPage;