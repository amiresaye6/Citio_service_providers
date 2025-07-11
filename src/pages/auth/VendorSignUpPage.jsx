import React, { useEffect, useState } from 'react';
import { Button, Form, Select, Input, Typography, Row, Col, Card, Spin } from 'antd';
import { ShopOutlined, UserOutlined, MailOutlined, LockOutlined, NumberOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubcategories } from '../../redux/slices/vendorsSlice';
import { fetchBusinessTypes } from '../../redux/slices/adminSlice';
import { register } from '../../redux/slices/authSlice';
import ToastNotifier from '../../components/common/ToastNotifier';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Option } = Select;

const VendorSignUpPage = () => {
    const { t, i18n } = useTranslation('signup');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { subcategories } = useSelector((state) => state.vendors);
    const { BusinessTypes } = useSelector((state) => state.admin);
    const { loading: authLoading, error: authError } = useSelector((state) => state.auth);
    const [form] = Form.useForm();
    const [allBusinessTypes, setAllBusinessTypes] = useState([]);
    const [loadingTypes, setLoadingTypes] = useState(true);

    const direction = i18n.dir();
    const isRTL = direction === "rtl";

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
            ToastNotifier.error(t('signup.failedTitle'), authError);
        }
    }, [authError, t]);

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
                ToastNotifier.success(t('signup.successTitle'), t('signup.successMessage'));
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
                    className={`signup-card ${isRTL ? "rtl" : "ltr"}`}
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
                        <Title level={3} style={{ marginBottom: 0 }}>{t('signup.title')}</Title>
                        <Text type="secondary">{t('signup.subtitle')}</Text>
                    </div>
                    {loadingTypes ? (
                        <Spin tip={t('signup.loading')} style={{ width: "100%", margin: "32px 0" }} />
                    ) : (
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleSubmit}
                            disabled={authLoading}
                            size="large"
                            dir={direction}
                        >
                            <Form.Item
                                name="businessName"
                                label={t('signup.businessName')}
                                rules={[{ required: true, message: t('signup.businessNameRequired') }]}
                            >
                                <Input prefix={<ShopOutlined />} placeholder={t('signup.businessNamePlaceholder')} />
                            </Form.Item>
                            <Form.Item
                                name="fullName"
                                label={t('signup.ownerName')}
                                rules={[{ required: true, message: t('signup.ownerNameRequired') }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder={t('signup.ownerNamePlaceholder')} />
                            </Form.Item>
                            <Form.Item
                                name="email"
                                label={t('signup.email')}
                                rules={[
                                    { required: true, message: t('signup.emailRequired') },
                                    { type: 'email', message: t('signup.invalidEmail') },
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder={t('signup.emailPlaceholder')} autoComplete="email" />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                label={t('signup.password')}
                                rules={[{ required: true, message: t('signup.passwordRequired') }]}
                                hasFeedback
                            >
                                <Input.Password prefix={<LockOutlined />} placeholder={t('signup.passwordPlaceholder')} autoComplete="new-password" />
                            </Form.Item>
                            <Form.Item
                                name="businessType"
                                label={t('signup.businessType')}
                                rules={[{ required: true, message: t('signup.businessTypeRequired') }]}
                            >
                                <Select
                                    mode="tags"
                                    placeholder={t('signup.businessTypePlaceholder')}
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
                                label={t('signup.taxNumber')}
                                rules={[{ required: true, message: t('signup.taxNumberRequired') }]}
                            >
                                <Input prefix={<NumberOutlined />} placeholder={t('signup.taxNumberPlaceholder')} />
                            </Form.Item>
                            <Form.Item
                                name="subCategoryIds"
                                label={t('signup.subcategories')}
                                rules={[{ required: true, message: t('signup.subcategoriesRequired') }]}
                            >
                                <Select mode="tags" placeholder={t('signup.subcategoriesPlaceholder')}>
                                    {subcategories.map(sub => (
                                        <Option key={sub.id} value={sub.id}>{isRTL && sub.nameAr ? sub.nameAr : sub.nameEn}</Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item className="mb-0">
                                <Button type="primary" htmlType="submit" block loading={authLoading} size="large">
                                    {t('signup.submit')}
                                </Button>
                            </Form.Item>
                            <div style={{ textAlign: "center", marginTop: 24 }}>
                                <Text>
                                    {t('signup.haveAccount')}{' '}
                                    <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>
                                        {t('signup.login')}
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