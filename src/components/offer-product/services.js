import React, { useEffect, useRef, useState } from "react";

const Services = () => {
  const servicesRef = useRef([]);
  const [visible, setVisible] = useState([false, false, false]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = servicesRef.current.indexOf(entry.target);
          if (entry.isIntersecting && index !== -1) {
            setVisible((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    servicesRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      servicesRef.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div
      className="d-flex flex-row justify-content-center text-center gap-6 p-6 bg-gradient-to-r from-indigo-900 to-blue-900 text-white w-full"
    >
      {[
        {
          title: "Find a Sample",
          description: "Browse a vast collection of high-quality research samples.",
          icon: "fa fa-flask",
          bg: "bg-info",
        },
        {
          title: "Order a Sample",
          description: "Easily request and receive samples tailored to your research needs.",
          icon: "fa fa-box",
          bg: "bg-success",
        },
        {
          title: "Verify an Order",
          description: "Check and approve orders with detailed tracking and documentation.",
          icon: "fa fa-file-alt",
          bg: "bg-secondary",
        },
      ].map((service, index) => (
        <div
          key={index}
          ref={(el) => (servicesRef.current[index] = el)}
          className={`flex flex-col items-center p-4 ${service.bg} rounded-2xl shadow-lg w-100 md:w-1/3 min-h-[250px]`}
          style={{
            transition: "transform 0.8s ease-out, opacity 0.8s ease-out",
            transform: visible[index] ? "translateX(0)" : "translateX(-200px)",
            opacity: visible[index] ? 1 : 0,
          }}
        >
          <div className="text-5xl mb-4">
            <i className={`${service.icon} text-white fs-1`}></i>
          </div>
          <h3 className="text-xl font-semibold fs-2">{service.title}</h3>
          <p className="mt-2 text-white fs-6">{service.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Services;
