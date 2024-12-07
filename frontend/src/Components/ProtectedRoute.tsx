import React, { ReactElement, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import { notification , Spin } from "antd";

interface ProtectedRouteProps {
  element: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const notificationShown = useRef(false); // Avoid showing multiple notifications
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get(`${config.apiUrl}/check_login`, { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error: any){
        setIsAuthenticated(false);
        if (!notificationShown.current) { // Show notification only once
          notification.error({
            message: "Authentication failed.",
            description: error.response?.data?.error || "Please log in first to access this page.",
          });
          notificationShown.current = true;
        }
        navigate("/"); // not logged in, redirect to root page
      }
    };
    checkAuth();
  }, [navigate]);

  if (isAuthenticated === null) {
    return (
      <Spin 
        size="large" 
        style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "100vh" 
        }} 
      />
    );
  }

  return isAuthenticated ? element : null;
};

export default ProtectedRoute;
