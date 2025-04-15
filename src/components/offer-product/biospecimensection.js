import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Policy from "src/pages/policy";
import bg from "@assets/img/contact/contact-bg.png";
const BioSpecimenSection = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const images = [
    "/assets/img/slider/13/slider-9.png",
    "/assets/img/slider/13/slider-6.png", 
    "/assets/img/slider/13/slider-11.jpg",
    "/assets/img/slider/13/slider-10.png",
  ];

  return (
    <div
      className="py-5"
      style={{
       // background: "linear-gradient(135deg, #f8f9fa, rgb(212, 229, 246))"
       // backgroundImage: `url(${bg.src})`
      }}
      id="bio-section"
    >
      <Container>
      <h2 className="text-center fw-bold mb-4" style={{ color: "#003366" }}>
  Premium Human Biospecimens for Research
</h2>

        <Row className="align-items-center">
          <Col md={6} className="mb-4 mb-md-0" data-aos="fade-right">
          <h2 className="fw-bold mb-3" style={{ fontSize: "2.5rem" }}>
  <span
    style={{
      background: "linear-gradient(to right, #007bff, #00b4d8)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Explore Cutting-Edge Biobanking Solutions
  </span>{" "}
  for Advancing Medical and Scientific Innovation.
</h2>
<p className="text-secondary fs-5">
  Access a diverse range of biospecimens for groundbreaking research.
</p>

          </Col>

          <Col md={6}>
            <Row className="g-3">
              {images.map((image, index) => (
                <Col xs={6} key={index} data-aos="zoom-in">
                  <div className="rounded overflow-hidden shadow-sm">
                    <img
                      src={image}
                      alt={`Specimen ${index + 1}`}
                      className="img-fluid"
                      style={{ height: "100%", objectFit: "cover", borderRadius: "10px" }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};


export default BioSpecimenSection;
