import { useState, useEffect } from "react";
import SEO from "@components/seo";
import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import CartArea from "@components/cart/cart-area";

export default function Cart({ query }) {
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
      {userId ? (
        <>
          {/* Breadcrumb with cart icon */}
          <CartBreadcrumb title="Cart" />
          <CartArea />
        </>
      ) : (
        <>
          <Header style_2={true} />
          <CartBreadcrumb title="Cart" subtitle="Cart" />
          <CartArea />
          <Footer />
        </>
      )}
    </Wrapper>
  );
}
