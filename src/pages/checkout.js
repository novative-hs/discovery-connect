import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";
import Header from "@layout/header"; // <-- make sure both headers are imported
import DashbaordHeader from "@layout/dashboardheader";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import Wrapper from "@layout/wrapper";

import CheckoutArea from "@components/checkout/checkout-area";
import Footer from "@layout/footer";

import useCheckoutSubmit from "@hooks/use-checkout-submit";

export default function Checkout() {
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = sessionStorage.getItem("userID");
      if (!id) {
        router.push("/login");
      } else {
        setUserId(id);
      }
      setLoadingUser(false);
    }
  }, [router]);

  const checkout_data = useCheckoutSubmit();

  if (loadingUser) return <div>Loading...</div>;

  return (
    <Wrapper>
      <SEO pageTitle={"Checkout"} />
            {userId ? (
        <>
          <CartBreadcrumb title="Checkout" subtitle="Checkout" />
          <CheckoutArea {...checkout_data} />
        </>
      ) : (
        <>
          <Header style_2={true} />
          <CartBreadcrumb title="Checkout" subtitle="Checkout" />
          <CheckoutArea {...checkout_data} />
          <Footer />
        </>
      )}  
    </Wrapper>
  );
}
