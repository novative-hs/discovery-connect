import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";
import Header from "@layout/dashboardheader";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import Wrapper from "@layout/wrapper";
import CheckoutArea from "@components/checkout/checkout-area";
import Footer from "@layout/footer";
import { getsessionStorage } from "@utils/sessionStorage";
import SampleCopy from "@components/checkout/sample-copy";

export default function Checkout() {
  const [checkoutData, setCheckoutData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticate = sessionStorage.getItem("userID");
      if (!isAuthenticate) {
        router.push("/login");
      } else {
        // safely read cart data from sessionStorage
        const cartData = getsessionStorage("cart");
        setCheckoutData(cartData);
      }
    }
  }, [router]);

  return (
    <Wrapper>
      <SEO pageTitle={"Sample Approval Document"} />
      <CartBreadcrumb
        title="Sample Approval Document"
        subtitle="Sample Approval Document"
      />

      {/* only render after client-side sessionStorage is available */}
      {checkoutData && <SampleCopy />}

      <Footer />
    </Wrapper>
  );
}
