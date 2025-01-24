import React, { useEffect, useState } from "react";
import OrderInfo from "./order-info";
import ProfileShapes from "./profile-shapes";
import ChangePassword from './change-password';
import UpdateOrganization from './update-organization';
import ResearcherArea from './researchers';
import Header from '../../layout/organizationheader';
import { useRouter } from "next/router";
const DashboardArea = () => {
  const [activeTab, setActiveTab] = useState("order-info"); // Default to "order-info"
  const router = useRouter();
  const [id, setUserID] = useState(null);

    useEffect(() => {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("authToken="))
        ?.split("=")[1];
  
      if (!token) {
        router.push("/login");
      }
    }, [router]);
  
    useEffect(() => {
      const storedUserID = localStorage.getItem("userID");
      if (storedUserID) {
        setUserID(storedUserID);
        console.log("Organization ID:", storedUserID); // Verify storedUserID
      } else {
        console.error("No userID found in localStorage");
        router.push("/login");
      }
    }, [router]);
  
    if (!id) {
      return <div>Loading...</div>; // Or redirect to login
    }

  // Function to render the content based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case "order-info":
        return <OrderInfo />;
      case "researchers":
        return <ResearcherArea />;
      case "change-password":
        return <ChangePassword />;
      case "update-organization":
        return <UpdateOrganization />;
      default:
        return <OrderInfo />;
    }
  };

  return (
    <>
      <Header setActiveTab={setActiveTab} />
      <section className="profile__area pt-180 pb-120">
        <div className="container" style={{ marginTop: '-90px', width: '100%' }}>
          <div className="profile__inner p-relative">
            <ProfileShapes />
            <div className="row">
              <div className="col-xxl-8 col-lg-8" style={{ width: '100%'}}>
                <div className="profile__tab-content">
                  {/* Dynamically render content based on activeTab */}
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardArea;