import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";


const cards = [
  {
    icon: "fa-file-alt",
    title: "Find a Sample",
    text: "Researchers can submit requests for specific biospecimens needed in their studies.",
    link: "/shop",
    button: "Submit Request",
    delay: "100"
  },
  {
    icon: "fa-clipboard-check",
    title: "Get Approval from Committee",
    text: "All requests are reviewed by an ethics or scientific committee before samples are released.",
    link: "/login",
    button: "Review by Committee",
    delay: "200"
  },
  {
    icon: "fa-hospital",
    title: "Register as a Collection Site",
    text: "Biobanks or hospitals can register to provide biospecimens to verified researchers.",
    link: "/register",
    button: "Register Collection Site",
    delay: "300"
  }
];


const Services = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <div 
      className="container-fluid py-5 p-4" 
      style={{ 
        // backgroundImage: `url(${bg.src})`, // Uncomment to use background image
        backgroundColor: "#f2f4f7",
        borderRadius: "8px",
      }}>
      <h2 className="text-center fw-bold mb-4" style={{ color: "#003366" }}>
        Our Services
      </h2>
      <div className="row g-5 text-center">
        {cards.map((card, index) => (
          <div 
            className="col-md-4" 
            key={index} 
            data-aos="fade-up" 
            data-aos-delay={card.delay}
          >
            <div
              className="card border-0 shadow-lg h-100 rounded-4"
              style={{
                transition: "transform 0.3s ease",
                backgroundColor: "#ffffff",
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0px 12px 24px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0px 10px 20px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div className="card-body p-4 d-flex flex-column justify-content-between">
                <div>
                  <div className="mb-3">
                    <i className={`fa ${card.icon} fa-2x`} style={{ color: "#003366" }} />
                  </div>
                  <h4 className="fw-bold text-dark">{card.title}</h4>
                  <p className="text-secondary">{card.text}</p>
                </div>
                <a 
                  href={card.link} 
                  className="btn btn-primary mt-3 px-4 py-2" 
                  style={{ 
                    backgroundColor: "#003366", 
                    border: "none", 
                    transition: "background-color 0.3s" 
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#002244"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#003366"}
                >
                  {card.button}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
