import React from "react";
import Image from "next/image";
import Link from "next/link";
// internal
import { CartTwo, Compare, Eye, HeartTwo } from "@svg/index";
import { RatingFull, RatingHalf } from "./rating";
import { useDispatch } from "react-redux";
import {   add_cart_product, initialOrderQuantity } from "src/redux/features/cartSlice";
import { setProduct } from "src/redux/features/productSlice";

const SingleListProduct = ({ product }) => {
  const { _id, image, title, price, discount } = product || {};
  // handle dispatch
  const dispatch = useDispatch();

  // handle quick view
  const handleQuickView = (prd) => {
    dispatch(initialOrderQuantity())
    dispatch(setProduct(prd))
  };
  // Handle adding the product to the cart
  const handleAddToCart = (product) => {
    dispatch(add_cart_product(product));
  };
  return (
    <React.Fragment>
      <div className="product__list-item mb-30">
        <div className="row">
          <div className="col-xl-5 col-lg-5">
            <div className="product__thumb product__list-thumb p-relative fix m-img">
              <Link href={`product-details/${_id}`}>
                 {/* <Image
                              src={product.imageUrl}
                              alt="product image"
                              width={960}
                              height={1125}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            /> */}
                <Image
                  src={product.imageUrl}
                  alt="image"
                  width={335}
                  height={325}
                  style={{
                    width: "335px",
                    height: "325px",
                    objectFit: "cover",
                  }}
                />
              </Link>
              {discount > 0 && (
                <div className="product__badge d-flex flex-column flex-wrap">
                  <span className={`product__badge-item has-new`}>sale</span>
                </div>
              )}
            </div>
          </div>
          <div className="col-xl-7 col-lg-7">
            <div className="product__list-content">
              <div className="product__rating product__rating-2 d-flex">
                <RatingFull />
                <RatingFull />
                <RatingFull />
                <RatingFull />
                <RatingHalf />
              </div>

              <h3 className="product__list-title">
              <span className="product__list-ammount">{product.samplename}</span>
                {/* <Link href={`product-details/${_id}`}>{product.samplename}</Link> */}
              </h3>
              <div className="product__list-price">
                <span className="product__list-ammount">{product.price}</span>
              </div>
              <p>
              Get high-quality blood samples for your research at Discovery Connect. Fast shipping and reliable sourcing!
              </p>

              <div className="product__list-action d-flex flex-wrap align-items-center">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  // className="product-add-cart-btn w-100"
                  className="product-add-cart-btn product-add-cart-btn-2"
                >
                  {/* <CartTwo /> */}
                  Add to Cart
                </button>
                <button
                  type="button"
                  className="product-action-btn product-action-btn-2"
                >
                  <HeartTwo />
                  <span className="product-action-tooltip">
                    Add To Wishlist
                  </span>
                </button>
                <button
                  onClick={() => handleQuickView(product)}
                  type="button"
                  className="product-action-btn"
                >
                  <Eye />
                  <span className="product-action-tooltip">Quick view</span>
                </button>

                <Link href={`/product-details/${_id}`}>
                  <button
                    type="button"
                    className="product-action-btn product-action-btn-2"
                  >
                    <i className="fa-solid fa-link"></i>
                    <span className="product-action-tooltip">
                      Product Details
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SingleListProduct;