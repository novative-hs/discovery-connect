import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import SingleCartItem from "./single-cart-item";
import EmptyCart from "./empty-cart";
import { clear_cart, get_cart_products ,remove_product} from "src/redux/features/cartSlice";
import useCartInfo from "@hooks/use-cart-info";
import axios from "axios";
import { notifySuccess,notifyError } from "@utils/toast";
const CartSidebar = ({ isCartOpen, setIsCartOpen, sample }) => {
  const dispatch = useDispatch();
  const { total } = useCartInfo();
  useEffect(() => {
    if (!isCartOpen) {
      dispatch(get_cart_products());
    }
  }, [isCartOpen, dispatch]);


  const handleCartClose = () => {
    if (sample?.id) {
      dispatch(remove_product(sample.id)); // Remove the product if ID exists
      dispatch(clear_cart()); // Clear cart on close
    }
    setIsCartOpen(false); // Always close the cart sidebar
  };
  
  const handleAddtoCart = async () => {
    if (sample) {
      // Find the sample in cart and get its quantity
      const cartItems = JSON.parse(localStorage.getItem("cart_products")) || [];
      const cartItem = cartItems.find(item => item.id === sample.id);
      const quantity = cartItem ? cartItem.orderQuantity : 1;  // Default to 1 if not found
  
      // Check if the requested quantity is less than or equal to the available sample quantity
      if (quantity > sample.quantity) {
        notifyError(`Out of stock! Only ${sample.quantity} units available.`);
        return; // Exit the function if quantity exceeds available stock
      }
  
      const updatedSample = {
        ...sample,
        total: total.toFixed(2),  
        samplequantity: quantity, 
      };
  
      try {
        const response = await axios.post("http://localhost:5000/api/cart", updatedSample);
        localStorage.setItem("cartCount", response.data.cartCount);
        window.dispatchEvent(new Event("cartUpdated"));
        notifySuccess("Sample added successfully in Cart");
        console.log("Cart updated:", response.data);
        dispatch(remove_product(sample.id)); // Remove the product if ID exists
        dispatch(clear_cart());
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    }
  };
  
  const getCurrencySymbol = (currency) => {
    switch (currency?.toLowerCase()) {
      case "pkr":
        return "Rs";
      case "usd":
        return "$";
      case "eur":
        return "€";
      case "gbp":
        return "£";
      default:
        return currency || ""; 
    }
  };

  return (
    <React.Fragment>
      <div className={`cartmini__area ${isCartOpen ? "cartmini-opened" : ""} container mt-4`}>
        <div className="cartmini__wrapper d-flex justify-content-between flex-column">
          <div className="cartmini__top-wrapper">
            <div className="cartmini__top p-relative">
              <div className="cartmini__title">
                <h4>Sample cart</h4>
              </div>
              <div className="cartmini__close">
                <button onClick={handleCartClose} type="button" className="cartmini__close-btn cartmini-close-btn">
                  <i className="fal fa-times"></i>
                </button>
              </div>
            </div>
            {/* If sample exists, display sample info */}
            {sample ? (
              <div className="cartmini__widget">
                <SingleCartItem sample={sample} />
              </div>
            ) : (
              <EmptyCart />
            )}
          </div>
          <div className="cartmini__checkout">
            {/* <div className="cartmini__checkout-title mb-30">
              <h4>Subtotal:</h4>
              <span>${total.toFixed(2)}</span>
            </div> */}
            <div className="cartmini__checkout-btn">
            
              <button
                onClick={() =>handleAddtoCart()}
                type="button"
                className="tp-btn mb-10 w-100"
              >
                <span>Add to Cart</span>
              </button>
              <Link href="/cart" className="tp-btn mb-10 w-100" onClick={handleCartClose}>
                <span>View Cart</span>
              </Link>
              <Link href="/checkout" className="tp-btn-border w-100 cursor-pointer" onClick={handleCartClose}>
                <span>Checkout</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay */}
      <div onClick={handleCartClose} className={`body-overlay ${isCartOpen ? "opened" : ""}`} />
    </React.Fragment>
  );
};

export default CartSidebar;
