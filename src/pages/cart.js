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
      const id = sessionStorage.getItem("userID");
      setUserId(id);
      setLoadingUser(false);
      
    }
  }, []);

  if (loadingUser) return <div>Loading...</div>;

  return (
    <Wrapper>
      <SEO pageTitle={"Cart"} />
      {userId ? (
  <>
    <CartBreadcrumb title='My Cart' subtitle='Cart' />
<CartArea product={product} /> 
  </>
) : (
  <>
    <Header style_2={true} />
    <CartBreadcrumb title='My Cart' subtitle='Cart' />
    <CartArea product={product} />
    <Footer />
  </>
)}   
    </Wrapper>
  );
}
