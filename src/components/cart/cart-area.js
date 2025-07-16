import React, { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import EmptyCart from "@components/common/sidebar/cart-sidebar/empty-cart";
import { remove_product,set_cart_products } from "src/redux/features/cartSlice";
import { notifyError, notifySuccess } from "@utils/toast";

const CartArea = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart_products } = useSelector((state) => state.cart);
  const [loading, setLoading] = React.useState(false);
const [hasTriggeredCheckout, setHasTriggeredCheckout] = React.useState(false);
  const userID =
    typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;

  // ✅ Automatically trigger checkout after login if query param exists

useEffect(() => {
  const interval = setInterval(() => {
    const unpriced = cart_products.filter(item => !item.price || item.price === 0);
    if (unpriced.length > 0) {
      refreshCartPrices(cart_products, dispatch);
    } else {
      clearInterval(interval); // ✅ Stop checking once all are priced
    }
  }, 30000); // every 30 seconds

  return () => clearInterval(interval); // cleanup
}, [cart_products]);


const refreshCartPrices = async (cartItems, dispatch) => {
  try {
    const updatedItems = [];

    for (let item of cartItems) {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getSingleSample/${item.id}`
      );

      const updatedSample = response.data;
      console.log("Updated",updatedSample)
      updatedItems.push({
        ...item,
        price: updatedSample.price,
        SamplePriceCurrency: updatedSample.SamplePriceCurrency,
      });
    }

    dispatch(set_cart_products(updatedItems));
  } catch (error) {
    console.error("Error refreshing cart prices:", error);
  }
};


useEffect(() => {
  if (router.query.triggerCheckout === "true" && !hasTriggeredCheckout) {
    handleProceedToCheckout();
    setHasTriggeredCheckout(true);  // ✅ Prevent repeat
    router.replace("/cart", undefined, { shallow: true });
  }
}, [router.query, hasTriggeredCheckout]);


  const getCartHash = (items) => {
    return items.map((item) => item.id).sort().join("-");
  };

  const handleProceedToCheckout = async () => {
  if (loading) return;

  const pricedItems = cart_products.filter(
    (item) => item.price !== null && item.price > 0
  );

  const unpricedItems = cart_products.filter(
    (item) => item.price === null || item.price === 0
  );

  const cartHash = getCartHash(unpricedItems);
  const quoteSentKey = `quoteSent_${userID}_${cartHash}`;

  // ✅ If already sent, skip API call
  const alreadySent = sessionStorage.getItem(quoteSentKey);
  if (alreadySent === "true") {
    notifySuccess("Quote already requested. Await Biobank response.");
    return; // ✅ Exit early
  }

  setLoading(true); // ✅ only set loading AFTER passing checks

  if (!userID) {
    router.push("/login?from=cart");
    setLoading(false);
    return;
  }

  // ✅ Case 1: All items priced or all unpriced
  if (unpricedItems.length === 0 || pricedItems.length === 0) {
    router.push("/dashboardheader?tab=Checkout");
    setLoading(false);
    return;
  }

  // ✅ Send quote email only if not previously requested
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    const responseData = await response.json();
    console.log("Email API response:", response.status, responseData);

    if (response.ok) {
      sessionStorage.setItem(quoteSentKey, "true"); // ✅ prevent duplicate requests
      notifySuccess("Quote request sent to Biobank. Please wait for price updates.");
    } else {
      notifyError(`Failed to request quote: ${responseData.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Quote Request Error (frontend):", error);
    notifyError("Something went wrong. Try again.");
  }

  setLoading(false);
};


  const handleRemoveProduct = (item) => {
    dispatch(remove_product(item));
  };

  const validItems = cart_products.filter(
    (item) => item.price !== null && item.price !== 0
  );
  const subtotal = validItems.reduce((acc, item) => acc + item.price * 1, 0);

  const allItemsHavePrice = cart_products.every(
    (item) => item.price && item.price > 0
  );

  return (
    <section className="cart-area py-5" style={{ backgroundColor: "#f4f8fb", minHeight: "100vh" }}>
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
                          <th colSpan="6" className="text-center fs-6 py-3">
                            Sample Cart Detail
                          </th>
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
                                {[item.gender, item.age, `${item.TestResult}${item.TestResultUnit}`, `${item.Volume}${item.VolumeUnit}`]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            </td>
                            <td>{item.quantity}</td>
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

                      <button
                        className="tp-btn cursor-pointer w-100"
                        onClick={handleProceedToCheckout}
                        disabled={loading}
                        style={{
                          backgroundColor: loading ? "#ccc" : "#003366",
                          color: "white",
                          border: "none",
                          cursor: loading ? "not-allowed" : "pointer",
                        }}
                      >
                        {loading
                          ? "Please wait..."
                          : allItemsHavePrice
                            ? "Proceed to Checkout"
                            : "Request Quote"}
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
