import { useState, useEffect } from "react";
import SEO from "@components/seo";
import Footer from "@layout/footer";
import Header from "@layout/header";
import DashboardHeader from "@layout/dashboardheader";
import Wrapper from "@layout/wrapper";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import CartArea from "@components/cart/cart-area";
import { useGetAllSamplesQuery } from "src/redux/features/productApi";

export default function Cart() {
  const { data: product } = useGetAllSamplesQuery();

  const [userId, setUserId] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = sessionStorage.getItem("userID");
      const role = sessionStorage.getItem("accountType");
      setUserId(id);
      setAccountType(role?.toLowerCase());
      setLoadingUser(false);
    }
  }, []);

  if (loadingUser) return <div>Loading...</div>;

  return (
    <Wrapper>
      <SEO pageTitle={"Cart"} />

      {/* Show appropriate header */}
      {userId && accountType === "researcher" ? (
        <DashboardHeader setActiveTab={() => {}} activeTab={"Cart"} />
      ) : (
        <Header style_2={true} />
      )}

      <CartBreadcrumb title="My Cart" subtitle="Cart" />
      <CartArea product={product} />
      <Footer />
    </Wrapper>
  );
}
