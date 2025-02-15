import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";  // Importing useRouter for redirect
// internal
import ProfileShapes from "./profile-shapes";
import ChangePassword from './change-password';
import UpdateBioBank from './update-biobank';
import BioBankSampleArea from './samples';
import BioBankSampleDispatchArea from './sample-dispatch';
import Header from '../../layout/dashboardheader';
import { getLocalStorage } from "@utils/localstorage";

const DashboardArea = () => {
  const [activeTab, setActiveTab] = useState("samples");
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
    const storedUserID = localStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
      console.log("Collection site  ID:", storedUserID); // Verify storedUserID
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
      case "samples":
        return <BioBankSampleArea />;
      case "sample-dispatch":
        return <BioBankSampleDispatchArea />;
      case "change-password":
        return <ChangePassword />;
      case "update-biobank":
        return <UpdateBioBank />;
      default:
        return <BioBankSampleArea />;
    }
  };

  return (
    <>
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <section className="profile__area pt-180 pb-120" style={{ backgroundColor: "#DFFFD6" }}>
        <div className="container" style={{ marginTop: '-120px', width: '75%' }}>
          <div className="profile__inner p-relative">
            <ProfileShapes />
            <div className="row">
              <div
                className="text-danger fw-bold"
                style={{ marginTop: "-40px" }}>
                Note: Click on Edit Icon to Add Price and Currency for Sample.
              </div>
              <div className="col-xxl-8 col-lg-8" style={{ width: '100%' }}>
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
