import { Form, Input, Button, Checkbox, Typography, Row, Col, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { useLocation, useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

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
            const result = await dispatch(login({
                email: values.email,
                password: values.password
            })).unwrap();
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
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
                background: "linear-gradient(135deg, #f0f3ff 0%, #d5e6fb 100%)",
            }}
        >
            <Col xs={24} sm={16} md={12} lg={8}>
                <Card
                    bordered={false}
                    style={{
                        boxShadow: "0 6px 32px 0 rgba(0, 72, 255, 0.07)",
                        borderRadius: "16px",
                        padding: "32px 4vw 40px 4vw",
                        background: "#fff",
                    }}
                    className={`login-card ${isRTL ? "rtl" : "ltr"}`}
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
                        <Title level={3} style={{ marginBottom: 0 }}>{t("login.title") || "Welcome Back"}</Title>
                        <Text type="secondary">{t("login.subtitle") || "Please log in to your account"}</Text>
                    </div>
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
                                size="large"
                                style={{ borderRadius: 8 }}
                            >
                                {t("login.submit")}
                            </Button>
                        </Form.Item>
                        <div style={{ textAlign: "center", marginTop: 24 }}>
                            <Text>
                                {t("login.noAccount") || "Don't have an account?"}{' '}
                                <Button type="link" onClick={() => navigate('/signup')} style={{ padding: 0 }}>
                                    {t("login.signup") || "Register as Vendor"}
                                </Button>
                            </Text>
                        </div>
                    </Form>
                </Card>
            </Col>
        </Row>
    );
};

export default LoginPage;