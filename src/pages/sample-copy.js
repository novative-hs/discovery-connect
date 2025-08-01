import { useEffect } from "react";
import { useRouter } from "next/router";
// internal
import SEO from "@components/seo";
import Header from "@layout/dashboardheader";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import Wrapper from "@layout/wrapper";

import CheckoutArea from "@components/checkout/checkout-area";
import Footer from "@layout/footer";

import useCheckoutSubmit from "@hooks/use-checkout-submit";
import { getsessionStorage } from "@utils/sessionStorage";
import SampleCopy from "@components/checkout/sample-copy";

export default function Checkout() {
  //const checkout_data = useCheckoutSubmit();
  const checkout_data=getsessionStorage("cart")
  const router = useRouter();
  useEffect(() => {
    const isAuthenticate = sessionStorage.getItem("userID");
    if(!isAuthenticate){
      router.push("/login")
    }
  },[router])
  return (
    <Wrapper>
      <SEO pageTitle={"Sample Approval Document"} />
      <CartBreadcrumb title="Sample Approval Document" subtitle="Sample Approval Document" />
      
      <SampleCopy/>     
      
      <Footer />
    </Wrapper>
  );
}
