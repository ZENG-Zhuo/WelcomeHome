// src/components/FindOrderItems.tsx

import React, { useState } from "react";
import { Form, Input, Button, List, Typography, message } from "antd";
import axios from "axios";

const { Title } = Typography;

// Define interfaces for the piece and item locations
interface Piece {
  pieceNum: number;
  location: string;
}

interface ItemLocation {
  description: string;
  pieces: Piece[];
}

interface ItemLocations {
  [itemID: string]: ItemLocation;
}

const FindOrderItems: React.FC = () => {
  const [orderID, setOrderID] = useState<string>("");
  const [itemLocations, setItemLocations] = useState<ItemLocations>({});

  const handleSubmit = async (values: any) => {
    try {
      const response = await axios.post("/find_order_items", {
        orderID: values.orderID,
      });
      setItemLocations(response.data);
    } catch (error) {
      message.error("Error fetching items. Please check the order ID.");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2}>Find Order Items</Title>
      <Form layout="inline" onFinish={handleSubmit}>
        <Form.Item
          name="orderID"
          rules={[{ required: true, message: "Please input the order ID!" }]}
        >
          <Input
            placeholder="Enter Order ID"
            value={orderID}
            onChange={(e) => setOrderID(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Find Items
          </Button>
        </Form.Item>
      </Form>

      {Object.keys(itemLocations).length > 0 && (
        <List
          header={<div>Items in Order</div>}
          bordered
          dataSource={Object.entries(itemLocations).map(
            ([itemID, details]) => ({
              itemID,
              ...details,
            })
          )}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text strong>{item.description}</Typography.Text>
              <List
                size="small"
                bordered
                dataSource={item.pieces}
                renderItem={(piece) => (
                  <List.Item>
                    Piece {piece.pieceNum}: {piece.location}
                  </List.Item>
                )}
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default FindOrderItems;
