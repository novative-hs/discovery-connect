import React from "react";
import ContactForm from "@components/forms/contact-form";
import Image from "next/image";

const bg = "/assets/img/slider/13/contactus3.jpg";

const FormArea = () => {
  return (
    <section
      className="contact__form-area position-relative"
      style={{ height: "100vh" }}
    >
      {/* Full background image */}
      <div className="position-absolute top-0 start-0 w-100 h-100">
        
        <Image
          src={bg}
          alt="Contact Us"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Overlay (dark layer over image) */}
      {/* <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
<h2 className="contact__form-title text-center mb-3 text-dark fw-bold">
  <i className="fas fa-envelope me-2"></i>
  Contact Us
</h2>

      </div> */}

      {/* Title fixed at top, always white */}
      <div className="position-absolute top-0 start-50 translate-middle-x text-center text-white mt-5">

      </div>

      {/* Overlay content (form) */}
      <div className="container h-100 d-flex align-items-center justify-content-center position-relative">
        <div className="col-lg-6 bg-white p-5 rounded shadow">
          <h3 className="contact__form-2-title text-center mb-4 text-dark">
            Send a message
          </h3>
          <ContactForm />
          <p className="ajax-response"></p>
        </div>
      </div>
    </section>
  );
};

export default FormArea;