import React, { useEffect, useState } from "react";
import { Table, message, Spin } from "antd";
import axios from "axios";
import config from "../config";

interface Order {
  orderID: number;
  orderDate: string;
  orderNotes: string;
  supervisor?: string;
  deliverer?: string; // Added deliverer field
  status?: string;
  date?: string;
}

const UserOrders: React.FC = () => {
  const [clientOrders, setClientOrders] = useState<Order[]>([]);
  const [supervisedOrders, setSupervisedOrders] = useState<Order[]>([]);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}/user/orders`); // Adjust the API endpoint if necessary
        const { client_orders, supervised_orders, delivered_orders } =
          response.data;

        // Transforming the client_orders data
        const transformedClientOrders = client_orders.map((order: any[]) => ({
          orderID: order[0],
          orderDate: order[1],
          orderNotes: order[2],
          supervisor: order[3],
          deliverer: order[4] || undefined,
          status: order[5] || undefined,
          date: order[6] || undefined,
        }));

        const transformedSupervisedOrders = supervised_orders.map(
          (order: any[]) => ({
            orderID: order[0],
            orderDate: order[1],
            orderNotes: order[2],
            supervisor: order[3],
            deliverer: order[4] || undefined,
            status: order[5] || undefined,
            date: order[6] || undefined,
          })
        );

        const transformedDeliveredOrders = delivered_orders.map(
          (order: any[]) => ({
            orderID: order[0],
            orderDate: order[1],
            orderNotes: order[2],
            supervisor: order[3],
            deliverer: order[4] || undefined,
            status: order[5] || undefined,
            date: order[6] || undefined,
          })
        );

        setClientOrders(transformedClientOrders);
        setSupervisedOrders(transformedSupervisedOrders);
        setDeliveredOrders(transformedDeliveredOrders);
      } catch (error) {
        message.error("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const columns = [
    {
      title: "Order ID",
      dataIndex: "orderID",
      key: "orderID",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
    },
    {
      title: "Order Notes",
      dataIndex: "orderNotes",
      key: "orderNotes",
    },
    {
      title: "Supervisor",
      dataIndex: "supervisor",
      key: "supervisor",
    },
    {
      title: "Deliverer", // Updated column title
      dataIndex: "deliverer", // Updated dataIndex
      key: "deliverer", // Updated key
    },
    {
      title: "Delivery Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Delivery Date",
      dataIndex: "date",
      key: "date",
    },
  ];

  return (
    <div>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <h2>Client Orders</h2>
          <Table
            dataSource={clientOrders}
            columns={columns}
            rowKey="orderID"
            pagination={false}
          />

          <h2>Supervised Orders</h2>
          <Table
            dataSource={supervisedOrders}
            columns={columns}
            rowKey="orderID"
            pagination={false}
          />

          <h2>Delivered Orders</h2>
          <Table
            dataSource={deliveredOrders}
            columns={columns}
            rowKey="orderID"
            pagination={false}
          />
        </>
      )}
    </div>
  );
};

export default UserOrders;
