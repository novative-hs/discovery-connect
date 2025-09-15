import React from "react";
import AboutCard from "./AboutCard";

const TextArea = () => {
  return (
    <section className="about-area py-5" style={{ background: "#f5f8ff" }}>
      <div className="container">
        <AboutCard
          title="Who we are?"
          image="/assets/img/about/about4.jpeg"
          text={
            <>
              <strong style={{ color: "#2d3958" }}>
                “Discovery Connect - Collection and Distribution of Human Biological Material”
              </strong>{" "}
              The project aims for collection, storage and distribution of Human Biological
              Materials (Serum, Plasma, Blood, Urine, Sputum, Pus, Body Fluids, Tissues etc..)
              both specific disease oriented or normal human serum and plasma for the manufacturing
              of In-Vitro Diagnostic products.
              <br />
              <br />
              At Discovery-Connect, we are revolutionizing the way researchers access biological
              samples for their studies after scientific and ethical board approval. Our platform
              also serves as a bridge between researcher, and collection sites, ensuring a seamless,
              secure, and efficient process for obtaining high-quality samples essential for
              groundbreaking research.
            </>
          }
        />

        <AboutCard
          title="Our Mission"
          image="/assets/img/about/about3.jpeg"
          text="This initiative aims to enhance the availability of high-quality human biological samples. Facilitate advancements in diagnostic, therapeutic, and preventive measures and supply normal Human serum and plasma for the IVD Product manufacturer."
          reverse
          animation="fade-left"
        />

        <AboutCard
          title="Join Us Today!"
          image="/assets/img/about/aboutus2.jpeg"
          text="Be part of a trusted platform dedicated to advancing product development. Sign up now and start discovering the right samples for your study!"
        />
      </div>
    </section>
  );
};

export default TextArea;
