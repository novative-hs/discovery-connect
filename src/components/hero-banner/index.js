import React from "react";

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
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: "cover", zIndex: 0 }}
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
            background: "rgba(0, 0, 0, 0.5)", // Dark semi-transparent overlay
            zIndex: 1,
          }}
        />
  
        {/* ✅ Foreground Text */}
        <div
          className="position-relative mt-5"
          style={{ maxWidth: "700px", zIndex: 2 }}
        >
          <h1
            className="fw-bold mb-4 display-4"
            style={{ color: "#ffffff" }}
            data-aos="fade-right"
          >
            From Collection to Delivery of{" "}
            <span style={{ color: "#66ccff" }}>Biospecimens</span>
          </h1>
  
          <p
            className="fs-5 mb-4"
            style={{ color: "#ffffff" }}
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Our platform connects collection sites, researchers, and admins to
            manage, approve, and deliver human biospecimens easily.
          </p>
  
          <a
            href="/register"
            className="btn btn-lg text-white p-3"
            data-aos="fade-up"
            data-aos-delay="500"
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
