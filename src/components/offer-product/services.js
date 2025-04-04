import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router"; // Importing useRouter for redirect

const Services = () => {
  const servicesRef = useRef([]);
  const [visible, setVisible] = useState([false, false, false]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const router = useRouter();

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

  // Click handler function
  const handleServiceClick = (service) => {
    router.push(service.link);
  };

  // Background colors and text colors for hover effect
  const hoverColors = ["bg-success", "bg-success", "bg-success"];
  const hoverTextColors = ["text-white", "text-black", "text-white"];

  return (
    <div className="d-flex flex-row justify-content-center text-center gap-6 p-4 bg-gradient-to-r from-indigo-900 to-blue-900 text-black w-full mt-5">
      {[
        {
          title: "Find a Sample",
          description: "Browse a vast collection of high-quality research samples.",
          icon: "fa fa-flask",
          link: "/shop",
        },
        {
          title: "Order a Sample",
          description: "Easily request and receive samples tailored to your research needs.",
          icon: "fa fa-box",
          link: "/shop",
        },
        {
          title: "Add Sample to Cart",
          description: "Select and add samples to your cart for easy checkout.",
          icon: "fa fa-shopping-cart",
          link: "/shop",
        },
      ].map((service, index) => (
        <div
          key={index}
          ref={(el) => (servicesRef.current[index] = el)}
          className={`flex flex-col items-center p-2 border border-black rounded shadow-md 
                    h-48 w-75 cursor-pointer transition-all transform hover:scale-110 
                    duration-300 ease-in-out ${
                      hoveredIndex === index ? hoverColors[index] : "bg-white"
                    }
                    ${
                      hoveredIndex === index
                        ? hoverTextColors[index]
                        : "text-black"
                    }`}
          style={{
            width: "250px", // Fixed width
            transition: "opacity 0.8s ease-out", // Only fade-in effect
            opacity: visible[index] ? 1 : 0, // Fade-in effect only
          }}
          onClick={() => handleServiceClick(service)}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div className="text-5xl mb-4">
            <i
              className={`${service.icon} ${
                hoveredIndex === index ? "text-white" : "text-danger"
              } fs-1`}
            ></i>
          </div>
          <h3
            className={`text-xl font-semibold fs-4 ${
              hoveredIndex === index ? "text-white" : "text-black"
            }`}
          >
            {service.title}
          </h3>
          <p
            className={`mt-2 fs-6 ${
              hoveredIndex === index ? "text-white" : "text-black"
            } 
   whitespace-nowrap overflow-hidden text-ellipsis`}
          >
            {service.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Services;
