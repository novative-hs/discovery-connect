import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";

const HeroBanner = () => {
  const videoRef = useRef(null);
  const [videoIndex, setVideoIndex] = useState(0);

  const videoSources = [
    "/assets/img/slider/13/samplevideo4.mp4",
    "/assets/img/slider/13/samplevideo1.mp4",
  ];

  useEffect(() => {
    const videoElement = videoRef.current;
    const handleEnded = () => {
      setVideoIndex((prevIndex) => (prevIndex + 1) % videoSources.length);
    };
    if (videoElement) {
      videoElement.addEventListener("ended", handleEnded);
      videoElement.playbackRate = 1.5;
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("ended", handleEnded);
      }
    };
  }, [videoSources.length]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
      videoRef.current.playbackRate = 1.5;
    }
  }, [videoIndex]);

  return (
    <div className="container-fluid p-0">
      <div className="position-relative d-flex flex-column justify-content-center align-items-start min-vh-100 px-5 py-5">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          loop={false}
          preload="none"
          className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover z-0"
        >
          <source src={videoSources[videoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50 z-1"></div>

        {/* Foreground Text */}
        <div
          className="position-relative z-2 mt-5 pt-5"
          style={{ maxWidth: "700px" }}
        >
          <h4
            className="fw-bold mb-4 display-5 text-light"
            data-aos="fade-right"
          >
            Advancing Research with Quality Biospecimens
          </h4>
          <p
            className="fs-5 mb-4 text-light"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            We simplify research by providing disease-specific and healthy
            biospecimens directly from donors, enabling faster and more
            accessible scientific studies.
          </p>
          <Link href="/register" className="btn btn-lg text-white p-3" style={{ backgroundColor: "#003366" }}>
            Register Yourself Now
          </Link>

        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
