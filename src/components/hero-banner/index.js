import Services from "@components/offer-product/services";

import React from "react";

const HeroBanner = () => {
  return (
    <section className="position-relative" style={{ height: "100vh",marginBottom:'150px' }}>
      {/* ✅ Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          objectFit: "cover",
          zIndex: "-2", // Video is at the bottom
        }}
      >
        <source src="/assets/img/slider/13/samplevideo3.mp4" type="video/mp4" />
      </video>

      {/* ✅ Dark Overlay */}
      <div className="position-absolute top-0 start-0 w-100 bg-dark h-100 opacity-50" style={{ zIndex: "-1" }}></div>

      {/* ✅ Text Content */}
      <div className="container position-absolute top-50 start-50 translate-middle text-center text-white" style={{ zIndex: "1" }}>
        <h1
          className="fw-bold text-white"
          style={{
            fontFamily: '"Poppins", sans-serif',
            fontSize: "2.8rem",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          Hassle-Free Sample Collection
        </h1>
        <h3
          className="fw-bold text-white"
          style={{
            fontFamily: '"Playfair Display", serif',
            fontSize: "2.3rem",
            fontWeight: "700",
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          }}
        >
          Order. Collect. Analyze.
        </h3>
      </div>

      {/* ✅ Services Below Center */}
      <div
        className="position-absolute top-60 start-50 translate-middle-x p-5"
        style={{ zIndex: "2", width: "100%" ,marginTop:'600px'}}
      >
        <Services />
      </div>
      
    </section>
    
  );
};
export default HeroBanner