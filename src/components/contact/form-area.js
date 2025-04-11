import React from "react";
// internal
import ContactForm from "@components/forms/contact-form";
import Image from "next/image";  // Import the Image component from Next.js
import bg from "@assets/img/slider/13/slider-10.png";

const FormArea = () => {
  return (
    <section className={`contact__form-area `}>
      <div className="container-fluid p-0">
        <div className="row">
          <div className="col-xl-12 position-relative">
            {/* Using the Image component from Next.js */}
            <div className="position-relative w-100" style={{ height: "75vh" }}>
              <Image 
                src={bg} 
                alt="Contact Us" 
                layout="fill"  // This will make the image cover the full width
                objectFit="cover"  // Ensures the image covers the container without distortion
                className="w-100 h-100"
              />
              {/* Linear Gradient Overlay */}
              <div className="position-absolute top-0 left-0 w-100 h-100" style={{ background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2))' }}></div>
              {/* Text Overlay */}
              <div className="position-absolute top-50 start-50 translate-middle text-center text-white" style={{ zIndex: 2 }}>
                <h1>Contact Us</h1>
              </div>
            </div>

            {/* Contact Form */}
            <div className="p-5 mt-5">
              <h3 className="contact__form-2-title text-center text-prmary">Send a message</h3>
              <ContactForm />
              <p className="ajax-response"></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormArea;
