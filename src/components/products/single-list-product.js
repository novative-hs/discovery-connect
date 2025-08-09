import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  add_cart_product,
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import { setProduct } from "src/redux/features/productSlice";
import Modal from "react-bootstrap/Modal";
import FilterProductArea from "@components/user-dashboard/filter-samples";

const SingleListProduct = ({ product, selectedFilters }) => {
  console.log(product)
  const { analyteImage,imageUrl, Analyte, total_allocated, total_stock } = product || {};
  const dispatch = useDispatch();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <>
      <div
        className="p-3 mb-4 bg-white border border-secondary rounded shadow-sm transition-all"
        style={{
          cursor: "pointer",
          transition: "transform 0.3s ease, border-color 0.3s ease",
        }}
        onClick={() => handleViewDetails(product)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.borderColor = "#0d6efd"; // Bootstrap primary
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.borderColor = "#6c757d"; // Bootstrap secondary
        }}
        role="button"
        title="Click to show sample detail"
      >
        <div className="row align-items-center gx-3">
          <div className="col-5">
            <div className="rounded overflow-hidden" style={{ height: "240px" }}>
              <Image
                src={analyteImage}
                alt="product image"
                width={250}
                height={150}
                className="w-100 object-fit-cover rounded"
                unoptimized
              />
            </div>
          </div>

          <div className="col-7">
            <h3
              className="fw-semibold mb-2 text-dark"
              style={{ fontSize: "20px", transition: "color 0.3s ease" }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent modal open
                router.push("/shop");
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "#dc3545")}
              onMouseOut={(e) => (e.currentTarget.style.color = "#212529")}
              title="Go to Shop"
            >
              {Analyte}
            </h3>

            {/* <div className="text-muted mb-1">
              Price: <strong className="text-dark">Rs. {product.price}</strong>
            </div> */}
            <div className="text-muted mb-1">
              Stock: {total_stock}
            </div>
            <div className="text-muted mb-2">
              Allocated: <strong>{total_allocated ?? 0}</strong>
            </div>

            <p style={{ fontSize: "14px", color: "#555" }}>
              Get high-quality blood samples for your research at Discovery
              Connect. Fast shipping and reliable sourcing!
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleModalClose}
        size="xl"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Filter Samples</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <FilterProductArea
              selectedProduct={selectedProduct}
              selectedFilters={selectedFilters}
              closeModals={() => setShowModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SingleListProduct;
