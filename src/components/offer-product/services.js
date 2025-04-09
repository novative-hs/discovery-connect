import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

const cards = [
  {
    icon: "fa-flask",
    title: "Find a Sample",
    text: "Browse a vast collection of high-quality research samples.",
    link: "/shop",
    button: "Search Sample",
    delay: "100"
  },
  {
    icon: "fa-box",
    title: "Order a Sample",
    text: "Easily request and receive samples tailored to your research needs.",
    link: "/cart",
    button: "Order Now",
    delay: "200"
  },
  {
    icon: "fa-flask",
    title: "Add a Sample",
    text: "Register your collection site to add and manage samples.",
    link: "/register",
    button: "Click here to Register",
    delay: "300"
  },
];

const Services = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <div className="container-fluid py-5 p-4" style={{ background: "linear-gradient(135deg, #f8f9fa,rgb(212, 229, 246))" }}>
      <h2 className="text-center fw-bold mb-4" style={{ color: "#003366" }}>
        Our Services
      </h2>
      <div className="row g-5 text-center">
        {cards.map((card, index) => (
          <div className="col-md-4" key={index} data-aos="fade-up" data-aos-delay={card.delay}>
            <div
  className="card border-0 shadow-sm h-100 rounded-4"
  style={{
    transition: "transform 0.3s ease",
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.05)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
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
                  style={{ backgroundColor: '#003366', border: 'none' }}
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
