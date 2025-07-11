import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { updateVendorPassword } from '../redux/slices/vendorsSlice';
import { useTranslation } from 'react-i18next';

const SecuritySettingsPage = () => {
    const { t, i18n } = useTranslation('security');
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { updateLoading } = useSelector(state => state.vendors);
    const direction = i18n.dir();

    // Handle password change
    const handlePasswordChange = (values) => {
        dispatch(updateVendorPassword({
            currentPassword: values.oldPassword,
            newPassword: values.newPassword
        }))
            .unwrap()
            .then(() => {
                message.success(t('notifications.passwordChanged'));
                form.resetFields();
            })
            .catch((error) => {
                // Display specific error messages from the API
                if (error?.errors?.length > 0) {
                    message.error(error.errors[1] || error.errors[0]);
                } else {
                    message.error(t('errors.changePasswordFailed'));
                }
            });
    };

    return (
        <div className="p-4 md:p-8 min-h-screen" dir={direction}>
            <PageHeader
                title={t('pageHeader.title')}
                subtitle={t('pageHeader.subtitle')}
            />

            <div className="max-w-2xl mx-auto">
                <Card 
                    className="shadow-md rounded-lg"
                    title={<div className="text-lg font-medium">{t('changePassword.title')}</div>}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                        className="max-w-md mx-auto"
                    >
                        <Form.Item
                            name="oldPassword"
                            label={t('changePassword.currentPassword')}
                            rules={[{ required: true, message: t('validation.currentPasswordRequired') }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder={t('placeholders.currentPassword')}
                                iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            label={t('changePassword.newPassword')}
                            rules={[
                                { required: true, message: t('validation.newPasswordRequired') },
                                { min: 6, message: t('validation.passwordMinLength') }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder={t('placeholders.newPassword')}
                                iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            label={t('changePassword.confirmPassword')}
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: t('validation.confirmPasswordRequired') },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(t('validation.passwordsDoNotMatch'));
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder={t('placeholders.confirmPassword')}
                                iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            />
                        </Form.Item>

                        <Form.Item className="mt-6">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={updateLoading}
                                block
                            >
                                {t('buttons.changePassword')}
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
                
                <div className="mt-8">
                    <Card 
                        className="shadow-md rounded-lg"
                        title={<div className="text-lg font-medium">{t('securityTips.title')}</div>}
                    >
                        <ul className="list-disc pl-5 space-y-2">
                            <li>{t('securityTips.strongPassword')}</li>
                            <li>{t('securityTips.changeRegularly')}</li>
                            <li>{t('securityTips.neverShare')}</li>
                            <li>{t('securityTips.phishing')}</li>
                            <li>{t('securityTips.signOut')}</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettingsPage;