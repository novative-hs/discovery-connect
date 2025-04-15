import React from "react";
import bg from "@assets/img/contact/contact-bg.png";

const HeroBanner = () => {
  return (
    <div className="container-fluid p-0">
      <div className="position-relative d-flex flex-column justify-content-center align-items-start min-vh-100 px-5 py-5">
        {/* ✅ Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover z-0"
        >
          <source
            src="/assets/img/slider/13/samplevideo3.mp4"
            type="video/mp4"
          />
        </video>

        {/* ✅ Dark Overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: "rgba(0, 0, 0, 0.5)", // Dark semi-transparent overlay for better contrast
            zIndex: 1,
          }}
        />

        {/* ✅ Foreground Text */}
        <div
          className="position-relative"
          style={{ maxWidth: "700px", zIndex: 2, marginTop: "150px" }}
        >
          <h1
            className="fw-bold mb-4 display-4 text-light"
            data-aos="fade-right"
            style={{ color: "#fff" }}
          >
            Advancing Research with Quality Biospecimens
          </h1>

          <p
            className="fs-5 mb-4 text-light"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            We simplify research by providing disease-specific and healthy biospecimens directly from donors, enabling faster and more accessible scientific studies.
          </p>

          <a
            href="/register"
            className="btn btn-lg text-white p-3"
            data-aos="fade-up"
            style={{ backgroundColor: "#003366" }}
          >
            Register Now
          </a>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
