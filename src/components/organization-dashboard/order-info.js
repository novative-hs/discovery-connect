import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Box } from "@svg/index";

const OrderInfo = ({ setActiveTab }) => {
  const [user, setUser] = useState({ id: null, name: "" });
  const [researcherCount, setResearcherCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const userID = localStorage.getItem("userID");
      if (!userID) return;

      try {
        const orgRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get/${userID}`);
        const organization = orgRes.data[0];
        if (!organization) return;

        setUser({ id: organization.id, name: organization.OrganizationName });

        const researcherRes = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/researcher/get/${organization.id}`);
        setResearcherCount(Array.isArray(researcherRes.data) ? researcherRes.data.length : 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="profile__main-info p-4">
      <h2 className="profile__main-title text-capitalize text-start fw-bold pb-4">
        Welcome {user.name}
      </h2>
      <div className="row justify-content-start">
        <div className="col-lg-4 col-md-6 col-sm-10">
          <div className="col-md-12 col-sm-6 bg-white" onClick={() => setActiveTab("researchers")} style={{ cursor: "pointer" }}>
            <div className="profile__main-info-item d-flex flex-column align-items-center text-center">
              <div className="profile__main-info-icon d-flex align-items-center justify-content-center gap-2">
                <span className="profile-icon-count profile-download">{researcherCount}</span>
                <span className="researcher-icon"><Box /></span>
              </div>
              <h4 className="profile__main-info-title mt-2">Total Researchers</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderInfo;