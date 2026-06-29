import { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { signIn } from 'aws-amplify/auth';

interface Props {
  onSuccess: () => void;
}

export default function LoginPage({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      await signIn({ username: values.username, password: values.password });
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-yimby-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-yimby-500 text-white text-2xl mb-4 shadow-md">
            🏗
          </div>
          <h1 className="text-2xl font-bold text-yimby-800 tracking-tight">YIMBY Tracker</h1>
          <p className="text-sm text-yimby-600 mt-1">Housing policy intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-yimby-100 p-8">
          <h2 className="text-base font-semibold text-gray-700 mb-6">Sign in to your account</h2>

          {error && (
            <Alert type="error" message={error} className="mb-5" showIcon />
          )}

          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              label={<span className="text-sm font-medium text-gray-600">Username</span>}
              name="username"
              rules={[{ required: true, message: 'Please enter your username' }]}
            >
              <Input
                size="large"
                placeholder="your.username"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-sm font-medium text-gray-600">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                size="large"
                placeholder="••••••••"
                className="rounded-lg"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className="rounded-lg mt-2 h-11 font-semibold"
            >
              Sign in
            </Button>
          </Form>
        </div>

        <p className="text-center text-xs text-yimby-400 mt-6">
          YIMBY Tracker · Housing Policy Intelligence
        </p>
      </div>
    </div>
  );
}