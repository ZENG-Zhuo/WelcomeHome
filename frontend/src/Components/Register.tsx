import React, { useState } from "react";
import { Form, Input, Button, notification } from "antd";
import axios from "axios";
import config from "../config"; // Import the config file

const Register = () => {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.apiUrl}/register`, {
        userName: values.userName,
        password: values.password,
        fname: values.fname,
        lname: values.lname,
        email: values.email,
      });
      notification.success({
        message: "Registration Success",
        description: response.data.message,
      });
    } catch (error: any) {
      notification.error({
        message: "Registration Failed",
        description: error.response?.data?.error || "An error occurred during registration",
      });
    }
    setLoading(false);
  };

  return (
    <div style={{ width: 400, margin: "auto", paddingTop: "50px" }}>
      <h2>Register</h2>
      <Form onFinish={handleRegister} layout="vertical">
        <Form.Item label="First Name" name="fname" rules={[{ required: true, message: "Please input your first name!" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Last Name" name="lname" rules={[{ required: true, message: "Please input your last name!" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please input your email!" }, { type: "email", message: "Please input a valid email!" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Username" name="userName" rules={[{ required: true, message: "Please input your username!" }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please input your password!" }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
