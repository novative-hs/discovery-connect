import React from "react";
import Image from "next/image";
import { Eye } from "@svg/index";
import { useDispatch, useSelector } from "react-redux";
import {
  add_cart_product,
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import { setProduct } from "src/redux/features/productSlice";

const SingleListProduct = ({ product }) => {
  const dispatch = useDispatch();

  const handleQuickView = (prd) => {
    dispatch(initialOrderQuantity());
    dispatch(setProduct(prd));
  };

  const handleAddToCart = (product) => {
    dispatch(add_cart_product(product));
  };

  const cartItems = useSelector((state) => state.cart?.cart_products || []);
  const isInCart = (sampleId) => cartItems.some((item) => item.id === sampleId);

  return (
    <div
      className="product__item p-3 mb-4"
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "12px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
    >
      <div className="row align-items-center gx-3">
        <div className="col-5">
          <div
            className="product__thumb position-relative"
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              height: "240px",
            }}
          >
            <Image
              src={product.imageUrl}
              alt="product image"
              width={960}
              height={1125}
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
                borderRadius: "8px",
              }}
            />
            {product.discount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  backgroundColor: "red",
                  color: "#fff",
                  padding: "4px 8px",
                  fontSize: "12px",
                  borderRadius: "4px",
                }}
              >
                Sale
              </div>
            )}
          </div>
        </div>

        <div className="col-7">
          <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "8px" }}>
            {product.Analyte}
          </h3>

          <div className="text-muted mb-1">
            Price: <strong className="text-dark">Rs. {product.price}</strong>
          </div>
          <div className="text-muted mb-1">Stock: {product.total_quantity}</div>
          <div className="text-muted mb-2">
            Allocated: <strong>{product.total_allocated ?? 0}</strong>
          </div>

          <p style={{ fontSize: "14px", color: "#555", marginBottom: "12px" }}>
            Get high-quality blood samples for your research at Discovery Connect.
            Fast shipping and reliable sourcing!
          </p>

          <div className="d-flex gap-2">
            {product.quantity === 0 ? (
              <button className="btn w-75" disabled style={{ backgroundColor: "black", color: "white" }}>
                Sample Allocated
              </button>
            ) : isInCart(product.id) ? (
              <button className="btn btn-secondary w-75" disabled>
                Added
              </button>
            ) : (
              <button className="btn btn-danger w-75" onClick={() => handleAddToCart(product)}>
                Add to Cart
              </button>
            )}

            <button
              onClick={() => handleQuickView(product)}
              className="btn btn-outline-danger w-25"
              title="Quick View"
            >
              <Eye product={product} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleListProduct;
