import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router"; // Import useRouter from next/router

const OrderInfo = ({ setActiveTab }) => {
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    fetchUserCount();
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

  // If data is still loading or not fetched yet
  if (!userCount) {
    return <div>Loading...</div>;
  }

  const stats = [
    { label: "Cities", count: userCount.totalCities, icon: "fa-solid fa-city", bg: "bg-primary", tab: "city" },
    { label: "Countries", count: userCount.totalCountries, icon: "fa-solid fa-globe", bg: "bg-success", tab: "country" },
    { label: "Districts", count: userCount.totalDistricts, icon: "fa-solid fa-flag", bg: "bg-info", tab: "district" },
    { label: "Researchers", count: userCount.totalResearchers, icon: "fa-solid fa-user", bg: "bg-warning", tab: "researcher" },
    { label: "Organizations", count: userCount.totalOrganizations, icon: "fa-solid fa-building", bg: "bg-danger", tab: "organization" },
    { label: "Collection Sites", count: userCount.totalCollectionSites, icon: "fa-solid fa-map-marker-alt", bg: "bg-dark", tab: "collectionsite" },
    { label: "Committee Members", count: userCount.totalCommitteeMembers, icon: "fa-solid fa-users", bg: "bg-secondary", tab: "committee-members" },
    // { label: "Cart Items", count: userCount.totalOrders, icon: "fa-solid fa-shopping-cart", bg: "bg-success", tab: "order-info" },
  ];

  // Handle stat div click and set active tab
  const handleTabClick = (tab) => {
    setActiveTab(tab); // Change the active tab when a stat div is clicked
  };

  return (
    <div className="container">
    <div className="row row-cols-2 row-cols-md-4 g-3 justify-content-center">
      {stats.map((stat, index) => (
        <div key={index} className="col d-flex justify-content-center">
          <div className="card text-center shadow-sm p-3 w-100"
           onClick={() => handleTabClick(stat.tab)}
           style={{ transition: "transform 0.3s ease-in-out" }} // Smooth animation
           onMouseEnter={(e) =>
             (e.currentTarget.style.transform = "scale(1.15)")
           } // Increase size more
           onMouseLeave={(e) =>
             (e.currentTarget.style.transform = "scale(1)")
           } // Back to normal>
           >
            <div className="card-body">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center mx-auto mb-2" style={{ width: "50px", height: "50px" }}>
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
