import React from "react";

const Services = () => {
  return (
    <div className="d-flex flex-row justify-content-center text-center gap-6 p-6 bg-gradient-to-r from-indigo-900 to-blue-900 text-white w-full">
      {/* Find a Sample */}
      <div className="flex flex-col items-center p-4 bg-info top-10 align-text-center rounded-2xl shadow-lg w-100 md:w-1/3 min-h-[250px]"
      style={{height:"270px"}}
      >
        <div className="text-5xl mb-4">
          <i className="fa fa-flask text-white fs-1"></i>
        </div>
        <h3 className="text-xl font-semibold fs-2">Find a Sample</h3>
        <p className="mt-2 text-white fs-6">
          Browse a vast collection of high-quality research samples.
        </p>
      </div>

      {/* Order a Sample */}
      <div className="flex flex-col items-center p-4 bg-success text-center rounded-2xl shadow-lg w-100 md:w-1/3 min-h-[250px]">
        <div className="text-5xl mb-4">
          <i className="fa fa-box text-white fs-1"></i>
        </div>
        <h3 className="text-xl font-semibold fs-2">Order a Sample</h3>
        <p className="mt-2 text-white fs-6">
          Easily request and receive samples tailored to your research needs.
        </p>
      </div>

      {/* Verify an Order */}
      <div className="flex flex-col items-center p-4 bg-secondary text-center rounded-2xl shadow-lg w-100 md:w-1/3 min-h-[250px]">
        <div className="text-5xl mb-4">
          <i className="fa fa-file-alt text-white fs-1"></i>
        </div>
        <h3 className="text-xl font-semibold fs-2">Verify an Order</h3>
        <p className="mt-2 text-white fs-6">
          Check and approve orders with detailed tracking and documentation.
        </p>
      </div>
    </div>
  );
};

export default Services;
