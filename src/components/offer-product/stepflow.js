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
    {
      title: "Search",
      icon: faSearch,
      description: "Search for samples",
    },
    {
      title: "Register",
      icon: faCreditCard,
      description: "Create login, upload required documents, and make payment to place order",
    },
    {
      title: "Acknowledgment",
      icon: faUserCheck,
      description: "Order Acknowledgment",
    },
    {
      title: "Review",
      icon: faUsers,
      description: "Scientific and Ethical Committee review approval",
    },
    {
      title: "Dispatch",
      icon: faShippingFast,
      description: "Order Dispatch",
    },
  ];

  return (
    <div className="container my-5">
      <h4 className="text-center mb-5" style={{ fontWeight: "bold", color: "#2b2c7f" }}>
        Process for Requesting Samples for Research
      </h4>

      <div className="d-flex justify-content-center position-relative flex-wrap">
         
        <div className="d-flex justify-content-between align-items-stretch flex-nowrap w-100"
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
  className="text-center bg-white shadow-sm rounded-4 p-4"
  style={{
    width: "280px", // wider box
    zIndex: 1,
    border: "2px solid #e0e0e0",
  }}
  data-aos="fade-up"
  data-aos-delay={index * 150}
>
  <div
    className="mb-3 mx-auto rounded-circle d-flex justify-content-center align-items-center"
    style={{
      width: "60px",
      height: "60px",
      backgroundColor: "#2b2c7f",
      color: "white",
      fontSize: "24px",
    }}
  >
    <FontAwesomeIcon icon={step.icon} />
  </div>
  <h6 className="text-dark mb-2">{step.title}</h6>
  <p className="small text-muted mb-0">{step.description}</p>
</div>


              {/* Arrow (except after the last step) */}
              {index !== steps.length - 1 && (
                <div
  className="d-flex align-items-center justify-content-center"
  style={{
    width: "50px", // fixed space between cards
    minWidth: "50px",
    height: "100%",
  }}
  data-aos="fade-right"
  data-aos-delay={index * 150 + 100}
>
  <FontAwesomeIcon
    icon={faArrowRight}
    style={{ fontSize: "40px", color: "#2b2c7f" }}
  />
</div>

              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepFlow;
