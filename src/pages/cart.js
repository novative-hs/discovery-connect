import SEO from "@components/seo";
import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";
import CartArea from "@components/cart/cart-area";
// import ShopCta from "@components/cta";
import { useGetAllSamplesQuery } from "src/redux/features/productApi";


export default function Cart({ query }) {
  const { data: product, isError, isLoading, error } = useGetAllSamplesQuery();
  return (
    <Wrapper>
      <SEO pageTitle={"Cart"} />
      <Header style_2={true} />
      <CartBreadcrumb title='My Cart' subtitle='Cart' />
      <CartArea  product={product}/>
      <CartArea/>
      {/* <ShopCta/> */}
      <Footer />
    </Wrapper>
  );
}