import React, { useState, useEffect } from "react";
import { Form, Input, Button, notification, Select } from "antd";
import axios from "axios";
import config from "../config"; // Import the config file
import { useNavigate } from "react-router-dom";

const { Option } = Select;

// Define the Role interface
interface Role {
  roleID: string;
  description: string;
}

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]); // State for roles
  const [phones, setPhones] = useState([""]); // Initialize with one empty phone input
  const [roleID, setRoleID] = useState(null); // State for role ID
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.post(`${config.apiUrl}/roles`);
        setRoles(response.data);
      } catch (error : any) {
        notification.error({
          message: "Error Fetching Roles",
          description: error.response?.data?.error || "An error occurred while fetching roles.",
        });
      }
    };

    fetchRoles();
  }, []); // Run once when the component mounts

  const handlePhoneChange = (index: number, value: string): void => {
    const newPhones = [...phones];
    newPhones[index] = value;
    setPhones(newPhones);
  };

  const addPhoneInput = () => {
    setPhones([...phones, ""]); // Add a new empty phone input
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${config.apiUrl}/register`, {
        userName: values.userName,
        password: values.password,
        fname: values.fname,
        lname: values.lname,
        email: values.email,
        phones, // Include the array of phone numbers
        roleID, // Include the selected role ID
      });
      notification.success({
        message: "Registration Success",
        description: response.data.message,
      });
      navigate("/login");
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
        <Form.Item label="Phone Numbers">
          {phones.map((phone, index) => (
            <Input
              key={index}
              value={phone}
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              placeholder={`Phone Number ${index + 1}`}
              style={{ marginBottom: 10 }}
            />
          ))}
          <Button type="dashed" onClick={addPhoneInput} style={{ width: "100%" }}>
            Add Phone Number
          </Button>
        </Form.Item>
        <Form.Item label="Role">
          <Select
            placeholder="Select a role"
            onChange={(value) => setRoleID(value)}
            allowClear
          >
            {roles.map(role => (
              <Option key={role.roleID} value={role.roleID}>
                {role.description}
              </Option>
            ))}
          </Select>
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