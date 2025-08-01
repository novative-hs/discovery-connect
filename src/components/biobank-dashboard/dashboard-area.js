import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";  // Importing useRouter for redirect
// internal

import ChangePassword from './change-password';
import BioBankSampleArea from './samples';
import PooledSample from "./pooledsample";
import BioBankSampleDispatchArea from './sample-dispatch';
import QuarantineStockchArea from './quarantine-stock';
import Header from '../../layout/dashboardheader';
import { getsessionStorage } from "@utils/sessionStorage";
import QuoteRequest from "./quoterequest";

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
    const storedUserID = sessionStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
      
    } else {
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
        case "pendingquoterequest":
          return <QuoteRequest/>
      case "Quarantine-Stock":
        return <QuarantineStockchArea />;
        case "pooledsample":
        return <PooledSample />;
      case "change-password":
        return <ChangePassword />;
      default:
        return <BioBankSampleArea />;
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
