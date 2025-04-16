// Improved OrderInfo.js (redesigned card layout)
import React, { useState, useEffect } from "react";
import axios from "axios";

const OrderInfo = ({ setActiveTab }) => {
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    fetchUserCount();
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

  if (!userCount) return <div className="text-center py-5">Loading...</div>;

  const stats = [
    { label: "Cities", count: userCount.totalCities, icon: "fa-city", color: "primary", tab: "city" },
    { label: "Countries", count: userCount.totalCountries, icon: "fa-globe", color: "success", tab: "country" },
    { label: "Districts", count: userCount.totalDistricts, icon: "fa-flag", color: "info", tab: "district" },
    { label: "Researchers", count: userCount.totalResearchers, icon: "fa-user", color: "warning", tab: "researcher" },
    { label: "Organizations", count: userCount.totalOrganizations, icon: "fa-building", color: "danger", tab: "organization" },
    { label: "Collection Sites", count: userCount.totalCollectionSites, icon: "fa-map-marker-alt", color: "dark", tab: "collectionsite" },
    { label: "Committee Members", count: userCount.totalCommitteeMembers, icon: "fa-users", color: "secondary", tab: "committee-members" },
  ];

  return (
    <div className="container py-4">
      <div className="row g-4 justify-content-center">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div
              className="card shadow-sm border h-100 hover-scale"
              onClick={() => setActiveTab(stat.tab)}
              style={{ cursor: "pointer", transition: "transform 0.2s ease-in-out" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.10)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <div className="card-body text-center">
                <div className={`bg-${stat.color} text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3`} style={{ width: "60px", height: "60px" }}>
                  <i className={`fas ${stat.icon} fs-4`}></i>
                </div>
                <h6 className="text-dark fw-semibold mb-1">{stat.label}</h6>
                <h5 className={`text-${stat.color} fw-bold`}>{stat.count}</h5>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderInfo;
