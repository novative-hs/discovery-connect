import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { Modal, Button, Form, Table } from "react-bootstrap";
import {
  FaUserTie,
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import { notifyError, notifySuccess } from "@utils/toast";

const OrderPage = () => {
  const id = sessionStorage.getItem("userID");
  const [orders, setOrders] = useState([]); // Filtered orders
  const [allOrders, setAllOrders] = useState([]); // Original full orders list
  const [currentPage, setCurrentPage] = useState(1);
  const [showSampleModal, setSampleShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDocuments, setShowDocument] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionType, setActionType] = useState("");
  const [user_id, setUserID] = useState(null);
  const [selectedApprovalType, setSelectedApprovalType] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedComments, setSelectedComments] = useState("");
  const [changeMode, setChangeMode] = useState(false); // toggle for checkbox
  const [updatedDocs, setUpdatedDocs] = useState([]); // track files to update
  const [selectedDocs, setSelectedDocs] = useState({
    study_copy: false,
    irb_file: false,
    nbc_file: false,
  });
  const [trackingID, setTrackingID] = useState(null);


  const ordersPerPage = 10;
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferredOrders, setTransferredOrders] = useState(() => {
    const saved = localStorage.getItem("transferredOrders");
    return saved ? JSON.parse(saved) : [];
  });
  // New state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState([]);


  const [comment, setComment] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState([]); // array of comment objects

  const [totalPages, setTotalPages] = useState(1);
  const [filtertotal, setfiltertotal] = useState(null);
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [allOrdersRaw, setAllOrdersRaw] = useState([]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const [documents, setDocuments] = useState({
    study_copy: false,
    irb_file: false,
    nbc_file: false,
  });
  const [show, setShow] = useState(false);
  const [documentloading, setDocumentLoading] = useState(false);

  useEffect(() => {
    const storedUserID = sessionStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);

    }
  }, []);
  // Helper function to parse statuses

  useEffect(() => {
    localStorage.removeItem("transferredOrders")
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
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/technicalapproval/getOrderbyTechnical?page=${page}&pageSize=${pageSize}&status=Accepted`;

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
      setAllOrders(groupedOrders);
      setAllOrdersRaw(groupedOrders);
      setTotalPages(Math.ceil(groupedOrders.length / pageSize));

      return groupedOrders;
    } catch (err) {
      console.error("Fetch orders error:", err);
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


  const handleHistory = useCallback(async (orderGroup) => {
    console.log(orderGroup);
    setShowHistoryModal(true);
    setLoadingHistory(true);

    try {
      const response = await axios.get(   // ✅ await here
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/technicalapproval/getHistory`,
        {
          params: {
            tracking_id: orderGroup.tracking_id,
            status: "Pending",
          },
        }
      );

      console.log(response.data.results);
      setSelectedHistory(response.data.results || []);
    } catch (error) {
      console.error(error);
      setShowHistoryModal(false);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  const formatDT = (date) =>
    date
      ? new Date(date).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "2-digit",   // <- 2-digit year
        hour: "numeric", minute: "2-digit", second: "2-digit",
        hour12: true,
      }).replace("AM", "am").replace("PM", "pm")
      : "";

  useEffect(() => {
    if (showSampleModal || showTransferModal || showCommentsModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showSampleModal, showTransferModal, showCommentsModal]);

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
            Review Done
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
                      label: "Scientific",
                      field: "committee_status",
                    },
                    {
                      label: "Ethical",
                      field: "committee_status",
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
                        <div>
                          <span className="fw-bold">
                            {orderGroup.scientific_committee_status || "---"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className="fw-bold">
                            {orderGroup.ethical_committee_status || "---"}
                          </span>
                        </div>
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
                            onClick={() => handleHistory(orderGroup)}
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
                          : selectedOrder.analytes?.some(item => item.technical_admin_status === "Pending")
                            ? "bg-warning-subtle text-warning"
                            : "bg-danger-subtle text-danger"
                          }`}
                      >
                        {selectedOrder.analytes?.every(item => item.technical_admin_status === "Accepted")
                          ? "Accepted"
                          : selectedOrder.analytes?.some(item => item.technical_admin_status === "Pending")
                            ? "Pending"
                            : "Rejected"}
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

                      {/* Accept */}

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




          {/* Pagination Controls */}
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage - 1}
            />
          )}

          {/* Comments */}
          <Modal
            show={showReviewModal}
            onHide={() => setShowReviewModal(false)}
            centered
            size="md"
            scrollable
          >
            <Modal.Header closeButton>
              <Modal.Title style={{ fontWeight: "600", fontSize: "1.25rem" }}>
                Review Comment Status
              </Modal.Title>
            </Modal.Header>

            <Modal.Body
              style={{
                fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {reviewData.length > 0 ? (
                (() => {
                  // Get the first non-empty comment field
                  const commentString = reviewData.find(r => r.comment)?.comment || "";
                  const parts = commentString.split(" | "); // each committee entry

                  return parts.map((part, idx) => {
                    let committeeName = "";
                    let committeeType = "";
                    let committeeComment = "";
                    let committeeStatus = "";

                    const [leftPart, rest] = part.split(":");
                    if (leftPart && leftPart.includes("(")) {
                      const nameStart = leftPart.indexOf("(");
                      committeeType = leftPart.slice(nameStart + 1, leftPart.indexOf(")")).trim();
                      committeeName = leftPart.slice(0, nameStart).trim();
                    }

                    if (rest) {
                      const statusMatch = rest.match(/\[(.*?)\]$/);
                      if (statusMatch) {
                        committeeStatus = statusMatch[1].trim();
                        committeeComment = rest.replace(/\[.*?\]$/, "").trim();
                      } else {
                        committeeComment = rest.trim();
                      }
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          marginBottom: "1.8rem",
                          borderBottom: "1px solid #e0e0e0",
                          paddingBottom: "1rem",
                        }}
                      >
                        <p style={{ marginBottom: "0.3rem", color: "#444", fontWeight: "600", fontSize: "1.05rem" }}>
                          Committee Member Name: {committeeName || "-----"}
                        </p>
                        <p style={{ marginBottom: "0.4rem", color: "#777", fontSize: "0.9rem", fontStyle: "italic" }}>
                          Committee Member Type: {committeeType || "----"}
                        </p>
                        <p
                          style={{
                            marginBottom: "0.6rem",
                            fontWeight: "600",
                            color:
                              committeeStatus.toLowerCase() === "approved"
                                ? "#2e7d32"
                                : committeeStatus.toLowerCase() === "refused"
                                  ? "#c62828"
                                  : "#555",
                            fontSize: "0.95rem",
                          }}
                        >
                          Status: {committeeStatus || "---"}
                        </p>
                        <p style={{ color: "#333", lineHeight: "1.4", fontSize: "0.95rem", whiteSpace: "pre-wrap" }}>
                          Committee Member Comments:{" "}
                          {committeeComment || <span style={{ color: "#999", fontStyle: "italic" }}>No comment</span>}
                        </p>
                      </div>
                    );
                  });
                })()
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

          {/* History */}
          <Modal
            show={showHistoryModal}
            onHide={() => setShowHistoryModal(false)}
            centered
            size="lg"
            scrollable
          >
            {/* Header */}
            <Modal.Header
              closeButton
              style={{
                background: "linear-gradient(135deg, #2563eb, #1e40af)",
                color: "#fff",
                borderBottom: "none",
                padding: "1.2rem",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px",
              }}
            >
              <Modal.Title style={{ fontWeight: "700", fontSize: "1.6rem" }}>
                Review History
              </Modal.Title>
            </Modal.Header>

            {/* Body */}
            <Modal.Body
              style={{
                maxHeight: "70vh",
                overflowY: "auto",
                padding: "2rem",
                backgroundColor: "#f9fafb",
                borderBottomLeftRadius: "10px",
                borderBottomRightRadius: "10px",
              }}
            >
              {loadingHistory ? (
                <div className="text-center py-5">
                  <span
                    className="spinner-border text-primary"
                    style={{ width: "3rem", height: "3rem" }}
                    role="status"
                  ></span>
                  <p className="mt-3 fs-5">Loading history...</p>
                </div>
              ) : Array.isArray(selectedHistory) && selectedHistory.length > 0 ? (
                selectedHistory.map((history, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "#ffffff",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
                      marginBottom: "2rem",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <h5
                      style={{
                        color: "#2563eb",
                        fontWeight: "700",
                        textAlign: "center",
                        marginBottom: "1.5rem",
                        fontSize: "1.25rem",
                      }}
                    >
                      Review Timeline
                    </h5>

                    {/* Timeline wrapper */}
                    <div
                      style={{
                        position: "relative",
                        marginLeft: "1.5rem",
                        paddingLeft: "1rem",
                        borderLeft: "2px solid #e5e7eb",
                      }}
                    >
                      {/* Technical Admin referred */}
                      {(history.technicalAdminHistory || []).map(
                        (ta, taIdx) =>
                          ta.Technicaladmindate && (
                            <div
                              key={`ta-ref-${taIdx}`}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                marginBottom: "1.5rem",
                              }}
                            >
                              {/* Icon */}
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginLeft: "-2.2rem",
                                  marginRight: "0.8rem",
                                  backgroundColor: "#0d6efd",
                                  boxShadow: "0 3px 6px rgba(0, 0, 0, 0.15)",
                                }}
                              >
                                <FaUserTie color="white" />
                              </div>

                              {/* Content */}
                              <div
                                style={{
                                  background: "#ffffff",
                                  padding: "1rem 1.2rem",
                                  borderRadius: "10px",
                                  border: "1px solid #e2e8f0",
                                  width: "100%",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#6b7280",
                                    marginBottom: "0.35rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  {formatDT(ta.Technicaladmindate)}
                                </div>
                                <div
                                  style={{ fontSize: "0.95rem", color: "#1f2937" }}
                                >
                                  <strong>Order referred</strong> to Technical Admin
                                </div>
                              </div>
                            </div>
                          )
                      )}

                      {/* Committee Approvals */}
                      {Array.isArray(history.approvals) &&
                        history.approvals.map((approval, i) => (
                          <div
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              marginBottom: "1.5rem",
                            }}
                          >
                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: "-2.2rem",
                                marginRight: "0.8rem",
                                backgroundColor:
                                  approval.committee_status === "Refused"
                                    ? "#dc3545"
                                    : "#198754",
                                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.15)",
                              }}
                            >
                              <FaUsers color="white" />
                            </div>

                            <div
                              style={{
                                background: "#ffffff",
                                padding: "1rem 1.2rem",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                width: "100%",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#6b7280",
                                  marginBottom: "0.35rem",
                                  fontWeight: "500",
                                }}
                              >
                                {approval.committee_created_at
                                  ? formatDT(approval.committee_created_at)
                                  : formatDT(approval.committee_approval_date)}
                              </div>
                              <div style={{ fontSize: "0.95rem", color: "#1f2937" }}>
                                <strong>
                                  {approval.committeetype} Committee –{" "}
                                  {approval.CommitteeMemberName}
                                </strong>
                                <br />
                                {approval.committee_created_at && (
                                  <span>
                                    <FaClock
                                      style={{
                                        marginRight: "5px",
                                        color: "#6c757d",
                                      }}
                                    />
                                    Order referred to committee
                                  </span>
                                )}
                                {approval.committee_approval_date && (
                                  <span>
                                    {approval.committee_status === "Refused" ? (
                                      <>
                                        <FaTimesCircle
                                          style={{
                                            marginRight: "5px",
                                            color: "#dc3545",
                                          }}
                                        />
                                        Order refused
                                      </>
                                    ) : (
                                      <>
                                        <FaCheckCircle
                                          style={{
                                            marginRight: "5px",
                                            color: "#198754",
                                          }}
                                        />
                                        Order approved
                                      </>
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Uploaded Documents */}
                      {Array.isArray(history.documents) &&
                        history.documents.map((doc, dIdx) => (
                          <div
                            key={dIdx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              marginBottom: "1.5rem",
                            }}
                          >
                            <div
                              style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginLeft: "-2.2rem",
                                marginRight: "0.8rem",
                                backgroundColor: "#0dcaf0",
                                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.15)",
                              }}
                            >
                              <FaFileAlt color="white" />
                            </div>
                            <div
                              style={{
                                background: "#ffffff",
                                padding: "1rem 1.2rem",
                                borderRadius: "10px",
                                border: "1px solid #e2e8f0",
                                width: "100%",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#6b7280",
                                  marginBottom: "0.35rem",
                                  fontWeight: "500",
                                }}
                              >
                                {formatDT(doc.created_at)}
                              </div>
                              <div style={{ fontSize: "0.95rem", color: "#1f2937" }}>
                                <strong>{doc.uploaded_by_role}</strong> uploaded:{" "}
                                <em>
                                  {Array.isArray(doc.files)
                                    ? doc.files.join(", ")
                                    : ""}
                                </em>
                              </div>
                            </div>
                          </div>
                        ))}

                      {/* Technical Admin approval */}
                      {(history.technicalAdminHistory || []).map(
                        (ta, taIdx) =>
                          ta.TechnicaladminApproval_date && (
                            <div
                              key={`ta-appr-${taIdx}`}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                marginBottom: "1.5rem",
                              }}
                            >
                              <div
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginLeft: "-2.2rem",
                                  marginRight: "0.8rem",
                                  backgroundColor:
                                    ta.technical_admin_status === "Approved"
                                      ? "#198754"
                                      : "#dc3545",
                                  boxShadow: "0 3px 6px rgba(0, 0, 0, 0.15)",
                                }}
                              >
                                <FaUserTie color="white" />
                              </div>

                              <div
                                style={{
                                  background: "#ffffff",
                                  padding: "1rem 1.2rem",
                                  borderRadius: "10px",
                                  border: "1px solid #e2e8f0",
                                  width: "100%",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#6b7280",
                                    marginBottom: "0.35rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  {formatDT(ta.TechnicaladminApproval_date)}
                                </div>
                                <div style={{ fontSize: "0.95rem", color: "#1f2937" }}>
                                  Order{" "}
                                  <b>{ta.technical_admin_status.toLowerCase()}</b> by
                                  Technical Admin
                                </div>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "#6c757d", textAlign: "center" }}>
                  ⚠ No history available
                </div>
              )}
            </Modal.Body>
          </Modal>


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
    </section >
  );
};

export default OrderPage;

