import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// internal
import ProfileShapes from "./profile-shapes";
import ChangePassword from "./change-password";
import UpdateUser from "./update-user";
import SampleArea from "./samples";
import ResearcherSamplesArea from "./ResearcherSamples";
import Header from "../../layout/dashboardheader";
import OrderInfo from "./order-info";
import Shop from "../../pages/shop"
import Cart from "../../pages/cart";
import Checkout from "../../pages/checkout";
import FilterProductArea from "./filter-samples";
import InvoicePage from "./invoice-area";
const DashboardArea = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Booksamples");
  const [id, setUserID] = useState(null);

  // 🔹 Ensure hooks run in a stable order
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

  useEffect(() => {
    const { tab } = router.query;
    if (tab) {
      setActiveTab(tab);
    }
  }, [router.query]); // ✅ Always runs in the same order

  // 🚀 Move loading check after hooks
  if (!id) {
    return <div>Loading...</div>; // Or show a loader
  }

  const renderContent = () => {
    switch (activeTab) {
      // case "order-info":
      //   return <OrderInfo setActiveTab={setActiveTab} />;
      case "Booksamples":
        return <Shop setActiveTab={setActiveTab} />;
      case "Cart":
        return <Cart setActiveTab={setActiveTab} />;
         case "invoice-area":
        return <InvoicePage setActiveTab={setActiveTab} />;
      case "Checkout":
          return <Checkout setActiveTab={setActiveTab} />;
           case "filter-samples":
        return <FilterProductArea setActiveTab={setActiveTab} />;
      case "samples":
        return <SampleArea setActiveTab={setActiveTab} />;
      case "my-samples":
        return <ResearcherSamplesArea />;
      case "change-password":
        return <ChangePassword />;
      case "update-user":
        return <UpdateUser />;
      default:
        return <Shop setActiveTab={setActiveTab} />;
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
