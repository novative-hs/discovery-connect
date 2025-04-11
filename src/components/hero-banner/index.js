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
             background: "rgba(104, 101, 101, 0.5)", // Dark semi-transparent overlay
            //backgroundImage: `url(${bg.src})`,
            zIndex: 1,
          }}
        />

        {/* ✅ Foreground Text */}
        <div
          className="position-relative "
          style={{ maxWidth: "700px", zIndex: 2,marginTop:'200px' }}
        >
          <h1
            className="fw-bold mb-4 display-4 text-dark"
            data-aos="fade-right"
          >
            Transforming Disease Research with{" "}
            <span style={{ color: "#66ccff" }}>Discovery Connect</span>
          </h1>

          <p
            className="fs-5 mb-4 text-white"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            Facilitating scientific research by collecting biological samples
            from patients diagnosed with specific diseases. These samples will
            be used by researchers and laboratories across the country, driving
            diverse scientific studies and advancements.
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
