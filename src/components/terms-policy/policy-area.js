import React, { useEffect } from "react";
import {
  FaUserShield,
  FaInfoCircle,
  FaCookieBite,
  FaShareAlt,
  FaLock,
  FaExternalLinkAlt,
  FaSyncAlt,
} from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";

const PolicyArea = () => {
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
            {/* Intro text free-flow */}
            <div
              className="p-4 mb-4 rounded-3 policy-card"
              data-aos="fade-up"
              style={{
                background: "#fff",
                boxShadow: "0 5px 15px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.05)",
              }}
            >
              <p className="text-muted mb-0 fs-5">
                Discovery Connect (“we,” “our,” “us”) is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your personal information when you visit
                our website{" "}
                <span className="text-primary fw-semibold">
                  https://discovery-connect.com
                </span>
                .
                <br />
                <br />
                By using our website, you agree to the collection and use of
                information in accordance with this Privacy Policy.
              </p>
            </div>

            {/* Section 1 */}
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
                <IconWrapper icon={FaInfoCircle} color="#007bff" />
                Information We Collect
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#007bff" }}>•</span>
                  <span className="fs-5">
                    <strong>Personal Information:</strong> Name, email address,
                    phone number, organization, and other contact details
                    voluntarily provided through forms or inquiries.
                  </span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#007bff" }}>•</span>
                  <span className="fs-5">
                    <strong>Non-Personal Information:</strong> Browser type, IP
                    address, device information, pages visited, and usage data
                    automatically collected through cookies and analytics tools.
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#007bff" }}>•</span>
                  <span className="fs-5">
                    <strong>Biological Sample Data:</strong> This website does
                    not collect biological samples directly. Any biological
                    material or associated personal health information is
                    collected offline, with separate informed consent and
                    governed by the projects Terms and Conditions.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 2 */}
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
                <IconWrapper icon={FaUserShield} color="#28a745" />
                How We Use Your Information
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#28a745" }}>•</span>
                  <span className="fs-5">Respond to your inquiries and requests.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#28a745" }}>•</span>
                  <span className="fs-5">
                    Process your registrations or participation in Discovery
                    Connect initiatives.
                  </span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#28a745" }}>•</span>
                  <span className="fs-5">
                    Improve our websites functionality and user experience.
                  </span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#28a745" }}>•</span>
                  <span className="fs-5">Comply with legal, ethical, and regulatory obligations.</span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#28a745" }}>•</span>
                  <span className="fs-5">
                    Send you updates about our services, if you have opted to
                    receive them.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 3 */}
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
                <IconWrapper icon={FaCookieBite} color="#ffc107" />
                Cookies and Tracking Technologies
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#ffc107" }}>•</span>
                  <span className="fs-5">Enhance website performance.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#ffc107" }}>•</span>
                  <span className="fs-5">Analyze user behavior and traffic patterns.</span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#ffc107" }}>•</span>
                  <span className="fs-5">Personalize your browsing experience.</span>
                </li>
              </ul>
              <p className="text-muted fs-5 mt-3 mb-0">
                You can choose to disable cookies through your browser
                settings, but this may affect your ability to use some
                features of the site.
              </p>
            </div>

            {/* Section 4 */}
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
                <IconWrapper icon={FaShareAlt} color="#17a2b8" />
                Data Sharing and Disclosure
              </h4>
              <p className="text-muted fs-5">
                We do not sell, trade, or rent your personal information to
                third parties.
              </p>
              <ul className="text-start ps-0 list-unstyled mt-3">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#17a2b8" }}>•</span>
                  <span className="fs-5">
                    With authorized Discovery Connect personnel to process your
                    requests.
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#17a2b8" }}>•</span>
                  <span className="fs-5">
                    With third-party service providers who support our website
                    operation (e.g., hosting services).
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 5 */}
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
                <IconWrapper icon={FaLock} color="#dc3545" />
                Data Security
              </h4>
              <ul className="text-start ps-0 list-unstyled">
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#dc3545" }}>•</span>
                  <span className="fs-5">
                    Protect your personal information from unauthorized access,
                    disclosure, or misuse.
                  </span>
                </li>
                <li className="mb-3 d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#dc3545" }}>•</span>
                  <span className="fs-5">
                    Use secure servers, encryption protocols, and regular
                    security audits.
                  </span>
                </li>
                <li className="d-flex align-items-start">
                  <span className="me-3 mt-1 fw-bold" style={{ color: "#dc3545" }}>•</span>
                  <span className="fs-5">
                    However, no method of internet transmission or electronic
                    storage is 100% secure, and we cannot guarantee absolute
                    security.
                  </span>
                </li>
              </ul>
            </div>

            {/* Section 6 */}
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
                <IconWrapper icon={FaExternalLinkAlt} color="#6c757d" />
                Third-Party Links
              </h4>
              <p className="text-muted fs-5 mb-0">
                Our website may contain links to third-party sites. We are not
                responsible for the privacy practices or content of those
                websites. We encourage you to review the privacy policies of
                any external sites you visit.
              </p>
            </div>

            {/* Section 7 */}
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
                <IconWrapper icon={FaSyncAlt} color="#007bff" />
                Changes to This Privacy Policy
              </h4>
              <p className="text-muted fs-5 mb-0">
                We may update this Privacy Policy periodically. Changes will
                be posted on this page. You are encouraged to review this
                policy regularly.
              </p>
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

export default PolicyArea;