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
import { useTranslation } from 'react-i18next';

const SettingCard = ({ icon, title, description, to }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  return (
    <Link to={to} className="no-underline">
      <Card
        hoverable
        className="h-full transition-all duration-300 hover:shadow-md"
        style={{ padding: '24px' }}
      >
        <div className="flex items-start">
          <div className={`${isRTL ? 'ml-4' : 'mr-4'} p-3 rounded-lg`} style={{ background: 'rgba(0,0,0,0.03)' }}>
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
};

const SettingsPage = () => {
  const { t, i18n } = useTranslation('settings');
  const direction = i18n.dir();

  return (
    <div className="p-4 md:p-8 min-h-screen" dir={direction}>
      <PageHeader
        title={t('pageHeader.title')}
        subtitle={t('pageHeader.subtitle')}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12} lg={8}>
          <SettingCard
            icon={<LockOutlined style={{ fontSize: 24 }} />}
            title={t('cards.security.title')}
            description={t('cards.security.description')}
            to="/settings/security"
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <SettingCard
            icon={<ShopOutlined style={{ fontSize: 24 }} />}
            title={t('cards.storeSettings.title')}
            description={t('cards.storeSettings.description')}
            to="/vendor/manage-store"
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <SettingCard
            icon={<BellOutlined style={{ fontSize: 24 }} />}
            title={t('cards.notifications.title')}
            description={t('cards.notifications.description')}
            to="/settings/notifications"
          />
        </Col>

        <Col xs={24} md={12} lg={8}>
          <SettingCard
            icon={<GlobalOutlined style={{ fontSize: 24 }} />}
            title={t('cards.languageRegion.title')}
            description={t('cards.languageRegion.description')}
            to="/settings/region"
          />
        </Col>
      </Row>

      <div className="mt-8 p-4 rounded-lg border border-gray-100">
        <h3 className="text-lg font-medium mb-2">{t('help.title')}</h3>
        <p className="text-gray-600">
          {t('help.message')}
          <Link to="/help" className="font-medium"> {t('help.helpCenter')}</Link> {t('help.or')}
          <Link to="/contact" className="font-medium"> {t('help.contactSupport')}</Link>.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;