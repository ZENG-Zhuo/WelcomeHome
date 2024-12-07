import React, { useState, useEffect, useRef } from "react";
import { Form, Input, Button, notification, Spin } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";

interface StartOrderResponse {
  orderID: string;
}

const StartOrder: React.FC = () => {
  const [clientUsername, setClientUsername] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  const notificationShown = useRef(false); // Avoid showing multiple notifications
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        await axios.get(`${config.apiUrl}/check_role`, { withCredentials: true });
        setIsAuthorized(true);
      } catch (error: any) {
        setIsAuthorized(false);
        // Show notification only once
        if (!notificationShown.current) {
          notification.error({
            message: "Authentication failed.",
            description: error.response?.data?.error || "Unable to verify user role.",
          });
          notificationShown.current = true;
        }
      }
    };

    checkUserRole();
  }, []);

  const handleStartOrder = async () => {
    if (!clientUsername.trim()) {
      notification.error({ 
        message: "Client Username Required", 
        description: "Please enter the client's username." 
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post<StartOrderResponse>(
        `${config.apiUrl}/createOrder`,
        { username: clientUsername },
        { withCredentials: true }
      );
      setOrderId(data.orderID);
      notification.success({ 
        message: "Order Created", 
        description: `Order ID: ${data.orderID}` 
      });
    } catch (error: any) {
      notification.error({
        message: "Order Creation Failed",
        description: error.response?.data?.error || "An error occurred while creating the order."
      });
    } finally {
      setLoading(false);
    }
  };


  if (isAuthorized === null) {
    return (
      <Spin 
        size="large" 
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh" 
        }} 
      />
    );
  }

  // 未授权处理
  if (!isAuthorized) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <h2>Unauthorized Access</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Start an Order</h2>
      {!orderId ? (
        <Form layout="vertical" style={{ maxWidth: 400 }}>
          <Form.Item label="Client Username" required>
            <Input
              value={clientUsername}
              onChange={(e) => setClientUsername(e.target.value)}
              placeholder="Enter Client Username"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              onClick={handleStartOrder}
              loading={loading}
              style={{ width: "100%" }}
            >
              Start Order
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <p>
            Order successfully created for <strong>{clientUsername}</strong>
          </p>
          <p>
            <strong>Order ID:</strong> {orderId}
          </p>
          <Button 
            type="primary" 
            onClick={() => navigate(`/shop/${orderId}`)} 
            style={{ width: "100%" }}
          >
            Add Items to Order
          </Button>
        </div>
      )}
    </div>
  );
};

export default StartOrder;