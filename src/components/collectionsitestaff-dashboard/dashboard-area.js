import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";

import ChangePassword from './change-password';
import UpdateCollectionSiteStaff from './update-collectionsitestaff';
import SampleArea from './samples';
import SampleDispatchArea from './sample-dispatch';
import Header from '../../layout/dashboardheader';
import SampleReturn from "./sample-return";
import SampleLost from './sample-lost'
const DashboardArea = () => {
  const [activeTab, setActiveTab] = useState("samples"); // Default
  const [id, setUserID] = useState(null);
  const router = useRouter();

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
    const storedUserID = sessionStorage.getItem("userID");
    const staffAction = sessionStorage.getItem("staffAction");

    if (storedUserID) {
      setUserID(storedUserID);
     
    } else {
      console.error("No userID found in sessionStorage");
      router.push("/login");
    }

    // Set tab based on staffAction
    if (staffAction) {
      const sampleTabs = ["add", "edit", "dispatch", "history", "all"];
      const dispatchTabs = ["receive", "all"];
      if (sampleTabs.includes(staffAction)) {
        setActiveTab("samples");
      } else if (dispatchTabs.includes(staffAction)) {
        setActiveTab("sample-dispatch");
      }
    }
  }, [router]);

  if (!id) {
    return <div>Loading...</div>;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "samples":
        return <SampleArea />;
      case "sample-dispatch":
        return <SampleDispatchArea />;
      case "sample-return":
        return <SampleReturn />
      case "sample-lost":
        return <SampleLost />
      case "change-password":
        return <ChangePassword />;
      case "update-collectionsitestaff":
        return <UpdateCollectionSiteStaff />;

      default:
        return <SampleArea />;
    }
  };

  return (
    <>
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <section className="profile__area py-2 h-auto d-flex align-items-center my-4 overflow-hidden">
        <div className="container-fluid profile__inner position-relative">
          <div className="row justify-content-center">
            <div className="col-xl-12 col-lg-10 col-md-9 col-sm-10 col-12">
              <div
                className="profile__tab-content mx-auto p-3 my-1 h-auto"
                style={{ maxWidth: "90%", width: "100%" }}
              >
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default DashboardArea;
