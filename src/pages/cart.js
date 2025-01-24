import SEO from "@components/seo";
import Footer from "@layout/footer";
import Wrapper from "@layout/wrapper";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import CartArea from "@components/cart/cart-area";
import OrderSummary from "@components/order/order-summary";
// import ShopCta from "@components/cta";


export default function Cart() {
  return (
    <Wrapper>
      <SEO pageTitle={"Cart"} />
      
      <CartBreadcrumb title='My Cart' subtitle='Cart' />
      <CartArea/>
      
      {/* <ShopCta/> */}
      <Footer />
    </Wrapper>
  );
}
