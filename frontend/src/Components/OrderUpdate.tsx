import React, { useState } from "react";
import { Form, Input, Button, Table, Select, message } from "antd";
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
      await axios.post(`${config.apiUrl}/orders/update_location`, {
        orderID: selectedOrderID, // Use the selected order ID
      });
      message.success("Items updated successfully!");
    } catch (error) {
      console.log(error)
      message.error("Failed to update item locations.");
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