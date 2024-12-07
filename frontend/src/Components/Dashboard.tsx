import React, { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../config";
import { notification, Spin } from "antd";

type Feature = {
  label: string;
  path: string;
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<string[]>([]); 
  const [fname, setFname] = useState<string>("");

  // Control flag: Set to true to enable role-based features
  const ENABLE_ROLE_BASED_FEATURES = false; 

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/user`, { withCredentials: true });
      setRoles(response.data.roles);
      setFname(response.data.fname);
    } catch (error: any) {
      notification.error({
        message: "Error Fetching User Data",
        description: error.response?.data?.error || "An error occurred while fetching user data.",
      });
      navigate("/"); 
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${config.apiUrl}/logout`, {}, { withCredentials: true });
      navigate("/"); 
    } catch (error) {
      notification.error({
        message: "Logout Failed",
        description: "An error occurred while logging out.",
      });
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const generalFeatures: Feature[] = [
    { label: "Find Single Item", path: "/findItem" },
    { label: "Find Order Items", path: "/findOrder" },
    { label: "Rank System", path: "/rankSystem" },
    { label: "User's Tasks", path: "/userTasks" },
  ];

  const volunteerStaffFeatures: Feature[] = [
    { label: "Prepare Order", path: "/prepareOrder" },
    { label: "Update Order Status", path: "/updateOrderStatus" },
  ];

  const staffFeatures: Feature[] = [
    { label: "Accept Donation", path: "/acceptDonation" },
    { label: "Start an Order", path: "/startOrder" },
  ];

  const handleFeatureClick = (path: string) => {
    navigate(path);
  };

  const hasRole = (role: string) => roles.includes(role.toLowerCase());

  return (
    <div className="dashboard">
      <header className="header">
        <h1>WelcomeHome Management Dashboard</h1>
        
        <div className="user-info">
          <p id="user-fname">Hello, <span>{fname}</span>!</p>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <p id="user-role">
          Logged in as: <span id="role-display">{roles.join(", ")}</span>
        </p>
      </header>

      <main>
        <section className="feature-section">
          <h2>General Features</h2>
          <div className="feature-grid">
            {generalFeatures.map((feature, idx) => (
              <button
                key={idx}
                className="feature-btn"
                onClick={() => handleFeatureClick(feature.path)}
              >
                {feature.label}
              </button>
            ))}
          </div>
        </section>

        {(ENABLE_ROLE_BASED_FEATURES ? (hasRole("volunteer") || hasRole("staff")) : true) && (
          <section className="feature-section">
            <h2>Volunteer & Staff Features</h2>
            <div className="feature-grid">
              {volunteerStaffFeatures.map((feature, idx) => (
                <button
                  key={idx}
                  className="feature-btn"
                  onClick={() => handleFeatureClick(feature.path)}
                >
                  {feature.label}
                </button>
              ))}
            </div>
          </section>
        )}

        {(ENABLE_ROLE_BASED_FEATURES ? hasRole("staff") : true) && (
          <section className="feature-section">
            <h2>Staff Exclusive Features</h2>
            <div className="feature-grid">
              {staffFeatures.map((feature, idx) => (
                <button
                  key={idx}
                  className="feature-btn"
                  onClick={() => handleFeatureClick(feature.path)}
                >
                  {feature.label}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
