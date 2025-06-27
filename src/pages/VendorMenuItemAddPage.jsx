import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Progress,
  Tabs,
  Row,
  Col,
  Typography,
  Tooltip,
  Space,
  Divider,
  Alert,
  Badge,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  CodeOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloudUploadOutlined,
  DollarOutlined,
  TranslationOutlined,
  PictureOutlined,
  TagOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// TODO: Replace with real data from Redux slice
const mockSubcategories = [
  { id: 1, nameEn: "Burgers", nameAr: "برجر" },
  { id: 2, nameEn: "Pizzas", nameAr: "بيتزا" },
  { id: 3, nameEn: "Salads", nameAr: "سلطة" },
];

// Mock a batch upload process with progress (for demo)
const mockBatchUpload = (data, onProgress, onSuccess, onError) => {
  let progress = 0;
  const total = data.length;
  function next() {
    if (progress < total) {
      setTimeout(() => {
        progress += 1;
        onProgress(Math.floor((progress / total) * 100));
        next();
      }, 350);
    } else {
      setTimeout(onSuccess, 400);
    }
  }
  next();
};

// Example product for templates
const exampleProduct = {
  nameEn: "Cheeseburger",
  nameAr: "تشيز برجر",
  description: "A tasty cheeseburger with fresh ingredients.",
  price: 6.99,
  subCategoryId: 1
};

const exampleCSV = `nameEn,nameAr,description,price,subCategoryId
Cheeseburger,تشيز برجر,A tasty cheeseburger with fresh ingredients.,6.99,1
Veggie Pizza,بيتزا خضار,Delicious pizza topped with fresh veggies.,9.99,2
Greek Salad,سلطة يونانية,Fresh salad with feta cheese and olives.,5.49,3
`;

const exampleJSON = JSON.stringify([
  {
    nameEn: "Cheeseburger",
    nameAr: "تشيز برجر",
    description: "A tasty cheeseburger with fresh ingredients.",
    price: 6.99,
    subCategoryId: 1
  },
  {
    nameEn: "Veggie Pizza",
    nameAr: "بيتزا خضار",
    description: "Delicious pizza topped with fresh veggies.",
    price: 9.99,
    subCategoryId: 2
  }
], null, 2);

// Util: download file
function downloadFile(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

const VendorMenuItemAddPage = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchResult, setBatchResult] = useState(null);
  const [batchError, setBatchError] = useState(null);
  const [importing, setImporting] = useState(false);
  const [fileHovered, setFileHovered] = useState(false);

  const navigate = useNavigate();

  // TODO: Replace mockSubcategories with Redux: useSelector(state => state.vendors.subcategories)
  const subcategories = mockSubcategories;

  // Single form submit
  const handleFinish = (values) => {
    // TODO: Replace with dispatch(addProduct({...values, mainImageFile: imageFile}))
    message.success('Menu item added successfully!');
    form.resetFields();
    setImageFile(null);
    setImageUrl(null);
    navigate('/vendor/menu');
  };

  // Single image upload
  const handleImageUpload = ({ file }) => {
    setImageFile(file);

    // Create preview URL
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }

    return false;
  };

  // Batch Import Handlers
  const handleBatchFile = (file) => {
    setBatchResult(null);
    setBatchError(null);
    setBatchProgress(0);
    setBatchLoading(false);
    setImporting(true);

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      let products = [];
      try {
        if (ext === 'json') {
          products = JSON.parse(e.target.result);
        } else if (ext === 'csv') {
          // Simple CSV parse (no quoted commas)
          const lines = e.target.result.split("\n").filter(line => line.trim());
          const [header, ...rows] = lines.map(l => l.split(","));
          products = rows.map(row => {
            const obj = {};
            header.forEach((h, idx) => { obj[h] = row[idx]; });
            // Parse numbers
            obj.price = parseFloat(obj.price);
            obj.subCategoryId = parseInt(obj.subCategoryId, 10);
            return obj;
          });
        } else if (ext === 'xlsx' || ext === 'xls') {
          // Excel: Only mock, real: use SheetJS (xlsx) in production
          message.info("Excel file import is mocked. Use JSON/CSV for real import.");
          products = [
            exampleProduct,
            { ...exampleProduct, nameEn: "Veggie Pizza", price: 9.99, subCategoryId: 2 }
          ];
        } else {
          throw new Error("Unsupported file type");
        }
      } catch (err) {
        setBatchError("Could not parse file: " + err.message);
        setBatchLoading(false);
        setBatchProgress(0);
        setImporting(false);
        return;
      }

      setBatchLoading(true);
      setBatchProgress(0);
      // Mock upload with progress
      mockBatchUpload(
        products,
        prog => setBatchProgress(prog),
        () => {
          setBatchResult(`${products.length} products imported successfully!`);
          setBatchLoading(false);
          setImporting(false);
          setBatchProgress(100);
          message.success(`${products.length} products imported successfully!`);
        },
        err => {
          setBatchError('Failed to import products: ' + err);
          setBatchLoading(false);
          setImporting(false);
        }
      );
    };
    if (ext === 'json' || ext === 'csv') {
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      // In real: use xlsx package to read as binary string and parse workbook
      reader.readAsArrayBuffer(file);
    } else {
      setBatchError("Unsupported file type. Only CSV, JSON, XLSX supported.");
      setImporting(false);
    }
    return false;
  };

  // Export Templates
  const exportCSV = () => downloadFile("menu-template.csv", exampleCSV, "text/csv");
  const exportJSON = () => downloadFile("menu-template.json", exampleJSON, "application/json");
  const exportExcel = () => {
    // In real: use SheetJS, here just download CSV as XLSX for demo
    downloadFile("menu-template.xlsx", exampleCSV, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  };

  return (
    <div className="p-6  min-h-screen">
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

      <Card style={{
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
      }}>
        <Title level={3} style={{ marginBottom: '24px', color: '#1a1a1a' }}>
          <PlusOutlined style={{ color: '#1890ff', marginRight: '10px' }} /> Add New Menu Item
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          style={{ marginBottom: '24px' }}
        >
          <TabPane
            tab={
              <span>
                <PlusOutlined /> Single Item
              </span>
            }
            key="1"
          >
            <div className="py-2">
              <Row gutter={32}>
                <Col xs={24} lg={14}>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{
                      price: 0,
                    }}
                    disabled={importing || batchLoading}
                  >
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="nameEn"
                          label={
                            <span>
                              <TranslationOutlined /> Name (English)
                            </span>
                          }
                          rules={[{ required: true, message: 'Please enter English name' }]}
                        >
                          <Input placeholder="e.g. Cheeseburger" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="nameAr"
                          label={
                            <span>
                              <TranslationOutlined /> Name (Arabic)
                            </span>
                          }
                          rules={[{ required: true, message: 'Please enter Arabic name' }]}
                        >
                          <Input placeholder="e.g. تشيز برجر" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[{ required: true, message: 'Please enter description' }]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="Describe your menu item..."
                        showCount
                        maxLength={200}
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="price"
                          label={
                            <span>
                              <DollarOutlined /> Price
                            </span>
                          }
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
                          label={
                            <span>
                              <TagOutlined /> Subcategory
                            </span>
                          }
                          rules={[{ required: true, message: 'Please select a subcategory' }]}
                        >
                          <Select
                            placeholder="Select a subcategory"
                            options={subcategories.map((s) => ({
                              value: s.id,
                              label: `${s.nameEn} (${s.nameAr})`,
                            }))}
                            showSearch
                            optionFilterProp="label"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item style={{ marginTop: '24px' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<PlusOutlined />}
                        disabled={importing || batchLoading || !imageFile}
                        size="large"
                      >
                        Add Menu Item
                      </Button>
                      <Button
                        style={{ marginLeft: '12px' }}
                        onClick={() => navigate('/vendor/menu')}
                        disabled={importing || batchLoading}
                      >
                        Cancel
                      </Button>
                    </Form.Item>
                  </Form>
                </Col>

                <Col xs={24} lg={10}>
                  <div className="border border-gray-200 rounded-lg p-5 ">
                    <Form.Item
                      label={
                        <span>
                          <PictureOutlined /> Menu Item Image
                          <Tooltip title="Recommended size: 800x600px, JPG or PNG">
                            <InfoCircleOutlined style={{ marginLeft: 8 }} />
                          </Tooltip>
                        </span>
                      }
                      required
                    >
                      <div className={`${!imageUrl ? 'border-2 border-dashed border-gray-300 ' : ''} rounded-lg overflow-hidden`}>
                        {imageUrl ? (
                          <div className="relative">
                            <img src={imageUrl} alt="Preview" className="w-full h-64 object-cover" />
                            <div className="absolute top-2 right-2  bg-opacity-80 rounded p-1">
                              <Button
                                icon={<UploadOutlined />}
                                onClick={() => {
                                  setImageUrl(null);
                                  setImageFile(null);
                                }}
                                danger
                                size="small"
                              >
                                Change
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Upload
                            accept="image/*"
                            beforeUpload={handleImageUpload}
                            showUploadList={false}
                            maxCount={1}
                            disabled={importing || batchLoading}
                            style={{ width: '100%', height: '100%' }}
                          >
                            <div className="flex flex-col items-center justify-center p-6 h-64">
                              <PictureOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
                              <p className="text-base my-2">Click or drag image to upload</p>
                              <p className="text-xs text-gray-500">JPG, PNG or GIF (max. 2MB)</p>
                            </div>
                          </Upload>
                        )}
                      </div>

                      {!imageFile && (
                        <div className="mt-2">
                          <Alert
                            message="An image is required"
                            type="warning"
                            showIcon
                          />
                        </div>
                      )}
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span>
                <CloudUploadOutlined /> Batch Import
              </span>
            }
            key="2"
          >
            <div className="py-2">
              <Row gutter={32} align="top">
                <Col xs={24} lg={14}>
                  <div className="mb-6">
                    <Title level={4}>Import Multiple Menu Items</Title>
                    <Paragraph style={{ fontSize: '14px', marginBottom: '20px' }}>
                      Upload a CSV, JSON, or Excel file to add multiple products at once.
                      <br />
                      All files must include these required fields: <b>nameEn</b>, <b>nameAr</b>, <b>description</b>, <b>price</b>, <b>subCategoryId</b>
                    </Paragraph>

                    <div
                      className={`border-2 border-dashed rounded-lg mb-6 ${fileHovered ? 'border-blue-500 bg-blue-50' : 'border-gray-300 '} ${batchLoading || importing ? 'opacity-60 cursor-not-allowed' : ''}`}
                      onDragEnter={() => setFileHovered(true)}
                      onDragLeave={() => setFileHovered(false)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setFileHovered(true);
                      }}
                      onDrop={() => setFileHovered(false)}
                    >
                      <Upload
                        accept=".csv,.json,.xlsx,.xls"
                        beforeUpload={handleBatchFile}
                        showUploadList={false}
                        disabled={batchLoading || importing}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <div className="flex flex-col items-center justify-center p-6 h-48">
                          <CloudUploadOutlined style={{ fontSize: '48px', color: fileHovered ? '#1890ff' : '#bfbfbf', marginBottom: '16px' }} />
                          <Title level={5} style={{ margin: '0 0 8px 0' }}>Drag & Drop Your File Here</Title>
                          <Text type="secondary">or</Text>
                          <Button
                            type="primary"
                            icon={<UploadOutlined />}
                            loading={batchLoading || importing}
                            disabled={batchLoading || importing}
                            style={{ margin: '12px 0' }}
                          >
                            Select File
                          </Button>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Supported formats: .CSV, .JSON, .XLSX
                          </Text>
                        </div>
                      </Upload>
                    </div>

                    {batchLoading && (
                      <div className="my-6">
                        <Progress
                          percent={batchProgress}
                          status={batchProgress < 100 ? "active" : "success"}
                          strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }}
                        />
                        <Text style={{ display: 'block', textAlign: 'center', marginTop: '8px', color: '#1890ff' }}>
                          Importing products, please wait...
                        </Text>
                      </div>
                    )}

                    {batchResult && (
                      <div className="flex items-center p-4 rounded-lg bg-green-50 border border-green-200 my-4">
                        <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a', marginRight: '12px' }} />
                        <Text>{batchResult}</Text>
                      </div>
                    )}

                    {batchError && (
                      <div className="flex items-center p-4 rounded-lg bg-red-50 border border-red-200 my-4">
                        <ExclamationCircleOutlined style={{ fontSize: '20px', color: '#ff4d4f', marginRight: '12px' }} />
                        <Text>{batchError}</Text>
                      </div>
                    )}

                    <div className="mt-6">
                      <Divider orientation="left">
                        <Badge status="processing" text="Download Templates" />
                      </Divider>
                      <Space size="middle" className="flex flex-wrap gap-3">
                        <Button
                          icon={<FileTextOutlined />}
                          onClick={exportCSV}
                          style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}
                        >
                          CSV Template
                        </Button>
                        <Button
                          icon={<CodeOutlined />}
                          onClick={exportJSON}
                          style={{ background: '#e6f7ff', borderColor: '#91d5ff' }}
                        >
                          JSON Template
                        </Button>
                        <Button
                          icon={<FileExcelOutlined />}
                          onClick={exportExcel}
                          style={{ background: '#f4f4f4', borderColor: '#d9d9d9' }}
                        >
                          Excel Template
                        </Button>
                      </Space>
                    </div>
                  </div>
                </Col>

                <Col xs={24} lg={10}>
                  <div className="mb-6">
                    <Title level={4}>Template Examples</Title>

                    <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-2  border-b border-gray-200">
                        <Badge color="#52c41a" text="CSV Example" />
                      </div>
                      <pre className="p-3 text-xs overflow-x-auto  m-0">{exampleCSV}</pre>
                    </div>

                    <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-2  border-b border-gray-200">
                        <Badge color="#1890ff" text="JSON Example" />
                      </div>
                      <pre className="p-3 text-xs overflow-x-auto  m-0">{exampleJSON}</pre>
                    </div>

                    <Alert
                      message="Need Help?"
                      description={
                        <Text type="secondary" style={{ fontSize: '13px' }}>
                          Excel files should have headers in the first row, matching the column names shown in the CSV example.
                        </Text>
                      }
                      type="info"
                      showIcon
                      style={{ marginTop: '16px' }}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default VendorMenuItemAddPage;