import React, { useState } from "react";
import { Button, Input, Table, notification, Spin, Form } from "antd";
import axios from "axios";
import config from "../config";

// TypeScript interfaces for ItemLocation response
interface PieceLocation {
  pieceNum: number;
  description: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  roomNum: number;
  shelfNum: number;
  notes: string;
}

interface ItemLocationResponse {
  ItemID: number;
  locations: PieceLocation[];
}

const FindItemLocations: React.FC = () => {
  const [itemID, setItemID] = useState<number | undefined>(undefined);
  const [locations, setLocations] = useState<PieceLocation[]>([]);
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
        { ItemID: itemID },
        {
          withCredentials: true,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.locations.length > 0) {
        setLocations(response.data.locations);
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
      title: "Piece Number",
      dataIndex: "pieceNum",
      key: "pieceNum",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    // {
    //   title: "Dimensions (L x W x H)",
    //   render: (text: any, record: PieceLocation) => (
    //     <span>{`${record.dimensions.length} x ${record.dimensions.width} x ${record.dimensions.height}`}</span>
    //   ),
    //   key: "dimensions",
    // },
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
    // {
    //   title: "Notes",
    //   dataIndex: "notes",
    //   key: "notes",
    // },
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
          dataSource={locations}
          rowKey={(record) =>
            `${record.pieceNum}-${record.roomNum}-${record.shelfNum}`
          }
          pagination={false}
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  );
};

export default FindItemLocations;
