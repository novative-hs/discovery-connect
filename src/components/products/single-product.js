import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import Modal from "react-bootstrap/Modal";
import { useRouter } from "next/router";
import FilterProductArea from "@components/user-dashboard/filter-samples";
import { add_cart_product,remove_product } from "src/redux/features/cartSlice";

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
//   const handleRemoveFromCart = (product) => {
//   dispatch(remove_product(product));
// };


  const isAlreadyAdded = (Analyte) =>
    cartItems.some((item) => item.Analyte === Analyte);

  return (
    <>
      <div className="product__item p-relative mb-50 shadow rounded border bg-white overflow-hidden" style={{ padding: "1rem" }}>
        <div className="product__thumb w-img mb-3 rounded overflow-hidden">
          <Image
            src={product.imageUrl}
            alt="product image"
            width={960}
            height={1125}
            style={{
              objectFit: "cover",
              width: "100%",
              height: "250px",
              borderRadius: "12px",
            }}
          />
        </div>

        <h5 className="mb-2 fw-bold text-dark">{Analyte}</h5>

        <div className="d-flex justify-content-between text-muted small mb-1">
          <span>Stock: <strong>{total_quantity}</strong></span>
        </div>

        <div className="text-muted small mb-3">
          Allocated: <strong>{total_allocated ?? 0}</strong>
        </div>

        <div className="d-flex gap-2">
          <button
            onClick={() => handleAddToCart(product)}
            className="btn btn-danger w-100"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Quick View"
          >
            Add to Cart
          </button>
        </div>
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
            <FilterProductArea selectedProduct={selectedProduct} closeModals={() => setShowModal(false)}/>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SingleProduct;
