import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

const InvoicePage = () => {
  const [userdata, setUserData] = useState();
  const { cart_products } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const invoiceRef = useRef(null);

  // 🔹 Step 1: Calculate subtotal
  const subtotal = cart_products.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.orderQuantity) || 1;
    return acc + price * quantity;
  }, 0);

  // 🔹 Step 2: Extract overall charges
  const taxPercent = Number(cart_products[0]?.tax_percent || 0);
  const taxAmount = Number(cart_products[0]?.tax_amount || 0);

  const platformPercent = Number(cart_products[0]?.platform_percent || 0);
  const platformAmount = Number(cart_products[0]?.platform_amount || 0);

  const freightPercent = Number(cart_products[0]?.freight_percent || 0);
  const freightAmount = Number(cart_products[0]?.freight_amount || 0);

  // 🔹 Step 3: Calculate charges
  const tax = taxPercent > 0 ? (subtotal * taxPercent) / 100 : taxAmount;
  const platform =
    platformPercent > 0 ? (subtotal * platformPercent) / 100 : platformAmount;
  const freight =
    freightPercent > 0 ? (subtotal * freightPercent) / 100 : freightAmount;

  // 🔹 Step 4: Grand total
  const grandTotal = subtotal + tax + platform + freight;

  useEffect(() => {
    const user = sessionStorage.getItem("userdetail");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserData(parsedUser);
    }
    document.title = "Invoice";
  }, []);

  const handleDownload = async () => {
    if (typeof window !== "undefined") {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = invoiceRef.current;

      // Hide buttons
      const buttons = element.querySelectorAll(".no-print");
      buttons.forEach((btn) => (btn.style.display = "none"));

      const opt = {
        margin: [0.3, 0.3, 0.3, 0.3],
        filename: "invoice.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();

      // Restore buttons
      buttons.forEach((btn) => (btn.style.display = ""));
    }
  };

  const handlePrint = () => {
    const printContents = invoiceRef.current.innerHTML;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h4,h5,h6 { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f9f9f9; text-align: left; }
            .text-end { text-align: right; }
            .total-row { font-weight: bold; font-size: 1.05rem; }
            .section-title { font-size: 14px; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          ${printContents}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div
      ref={invoiceRef}
      className="container py-5"
      style={{
        maxWidth: "1000px",
        background: "#fff",
        border: "1px solid #ddd",
        padding: "30px",
        borderRadius: "8px",
      }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="fw-bold">Invoice Detail</h4>
        </div>
        {userdata?.orderid && (
          <h5 className="fw-bold">Order ID: {userdata.orderid}</h5>
        )}
      </div>

      <hr />

      {/* User & Order Details */}
      <div className="row mb-4">
        <div className="col-md-6">
          <h6 className="fw-bold">User Detail:</h6>
          <p className="mb-1">Name: {userdata?.name || "-"}</p>
          <p className="mb-1 text-danger">Email: {userdata?.email || "-"}</p>
          <p className="mb-1 text-danger">Phone: {userdata?.phone || "-"}</p>
          <p className="mb-1">
            Organization Name: {userdata?.organization || "-"}
          </p>
          <p className="mb-1">Address: {userdata?.address || "-"}</p>
          <p className="mb-1">City: {userdata?.city || "-"}</p>
          <p className="mb-1">Country: {userdata?.country || "-"}</p>
        </div>

        <div className="col-md-6">
          <h6 className="fw-bold">Order Detail:</h6>
          <p className="mb-1 text-danger">
            Invoice Date:{" "}
            {new Date().toLocaleString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
        </div>
      </div>

      {/* Order Summary */}
      <h4 className="fw-semibold mb-4">Order Summary</h4>
      <table
        className="table mt-2"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #000", // full box border
        }}
      >
        <thead
          className="table-light"
          style={{
            border: "1px solid #000",
          }}
        >
          <tr>
            <th style={{ border: "1px solid #000" }}>No.</th>
            <th style={{ border: "1px solid #000" }}>Analyte</th>
            <th style={{ border: "1px solid #000" }}>Volume (unit)</th>
            <th style={{ border: "1px solid #000" }}>Test Result /Unit</th>
            <th style={{ border: "1px solid #000" }}>Quantity</th>
            <th style={{ border: "1px solid #000" }} className="text-end">
              Price
            </th>
          </tr>
        </thead>

        <tbody>
          {cart_products?.length > 0 ? (
            <>
              {cart_products.map((item, index) => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.orderQuantity) || 1;
                return (
                  <tr key={index}>
                    <td style={{ border: "1px solid #000" }}>{index + 1}</td>
                    <td style={{ border: "1px solid #000" }}>{item.Analyte}</td>
                    <td style={{ border: "1px solid #000" }}>
                      {item.Volume} {item.VolumeUnit}
                    </td>
                    <td style={{ border: "1px solid #000" }}>
                      {item.TestResult || "----"} {item.TestResultUnit}
                    </td>
                    <td style={{ border: "1px solid #000" }}>{quantity}</td>
                    <td style={{ border: "1px solid #000" }} className="text-end pe-3">
                      {{
                        PKR: "Rs",
                        USD: "$",
                      }[item.SamplePriceCurrency] || item.SamplePriceCurrency}{" "}
                      {price.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                );
              })}

              {/* Totals */}
              <tr>
                <td colSpan="4" style={{ border: "1px solid #000" }}></td>
                <td style={{ border: "1px solid #000" }} className="text-end fw-semibold">
                  Subtotal
                </td>
                <td style={{ border: "1px solid #000" }} className="text-end pe-3">
                  {subtotal.toLocaleString("en-PK")}
                </td>
              </tr>

              <tr>
                <td colSpan="4" style={{ border: "1px solid #000" }}></td>
                <td style={{ border: "1px solid #000" }} className="text-end fw-semibold">
                  Tax ({taxPercent > 0 ? `${taxPercent}%` : taxAmount})
                </td>
                <td style={{ border: "1px solid #000" }} className="text-end pe-3">
                  {tax.toLocaleString("en-PK")}
                </td>
              </tr>

              <tr>
                <td colSpan="4" style={{ border: "1px solid #000" }}></td>
                <td style={{ border: "1px solid #000" }} className="text-end fw-semibold">
                  Platform Charges ({platformPercent > 0 ? `${platformPercent}%` : platformAmount})
                </td>
                <td style={{ border: "1px solid #000" }} className="text-end pe-3">
                  {platform.toLocaleString("en-PK")}
                </td>
              </tr>

              <tr>
                <td colSpan="4" style={{ border: "1px solid #000" }}></td>
                <td style={{ border: "1px solid #000" }} className="text-end fw-semibold">
                  Freight Charges
                </td>
                <td style={{ border: "1px solid #000" }} className="text-end pe-3">
                  {freight.toLocaleString("en-PK")}
                </td>
              </tr>

              <tr className="total-row">
                <td colSpan="4" style={{ border: "1px solid #000" }}></td>
                <td style={{ border: "1px solid #000" }} className="text-end fw-bold">
                  Total
                </td>
                <td style={{ border: "1px solid #000" }} className="text-end fw-bold">
                  {grandTotal.toLocaleString("en-PK")}
                </td>
              </tr>
            </>
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-danger" style={{ border: "1px solid #000" }}>
                No items in cart.
              </td>
            </tr>
          )}
        </tbody>
      </table>


      {/* Note */}
      <p className="text-danger mt-2" style={{ fontSize: "0.9rem" }}>
        Note: Numbers may not add up due to rounding, it is inconsequential
        enough to be ignored.
      </p>

      {/* Buttons */}
      <div className="text-end mt-4 no-print">
        <button className="btn btn-success me-2" onClick={handlePrint}>
          <i className="bi bi-printer"></i> Print
        </button>
        <button className="btn btn-success" onClick={handleDownload}>
          <i className="bi bi-download"></i> Download
        </button>
      </div>
    </div>
  );
};

export default InvoicePage;
