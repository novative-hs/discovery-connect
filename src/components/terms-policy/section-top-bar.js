import React from "react";

const SectionTop = ({ title, subtitle }) => {
  return (
    <section
      className="tp-section-area p-relative tp-section-spacing"
      style={{ backgroundColor: "#EEF1FF" }} // light bluish background
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-7 col-lg-8">
            <div className="tp-section-wrapper-2 text-center">
              <h3 className="tp-section-title-2 font-70">{title}</h3>
              <p>{subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionTop;
