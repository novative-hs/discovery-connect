import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ErrorMessage from "@components/error-message/error";
import ProductLoader from "@components/loader/product-loader";
import {
  useGetAllSamplesQuery,
  useGetSampleFieldsQuery,
} from "src/redux/features/productApi";
import AOS from "aos";
import "aos/dist/aos.css";
import { add_cart_product } from "src/redux/features/cartSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { skipToken } from "@reduxjs/toolkit/query";

const OfferPopularProduct = () => {
  const [page, setPage] = useState(1);
  const { data: categories, isLoading, isError } = useGetAllSamplesQuery({
    limit: 20,
    offset: (page - 1) * 20,
  });

  const sampleType = "sampletypematrix";
  const {
    data: sampleFieldsData,
    isLoading: sampleFieldsLoading,
    isError: sampleFieldsError,
  } = useGetSampleFieldsQuery(sampleType || skipToken);

  const router = useRouter();
  const [visible, setVisible] = useState({});
  const productRefs = useRef([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  const sampleList = categories?.data || [];
  const filteredCategories = sampleList.filter((category) => category.price !== null);
  const displayedCategories = filteredCategories.slice(0, 6);

  useEffect(() => {
    AOS.init({ duration: 500 });

    if (showModal) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = entry.target.dataset.index;
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
  }, [showModal, displayedCategories]);

  if (isLoading || sampleFieldsLoading)
    return <ProductLoader loading={isLoading || sampleFieldsLoading} />;
  if (isError)
    return <ErrorMessage message="There was an error loading samples!" />;
  if (sampleFieldsError)
    return <ErrorMessage message="Error loading sample fields!" />;
  if (displayedCategories.length === 0)
    return <ErrorMessage message="No samples found!" />;

  const handleAddToCart = (product) => {
    sessionStorage.setItem('filterProduct', JSON.stringify(product));
router.push('/filter-samples');
  };

  return (
    <section className="product__coupon-area product__offer py-5">
      <div className="container">
        <div className="row text-center mb-4">
          <div className="col">
            <h2 className="fw-bold text-primary">High-Quality Lab Samples</h2>
          </div>
        </div>

        <div className="row py-4">
          {displayedCategories.map((category, index) => (
            <div
              key={category.id}
              ref={(el) => (productRefs.current[index] = el)}
              data-index={index}
              className="col-lg-4 col-md-6 col-sm-12"
              style={{
                opacity: visible[index] ? 1 : 0,
                transform: visible[index]
                  ? "translateX(0)"
                  : "translateX(-150px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
              }}
            >
              <div className="card border-0 shadow-lg p-3 h-100 text-center rounded-3">
                <div className="product-image mb-3">
                  <img
                    src={category.imageUrl || "/placeholder.jpg"}
                    alt={category.diseasename}
                    className="img-fluid rounded-2"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <h5 className="fw-bold text-primary">{category.diseasename}</h5>
                <p className="fs-5 text-dark fw-semibold">
                  {category.price
                    ? `${category.price} ${category.SamplePriceCurrency || ""}`
                    : "Price not available"}
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

        <div className="row text-center mt-4">
          <div className="col">
            <Link
              href="/shop"
              className="fw-bold px-4 py-2 text-white text-decoration-none"
              style={{ backgroundColor: "#003366" }}
            >
              Show More
            </Link>
          </div>
        </div>

        {/* Modal */}
        {showModal && selectedProduct && (
          <>
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

            <div
              className="modal d-block"
              data-aos="zoom-in"
              style={{
                zIndex: 1050,
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#fff",
                padding: "0",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                width: "100vw",
                maxWidth: "800px",
                maxHeight: "80vh",
                overflow: "hidden",
              }}
            >
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title fw-bold">{selectedProduct.diseasename}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={() => {
                    setShowModal(false);
                    document.body.style.overflow = "";
                  }}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <img
                      src={selectedProduct.imageUrl || "/placeholder.jpg"}
                      alt="Sample"
                      className="img-fluid rounded shadow mb-3"
                      style={{
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    />
                  </div>

                  <div className="col-md-8">
                    <div className="row g-2">
                      {/* Mandatory Fields */}
                      {[
                        { label: "Sample Name", value: selectedProduct.diseasename },
                        {
                          label: "Location ID",
                          value: [
                            selectedProduct.room_number ? `Room Number: ${selectedProduct.room_number}` : null,
                            selectedProduct.freezer_id ? `Freezer Id: ${selectedProduct.freezer_id}` : null,
                            selectedProduct.box_id ? `Box: ${selectedProduct.box_id}` : null,
                          ]
                            .filter(Boolean)
                            .join(" | ") || "----",
                        },
                        { label: "Age", value: selectedProduct.age },
                        { label: "Gender", value: selectedProduct.gender },
                        { label: "Phone Number", value: selectedProduct.phoneNumber },
                        {
                          label: "Volume",
                          value:
                            selectedProduct.volume && selectedProduct.QuantityUnit
                              ? `${selectedProduct.volume} ${selectedProduct.QuantityUnit}`
                              : selectedProduct.volume || selectedProduct.QuantityUnit || "----",
                        },
                        { label: "Container Type", value: selectedProduct.ContainerType },
                        { label: "Test Result", value: selectedProduct.TestResult },
                        { label: "Test Result Unit", value: selectedProduct.TestResultUnit },
                      ].map((item, index) => (
                        <div className="col-6" key={`mandatory-${index}`}>
                          <div className="border rounded p-2 h-100 bg-light">
                            <small className="text-muted d-block">{item.label}</small>
                            <strong>{item.value || "----"}</strong>
                          </div>
                        </div>
                      ))}

                      {/* Optional Fields */}
                      {[
                        { label: "Sample Type Matrix", value: selectedProduct.SampleTypeMatrix },

                        { label: "Sample Condition", value: selectedProduct.samplecondition },
                        { label: "Storage Temp", value: selectedProduct.storagetemp },
                        { label: "Freeze Thaw Cycles", value: selectedProduct.FreezeThawCycles },
                        {
                          label: "Infectious Disease Testing",
                          value:
                            selectedProduct.InfectiousDiseaseTesting || selectedProduct.InfectiousDiseaseResult
                              ? `${selectedProduct.InfectiousDiseaseTesting || ""} ${selectedProduct.InfectiousDiseaseResult || ""}`
                              : null,
                        },
                        { label: "Diagnosis Test Parameter", value: selectedProduct.DiagnosisTestParameter },
                        { label: "Test Method", value: selectedProduct.TestMethod },
                      ]
                        .filter((item) => item.value)
                        .map((item, index) => (
                          <div className="col-6" key={`optional-${index}`}>
                            <div className="border rounded p-2 h-100 bg-light">
                              <small className="text-muted d-block">{item.label}</small>
                              <strong>{item.value}</strong>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* <div className="text-end mt-4">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(selectedProduct)}
                        className="product-add-cart-btn w-40"
                      >
                        Add to Cart
                      </button>
                    </div> */}
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
