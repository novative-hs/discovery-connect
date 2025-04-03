import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// internal
import { Compare, CartTwo, Times, HeartTwo } from "@svg/index";
import SocialLinks from "@components/social";
import OldNewPrice from "@components/products/old-new-price";
import Quantity from "@components/products/quantity";
import ProductCategories from "@components/products/product-categories";
import ProductTags from "@components/products/product-tags";
import { RatingFull, RatingHalf } from "@components/products/rating";
import { add_cart_product, initialOrderQuantity } from "src/redux/features/cartSlice";
import Link from "next/link";
import { Modal } from "react-bootstrap";
import { handleModalShow } from "src/redux/features/productSlice";
import { Minus, Plus } from "@svg/index";
import { decrement, increment } from "src/redux/features/cartSlice";
const ProductModal = ({ product, discountPrd = false }) => {
  console.log("value in product is:", product)
  const { id, image_url, samplename, title, price, discount, originalPrice } = product || {};
  const { isShow } = useSelector((state) => state.product);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { image, relatedImages, tags, SKU, sku } = product || {};
  // const [activeImg, setActiveImg] = useState(image);
  const { cart_products } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const isWishlistAdded = wishlist.some((item) => item.id === id);


  const handleIncrease = (item) => {
    dispatch(increment({ id: item.id }));
  };

  const handleDecrease = (item) => {
    dispatch(decrement({ id: item.id }));
    console.log("item after decreasing is", item.orderQuantity);
  };
  const cartItem = cart_products.find((item) => item.id === product.id);
  const displayQuantity = cartItem ? cartItem.orderQuantity : product.quantity;
  console.log(" item after decresing is ", product.quantity)
  const subtotal = cart_products.reduce(
    (acc, item) => acc + item.price * item.orderQuantity,
    0
  );

  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };

  const handleModalClose = () => {
    dispatch(handleModalShow())
    dispatch(initialOrderQuantity())
  }
  const handleChange = (e) => { }
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
        {/* Modal Header */}
        <div
          className="d-flex justify-content-between align-items-center p-2"
          style={{ backgroundColor: "#cfe2ff", color: "#000" }}
        >
          <h5 className="fw-bold">{product.samplename}</h5>
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

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: "calc(80vh - 100px)", overflowY: "auto" }}>
          <div className="row">
            {/* Left Side: Image & Basic Details */}
            <div className="col-md-5 text-center">
              <img
                src={product.imageUrl || "/placeholder.jpg"}
                alt={product.samplename}
                className="img-fluid rounded"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
              <div className="mt-3 p-2 bg-light rounded text-start">
                <p><strong>Age:</strong> {product.age} years | <strong>Gender:</strong> {product.gender}</p>
                <p><strong>Quantity unit:</strong> {product.QuantityUnit}</p>
                <p><strong>Alcohol or Drug Abuse:</strong> {product.AlcoholOrDrugAbuse}</p>
                <p><strong>Smoking Status:</strong> {product.SmokingStatus}</p>
                <p><strong>Country of Collection:</strong> {product.CountryOfCollection}</p>
                <p><strong>Status:</strong> {product.status}</p>
              </div>
            </div>

            {/* Right Side: Detailed Information */}
            <div className="col-md-7">
              <p><strong>Ethnicity:</strong> {product.ethnicity}</p>
              <p><strong>Sample Condition:</strong> {product.samplecondition}</p>
              <p><strong>Storage Temperature:</strong> {product.storagetemp}</p>
              <p><strong>Container Type:</strong> {product.ContainerType}</p>
              <p><strong>Sample Type Matrix:</strong> {product.SampleTypeMatrix}</p>
              <p><strong>Infectious Disease Testing:</strong> {product.InfectiousDiseaseTesting} ({product.InfectiousDiseaseResult})</p>
              <p><strong>Freeze Thaw Cycles:</strong> {product.FreezeThawCycles}</p>
              <p><strong>Diagnosis Test Parameter:</strong> {product.DiagnosisTestParameter}</p>
              <p><strong>Test Result:</strong> {product.TestResult} {product.TestResultUnit}</p>
              <p><strong>Test Method:</strong> {product.TestMethod}</p>
              {/* Add to Cart Button */}
              <div className="text-end mt-3">
                <button className="btn btn-primary" onClick={() => handleAddProduct(product)}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
