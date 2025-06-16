import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { Eye } from "@svg/index";
import {
  add_cart_product,
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import { setProduct } from "src/redux/features/productSlice";
import { useRouter } from "next/router";

const SingleProduct = ({ product }) => {
  const { id, image_url, Analyte, quantity, quantity_allocated } =
    product || {};
const router=useRouter();
 
  const dispatch = useDispatch();

  const cartItems = useSelector((state) => state.cart?.cart_products || []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap").then((bootstrap) => {
        const tooltipTriggerList = document.querySelectorAll(
          '[data-bs-toggle="tooltip"]'
        );
        tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
      });
    }
  }, []);

 

  const handleAddToCart = async (product) => {
 
   sessionStorage.setItem('filterProduct', JSON.stringify(product));
router.push('/filter-samples');
  };

  const handleQuickView = (prd) => {
    dispatch(initialOrderQuantity());
    dispatch(setProduct(prd))
  };

  const isAlreadyAdded = (Analyte) =>
    cartItems.some((item) => item.Analyte === Analyte);

  return (
    <React.Fragment>
      <div
        className="product__item p-relative transition-3 mb-50 shadow rounded border bg-white overflow-hidden"
        style={{ transition: "0.3s ease", padding: "1rem" }}
      >
        <div className="product__thumb w-img p-relative mb-3 rounded overflow-hidden">
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
          <span>
            Stock: <strong>{quantity}</strong>
          </span>
        </div>

        <div className="text-muted small mb-3">
          Allocated: <strong>{quantity_allocated ?? 0}</strong>
        </div>

        <div className="d-flex gap-2">
          {quantity === 0 ? (
            <button
              className="btn w-75"
              disabled
              style={{ backgroundColor: "black", color: "white" }}
            >
              Sample Allocated
            </button>
          ) : (
            <button
              className={`btn w-75 ${
                isAlreadyAdded(Analyte)
                  ? "btn-secondary"
                  : "btn-danger"
              }`}
              disabled={isAlreadyAdded(Analyte)}
              onClick={() => handleAddToCart(product)}
            >
              {isAlreadyAdded(Analyte) ? "Added" : "Add to Cart"}
            </button>
          )}

          <button
            onClick={() => handleQuickView(product)}
            className="btn btn-outline-danger w-25"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Quick View"
          >
            <Eye />
          </button>
        </div>
      </div>

   
    </React.Fragment>
  );
};

export default SingleProduct;
