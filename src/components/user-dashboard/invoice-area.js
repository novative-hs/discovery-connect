import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";


const InvoicePage = () => {
  const [userdata, setUserData] = useState()
  const { cart_products } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const invoiceRef = useRef(null);
  useEffect(() => {
    const user = sessionStorage.getItem("userdetail");
    if (user) {
      const parsedUser = JSON.parse(user); // ✅ Parse the string
      setUserData(parsedUser);

    }
    document.title = "Invoice";
  }, []);

  const handleDownload = async () => {
    if (typeof window !== "undefined") {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = invoiceRef.current;
      const opt = {
        margin: 0.5,
        filename: "invoice.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      html2pdf().set(opt).from(element).save();
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
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          th { background-color: #f2f2f2; }
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
    <div className="bg-light min-vh-100 py-5">
      <div ref={invoiceRef} className="container py-5" style={{ maxWidth: "1000px" }}>

        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <h4 className="fw-bold">Invoice Detail</h4>
          </div>
          {userdata?.orderid && (
            <h5 className="fw-bold">Order ID: {userdata.orderid}</h5>
          )}

        </div>

        <hr />

        <div className="row mb-4">
          <div className="col-md-6">
            <h6 className="fw-bold">User Detail:</h6>
            <p className="mb-1">Name: {userdata?.name || "-"}</p>
            <p className="mb-1 text-danger">Email: {userdata?.email || "-"}</p>
            <p className="mb-1 text-danger">Phone: {userdata?.phone || "-"}</p>
            <p className="mb-1">Organization Name: {userdata?.OrganizationName || "-"}</p>
            <p className="mb-1">Address: {userdata?.address || "-"}</p>
            <p className="mb-1">City: {userdata?.city || "-"}</p>
            <p className="mb-1">Country: {userdata?.country || "-"}</p>

            {/* 
          <h6 className="fw-bold mt-4">Payment Detail:</h6>
          <p className="mb-1">Cash</p>
          <p className="mb-1">Not Paid</p> */}
          </div>

          <div className="col-md-6">
            <h6 className="fw-bold mt-4">Order Detail:</h6>
            <p className="mb-1 text-danger">
              Invoice Generated Date Time: {new Date().toLocaleString("en-GB", {
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

        <h6 className="fw-semibold">Order summary</h6>
        <table className="table table-bordered mt-2">
          <thead className="table-light">
            <tr>
              <th>No.</th>
              <th>Analyte</th>
              <th>Volume (unit)</th>
              <th>Test Result /Unit</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Sub Total</th>
            </tr>
          </thead>

          <tbody>
            {cart_products?.length > 0 ? (
              <>
                {cart_products.map((item, index) => {
                  const price = Number(item.price) || "-";
                  const quantity = Number(item.orderQuantity) || 1;
                  const subTotal = price * quantity || "-";

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.Analyte}</td>
                      <td>{item.Volume} {item.VolumeUnit}</td>
                      <td>{item.TestResult ? item.TestResult : "----"} {item.TestResultUnit}</td>
                      <td>{quantity}</td>
                      <td>{price.toLocaleString()}</td>
                      <td>{subTotal.toLocaleString()}</td>
                    </tr>
                  );
                })}

                {/* Sampling Fee Row */}
                {/* <tr>
        <td colSpan="5" className="text-end fw-semibold">Sampling Fee</td>
        <td>500</td>
      </tr> */}

                {/* Platform Charges Row */}
                {/* Platform Charges Row */}
                <tr>
                  <td colSpan="6" className="text-end fw-semibold">Platform Charges</td>
                  <td>0</td>
                </tr>

                {/* Total Row */}
                <tr>
                  <td colSpan="6" className="text-end fw-bold fs-5">Total</td>
                  <td className="fw-bold fs-5">
                    {(
                      cart_products.reduce((sum, item) => {
                        const price = Number(item.price) || 0;
                        const qty = Number(item.orderQuantity) || 1;
                        return sum + (isNaN(price) ? 0 : price * qty);
                      }, 0)
                    ).toLocaleString()}
                  </td>
                </tr>

              </>
            ) : (
              <tr>
                <td colSpan="6" className="text-center text-danger">No items in cart.</td>
              </tr>
            )}
          </tbody>


        </table>

        <p className="text-danger mt-2" style={{ fontSize: "0.9rem" }}>
          Note: Numbers may not add up due to rounding, it is inconsequential enough to be ignored.
        </p>

        <div className="text-end mt-4 no-print">
          <button className="btn btn-success me-2" onClick={handlePrint}>
            <i className="bi bi-printer"></i> Print
          </button>
          <button className="btn btn-success" onClick={handleDownload}>
            <i className="bi bi-download"></i> Download
          </button>
        </div>

      </div>
    </div>
  );
};

export default InvoicePage;
