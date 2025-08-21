import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import { remove_product, set_cart_products } from "src/redux/features/cartSlice";
import { notifyError, notifySuccess } from "@utils/toast";

const CartArea = () => {
  const currencySymbols = {
    PKR: "Rs",
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹",
    // Add more as needed
  };
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const [loading, setLoading] = React.useState(false);

  const userID = typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;
  const hasTriggeredCheckoutRef = useRef(false);
  const priceIntervalRef = useRef(null);

  const unpricedItems = cart_products.filter((item) => !item.price || item.price === 0);
  const validItems = cart_products.filter((item) => item.price && item.price > 0);
  const displayCurrency =
    validItems.length > 0
      ? currencySymbols[validItems[0].SamplePriceCurrency] ||
      validItems[0].SamplePriceCurrency
      : "Rs";

  const allItemsHavePrice = unpricedItems.length === 0;
  const subtotal = validItems.reduce((acc, item) => acc + item.price, 0);


  const getCartHash = (items) => {
    return items.map((item) => item.id).sort().join("-");
  };

  const cartHash = getCartHash(unpricedItems);
  const quoteSentKey = `quoteSent_${userID}_${cartHash}`;
  const [quoteAlreadySent, setQuoteAlreadySent] = useState(false);

 useEffect(() => {
  // Recalculate cart hash on every cart change
  const newCartHash = getCartHash(unpricedItems);
  const newQuoteSentKey = `quoteSent_${userID}_${newCartHash}`;
  const stored = sessionStorage.getItem(newQuoteSentKey) === "true";

  setQuoteAlreadySent(stored);
}, [cart_products, userID]);



  // ⏱ Refresh prices every 30s
  useEffect(() => {
    if (unpricedItems.length > 0) {
      priceIntervalRef.current = setInterval(() => {
        refreshCartPrices(cart_products);
      }, 15000);
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
        router.replace("/cart");
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
              quantity: item.quantity
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

  // Remove ALL quoteSent keys for this user (old + new)
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith(`quoteSent_${userID}_`)) {
      sessionStorage.removeItem(key);
    }
  });

  setQuoteAlreadySent(false);
};



  return (
    <section className="cart-area py-5">
      <div className="container py-5">
        {/* Note at the top */}
        <div className="alert alert-info text-center fw-medium mb-4">
          Note: This sample will be accessible within 48 hours. After that, it will be automatically removed from your cart.
        </div>

        {cart_products.length === 0 ? (
          // 🚫 Empty cart UI
          <div className="text-center py-5">
            <h4 className="fw-semibold mb-3">Your cart is currently empty.</h4>
            {/* <p className="text-muted">Start exploring our samples and add items to your cart.</p>
            <a href="/shop" className="btn btn-primary mt-3">
              Browse Samples
            </a> */}
          </div>
        ) : (
          // ✅ Your existing cart layout (no changes needed below)

          <div className="row">
            {/* Left: Cart Items */}
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h4 className="fw-semibold mb-4">Sample Details</h4>
                  <div className="table-responsive">
                    <table className="table align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Serial No.</th>
                          <th>Specimen ID</th>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart_products.map((item, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            {/* Product Details */}
                            <td><div className="fw-semibold">{item.masterid}</div></td>
                            <td className="d-flex align-items-center gap-3">

                              <div>
                                <div className="fw-semibold">{item.Analyte}</div>
                                <div className="text-muted small">
                                  {/* Gender and Age */}
                                  {(item.gender || item.age) && (
                                    <>
                                      {item.gender}
                                      {item.age ? `${item.gender ? ', ' : ''}${item.age} years` : ''}
                                    </>
                                  )}

                                  {/* Separator + TestResult */}
                                  {(item.TestResult || item.TestResultUnit) && (item.gender || item.age) && ' | '}
                                  {(item.TestResult || item.TestResultUnit) && (
                                    <>
                                      {item.TestResult ?? ''} {item.TestResultUnit ?? ''}
                                    </>
                                  )}
                                </div>



                              </div>
                            </td>

                            {/* Quantity */}
                            <td>{item.quantity} x {item.Volume}{item.VolumeUnit}</td>

                            {/* Price */}
                            <td>
                              {item.price && item.price > 0 ? (
                                <span>
                                  {currencySymbols[item.SamplePriceCurrency] || item.SamplePriceCurrency || "Rs"}
                                  {Number(item.price).toLocaleString("en-PK", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              ) : (
                                <span className="text-danger">Please Quote</span>
                              )}
                            </td>

                            {/* Remove Button */}
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleRemoveProduct(item)}
                                title="Remove"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* <a href="/shop" className="text-decoration-none text-primary fw-medium">
                  ← Continue Shopping
                </a> */}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="fw-semibold mb-3">Order Summary</h5>
                  <ul className="list-group mb-3">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>Items</span>
                      <span>{cart_products.length}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between align-items-center fw-semibold">
                      <span>Subtotal</span>
                      <span>
                        <span>
                          {subtotal && subtotal > 0 ? (
                            <>
                              {displayCurrency}
                              {subtotal.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                            </>
                          ) : (
                            "---"
                          )}
                        </span>


                      </span>
                    </li>

                    {/* <li className="list-group-item d-flex justify-content-between">
                    <span>Shipping</span>
                    <span>Standard - Rs. 0.00</span>
                  </li> */}
                  </ul>

                  {/* Promo Code */}
                  {/* <div className="mb-3">
                  <label className="form-label fw-medium">Promo Code</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your code"
                      disabled
                    />
                    <button className="btn btn-danger" disabled>
                      Apply
                    </button>
                  </div>
                </div> */}

                  {/* Total Cost */}

                  <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                    <span>Total</span>
                    <span>
                      {subtotal && subtotal > 0 ? (
                        <>
                          {displayCurrency}
                          {subtotal.toLocaleString("en-PK", { minimumFractionDigits: 2 })}
                        </>
                      ) : (
                        "---"
                      )}
                    </span>
                  </div>
                  {/* Checkout Button */}
                  <button
                    className={`btn w-100 ${allItemsHavePrice ? "btn-primary" : "btn-danger"
                      }`}
                    onClick={handleProceedToCheckout}
                    disabled={loading || quoteAlreadySent}
                  >
                    {loading
                      ? "Please wait..."
                      : allItemsHavePrice
                        ? "Checkout"
                        : quoteAlreadySent
                          ? "Quote Requested"
                          : "Request Quote"}
                  </button>

                  {quoteAlreadySent && !allItemsHavePrice && (
                    <div className="mt-2 text-center text-muted small">
                      Your quote will be processed within 24–48 hours.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </section>

  );
};

export default CartArea;
