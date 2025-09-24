import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  remove_product,
  set_cart_products,
} from "src/redux/features/cartSlice";
import { notifyError, notifySuccess } from "@utils/toast";
import Link from "next/link";
const CartArea = () => {
  const currencySymbols = {
    PKR: "Rs",
    USD: "$",
    EUR: "€",
    GBP: "£",
    INR: "₹", // Add more as needed
  };

  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const [loading, setLoading] = React.useState(false);
  const userID =
    typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;
  const hasTriggeredCheckoutRef = useRef(false);
  const priceIntervalRef = useRef(null);
  const unpricedItems = cart_products.filter(
    (item) => !item.price || item.price === 0
  );
  const validItems = cart_products.filter(
    (item) => item.price && item.price > 0
  );
  const displayCurrency =
    validItems.length > 0
      ? currencySymbols[validItems[0].SamplePriceCurrency] ||
        validItems[0].SamplePriceCurrency
      : "Rs";
  const allItemsHavePrice = unpricedItems.length === 0;

  const getCartHash = (items) => {
    return items
      .map((item) => item.id)
      .sort()
      .join("-");
  };
  const cartHash = getCartHash(unpricedItems);
  const quoteSentKey = `quoteSent_${userID}_${cartHash}`;
  const [quoteAlreadySent, setQuoteAlreadySent] = useState(false);

  const totalprice = cart_products.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    return acc + price;
  }, 0);

  const calculateCartBreakdown = (cart_products) => {
    // Step 1: Subtotal
    const subtotal = cart_products.reduce(
      (acc, item) => acc + (Number(item.price) || 0),
      0
    );

    // Step 2: Collect overall percentages/amounts (assuming same for all items or take first item)
    const taxPercent = Number(cart_products[0]?.tax_percent ?? 0);
    const taxAmount = Number(cart_products[0]?.tax_amount ?? 0);
    const platformPercent = Number(cart_products[0]?.platform_percent ?? 0);
    const platformAmount = Number(cart_products[0]?.platform_amount ?? 0);
    const freightPercent = Number(cart_products[0]?.freight_percent ?? 0);
    const freightAmount = Number(cart_products[0]?.freight_amount ?? 0);

    // Step 3: Calculate charges on subtotal
    const tax =
      taxPercent > 0
        ? (subtotal * taxPercent) / 100
        : taxAmount > 0
        ? taxAmount
        : 0;

    const platform =
      platformPercent > 0
        ? (subtotal * platformPercent) / 100
        : platformAmount > 0
        ? platformAmount
        : 0;

    const freight =
      freightPercent > 0
        ? (subtotal * freightPercent) / 100
        : freightAmount > 0
        ? freightAmount
        : 0;

    // Step 4: Grand Total
    const grandTotal = subtotal + tax + platform + freight;

    return {
      subtotal,
      tax,
      taxPercent,
      taxAmount,
      platform,
      platformPercent,
      platformAmount,
      freight,
      freightPercent,
      freightAmount,
      grandTotal,
    };
  };

  const {
    subtotal,
    tax,
    taxPercent,
    taxAmount,
    platform,
    platformPercent,
    platformAmount,
    freight,
    freightPercent,
    freightAmount,
    grandTotal,
  } = calculateCartBreakdown(cart_products);
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
        axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getSingleSample/${item.id}`
        )
      );

      const responses = await Promise.all(requests);

      const updatedItems = cartItems.map((item, idx) => {
        const updated = responses[idx]?.data;

        if (!updated || typeof updated.price === "undefined") return item;

        return {
          ...item,
          price: updated.price,
          SamplePriceCurrency: updated.SamplePriceCurrency,
          tax_amount: updated.tax_amount,
          tax_percent: updated.tax_percent,
          platform_amount: updated.platform_amount,
          platform_percent: updated.platform_percent,
          freight_amount: updated.freight_amount,
          freight_percent: updated.freight_percent,
        };
      });
      dispatch(set_cart_products(updatedItems));
    } catch (err) {
      console.error("Error updating prices", err);
    }
  };

  useEffect(() => {
    const triggerFromQuery = router.query.triggerCheckout === "true";
    const triggerFromStorage =
      sessionStorage.getItem("triggerCheckoutAfterLogin") === "true";
    if (
      (triggerFromQuery || triggerFromStorage) &&
      !hasTriggeredCheckoutRef.current &&
      userID
    ) {
      hasTriggeredCheckoutRef.current = true;
      if (triggerFromStorage)
        sessionStorage.removeItem("triggerCheckoutAfterLogin");
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
      alert(
        "Your quote request has already been sent. Please wait for Biobank's response."
      );
      return;
    }
    if (unpricedItems.length > 0) {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/send-email`,
          {
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
                quantity: item.quantity,
              })),
            }),
          }
        );
        const resData = await response.json();
        if (response.ok) {
          sessionStorage.setItem(quoteSentKey, "true");
          setQuoteAlreadySent(true); // ✅ triggers re-render
          notifySuccess(
            "Quote request has been sent to the Biobank. Please wait up to 24 hours for a price update."
          );
        } else {
          notifyError(
            `Quote request failed: ${resData.message || "Unknown error"}`
          );
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
    dispatch(remove_product(item)); // Remove ALL quoteSent keys for this user (old + new)
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(`quoteSent_${userID}_`)) {
        sessionStorage.removeItem(key);
      }
    });
    setQuoteAlreadySent(false);
  };

  return (
    <section
      className="cart-area py-5"
      style={{ backgroundColor: "#faf5f0", minHeight: "100vh" }}
    >
      <div className="container py-4">
        {/* Top Note */}

        {cart_products.length === 0 ? (
          <div className="text-center py-5">
            <i
              className="fas fa-shopping-cart"
              style={{
                fontSize: "80px",
                color: "#dc3545", // Bootstrap danger color
                marginBottom: "20px",
              }}
            ></i>
            <h4 className="fw-semibold mb-3">Your cart is empty</h4>
            <Link
              href="/shop"
              className="btn btn-danger rounded-pill px-4 py-2 shadow"
            >
              Browse Samples
            </Link>
          </div>
        ) : (
          <div className="row">
            <div
              className="text-center fw-medium mb-4 p-3 rounded"
              style={{
                backgroundColor: "#ffe6e6",
                color: "#b02a37",
                border: "1px solid #f5c2c7",
              }}
            >
              <i className="fas fa-clock me-2"></i>
              This sample will be accessible within 48 hours. After that, it
              will be automatically removed from your cart.
            </div>
            {/* Left - Cart Items */}
            <div className="col-lg-8 mb-4">
              <div className="card shadow border-0 rounded-3">
                <div className="card-body">
                  <h4 className="fw-semibold mb-4 text-danger">
                    Sample Details
                  </h4>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead style={{ backgroundColor: "#ffe6e6" }}>
                        <tr>
                          <th>Serial No.</th>
                          <th>Specimen ID</th>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Unit Price ({displayCurrency})</th>
                          <th>Remove</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cart_products.map((item, i) => (
                          <tr
                            key={i}
                            style={{
                              backgroundColor: i % 2 === 0 ? "#fff" : "#fdf6f0",
                            }}
                          >
                            <td>{i + 1}</td>
                            <td>
                              <span className="fw-semibold">
                                {item.masterid}
                              </span>
                            </td>
                            <td className="d-flex align-items-center gap-3">
                              <div>
                                <div className="fw-semibold">
                                  {item.Analyte}
                                </div>
                                <div className="text-muted small">
                                  {item.gender}, {item.age} years |{" "}
                                  {item.TestResult} {item.TestResultUnit}
                                </div>
                              </div>
                            </td>
                            <td>
                              {item.quantity} x {item.Volume}
                              {item.VolumeUnit}
                            </td>
                            <td>
                              {item.price && item.price > 0 ? (
                                <span className="fw-semibold text-dark">
                                  {Number(item.price).toLocaleString("en-PK", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              ) : (
                                <span className="text-danger fw-semibold">
                                  Please Quote
                                </span>
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
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="col-lg-4">
              <div className="card shadow border-0 rounded-3">
                <div className="card-body">
                  <h5 className="fw-semibold mb-3 text-danger">
                    Order Summary
                  </h5>
                  <ul className="list-group mb-3">
                    <li className="list-group-item d-flex justify-content-between">
                      <span>
                        <i className="fas fa-box me-2 text-danger"></i> Items
                      </span>
                      <span>{cart_products.length}</span>
                    </li>
                    <li className="list-group-item d-flex justify-content-between fw-semibold">
                      <span>
                        <i className="fas fa-receipt me-2 text-danger"></i>{" "}
                        Subtotal ({displayCurrency})
                      </span>
                      <span>
                        {subtotal && subtotal > 0
                          ? `${subtotal.toLocaleString("en-PK", {
                              minimumFractionDigits: 2,
                            })}`
                          : "---"}
                      </span>
                    </li>

                    {/* Tax */}
                    {(taxPercent > 0 || taxAmount > 0) && (
                      <li className="list-group-item d-flex justify-content-between fw-semibold">
                        <span>
                          <i className="fas fa-receipt me-2 text-danger"></i>{" "}
                          Tax ({taxPercent > 0 ? `${taxPercent}%` : taxAmount})
                        </span>
                        <span>
                          {tax.toLocaleString("en-PK", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    )}

                    {/* Platform */}
                    {(platformPercent > 0 || platformAmount > 0) && (
                      <li className="list-group-item d-flex justify-content-between fw-semibold">
                        <span>
                          <i className="fas fa-receipt me-2 text-danger"></i>{" "}
                          Platform Charges (
                          {platformPercent > 0
                            ? `${platformPercent}%`
                            : platformAmount}
                          )
                        </span>
                        <span>
                          {platform.toLocaleString("en-PK", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    )}

                    {/* Freight */}
                    {(freightPercent > 0 || freightAmount > 0) && (
                      <li className="list-group-item d-flex justify-content-between fw-semibold">
                        <span>
                          <i className="fas fa-receipt me-2 text-danger"></i>{" "}
                          Freight Charges (
                          {freightPercent > 0
                            ? `${freightPercent}%`
                            : freightAmount}
                          )
                        </span>
                        <span>
                          {freight.toLocaleString("en-PK", {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </li>
                    )}
                  </ul>

                  <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                    <span>Total ({displayCurrency})</span>
                    <span>
                      {grandTotal && grandTotal > 0
                        ? `${grandTotal.toLocaleString("en-PK", {
                            minimumFractionDigits: 2,
                          })}`
                        : "---"}
                    </span>
                  </div>

                  <button
                    className={`btn w-100 ${
                      allItemsHavePrice ? "btn-primary" : "btn-danger"
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
