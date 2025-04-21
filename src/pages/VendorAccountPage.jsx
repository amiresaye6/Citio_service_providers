import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Switch } from 'antd';
import PageHeader from '../components/common/PageHeader';
import UserCard from '../components/common/UserCard';
import ToastNotifier from '../components/common/ToastNotifier';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VendorAccountPage = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Fake vendor data (replace with API call in a real app)
  const fakeVendor = {
    name: 'Acme Corp',
    email: 'contact@acme.com',
    status: 'active',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
  };

  // Simulate fetching vendor account data
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setVendor(fakeVendor);
      emailForm.setFieldsValue({ email: fakeVendor.email });
      setLoading(false);
      ToastNotifier.success('Account Loaded', 'Vendor account details fetched successfully.');
    }, 1000);
  }, [emailForm]);

  // Handle email update
  const handleUpdateEmail = (values) => {
    setLoading(true);
    setTimeout(() => {
      setVendor({ ...vendor, email: values.email });
      setLoading(false);
      ToastNotifier.success('Email Updated', 'Contact email updated successfully.');
    }, 1000);
  };

  // Handle password change
  const handleChangePassword = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      ToastNotifier.success('Password Changed', 'Password updated successfully.');
      passwordForm.resetFields();
    }, 1000);
  };

  // Handle two-factor authentication toggle
  const handleTwoFactorToggle = (checked) => {
    setLoading(true);
    setTimeout(() => {
      setTwoFactorEnabled(checked);
      setLoading(false);
      ToastNotifier.success(
        'Security Updated',
        `Two-factor authentication ${checked ? 'enabled' : 'disabled'}.`
      );
    }, 1000);
  };

  if (loading && !vendor) {
    return <LoadingSpinner text="Loading account details..." />;
  }

  return (
    <div className="p-6 min-h-screen">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your account and security settings"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Info */}
        <div className="lg:col-span-1">
          <UserCard
            name={vendor?.name}
            email={vendor?.email}
            status={vendor?.status}
            avatarUrl={vendor?.avatarUrl}
          />
        </div>

        {/* Account Settings Forms */}
        <div className="lg:col-span-2">
          {/* Update Email Form */}
          <Card title="Update Contact Email" className="shadow mb-4">
            <Form
              form={emailForm}
              layout="vertical"
              onFinish={handleUpdateEmail}
            >
              <Form.Item
                name="email"
                label="Contact Email"
                rules={[
                  { required: true, message: 'Please enter contact email' },
                  { type: 'email', message: 'Please enter a valid email' },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Email
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Change Password Form */}
          <Card title="Change Password" className="shadow mb-4">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please enter current password' }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[{ required: true, message: 'Please enter new password' }]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm new password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Change Password
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* Security Settings */}
          <Card title="Security Settings" className="shadow">
            <Form layout="vertical">
              <Form.Item label="Two-Factor Authentication">
                <Switch
                  checked={twoFactorEnabled}
                  onChange={handleTwoFactorToggle}
                  disabled={loading}
                />
                <span className="ml-2">
                  {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VendorAccountPage;