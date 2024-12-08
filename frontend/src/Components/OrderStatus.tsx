import React, { useEffect, useState } from "react";
import { notification, Table, Button, Select, Spin, Alert } from "antd";
import axios from "axios";
import config from "../config";

const { Option } = Select;

interface OrderData {
  orderID: number;
  orderNotes?: string;
  client?: string;
  orderDate?: string;
  delivererName: string | null;
  status: string | null;
  modifyDate: string | null;
}

const OrderManagement: React.FC = () => {
  const [supervisedOrders, setSupervisedOrders] = useState<OrderData[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [currentOrderID, setCurrentOrderID] = useState<number | null>(null);
  const [currentDelivererName, setCurrentDelivererName] = useState<string | null>(null);

  const fetchOrderData = async () => {
    setLoading(true);
    try {
      const [supervisedResponse, deliveredResponse] = await Promise.all([
        axios.get(`${config.apiUrl}/orderSupervised`),
        axios.get(`${config.apiUrl}/orderDelivered`),
      ]);

      // Process supervised orders
      const formattedSupervisedOrders: OrderData[] = supervisedResponse.data.map((order: any[]) => ({
        orderID: order[0],
        orderNotes: order[1],
        client: order[2],
        orderDate: formatDate(order[3]),
        delivererName: order[4],
        status: order[5],
        modifyDate: order[6] ? formatDate(order[6]) : null,
      }));
      setSupervisedOrders(formattedSupervisedOrders);

      // Process delivered orders
      const formattedDeliveredOrders: OrderData[] = deliveredResponse.data.length > 0 ?
        deliveredResponse.data.map((order: any[]) => ({
          delivererName: order[0],
          orderID: order[1],
          status: order[2],
          modifyDate: order[3] ? formatDate(order[3]) : null,
        })) : []; // If no data, set to an empty array
      setDeliveredOrders(formattedDeliveredOrders);
    } catch (error: any) {
      notification.error({
        message: "Error Fetching Order Data",
        description: error.response?.data?.error || "An error occurred while fetching order data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { year: "2-digit", month: "2-digit", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleStatusChange = async () => {
    if (!selectedStatus || !currentOrderID || !currentDelivererName) {
      notification.error({
        message: "Error",
        description: "Please select a valid status and ensure the order data is complete.",
      });
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0].slice(2);

    try {
      await axios.post(`${config.apiUrl}/orderStatusUpdate`, {
        orderID: currentOrderID,
        delivererName: currentDelivererName,
        status: selectedStatus,
        modifyDate: formattedDate,
      });

      notification.success({
        message: "Status Updated",
        description: "Order status has been successfully updated.",
      });
      fetchOrderData();
    } catch (error: any) {
      notification.error({
        message: "Error Updating Status",
        description: error.response?.data?.error || "An error occurred while updating the status.",
      });
    }
  };

  useEffect(() => {
    fetchOrderData();
  }, []);

  const commonColumns = [
    { title: "Order ID", dataIndex: "orderID", key: "orderID" },
    { title: "Deliverer Name", dataIndex: "delivererName", key: "delivererName" },
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Modify Date", dataIndex: "modifyDate", key: "modifyDate" },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: OrderData) => {
        // Check if Deliverer Name, Status, and Modify Date are all null or empty
        const isActionDisabled = !record.delivererName || !record.status || !record.modifyDate;

        return isActionDisabled ? null : (
          <div>
            <Select
              style={{ width: 120, marginRight: 10 }}
              onChange={(value) => {
                setSelectedStatus(value);
                setCurrentOrderID(record.orderID);
                setCurrentDelivererName(record.delivererName);
              }}
              placeholder="Select status"
            >
              <Option value="Prepared">Prepared</Option>
              <Option value="Delivered">Delivered</Option>
              <Option value="Received">Received</Option>
            </Select>
            <Button type="primary" onClick={handleStatusChange}>
              Update Status
            </Button>
          </div>
        );
      },
    },
  ];

  const supervisedColumns = [
    ...commonColumns.slice(0, 2),
    { title: "Order Notes", dataIndex: "orderNotes", key: "orderNotes" },
    { title: "Client", dataIndex: "client", key: "client" },
    { title: "Order Date", dataIndex: "orderDate", key: "orderDate" },
    ...commonColumns.slice(2),
  ];

  return (
    <div className="order-management">
      <h2>Orders Delivered by User</h2>
      {loading ? (
        <Spin size="large" />
      ) : deliveredOrders.length === 0 ? (
        <Alert
          message="No Delivered Orders Found"
          description="No orders have been delivered by the user."
          type="info"
          showIcon
        />
      ) : (
        <Table
          columns={commonColumns}
          dataSource={deliveredOrders}
          rowKey={(record) => `${record.orderID}-${record.delivererName}`}
          pagination={false}
        />
      )}

      <h2>Orders Supervised by User</h2>
      {loading ? (
        <Spin size="large" />
      ) : supervisedOrders.length === 0 ? (
        <Alert
          message="No Supervised Orders Found"
          description="No orders are currently being supervised by the user."
          type="info"
          showIcon
        />
      ) : (
        <Table
          columns={supervisedColumns}
          dataSource={supervisedOrders}
          rowKey={(record) => `${record.orderID}-${record.delivererName}`}
          pagination={false}
        />
      )}
    </div>
  );
};

export default OrderManagement;
















