import React from "react";

const TextArea = () => {
  return (
    <section className="policy__area pb-120">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              <div className="policy__item mb-35">
              <h3 className="policy__title">Who we are?</h3>
                <p>
                At Discovery-Connect, we are revolutionizing the way researchers access biological samples for their studies. Our platform serves as a bridge between researchers, biobanks, and collection sites, ensuring a seamless, secure, and efficient process for obtaining high-quality samples essential for groundbreaking research.
                </p>
              </div>
              <div className="policy__item policy__item-2 mb-35">
                <h3 className="policy__title">Our Mission</h3>
                <p>
                We aim to empower the scientific community by providing a reliable and structured platform where researchers can easily find, request, and acquire biological samples while ensuring data security and compliance. By streamlining sample accessibility, we accelerate research progress and innovation.
                </p>
              </div>   
              <div className="policy__item policy__item-2 mb-35">
                <h3 className="policy__title">Join Us Today!</h3>
                <p>
                Be part of a trusted platform dedicated to advancing scientific research. Sign up now and start discovering the right samples for your study!
                </p>
              </div>              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextArea;
