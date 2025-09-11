import Footer from "@layout/footer";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import SEO from "@components/seo";
import SectionTop from "@components/terms-policy/section-top-bar";
import PolicyArea from "@components/terms-policy/policy-area";

export default function Policy() {
  return (
    <Wrapper>
      <SEO pageTitle={"Policy"} />
      <Header style_2={true} />
      <SectionTop
        title={
          <h2 style={{ fontSize: '40px', fontFamily: 'Montserrat, sans-serif', fontWeight: '700', color: "white" }}>
            Welcome to Discovery Connect
          </h2>
        }
        backgroundImage="/assets/img/about/good.jpg"

      />
      <PolicyArea />
      <Footer />
    </Wrapper>
  );
}
