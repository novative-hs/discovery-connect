import { useEffect } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";
import Header from "@layout/organizationheader";
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
  //const checkout_data = useCheckoutSubmit();
  const checkout_data=getLocalStorage("cart")
  const router = useRouter();
  useEffect(() => {
    const isAuthenticate = localStorage.getItem("userID");
    if(!isAuthenticate){
      router.push("/login")
    }
  },[router])
  return (
    <Wrapper>
      <SEO pageTitle={"Checkout"} />
      <CartBreadcrumb title="Checkout" subtitle="Checkout" />
      
      <CheckoutArea {...checkout_data} />      
      {/* <ShopCta /> */}
      <Footer />
    </Wrapper>
  );
}
