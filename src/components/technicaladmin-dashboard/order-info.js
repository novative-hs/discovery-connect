import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderInfo = ({ setActiveTab }) => {
  const [userCount, setUserCount] = useState(null);
  const [contactusCount, setContactusCount] = useState(null);

  useEffect(() => {
    fetchUserCount();
    fetchContactusCount();
  }, []);

  // Function to fetch user count data
  const fetchUserCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/getAll`
      );
      setUserCount(response.data); // Set the fetched counts in the state
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };
  const fetchContactusCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contactus/get-all`
      );
      setContactusCount(response.data.length); // Set the fetched counts in the state
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  // If data is still loading or not fetched yet
  if (!userCount) {
    return <div>Loading...</div>;
  }

  const stats = [
    { label: "Order List", count: userCount.totalOrders, icon: "fa-solid fa-clipboard-list", bg: "bg-success", tab: "order" },
    { label: "Contact us List", count: contactusCount, icon: "fa-solid fa-envelope", bg: "bg-primary", tab: "contactus" },
  ];

  // Handle stat div click and set active tab
  const handleTabClick = (tab) => {
    setActiveTab(tab); // Change the active tab when a stat div is clicked
  };

  return (
    <div className="container">
      <div className="row row-cols-2 row-cols-md-4 g-3 justify-content-start">
        {stats.map((stat, index) => (
          <div key={index} className="col d-flex justify-content-start ">
            <div
              className="card text-center shadow-sm p-3 w-100"
              onClick={() => handleTabClick(stat.tab)}
              style={{ transition: "transform 0.3s ease-in-out" }} // Smooth animation
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div className="card-body">
                <div
                  className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center mx-auto mb-2"
                  style={{ width: "50px", height: "50px" }}
                >
                  <i className={`${stat.icon} fs-5`}></i>
                </div>
                <h6 className="card-title text-black fs-6 fw-bold">{stat.label}</h6>
                <p className="card-text text-primary fs-5 fw-bold">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderInfo;
