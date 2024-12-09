import React, { useState } from "react";
import { Form, Input, Button, List, Typography, message, notification } from "antd";
import axios from "axios";
import config from "../config";

const { Title } = Typography;

// Define interfaces for the piece and item locations
interface Piece {
  pieceNum: number;
  description: string; // Add description
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
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
    setItemLocations({});
    try {
      const response = await axios.post(`${config.apiUrl}/find_order_items`, {
        orderID: values.orderID,
      },
        {
          withCredentials: true,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      setItemLocations(response.data);
    } catch (error: any) {
      notification.error({ 
        message: "Failed to find items",
        description: error.response?.data?.error|| error.response.data.message || error.message
      });
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
                    <div>
                      Piece {piece.pieceNum}: {piece.location} <br />
                      Description: {piece.description} <br />
                      Dimensions: {piece.dimensions.length} x {piece.dimensions.width} x {piece.dimensions.height}
                    </div>
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