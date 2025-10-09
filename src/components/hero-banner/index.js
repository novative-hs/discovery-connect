import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";

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
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.playbackRate = 1.5;
      video.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("Video play interrupted:", err);
        }
      });
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
          preload="auto"
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{ objectFit: "cover", zIndex: -1 }}  // 👈 force it behind
        >
          <source src={videoSources[videoIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Dark Overlay */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"
          style={{ zIndex: 0 }}   // 👈 sits above video
        ></div>

        {/* Foreground Text */}
        <div
          className="position-relative mt-5 pt-5"
          style={{ maxWidth: "700px", zIndex: 1 }}  // 👈 always on top
        >
          <h1
            className="fw-bold mb-4 display-5 text-light"
            data-aos="fade-right"
          >
            Discovery Connect – Empowering Global Research Collaboration
          </h1>

          <p
            className="fs-5 mb-4 text-light"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            At <strong>Discovery Connect</strong>, we provide high-quality,
            disease-specific and healthy biospecimens directly from donors,
            making global research faster, more reliable, and more accessible.
          </p>

          <Link
            href="/register"
            className="btn btn-lg text-white p-3"
            style={{ backgroundColor: "#003366" }}
          >
            Register Yourself Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
