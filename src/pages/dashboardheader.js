import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";

import Wrapper from "@layout/wrapper";
import Footer from "@layout/footer";
import OrganizationDashboard from "@components/organization-dashboard/dashboard-area";
import DatabaseAdminDashboard from "@components/databaseadmin-dashboard/dashboard-area";
import RegistrationAdminDashboard from "@components/registrationadmin-dashboard/dashboard-area";
import BiobankDashboard from "@components/biobank-dashboard/dashboard-area";
import CollectionSideDashboard from "@components/collectionsite-dashboard/dashboard-area";
import ResearcherDashboard from "@components/user-dashboard/dashboard-area";
import CommitteememberDashboard from "@components/committeemember-dashboard/dashboard-area";
import Loader from "@components/loader/loader";

const UserOrdersPage = () => {
  const router = useRouter();
  const [userType, setUserType] = useState(null);
  useEffect(() => {
    const type = localStorage.getItem("accountType")?.trim().toLowerCase();
    console.log("Fetched accountType:", type);

    if (type) {
      setUserType(type);
    } else {
      console.error("Account type is null or undefined");
      router.push("/login");
    }
  }, [router]);

  // Determine which dashboard to render based on user type
  const renderDashboard = () => {
    switch (userType) {
      case "organization":
        return <OrganizationDashboard />;
      case "registrationadmin":
        return <RegistrationAdminDashboard />;
        case "databaseadmin":
          return <DatabaseAdminDashboard />;
      case "biobank":
        return <BiobankDashboard />;
      case "collectionsites":
        return <CollectionSideDashboard />;
      case "researcher":
        return <ResearcherDashboard />;
        case "committeemember":
          return <CommitteememberDashboard />;
      default:
        return <Loader />;
    }
  };
  

  return (
    <Wrapper>
      <SEO pageTitle={"Dashboard"} />
      {renderDashboard()}
      <Footer />
    </Wrapper>
  );
};

export default UserOrdersPage;