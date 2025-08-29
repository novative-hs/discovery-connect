import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  faSearch,
  faCreditCard,
  faUserCheck,
  faUsers,
  faShippingFast,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

const StepFlow = () => {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const steps = [
    { title: "Search", icon: faSearch, description: "Search for samples" },
    { title: "Register", icon: faCreditCard, description: "Create login, upload required documents, and make payment to place order" },
    { title: "Acknowledgment", icon: faUserCheck, description: "Order Acknowledgment" },
    { title: "Review", icon: faUsers, description: "Scientific and Ethical Committee review approval" },
    { title: "Dispatch", icon: faShippingFast, description: "Order Dispatch" },
  ];

  // Split steps
  const firstRow = steps.slice(0, 2);
  const secondRow = steps.slice(2);

  return (
    <div className="container my-5">
      <h4 className="text-center mb-5 fw-bold" style={{ color: "#2b2c7f" }}>
        Process for requesting samples for Research and Product Development
      </h4>

      {/* First Row */}
      <div className="d-flex justify-content-center flex-wrap mb-4" style={{ gap: "1rem" }}>
        {firstRow.map((step, index) => (
          <StepCard key={index} step={step} index={index} isLast={index === firstRow.length - 1} />
        ))}
      </div>

      {/* Second Row */}
      <div className="d-flex justify-content-center flex-wrap" style={{ gap: "1rem" }}>
        {secondRow.map((step, index) => (
          <StepCard key={index} step={step} index={index + 2} isLast={index === secondRow.length - 1} />
        ))}
      </div>
    </div>
  );
};

// Extracted Card Component for reusability
const StepCard = ({ step, index, isLast }) => (
  <>
    <div
      className="text-center bg-white shadow-sm rounded-4 p-4"
      style={{ width: "280px", border: "2px solid #e0e0e0", zIndex: 1 }}
      data-aos="fade-up"
      data-aos-delay={index * 150}
    >
      <div
        className="mb-3 mx-auto rounded-circle d-flex justify-content-center align-items-center"
        style={{ width: "60px", height: "60px", backgroundColor: "#2b2c7f", color: "white", fontSize: "24px" }}
      >
        <FontAwesomeIcon icon={step.icon} />
      </div>
      <h6 className="text-dark mb-2">{step.title}</h6>
      <p className="small text-muted mb-0">{step.description}</p>
    </div>

    {!isLast && (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ width: "50px", minWidth: "50px" }}
        data-aos="fade-right"
        data-aos-delay={index * 150 + 100}
      >
        <FontAwesomeIcon icon={faArrowRight} style={{ fontSize: "40px", color: "#2b2c7f" }} />
      </div>
    )}
  </>
);


export default StepFlow;
