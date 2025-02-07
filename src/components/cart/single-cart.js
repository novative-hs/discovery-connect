import React, { useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { Minus, Plus } from "@svg/index";
import {
  add_cart_product,
  quantityDecrement,
} from "src/redux/features/cartSlice";
import axios from "axios";
import { notifyError, notifySuccess } from "@utils/toast";

const SingleCartItem = ({ item }) => {
  const {
    sampleid,
    Currency,
    samplename,
    CollectionSiteName,
    price,
    samplequantity,
    type,
    discount,
    totalpayment,
    stock,
  } = item || {};
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(samplequantity);
  const getCurrencySymbol = (Currency) => {
    switch (Currency?.toLowerCase()) {
      case "pkr":
        return "Rs";
      case "usd":
        return "$";
      case "eur":
        return "€";
      case "gbp":
        return "£";
      default:
        return Currency || ""; // Default to empty if currency is unknown
    }
  };

  // Increase quantity
  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  // Decrease quantity
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Update quantity API call
  const handleUpdateQuantity = async () => {
    // Check if the updated quantity is less than or equal to available stock
    if (quantity > stock) {
      notifyError(`Out of stock! Only ${stock} units available.`);
      return; // Exit if quantity exceeds available stock
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/cart/update/${sampleid}`,
        {
          price,
          samplequantity: quantity,
          discount
        }
      );
      if (response.data) {
        console.log("Response", response.data);
        notifySuccess("Quantity updated successfully");
        // localStorage.setItem("cart", JSON.stringify(response.data.cart));
        window.dispatchEvent(new Event("cartUpdated"));
        setIsEditing(false);
      } else {
        notifyError("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      notifyError("An error occurred while updating quantity");
    }
  };

  // Handle remove product
  const handleRemovePrd = async () => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/cart/delete/${sampleid}`
      );
      if (response) {
        notifySuccess("Item deleted successfully from cart");
        console.log(response.data);
        console.log("Remaining Cart Count:", response.data.cartCount);
        // Update cart count in localStorage and dispatch cartUpdated event
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
    <tr>
      <td className="product-name">
        <Link href="#">{samplename}</Link>
      </td>
      <td className="product-name">
        <Link href="#">{CollectionSiteName}</Link>
      </td>

      <td className="product-price">
        <span className="amount">
          {" "}
          {getCurrencySymbol(Currency)}
          {price}
        </span>
      </td>

      <td className="product-quantity">
        {isEditing ? (
          <div className="tp-product-quantity mt-10 mb-10">
            <span className="tp-cart-minus" onClick={handleDecrement}>
              <Minus />
            </span>
            <input
              className="tp-cart-input"
              type="text"
              value={quantity}
              readOnly
            />
            <span className="tp-cart-plus" onClick={handleIncrement}>
              <Plus />
            </span>
          </div>
        ) : (
          <span>{samplequantity}</span>
        )}
      </td>

      <td className="product-name">
        <Link href="#">{discount}</Link>
      </td>

      <td className="product-name">
        <Link href="#">{type || "N/A"}</Link>
      </td>

      <td className="product-subtotal">
        <span className="amount">{totalpayment}</span>
      </td>

      <td className="product-remove d-flex align-items-center justify-content-center gap-2 ">
        {isEditing ? (
          <button
            type="button"
            onClick={handleUpdateQuantity}
            className="btn btn-success btn-sm me-2"
          >
            Update
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn btn-primary btn-sm me-2"
          >
            <i className="fa fa-edit"></i>
          </button>
        )}

        <button
          type="button"
          onClick={handleRemovePrd}
          className="btn btn-danger btn-sm"
        >
          <i className="fa fa-times"></i>
        </button>
      </td>
    </tr>
  );
};

export default SingleCartItem;
