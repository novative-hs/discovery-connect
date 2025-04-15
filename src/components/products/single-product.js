import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { CartTwo, Eye } from "@svg/index";
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


  // Handle quick view
  const handleQuickView = (prd) => {
    dispatch(initialOrderQuantity())
    dispatch(setProduct(prd))
  };

  return (
    <React.Fragment>
      <div className="product__item p-relative transition-3 mb-50">
        
        <div className="product__thumb w-img p-relative fix">
          {/* <Link href={id ? `/product-details/${id}` : "/product-not-found"}> */}
          <div className="product-image-frame">
            <Image
              src={product.imageUrl}
              alt="product image"
              width={960}
              height={1125}
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          </div>
          {/* </Link> */}

          <div className="d-flex justify-content-between align-items-center gap-2 mt-2 product__add transition-3">
            <button
              type="button"
              onClick={() => handleAddToCart(product)}
              className="product-add-cart-btn w-75"
            >
              Add to Cart
            </button>

            {/* Quick View Button with Bootstrap Tooltip */}
            <button
              onClick={() => handleQuickView(product)}
              className="btn btn-outline-danger w-25 position-relative"
              data-bs-toggle="tooltip"
              data-bs-placement="top"
              title="Quick View"
              style={{ backgroundColor: 'white', color: '#dc3545', borderColor: '#dc3545' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc3545';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#dc3545';
              }}
            >
              <Eye product={product} />
            </button>
          </div>
        </div>
        <div className="product__content"></div>
        <h3 className="product__list-title">
          <span className="product__list-ammount">{product.samplename}</span>
        </h3>
        <h3 className="product__list-title">
          <span className="product__list-ammount">RS: {product.price}</span>
        </h3>
      </div>

    </React.Fragment>
  );
};

export default SingleProduct;
