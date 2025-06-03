import Image from "next/image";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  add_cart_product,
  decrement,
  increment,
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import { Modal } from "react-bootstrap";
import { handleModalShow } from "src/redux/features/productSlice";

const ProductModal = ({ product }) => {
  const dispatch = useDispatch();
  const { isShow } = useSelector((state) => state.product);
  const { cart_products } = useSelector((state) => state.cart);
  const cartItems = useSelector((state) => state.cart?.cart_products || []);

  const handleAddToCart = (product) => {
    dispatch(add_cart_product(product));
  };

  const isInCart = (sampleId) => {
    return cartItems.some((item) => item.id === sampleId);
  };

  const handleModalClose = () => {
    dispatch(handleModalShow());
    dispatch(initialOrderQuantity());
  };

  // Evaluate optional fields
  const optionalFields = [
    product.ethnicity,
    product.AlcoholOrDrugAbuse,
    product.SmokingStatus,
    product.samplecondition,
    product.storagetemp,
    product.SampleTypeMatrix,
    product.InfectiousDiseaseTesting,
    product.FreezeThawCycles,
  ];

  const nonNullOptionalFields = optionalFields.filter(Boolean);
  const showTwoColumnLayout = nonNullOptionalFields.length >= 3;

  return (
    <Modal show={isShow} onHide={handleModalClose} centered>
      <div
        className="product__modal-wrapper"
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
          overflowY: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ backgroundColor: "#cfe2ff", color: "#000" }}
        >
          <h5 className="fw-bold">{product.diseasename}</h5>
          <button
            type="button"
            onClick={handleModalClose}
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

        {/* Body */}
        <div
          className="modal-body"
          style={{ maxHeight: "calc(80vh - 100px)", overflowY: "auto" }}
        >
          <div className="row">
            {showTwoColumnLayout ? (
              <>
                {/* Left side */}
                <div className="col-md-5 text-center">
                  <img
                    src={product.imageUrl || "/placeholder.jpg"}
                    alt={product.diseasename}
                    className="img-fluid rounded"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                  <div className="mt-3 p-2 bg-light rounded text-start">
                    <p>
                      <strong>Age:</strong> {product.age} years |{" "}
                      <strong>Gender:</strong> {product.gender}
                    </p>
                    <p>
                      <strong>Container Type:</strong> {product.ContainerType}
                    </p>
                    <p>
                      <strong>Diagnosis Test Parameter:</strong>{" "}
                      {product.DiagnosisTestParameter}
                    </p>
                    <p>
                      <strong>Volume:</strong> {product.volume}{" "}
                      {product.QuantityUnit}
                    </p>
                    <p>
                      <strong>Test Result/(unit):</strong> {product.TestResult}{" "}
                      {product.TestResultUnit}
                    </p>
                    <p>
                      <strong>Status:</strong> {product.status}
                    </p>
                  </div>
                </div>

                {/* Right side */}
                <div className="col-md-7 d-flex flex-column">
                  <div>
                    {product.ethnicity && (
                      <p>
                        <strong>Ethnicity:</strong> {product.ethnicity}
                      </p>
                    )}
                    {product.AlcoholOrDrugAbuse && (
                      <p>
                        <strong>Alcohol or Drug Abuse:</strong>{" "}
                        {product.AlcoholOrDrugAbuse}
                      </p>
                    )}
                    {product.SmokingStatus && (
                      <p>
                        <strong>Smoking Status:</strong>{" "}
                        {product.SmokingStatus}
                      </p>
                    )}
                    {product.samplecondition && (
                      <p>
                        <strong>Sample Condition:</strong>{" "}
                        {product.samplecondition}
                      </p>
                    )}
                    {product.storagetemp && (
                      <p>
                        <strong>Storage Temperature:</strong>{" "}
                        {product.storagetemp}
                      </p>
                    )}
                    {product.SampleTypeMatrix && (
                      <p>
                        <strong>Sample Type Matrix:</strong>{" "}
                        {product.SampleTypeMatrix}
                      </p>
                    )}
                    {product.InfectiousDiseaseTesting && (
                      <p>
                        <strong>Infectious Disease Testing:</strong>{" "}
                        {product.InfectiousDiseaseTesting}
                        {product.InfectiousDiseaseResult &&
                          ` (${product.InfectiousDiseaseResult})`}
                      </p>
                    )}
                    {product.FreezeThawCycles && (
                      <p>
                        <strong>Freeze Thaw Cycles:</strong>{" "}
                        {product.FreezeThawCycles}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Single-column layout
              <div className="col-12 text-center">
                <img
                  src={product.imageUrl || "/placeholder.jpg"}
                  alt={product.diseasename}
                  className="img-fluid rounded"
                  style={{ maxHeight: "200px", objectFit: "cover" }}
                />
                <div className="mt-3 p-2 bg-light rounded text-start">
                  <p>
                    <strong>Age:</strong> {product.age} years |{" "}
                    <strong>Gender:</strong> {product.gender}
                  </p>
                  <p>
                    <strong>Container Type:</strong> {product.ContainerType}
                  </p>
                  <p>
                    <strong>Diagnosis Test Parameter:</strong>{" "}
                    {product.DiagnosisTestParameter}
                  </p>
                  <p>
                    <strong>Volume:</strong> {product.volume}{" "}
                    {product.QuantityUnit}
                  </p>
                  <p>
                    <strong>Test Result/(unit):</strong> {product.TestResult}{" "}
                    {product.TestResultUnit}
                  </p>
                  <p>
                    <strong>Status:</strong> {product.status}
                  </p>
                </div>

                {nonNullOptionalFields.length > 0 && (
                  <div className="mt-3 p-2 bg-light rounded text-start">
                    {product.ethnicity && (
                      <p>
                        <strong>Ethnicity:</strong> {product.ethnicity}
                      </p>
                    )}
                    {product.AlcoholOrDrugAbuse && (
                      <p>
                        <strong>Alcohol or Drug Abuse:</strong>{" "}
                        {product.AlcoholOrDrugAbuse}
                      </p>
                    )}
                    {product.SmokingStatus && (
                      <p>
                        <strong>Smoking Status:</strong>{" "}
                        {product.SmokingStatus}
                      </p>
                    )}
                    {product.samplecondition && (
                      <p>
                        <strong>Sample Condition:</strong>{" "}
                        {product.samplecondition}
                      </p>
                    )}
                    {product.storagetemp && (
                      <p>
                        <strong>Storage Temperature:</strong>{" "}
                        {product.storagetemp}
                      </p>
                    )}
                    {product.SampleTypeMatrix && (
                      <p>
                        <strong>Sample Type Matrix:</strong>{" "}
                        {product.SampleTypeMatrix}
                      </p>
                    )}
                    {product.InfectiousDiseaseTesting && (
                      <p>
                        <strong>Infectious Disease Testing:</strong>{" "}
                        {product.InfectiousDiseaseTesting}
                        {product.InfectiousDiseaseResult &&
                          ` (${product.InfectiousDiseaseResult})`}
                      </p>
                    )}
                    {product.FreezeThawCycles && (
                      <p>
                        <strong>Freeze Thaw Cycles:</strong>{" "}
                        {product.FreezeThawCycles}
                      </p>
                    )}
                  </div>
                )}

                {/* Add to Cart */}
                {/* <div className="mt-3 text-end">
                  {product.quantity === 0 ? (
                    <button
                      className="btn w-75"
                      disabled
                      style={{ backgroundColor: "black", color: "white" }}
                    >
                      Sample Allocated
                    </button>
                  ) : isInCart(product.id) ? (
                    <button className="btn btn-secondary w-75" disabled>
                      Added
                    </button>
                  ) : (
                    <button
                      className="btn btn-danger w-75"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                  )}
                </div> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
