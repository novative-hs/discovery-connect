import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Box } from "@svg/index"; // Ensure correct import

function SingleResearcherInfo({ icon, info, title, onClick }) {
  return (
    <div
      className="col-md-12 col-sm-6"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="profile__main-info-item d-flex flex-column align-items-center text-center">
        <div className="profile__main-info-icon d-flex align-items-center justify-content-center gap-2">
          <span className="profile-icon-count profile-download">{info}</span>
          <span className="researcher-icon">{icon}</span>
        </div>
        <h4 className="profile__main-info-title mt-2">{title}</h4>
      </div>
    </div>
  );
}

const OrderInfo = ({ setActiveTab }) => {
  const [userCount, setUserCount] = useState(null);
  const router = useRouter();
const [id, setUserID] = useState(null);
   useEffect(() => {
      const storedUserID = localStorage.getItem("userID");
      if (storedUserID) {
        setUserID(storedUserID);
        console.log("Organization ID:", storedUserID); // Verify storedUserID
      }
    }, []);
  useEffect(() => {
    if (id !== null) {
    fetchUserCount();
    }
  }, [id]);

  const fetchUserCount = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/researcher/get`);
  
      if (Array.isArray(response.data)) {
        
        const filteredResearchers = response.data.filter(researcher => {
          return researcher.added_by == id; 
        });
  console.log(filteredResearchers)
        setUserCount(filteredResearchers.length); 
      } else {
        console.warn("Unexpected API response:", response.data);
        setUserCount(0);
      }
    } catch (error) {
      console.error("Error fetching researcher count:", error);
      setUserCount(0);
    }
  };
  
  

  const researcherStat = {
    label: "Total Researchers",
    count: userCount || 0,
    icon: <Box />,
    tab: "researchers",
  };

  return (
    <div className="profile__main-info p-4 ">
      <div className="row justify-content-start">
        <div className="profile__main-content">
          <h7 className="profile__main-title text-capitalize  text-start pb-4">Welcome</h7>
        </div>
        <div className="col-lg-4 col-md-6 col-sm-10">
          <SingleResearcherInfo
            info={researcherStat.count}
            icon={researcherStat.icon}
            title={researcherStat.label}
            onClick={() => setActiveTab(researcherStat.tab)}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;
