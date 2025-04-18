import { Form, Input, Button, Checkbox, Typography, Row, Col, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';

const { Text } = Typography;

const LoginPage = () => {
    const { t, i18n } = useTranslation('login');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);
    const [form] = Form.useForm();
    const location = useLocation();

    const direction = i18n.dir();
    const isRTL = direction === "rtl";

    const handleSubmit = async (values) => {
        try {
            // eslint-disable-next-line no-unused-vars
            const result = await dispatch(login({
                email: values.email,
                password: values.password
            })).unwrap();
            // On successful login, redirect to dashboard
            // navigate('/');
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            form.setFields([
                {
                    name: "password",
                    errors: [t("login.invalidCredentials")],
                },
            ]);
        }
    };

    return (
        <Row
            justify="center"
            align="middle"
            style={{
                minHeight: "100vh",
                padding: "16px",
            }}
        >
            <Col xs={22} sm={20} md={16} lg={10} xl={8}>
                <Card
                    bordered={false}
                    style={{
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        borderRadius: "8px",
                    }}
                    className={`login-card ${isRTL ? "rtl" : "ltr"}`}
                >
                    <img
                        src="/citio.svg"
                        alt="Citio Logo"
                        style={{
                            maxWidth: "180px",
                            marginBottom: "20px",
                            display: "block",
                            margin: "0 auto"
                        }}
                    />
                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={handleSubmit}
                        size="large"
                        dir={direction}
                    >
                        <Form.Item
                            name="email"
                            label={t("login.email")}
                            rules={[
                                {
                                    required: true,
                                    message: t("login.emailRequired"),
                                },
                                {
                                    type: "email",
                                    message: t("login.invalidEmail"),
                                },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder={t("login.email")}
                                autoComplete="email"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={t("login.password")}
                            rules={[
                                {
                                    required: true,
                                    message: t("login.passwordRequired"),
                                },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder={t("login.password")}
                                autoComplete="current-password"
                            />
                        </Form.Item>

                        {error && (
                            <Form.Item>
                                <Text type="danger">{t("login.invalidCredentials")}</Text>
                            </Form.Item>
                        )}

                        <Form.Item>
                            <Row justify="space-between" align="middle">
                                <Col>
                                    <Form.Item name="remember" valuePropName="checked" noStyle>
                                        <Checkbox>{t("login.rememberMe")}</Checkbox>
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Text
                                        className="forgot-password-link"
                                        style={{ cursor: "pointer" }}
                                        type="secondary"
                                    >
                                        {t("login.forgotPassword")}
                                    </Text>
                                </Col>
                            </Row>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                            >
                                {t("login.submit")}
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default LoginPage;