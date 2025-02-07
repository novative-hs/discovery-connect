import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import SingleCartItem from "./single-cart";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import SampleArea from "@components/user-dashboard/samples";
import Header from "@layout/dashboardheader";
import { notifySuccess, notifyError } from "@utils/toast";
import { useRouter } from "next/router";
const CartArea = () => {
  const id = localStorage.getItem("userID");
  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/cart/${id}`);
      console.log("API Cart Response:", response); // Check the response data
      setCart(response.data); // Set cart only if data exists
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCart(); // Fetch cart only if userID exists and cart is empty
    }
  }, [id]);

  useEffect(() => {
    console.log("Saving to localStorage:", cart);
    localStorage.setItem("cart", JSON.stringify(cart)); // Store cart data in localStorage
  });
  useEffect(() => {
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  const handleDeleteAll = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/cart/deleteAll/${id}`
      );
      if (response) {
        notifySuccess("Item deleted successfully from cart");
        console.log(response.data);
        console.log("Remaining Cart Count:", response.data.cartCount);
        localStorage.setItem("cartCount", response.data.cartCount);
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        notifyError("Unexpected API response format");
        localStorage.setItem("cartCount", 0);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      notifyError("Failed to remove item from cart");
    }
  };
  return (
    <>
      <section className="cart-area pt-100 pb-100">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {loading ? (
                <p>Loading...</p>
              ) : cart.length > 0 ? (
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="table-content table-responsive">
                    <div
                      className="tp-continue-shopping"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <p>
                        <button
                          type="button"
                          onClick={() => router.push("/organization-dashboard")}
                        >
                          Continue Shopping <i className="fal fa-reply"></i>
                        </button>
                      </p>
                      <p>
                        <button type="button" onClick={handleDeleteAll}>
                          Delete All Items <i className="fal fa-trash-alt"></i>
                        </button>
                      </p>
                    </div>

                    <table className="table">
                      <thead>
                        <tr>
                          <th className="cart-product-name">Sample Name</th>
                          <th className="product-price">Lab Name</th>
                          <th className="product-quantity">Price</th>
                          <th className="product-quantity">Quantity</th>
                          <th className="product-quantity">Discount</th>
                          <th className="product-quantity">Type</th>
                          <th className="product-subtotal">Total</th>
                          <th className="product-remove">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart.map((item, i) => (
                          <SingleCartItem key={i} item={item} />
                        ))}
                      </tbody>
                    </table>

                    <Link
                      href="/checkout"
                      className="btn btn-primary w-10 mx-auto d-block mt-20"
                    >
                      <span>Checkout</span>
                    </Link>
                  </div>
                </form>
              ) : (
                <EmptyCart />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CartArea;
