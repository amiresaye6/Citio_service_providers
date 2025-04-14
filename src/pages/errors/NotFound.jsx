import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import 'antd/dist/reset.css'; // Import antd styles (or include in main.jsx)

function NotFound() {
  const navigate = useNavigate();

  return (
    <Result
      status="info"
      title="Not Implemented Yet"
      subTitle="This feature is still under development. Check back soon!"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      }
    />
  );
}

export default NotFound;