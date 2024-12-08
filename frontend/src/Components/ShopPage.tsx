import React, { useState, useEffect } from "react";
import { Button, Select, Table, notification, List, Spin, Image, Row, Col } from "antd";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config";
import e from "express";

interface Category {
  mainCategory: string;
  subCategory: string;
  catNotes: string;
}

interface Item {
  ItemID: number;
  iDescription: string;
  photo: string;
  color: string;
  isNew: boolean;
  material: string;
}

interface OrderInfo {
  orderID: string;
  orderDate: string;
  orderNotes: string;
  supervisor: string;
  client: string;
  submit: boolean;
}

const ShopPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  // OrderInfo
  useEffect(() => {
    const fetchOrderInfo = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${config.apiUrl}/orderInfo`, { orderID: orderId });
        setOrderInfo(response.data);
      } catch (error: any) {
        notification.error({
          message: "Fetch Error",
          description: error.response?.data?.error || "Error fetching order information",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [orderId]);

  // Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>(`${config.apiUrl}/categories`);
        setCategories(response.data);
      } catch (error: any) {
        notification.error({
          message: "Fetch Error",
          description: error.response?.data?.error || "Error fetching categories",
        });
      }
    };

    fetchCategories();
  }, []);

  
  const handleMainCategoryChange = async (mainCategory: string) => {
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory(null); // reset subcategory
    setLoading(true);
    try {
      const response = await axios.get<Item[]>(
        `${config.apiUrl}/items?mainCategory=${mainCategory}`
      );
      setFilteredItems(response.data); 
    } catch (error: any) {
      notification.error({
        message: "Fetch Error",
        description: error.response?.data?.error || "Error fetching items",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubCategoryChange = async (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    setLoading(true);
    try {
      const response = await axios.get<Item[]>(
        `${config.apiUrl}/items?mainCategory=${selectedMainCategory}&subCategory=${subCategory}`,
      );
      setFilteredItems(response.data); 
    } catch (error: any) {
      notification.error({
        message: "Fetch Error",
        description: error.response?.data?.error || "Error fetching items",
      });
    } finally {
      setLoading(false);
    }
  };

  // if not in order, add item to order
  const handleAddItemToOrder = (item: Item) => {
    if (!currentOrder.find((orderItem) => orderItem.ItemID === item.ItemID)) {
      setCurrentOrder((prevOrder) => [...prevOrder, item]);
    }
    else {
      notification.error({
        message: "Add Error",
        description: "Item already in order",
      });
    }
      // setFilteredItems((prevItems) => prevItems.filter((i) => i.ItemID !== item.ItemID)); // remove item from filtered list
  };

  const handleRemoveItemFromOrder = (itemId: number) => {
    const removedItem = currentOrder.find((item) => item.ItemID === itemId);
    if (removedItem) {
      setCurrentOrder((prevOrder) => prevOrder.filter((item) => item.ItemID !== itemId));
    }
  };

  
  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.apiUrl}/addItemsToOrder`, {
        orderID: orderId,
        items: currentOrder.map((item) => item.ItemID),
      });

      if (response.data.status === "success") {
        notification.success({ message: "Order submitted successfully!" });
        setOrderInfo((prev) => (prev ? { ...prev, submit: true } : null));
      } else {
        notification.error({
          message: "Some items were unavailable",
          description: `Unavailable Items: ${response.data.unavailable.join(", ")}`,
        });
      }
    } catch (error) {
      notification.error({
        message: "Error submitting order",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  // if (loading) return <Spin size="large" style={{ marginTop: 50 }} />; //loading spinner

  if (!orderInfo) return <p>Loading order info...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Order Details</h2>
      <Row gutter={16}>
        <Col span={8}>
          <p><strong>Order ID:</strong> {orderInfo.orderID}</p>
        </Col>
        <Col span={8}>
          <p><strong>Order Date:</strong> {orderInfo.orderDate}</p>
        </Col>
        <Col span={8}>
          <p><strong>Supervisor:</strong> {orderInfo.supervisor}</p>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={8}>
          <p><strong>Client:</strong> {orderInfo.client}</p>
        </Col>
        <Col span={16}>
          <p><strong>Order Notes:</strong> {orderInfo.orderNotes}</p>
        </Col>
      </Row>

      {orderInfo.submit ? (
        <>
          <p>Order has already been submitted on {orderInfo.orderDate}.</p>
          <Button type="primary" onClick={() => navigate("/findOrder")}>
            Find Order Items
          </Button>
          <Button type="default" onClick={() => navigate("/startOrder")}>
            Start New Order
          </Button>
        </>
      ) : (
        <>
          <h3>Select Categories</h3>
          <Select
            placeholder="Select Main Category"
            style={{ width: 200, marginRight: 10 }}
            onChange={handleMainCategoryChange}
          >
            {Array.from(new Set(categories.map((cat) => cat.mainCategory))).map((mainCategory) => (
              <Select.Option key={mainCategory} value={mainCategory}>
                {mainCategory}
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Select Sub Category"
            style={{ width: 300 }}
            onChange={handleSubCategoryChange}
            disabled={!selectedMainCategory}
          >
            {categories
              .filter((cat) => cat.mainCategory === selectedMainCategory)
              .map((category) => (
                <Select.Option key={category.subCategory} value={category.subCategory}>
                  {`${category.subCategory} (${category.catNotes})`}
                </Select.Option>
              ))}
          </Select>

          <Table
            columns={[
              { title: "Item ID", dataIndex: "ItemID", key: "ItemID" },
              { title: "Description", dataIndex: "iDescription", key: "iDescription" },
              { title: "Description", dataIndex: "iDescription", key: "iDescription" },
              { title: "Photo", dataIndex: "photo", key: "photo", render: (url) => <Image width={50} src={url} /> },// load image
              { title: "Color", dataIndex: "color", key: "color" },
              { title: "New", dataIndex: "isNew", key: "isNew", render: (isNew) => (isNew ? "Yes" : "No") },
              { title: "Material", dataIndex: "material", key: "material" },
              {
                title: "Action",
                key: "action",
                render: (_, item) => (
                  <Button type="primary" onClick={() => handleAddItemToOrder(item)}>
                    Add
                  </Button>
                ),
              },
            ]}
            dataSource={filteredItems}
            rowKey="ItemID"
            pagination={{ pageSize: 5 }}
          />

          <h3>Current Order</h3>
          <Table
            columns={[
              { title: "Item ID", dataIndex: "ItemID", key: "ItemID" },
              { title: "Description", dataIndex: "iDescription", key: "iDescription" },
              { title: "Photo", dataIndex: "photo", key: "photo", render: (url) => <Image width={50} src={url} /> }, // load image
              { title: "Color", dataIndex: "color", key: "color" },
              { title: "Material", dataIndex: "material", key: "material" },
              {
                title: "Action",
                key: "action",
                render: (_, item) => (
                  <Button type="link" danger onClick={() => handleRemoveItemFromOrder(item.ItemID)}>
                    Remove
                  </Button>
                ),
              },
            ]}
            dataSource={currentOrder}
            rowKey="ItemID"
            pagination={{ pageSize: 5 }}
          />

          <Button type="primary" onClick={handleSubmitOrder} disabled={currentOrder.length === 0}>
            Submit Order
          </Button>
        </>
      )}
    </div>
  );
};

export default ShopPage;
