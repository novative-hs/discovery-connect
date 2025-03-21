import React from "react";
import SEO from "@components/seo";
import AboutArea from "@components/about";
import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import SectionTop from "@components/terms-policy/section-top-bar";

const About = () => {
  return (
    <Wrapper>
      <SEO pageTitle={"About"} />
      <Header style_2={true} />
      <SectionTop
        title="ABOUT US"
      />
      <AboutArea />
    
      <Footer />
    </Wrapper>
  );
};

export default About;

