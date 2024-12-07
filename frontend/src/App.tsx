import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom"; // Import necessary components from react-router-dom
import Login from "./Components/Login";
import Register from "./Components/Register";
import { Layout, Button, Divider } from "antd";
import FindItemLocations from "./Components/FindItem";
import Dashboard from "./Components/Dashboard";
import FindOrderItems from "./Components/FindOrder";
import DonationForm from "./Components/DonationForm";
import StartOrder from "./Components/StartOrder";
import ShopPage from "./Components/ShopPage";

import ProtectedRoute from "./Components/ProtectedRoute";
import RoleRoute from "./Components/RoleRoute";

import axios from "axios";

const App = () => {
  axios.defaults.withCredentials = true
  return (
    <BrowserRouter>
      <Layout style={{ height: "100vh" }}>
        <Layout.Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/findItem" element={<ProtectedRoute element={<FindItemLocations />} />} />
            <Route path="/findOrder" element={<ProtectedRoute element={<FindOrderItems />} />} />
            <Route path="/donateForm" element={<ProtectedRoute element={<DonationForm />} />} />
            <Route path="/startOrder" element={<ProtectedRoute element={<RoleRoute element={<StartOrder />} requiredRoles={["staff"]} />} />} />
            <Route path="/shop/:orderId" element={<ProtectedRoute element={<RoleRoute element={<ShopPage />} requiredRoles={["staff"]} />} />} />
            <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
            <Route
              path="/"
              element={
                <div style={{ width: 400, margin: "auto", paddingTop: "50px" }}>
                  <h2>Welcome</h2>
                  <Button type="primary" block href="/login">
                    Login
                  </Button>
                  <Divider>Or</Divider>
                  <Button type="primary" block href="/register">
                    Register
                  </Button>
                </div>
              }
            />
          </Routes>
        </Layout.Content>
      </Layout>
    </BrowserRouter>
  );
};

export default App;
