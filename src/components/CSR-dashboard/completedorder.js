import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { notifySuccess,notifyError } from "@utils/toast";

const CompletedSampleArea = () => {
  const [staffAction, setStaffAction] = useState("");
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCartId, setSelectedCartId] = useState(null);
  const [isReceived, setIsReceived] = useState(false);
  const [receiptSlip, setReceiptSlip] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const id = typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;

  // Fetch staffAction only once when component mounts
  useEffect(() => {
    const action = sessionStorage.getItem("staffAction") || "";
    setStaffAction(action);
  }, []);

  // Fetch samples on first render & when staffAction changes
  useEffect(() => {
    if (id && staffAction) {
      fetchSamples(staffAction);
    }
  }, [id, staffAction]);

  const fetchSamples = async (staffAction) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/order/getOrderbyCSR`,
        {
          params: { csrUserId: id, staffAction },
        }
      );

      const shippingSamples = response.data.filter(
        (sample) => sample.order_status === "Completed"
      );

      setSamples(shippingSamples);
      setFilteredSamples(shippingSamples);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  // Group by tracking_id helper
  const getGroupedData = (data) => {
    const grouped = Object.values(
      data.reduce((acc, sample) => {
        if (!acc[sample.tracking_id]) {
          acc[sample.tracking_id] = { ...sample, analytes: [] };
        }
        acc[sample.tracking_id].analytes.push(sample.Analyte);
        return acc;
      }, {})
    );
    return grouped;
  };

  // Update pagination whenever filteredSamples or currentPage changes
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(filteredSamples.length / 10));
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0);
    }
  }, [filteredSamples, currentPage]);

  const tableHeaders = [
    { label: "Order ID", key: "tracking_id" },
    { label: "User Name", key: "researcher_name" },
    { label: "Analyte", key: "Analyte" },
    { label: "Order Date", key: "created_at" },
    { label: "Status", key: "order_status" },
    // { label: "Action", key: "action" },
  ];

  const itemsPerPage = 10;

  // Group filtered samples by tracking_id
  const groupedData = getGroupedData(filteredSamples);
  // Paginate grouped data
  const currentData = groupedData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );
  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
    setExpandedId(null); // Collapse any open details when page changes
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "DeliveryDate") setDeliveryDate(value);
    if (name === "DeliveryTime") setDeliveryTime(value);
  };

  // Filter samples by field and value; filters original samples, not grouped data
  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = samples;
    } else {
      filtered = samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredSamples(filtered);
    setCurrentPage(0);
    setExpandedId(null); // Collapse details on filter change
  };


  const handleCompleteOrder = async () => {
    if (!deliveryDate || !deliveryTime) {
      notifyError("Please select all the details.");
      return setIsSubmitting(false);
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderid", selectedCartId); // sends as string
      formData.append("cartStatus", "Completed");
      formData.append("deliveryDate", deliveryDate);
      formData.append("deliveryTime", deliveryTime);
      if (receiptSlip) formData.append("dispatchSlip", receiptSlip);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/order/updateOrderStatus`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      notifySuccess("Order Successfully Completed")
      setShowConfirmModal(false);
      fetchSamples();
    } catch (err) {
      console.error("Error completing order:", err);
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <h4 className="text-center text-dark fw-bold mb-4">Completed Ordered</h4>

        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle table-sm shadow-sm rounded">
            <thead className="table-primary text-white">
              <tr>
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">
                    {key !== "action" ? (
                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                          placeholder={`Search ${label}`}
                          onChange={(e) => handleFilterChange(key, e.target.value)}
                          style={{ minWidth: "150px" }}
                        />
                        <span className="fw-bold mt-1 d-block text-wrap fs-6">{label}</span>
                      </div>
                    ) : (
                      <span className="fw-bold mt-1 d-block text-wrap fs-6">{label}</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-light">
              {currentData.length > 0 ? (
                currentData.map((sample) => (
                  <React.Fragment key={sample.tracking_id}>
                    <tr>
                      <td>{sample.tracking_id || "----"}</td>
                      <td>{sample.researcher_name}</td>
                      <td>
                        {expandedId === sample.tracking_id ? (
                          <ul style={{ textAlign: "left", paddingLeft: "20px", margin: 0 }}>
                            {sample.analytes.map((analyte, i) => (
                              <li key={i}>{analyte}</li>
                            ))}
                          </ul>
                        ) : (
                          `${sample.analytes.length} item(s)`
                        )}
                      </td>

                      <td>
                        {new Date(sample.created_at)
                          .toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })
                          .replace(/ /g, "-")}
                      </td>
                      <td>{sample.order_status}</td>
                     
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={tableHeaders.length} className="text-center">
                    No samples available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            handlePageClick={handlePageChange}
            pageCount={totalPages}
            focusPage={currentPage}
          />
        )}
        {showConfirmModal && (
          <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content p-3 rounded-3 shadow-lg border-0">
                {/* Header */}
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold text-dark">Confirm Order</h5>
                  <button
                    className="btn-close"
                    style={{ filter: "invert(0.5)" }}
                    onClick={() => setShowConfirmModal(false)}
                  ></button>
                </div>

                {/* Body */}
                <div className="modal-body">
                  <div className="mt-3">
                    <label className="form-label fw-semibold">Dispatch Date</label>
                    <input
                      type="date"
                      className="form-control border rounded-2 shadow-sm"
                      name="DeliveryDate"
                      value={deliveryDate}
                      max={new Date().toISOString().split("T")[0]}  // 👈 disables future dates
                      onChange={handleInputChange}
                    />
                  </div>


                  <div className="mt-3">
                    <label className="form-label fw-semibold">Dispatch Time</label>
                    <input
                      type="time"
                      className="form-control border rounded-2 shadow-sm"
                      name="DeliveryTime"
                      value={deliveryTime}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mt-3">
                    <label className="form-label fw-semibold">Upload Receipt (Optional)</label>
                    <input
                      type="file"
                      className="form-control border rounded-2 shadow-sm"
                      onChange={(e) => setReceiptSlip(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-0">
                  <button
                    className="btn px-4 py-2 text-white fw-semibold"
                    style={{
                      backgroundColor: isSubmitting ? "#6c757d" : "#28a745", // green instead of blue
                      borderRadius: "8px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                    disabled={isSubmitting}
                    onClick={handleCompleteOrder}
                  >
                    {isSubmitting ? "Processing..." : "Order Complete"}
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

export default CompletedSampleArea;
