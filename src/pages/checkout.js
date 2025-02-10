import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";
import Header from "@layout/dashboardheader";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import Wrapper from "@layout/wrapper";
import CouponArea from "@components/checkout/coupon-area";
import CheckoutArea from "@components/checkout/checkout-area";
import Footer from "@layout/footer";
// import ShopCta from "@components/cta";
import useCheckoutSubmit from "@hooks/use-checkout-submit";
import { getLocalStorage } from "@utils/localstorage";
import OrderSummary from "@components/order/order-summary";

export default function Checkout() {
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  useEffect(() => {
    // Access localStorage safely on the client side
    const id = localStorage.getItem("userID");
    if (!id) {
      // Redirect to login if user is not authenticated
      router.push("/login");
    } else {
      setUserId(id);
      console.log("Researcher ID on checkout page is:", id);
    }
  }, [router]);
  const checkout_data = useCheckoutSubmit();
  return (
    <Wrapper>
      <SEO pageTitle={"Checkout"} />
      <CartBreadcrumb title="Checkout" subtitle="Checkout" />
      {/* <CouponArea {...checkout_data} /> */}
      <CheckoutArea {...checkout_data} />
      {/* <ShopCta /> */}
      <Footer />
    </Wrapper>
  );
}
