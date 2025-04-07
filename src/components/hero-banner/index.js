import React from "react";

const HeroBanner = () => {
  return (
    <section
      className="d-flex flex-column flex-md-row"
      style={{ height: "100vh", position: "relative" }}
    >
      {/* ✅ Left Side: Text Content */}
      <div
        className="d-flex flex-column justify-content-center align-items-start text-white px-4 py-5"
        style={{
          width: "100%",
          maxWidth: "50%",
          background:
            "linear-gradient(135deg, rgba(180, 58, 58, 0.85), rgba(58, 54, 54, 0.95))",
          zIndex: 2,
        }}
      >
        <h1 className="display-5 fw-bold mb-4 animate-bottom">
          Discover High-Quality Research Samples
        </h1>
        <p className="fs-5 mb-4 animate-bottom text-white">
          Browse, order, and add samples to your cart with ease.
        </p>
      </div>

      {/* ✅ Right Side: Video Background */}
      <div
        style={{
          width: "100%",
          maxWidth: "50%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-100 h-100"
          style={{ objectFit: "cover" }}
        >
          <source
            src="/assets/img/slider/13/samplevideo3.mp4"
            type="video/mp4"
          />
        </video>
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            background: "rgba(0, 0, 0, 0.25)",
            zIndex: 1,
          }}
        ></div>
      </div>

      {/* ✅ CSS Animation for Bottom-to-Top */}
      <style>{`
        .animate-bottom {
          opacity: 0;
          transform: translateY(40px);
          animation: slideUp 1s ease-out forwards;
        }

        @keyframes slideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default HeroBanner;
