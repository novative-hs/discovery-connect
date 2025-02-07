import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";  // Importing useRouter for redirect
// internal
import ProfileShapes from "./profile-shapes";
import ChangePassword from './change-password';
import UpdateBioBank from './update-biobank';
import SampleArea from './samples';
import SampleDispatchArea from './sample-dispatch';
import Header from '../../layout/dashboardheader';
import { getLocalStorage } from "@utils/localstorage";
const DashboardArea = () => {
  const [activeTab, setActiveTab] = useState("samples"); // Default to "Samples"
    const [loading, setLoading] = useState(true); // To handle the loading state
  const router = useRouter(); // For redirection

  // Check if user is authenticated by checking for "auth" in localStorage
  const isAuthenticated = typeof window !== "undefined" && getLocalStorage("auth");

  
//  useEffect(() => {
     
//      const isAuthenticated = getLocalStorage("auth");
     
//      if (!isAuthenticated) {
//        // If not authenticated, redirect to login page
//        router.push("/login");
//        return;
//      }
     
//      // Check if the user role matches the expected role for this page
//      const userData = isAuthenticated;
//      console.log(userData)
//      if (userData?.user?.accountType !== "admin") {
     
//        router.push("/unauthorized");
//        return;
//      }
 
//      // Set loading state to false after authentication checks are complete
//      setLoading(false);
//    }, [router]);
 
//    // If still loading (during the authentication check), you can display a loading spinner
//    if (loading) {
//      return <div>Loading...</div>; // Replace with your loader component
//    }
  // Function to render content based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "samples":
        return <SampleArea />;
      case "sample-dispatch":
        return <SampleDispatchArea />;
      case "change-password":
        return <ChangePassword />;
      case "update-biobank":
        return <UpdateBioBank />;
      default:
        return <SampleArea />;
    }
  };

  return (
    <>
         <Header setActiveTab={setActiveTab} activeTab={activeTab} />
      <section className="profile__area pt-180 pb-120">
        <div className="container" style={{ marginTop: '-90px', width: '100%' }}>
          <div className="profile__inner p-relative">
            <ProfileShapes />
            <div className="row">
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
