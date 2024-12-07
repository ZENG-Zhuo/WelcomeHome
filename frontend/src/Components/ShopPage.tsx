import React, { useState, useEffect } from "react";
import { Button, Select, Table, notification, List, Spin } from "antd";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import config from "../config";

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

interface CurrentOrderItem {
  ItemID: number;
  iDescription: string;
}

interface OrderInfo {
  orderID: string;
  submit: boolean;
  orderDate: string;
  [key: string]: any; // in case there are other keys returned from API
}

const ShopPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [currentOrder, setCurrentOrder] = useState<CurrentOrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrderInfo = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${config.apiUrl}/orderInfo`, { orderID: orderId });
        setOrderInfo(response.data);
      } catch (error) {
        notification.error({
          message: "Error fetching order info",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderInfo();
  }, [orderId]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>(`${config.apiUrl}/categories`);
        setCategories(response.data);
      } catch (error) {
        notification.error({
          message: "Error fetching categories",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
      }
    };

    fetchCategories();
  }, []);

  const handleSubCategoryChange = async (subCategory: string) => {
    setSelectedSubCategory(subCategory);
    setLoading(true);
    try {
      const response = await axios.get<Item[]>(
        `${config.apiUrl}/items?mainCategory=${selectedMainCategory}&subCategory=${subCategory}`
      );
      setItems(response.data);
    } catch (error) {
      notification.error({
        message: "Error fetching items",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemToOrder = (item: Item) => {
    setCurrentOrder((prevOrder) => [...prevOrder, { ItemID: item.ItemID, iDescription: item.iDescription }]);
    setItems((prevItems) => prevItems.filter((i) => i.ItemID !== item.ItemID));
  };

  const handleRemoveItemFromOrder = (itemId: number) => {
    setCurrentOrder((prevOrder) => prevOrder.filter((item) => item.ItemID !== itemId));
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

  const handleMainCategoryChange = (mainCategory: string) => {
    setSelectedMainCategory(mainCategory);
    setSelectedSubCategory(null);
    setItems([]); // clear items
  };

  if (loading) return <Spin size="large" style={{ marginTop: 50 }} />;

  if (!orderInfo) return <p>Loading order info...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Order #{orderInfo.orderID}</h2>

      {orderInfo.submit ? (
        <>
          <p>Order has already been submitted on {orderInfo.orderDate}.</p>
          <Button type="primary" onClick={() => navigate("/findorder")}>
            Find Another Order
          </Button>
          <Button type="default" onClick={() => navigate("/shop/new")}>
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
            style={{ width: 200 }}
            onChange={handleSubCategoryChange}
            disabled={!selectedMainCategory}
          >
            {categories
              .filter((cat) => cat.mainCategory === selectedMainCategory)
              .map((category, index) => (
                <Select.Option key={index} value={category.subCategory}>
                  {`${category.subCategory} (${category.catNotes})`}
                </Select.Option>
              ))}
          </Select>

          <Table
            columns={[
              { title: "Description", dataIndex: "iDescription", key: "iDescription" },
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
            dataSource={items}
            rowKey="ItemID"
            pagination={{ pageSize: 5 }}
          />

          <h3>Current Order</h3>
          <List
            bordered
            dataSource={currentOrder}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button type="link" danger onClick={() => handleRemoveItemFromOrder(item.ItemID)}>
                    Remove
                  </Button>,
                ]}
              >
                {item.iDescription}
              </List.Item>
            )}
            style={{ maxWidth: 400 }}
          />

          <Button
            type="primary"
            onClick={handleSubmitOrder}
            disabled={currentOrder.length === 0}
          >
            Submit Order
          </Button>
        </>
      )}
    </div>
  );
};

export default ShopPage;
