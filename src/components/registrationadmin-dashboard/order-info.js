import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router"; // Import useRouter from next/router

const OrderInfo = ({ setActiveTab }) => {
  const [userCount, setUserCount] = useState(null); // State to store fetched data

  // Fetch data on component mount
  useEffect(() => {
    fetchUserCount(); // Call the function when the component mounts
  }, []);

  // Function to fetch user count data
  const fetchUserCount = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/getAll`);
      setUserCount(response.data); // Set the fetched counts in the state
    } catch (error) {
      console.error("Error fetching user count:", error);
    }
  };

  // If data is still loading or not fetched yet
  if (!userCount) {
    return <div>Loading...</div>;
  }

  const stats = [
    { label: "Total City", count: userCount.totalCities, icon: "fa-solid fa-city", bg: "bg-primary", tab: "city" },
    { label: "Total District", count: userCount.totalDistricts, icon: "fa-solid fa-flag", bg: "bg-info", tab: "district" },
    { label: "Total Country", count: userCount.totalCountries, icon: "fa-solid fa-globe", bg: "bg-success", tab: "country" },
    { label: "Total Researcher", count: userCount.totalResearchers, icon: "fa-solid fa-user", bg: "bg-warning", tab: "researcher" },
    { label: "Total Organization", count: userCount.totalOrganizations, icon: "fa-solid fa-building", bg: "bg-danger", tab: "organization" },
    { label: "Total Collection Site", count: userCount.totalCollectionSites, icon: "fa-solid fa-map-marker-alt", bg: "bg-dark", tab: "collectionsite" },
    { label: "Total Committee Member", count: userCount.totalCommitteeMembers, icon: "fa-solid fa-users", bg: "bg-secondary", tab: "committee-members" },
    { label: "Total Cart Items", count: userCount.totalOrders, icon: "fa-solid fa-shopping-cart", bg: "bg-success", tab: "order-info" },
  ];

  // Handle stat div click and set active tab
  const handleTabClick = (tab) => {
    setActiveTab(tab); // Change the active tab when a stat div is clicked
  };

  return (
    <div className="container mt-4">
      <div className="row g-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-md-3">
            <div
              className={`card text-white ${stat.bg} shadow-lg rounded-lg text-center p-3`}
              onClick={() => handleTabClick(stat.tab)}  // Change tab when clicked
            >
              <div className="card-body">
                <i className={`${stat.icon} fa-2x mb-2`}></i>
                <h5 className="card-title">{stat.label}</h5>
                <p className="card-text text-white fs-4 fw-bold">{stat.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderInfo;
