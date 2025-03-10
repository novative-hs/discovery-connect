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
import { add_to_wishlist } from "src/redux/features/wishlist-slice";
import { Modal } from "react-bootstrap";
import { handleModalShow } from "src/redux/features/productSlice";
import { Minus, Plus } from "@svg/index";
import { decrement, increment } from "src/redux/features/cartSlice";
const ProductModal = ({ product, discountPrd = false }) => {
  console.log("value in product is:", product)
  const { id, image_url, samplename, title, price, discount, originalPrice } = product || {};
  const { isShow } = useSelector((state) => state.product);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { image, relatedImages, tags, SKU,  sku } = product || {};
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
  
  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd));
  };
  // initial Order Quantity
  // handle add wishlist
  const handleAddWishlist = (prd) => {
    dispatch(add_to_wishlist(prd));
  };
  // handle modal close 
  const handleModalClose = () => {
    dispatch(handleModalShow())
    dispatch(initialOrderQuantity())
  }
  const handleChange = (e) => {}
  return (
    <Modal
      show={isShow}
      onHide={() => dispatch(handleModalShow())}
      className="product__modal"
      centered={true}
    >
      <div className="product__modal-wrapper">
        <div className="product__modal-close">
          <button
            className="product__modal-close-btn"
            type="button"
            onClick={() => handleModalClose()}
          >
            <Times />
          </button>
        </div>
        <div className="row">
          <div className="col-lg-6">
            <div className="product__modal-thumb-wrapper">
              <div className="product__details-thumb-tab mr-40">
                <div className="product__details-thumb-content w-img">
                  <div className="tab-content" id="nav-tabContent">
                    <div className="active-img product-image-frame">
                      <Image
                        src={product.imageUrl
                        }
                        alt="image"
                        width={210}
                        height={285}
                        style={{ width: "60%", height: "100%" }}
                      />
                    </div>
                  </div>
                </div>
                {/* <div className="product__details-thumb-nav tp-tab">
                  <nav>
                    <div className="nav nav-tabs justify-content-sm-between">
                      {relatedImages && relatedImages.length > 0 ? (
                        relatedImages.map((img, i) => (
                          <button
                            key={i}
                            className={`nav-link ${img === activeImg ? "active" : ""}`}
                            onClick={() => setActiveImg(img)}
                          >
                            <img src={img} alt={`related-${i}`} />
                          </button>
                        ))
                      ) : (
                        <p>No related images available.</p>
                      )}
                    </div>
                  </nav>
                </div> */}
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="product__details-wrapper">
              <h3 className="product__details-title">{product.samplename}</h3>
              <p className="mt-20">
              Get high-quality blood samples for your research at Discovery Connect. Fast shipping and reliable sourcing!
              </p>
              {/* Price */}
              {/* <OldNewPrice
                originalPrice={originalPrice}
                discount={discount}
              /> */}
                  <div className="product__price">
      <span className="product__ammount old-price">
        {product.price?.toFixed(2) || "0.00"}
      </span>
      {/* <span className="product__ammount new-price">
        ${product.price?.toFixed(2) || "0.00"}
      </span> */}
    </div>
              {/* Price */}

              {/* quantity */}
     <div className="tp-product-quantity mt-10 mb-10">
     <span className="tp-cart-minus" onClick={() => handleDecrease(cartItem)}>
  <Minus />
</span>
<input
  className="tp-cart-input"
  type="text"
  value={cartItem ? cartItem.orderQuantity : product.quantity}
  onChange={handleChange}
/>
<span className="tp-cart-plus" onClick={() => handleIncrease(cartItem)}>
  <Plus />
</span>
        </div>
              {/* quantity */}
              <div className="product__details-action d-flex flex-wrap align-items-center">
                <button
                  onClick={() => handleAddProduct(product)}
                  type="button"
                  className="product-add-cart-btn product-add-cart-btn-3"
                >
                  <CartTwo />
                  Add to Cart
                </button>
                <button
                  onClick={() => handleAddWishlist(product)}
                  type="button"
                  className={`product-action-btn ${isWishlistAdded ? "active" : ""
                    }`}
                >
                  <HeartTwo />
                  <span className="product-action-tooltip">
                    Add To Wishlist
                  </span>
                </button>
                <Link href={`/product-details/${id}`}>
                  <button type="button" className="product-action-btn">
                    <i className="fa-solid fa-link"></i>
                    <span className="product-action-tooltip">
                      Product Details
                    </span>
                  </button>
                </Link>
              </div>
              <div className="product__details-sku product__details-more">
                <p>SKU:</p>
                <span>{sku}</span>
              </div>
              {/* Product Categories */}
              <ProductCategories />
              {/* Product Categories */}

              {/* Tags */}
              <ProductTags tag={tags} />
              {/* Tags */}
              <div className="product__details-share">
                <span>Share:</span>
                <SocialLinks />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;
