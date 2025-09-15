import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import Pagination from "@ui/Pagination";
import { notifySuccess, notifyError } from "@utils/toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";

const DispatchSampleArea = () => {
  const id = sessionStorage.getItem("userID");

  const [staffAction, setStaffAction] = useState(() => sessionStorage.getItem("staffAction") || "");
  const [samples, setSamples] = useState([]);
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [showOrderStatusModal, setShowOrderStatusModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // ✅ Confirm Order modal
  const [orderStatus, setOrderStatus] = useState("Dispatched");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUserSamples, setSelectedUserSamples] = useState([]);
  const [selectedUserName, setSelectedUserName] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchVia, setDispatchVia] = useState("");
  const [dispatchSlip, setDispatchSlip] = useState(null);
  const fileInputRef = useRef(null);
  const [currency, setCurrency] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "DeliveryDate") setDeliveryDate(value);
    if (name === "DeliveryTime") setDeliveryTime(value);
  };

  const tableHeaders = [
    { label: "Order ID", key: "tracking_id" },
    { label: "Order Date", key: "created_at" },
    { label: "Product Location", key: "source_name" },
    { label: "Customer Name", key: "researcher_name" },
    { label: "Customer City", key: "city_name" },
  ];

  const fetchSamples = async (action = staffAction) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/order/getOrderbyCSR`,
        { params: { csrUserId: id, staffAction: action } }
      );
      const shippingSamples = response.data.filter(
        (sample) => sample.order_status === "Dispatched"
      );
      setSamples(shippingSamples);
      setFilteredSamplename(shippingSamples);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    if (filteredSamplename.length > 0) {
      setCurrency(filteredSamplename[0].SamplePriceCurrency || "PKR");
    } else {
      setCurrency("PKR");
    }
  }, [filteredSamplename]);

  const groupedSamples = filteredSamplename.reduce((acc, sample) => {
    const key = sample.tracking_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sample);
    return acc;
  }, {});

  const groupedList = Object.entries(groupedSamples).slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  useEffect(() => {
    if (id) fetchSamples(staffAction);
  }, [staffAction, id]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(Object.keys(groupedSamples).length / itemsPerPage));
    setTotalPages(pages);
    if (currentPage >= pages) setCurrentPage(0);
  }, [filteredSamplename]);

  const handlePageChange = (event) => setCurrentPage(event.selected);

  const handleFilterChange = (field, value) => {
    let filtered = value.trim()
      ? samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      )
      : samples;
    setFilteredSamplename(filtered);
    setCurrentPage(0);
  };

  // ✅ Confirm Order submit
  const handleCompleteOrder = async () => {
    if (!deliveryDate || !deliveryTime) {
      notifyError("Please select all the details.");
      return setIsSubmitting(false);
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("orderid", selectedUserSamples[0]?.id);
      formData.append("cartStatus", "Completed");
      formData.append("deliveryDate", deliveryDate);
      formData.append("deliveryTime", deliveryTime);
      if (dispatchSlip) formData.append("dispatchSlip", dispatchSlip);

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/order/updatestatusbyCSR`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      notifySuccess(res.data.message || "Order Successfully Completed");
      setShowConfirmModal(false);
      fetchSamples();
    } catch (err) {
      console.error("Error completing order:", err);
      notifyError("Failed to complete order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (id === null) return <div>Loading...</div>;

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <h4 className="text-center text-dark fw-bold mb-4">
          🚚 Dispatched Orders
        </h4>
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle table-sm shadow-sm rounded">
            <thead className="table-primary text-white">
              <tr>
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">
                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                        placeholder={`Search ${label}`}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        style={{ minWidth: "150px" }}
                      />
                      <span className="fw-bold mt-1 d-block text-wrap fs-6">
                        {label}
                        {label === "Unit Price" && groupedList.length > 0
                          ? ` (${currency || "PKR"})`
                          : ""}
                        {label === "Total" && groupedList.length > 0
                          ? ` (${currency || "PKR"})`
                          : ""}
                      </span>
                    </div>
                  </th>
                ))}
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="bg-light">
              {groupedList.length > 0 ? (
                groupedList.map(([researcher, records]) => (
                  <tr key={researcher}>
                    <td>{records[0].tracking_id || "---"}</td>
                    <td>{new Date(records[0].created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }).replace(/ /g, "-")}</td>
                    <td>{records[0].BiobankName || records[0].CollectionSiteName || "---"}</td>
                    <td>{records[0].researcher_name}</td>
                    <td>{records[0].city_name}</td>
                    <td className="d-flex gap-2 justify-content-center">
                      <button
                        className="btn btn-outline-success btn-sm rounded-pill shadow"
                        onClick={() => {
                          setSelectedUserSamples(records);
                          setSelectedUserName(researcher);
                          setShowOrderStatusModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faFileInvoice} /> View
                      </button>
                      <button
                        className="btn btn-success btn-sm rounded-pill shadow"
                        onClick={() => {
                          setSelectedUserSamples(records);
                          setShowConfirmModal(true);
                        }}
                      >
                        Confirm Order
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No samples available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination pageCount={totalPages} onPageChange={handlePageChange} />

        {/* ✅ Order Details Modal (View) */}
        {showOrderStatusModal && (
          <Modal show onHide={() => setShowOrderStatusModal(false)} size="lg" centered scrollable>
            <Modal.Header closeButton>
              <Modal.Title>Order Detail - {selectedUserName}</Modal.Title>
            </Modal.Header>
            <Modal.Body
              className="p-4 bg-light rounded-3 shadow-sm"
              style={{ maxHeight: "80vh", overflowY: "auto" }} // max height & scroll
            >

              <div className="table-responsive">
                <table className="table table-bordered table-hover text-center table-sm align-middle bg-white rounded shadow-sm">
                  <thead className="table-success text-dark">
                    <tr>
                      <th>Item</th>
                      <th>Qty X Volume</th>

                      <th>
                        Unit Price ({selectedUserSamples[0]?.SamplePriceCurrency || '$'})
                      </th>

                    </tr>
                  </thead>
                  <tbody>
                    {selectedUserSamples.map((sample, i) => (
                      <tr key={i}>
                        <td className="text-start">
                          <div>
                            <div className="fw-semibold">{sample.Analyte}</div>
                            <div className="text-muted small">
                              {/* Gender and Age */}
                              {(sample.gender || sample.age) && (
                                <>
                                  {sample.gender}
                                  {sample.age ? `${sample.gender ? ', ' : ''}${sample.age} years` : ''}
                                </>
                              )}

                              {/* Separator + TestResult */}
                              {(sample.TestResult || sample.TestResultUnit) && (sample.gender || sample.age) && ' | '}
                              {(sample.TestResult || sample.TestResultUnit) && (
                                <>
                                  {sample.TestResult ?? ''} {sample.TestResultUnit ?? ''}
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          {sample.quantity || 0} × {sample.volume || 0}{sample.volumeUnit || ''}
                        </td>


                        <td style={{ textAlign: "right" }}>
                          {sample.price
                            ? `${Number(sample.price).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                            : "-"}
                        </td>

                        {/* <td style={{ textAlign: "right" }}>
                                      {sample.totalpayment
                                        ? `${Number(sample.totalpayment).toLocaleString("en-US", {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2
                                        })}`
                                        : "-"}
                                    </td> */}



                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light">
                    <tr>
                      <td colSpan="2" className="text-end fw-bold">
                        Sub Total ({selectedUserSamples[0]?.SamplePriceCurrency || ""})
                      </td>
                      <td
                        className="fw-bold text-success"
                        style={{ textAlign: "right" }}
                      >
                        {selectedUserSamples[0].subtotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    {/* tax */}
                    <tr>
                      <td colSpan="2" className="text-end fw-bold">
                        Tax (
                        {selectedUserSamples[0].tax_value.toString().replace(/\.00$/, "")}
                        {selectedUserSamples[0]?.tax_type === "percent" ? "%" : ""}
                        )
                      </td>
                      <td
                        className="fw-bold text-success"
                        style={{ textAlign: "right" }}
                      >
                        {selectedUserSamples[0].tax_type === "percent"
                          ? (selectedUserSamples[0].subtotal *
                            selectedUserSamples[0].tax_value) /
                          100
                          : Number(selectedUserSamples[0].tax_value).toLocaleString()}
                      </td>
                    </tr>

                    {/* Paltform charges */}
                    <tr>
                      <td colSpan="2" className="text-end fw-bold">
                        Platform Charges ({selectedUserSamples[0].platform_value.toString().replace(/\.00$/, "")}{selectedUserSamples[0]?.platform_type === "percent" ? "%" : ""})
                      </td>
                      <td
                        className="fw-bold text-success"
                        style={{ textAlign: "right" }}
                      >
                        {selectedUserSamples[0].platform_type === "percent"
                          ? (selectedUserSamples[0].subtotal *
                            selectedUserSamples[0].platform_value) /
                          100
                          : Number(selectedUserSamples[0].platform_value).toLocaleString()}
                      </td>
                    </tr>
                    {/* freight charges */}
                    <tr>
                      <td colSpan="2" className="text-end fw-bold">
                        Freight Charges ({selectedUserSamples[0].freight_value.toString().replace(/\.00$/, "")}{selectedUserSamples[0]?.freight_type === "percent" ? "%" : ""})
                      </td>
                      <td
                        className="fw-bold text-success"
                        style={{ textAlign: "right" }}
                      >
                        {selectedUserSamples[0].freight_type === "percent"
                          ? (selectedUserSamples[0].subtotal *
                            selectedUserSamples[0].freight_value) /
                          100
                          : Number(selectedUserSamples[0].freight_value).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan="2" className="text-end fw-bold">
                        Total ({selectedUserSamples[0]?.SamplePriceCurrency || ""})
                      </td>
                      <td
                        className="fw-bold text-success"
                        style={{ textAlign: "right" }}
                      >
                        {selectedUserSamples[0].totalpayment.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>

                </table>
              </div>

            </Modal.Body>
          </Modal>
        )}

        {/* ✅ Confirm Order Modal */}
        {showConfirmModal && (
          <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content p-3 rounded-3 shadow-lg border-0">
                <div className="modal-header border-0">
                  <h5 className="modal-title fw-bold text-dark">Confirm Order</h5>
                  <button className="btn-close" style={{ filter: "invert(0.5)" }} onClick={() => setShowConfirmModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mt-3">
                    <label className="form-label fw-semibold">Dispatch Date</label>
                    <input type="date" className="form-control border rounded-2 shadow-sm"
                      name="DeliveryDate" value={deliveryDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleInputChange} />
                  </div>
                  <div className="mt-3">
                    <label className="form-label fw-semibold">Dispatch Time</label>
                    <input type="time" className="form-control border rounded-2 shadow-sm"
                      name="DeliveryTime" value={deliveryTime}
                      onChange={handleInputChange} />
                  </div>
                  <div className="mt-3">
                    <label className="form-label fw-semibold">Upload Receipt (Optional)</label>
                    <input type="file" className="form-control border rounded-2 shadow-sm"
                      onChange={(e) => setDispatchSlip(e.target.files[0])} />
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    className="btn px-4 py-2 text-white fw-semibold"
                    style={{
                      backgroundColor: isSubmitting ? "#6c757d" : "#28a745",
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

export default DispatchSampleArea;

