import React, { useState, useEffect } from "react";
import BillingDetails from "./billing-details";
import OrderArea from "./order-area";
import SampleCopy from "@components/checkout/sample-copy";
import "bootstrap/dist/css/bootstrap.min.css";

const CheckoutArea = ({ handleSubmit, validateDocuments, submitHandler, ...others }) => {
  const id = sessionStorage.getItem("userID");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sampleCopyData, setSampleCopyData] = useState({
    studyCopy: null,
    reportingMechanism: "",
    irbFile: null,
    nbcFile: null,
  });

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    }
  
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);
  

  if (id === null) {
    return <div>Loading...</div>;
  } 

  return (
    <section className="checkout-area pb-85">
      <div className="container">
        <form>
          <div className="row mt-3">
            <div className="col-lg-6">
              <div className="checkbox-form">
                <h3>Billing Details</h3>
                <BillingDetails {...others} />
              </div>
            </div>

            <div className="col-lg-6">
              <SampleCopy
                setSampleCopyData={setSampleCopyData}
                onComplete={() => setIsModalOpen(true)}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Bootstrap Modal */}
      <div
        className={`modal fade ${isModalOpen ? "show d-block" : ""}`}
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog modal-dialog-scrollable modal-lg" role="document"
        style={{ maxWidth: "800px", width: "90%" }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Payment Detail</h5>
              <button
                type="button"
                className="btn-close"
                onClick={() => setIsModalOpen(false)}
              ></button>
            </div>
            <div className="modal-body">
              <OrderArea {...others} sampleCopyData={sampleCopyData} />
            </div>
          </div>
        </div>
      </div>
      
    </section>
  );
};

export default CheckoutArea;
