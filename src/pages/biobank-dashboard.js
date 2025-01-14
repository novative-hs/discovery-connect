import React, { useEffect } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";
import Header from "@layout/biobankheader";
import Wrapper from "@layout/wrapper";
import Footer from "@layout/footer";
import DashboardArea from "@components/biobank-dashboard/dashboard-area"; // You can keep this if there's static content
import Loader from "@components/loader/loader"; // Only needed if you're showing a loading state

const UserOrdersPage = () => {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("auth");

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      // router.push("/login");
    }
  }, [router]);

  return (
    <Wrapper>
      <SEO pageTitle={"User Dashboard"} />
      <Header style_2={true} />
      {/* You can include static dashboard content here */}
      <DashboardArea />
      <Footer />
    </Wrapper>
  );
};

export default UserOrdersPage;