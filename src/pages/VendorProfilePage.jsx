import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Upload, Card } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';
import UserCard from '../components/common/UserCard';
import StatusTag from '../components/common/StatusTag';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ManageStorePage = () => {
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(false);
    const [profileForm] = Form.useForm();
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    // Fake vendor data (replace with API call in a real app)
    const fakeVendor = {
        name: 'Acme Corp',
        contact: 'contact@acme.com',
        status: 'active',
        logoUrl: 'https://i.pravatar.cc/150?img=3',
        bannerUrl: 'https://via.placeholder.com/1200x200',
    };

    // Simulate fetching vendor profile
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setVendor(fakeVendor);
            profileForm.setFieldsValue(fakeVendor);
            setLoading(false);
            ToastNotifier.success('Profile Loaded', 'Vendor profile fetched successfully.');
        }, 1000);
    }, [profileForm]);

    // Handle profile update
    const handleUpdateProfile = (values) => {
        setLoading(true);
        setTimeout(() => {
            const updatedVendor = {
                ...vendor,
                ...values,
                logoUrl: logoFile ? URL.createObjectURL(logoFile) : vendor.logoUrl,
                bannerUrl: bannerFile ? URL.createObjectURL(bannerFile) : vendor.bannerUrl,
            };
            setVendor(updatedVendor);
            setLoading(false);
            ToastNotifier.success('Profile Updated', 'Vendor profile updated successfully.');
            setLogoFile(null);
            setBannerFile(null);
        }, 1000);
    };



    // Handle file upload
    const handleLogoUpload = ({ file }) => {
        setLogoFile(file);
        return false; // Prevent auto-upload
    };

    const handleBannerUpload = ({ file }) => {
        setBannerFile(file);
        return false; // Prevent auto-upload
    };

    if (loading && !vendor) {
        return <LoadingSpinner text="Loading vendor profile..." />;
    }

    return (
        <div className="p-6 min-h-screen">
            <PageHeader
                title="Vendor Profile"
                subtitle="Update your store information"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Vendor Info Card */}
                <div className="lg:col-span-1">
                    <UserCard
                        name={vendor?.name}
                        status={vendor?.status}
                        email={vendor?.contact}
                        avatarUrl={vendor?.logoUrl}
                    />
                    <Card className="mt-4 shadow">
                        <p>
                            Status: <StatusTag status={vendor?.status} />
                        </p>
                        <p className="mt-2">
                            Contact: {vendor?.contact}
                        </p>
                    </Card>
                </div>

                {/* Profile Update Form */}
                <div className="lg:col-span-2">
                    {/* Banner */}
                    <div className="mb-4">
                        <img
                            src={vendor?.bannerUrl}
                            alt="Vendor Banner"
                            className="w-full h-48 object-cover rounded-lg shadow"
                        />
                        <Upload
                            accept="image/*"
                            beforeUpload={() => false}
                            onChange={handleBannerUpload}
                            showUploadList={false}
                        >
                            <Button icon={<UploadOutlined />} className="mt-2">
                                Change Banner
                            </Button>
                        </Upload>
                    </div>

                    {/* Update Profile Form */}
                    <Card title="Update Store Information" className="shadow mb-4">
                        <Form
                            form={profileForm}
                            layout="vertical"
                            onFinish={handleUpdateProfile}
                        >
                            <Form.Item
                                name="name"
                                label="Store Name"
                                rules={[{ required: true, message: 'Please enter store name' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="contact"
                                label="Contact Email"
                                rules={[{ required: true, message: 'Please enter contact email' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item label="Store Logo">
                                <Upload
                                    accept="image/*"
                                    beforeUpload={() => false}
                                    onChange={handleLogoUpload}
                                    showUploadList={false}
                                >
                                    <Button icon={<UploadOutlined />}>Upload Logo</Button>
                                </Upload>
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    Update Profile
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ManageStorePage;