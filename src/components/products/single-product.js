// components/SingleProduct.js
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import FilterProductArea from "@components/user-dashboard/filter-samples";
import { add_cart_product } from "src/redux/features/cartSlice";

const SingleProduct = ({ product }) => {
  const { imageUrl, Analyte, total_allocated, total_quantity } = product || {};
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const cartItems = useSelector((state) => state.cart?.cart_products || []);

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const isAlreadyAdded = (Analyte) =>
    cartItems.some((item) => item.Analyte === Analyte);

  return (
    <>
<div
  className="shadow rounded border bg-white overflow-hidden mb-3 w-100 h-100 d-flex flex-column"
  style={{
    padding: "0.75rem",
    minHeight: "320px",
    justifyContent: "space-between",
  }}
>
  <div className="product__thumb w-img mb-2 rounded overflow-hidden">
    <Image
      src={imageUrl}
      alt="product image"
      width={250}
      height={150}
      style={{
        objectFit: "cover",
        width: "100%",
        height: "150px",
        borderRadius: "8px",
      }}
    />
  </div>

  <h6 className="fw-bold text-dark mb-1" style={{ minHeight: "40px" }}>
    {Analyte}
  </h6>

  <div className="d-flex justify-content-between text-muted small mb-1">
    <span>Stock: <strong>{total_quantity}</strong></span>
  </div>

  <div className="text-muted small mb-2">
    Allocated: <strong>{total_allocated ?? 0}</strong>
  </div>

  <button
    onClick={() => handleAddToCart(product)}
    className="btn btn-danger btn-sm w-100 mt-auto"
  >
    Add to Cart
  </button>
</div>



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
              closeModals={() => setShowModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SingleProduct;
