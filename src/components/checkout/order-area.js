// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { clear_cart } from "../../redux/features/cartSlice";
// import { useDispatch } from "react-redux";
// import { useRouter } from "next/router";
// import { notifyError, notifySuccess } from "@utils/toast";
// import PaymentCardElement from "@components/order/pay-card-element";
// const OrderArea = ({ sampleCopyData, stripe, isCheckoutSubmit, error }) => {


//   const { cart_products } = useSelector((state) => state.cart);

//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
//   const [showOrderDetails, setShowOrderDetails] = useState(false);
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [selectedSample, setSelectedSample] = useState(null);
//   const [samples, setSamples] = useState([]); // State to hold fetched samples

//   const dispatch = useDispatch();
//   const router = useRouter();

//   useEffect(() => {
//     // Retrieve data from localStorage
//     const trackingId = localStorage.getItem("tracking_id");
//     const createdAt = localStorage.getItem("created_at");
//     const orderStatus = localStorage.getItem("order_status");
//     const technicalAdminStatus = localStorage.getItem("technical_admin_status");
//     const committeeStatus = localStorage.getItem("committee_status");

//     if (trackingId) {
//       setOrderDetails({
//         tracking_id: trackingId,
//         created_at: createdAt,
//         order_status: orderStatus,
//         technical_admin_status: technicalAdminStatus,
//         committee_status: committeeStatus,
//       });
//     } else {
//       // router.push(`/dashboardheader?tab=my-samples`);
//     }
//     return () => {
//       localStorage.removeItem("tracking_id");
//       localStorage.removeItem("created_at");
//       localStorage.removeItem("order_status");
//       localStorage.removeItem("technical_admin_status");
//       localStorage.removeItem("committee_status");
//     };
//   }, [router]);
//   // Calculate subtotal
//   // const calculateSubtotal = () =>
//   //   cart_products?.reduce(
//   //     (total, item) => total + (item.quantity || 0) * (item.price || 0),
//   //     0
//   //   );
//   // const subtotal = calculateSubtotal();

//   // Calculate subtotal and total

//   const subtotal = cart_products.reduce(
//     (acc, item) => acc + item.price * item.orderQuantity,
//     0
//   );

//   // const validateDocuments = () => {
//   //   let missingFields = [];
//   //   if (!sampleCopyData.studyCopy) missingFields.push("Study Copy");
//   //   if (!sampleCopyData.reportingMechanism)
//   //     missingFields.push("Reporting Mechanism");
//   //   if (!sampleCopyData.irbFile) missingFields.push("IRB File");

//   //   if (missingFields.length > 0) {
//   //     notifyError(`Please upload the following: ${missingFields.join(", ")}`);
//   //     return false;
//   //   }
//   //   return true;
//   // };

//   const handleSubmit = async (paymentId) => {
//     // if (!validateDocuments()) return false;
//     console.log("Stored data:", {
//       tracking: sessionStorage.getItem("tracking_id"),
//       createdAt: sessionStorage.getItem("created_at")
//     });

//     const userID = sessionStorage.getItem("userID");

//     const formData = new FormData();
//     formData.append("researcher_id", userID);
//     formData.append("payment_id", paymentId);



//     // 2. Append cart items (excluding sampleIds)
//     formData.append(
//       "cart_items",
//       JSON.stringify(
//         cart_products.map((item) => ({
//           sample_id: item.id,
//           price: Number(item.price),
//           samplequantity: Number(item.orderQuantity),
//           volume: item.Volume,
//           VolumeUnit: item.VolumeUnit,
//           total: Number(item.orderQuantity) * Number(item.price),
//         }))
//       )
//     );

//     // 3. Add files and metadata
//     formData.append("study_copy", sampleCopyData.studyCopy);
//     formData.append("reporting_mechanism", sampleCopyData.reportingMechanism);
//     formData.append("irb_file", sampleCopyData.irbFile);
//     if (sampleCopyData.nbcFile) {
//       formData.append("nbc_file", sampleCopyData.nbcFile);
//     }
//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart`,
//         formData,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       const result = response.data;
//       const trackingId = result.tracking_id;
//       const created_at = result.created_at;

//       localStorage.setItem("tracking_id", trackingId); // ✅ store tracking ID
//       localStorage.setItem("created_at", created_at);
//       localStorage.setItem("order_status", "Pending");
//       localStorage.setItem("technical_admin_status", "Pending");

//       // ✅ After successful payment, redirect to order confirmation
//       router.push("/order-confirmation");
//       dispatch(clear_cart());
//       notifySuccess("Order placed successfully!");
//       // setTimeout(() => {
//       //   router.push({
//       //     pathname: "/order-confirmation",
//       //     query: { id: trackingId, created_at }, // ✅ optional: pass it to confirmation page
//       //   });
//       // }, 1000);

//       return true;
//     } catch (error) {
//       console.error("Error placing order:", error);
//       notifyError(
//         error.response?.data?.error || "Failed to place order. Please try again."
//       );
//       return false;
//     }

//   };



//   return (
//     <div className="container py-4" style={{ maxWidth: "750px" }}>
//       {/* View Order Button */}
//       {/* <div className="d-flex justify-content-center mb-4">
//         <button
//           className="btn text-white"
//           onClick={() => setShowOrderDetails(!showOrderDetails)}
//           style={{ fontSize: "16px", padding: "8px 20px", backgroundColor: "#0a1d4e", }}
//         >
//           {showOrderDetails ? "Hide Order Details" : "View Your Order"}
//         </button>
//       </div> */}

//       {/* Order Table */}
//       {/* {showOrderDetails && (
//         <div className="table-responsive mb-4">
//           <table className="table table-striped table-bordered align-middle">
//             <thead className="table-dark text-center">
//               <tr>
//                 <th>Analyte</th>
//                 <th>Price</th>
//                 <th>Quantity</th>
//                 <th>Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {cart_products?.length > 0 ? (
//                 cart_products.map((item, i) => (
//                   <tr key={i}>
//                     <td>{item.Analyte || "----"}</td>
//                     <td>{(item.price || 0).toFixed(2)}</td>
//                     <td>{item.orderQuantity || 0}</td>
//                     <td>
//                       {((item.orderQuantity || 0) * (item.price || 0)).toFixed(
//                         2
//                       )}{" "}
//                       {item.SamplePriceCurrency || "----"}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="4" className="text-center text-muted">
//                     Your cart is empty.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//             <tfoot>
//               <tr>
//                 <th colSpan="3" className="text-end text-dark">
//                   Subtotal:
//                 </th>
//                 <td className="fw-bold text-primary">
//                   {subtotal.toFixed(2)}{" "}
//                   {cart_products.length > 0
//                     ? cart_products[0].SamplePriceCurrency || "----"
//                     : "----"}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>
//       )} */}

//       {/* Payment Accordion */}
//       <div className="accordion" id="paymentAccordion">
//         <div className="accordion-item">
//           <h2 className="accordion-header" id="headingOne">
//             <button
//               className="accordion-button"
//               type="button"
//               data-bs-toggle="collapse"
//               data-bs-target="#collapseOne"
//               aria-expanded="false"  // It should be false for collapse
//               aria-controls="collapseOne"
//             >
//               Direct Bank Transfer
//             </button>
//           </h2>
//           <div
//             id="collapseOne"
//             className="accordion-collapse collapse"  // Remove the "show" class
//             aria-labelledby="headingOne"
//             data-bs-parent="#paymentAccordion"
//           >
//             <div className="accordion-body">
//               <PaymentCardElement
//                 stripe={stripe}
//                 cardError={error}
//                 cart_products={cart_products}
//                 isCheckoutSubmit={isCheckoutSubmit}
//                 handleSubmit={handleSubmit}
//               // validateDocuments={validateDocuments}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//     </div>
//   );
// };

// export default OrderArea;



import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { clear_cart } from "../../redux/features/cartSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { notifyError, notifySuccess } from "@utils/toast";
import PaymentCardElement from "@components/order/pay-card-element";

const OrderArea = ({ sampleCopyData, stripe, isCheckoutSubmit, error }) => {
  const { cart_products } = useSelector((state) => state.cart);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [selectedSample, setSelectedSample] = useState(null);
  const [samples, setSamples] = useState([]);

  const dispatch = useDispatch();
  const router = useRouter();

  // Calculate subtotal
  const subtotal = cart_products.reduce(
    (acc, item) => acc + item.price * item.orderQuantity,
    0
  );

  // Add validateDocuments function
  const validateDocuments = () => {
    // Implement your validation logic here
    if (!sampleCopyData.studyCopy || !sampleCopyData.reportingMechanism || !sampleCopyData.irbFile) {
      notifyError("Please provide all required documents");
      return false;
    }
    return true;
  };

  const handleSubmit = async (paymentId) => {
    console.log("Stored data:", {
      tracking: typeof window !== 'undefined' ? localStorage.getItem("tracking_id") : null,
      createdAt: typeof window !== 'undefined' ? localStorage.getItem("created_at") : null
    });

    // Get user ID from sessionStorage
    const userID = typeof window !== 'undefined' ? sessionStorage.getItem("userID") : null;

    if (!userID) {
      notifyError("User not found. Please log in again.");
      return false;
    }

    if (!validateDocuments()) return false;

    const formData = new FormData();

    formData.append("researcher_id", userID);
    formData.append("payment_id", paymentId);

    formData.append(
      "cart_items",
      JSON.stringify(
        cart_products.map((item) => ({
          sample_id: item.id,
          price: Number(item.price),
          samplequantity: Number(item.orderQuantity),
          volume: item.Volume,
          VolumeUnit: item.VolumeUnit,
          total: Number(item.orderQuantity) * Number(item.price),
        }))
      )
    );

    formData.append("study_copy", sampleCopyData.studyCopy);
    formData.append("reporting_mechanism", sampleCopyData.reportingMechanism);
    formData.append("irb_file", sampleCopyData.irbFile);
    if (sampleCopyData.nbcFile) {
      formData.append("nbc_file", sampleCopyData.nbcFile);
    }

    // Redirect immediately to show progress page
    router.push("/order-confirmation");

    // Then process API request in background
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const { tracking_id, created_at } = response.data;

      if (typeof window !== 'undefined') {
        sessionStorage.setItem("tracking_id", tracking_id);
        sessionStorage.setItem("created_at", created_at);
      }

      dispatch(clear_cart());
      notifySuccess("Order placed successfully!");

      // Redirect to confirmation page
      setTimeout(() => {
        router.push({
          pathname: "/order-confirmation",
          query: { id: tracking_id, created_at },
        });
      }, 500);
    } catch (error) {
      console.error("Error placing order:", error);
      notifyError(error.response?.data?.error || "Failed to place order.");
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "750px" }}>

      {/* Payment Accordion */}
      <div className="accordion" id="paymentAccordion">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOne">
            <button
              className="accordion-button"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="false"
              aria-controls="collapseOne"
            >
              Direct Bank Transfer
            </button>
          </h2>
          <div
            id="collapseOne"
            className="accordion-collapse collapse"
            aria-labelledby="headingOne"
            data-bs-parent="#paymentAccordion"
          >
            <div className="accordion-body">
              <PaymentCardElement
                stripe={stripe}
                cardError={error}
                cart_products={cart_products}
                isCheckoutSubmit={isCheckoutSubmit}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderArea;