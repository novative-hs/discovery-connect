import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AOS from "aos";
import {
  faSearch,
  faCreditCard,
  faUserCheck,
  faUsers,
  faShippingFast,
  faCheckCircle,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const StepFlow = () => {
  useEffect(() => {
    AOS.init({
      duration: 800, // animation duration in ms
      once: true, // animation happens only once
    });
  }, []);

  const steps = [
    {
      number: "1.",
      icon: faSearch,
      description: "Search for samples.",
      bgColor: "#FF6F61",
      animation: "fade-in",
    },
    {
      number: "2.",
      icon: faCreditCard,
      description: "Enter personal info, upload documents, payment, and place order.",
      bgColor: "#4CAF50",
      animation: "zoom-in",
    },
    {
      number: "3.",
      icon: faUserCheck,
      description: "Admin approval.",
      bgColor: "#8BC34A",
      animation: "slide-up",
    },
    {
      number: "4.",
      icon: faUsers,
      description: "Committee review.",
      bgColor: "#673AB7",
      animation: "flip-left",
    },
    {
      number: "5.",
      icon: faShippingFast,
      description: "Prepare sample and Dispatch the order.",
      bgColor: "#FFC107",
      animation: "rotate",
    },
    {
      number: "6.",
      icon: faCheckCircle,
      description: "Delivery complete.",
      bgColor: "#009688",
      animation: "bounce",
    },
  ];

  return (
    <div className="container-fluid my-5">
      {/* Heading */}
      <h4
        className="text-center mb-5"
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          color: "#2b2c7f",
          fontFamily: "sans-serif",
        }}
      >
        Process for Requesting Samples for Research
      </h4>

      <div
        className="d-flex justify-content-between align-items-start flex-nowrap w-100"
        style={{
          gap: "1rem",
          overflow: "hidden", // prevents scroll
          flexWrap: "nowrap",
          flexShrink: 1,
        }}
      >
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div
              className="d-flex flex-column align-items-center text-center px-3"
              style={{
                width: "160px",
                flexShrink: 0,
              }}
              data-aos={step.animation} // Add animation dynamically
              data-aos-duration="1000" // Animation duration
              data-aos-delay={index * 150} // Optional staggered delay
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-2"
                style={{
                  width: "60px",
                  height: "60px",
                  backgroundColor: step.bgColor,
                  color: "white",
                }}
              >
                <FontAwesomeIcon icon={step.icon} size="lg" />
              </div>
              <p className="fw-bold mb-1 text-primary">{step.number}</p>
              <div style={{ fontSize: "0.85rem", wordBreak: "break-word" }}>
                {step.description}
              </div>
            </div>

            {/* Arrow between steps */}
            {index !== steps.length - 1 && (
              <div
                className="d-flex align-items-center justify-content-center mt-5"
                style={{ fontSize: "20px", color: "#333" }}
                data-aos="fade-right" // Arrow animation
                data-aos-delay={index * 150 + 100}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepFlow;
