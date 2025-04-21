import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { Minus, Plus } from "@svg/index";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import dashboardheader from "@components/user-dashboard/dashboard-area";
import {
  remove_product,
  increment,
  decrement,
  updateQuantity,
} from "src/redux/features/cartSlice";

const CartArea = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);

  const userID =
    typeof window !== "undefined" ? localStorage.getItem("userID") : null;

  const [quantities, setQuantities] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setQuantities((prevQuantities) => {
      const newQuantities = { ...prevQuantities };
      cart_products.forEach((item) => {
        if (!newQuantities[item.id]) {
          newQuantities[item.id] = item.orderQuantity || 1;
        }
      });
      return newQuantities;
    });
  }, [cart_products]);

  const handleProceedToCheckout = () => {
    if (userID) {
      router.push("/dashboardheader?tab=Checkout");
    } else {
      router.push("/login?from=checkout");
    }
  };

  const handleRemoveProduct = (item) => {
    dispatch(remove_product(item));
  };

  const handleIncrease = (item) => {
    setQuantities((prev) => {
      const newQuantity = (prev[item.id] ?? item.orderQuantity) + 1;
      if (newQuantity <= item.quantity) {
        dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
        return { ...prev, [item.id]: newQuantity };
      }
      return prev;
    });
  };

  const handleDecrease = (item) => {
    setQuantities((prev) => {
      const newQuantity = (prev[item.id] ?? item.orderQuantity) - 1;
      if (newQuantity >= 1) {
        dispatch(updateQuantity({ id: item.id, quantity: newQuantity }));
        return { ...prev, [item.id]: newQuantity };
      }
      return prev;
    });
  };

  const handleQuantityChange = (e, item) => {
    const value = e.target.value.trim();
    if (value === "") {
      setQuantities((prev) => ({ ...prev, [item.id]: "" }));
      return;
    }

    if (/^\d+$/.test(value)) {
      const quantity = parseInt(value, 10);
      if (quantity > item.quantity) {
        setErrors((prev) => ({
          ...prev,
          [item.id]: `Only ${item.quantity} in stock`,
        }));
      } else {
        setErrors((prev) => ({ ...prev, [item.id]: "" }));
        setQuantities((prev) => ({ ...prev, [item.id]: quantity }));
        dispatch(updateQuantity({ id: item.id, quantity }));
      }
    }
  };

  const handleQuantityBlur = (item) => {
    let quantity = quantities[item.id];
    if (!quantity || quantity < 1) {
      quantity = 1;
      setQuantities((prev) => ({ ...prev, [item.id]: 1 }));
      dispatch(updateQuantity({ id: item.id, quantity }));
    }
  };

  const subtotal = cart_products.reduce(
    (acc, item) => acc + item.price * (quantities[item.id] ?? 1),
    0
  );

  return (
    <section
      className="cart-area py-5"
      style={{ backgroundColor: "#f4f8fb", minHeight: "100vh" }}
    >
      <div className="container">
        <div className="d-flex align-items-center mb-4" style={{ position: 'relative', top: '-30px' }}>
        </div>
        <div className="row">
          <div className="col-12">
            {cart_products.length > 0 ? (
              <div className="row">
                {/* Left side: Cart Table */}
                <div className="col-md-8">
                  <div className="table-responsive">
                    <table className="table table-bordered rounded shadow-sm bg-white">
                      <thead className="table-light text-dark text-center">
                        <tr>
                          <th colSpan="5" className="text-center fs-6 py-3">
                            Sample Cart Detail
                          </th>
                        </tr>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Remove</th>
                        </tr>
                      </thead>

                      <tbody>
                        {cart_products.map((item, i) => (
                          <tr key={i} className="text-center align-middle">
                            <td className="text-start">
                              <div className="d-flex align-items-center gap-3">
                                <img
                                  src={item.imageUrl}
                                  alt={item.samplename}
                                  style={{ width: "60px", borderRadius: "8px" }}
                                />
                                <span>{item.samplename}</span>
                              </div>
                            </td>

                            <td>{item.price.toFixed(2)}</td>
                            <td>
                              <div className="d-flex justify-content-center align-items-center gap-2">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleDecrease(item)}
                                >
                                  <Minus />
                                </button>
                                <input
                                  className="form-control text-center text-dark"
                                  type="text"
                                  value={quantities[item.id] ?? 1}
                                  onChange={(e) => handleQuantityChange(e, item)}
                                  onBlur={() => handleQuantityBlur(item)}
                                  style={{ width: "80px", fontWeight: "bold" }}
                                />
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleIncrease(item)}
                                >
                                  <Plus />
                                </button>
                              </div>
                              {errors[item.id] && (
                                <small className="text-danger">
                                  {errors[item.id]}
                                </small>
                              )}
                            </td>
                            <td>
                              {(item.price * (quantities[item.id] ?? 1)).toFixed(
                                2
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-circle"
                                onClick={() => handleRemoveProduct(item)}
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right side: Cart Totals */}
                <div className="col-12 col-md-4">
  <div className="card shadow-sm">
    <div className="card-body">
      <h5 className="card-title">Cart Totals</h5>
      <ul className="list-group list-group-flush mb-3">
        <li className="list-group-item d-flex justify-content-between">
          <strong>Subtotal</strong>
          <span className="text-truncate" style={{ maxWidth: "calc(100% - 70px)" }}>
            {subtotal.toFixed(2)}
          </span>
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <strong>Total</strong>
          <span className="text-truncate" style={{ maxWidth: "calc(100% - 70px)" }}>
            {subtotal.toFixed(2)}
          </span>
        </li>
      </ul>
      <button
        className="tp-btn cursor-pointer w-100"
        onClick={handleProceedToCheckout}
        style={{
          backgroundColor: "#003366",
          color: "white",
          border: "none",
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
</div>


              </div>
            ) : (
              <EmptyCart />
            )}
          </div>
        </div>
      </div>
    </section>
  );

};

export default CartArea;
