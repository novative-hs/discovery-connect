import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AOS from "aos";
import "aos/dist/aos.css";
import "bootstrap/dist/css/bootstrap.min.css";
const BioSpecimenSection = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const images = [
    "/assets/img/slider/13/slider-3.png",
    "/assets/img/slider/13/slider-8.png",
    "/assets/img/slider/13/slider-6.png",
    "/assets/img/slider/13/slider-11.jpg",

  ];

  return (
    <div
      className="py-5"
      style={
        {
          // background: "linear-gradient(135deg, #f8f9fa, rgb(212, 229, 246))"
          // backgroundImage: `url(${bg.src})`
        }
      }
      id="bio-section"
    >
      <Container>
        <h2 className="text-center fw-bold mb-4" style={{ color: "#003366" }}>
          Premium Human Biospecimens for Research and Product Development
        </h2>

        <Row className="align-items-center">
          <Col md={6} className="mb-4 mb-md-0" data-aos="fade-right">
            <h3 className="fw-bold mb-3 fs-2 fs-md-1">

              <span
                style={{
                  background: "linear-gradient(to right, #007bff, #00b4d8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Helping Researchers Access Quality Samples
              </span>{" "}
              for Scientific Discovery.
            </h3>
            <p className="text-secondary fs-5">
              We provide reliable biospecimens to support your research and innovation.
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
                      style={{
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
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
