import React, { useState } from "react";
import { Button, Input, Table, notification, Spin, Form } from "antd";
import axios from "axios";
import config from "../config";

// TypeScript interfaces for ItemLocation response
interface ItemLocation {
  roomNum: number;
  shelfNum: number;
}

interface ItemLocationResponse {
  ItemID: number;
  locations: ItemLocation[];
}

const FindItemLocations: React.FC = () => {
  const [itemID, setItemID] = useState<number | undefined>(undefined);
  const [locations, setLocations] = useState<ItemLocation[]>([]);
  const [loading, setLoading] = useState(false);

  const handleItemIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setItemID(Number(e.target.value));
  };

  const fetchItemLocations = async () => {
    if (!itemID) {
      notification.error({
        message: "ItemID is required",
        description: "Please provide an ItemID to find the locations.",
      });
      return;
    }
    setLocations([]);
    setLoading(true);
    try {
      const response = await axios.post<ItemLocationResponse>(
        `${config.apiUrl}/find_item_locations`,
        { ItemID: itemID }
      );

      if (response.data.locations.length > 0) {
        setLocations(response.data.locations.map((arr: any) => {
          if (Array.isArray(arr) && arr.length === 2) {
            const [roomNum, shelfNum] = arr;
        
            // Validate that both roomNum and shelfNum are numbers
            if (typeof roomNum === 'number' && typeof shelfNum === 'number') {
              return { roomNum, shelfNum };
            }
          }
          // Return default location if validation fails
          return { roomNum: 0, shelfNum: 0 };
        }));
        console.log(locations);
      } else {
        notification.info({
          message: "No pieces found",
          description: "No locations found for the given ItemID.",
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        notification.info({
          message: "No item found",
          description:
            error.response?.data?.message ||
            "No item found for the given ItemID.",
        });
      } else {
        notification.error({
          message: "Error",
          description: "An error occurred while fetching the locations.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Room Number",
      dataIndex: "roomNum",
      key: "roomNum",
    },
    {
      title: "Shelf Number",
      dataIndex: "shelfNum",
      key: "shelfNum",
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <h2>Find Item Locations</h2>

      <Form layout="inline">
        <Form.Item label="Item ID">
          <Input
            type="number"
            value={itemID}
            onChange={handleItemIDChange}
            placeholder="Enter Item ID"
            style={{ width: 200 }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={fetchItemLocations} loading={loading}>
            Find Locations
          </Button>
        </Form.Item>
      </Form>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          columns={columns}
          dataSource={locations?locations:locations}
          rowKey={(record, index) =>
            `${record.roomNum}-${record.shelfNum}-${index}`
          }
          pagination={false}
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  );
};

export default FindItemLocations;
