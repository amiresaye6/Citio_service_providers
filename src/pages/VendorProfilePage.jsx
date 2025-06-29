import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Upload, Row, Col, message, Divider, Tabs, Avatar, Spin } from 'antd';
import { UploadOutlined, EditOutlined, SaveOutlined, CloseOutlined, LoadingOutlined } from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendorDetails, updateVendorProfile, clearUpdateErrors } from '../redux/slices/vendorsSlice';
import { Link } from 'react-router-dom';

const InfoRow = ({ label, value, editable, children }) => (
    <Row align="middle" className="mb-2">
        <Col sm={8} xs={24} style={{ fontWeight: 'bold', color: '#888' }}>{label}</Col>
        <Col sm={16} xs={24} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {editable ? children : <span style={{ fontSize: 16 }}>{value || <span style={{ color: '#bbb' }}>—</span>}</span>}
        </Col>
    </Row>
);

const VendorProfilePage = () => {
    const [editMode, setEditMode] = useState(false);
    const [form] = Form.useForm();
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);

    const dispatch = useDispatch();
    const {
        vendorDetails,
        loading: fetchLoading,
        updateLoading,
        error,
        updateError
    } = useSelector(state => state.vendors);

    // Upload handlers
    const handleLogoUpload = ({ file }) => {
        setLogoFile(file);
        return false;
    };

    const handleBannerUpload = ({ file }) => {
        setBannerFile(file);
        return false;
    };

    // Fetch vendor details on component mount
    useEffect(() => {
        dispatch(fetchVendorDetails());
    }, [dispatch]);

    // Clear any update errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearUpdateErrors());
        };
    }, [dispatch]);

    // Show error message if update fails
    useEffect(() => {
        if (updateError) {
            let errorMessage = "Failed to update profile";
            if (typeof updateError === 'string') {
                errorMessage = updateError;
            } else if (updateError.message) {
                errorMessage = updateError.message;
            }
            message.error(errorMessage);
        }
    }, [updateError]);

    // Save Profile
    const handleSaveProfile = (formValues) => {
        // Dispatch the update action with form values and files
        dispatch(updateVendorProfile({
            formValues: {
                userName: formValues.fullName,
                businessName: formValues.businessName,
            },
            logoFile,
            bannerFile
        })).unwrap()
            .then(() => {
                setEditMode(false);
                setLogoFile(null);
                setBannerFile(null);
                message.success('Profile updated successfully');
                // Refresh profile data
                dispatch(fetchVendorDetails());
            })
            .catch(() => {
                // Error is handled by the useEffect that watches updateError
            });
    };

    // Fill form when entering edit mode
    useEffect(() => {
        if (editMode && vendorDetails) {
            form.setFieldsValue({
                businessName: vendorDetails.businessName,
                fullName: vendorDetails.fullName,
                businessType: vendorDetails.businessType,
                taxNumber: vendorDetails.taxNumber,
                email: vendorDetails.email,
            });
        }
    }, [editMode, vendorDetails, form]);

    // Banner and logo display - use data from API
    const logoUrl = logoFile
        ? URL.createObjectURL(logoFile)
        : (vendorDetails?.profilePictureUrl ? `https://service-provider.runasp.net${vendorDetails.profilePictureUrl}` : '');

    const bannerUrl = bannerFile
        ? URL.createObjectURL(bannerFile)
        : (vendorDetails?.coverImageUrl ? `https://service-provider.runasp.net${vendorDetails.coverImageUrl}` : '');


    if (fetchLoading) {
        return (
            <div className="p-4 md:p-8 min-h-screen flex justify-center items-center">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} tip="Loading profile..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 md:p-8 min-h-screen">
                <PageHeader title="Store Profile" subtitle="Manage your business account and store appearance" />
                <Card className="shadow-lg mb-8 rounded-lg overflow-hidden">
                    <div className="p-8 text-center">
                        <p className="text-red-500 mb-4">Failed to load profile data</p>
                        <Button type="primary" onClick={() => dispatch(fetchVendorDetails())}>
                            Try Again
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <PageHeader
                title="Store Profile"
                subtitle="Manage your business account and store appearance"
            />

            <Card className="shadow-lg mb-8 rounded-lg overflow-hidden">
                {/* Banner */}
                <div className="relative w-full mb-8" style={{ borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ height: 180, background: '#f5f5f5', width: '100%' }}>
                        {bannerUrl && (
                            <img
                                src={bannerUrl}
                                alt="Store Banner"
                                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
                            />
                        )}
                    </div>
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
                            <div className="text-2xl font-bold mb-1">{vendorDetails.businessName}</div>
                            <div className="text-gray-500 mb-1">{vendorDetails.email}</div>
                            <div className="text-gray-500">{vendorDetails.fullName}</div>
                            <div className="text-gray-400 text-xs mt-1">{vendorDetails.businessType}</div>
                            <div className="mt-2 flex gap-2">
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: vendorDetails.isApproved ? '#e6fffb' : '#fff1f0',
                                        color: vendorDetails.isApproved ? '#13c2c2' : '#cf1322',
                                        borderRadius: 8,
                                        padding: '2px 12px',
                                        fontWeight: 500,
                                        fontSize: 13
                                    }}
                                >
                                    {vendorDetails.isApproved ? 'Approved' : 'Not Approved'}
                                </span>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: '#fafafa',
                                        color: '#333',
                                        borderRadius: 8,
                                        padding: '2px 12px',
                                        fontWeight: 500,
                                        fontSize: 13
                                    }}
                                >
                                    Rating: {vendorDetails.rating?.toFixed(1) || '0.0'} ({vendorDetails.numOfReviews || 0} reviews)
                                </span>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} md={4} className="text-right">
                        {!editMode ? (
                            <Button
                                icon={<EditOutlined />}
                                type="primary"
                                onClick={() => setEditMode(true)}
                                size="middle"
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <div className="flex gap-2 justify-end">
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
                                    loading={updateLoading}
                                >
                                    Save
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>

                <Divider />

                {!editMode ? (
                    // View mode with better styling
                    <div className="px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                            <div>
                                <div className="text-gray-500 text-sm mb-1">Business Name</div>
                                <div className="text-lg">{vendorDetails.businessName || '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm mb-1">Status</div>
                                <div>
                                    <span style={{
                                        color: vendorDetails.isApproved ? "#13c2c2" : "#cf1322",
                                        fontWeight: 500
                                    }}>
                                        {vendorDetails.isApproved ? "Approved" : "Not Approved"}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm mb-1">Full Name</div>
                                <div className="text-lg">{vendorDetails.fullName || '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm mb-1">Email</div>
                                <div className="text-lg">{vendorDetails.email || '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm mb-1">Business Type</div>
                                <div className="text-lg">{vendorDetails.businessType || '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm mb-1">Tax Number</div>
                                <div className="text-lg">{vendorDetails.taxNumber || '—'}</div>
                            </div>
                            <div>
                                <div className="text-gray-500 text-sm mb-1">Rating</div>
                                <div className="text-lg">
                                    {vendorDetails.rating?.toFixed(1) || '0.0'} ({vendorDetails.numOfReviews || 0} reviews)
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Link type="primary" to='/settings/security'>
                                Security Settings
                            </Link>
                        </div>
                    </div>
                ) : (
                    // Edit mode with improved form layout
                    <Form
                        form={form}
                        id="vendor-profile-form"
                        layout="vertical"
                        onFinish={handleSaveProfile}
                        className="px-4"
                    >
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Business Name"
                                    name="businessName"
                                    rules={[{ required: true, message: 'Enter your business name' }]}
                                >
                                    <Input placeholder="Your business name" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Full Name"
                                    name="fullName"
                                    rules={[{ required: true, message: 'Enter your full name' }]}
                                >
                                    <Input placeholder="Your full name" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Email"
                                    name="email"
                                >
                                    <Input placeholder="Contact email" disabled />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Business Type"
                                    name="businessType"
                                >
                                    <Input placeholder="Business type" disabled />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    label="Tax Number"
                                    name="taxNumber"
                                >
                                    <Input placeholder="Tax number" disabled />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                )}
            </Card>
        </div>
    );
};

export default VendorProfilePage;