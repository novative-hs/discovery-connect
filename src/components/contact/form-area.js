import React from "react";
// internal
import ContactForm from "@components/forms/contact-form";
import Image from "next/image";  // Import the Image component from Next.js
// import bg from "@assets/img/slider/13/slider-11.png";
const bg = "/assets/img/slider/13/contactuspage.png";


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
                // alt="Contact Us"
                layout="fill"  // This will make the image cover the full width
                objectFit="cover"  // Ensures the image covers the container without distortion
                className="w-100 h-100"
              />
            
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
