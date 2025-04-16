import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Box, Delivery, Processing, Truck, Cart } from "@svg/index";

const OrderInfo = ({ setActiveTab }) => {
  const [userCount, setUserCount] = useState(null);
  const [contactusCount, setContactusCount] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserCount();
    fetchContactusCount();
  }, []);

  const fetchUserCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/getAll`
      );
      setUserCount(response.data);
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  const fetchContactusCount = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contactus/get-all`
      );
      setContactusCount(response.data.length);
    } catch (error) {
      console.error("Error fetching contact us count:", error);
    }
  };
  const handleTabClick = (tab) => {
    if (setActiveTab) {
      setActiveTab(tab); // Just switch the tab, no navigation needed!
    }
  };
  if (!userCount) {
    return <div>Loading...</div>;
  }

  const stats = [
    { label: "Book Samples", icon: <Cart />, tab: "Booksamples" },
    { label: "Sample List", icon: <i className="fa-solid fa-envelope fs-4 text-white" />, tab: "samples" },
    { label: "My Orders", icon: <Box />, tab: "my-samples" },
  ];

  return (
    <div className="container">
      <div className="profile__main-top pb-80">
        <div className="row align-items-center">
          <div className="col-md-6">
            <div className="profile__main-inner d-flex flex-wrap align-items-center">
              <div className="profile__main-content">
                <h4 className="profile__main-title text-capitalize">
                  Welcome To Researchers Dashboard
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row gx-3">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-3 col-sm-6 mb-4">
            <div
              className="profile__main-info-item shadow-sm p-3 text-center"
              onClick={() => handleTabClick(stat.tab)}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div className="profile__main-info-icon mb-2">
                <span className="total-order d-flex justify-content-center align-items-center">
                  <span className="profile-icon-count profile-download fs-4 me-2">
                    {stat.count}
                  </span>
                  {stat.icon}
                </span>
              </div>
              <h6 className="profile__main-info-title">{stat.label}</h6>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderInfo;
