import React from "react";
import SEO from "@components/seo";
import filterSampleArea from "@components/user-dashboard/filter-samples";
import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import SectionTop from "@components/terms-policy/section-top-bar";

const filterSample = () => {
  return (
    <Wrapper>
      <SEO pageTitle={"filterSample"} />
      <Header style_2={true} />
      <SectionTop
        title="filterSample"
      />
      <filterSampleArea />
    
      <Footer />
    </Wrapper>
  );
};

export default filterSample;

