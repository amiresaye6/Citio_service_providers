import React from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import PageHeader from '../components/common/PageHeader';
import { useDispatch, useSelector } from 'react-redux';
import { updateVendorPassword } from '../redux/slices/vendorsSlice';

const SecuritySettingsPage = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const { updateLoading } = useSelector(state => state.vendors);

    // Handle password change
    const handlePasswordChange = (values) => {
        dispatch(updateVendorPassword({
            currentPassword: values.oldPassword,
            newPassword: values.newPassword
        }))
            .unwrap()
            .then(() => {
                message.success('Password changed successfully');
                form.resetFields();
            })
            .catch((error) => {
                // Display specific error messages from the API
                if (error?.errors?.length > 0) {
                    message.error(error.errors[1] || error.errors[0]);
                } else {
                    message.error('Failed to change password. Please try again.');
                }
            });
    };

    return (
        <div className="p-4 md:p-8 min-h-screen">
            <PageHeader
                title="Security Settings"
                subtitle="Manage your account security"
            />

            <div className="max-w-2xl mx-auto">
                <Card 
                    className="shadow-md rounded-lg"
                    title={<div className="text-lg font-medium">Change Password</div>}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handlePasswordChange}
                        className="max-w-md mx-auto"
                    >
                        <Form.Item
                            name="oldPassword"
                            label="Current Password"
                            rules={[{ required: true, message: 'Please enter your current password' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder="Current password"
                                iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="newPassword"
                            label="New Password"
                            rules={[
                                { required: true, message: 'Please enter your new password' },
                                { min: 6, message: 'Password must be at least 6 characters' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder="New password"
                                iconRender={visible => visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm New Password"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Please confirm your new password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject('The two passwords do not match!');
                                    },
                                }),
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="site-form-item-icon" />}
                                placeholder="Confirm new password"
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
                                Change Password
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
                
                <div className="mt-8">
                    <Card 
                        className="shadow-md rounded-lg"
                        title={<div className="text-lg font-medium">Account Security Tips</div>}
                    >
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Use a strong, unique password that combines letters, numbers, and special characters.</li>
                            <li>Change your password regularly for enhanced security.</li>
                            <li>Never share your password with anyone, including support staff.</li>
                            <li>Be cautious of phishing attempts requesting your login credentials.</li>
                            <li>Sign out from your account when using shared or public computers.</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettingsPage;