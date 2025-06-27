import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Avatar, Tag, Button, Form, Input, InputNumber, Select, Upload, Row, Col, Divider, message } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, UploadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

// TODO: Replace with real API call to fetch item and subcategories
const mockGetMenuItem = (id) => ({
  id,
  nameEn: "Beef Burger",
  nameAr: "برجر لحم",
  description: "Juicy grilled beef burger with cheese and lettuce.",
  mainImageUrl: "/images/menu/beef-burger.jpg",
  gallery: [
    "/images/menu/beef-burger.jpg",
    "/images/menu/beef-burger-2.jpg",
    "/images/menu/beef-burger-3.jpg",
  ],
  price: 7.99,
  subCategoryId: 1,
  subCategoryNameEn: "Burgers",
  subCategoryNameAr: "برجر",
  status: "active",
  createdAt: "2025-06-21T12:34:56",
});
const mockSubcategories = [
  { id: 1, nameEn: "Burgers", nameAr: "برجر" },
  { id: 2, nameEn: "Pizzas", nameAr: "بيتزا" },
  { id: 3, nameEn: "Salads", nameAr: "سلطة" },
];

const VendorMenuItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();
  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // TODO: Replace with real data from Redux slice
  const subcategories = mockSubcategories;

  useEffect(() => {
    setItem(mockGetMenuItem(id)); // TODO: Replace with real fetch
  }, [id]);

  useEffect(() => {
    if (item && editMode) {
      form.setFieldsValue({
        nameEn: item.nameEn,
        nameAr: item.nameAr,
        description: item.description,
        price: item.price,
        subCategoryId: item.subCategoryId,
      });
    }
  }, [item, editMode, form]);

  const handleMainImageUpload = ({ file }) => {
    setMainImageFile(file);
    return false;
  };

  const handleGalleryUpload = ({ fileList }) => {
    setGalleryFiles(fileList.map(f => f.originFileObj).filter(Boolean));
    return false;
  };

  const handleEdit = () => setEditMode(true);

  const handleCancel = () => {
    setEditMode(false);
    setMainImageFile(null);
    setGalleryFiles([]);
  };

  const handleSave = (values) => {
    // TODO: Replace with dispatch(updateMenuItem({ ... }))
    setItem({
      ...item,
      ...values,
      mainImageUrl: mainImageFile ? URL.createObjectURL(mainImageFile) : item.mainImageUrl,
      gallery: galleryFiles.length
        ? galleryFiles.map(f => URL.createObjectURL(f))
        : item.gallery,
    });
    setEditMode(false);
    setMainImageFile(null);
    setGalleryFiles([]);
    message.success('Menu item updated (mock)');
  };

  if (!item) return null;

  // Display logic for images
  const mainImageDisplay = mainImageFile
    ? URL.createObjectURL(mainImageFile)
    : `https://service-provider.runasp.net${item.mainImageUrl}`;
  const galleryDisplay = galleryFiles.length
    ? galleryFiles.map(f => URL.createObjectURL(f))
    : (item.gallery || []).map(img => `https://service-provider.runasp.net${img}`);

  return (
    <div className="p-6 min-h-screen">
      <Card
        className="max-w-3xl mx-auto shadow"
        title={
          <div className="flex items-center gap-4">
            <Avatar
              src={mainImageDisplay}
              size={64}
              shape="square"
              alt="Menu Image"
              style={{ border: "2px solid #eee" }}
            />
            <div>
              <div className="font-bold text-xl">{item.nameEn}</div>
              <div className="text-gray-400">{item.nameAr}</div>
            </div>
          </div>
        }
        extra={
          editMode ? (
            <div>
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancel}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                onClick={() => form.submit()}
              >
                Save
              </Button>
            </div>
          ) : (
            <Button icon={<EditOutlined />} type="primary" onClick={handleEdit}>
              Edit
            </Button>
          )
        }
      >
        {editMode ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={item}
            onFinish={handleSave}
          >
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="nameEn"
                  label="Name (English)"
                  rules={[{ required: true, message: 'Please enter English name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="nameAr"
                  label="Name (Arabic)"
                  rules={[{ required: true, message: 'Please enter Arabic name' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter description' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="price"
                  label="Price"
                  rules={[{ required: true, message: 'Please enter price' }]}
                >
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="subCategoryId"
                  label="Subcategory"
                  rules={[{ required: true, message: 'Please select a subcategory' }]}
                >
                  <Select
                    placeholder="Select a subcategory"
                    options={subcategories.map((s) => ({
                      value: s.id,
                      label: s.nameEn,
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <Form.Item label="Main Image" extra="Select a new image to update">
                  <Upload
                    accept="image/*"
                    beforeUpload={handleMainImageUpload}
                    showUploadList={mainImageFile ? [{ name: mainImageFile.name }] : false}
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>Upload Main Image</Button>
                  </Upload>
                  <div className="mt-2">
                    <Avatar src={mainImageDisplay} shape="square" size={80} alt="Main" />
                  </div>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Gallery Images" extra="Select new images to update gallery">
                  <Upload
                    accept="image/*"
                    multiple
                    beforeUpload={() => false}
                    fileList={galleryFiles.map((f, idx) => ({
                      uid: idx,
                      name: f.name,
                      status: 'done',
                      url: URL.createObjectURL(f),
                    }))}
                    onChange={handleGalleryUpload}
                    listType="picture-card"
                  >
                    <div>
                      <UploadOutlined /> Upload Gallery Images
                    </div>
                  </Upload>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {galleryDisplay.map((img, idx) => (
                      <Avatar
                        key={img}
                        src={img}
                        shape="square"
                        size={54}
                        style={{ border: "1px solid #eee" }}
                        alt={`Gallery image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        ) : (
          <>
            <Descriptions bordered column={1} size="middle" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Description">{item.description}</Descriptions.Item>
              <Descriptions.Item label="Price">${item.price.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Status">
                {item.status === 'active' ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Subcategory">
                {item.subCategoryNameEn} <span className="text-gray-400">({item.subCategoryNameAr})</span>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {new Date(item.createdAt).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Gallery">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {galleryDisplay.length > 0 ? (
                    galleryDisplay.map((img, idx) => (
                      <Avatar
                        key={img}
                        src={img}
                        shape="square"
                        size={54}
                        style={{ border: "1px solid #eee" }}
                        alt={`Gallery image ${idx + 1}`}
                      />
                    ))
                  ) : (
                    <span style={{ color: "#aaa" }}>No Gallery Images</span>
                  )}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    </div>
  );
};

export default VendorMenuItemPage;