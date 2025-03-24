import Link from "next/link";
import { React, useState ,useEffect} from "react";
import { useRouter } from "next/router";
// internal
import ProfileShapes from "./profile-shapes";
import ChangePassword from './change-password';
import UpdateUser from "./update-user";
import SampleArea from './samples';
import ResearcherSamplesArea from './ResearcherSamples';
import Header from '../../layout/dashboardheader';
import OrderInfo from "./order-info";
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
      const storedUserID = localStorage.getItem("userID");
      if (storedUserID) {
        setUserID(storedUserID);
        console.log("Researcher is ID:", storedUserID); // Verify storedUserID
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
      case "order-info":
        return <OrderInfo />; 
      case "samples":
        return <SampleArea />;
      case "my-samples":
          return <ResearcherSamplesArea />;
      case "change-password":
        return <ChangePassword />;
      case "update-user":
        return <UpdateUser />;
      default:
        return <order-info />;
    }
  };
  

  return (
    <>
      <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <section className="profile__area py-2 h-auto d-flex align-items-center my-4">
        <div className="container profile__inner position-relative">
          {/* <ProfileShapes /> */}
          <div className=" row justify-content-center">
            <div className="col-xl-12 col-lg-10 col-md-9 col-sm-10 col-12">
            <div
              className="profile__tab-content mx-auto w-100 p-3 my-1 h-auto overflow-hidden"
             // style={{ backgroundColor: " #EDF4F8" }}
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