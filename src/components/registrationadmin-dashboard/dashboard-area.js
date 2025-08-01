import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../../layout/dashboardheader";

import ChangePassword from "./change-password";

import StaffManagementPage from "./staffManagementPage";
import ResearcherArea from "./researcher";
import Country from "./country";
import City from "./city";
import District from "./district";
import OrderInfo from "./order-info";
import Organization from "./organization";
import CollectionsiteArea from "./collectionsite";
import EthnicityArea from "./ethnicity";
import SampleConditionArea from "./sample-condition";
import SamplePriceCurrencyArea from "./sample-price-currency";
import StorageTemperatureArea from "./storage-temperature";
import ContainerTypeArea from "./container-type";
import VolumeUnitArea from "./volume-unit";
import SampleTypeMatrixArea from "./sample-type-matrix";
import TestMethodArea from "./test-method";
import TestResultUnitArea from "./test-result-unit";
import ConcurrentMedicalConditionsArea from "./concurrent-medical-conditions";
import TestKitManufacturerArea from "./test-kit-manufacturer";
import TestSystemArea from "./test-system";
import TestSystemManufacturerArea from "./test-system-manufacturer";
import Analyte from "./Analyte";
import InfectiousdiseaseArea from "./infectiousdiseasetesting";
import ContactUS from "./contactus";
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
      router.push("/login"); // Redirect to login if token is missing
    }
  }, [router]);

  useEffect(() => {
    const storedUserID = sessionStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);

    } else {
      console.error("No userID found in sessionStorage");
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
      case "staffManagementPage":
        return <StaffManagementPage />;
      case "organization":
        return <Organization />;
         case "contactus":
        return <ContactUS />;
      case "collectionsite":
        return <CollectionsiteArea />;
      case "Analyte":
        return <Analyte />
      case "infectiousdiseasetesting":
        return <InfectiousdiseaseArea />
      case "ethnicity":
        return <EthnicityArea />;
      case "sample-condition":
        return <SampleConditionArea />;
      case "sample-price-currency":
        return <SamplePriceCurrencyArea />;
      case "storage-temperature":
        return <StorageTemperatureArea />;
      case "container-type":
        return <ContainerTypeArea />;
      case "volume-unit":
        return <VolumeUnitArea />;
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
      case "staffManagementPage":
      case "staffManagementPage:committee":
      case "staffManagementPage:csr":
        const role = activeTab.split(":")[1] || "collectionsite";
        return <StaffManagementPage defaultSection={role} />;
      default:
        return <OrderInfo setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />

      <p className="fs-6 text-end" style={{ margin: "10px" }}>
        {`Admin Dashboard / ${activeTab.startsWith("staffManagementPage")
            ? "Staff Management"
            : activeTab === "order-info"
              ? "Profile"
              : [
                "ethnicity",
                "sample-condition",
                "Analyte",
                "infectiousdiseasetesting",
                "sample-price-currency",
                "storage-temperature",
                "container-type",
                "volume-unit",
                "sample-type-matrix",
                "test-method",
                "test-result-unit",
                "concurrent-medical-conditions",
                "test-kit-manufacturer",
                "test-system",
                "test-system-manufacturer",
              ].includes(activeTab)
                ? `Sample / ${activeTab.replace(/-/g, " ")}`
                : activeTab.replace(/-/g, " ")
          }`}
      </p>



      <section className="profile__area py-2 h-auto d-flex align-items-center my-4 overflow-hidden">
        <div className="container-fluid profile__inner position-relative">

          <div className="col-xl-12 col-lg-10 col-md-9 col-sm-10 col-12">
            <div
              className="profile__tab-content mx-auto p-3 my-1 h-auto"
              style={{ maxWidth: "91%", width: "100%" }}
            >
              {renderContent()}
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardArea;
