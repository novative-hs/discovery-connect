import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ErrorMessage from "@components/error-message/error";
import ProductLoader from "@components/loader/product-loader";
import { useGetAllSamplesQuery } from "src/redux/features/productApi";
import bg from "@assets/img/contact/contact-bg.png";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  add_cart_product,
  
} from "src/redux/features/cartSlice";
import { useDispatch } from "react-redux";
const OfferPopularProduct = () => {
  const { data: categories, isError, isLoading } = useGetAllSamplesQuery();
  const [visible, setVisible] = useState({});
  const productRefs = useRef([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
const dispatch = useDispatch();
  // ✅ Always call hooks at the top
  useEffect(() => {
    AOS.init({ duration: 500 });
  }, []);

  // ✅ Filter valid categories
  const filteredCategories =
    categories?.filter((category) => category.price !== null) || [];
  const displayedCategories = filteredCategories.slice(0, 6);

  // ✅ Setup Intersection Observer
  useEffect(() => {
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
  }, [displayedCategories]);

  // ✅ Conditional rendering AFTER hooks
  if (isLoading) return <ProductLoader loading={isLoading} />;
  if (isError)
    return <ErrorMessage message="There was an error loading samples!" />;
  if (displayedCategories.length === 0)
    return <ErrorMessage message="No samples found!" />;
 const handleAddToCart = (product) => {
    dispatch(add_cart_product(product));
  };

  return (
    <section
      className="product__coupon-area product__offer py-5"
      style={{
        background:
          "linear-gradient(135deg,rgb(244, 242, 242),rgba(255, 255, 255, 0.97))",
      }}
    >
      <div className="container">
        {/* Header */}
        <div className="row text-center mb-4">
          <div className="col">
            <h2 className="fw-bold text-primary">High-Quality Lab Samples</h2>
          </div>
        </div>

        {/* Products */}
        <div className="row py-4">
          {displayedCategories.map((category, index) => (
            <div
              key={category.id}
              ref={(el) => (productRefs.current[index] = el)}
              data-index={index}
              className="col-lg-4 col-md-6 col-sm-12 mb-4"
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
                    alt={category.samplename}
                    className="img-fluid rounded-2"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <h5 className="fw-bold text-primary">
                  {category.samplename}
                </h5>
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

        {/* Footer */}
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
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                width: "100vw",
                maxWidth: "800px",
                maxHeight: "90vh",
                overflow: "hidden",}}
            >
              {/* Header */}
              <div
                className="modal-header bg-info text-white"
                data-aos="fade-down"
              >
                <h5 className="modal-title fw-bold">
                  {selectedProduct.samplename}
                </h5>
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

              {/* Body */}
              <div className="modal-body">
                <div className="row">
                  {/* Left */}
                  <div className="col-md-4 text-center" data-aos="fade-right">
                    <img
                      src={selectedProduct.imageUrl || "/placeholder.jpg"}
                      alt="Sample"
                      className="img-fluid rounded shadow mb-3"
                      style={{
                        maxHeight: "200px",
                        objectFit: "cover",
                      }}
                    />
                    <ul className="list-group text-start small">
                      <li className="list-group-item">
                        <strong>Age:</strong> {selectedProduct.age}
                      </li>
                      <li className="list-group-item">
                        <strong>Gender:</strong> {selectedProduct.gender}
                      </li>
                      <li className="list-group-item">
                        <strong>Ethnicity:</strong> {selectedProduct.ethnicity}
                      </li>
                      <li className="list-group-item">
                        <strong>Alcohol/Drug Abuse:</strong>{" "}
                        {selectedProduct.AlcoholOrDrugAbuse}
                      </li>
                      <li className="list-group-item">
                        <strong>Smoking Status:</strong>{" "}
                        {selectedProduct.SmokingStatus}
                      </li>
                      <li className="list-group-item">
                        <strong>Country:</strong>{" "}
                        {selectedProduct.CountryOfCollection}
                      </li>
                      <li className="list-group-item">
                        <strong>Status:</strong> {selectedProduct.status}
                      </li>
                    </ul>
                  </div>

                  {/* Right */}
                  <div className="col-md-8" data-aos="fade-left">
                    <div className="row g-2">
                      {[
                        {
                          label: "Sample Type Matrix",
                          value: selectedProduct.SampleTypeMatrix,
                        },
                        {
                          label: "Quantity Unit",
                          value: selectedProduct.QuantityUnit,
                        },
                        {
                          label: "Sample Condition",
                          value: selectedProduct.samplecondition,
                        },
                        {
                          label: "Storage Temp",
                          value: selectedProduct.storagetemp,
                        },
                        {
                          label: "Container Type",
                          value: selectedProduct.ContainerType,
                        },
                        {
                          label: "Freeze Thaw Cycles",
                          value: selectedProduct.FreezeThawCycles,
                        },
                        {
                          label: "Infectious Disease Testing",
                          value: `${selectedProduct.InfectiousDiseaseTesting} ${selectedProduct.InfectiousDiseaseResult}`,
                        },
                        {
                          label: "Diagnosis Test Parameter",
                          value: selectedProduct.DiagnosisTestParameter,
                        },
                        {
                          label: "Test Result Unit",
                          value: selectedProduct.TestResultUnit,
                        },
                        {
                          label: "Test Method",
                          value: selectedProduct.TestMethod,
                        },
                      ].map((item, index) => (
                        <div
                          className="col-6"
                          key={index}
                          data-aos="zoom-in"
                          data-aos-delay={index * 100}
                        >
                          <div className="border rounded p-2 h-100 bg-light">
                            <small className="text-muted d-block">
                              {item.label}
                            </small>
                            <strong>{item.value || "N/A"}</strong>
                          </div>
                          
                        </div>
                        
                      ))}
                    </div>
                    <button
              type="button"
              onClick={() => handleAddToCart(selectedProduct)}
              className="product-add-cart-btn w-75 mt-3 "
            >
              Add to Cart
            </button>
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
