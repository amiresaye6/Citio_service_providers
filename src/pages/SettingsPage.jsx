import React from 'react';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import {
  LockOutlined,
  UserOutlined,
  BellOutlined,
  CreditCardOutlined,
  ShopOutlined,
  SettingOutlined,
  GlobalOutlined,
  TeamOutlined
} from '@ant-design/icons';

const SettingCard = ({ icon, title, description, to }) => (
  <Link to={to} className="no-underline">
    <Card
      hoverable
      className="h-full transition-all duration-300 hover:shadow-md"
      style={{ padding: '24px' }}
    >
      <div className="flex items-start">
        <div className="mr-4 p-3 rounded-lg" style={{ background: 'rgba(0,0,0,0.03)' }}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-gray-500 m-0">{description}</p>
        </div>
      </div>
    </Card>
  </Link>
);

const SettingsPage = () => {
  return (
    <div className="p-4 md:p-8 min-h-screen">
      <PageHeader
        title="Settings"
        subtitle="Manage your account preferences and store settings"
      />

      <Row gutter={[24, 24]}>

        <Col xs={24} md={12} lg={8}>
          <SettingCard
            icon={<LockOutlined style={{ fontSize: 24 }} />}
            title="Security"
            description="Change your password and manage account security settings"
            to="/settings/security"
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <SettingCard
            icon={<ShopOutlined style={{ fontSize: 24 }} />}
            title="Store Settings"
            description="Configure your store appearance, hours, and policies"
            to="/vendor/manage-store"
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <SettingCard
            icon={<BellOutlined style={{ fontSize: 24 }} />}
            title="Notifications"
            description="Customize email and in-app notification preferences"
            to="/settings/notifications"
          />
        </Col>



        <Col xs={24} md={12} lg={8}>
          <SettingCard
            icon={<GlobalOutlined style={{ fontSize: 24 }} />}
            title="Language & Region"
            description="Set your preferred language and regional preferences"
            to="/settings/region"
          />
        </Col>

      </Row>

      <div className="mt-8 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-2">Need Help?</h3>
        <p className="text-gray-600">
          If you need assistance with your settings or have questions about your account,
          visit our <Link to="/help" className="font-medium">Help Center</Link> or
          <Link to="/contact" className="font-medium"> contact support</Link>.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;