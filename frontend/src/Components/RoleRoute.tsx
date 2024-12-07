import React, { ReactElement, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import { notification, Spin } from "antd";

interface RoleRouteProps {
  element: ReactElement;
  requiredRoles: string[]; 
}

const RoleRoute: React.FC<RoleRouteProps> = ({ element, requiredRoles }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const notificationShown = useRef(false);

  useEffect(() => {
    const checkUserRole = async () => {
      console.log("Checking user role");
      console.log(requiredRoles);
      try {
        const response = await axios.post(`${config.apiUrl}/check_role`, 
          { roles: requiredRoles },
          { withCredentials: true });
        setIsAuthorized(true);
      } catch (error: any) {
        setIsAuthorized(false);
        if (!notificationShown.current) {
          notification.error({
            message: "Access Denied",
            description: error.response?.data?.error || "Unable to verify user role."
          });
          notificationShown.current = true;
        }
      }
    };

    checkUserRole();
  }, [navigate, requiredRoles]);

  if (isAuthorized === null) {
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

  if (!isAuthorized) {
    return (
      <div style={{ textAlign: "center", padding: 20 }}>
        <h2>Unauthorized Access</h2>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return element;
};

export default RoleRoute;