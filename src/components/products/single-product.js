import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
// internal
import { CartTwo, Compare, Eye, HeartTwo } from "@svg/index";
import { RatingFull, RatingHalf } from "./rating";
import ProductModal from "@components/common/modals/product-modal";
import OldNewPrice from "./old-new-price";
import {
  add_cart_product,
  initialOrderQuantity,
} from "src/redux/features/cartSlice";
import { add_to_wishlist } from "src/redux/features/wishlist-slice";
import { setProduct } from "src/redux/features/productSlice";

const SingleProduct = ({ product, discountPrd = false }) => {
  console.log("Product data:", product);
  const { _id, image_url, title, price, discount, originalPrice } = product || {};
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  
  // Check if the product is already added to the wishlist
  const isWishlistAdded = wishlist.some(item => item._id === _id);
  
  // Check if the current product is in the cart
  const isAddedToCart = cart_products.some((prd) => prd._id === _id);

  // Handle adding the product to the cart
  const handleAddToCart = (product) => {
    dispatch(add_cart_product(product));
  };


  // Handle adding the product to the wishlist
  const handleAddWishlist = (prd) => {
    console.log("Product before dispatch:", prd);
    dispatch(add_to_wishlist({
      _id: prd.id,  
      title: prd.name,
    }));
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
          <Link href={_id ? `/product-details/${_id}` : "/product-not-found"}>
            <div className="product-image-frame">
              <Image
                src={product.imageUrl}
                alt="product image"
                width={960}
                height={1125}
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            </div>
          </Link>
          <h3 className="product__list-title">
              <span className="product__list-ammount">{product.samplename}</span>
                {/* <Link href={`product-details/${_id}`}>{product.samplename}</Link> */}
              </h3>
              {/* <div className="product__list-price">
                <span className="product__list-ammount">{product.price}</span>
              </div> */}
          {/* {discount > 0 && (
            <div className="product__badge d-flex flex-column flex-wrap">
              <span
                className={`product__badge-item ${discountPrd ? "has-offer" : "has-new"}`}
              >
                {${product.price}}
              </span>
              {!discountPrd && (
                <span className={`product__badge-item has-offer`}>
                  {`-${discount}%`}
                </span>
              )}
            </div>
          )} */}

          <div className="product__action d-flex flex-column flex-wrap">
            <button
              type="button"
              className={`product-action-btn ${isWishlistAdded ? "active" : ""}`}
              onClick={() => handleAddWishlist(product)}
            >
              <HeartTwo />
              <span className="product-action-tooltip">Add To Wishlist</span>
            </button>
            <button
              onClick={() => handleQuickView(product)}
              type="button"
              className="product-action-btn"
            >
              <Eye product={product}/>
              <span className="product-action-tooltip">Quick view</span>
            </button>
            <Link href={`/product-details/${_id}`}>
              <button type="button" className="product-action-btn">
                <i className="fa-solid fa-link"></i>
                <span className="product-action-tooltip">Product Details</span>
              </button>
            </Link>
          </div>
          <div className="product__add transition-3">
            {/* {isAddedToCart ? (
              <Link
                href="/cart"
                type="button"
                className="product-add-cart-btn w-100"
              >
                <CartTwo />
                View Cart
              </Link>
            ) : ( */}
              <button
              type="button"
              onClick={() => handleAddToCart(product)}
              className="product-add-cart-btn w-100"
            >
              Add to Cart
            </button>
            {/* )} */}
          </div>
        </div>
        <div className="product__content">
          <h3 className="product__title">
            <Link href={`/product-details/${_id}`}>{title}</Link>
          </h3>
          {discount <= 0 && (
            <div className="product__price">
              <span className="product__ammount">
                ${originalPrice.toFixed(2)}
              </span>
            </div>
          )}
          {discount > 0 && (
            <OldNewPrice originalPrice={originalPrice} discount={discount} />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default SingleProduct;
