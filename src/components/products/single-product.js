import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { CartTwo, Eye } from "@svg/index";
import { useSelector } from 'react-redux';
import { Cart } from "@svg/index";
import {
  add_cart_product,
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import { setProduct } from "src/redux/features/productSlice";
import ProductModal from "@components/common/modals/product-modal";

const SingleProduct = ({ product, discountPrd = false }) => {
  const { id, image_url, title, price, discount, originalPrice } = product || {};
  const dispatch = useDispatch();
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("bootstrap").then((bootstrap) => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
      });
    }
  }, []);
  const handleAddToCart = (product) => {
    dispatch(add_cart_product(product));
  };
  const cartItems = useSelector((state) => state.cart?.cart_products || []);
  const isInCart = (sampleId) => {
    return cartItems.some((item) => item.id === sampleId);
  };

  // Handle quick view
  const handleQuickView = (prd) => {
    dispatch(initialOrderQuantity())
    dispatch(setProduct(prd))
  };

  return (
    <React.Fragment>
  <div className="product__item p-relative transition-3 mb-50 shadow rounded border bg-white overflow-hidden" style={{ transition: '0.3s ease', padding: '1rem' }}>
  <div className="product__thumb w-img p-relative mb-3 rounded overflow-hidden">
    <Image
      src={product.imageUrl}
      alt="product image"
      width={960}
      height={1125}
      style={{ objectFit: 'cover', width: '100%', height: '250px', borderRadius: '12px' }}
    />
  </div>

  <h5 className="mb-2 fw-bold text-dark">{product.samplename}</h5>

  <div className="d-flex justify-content-between text-muted small mb-1">
  <span>Price: <strong className="text-dark">₨ {product.price}</strong></span>
  <span>Stock: <strong>{product.quantity}</strong></span>
</div>

<div className="text-muted small mb-3">
  Allocated: <strong>{product.quantity_allocated ?? 0}</strong>
</div>

  <div className="d-flex gap-2">
  {product.quantity === 0 ? (
  <button className="btn  w-75" disabled style={{ backgroundColor: "black", color: "white" }}>
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
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      title="Quick View"
    >
      <Eye product={product} />
    </button>
  </div>
</div>


    </React.Fragment>
  );
};

export default SingleProduct;
