import React, { useState, useEffect } from 'react';
import {
  Card, Descriptions, Tag, Button, Form, Input, InputNumber,
  Select, Upload, Row, Col, Divider, message, Spin, Typography,
  Image, Space, Breadcrumb, Alert, Empty, Modal, Tabs, List,
  Avatar, Rate, Pagination
} from 'antd';
import {
  EditOutlined, SaveOutlined, CloseOutlined, UploadOutlined,
  ArrowLeftOutlined, ShopOutlined, DollarOutlined, TagOutlined,
  LoadingOutlined, EyeOutlined, MessageOutlined, StarOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UpdateOffer, fetchVendorOffers } from '../redux/slices/vendorsSlice';
import { useTranslation } from 'react-i18next';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const VendorOfferDetailsPage = () => {
  const { t, i18n } = useTranslation('vendorOfferDetails');
  const { productId, discountPercentage } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const direction = i18n.dir();
  const isRTL = direction === "rtl";

  // Get data from Redux store
  const { vendorOffers, loading, error } = useSelector((state) => state.vendors);
  const offer = vendorOffers.items?.find(item => 
    item.productId === parseInt(productId) && 
    item.discountPercentage === parseFloat(discountPercentage)
  );

  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  // Fetch offer data when component mounts
  useEffect(() => {
    if (!offer && productId && discountPercentage) {
      // If offer not in store, fetch it
      dispatch(fetchVendorOffers({ PageNumer: 1, PageSize: 100 }));
    }
  }, [dispatch, productId, discountPercentage, offer]);

  // Set form values when offer data is loaded or edit mode is toggled
  useEffect(() => {
    if (offer && editMode) {
      form.setFieldsValue({
        ProductId: offer.productId,
        Description: offer.description,
        DiscountCode: offer.discountCode,
        DiscountPercentage: offer.discountPercentage, // Add this line
      });
    }
  }, [offer, editMode, form]);

  // Show error messages if any
  useEffect(() => {
    if (error) {
      message.error(t('errors.loadFailed', { error: error.detail || t('errors.unknown') }));
    }
  }, [error, t]);

  // Handle image preview
  const handlePreview = () => {
    const imageUrl = getImageUrl();
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  // Handle image upload for offer image
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

  // Save offer changes
  const handleSave = (values) => {
    const updateData = {
      Description: values.Description,
      DiscountPercentage: offer.discountPercentage, // Send current value (not editable)
      DiscountCode: values.DiscountCode,
    };

    if (imageFile) {
      updateData.image = imageFile;
    }

    dispatch(UpdateOffer({
      vendorId: null, // Will be handled by backend
      ProductId: offer.productId,
      item: updateData
    })).then((result) => {
      if (!result.error) {
        message.success(t('notifications.updateSuccess'));
        setEditMode(false);
        setImageFile(null);
        // Refresh the offers list to get updated data
        dispatch(fetchVendorOffers({ PageNumer: 1, PageSize: 10 }));
      } else {
        // Handle duplicate offer error
        const errorMsg = result.error?.detail || result.error?.message || result.error;
        if (errorMsg && (errorMsg.toLowerCase().includes('found') || errorMsg.toLowerCase().includes('exists'))) {
          message.error(t('notifications.duplicateOffer') || 'This offer already exists with the same details.');
        } else {
          message.error(t('errors.updateFailed', { error: errorMsg || t('errors.unknown') }));
        }
      }
    });
  };

  // Navigate back to offers list
  const handleBack = () => {
    navigate('/vendor/offers');
  };

  // Get image URL for display
  const getImageUrl = () => {
    if (imageFile) {
      return imageFile.preview;
    } else if (offer?.imageUrl) {
      // Handle properly formatted URL
      return offer.imageUrl.startsWith('http')
        ? offer.imageUrl
        : `https://service-provider.runasp.net${offer.imageUrl}`;
    }
    return '';
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const isLoading = loading;

  // Get product name based on current language
  const getProductName = () => {
    if (!offer) return '';
    return isRTL && offer.productNameAr ? offer.productNameAr : offer.productNameEn;
  };

  // Render loading state
  if (isLoading && !offer) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir={direction}>
        <Spin size="large" tip={t('loading.offerDetails')} />
      </div>
    );
  }

  // Render error state
  if (error && !offer) {
    return (
      <div className="p-6 max-w-4xl mx-auto" dir={direction}>
        <Alert
          message={t('errors.loadingOffer')}
          description={error.detail || t('errors.failedToLoad')}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/vendor/offers')}>
              {t('buttons.backToOffers')}
            </Button>
          }
        />
      </div>
    );
  }

  // Render empty state
  if (!offer) {
    return (
      <div className="p-6 max-w-4xl mx-auto" dir={direction}>
        <Empty description={t('emptyState.noOffer')} />
      </div>
    );
  }

  // Main component render
  return (
    <div className="p-6 min-h-screen" dir={direction}>
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item>
          <a onClick={handleBack}>
            <ShopOutlined /> {t('breadcrumb.offers')}
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
                icon={isLoading ? <LoadingOutlined /> : <SaveOutlined />}
                type="primary"
                onClick={() => form.submit()}
                loading={isLoading}
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
              {t('buttons.editOffer')}
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
              {/* Left column with offer image */}
              <Col xs={24} md={10}>
                <Card className="mb-6" style={{ padding: 0 }}>
                  <div className="relative">
                    {getImageUrl() ? (
                      <Image
                        src={getImageUrl()}
                        alt={getProductName()}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                      />
                    ) : (
                      <div 
                        style={{ 
                          width: '100%', 
                          height: '200px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          backgroundColor: '#f5f5f5',
                          border: '2px dashed #d9d9d9',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{ textAlign: 'center', color: '#999' }}>
                          <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
                          <div>{t('image.noImage')}</div>
                        </div>
                      </div>
                    )}
                    {editMode && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Upload
                          accept="image/*"
                          showUploadList={false}
                          beforeUpload={() => false}
                          onChange={handleImageUpload}
                        >
                          <Button icon={<UploadOutlined />} className="bg-white">
                            {getImageUrl() ? t('buttons.changeImage') : t('buttons.addImage')}
                          </Button>
                        </Upload>
                      </div>
                    )}
                    {!editMode && getImageUrl() && (
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
              </Col>

              {/* Right column with offer details */}
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
                          <Title level={4}>{t('editForm.offerInformation')}</Title>
                          <Divider />
                        </Col>

                        <Col span={24}>
                          <Form.Item
                            name="Description"
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
                            name="DiscountPercentage"
                            label={t('editForm.discountPercentage')}
                          >
                            <InputNumber
                              disabled
                              style={{ width: '100%' }}
                              formatter={value => `${value}%`}
                            />
                          </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                          <Form.Item
                            name="DiscountCode"
                            label={t('editForm.discountCode')}
                          >
                            <Input placeholder={t('placeholders.discountCode')} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Form>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Title level={3} className="mb-1">{getProductName()}</Title>
                          <Text type="secondary" className="block text-lg">
                            {t('offerDetails.product')}: {getProductName()}
                          </Text>
                        </div>
                        <div className="border border-green-100 rounded-lg p-3">
                          <Title level={3} className="m-0" style={{ color: '#52c41a' }}>
                            <PercentageOutlined className={isRTL ? "ml-1" : "mr-1"} />
                            {offer.discountPercentage}
                          </Title>
                        </div>
                      </div>

                      <Divider />

                      <div>
                        <Title level={5}>{t('offerDetails.description')}</Title>
                        <Text className="block whitespace-pre-wrap">
                          {offer.description || <Text type="secondary">{t('offerDetails.noDescription')}</Text>}
                        </Text>
                      </div>

                      <div className="mt-6">
                        <Title level={5}>{t('offerDetails.discountCode')}</Title>
                        <Text className="block">
                          {offer.discountCode || <Text type="secondary">{t('offerDetails.noCode')}</Text>}
                        </Text>
                      </div>
                    </>
                  )}
                </Card>
              </Col>
            </Row>
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

export default VendorOfferDetailsPage; 