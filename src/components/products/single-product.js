import React, { useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import FilterProductArea from "@components/user-dashboard/filter-samples";

const SingleProduct = ({ product, selectedFilters }) => {

  const { imageUrl, Analyte, total_allocated, total_quantity } = product || {};
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <>
      <div
        className={`product-card-hover border rounded-3 shadow bg-white d-flex flex-column p-3 h-100 ${total_quantity - total_allocated <= 0 ? "border-danger disabled-card" : "border-secondary"
          }`}
        onClick={() =>
          total_quantity - total_allocated > 0 ? handleViewDetails(product) : null
        }
        role="button"
        title={
          total_quantity - total_allocated > 0
            ? "Click to show sample detail"
            : "Not available shortly"
        }
      >

        {/* Product Image */}
        <div className="product__thumb mb-3 rounded overflow-hidden">
          <Image
            src={imageUrl}
            alt="product image"
            width={250}
            height={150}
            className="w-100 object-fit-cover rounded"
            unoptimized // ← Allow base64 and any custom URLs
          />

        </div>

        {/* Analyte Name */}
        <h6 className="fw-bold text-dark mb-2 min-height-40">{Analyte}</h6>
        {total_quantity - total_allocated <= 0 && (
          <div className="badge bg-danger text-white w-fit-content px-2 py-1 rounded small">
            Not Available Shortly
          </div>
        )}

        {/* Stock & Allocation Info */}
        <div className="text-muted small mb-1">
          Stock: <strong>{total_quantity}</strong>
        </div>
        <div className="text-muted small mb-3">
          Allocated: <strong>{total_allocated ?? 0}</strong>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
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

      <style jsx>{`
        .product-card-hover {
          cursor: pointer;
          transition: transform 0.4s ease, border-color 0.3s ease;
        }

        .product-card-hover:hover {
          transform: scale(1.08);
          border-color: #0d6efd !important; /* Bootstrap primary blue */
        }
      `}</style>
    </>
  );
};

export default SingleProduct;
