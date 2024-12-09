import React, { useState } from "react";
import { Form, Input, Button, Table, Select, message, notification } from "antd";
import axios from "axios";
import config from "../config";

const { Option } = Select;

const OrderUpdate: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [clientUsername, setClientUsername] = useState<string>("");
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrderID, setSelectedOrderID] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<
    { ItemID: number; roomNum: number; shelfNum: number }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);

  const searchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.apiUrl}/orders/search`, {
        params: {
          order_number: orderNumber,
          client_username: clientUsername,
        },
      });
      setOrders(response.data);
      message.success("Orders fetched successfully!");
    } catch (error) {
      message.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    setLoading(true);
    try {
      if (!selectedOrderID) {
        message.error("Please select an order first");
        return;
      } 
      const result = await axios.get(`${config.apiUrl}/orders/check_order_status?orderID=${selectedOrderID}`);
      if (result.data.status==="delivered") {
        notification.error({
          message: "Duplicate request",
          description: "Order has already been prepared",
        });
        return;
      }

      await axios.post(`${config.apiUrl}/orders/update_location`, {
        orderID: selectedOrderID, // Use the selected order ID
      });
      message.success("Items updated successfully!");
      setSelectedOrderID(undefined); // Clear the selected order ID

      const response = await axios.post(`${config.apiUrl}/orders/add_delivery`, {
        orderID: selectedOrderID,
      });
      notification.success({
        message: "Ready for delivery",
        description: `Assign to: ${response.data.delivery_person}`,
      });
    } catch (error: any) {
      notification.error({
        message: "Failed to prepare order",
        description: error.response?.data?.error || error.response.data.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Order ID", dataIndex: "orderID", key: "orderID" },
    { title: "Client", dataIndex: "client", key: "client" },
    { title: "Order Date", dataIndex: "orderDate", key: "orderDate" },
  ];

  return (
    <div>
      <Form layout="inline" style={{ marginBottom: 20 }}>
        <Form.Item label="Order Number">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Client Username">
          <Input
            value={clientUsername}
            onChange={(e) => setClientUsername(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={searchOrders} loading={loading}>
            Search Orders
          </Button>
        </Form.Item>
      </Form>

      <Table dataSource={orders} columns={columns} rowKey="orderID" />

      <Form layout="vertical">
        <Form.Item label="Select Order">
          <Select
            value={selectedOrderID}
            onChange={setSelectedOrderID}
            placeholder="Select an order"
            style={{ width: 200 }}
          >
            {orders.map(order => (
              <Option key={order.orderID} value={order.orderID}>
                {order.orderID}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={updateLocation} loading={loading}>
            Update Location
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OrderUpdate;