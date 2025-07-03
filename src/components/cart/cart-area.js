import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import { remove_product } from "src/redux/features/cartSlice";

const CartArea = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);

  const userID =
    typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;

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

  const subtotal = cart_products.reduce((acc, item) => acc + item.price * 1, 0);

  return (
    <section
      className="cart-area py-5"
      style={{ backgroundColor: "#f4f8fb", minHeight: "100vh" }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            {cart_products.length > 0 ? (
              <div className="row">
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
                          <th>Analyte</th>
                          {/* <th>Price</th> */}
                          <th>Quantity</th>
                          {/* <th>Total</th> */}
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
                                  alt="Visa"
                                  style={{ width: "60px", borderRadius: "8px" }}
                                />
                                <span>{item.Analyte}</span>
                              </div>
                            </td>
                            {/* <td>{item.price.toFixed(2)}</td> */}
                            <td>{item.quantity}</td>
                            {/* <td>{(item.price * 1).toFixed(2)}</td> */}
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

                <div className="col-12 col-md-4">
                  <div className="card shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title">Cart Totals</h5>
                      <ul className="list-group list-group-flush mb-3">
                        <li className="list-group-item d-flex justify-content-between">
                          <strong>Subtotal</strong>
                          <span>{subtotal.toFixed(2)}</span>
                        </li>
                        <li className="list-group-item d-flex justify-content-between">
                          <strong>Total</strong>
                          <span>{subtotal.toFixed(2)}</span>
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
