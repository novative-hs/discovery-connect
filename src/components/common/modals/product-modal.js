import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal } from "react-bootstrap";
import { handleModalShow } from "src/redux/features/productSlice";
import { initialOrderQuantity } from "src/redux/features/cartSlice";

const ProductModal = ({ product }) => {
  const dispatch = useDispatch();
  const { isShow } = useSelector((state) => state.product);

  const handleModalClose = () => {
    dispatch(handleModalShow());
    dispatch(initialOrderQuantity());
  };

  // ✅ Manage scroll based on modal visibility
  useEffect(() => {
    if (isShow) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    };
  }, [isShow]);

  if (!product) return null;

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
        <div className="modal-body" style={{ maxHeight: "calc(80vh - 100px)", overflowY: "hidden" }}>
          <div className="row">
            {showTwoColumnLayout ? (
              <>
                <div className="col-md-5 text-center">
                  <img
                    src={product.imageUrl || "/placeholder.jpg"}
                    alt={product.diseasename}
                    className="img-fluid rounded"
                    style={{ maxHeight: "200px", objectFit: "cover" }}
                  />
                  <div className="mt-3 text-start bg-light p-2 rounded">
                    <p><strong>Age:</strong> {product.age} years | <strong>Gender:</strong> {product.gender}</p>
                    <p><strong>Container:</strong> {product.ContainerType}</p>
                    <p><strong>Volume:</strong> {product.volume} {product.VolumeUnit}</p>
                    <p><strong>Test Result:</strong> {product.TestResult} {product.TestResultUnit}</p>
                    <p><strong>Status:</strong> {product.status}</p>
                  </div>
                </div>
                <div className="col-md-7">
                  {nonNullOptionalFields.map((value, i) => (
                    value && <p key={i}><strong>{Object.keys(product)[Object.values(product).indexOf(value)]}:</strong> {value}</p>
                  ))}
                </div>
              </>
            ) : (
              <div className="col-12 text-center">
                <img
                  src={product.imageUrl || "/placeholder.jpg"}
                  alt={product.diseasename}
                  className="img-fluid rounded"
                  style={{ maxHeight: "130px", objectFit: "cover" }}

                />
                <div className="mt-3 text-start bg-light p-2 rounded">
                  <p><strong>Age:</strong> {product.age} | <strong>Gender:</strong> {product.gender}</p>
                  <p><strong>Container:</strong> {product.ContainerType}</p>
                  <p><strong>Volume:</strong> {product.volume} {product.VolumeUnit}</p>
                  <p><strong>Status:</strong> {product.status}</p>
                  {nonNullOptionalFields.map((value, i) => (
                    value && <p key={i}><strong>{Object.keys(product)[Object.values(product).indexOf(value)]}:</strong> {value}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
