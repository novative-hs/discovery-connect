import { useState, useEffect } from "react";
import SEO from "@components/seo";
import Footer from "@layout/footer";
import Header from "@layout/header";
import DashbaordHeader from "@layout/dashboardheader";
import Wrapper from "@layout/wrapper";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import CartArea from "@components/cart/cart-area";
// import ShopCta from "@components/cta";
import { useGetAllSamplesQuery } from "src/redux/features/productApi";

export default function Cart({ query }) {
  const { data: product, isError, isLoading, error } = useGetAllSamplesQuery();

  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = localStorage.getItem("userID");
      setUserId(id);
      setLoadingUser(false);
      if (id) console.log("account_id on cart page is:", id);
    }
  }, []);

  if (loadingUser) return <div>Loading...</div>;

  return (
    <Wrapper>
      <SEO pageTitle={"Cart"} />
      {userId ? <DashbaordHeader style_2={true} style={{ overflowX: "hidden" }} /> : <Header style_2={true} />}
      <CartBreadcrumb title='My Cart' subtitle='Cart' />
      <CartArea product={product} />
      {/* <ShopCta /> */}
      <Footer />
    </Wrapper>
  );
}
