import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";  // Importing useRouter for redirect
// internal
import ChangePassword from './change-password';
import Header from '../../layout/dashboardheader';
import OrderInfo from "./order-info";
import ShippingSampleArea from "./shippingorder";
import DispatchSampleArea from "./dispatchorder";
import CompletedSampleArea from "./completedorder";
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
      console.log("Committee member site  ID:", storedUserID); // Verify storedUserID
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
      case "order-info":
        return <OrderInfo setActiveTab={setActiveTab} />;
      case "dispatchorder":
        return <ShippingSampleArea />;
        case "shippingorder":
          return <DispatchSampleArea />;
          case "completedorder":
            return <CompletedSampleArea />;
      case "change-password":
        return <ChangePassword />;
      default:
          return <OrderInfo setActiveTab={setActiveTab} />;
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