import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom"; // Import necessary components from react-router-dom
import Login from "./Components/Login";
import Register from "./Components/Register";
import { Layout, Button, Divider } from "antd";
import FindItemLocations from "./Components/FindItem";

const App = () => {
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
            <Route path="/findItem" element={<FindItemLocations />} />
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
