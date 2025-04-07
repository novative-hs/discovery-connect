import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ErrorMessage from "@components/error-message/error";
import ProductLoader from "@components/loader/product-loader";
import { useGetAllSamplesQuery } from "src/redux/features/productApi";

const OfferPopularProduct = () => {
  const { data: categories, isError, isLoading } = useGetAllSamplesQuery();
  const [visible, setVisible] = useState({});
  const productRefs = useRef([]);

  // ✅ Filter valid categories
  const filteredCategories = categories?.filter((category) => category.price !== null) || [];
  const displayedCategories = filteredCategories.slice(0, 6);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = entry.target.dataset.index; // Get index from dataset
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [index]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );

    productRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      productRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [displayedCategories]); // ✅ Re-run when categories change

  if (isLoading) return <ProductLoader loading={isLoading} />;
  if (isError) return <ErrorMessage message="There was an error loading samples!" />;
  if (displayedCategories.length === 0) return <ErrorMessage message="No samples found!" />;

  return (
    <section className="product__coupon-area product__offer py-5">
      <div className="container">
        {/* Header Section */}
        <div className="row text-center mb-4">
          <div className="col">
            <h2 className="fw-bold text-danger">High-Quality Lab Samples</h2>
          </div>
        </div>

        {/* Product Cards */}
        <div className="row py-4">
          {displayedCategories.map((category, index) => (
            <div
              key={category.id}
              ref={(el) => (productRefs.current[index] = el)}
              data-index={index} // ✅ Add index to dataset for tracking
              className="col-lg-4 col-md-6 col-sm-12 mb-4"
              style={{
                opacity: visible[index] ? 1 : 0,
                transform: visible[index] ? "translateX(0)" : "translateX(-150px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
              }}
            >
              <div className="card border-0 shadow-lg p-3 h-100 text-center rounded-3">
                <div className="product-image mb-3">
                  <img
                    src={category.imageUrl || "/placeholder.jpg"}
                    alt={category.samplename}
                    className="img-fluid rounded-2"
                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
                  />
                </div>
                <h5 className="fw-bold text-primary">{category.samplename}</h5>
                <p className="fs-5 text-dark fw-semibold">
                  {category.price ? `${category.price} ${category.SamplePriceCurrency || ""}` : "Price not available"}
                </p>
                <button
                  className="btn btn-outline-danger mt-2 w-100 fw-bold"
                  onClick={() => {
                    setSelectedProduct(category);
                    setShowModal(true);
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="row text-center mt-4">
          <div className="col">
            <Link href="/shop" className="btn btn-danger fw-bold px-4 py-2">
              Show More
            </Link>
          </div>
        </div>
        {/* ✅ Custom Modal (No Bootstrap) */}
        {showModal && selectedProduct && (
          <>
            {/* Disable scrolling on the background */}
            {document.body.style.overflow = "hidden"}

            {/* Backdrop */}
            <div
              className="modal-backdrop fade show"
              style={{
                backdropFilter: "blur(5px)",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 1040,
              }}
            ></div>

            {/* Modal Container */}
            <div
              className="modal show d-block"
              role="dialog"
              style={{
                zIndex: 1050,
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                width: "90vw",
                maxWidth: "700px",
                maxHeight: "80vh",
                overflow: "hidden", // Prevent scrollbar
              }}
            >
              {/* Modal Header */}
              <div
                className="modal-header d-flex justify-content-between align-items-center"
                style={{ backgroundColor: "#cfe2ff", color: "#000" }}
              >
                <h5 className="fw-bold">{selectedProduct.samplename}</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => {
                    setShowModal(false);
                    document.body.style.overflow = ""; // Restore scrolling
                  }}
                  style={{
                    fontSize: "1.5rem",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Modal Body */}
              <div
                className="modal-body"
                style={{
                  maxHeight: "70vh", // Restrict height instead of making the whole modal scrollable
                  overflowY: "auto", // Only allow internal scrolling
                }}
              >
                <div className="row">
                  {/* Left Side: Image & Basic Details */}
                  <div className="col-md-5 text-center mb-0">
                    <img
                      src={selectedProduct.imageUrl || "/placeholder.jpg"}
                      alt={selectedProduct.samplename}
                      className="img-fluid rounded"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                    <div className="mt-3 p-1 bg-light rounded text-start">
                      <p><strong>Age:</strong> {selectedProduct.age} years |{" "} <strong>Gender:</strong> {selectedProduct.gender}</p>
                      <p><strong>Ethnicity:</strong> {selectedProduct.ethnicity}</p>
                      <p><strong>Alcohol or Drug Abuse:</strong>{" "} {selectedProduct.AlcoholOrDrugAbuse}</p>
                      <p><strong>Smoking Status:</strong> {selectedProduct.SmokingStatus}</p>
                      <p><strong>Country of Collection:</strong>{" "}{selectedProduct.CountryOfCollection}</p>
                      <p> <strong>Status:</strong> {selectedProduct.status}</p>
                    </div>
                  </div>

                  {/* Right Side: Detailed Information */}
                  <div className="col-md-7">
                    <p><strong>Quantity unit:</strong> {selectedProduct.QuantityUnit}</p>
                    <p><strong>Sample Condition:</strong>{" "}{selectedProduct.samplecondition}</p>
                    <p><strong>Storage Temperature:</strong> {selectedProduct.storagetemp}</p>
                    <p><strong>Container Type:</strong> {selectedProduct.ContainerType}</p>
                    <p><strong>Sample Type Matrix:</strong>{" "}{selectedProduct.SampleTypeMatrix}</p>
                    <p><strong>Infectious Disease Testing:</strong>{" "}{selectedProduct.InfectiousDiseaseTesting} ({selectedProduct.InfectiousDiseaseResult})</p>
                    <p><strong>Freeze Thaw Cycles:</strong>{" "}{selectedProduct.FreezeThawCycles}</p>
                    <p><strong>Diagnosis Test Parameter:</strong>{" "}{selectedProduct.DiagnosisTestParameter}</p>
                    <p><strong>Test Result:</strong> {selectedProduct.TestResult}{" "}{selectedProduct.TestResultUnit}</p>
                    <p><strong>Test Method:</strong> {selectedProduct.TestMethod}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}


      </div>
    </section>
  );
};

export default OfferPopularProduct;
