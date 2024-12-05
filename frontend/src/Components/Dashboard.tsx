import React from "react";
import "../styles/Dashboard.css";
import { useLocation, useNavigate } from "react-router-dom";

type Feature = {
  label: string;
  path: string; // 添加路径字段
};

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = location.state?.userRole || "Staff"; // Staff for test!

  const generalFeatures: Feature[] = [
    { label: "Find Single Item", path: "/findItem" },
    { label: "Find Order Items", path: "/findOrderItems" },
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
    navigate(path); // 跳转到对应路径
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>WelcomeHome Management Dashboard</h1>
        <p id="user-role">
          Logged in as: <span id="role-display">{userRole}</span>
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

        {(userRole === "Volunteer" || userRole === "Staff") && (
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

        {userRole === "Staff" && (
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
