import React, { ReactNode } from "react";
import { useNavigate , useLocation } from "react-router-dom";
import { Layout, Button, notification } from "antd";
import axios from "axios";
import config from "../../config";

const { Header, Content, Footer } = Layout;

interface CustomLayoutProps {
  children: ReactNode;
}

const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const showHomeButton = location.pathname !== '/dashboard';
  const showLogoutButton = location.pathname !== '/';

  const handleHomeClick = () => {
    navigate("/dashboard"); 
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${config.apiUrl}/logout`, {});
      navigate("/"); 
    } catch (error) {
      notification.error({
        message: "Logout Failed",
        description: "An error occurred while logging out.",
      });
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header 
        style={{ 
          backgroundColor: '#f0f2f5', 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
        }}
        >
        { showHomeButton && (
          <Button 
            type="primary" 
            onClick={handleHomeClick} 
            style={{ fontWeight: "bold", position: "absolute" ,left: "20px"}} 
          >
            Home
          </Button>
        )}
        { showLogoutButton && (
          <Button 
            type="primary" 
            onClick={handleLogout} 
            style={{ fontWeight: "bold" , position: "absolute" , right: "20px"}} 
          >
            Logout
          </Button>
        )}
        
      </Header>

      {/* Content of Page */}
      <Content 
        style={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          alignItems: 'center', 
          padding: '24px', 
        }}
      >
        {children}
      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: "center" }}>WelcomeHome ©2024 Created by TPG</Footer>
    </Layout>
  );
};

export default CustomLayout;
