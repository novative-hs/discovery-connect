import SEO from "@components/seo";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import SectionTop from "@components/terms-policy/section-top-bar";
import Footer from "@layout/footer";
import TermsArea from "@components/terms-policy/terms-area";

export default function Terms() {
  return (
    <Wrapper>
      <SEO pageTitle={"Terms"} />
      <Header style_2={true} />
      <SectionTop
        title="Terms and Conditions"
        subtitle="Please read our terms carefully"
        backgroundImage="/assets/img/about/aboutus.jpg"
      />

      <TermsArea />
      <Footer />
    </Wrapper>
  );
}
