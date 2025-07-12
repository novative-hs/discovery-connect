import React from "react";
// internal
import SEO from "@components/seo";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import HeroBanner from "@components/hero-banner";
// import ShopCategoryArea from "@components/shop-category/shop-category";
// import ShopProducts from "@components/products";
import OfferPopularProduct from "@components/offer-product";
// import ShopBanner from "@components/shop-banner";
// import ShopFeature from "@components/shop-feature";

import Footer from "@layout/footer";
import BioSpecimenSection from "@components/offer-product/biospecimensection";
import Services from "@components/offer-product/services";
import BackToTopCom from "@components/common/scroll-to-top";
import StepFlow from "@components/offer-product/stepflow";


const HomeShop = () => {
  return (
    <Wrapper>
      <SEO pageTitle={"Home Shop"} />
      <Header />
      <HeroBanner />
      
      <Services/>
      <StepFlow/>
      <BioSpecimenSection/>
      
      {/* <ShopCategoryArea />
      <ShopProducts /> */}
      <OfferPopularProduct />
      {/* <ShopBanner /> */}
      {/* <ShopFeature /> */}
      
      <BackToTopCom/>
      <Footer />
    </Wrapper>
  );
};

export default HomeShop;
