import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import { remove_product, set_cart_products } from "src/redux/features/cartSlice";
import { notifyError, notifySuccess } from "@utils/toast";

const CartArea = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const [loading, setLoading] = React.useState(false);

  const userID = typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;
  const hasTriggeredCheckoutRef = useRef(false);
  const priceIntervalRef = useRef(null);

  const unpricedItems = cart_products.filter((item) => !item.price || item.price === 0);
  const validItems = cart_products.filter((item) => item.price && item.price > 0);
  const allItemsHavePrice = unpricedItems.length === 0;
  const subtotal = validItems.reduce((acc, item) => acc + item.price, 0);

  const getCartHash = (items) => {
    return items.map((item) => item.id).sort().join("-");
  };

  const cartHash = getCartHash(unpricedItems);
  const quoteSentKey = `quoteSent_${userID}_${cartHash}`;
  const [quoteAlreadySent, setQuoteAlreadySent] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(quoteSentKey) === "true";
    setQuoteAlreadySent(stored);
  }, [quoteSentKey]);


  // ⏱ Refresh prices every 30s
  useEffect(() => {
    if (unpricedItems.length > 0) {
      priceIntervalRef.current = setInterval(() => {
        refreshCartPrices(cart_products);
      }, 30000);
    }

    return () => {
      if (priceIntervalRef.current) clearInterval(priceIntervalRef.current);
    };
  }, [cart_products]);

  const refreshCartPrices = async (cartItems) => {
    try {
      const requests = cartItems.map((item) =>
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getSingleSample/${item.id}`)
      );
      const responses = await Promise.all(requests);

      const updatedItems = cartItems.map((item, idx) => {
        const updated = responses[idx]?.data;
        if (!updated || typeof updated.price === "undefined") return item;
        return {
          ...item,
          price: updated.price,
          SamplePriceCurrency: updated.SamplePriceCurrency,
        };
      });

      dispatch(set_cart_products(updatedItems));
    } catch (err) {
      console.error("Error updating prices", err);
    }
  };

  // 🔁 Auto-trigger after login
  useEffect(() => {
    const triggerFromQuery = router.query.triggerCheckout === "true";
    const triggerFromStorage = sessionStorage.getItem("triggerCheckoutAfterLogin") === "true";

    if ((triggerFromQuery || triggerFromStorage) && !hasTriggeredCheckoutRef.current && userID) {
      hasTriggeredCheckoutRef.current = true;

      if (triggerFromStorage) sessionStorage.removeItem("triggerCheckoutAfterLogin");

      handleProceedToCheckout();

      if (triggerFromQuery) {
        router.replace("/cart", undefined, { shallow: true });
      }
    }
  }, [router.query, userID]);

  const handleProceedToCheckout = async () => {
    if (loading) return;

    if (!userID) {
      sessionStorage.setItem("triggerCheckoutAfterLogin", "true");
      router.push("/login?from=cart&triggerCheckout=true");
      return;
    }
    if (quoteAlreadySent) {
      alert("Your quote request has already been sent. Please wait for Biobank's response.");
      return;
    }
    if (unpricedItems.length > 0) {

      try {
        setLoading(true);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/send-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userID,
            products: unpricedItems.map((item) => ({
              id: item.id,
              masterid: item.masterid,
              analyte: item.Analyte,
              Volume: item.Volume,
              VolumeUnit: item.VolumeUnit,
              TestResult: item.TestResult,
              TestResultUnit: item.TestResultUnit,
              price: item.price,
            })),
          }),
        });

        const resData = await response.json();

        if (response.ok) {
          sessionStorage.setItem(quoteSentKey, "true");
          setQuoteAlreadySent(true); // ✅ triggers re-render
          notifySuccess("Quote request has been sent to the Biobank. Please wait up to 24 hours for a price update.");
        } else {
          notifyError(`Quote request failed: ${resData.message || "Unknown error"}`);
        }
      } catch (err) {
        console.error(err);
        notifyError("Failed to request quote. Try again.");
      } finally {
        setLoading(false);
      }

      return;
    }

    router.push("/dashboardheader?tab=Checkout");
  };

  const handleRemoveProduct = (item) => {
    dispatch(remove_product(item));
  };

  return (
    <section className="cart-area py-5" style={{ backgroundColor: "#f4f8fb", minHeight: "100vh" }}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            {cart_products.length > 0 ? (
              <div className="row">
                <div className="col-md-8">
                  <div className="table-responsive">
                    <table className="table table-bordered bg-white rounded shadow-sm">
                      <thead className="table-light text-center">
                        <tr>
                          <th colSpan="6" className="fs-6 py-3">Sample Cart Detail</th>
                        </tr>
                        <tr>
                          <th>Serial No.</th>
                          <th>Specimen ID</th>
                          <th>Analyte</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart_products.map((item, i) => (
                          <tr key={i} className="text-center align-middle">
                            <td>{i + 1}</td>
                            <td>{item.masterid}</td>
                            <td>
                              <div>{item.Analyte}</div>
                              <div>
                                {[item.gender, `${item.age} year`, `${item.TestResult}${item.TestResultUnit}`]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            </td>
                            <td>{`${item.quantity} x ${item.Volume}${item.VolumeUnit}`}</td>
                            <td>{item.price && item.price > 0 ? item.price : "Please Quote"}</td>
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
                      {validItems.length > 0 ? (
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
                      ) : (
                        <div className="alert alert-warning p-2">Pricing not available.</div>
                      )}

                      <div
                        onClick={() => {
                          if (quoteAlreadySent && !loading && !allItemsHavePrice) {
                            alert("Your quote request has already been sent. Please wait for Biobank's response.");
                          }
                        }}
                      >
                        <button
                          className="tp-btn cursor-pointer w-100"
                          onClick={handleProceedToCheckout}
                          disabled={loading || quoteAlreadySent}
                        >
                          {loading
                            ? "Please wait..."
                            : allItemsHavePrice
                              ? "Proceed to Checkout"
                              : quoteAlreadySent
                                ? "Quote Requested"
                                : "Request Quote"}
                        </button>
                      </div>

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
