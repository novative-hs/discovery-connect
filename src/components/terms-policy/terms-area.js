import React, { useEffect } from "react";
import {
  FaUserCheck,
  FaFlask,
  FaShieldAlt,
  FaBalanceScale,
  FaExclamationTriangle,
  FaSyncAlt,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const TermsArea = () => {
  useEffect(() => {
    AOS.init({ duration: 1200, once: true });
  }, []);

  const IconWrapper = ({ icon: Icon, color }) => (
    <span
      className="d-inline-flex align-items-center justify-content-center rounded-circle me-3"
      style={{
        backgroundColor: color,
        color: "white",
        width: "48px",
        height: "48px",
      }}
    >
      <Icon size={20} />
    </span>
  );

  return (
    <section
      className="policy__area py-5"
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
            {/* Introduction Card */}
            <div
              className="p-4 mb-4 rounded-3 policy-card"
              data-aos="fade-up"
              style={{
                background: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <p className="text-start mb-0 fs-5" style={{textAlign: "justify"}}>
                <strong className="d-block mb-2 fs-5">
                  “Discovery Connect - Collection and Distribution of Human Biological Material”
                  </strong>
              </p>
              <p className="text-start mb-0 mt-3 fs-5" style={{textAlign: "justify"}}>
                Discovery-Connect is the custodian of the HBM and agrees to use this HBM as outlined by the consent.
                If the HBM is given to another party, it would be through a Material Transfer Agreement (MTA) and
                appropriate ethical, scientific, and legal approval.
              </p>
               <p className="text-start mb-0 mt-3 fs-5" style={{textAlign: "justify"}}>
                The project aims for collection, storage and distribution of Human Biological Materials
                (Serum, Plasma, Blood, Urine, Sputum, Pus, Body Fluids, Tissues etc.) both specific disease
                oriented or normal human serum and plasma for the manufacturing of In-Vitro Diagnostic products.
              </p>
            </div>

            {/* Informed Consent */}
            <div
              className="p-4 mb-4 rounded-3 policy-card"
              data-aos="fade-up"
              style={{
                background: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <h4 className="fw-bold text-dark d-flex align-items-center mb-4">
                <IconWrapper icon={FaUserCheck} color="#28a745" />
                Informed Consent
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#28a745" }}>•</span>
                  <span className="fs-5">
                    Participation in Discovery Connect is entirely voluntary. Only individuals who provide written informed consent may contribute samples. Participants may withdraw at any time without any impact on their current or future medical care.
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#28a745" }}>•</span>
                  <span className="fs-5">
                    Participants may withdraw consent at any time by contacting Discovery Connect. Upon withdrawal, no further use of the participants biological material or data will occur; however, materials or data that have already been distributed or anonymized may continue to be used.
                  </span>
                </li>
              </ul>
            </div>

            {/* Collection, Storage, and Use of Samples */}
            <div
              className="p-4 mb-4 rounded-3 policy-card"
              data-aos="fade-up"
              style={{
                background: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <h4 className="fw-bold text-dark d-flex align-items-center mb-4">
                <IconWrapper icon={FaFlask} color="#17a2b8" />
                Collection, Storage, and Use of Samples
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#17a2b8" }}>•</span>
                  <span className="fs-5">
                    Samples will be stored securely for a period of analyte stability at the stored temperature.
                  </span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#17a2b8" }}>•</span>
                  <span className="fs-5">
                    Samples and associated data may be used for:
                    <ul className="ps-4 mt-2 list-unstyled">
                      <li className="mb-2 d-flex align-items-start">
                        <span className="me-2 fw-bold">-</span>
                        <span>Development of diagnostics or treatments</span>
                      </li>
                      <li className="d-flex align-items-start">
                        <span className="me-2 fw-bold">-</span>
                        <span>
                          Research and Development after scientific and ethical approval in addition to IRB.
                        </span>
                      </li>
                    </ul>
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#17a2b8" }}>•</span>
                  <span className="fs-5">
                    Samples will not be used for cloning, reproductive research, or any prohibited activities.
                  </span>
                </li>
              </ul>
            </div>

            {/* Privacy and Data Protection */}
            <div
              className="p-4 mb-4 rounded-3 policy-card"
              data-aos="fade-up"
              style={{
                background: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <h4 className="fw-bold text-dark d-flex align-items-center mb-4">
                <IconWrapper icon={FaShieldAlt} color="#ffc107" />
                Privacy and Data Protection
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#ffc107" }}>•</span>
                  <span className="fs-5">
                    Personal identifiers will be removed or pseudonymized where possible.
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#ffc107" }}>•</span>
                  <span className="fs-5">
                    Discovery-Connect will comply with all applicable data protection laws.
                  </span>
                </li>
              </ul>
            </div>

            {/* Intellectual Property */}
            <div
              className="p-4 mb-4 rounded-3 policy-card"
              data-aos="fade-up"
              style={{
                background: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <h4 className="fw-bold text-dark d-flex align-items-center mb-4">
                <IconWrapper icon={FaBalanceScale} color="#6f42c1" />
                Intellectual Property
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#6f42c1" }}>•</span>
                  <span className="fs-5">
                    Research and development outcomes, publications, and intellectual property derived from participants samples will not be owned by participants.
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#6f42c1" }}>•</span>
                  <span className="fs-5">
                    Participants acknowledge that they will not have any ownership or financial claims over any products, discoveries, or intellectual property that may result from the use of their biological materials.
                  </span>
                </li>
              </ul>
            </div>

            {/* Limitations of Liability */}
            <div
              className="p-4 mb-4 rounded-3 policy-card"
              data-aos="fade-up"
              style={{
                background: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <h4 className="fw-bold text-dark d-flex align-items-center mb-4">
                <IconWrapper icon={FaExclamationTriangle} color="#dc3545" />
                Limitations of Liability
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#dc3545" }}>•</span>
                  <span className="fs-5">
                    Discovery-Connect cannot guarantee any personal health benefits from your participation.
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#dc3545" }}>•</span>
                  <span className="fs-5">
                    Discovery-Connect is not responsible for any third-party misuse of shared anonymized data or supplied samples.
                  </span>
                </li>
              </ul>
            </div>

            {/* Changes to the Terms */}
            <div
              className="p-4 mb-4 rounded-3 policy-card"
              data-aos="fade-up"
              style={{
                background: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <h4 className="fw-bold text-dark d-flex align-items-center mb-4">
                <IconWrapper icon={FaSyncAlt} color="#20c997" />
                Changes to the Terms
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#20c997" }}>•</span>
                  <span className="fs-5">
                    Discovery-Connect reserves the right to update these Terms of Service at any time.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect Styling */}
      <style>{`
        .policy-card {
          transition: all 0.3s ease;
        }
        .policy-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.12) !important;
        }
      `}</style>
    </section>
  );
};

export default TermsArea;