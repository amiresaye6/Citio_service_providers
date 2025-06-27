import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Row, Col, message, Divider, Tabs, Avatar, Switch, Tooltip, Space, Descriptions } from 'antd';
import { UploadOutlined, EditOutlined, SaveOutlined, CloseOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';

// Mock vendor
const mockVendor = {
    id: 'vnd-001',
    businessName: 'Acme Fresh Foods',
    email: 'contact@acmefoods.com',
    phone: '+1 800 123 4567',
    address: '123 Market Street, San Francisco, CA 94103',
    logoUrl: 'https://i.pravatar.cc/150?img=40',
    bannerUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?fit=crop&w=1200&q=80',
    status: 'active',
    allowOnlineOrders: true,
    timezone: 'America/Los_Angeles',
    openingHours: '8:00 AM - 10:00 PM',
    about: 'We deliver fresh groceries and organic food at your doorstep.',
};

const InfoRow = ({ label, value, editable, children }) => (
    <Row align="middle" className="mb-2">
        <Col sm={8} xs={24} style={{ fontWeight: 'bold', color: '#888' }}>{label}</Col>
        <Col sm={16} xs={24} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editable ? children : <span style={{ fontSize: 16 }}>{value || <span style={{ color: '#bbb' }}>—</span>}</span>}
        </Col>
    </Row>
);

const VendorProfilePage = () => {
    const [vendor, setVendor] = useState(mockVendor);
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [tabKey, setTabKey] = useState('profile');
    const [loading, setLoading] = useState(false);

    // Upload handlers
    const handleLogoUpload = ({ file }) => {
        setLogoFile(file);
        return false;
    };
    const handleBannerUpload = ({ file }) => {
        setBannerFile(file);
        return false;
    };

    // Save Profile
    const handleSaveProfile = (values) => {
        setLoading(true);
        setTimeout(() => {
            setVendor({
                ...vendor,
                ...values,
                logoUrl: logoFile ? URL.createObjectURL(logoFile) : vendor.logoUrl,
                bannerUrl: bannerFile ? URL.createObjectURL(bannerFile) : vendor.bannerUrl,
            });
            setEditMode(false);
            setLogoFile(null);
            setBannerFile(null);
            setLoading(false);
            message.success('Profile updated (mock)');
        }, 900);
    };

    // Toggle Online Orders
    const handleToggleOnlineOrders = (checked) => {
        setVendor({ ...vendor, allowOnlineOrders: checked });
        message.info(`Online orders ${checked ? 'enabled' : 'disabled'} (mock)`);
    };

    // Fill form when entering edit mode
    React.useEffect(() => {
        if (editMode)
            form.setFieldsValue(vendor);
    }, [editMode, vendor, form]);

    // Banner and logo display
    const logoUrl = logoFile ? URL.createObjectURL(logoFile) : vendor.logoUrl;
    const bannerUrl = bannerFile ? URL.createObjectURL(bannerFile) : vendor.bannerUrl;

    // Responsive details view with edit in drawer/card
    return (
        <div className="p-4 md:p-8 min-h-screen">
            <PageHeader
                title="Store Profile"
                subtitle="Manage your business account and store appearance"
            />

            <Card className="shadow-lg mb-8 rounded-lg overflow-hidden">
                {/* Banner */}
                <div className="relative w-full mb-8" style={{ borderRadius: 8, overflow: 'hidden' }}>
                    <img
                        src={bannerUrl}
                        alt="Store Banner"
                        style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
                    />
                    {editMode && (
                        <Upload
                            accept="image/*"
                            beforeUpload={() => false}
                            onChange={handleBannerUpload}
                            showUploadList={false}
                        >
                            <Button
                                icon={<UploadOutlined />}
                                style={{
                                    position: 'absolute', top: 16, right: 24, zIndex: 1,
                                    borderRadius: 4, fontWeight: 500
                                }}
                                size="small"
                            >
                                Change Banner
                            </Button>
                        </Upload>
                    )}
                </div>

                <Row gutter={32} align="middle" className="mb-4">
                    <Col xs={24} md={4} className="flex flex-col items-center justify-center mb-4 md:mb-0">
                        <Avatar
                            size={90}
                            src={logoUrl}
                            alt="Logo"
                            style={{ border: '3px solid #fff', boxShadow: '0 2px 8px #0002', marginBottom: 12 }}
                        />
                        {editMode && (
                            <Upload
                                accept="image/*"
                                beforeUpload={() => false}
                                onChange={handleLogoUpload}
                                showUploadList={false}
                            >
                                <Button icon={<UploadOutlined />} size="small">
                                    Change Logo
                                </Button>
                            </Upload>
                        )}
                    </Col>
                    <Col xs={24} md={16}>
                        <div>
                            <div className="text-2xl font-bold mb-1">{vendor.businessName}</div>
                            <div className="text-gray-500 mb-1">{vendor.email}</div>
                            <div className="text-gray-500">{vendor.phone}</div>
                            <div className="text-gray-400 text-xs mt-1">{vendor.address}</div>
                            <div className="mt-2">
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: vendor.status === "active" ? '#e6fffb' : '#fff1f0',
                                        color: vendor.status === "active" ? '#13c2c2' : '#cf1322',
                                        borderRadius: 8,
                                        padding: '2px 12px',
                                        fontWeight: 500,
                                        fontSize: 13
                                    }}
                                >
                                    {vendor.status === "active" ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={4} className="text-right">
                        {!editMode ? (
                            <Tooltip title="Edit Profile">
                                <Button
                                    icon={<EditOutlined />}
                                    type="primary"
                                    onClick={() => setEditMode(true)}
                                    size="middle"
                                >
                                    Edit Profile
                                </Button>
                            </Tooltip>
                        ) : (
                            <Space>
                                <Button
                                    icon={<CloseOutlined />}
                                    onClick={() => {
                                        setEditMode(false);
                                        setLogoFile(null);
                                        setBannerFile(null);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    icon={<SaveOutlined />}
                                    type="primary"
                                    form="vendor-profile-form"
                                    htmlType="submit"
                                    loading={loading}
                                >
                                    Save
                                </Button>
                            </Space>
                        )}
                    </Col>
                </Row>

                <Divider />

                <Tabs activeKey={tabKey} onChange={setTabKey} tabBarGutter={40}>
                    <Tabs.TabPane tab="Profile Information" key="profile">
                        {!editMode ? (
                            // View mode with Descriptions/Rows
                            <Descriptions
                                bordered
                                column={{ xs: 1, sm: 2, md: 2, lg: 2 }}
                                size="middle"
                                className="mb-4"
                            >
                                <Descriptions.Item label="Business Name">{vendor.businessName}</Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <span style={{
                                        color: vendor.status === "active" ? "#13c2c2" : "#cf1322",
                                        fontWeight: 500
                                    }}>
                                        {vendor.status}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Contact Email">{vendor.email}</Descriptions.Item>
                                <Descriptions.Item label="Phone">{vendor.phone}</Descriptions.Item>
                                <Descriptions.Item label="Timezone">{vendor.timezone}</Descriptions.Item>
                                <Descriptions.Item label="Opening Hours">{vendor.openingHours}</Descriptions.Item>
                                <Descriptions.Item label="Address" span={2}>{vendor.address}</Descriptions.Item>
                                <Descriptions.Item label="About" span={2}>{vendor.about}</Descriptions.Item>
                                <Descriptions.Item label="Online Orders" span={2}>
                                    <Switch checked={vendor.allowOnlineOrders} disabled style={{ marginRight: 8 }} />
                                    <span>{vendor.allowOnlineOrders ? 'Enabled' : 'Disabled'}</span>
                                </Descriptions.Item>
                            </Descriptions>
                        ) : (
                            // Edit mode
                            <Form
                                form={form}
                                id="vendor-profile-form"
                                layout="vertical"
                                initialValues={vendor}
                                onFinish={handleSaveProfile}
                                style={{ maxWidth: 700, margin: '0 auto' }}
                            >
                                <InfoRow label="Business Name" editable>
                                    <Form.Item
                                        name="businessName"
                                        noStyle
                                        rules={[{ required: true, message: 'Enter your business name' }]}
                                    >
                                        <Input placeholder="Your business name" />
                                    </Form.Item>
                                </InfoRow>
                                <InfoRow label="Contact Email" editable>
                                    <Form.Item
                                        name="email"
                                        noStyle
                                        rules={[
                                            { required: true, message: 'Enter contact email' },
                                            { type: 'email', message: 'Invalid email address' }
                                        ]}
                                    >
                                        <Input placeholder="Contact email" />
                                    </Form.Item>
                                </InfoRow>
                                <InfoRow label="Phone" editable>
                                    <Form.Item
                                        name="phone"
                                        noStyle
                                        rules={[{ required: true, message: 'Enter phone number' }]}
                                    >
                                        <Input placeholder="Phone number" />
                                    </Form.Item>
                                </InfoRow>
                                <InfoRow label="Address" editable>
                                    <Form.Item
                                        name="address"
                                        noStyle
                                        rules={[{ required: true, message: 'Enter address' }]}
                                    >
                                        <Input placeholder="Business address" />
                                    </Form.Item>
                                </InfoRow>
                                <InfoRow label="Timezone" editable>
                                    <Form.Item name="timezone" noStyle>
                                        <Input placeholder="e.g. America/Los_Angeles" />
                                    </Form.Item>
                                </InfoRow>
                                <InfoRow label="Opening Hours" editable>
                                    <Form.Item name="openingHours" noStyle>
                                        <Input placeholder="e.g. 8:00 AM - 10:00 PM" />
                                    </Form.Item>
                                </InfoRow>
                                <InfoRow label="About" editable>
                                    <Form.Item name="about" noStyle>
                                        <Input.TextArea rows={2} placeholder="Describe your business..." />
                                    </Form.Item>
                                </InfoRow>
                                <InfoRow label="Online Orders" editable>
                                    <Form.Item name="allowOnlineOrders" valuePropName="checked" noStyle>
                                        <Switch onChange={handleToggleOnlineOrders} />
                                    </Form.Item>
                                </InfoRow>
                            </Form>
                        )}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Security" key="security">
                        <Card
                            bordered={false}
                            style={{ maxWidth: 500, margin: '0 auto', border: "2px solid #6a7282" }}
                        >
                            <Form layout="vertical" onFinish={() => message.success('Password changed (mock)')}>
                                <Form.Item
                                    name="oldPassword"
                                    label="Current Password"
                                    rules={[{ required: true, message: 'Enter current password' }]}
                                >
                                    <Input.Password
                                        placeholder="Current password"
                                        iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="newPassword"
                                    label="New Password"
                                    rules={[
                                        { required: true, message: 'Enter new password' },
                                        { min: 6, message: 'Password should be at least 6 characters' }
                                    ]}
                                >
                                    <Input.Password
                                        placeholder="New password"
                                        iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                    />
                                </Form.Item>
                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirm New Password"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Confirm your new password' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject('Passwords do not match!');
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        placeholder="Confirm new password"
                                        iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<LockOutlined />}
                                    >
                                        Change Password
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Tabs.TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default VendorProfilePage;