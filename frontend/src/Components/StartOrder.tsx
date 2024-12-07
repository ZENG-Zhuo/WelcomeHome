import React, { useState } from "react";
import { Form, Input, Button, notification } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import config from "../config";

interface StartOrderResponse {
  orderID: string;
}

const StartOrder: React.FC = () => {
  const [clientUsername, setClientUsername] = useState("");
  const [orderNotes, setOrderNotes] = useState<string | undefined>(undefined);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        { username: clientUsername, notes: orderNotes },
        { withCredentials: true }
      );
      setOrderId(data.orderID);
      notification.success({ 
        message: "Order Created", 
        description: `Order ID: ${data.orderID}` 
      });

      await axios.post(`${config.apiUrl}/orderInfo`, {orderID: data.orderID}, {withCredentials: true}); // test
      
    } catch (error: any) {
      notification.error({
        message: "Order Creation Failed",
        description: error.response?.data?.error || "An error occurred while creating the order."
      });
    } finally {
      setLoading(false);
    }
  };

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
          <Form.Item label="Order Notes (Optional)">
            <Input.TextArea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Add any additional notes for the order"
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
