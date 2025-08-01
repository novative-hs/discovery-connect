import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";

import Wrapper from "@layout/wrapper";
import DashboardFooter from "@layout/dashboardfooter";

import RegistrationAdminDashboard from "@components/registrationadmin-dashboard/dashboard-area";
import TechnicalAdminDashboard from "@components/technicaladmin-dashboard/dashboard-area";
import BiobankDashboard from "@components/biobank-dashboard/dashboard-area";
import CollectionSidestaffDashboard from "@components/collectionsitestaff-dashboard/dashboard-area";
import ResearcherDashboard from "@components/user-dashboard/dashboard-area";
import CommitteememberDashboard from "@components/committeemember-dashboard/dashboard-area";
import CSRDashboard from "@components/CSR-dashboard/dashboard-area"
import Loader from "@components/loader/loader";

const UserOrdersPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState(null);
  useEffect(() => {
    const type = sessionStorage.getItem("accountType")?.trim().toLowerCase();

    if (type) {
      setUserType(type);
    } else {
      
      router.push("/login");
    }
  }, [router]);

  // Determine which dashboard to render based on user type
  const renderDashboard = () => {
    switch (userType) {
      case "technicaladmin":
        return <TechnicalAdminDashboard />;
        case "registrationadmin":
          return <RegistrationAdminDashboard />;
      case "biobank":
        return <BiobankDashboard />;
      case "collectionsitesstaff":
        return <CollectionSidestaffDashboard />;
      case "researcher":
        return <ResearcherDashboard />;
        case "committeemember":
          return <CommitteememberDashboard />;
          case "csr":
          return <CSRDashboard />;
      default:
        return <Loader />;
    }
  };
  

  return (
    <Wrapper>
    <div className="d-flex flex-column min-vh-100">
      <SEO pageTitle={"Dashboard"} />
      <main className="flex-grow-1">{renderDashboard()}</main>
      <DashboardFooter />
    </div>
  </Wrapper>
  );
};

export default UserOrdersPage;