import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { Modal, Button, Form } from "react-bootstrap";
import { notifyError, notifySuccess } from "@utils/toast";

const OrderRejectedPage = () => {
  const [orders, setOrders] = useState([]); // Filtered orders
  const [currentPage, setCurrentPage] = useState(1);
  const [showSampleModal, setSampleShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionType, setActionType] = useState("");
  const [user_id, setUserID] = useState(null);
  const [selectedApprovalType, setSelectedApprovalType] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedComments, setSelectedComments] = useState("");
  const ordersPerPage = 10;
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferredOrders, setTransferredOrders] = useState(() => {
    const saved = localStorage.getItem("transferredOrders");
    return saved ? JSON.parse(saved) : [];
  });

  const [comment, setComment] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState([]); // array of comment objects

  const [totalPages, setTotalPages] = useState(1);
  const [filtertotal, setfiltertotal] = useState(null);
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [allOrdersRaw, setAllOrdersRaw] = useState([]);
  // New state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const handleCloseModal = () => {
    setSelectedOrderId(null);
    setShowModal(false);
  };

  useEffect(() => {
    const storedUserID = sessionStorage.getItem("userID");
    //  localStorage.removeItem("transferredOrders")
    if (storedUserID) {
      setUserID(storedUserID);

    }
  }, []);
  useEffect(() => {
    fetchOrders(currentPage, ordersPerPage);
  }, [currentPage]);
  useEffect(() => {
    if (!searchField || !searchValue) {
      setOrders(allOrdersRaw);
      return;
    }

    const filteredGroups = allOrdersRaw.filter((group) => {
      const fieldValue = (group[searchField] || "").toString().toLowerCase();
      return fieldValue.includes(searchValue);
    });

    setOrders(filteredGroups);
  }, [allOrdersRaw, searchField, searchValue]);


  const fetchOrders = async (page, pageSize, filters = {}) => {
    setLoading(true);
    try {
      const { searchField, searchValue } = filters;
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrder?page=${page}&pageSize=${pageSize}&status=Accepted`;

      if (searchField && searchValue) {
        url += `&searchField=${searchField}&searchValue=${encodeURIComponent(searchValue)}`;
      }

      const response = await axios.get(url);
      const { data, totalCount } = response.data;
      const grouped = {};
      data.forEach((order) => {
        if (!grouped[order.tracking_id]) {
          grouped[order.tracking_id] = { ...order, analytes: [] };
        }
        grouped[order.tracking_id].analytes.push({
          analyte: order.Analyte,
          quantity: order.quantity,
          id: order.sample_id,
          ...order,
        });
      });

      const groupedOrders = Object.values(grouped);

      setOrders(groupedOrders);
      setAllOrdersRaw(groupedOrders);
      setTotalPages(Math.ceil(totalCount / pageSize));

      return groupedOrders;
    } catch (err) {
      console.error("Fetch orders error:", err);
      notifyError("Failed to fetch orders");
      return [];
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Adjust down if needed
    }
  }, [totalPages, currentPage]);

  const currentOrders = orders || [];

  const handleFilterChange = (field, value) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchField(field);
    setSearchValue(trimmedValue);
    setCurrentPage(1); // Reset to page 1 — this triggers fetch in useEffect
  };
  const handlePageChange = (event) => {
    const selectedPage = event.selected + 1; // React Paginate is 0-indexed, so we adjust
    setCurrentPage(selectedPage); // This will trigger the data change based on selected page
  };


  const closeModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };




  useEffect(() => {
    if (showSampleModal || showCommentsModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showSampleModal, showCommentsModal]);

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        {successMessage && (
          <div className="alert alert-success w-100 text-start mb-2 small">
            {successMessage}
          </div>
        )}

        <div className="row justify-content-center">
          <h4 className="tp-8 fw-bold text-success text-center pb-2">
            Review Done List
          </h4>

          {/* Table */}
          <div className="table-responsive" style={{ overflowX: "auto", maxWidth: "100%" }}>
            <table className="table table-bordered table-hover text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    { label: "Order ID", field: "tracking_id" },
                    {
                      label: "Order Date",
                      field: "created_at"
                    },
                    { label: "Client Name", field: "researcher_name" },
                    { label: "Client Email", field: "user_email" },

                    {
                      label: "Organization Name",
                      field: "organization_name",
                    },
                    {
                      label: "Order status",
                      field: "order_status",
                    },


                  ].map(({ label, field }, index) => (
                    <th
                      key={index}
                      className="px-1 py-1"
                      style={{
                        fontSize: "12px",
                        maxWidth: "230px",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      }}
                    >
                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                          placeholder={`Search ${label}`}
                          onChange={(e) => handleFilterChange(field, e.target.value)}
                          style={{ width: "100%" }}
                        />
                        <span
                          className="fw-bold mt-1 d-block fs-6 text-center"
                          style={{ wordWrap: "break-word", whiteSpace: "normal" }}
                        >
                          {label}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th
                    className="px-1 py-1"
                    style={{
                      fontSize: "12px",
                      maxWidth: "100px",
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="table-light">
                {currentOrders.length > 0 ? (
                  currentOrders.map((orderGroup) => (
                    <tr key={orderGroup.tracking_id}>
                      <td>{orderGroup.tracking_id}</td>
                      <td>{new Date(orderGroup.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit'
                      }).replace(/ /g, '-')}</td>
                      <td>{orderGroup.researcher_name}</td>
                      <td>{orderGroup.user_email}</td>
                      <td>{orderGroup.organization_name}</td>
                      <td>
                        <span className={`badge text-uppercase fw-semibold text-dark fs-6
                          ${orderGroup.order_status === 'Pending' ? 'bg-warning text-dark' : ''}
                          ${orderGroup.order_status === 'Accepted' ? 'bg-success' : ''}
                          ${orderGroup.order_status === 'Shipped' ? 'bg-primary' : ''}
                          ${orderGroup.order_status === 'Dispatch' ? 'bg-secondary' : ''}
                          ${orderGroup.order_status === 'Completed' ? 'bg-success' : ''}
                        `}>
                          {orderGroup.order_status}
                        </span>
                      </td>



                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          <span
                            className="text-primary"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedOrder(orderGroup);
                              setShowOrderModal(true);
                            }}
                          >
                            View Details
                          </span>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedHistory({
                                Technicaladmindate: orderGroup.Technicaladmindate,
                                committeeDocs: orderGroup.committee_documents || "No documents",
                                transferDate: orderGroup.committee_transfer_date || "N/A",
                                status: orderGroup.committee_status || "N/A",
                                statusChangeDate: orderGroup.committee_status_change_date || "N/A",
                              });
                              setShowHistoryModal(true);
                            }}
                          >
                            History
                          </Button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center p-2">
                      No researchers available
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage - 1}
            />
          )}

          {/* Order Detail  */}
          {selectedOrder && (
            <Modal show={showOrderModal} onHide={closeModal} size="lg" centered>
              <Modal.Header closeButton>
                <Modal.Title>Order Details</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                {/* 📦 Status + Actions Section */}
                <div className="p-4 rounded-3 shadow-sm bg-white border border-light mb-4">
                  <div className="d-flex flex-wrap align-items-center justify-content-between">

                    {/* 🟢 Technical Admin Status */}
                    <div className="d-flex align-items-center mb-2 mb-md-0">
                      <span className="fw-semibold text-secondary me-2 fs-5">
                        <i className="bi bi-person-check-fill text-success me-1"></i> Technical Admin Status:
                      </span>
                      <span
                        className={`badge px-3 py-2 fs-5 rounded-pill ${selectedOrder.analytes?.every(item => item.technical_admin_status === "Accepted")
                          ? "bg-success-subtle text-success"
                          : "bg-warning-subtle text-danger"
                          }`}
                      >
                        {selectedOrder.analytes?.every(item => item.technical_admin_status === "Accepted")
                          ? "✅ Accepted"
                          : " Pending"}
                      </span>
                    </div>

                    {/* 🎯 Action Buttons */}
                    <div className="d-flex flex-wrap gap-2">
                      {/* Review Comments */}
                      <Button
                        variant="primary"
                        size="sm"
                        className="fw-semibold shadow-sm"
                        onClick={() => {
                          const reviews = [];

                          selectedOrder.analytes.forEach(item => {
                            if (item.committee_comments && item.committee_comments.trim() !== "") {
                              // If Scientific committee exists, add it
                              if (item.scientific_committee_status) {
                                reviews.push({
                                  member: item.committee_member_name || 'N/A',
                                  committee: 'Scientific',
                                  comment: item.committee_comments,
                                  status: item.scientific_committee_status
                                });
                              }
                              // If Ethical committee exists, add it separately
                              if (item.ethical_committee_status) {
                                reviews.push({
                                  member: item.committee_member_name || 'N/A',
                                  committee: 'Ethical',
                                  comment: item.committee_comments,
                                  status: item.ethical_committee_status
                                });
                              }
                            }
                          });
                          setReviewData(reviews);
                          setShowReviewModal(true);
                        }}
                      >
                        💬 Review Comments
                      </Button>

                    </div>
                  </div>
                </div>
                {/* Analytes Table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Analyte</th>
                        <th>Quantity X Volume</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Test Result & Unit</th>

                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.analytes?.map((order, index) => (
                        <tr key={order.order_id || index}>
                          <td className="text-primary fw-semibold" style={{ cursor: "pointer" }} onClick={() => {
                            setSelectedSample(order);
                            setSampleShowModal(true);
                          }}>
                            <span style={{ textDecoration: "underline" }}>
                              {order.Analyte || "N/A"}
                            </span>

                            <div className="text-muted small" style={{ textDecoration: "none", cursor: "default" }}>

                            </div>
                          </td>

                          <td>{order.quantity} X {order.volume}{order.VolumeUnit}</td>
                          <td>{order.age ? `${order.age} year` : "---"}</td>

                          <td>{order.gender || "---"}</td>
                          <td>
                            {(order.TestResult || order.TestResultUnit) && (
                              <>
                                {order.TestResult ?? ''} {order.TestResultUnit ?? ''}
                              </>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Modal.Body>
            </Modal>
          )}
          <Modal
            show={showHistoryModal}
            onHide={() => setShowHistoryModal(false)}
            centered
            size="md"
          >
            <Modal.Header closeButton>
              <Modal.Title>Order History</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedHistory ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>Order Date</th>
                        <td>{new Date(selectedHistory.Technicaladmindate).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <th>Committee Member Documents</th>
                        <td>
                          {selectedHistory.committeeDocs !== "No documents" ? (
                            <a
                              href={selectedHistory.committeeDocs}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Document
                            </a>
                          ) : (
                            "No documents"
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th>Committee Member Transfer Date</th>
                        <td>{selectedHistory.transferDate}</td>
                      </tr>
                      <tr>
                        <th>Committee Member Status</th>
                        <td>{selectedHistory.status}</td>
                      </tr>
                      <tr>
                        <th>Status Change Date & Time</th>
                        <td>{selectedHistory.statusChangeDate}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No history available.</p>
              )}
            </Modal.Body>
          </Modal>


          {/* Reviw comments */}
          <Modal
            show={showReviewModal}
            onHide={() => setShowReviewModal(false)}
            centered
            size="md"
          >
            <Modal.Header closeButton>
              <Modal.Title style={{ fontWeight: "600", fontSize: "1.25rem" }}>
                Review Comment Status
              </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
              {reviewData.length > 0 ? (
                reviewData
                  .filter(
                    (item, index, self) =>
                      index ===
                      self.findIndex(
                        (t) =>
                          t.member === item.member &&
                          t.status === item.status &&
                          t.comment === item.comment &&
                          t.committee === item.committee
                      )
                  )
                  .map((r, i) => {
                    let committeeComment = null,
                      committeeName = "";

                    if (r.comment) {
                      const parts = r.comment.split(" | ");

                      for (const part of parts) {
                        const [leftPart, rightPart] = part.split(":");

                        let committeeType = "";
                        if (leftPart && leftPart.includes("(")) {
                          const nameStart = leftPart.indexOf("(");
                          committeeType = leftPart
                            .slice(nameStart + 1, leftPart.indexOf(")"))
                            .trim();
                          committeeName = leftPart.slice(0, nameStart).trim();
                        }

                        if (
                          committeeType.toLowerCase() ===
                          r.committee.toLowerCase()
                        ) {
                          committeeComment = rightPart ? rightPart.trim() : "";
                          break;
                        }
                      }
                    }

                    return (
                      <div
                        key={i}
                        style={{
                          marginBottom: "1.8rem",
                          borderBottom: "1px solid #e0e0e0",
                          paddingBottom: "1rem",
                        }}
                      >
                        <p
                          style={{
                            marginBottom: "0.3rem",
                            color: "#444",
                            fontWeight: "600",
                            fontSize: "1.05rem",
                          }}
                        >
                          Committee Member Name: {committeeName || "Committee Member"}
                        </p>
                        <p
                          style={{
                            marginBottom: "0.4rem",
                            color: "#777",
                            fontSize: "0.9rem",
                            fontStyle: "italic",
                          }}
                        >
                          Committee Member Type:   {r.committee}
                        </p>
                        <p
                          style={{
                            marginBottom: "0.6rem",
                            fontWeight: "600",
                            color:
                              r.status.toLowerCase() === "approved"
                                ? "#2e7d32"
                                : r.status.toLowerCase() === "refused"
                                  ? "#c62828"
                                  : "#555",
                            fontSize: "0.95rem",
                          }}
                        >
                          Status:  {r.status}
                        </p>
                        <p
                          style={{
                            color: "#333",
                            lineHeight: "1.4",
                            fontSize: "0.95rem",
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          Committee Member Comments: {committeeComment || <span style={{ color: "#999", fontStyle: "italic" }}>No comment</span>}
                        </p>
                      </div>
                    );
                  })
              ) : (
                <p
                  style={{
                    color: "#999",
                    textAlign: "center",
                    fontStyle: "italic",
                    marginTop: "1rem",
                    fontSize: "1rem",
                  }}
                >
                  No committee data available.
                </p>
              )}
            </Modal.Body>
          </Modal>


          {showCommentsModal && (
            <>
              {/* Backdrop */}
              <div
                className="modal-backdrop fade show"
                style={{
                  backdropFilter: "blur(5px)",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%", // Changed from 80% to full height
                  zIndex: 1040,
                }}
              ></div>

              {/* Modal Content */}
              <div
                className="modal show d-block"
                role="dialog"
                style={{
                  zIndex: 1060,
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  width: "90vw",
                  maxWidth: "700px",
                  maxHeight: "90vh", // Limit modal height
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div className="modal-header d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold">Committee Member Comments</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setShowCommentsModal(false)}
                    style={{
                      fontSize: "1.5rem",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                </div>

                <div
                  className="modal-body"
                  style={{
                    overflowY: "auto",
                    flexGrow: 1,
                    paddingRight: "5px",
                  }}
                >
                  {selectedComments ? (
                    selectedComments.split(" | ").map((comment, idx) => {
                      const [name, text] = comment.split(" : ");
                      return (
                        <div
                          key={idx}
                          className="p-3 mb-3 rounded"
                          style={{
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #dee2e6",
                          }}
                        >
                          <p
                            className="mb-1"
                            style={{ color: "#0d6efd", fontWeight: "600" }}
                          >
                            Name: {name?.trim()}
                          </p>
                          <p className="mb-0" style={{ color: "#343a40" }}>
                            <strong>Comments:</strong> {text?.trim()}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted fst-italic">No comments available</p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Sample details Modal */}
          {showSampleModal && selectedSample && (
            <>
              {/* Backdrop */}
              <div
                className="modal-backdrop fade show"
                style={{
                  backdropFilter: "blur(5px)",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 1040,
                }}
              ></div>

              {/* Modal Container */}
              <div
                className="modal show d-block"
                role="dialog"
                style={{
                  zIndex: 1060,
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  width: "90vw",
                  maxWidth: "700px",
                  maxHeight: "80vh",
                  overflow: "auto",
                }}
              >
                {/* Modal Header */}
                <div
                  className="modal-header d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "#cfe2ff", color: "#000" }}
                >
                  <h5 className="fw-bold">{selectedSample.Analyte} Details:</h5>
                  <button
                    type="button"
                    className="close"
                    onClick={() => setSampleShowModal(false)}
                    style={{
                      fontSize: "1.5rem",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                </div>

                {/* Modal Body */}
                <div className="modal-body" style={{ maxHeight: "90vh" }}>
                  <div className="row">
                    {/* Left Side: Image & Basic Details */}
                    <div className="col-md-5 text-center">
                      <div className="mt-3 p-2 bg-light rounded text-start">
                        {selectedSample.quantity != null && (
                          <p>
                            <strong>Order Quantity:</strong> {selectedSample.quantity}
                          </p>
                        )}

                        {(selectedSample.volume || selectedSample.Volumeunit) && (
                          <p>
                            <strong>Volume:</strong>{" "}
                            {selectedSample.volume} {selectedSample.Volumeunit}
                          </p>
                        )}

                        {(selectedSample.age != null || selectedSample.gender) && (
                          <p>
                            {selectedSample.age != null && (
                              <>
                                <strong>Age:</strong> {selectedSample.age} years{" "}
                                {selectedSample.gender && "| "}
                              </>
                            )}
                            {selectedSample.gender && (
                              <>
                                <strong>Gender:</strong> {selectedSample.gender}
                              </>
                            )}
                          </p>
                        )}

                        {selectedSample.ethnicity && (
                          <p>
                            <strong>Ethnicity:</strong> {selectedSample.ethnicity}
                          </p>
                        )}

                        {selectedSample.CountryofCollection && (
                          <p>
                            <strong>Country of Collection:</strong>{" "}
                            {selectedSample.CountryofCollection}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Detailed Information */}
                    <div className="col-md-7">
                      {selectedSample.storagetemp && (
                        <p>
                          <strong>Storage Temperature:</strong> {selectedSample.storagetemp}
                        </p>
                      )}

                      {selectedSample.SampleTypeMatrix && (
                        <p>
                          <strong>Sample Type:</strong> {selectedSample.SampleTypeMatrix}
                        </p>
                      )}

                      {(selectedSample.TestResult || selectedSample.TestResultUnit) && (
                        <p>
                          <strong>Test Result:</strong> {selectedSample.TestResult}{" "}
                          {selectedSample.TestResultUnit}
                        </p>
                      )}

                      {selectedSample.TestMethod && (
                        <p>
                          <strong>Test Method:</strong> {selectedSample.TestMethod}
                        </p>
                      )}

                      {selectedSample.TestKitManufacturer && (
                        <p>
                          <strong>Test Kit Manufacturer:</strong>{" "}
                          {selectedSample.TestKitManufacturer}
                        </p>
                      )}

                      {selectedSample.ConcurrentMedicalConditions && (
                        <p>
                          <strong>Concurrent Medical Conditions:</strong>{" "}
                          {selectedSample.ConcurrentMedicalConditions}
                        </p>
                      )}

                      {selectedSample.InfectiousDiseaseTesting && (
                        <p>
                          <strong>Infectious Disease Testing:</strong>{" "}
                          {selectedSample.InfectiousDiseaseTesting}
                        </p>
                      )}

                      {selectedSample.InfectiousDiseaseResult && (
                        <p>
                          <strong>Infectious Disease Result:</strong>{" "}
                          {selectedSample.InfectiousDiseaseResult}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </section>
  );
};

export default OrderRejectedPage;
