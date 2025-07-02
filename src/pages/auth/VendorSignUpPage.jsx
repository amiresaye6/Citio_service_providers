import React, { useEffect, useState } from 'react';
import { Button, Form, Select, Input, Typography, Row, Col, Card, Spin } from 'antd';
import { ShopOutlined, UserOutlined, MailOutlined, LockOutlined, NumberOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubcategories } from '../../redux/slices/vendorsSlice';
import { fetchBusinessTypes } from '../../redux/slices/adminSlice';
import { register } from '../../redux/slices/authSlice';
import ToastNotifier from '../../components/common/ToastNotifier';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

const VendorSignUpPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { subcategories } = useSelector((state) => state.vendors);
    const { BusinessTypes } = useSelector((state) => state.admin);
    const { loading: authLoading, error: authError } = useSelector((state) => state.auth);
    const [form] = Form.useForm();
    const [allBusinessTypes, setAllBusinessTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);

    useEffect(() => {
        dispatch(fetchSubcategories());
        const storedBusinessTypes = sessionStorage.getItem('businessTypes');
        if (storedBusinessTypes) {
            setAllBusinessTypes(JSON.parse(storedBusinessTypes));
            setLoadingTypes(false);
        } else {
            dispatch(fetchBusinessTypes());
        }
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (BusinessTypes.businessTypes?.length > 0) {
            setAllBusinessTypes(BusinessTypes.businessTypes);
            sessionStorage.setItem('businessTypes', JSON.stringify(BusinessTypes.businessTypes));
            setLoadingTypes(false);
        }
    }, [BusinessTypes.businessTypes]);

    useEffect(() => {
        if (authError) {
            ToastNotifier.error('Sign Up Failed', authError);
        }
    }, [authError]);

    const handleSubmit = (values) => {
        const vendorData = {
            email: values.email,
            password: values.password,
            fullName: values.fullName,
            businessName: values.businessName,
            businessType: values.businessType[0],
            taxNumber: values.taxNumber,
            subCategoryIds: values.subCategoryIds,
        };
        dispatch(register(vendorData)).then((result) => {
            if (result.meta.requestStatus === 'fulfilled') {
                ToastNotifier.success('Sign Up Successful', 'Your vendor account has been created. Please log in.');
                form.resetFields();
                navigate('/login');
            }
        });
    };

    return (
        <Row
            justify="center"
            align="middle"
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #f0f3ff 0%, #d5e6fb 100%)",
                padding: "16px",
            }}
        >
            <Col xs={24} sm={16} md={12} lg={9}>
                <Card
                    bordered={false}
                    style={{
                        boxShadow: "0 6px 32px 0 rgba(0, 72, 255, 0.07)",
                        borderRadius: "16px",
                        padding: "24px 4vw 32px 4vw",
                        background: "#fff",
                    }}
                >
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <img
                            src="/citio.svg"
                            alt="Citio Logo"
                            style={{
                                maxWidth: "90px",
                                marginBottom: "12px",
                                display: "block",
                                margin: "0 auto"
                            }}
                        />
                        <Title level={3} style={{ marginBottom: 0 }}>Vendor Sign Up</Title>
                        <Text type="secondary">Create your vendor account</Text>
                    </div>
                    {loadingTypes ? (
                        <Spin tip="Loading..." style={{ width: "100%", margin: "32px 0" }} />
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            disabled={authLoading}
                            size="large"
                        >
                            <Form.Item
                                name="businessName"
                                label="Business Name"
                                rules={[{ required: true, message: 'Please enter business name' }]}
                            >
                                <Input prefix={<ShopOutlined />} placeholder="Your business name" />
                            </Form.Item>
                            <Form.Item
                                name="fullName"
                                label="Owner Name"
                                rules={[{ required: true, message: 'Please enter owner name' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="Your full name" />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please enter email' },
                                    { type: 'email', message: 'Please enter a valid email' },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="youremail@example.com" autoComplete="email" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[{ required: true, message: 'Please enter password' }]}
                                hasFeedback
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder="Create a password" autoComplete="new-password" />
                            </Form.Item>
                            <Form.Item
                                name="businessType"
                                label="Business Type"
                                rules={[{ required: true, message: 'Please select your business type' }]}
                            >
                                <Select
                                    mode="tags"
                                    placeholder="Select or type your business type"
                                    style={{ width: '100%' }}
                                    prefix={<AppstoreOutlined />}
                                >
                                    {allBusinessTypes.map(type => (
                                        <Option key={type} value={type}>{type}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                name="taxNumber"
                                label="Tax Number"
                                rules={[{ required: true, message: 'Please enter your tax number' }]}
                            >
                                <Input prefix={<NumberOutlined />} placeholder="e.g. 123456789" />
                            </Form.Item>
                            <Form.Item
                                name="subCategoryIds"
                                label="Subcategories"
                                rules={[{ required: true, message: 'Please select at least one subcategory' }]}
                            >
                                <Select mode="tags" placeholder="Select subcategories">
                                    {subcategories.map(sub => (
                                        <Option key={sub.id} value={sub.id}>{sub.nameEn}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item className="mb-0">
                                <Button type="primary" htmlType="submit" block loading={authLoading} size="large">
                                    Sign Up
                                </Button>
                            </Form.Item>
                            <div style={{ textAlign: "center", marginTop: 24 }}>
                                <Text>
                                    Already have an account?{' '}
                                    <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
                                        Log in
                                    </Button>
                                </Text>
                            </div>
                        </Form>
                    )}
                </Card>
            </Col>
        </Row>
    );
};

export default VendorSignUpPage;