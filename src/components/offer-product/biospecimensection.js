import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const BioSpecimenSection = () => {
  const [bioVisible, setBioVisible] = useState(new Array(3).fill(false));
  const bioRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = bioRef.current.indexOf(entry.target);
          if (entry.isIntersecting && index !== -1) {
            setBioVisible((prev) => {
              const updated = [...prev];
              updated[index] = true;
              return updated;
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    bioRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      bioRef.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  return (
    <Container fluid className="py-5 bg-light" id="bio-section">
      <Row className="align-items-center">
        {/* Text Section */}
        <Col md={6}>
          <div
            ref={(el) => (bioRef.current[0] = el)}
            className={`p-4 transition ${bioVisible[0] ? "visible slide-in-right" : "hidden"}`}
            >
              <h3 className="fw-bold text-danger">
            Providing high-quality biospecimens to advance global healthcare and scientific research.
          </h3>
          
          </div>
        </Col>

        {/* Image Section in Zig-Zag Layout */}
        <Col md={6} className="d-flex flex-column">
          <Row ref={(el) => (bioRef.current[1] = el)} className="g-3">
            <Col xs={6} className="text-end">
              <img
                src="/assets/img/slider/13/slider-10.png"
                alt="Microscope"
                className={`img-fluid rounded shadow transition ${bioVisible[1] ? "visible slide-in-left" : "hidden"}`}
                style={{ width: "90%" }}
              />
            </Col>
            <Col xs={6} className="text-start">
              <img
                src="/assets/img/slider/13/slider-9.png"
                alt="Scientist"
                className={`img-fluid rounded shadow transition ${bioVisible[1] ? "visible slide-in-left" : "hidden"}`}
                style={{ width: "90%" }}
              />
            </Col>
          </Row>

          <Row ref={(el) => (bioRef.current[2] = el)} className="g-3 mt-3">
            <Col xs={6} className="text-start">
              <img
                src="/assets/img/slider/13/slider-6.png"
                alt="Lab"
                className={`img-fluid rounded shadow transition ${bioVisible[2] ? "visible slide-in-left" : "hidden"}`}
                style={{ width: "90%" }}
              />
            </Col>
            <Col xs={6} className="text-end">
              <img
                src="/assets/img/slider/13/slider-3.png"
                alt="Experiment"
                className={`img-fluid rounded shadow transition ${bioVisible[2] ? "visible slide-in-left" : "hidden"}`}
                style={{ width: "90%" }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <style>{`
        .transition {
          transition: all 1s ease-in-out;
        }
        .hidden {
          opacity: 0;
        }
        .visible {
          opacity: 1;
        }
        .slide-in-left {
          transform: translateX(-100%);
        }
        .slide-in-right {
          transform: translateX(100%);
        }
        .visible.slide-in-left,
        .visible.slide-in-right {
          transform: translateX(0);
        }
      `}</style>
    </Container>
  );
};

export default BioSpecimenSection;