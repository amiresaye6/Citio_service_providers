import { useState, useEffect } from 'react';
import { Card, Spin, Alert } from 'antd';
import { ShoppingCartOutlined, DollarOutlined, UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useSelector } from 'react-redux';

const TodayStatsCard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = useSelector(state => state.auth.token); // Get token from Redux store

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://service-provider.runasp.net/api/Admin/today-stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load statistics');
        console.error('Error fetching today stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" tip="Loading statistics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  const cardStyle = {
    flex: 1,
    margin: '0 8px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      <Card
        style={cardStyle}
        className="mb-4 md:mb-0"
        title={
          <div className="flex items-center">
            <ShoppingCartOutlined className="mr-2 text-blue-500" style={{ fontSize: '24px' }} />
            <span>Orders</span>
          </div>
        }
      >
        <p className="text-2xl font-bold">{stats?.orders || 0}</p>
      </Card>

      <Card
        style={cardStyle}
        className="mb-4 md:mb-0"
        title={
          <div className="flex items-center">
            <DollarOutlined className="mr-2 text-green-500" style={{ fontSize: '24px' }} />
            <span>Revenue</span>
          </div>
        }
      >
        <p className="text-2xl font-bold">${stats?.revenue?.toFixed(2) || '0.00'}</p>
      </Card>

      <Card
        style={cardStyle}
        title={
          <div className="flex items-center">
            <UserAddOutlined className="mr-2 text-purple-500" style={{ fontSize: '24px' }} />
            <span>New Users</span>
          </div>
        }
      >
        <p className="text-2xl font-bold">{stats?.newUsers || 0}</p>
      </Card>
    </div>
  );
};

export default TodayStatsCard;