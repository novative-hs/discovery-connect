import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";  // Importing useRouter for redirect
// internal
import ProfileShapes from "./profile-shapes";
import ChangePassword from './change-password';
import UpdateCollectionsite from './update-collectionsite';
import SampleArea from './samples';
import SampleDispatchArea from './sample-dispatch';
import Header from '../../layout/dashboardheader';
const DashboardArea = () => {
  const [activeTab, setActiveTab] = useState("samples"); // Default to "Samples"
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
      console.log("Collection site  ID:", storedUserID); // Verify storedUserID
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
      case "samples":
        return <SampleArea />;
      case "sample-dispatch":
        return <SampleDispatchArea />;
      case "change-password":
        return <ChangePassword />;
      case "update-collectionsite":
        return <UpdateCollectionsite />;
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
  style={{ maxWidth: "95%", width: "100%" }}
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