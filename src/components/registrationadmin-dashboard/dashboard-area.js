import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../../layout/dashboardheader";
import ProfileShapes from "./profile-shapes";
import ChangePassword from "./change-password";
import UpdateRegistrationAdmin from "./update-registrationadmin";
import CommitteeMemberArea from "./committe-members";
import ResearcherArea from "./researcher";
import Country from "./country";
import City from "./city";
import District from "./district";
import OrderInfo from "./order-info";
import Organization from "./organization";
import CollectionsiteArea from "./collectionsite";
import EthnicityArea from "./ethnicity";
import SampleConditionArea from "./sample-condition";
import StorageTemperatureArea from "./storage-temperature";
import ContainerTypeArea from "./container-type";
import QuantityUnitArea from "./quantity-unit";
import SampleTypeMatrixArea from "./sample-type-matrix"; 
import TestMethodArea from "./test-method";
import TestResultUnitArea from "./test-result-unit";
import ConcurrentMedicalConditionsArea from "./concurrent-medical-conditions";
import TestKitManufacturerArea from "./test-kit-manufacturer";
import TestSystemArea from "./test-system";
import TestSystemManufacturerArea from "./test-system-manufacturer";

const DashboardArea = () => {
  const [activeTab, setActiveTab] = useState("order-info"); // Default to "order-info"
  const router = useRouter();
  const [id, setUserID] = useState(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("authToken="))
      ?.split("=")[1];
    console.log("admin dashboard", token);
    if (!token) {
      router.push("/login"); // Redirect to login if token is missing
    }
  }, [router]);

  useEffect(() => {
    const storedUserID = localStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
      console.log("Registration Admin ID:", storedUserID); // Verify storedUserID
    } else {
      console.error("No userID found in localStorage");
      router.push("/login");
    }
  }, [router]);

  if (!id) {
    return <div>Loading...</div>; // Or redirect to login
  }

  const renderContent = () => {
    switch (activeTab) {
      case "country":
        return <Country />;
      case "city":
        return <City />;
      case "district":
        return <District />;
      case "order-info":
        return <OrderInfo setActiveTab={setActiveTab} />;
      case "researcher":
        return <ResearcherArea />;
      case "committee-members":
        return <CommitteeMemberArea />;
      case "organization":
        return <Organization />;
      case "collectionsite":
        return <CollectionsiteArea />;
      case "ethnicity":
        return <EthnicityArea />;
      case "sample-condition":
        return <SampleConditionArea />;
      case "storage-temperature":
        return <StorageTemperatureArea />;
      case "container-type":
        return <ContainerTypeArea />;
      case "quantity-unit":
        return <QuantityUnitArea />;
      case "sample-type-matrix":
        return <SampleTypeMatrixArea />;
      case "test-method":
        return <TestMethodArea />;
      case "test-result-unit":
        return <TestResultUnitArea />;
      case "concurrent-medical-conditions":
        return <ConcurrentMedicalConditionsArea />;
      case "test-kit-manufacturer":
        return <TestKitManufacturerArea />;
      case "test-system":
        return <TestSystemArea />;
      case "test-system-manufacturer":
        return <TestSystemManufacturerArea />;
      case "change-password":
        return <ChangePassword />;
      case "update-registrationadmin":
        return <UpdateRegistrationAdmin />;
       
      default:
        return <OrderInfo setActiveTab={setActiveTab} />;
    }
  };
  

  return (
    <>
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <section className="profile__area pt-180 pb-120">
        <div
          className="container"
          style={{ marginTop: "-90px", width: "100%" }}
        >
          <div className="profile__inner p-relative">
            <ProfileShapes />
            <div className="row">
              <div className="col-xxl-8 col-lg-8" style={{ width: "100%" }}>
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
