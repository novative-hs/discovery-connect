import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { Modal, Button, Form, Table } from "react-bootstrap";
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

  const fetchDocuments = async (tracking_id) => {
    setDocumentLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getsampledocuments/${tracking_id}`
      );

      if (response.data.success) {
        const rows = response.data.documents || [];
        console.log(rows)
        // Group by document type and pick the latest version
        const latestByType = {};
        rows.forEach(row => {
          ["study_copy", "irb_file", "nbc_file"].forEach(docType => {
            if (row[docType]) {
              const current = latestByType[docType];
              const currentDate = current ? new Date(current.updated_at || current.created_at) : null;
              const newDate = new Date(row.updated_at || row.created_at);

              if (!current || newDate > currentDate) {
                latestByType[docType] = row;
              }
            }
          });
        });


        const docsToShow = {};
        Object.keys(latestByType).forEach(key => {
          docsToShow[key] = latestByType[key][key];
        });
        setTrackingID(tracking_id)
        setDocuments(docsToShow);

        // Initialize selectedDocs
        const initialSelected = {};
        Object.keys(docsToShow).forEach((key) => {
          initialSelected[key] = false;
        });
        setSelectedDocs(initialSelected);
        setShowDocument(true);
      } else {
        notifyError(response.data.message || "Failed to fetch documents.");
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
      notifyError("Error fetching documents");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
    setShowModal(false);
  };


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

  const groupHistoryByTransfer = (historyData) => {
    const grouped = historyData.reduce((acc, item) => {
      const transfer = item.transfer || 1;
      if (!acc[transfer]) acc[transfer] = [];
      acc[transfer].push(item);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([transfer, items]) => ({ transfer, items }));
  };

  // Utility: Remove duplicates by key
  const uniqueByKey = (arr, keyFn) => {
    const seen = new Set();
    return arr.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const handleHistory = async (orderGroup) => {
    const trackingIds = orderGroup.analytes.map(a => a.tracking_id);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeesampleapproval/getHistory`,
        { params: { trackingIds: trackingIds.join(','), status: 'Dispatched' } }
      );

      // API se nested array aa raha hai → flatten kar do
      const rawHistory = response.data.results.flat();

      // 🔹 Remove duplicate committee records
      const dedupedHistory = uniqueByKey(rawHistory, (h) => `${h.committeetype}_${h.CommitteeMemberName}_${h.committee_status}_${h.committee_approval_date}`);

      // group by transfer
      const groupedHistory = groupHistoryByTransfer(dedupedHistory);

      setSelectedHistory(groupedHistory);
      setLoadingHistory(false)
    } catch (error) {
      console.error(error);
      setShowHistoryModal(false);
    }
  };

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


  const openPdfFromBase64 = (fileData) => {
    if (!fileData) {
      notifyError("No document available.");
      return;
    }

    let base64 = "";

    // Handle Buffer-like object
    if (fileData.type === "Buffer" && Array.isArray(fileData.data)) {
      const chunkSize = 0x8000; // 32k chunks
      let result = "";
      for (let i = 0; i < fileData.data.length; i += chunkSize) {
        const chunk = fileData.data.slice(i, i + chunkSize);
        result += String.fromCharCode(...chunk);
      }
      base64 = btoa(result);
    }
    // Handle string (already base64)
    else if (typeof fileData === "string") {
      base64 = fileData;
    } else {
      notifyError("Invalid file format.");
      return;
    }

    try {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      notifyError("Failed to open PDF. Invalid Base64 data.");
    }
  };


  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Convert transferNo to review label
  const getReviewLabel = (transferNo) => `${getOrdinal(Number(transferNo))} Review`;

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
            Review Pending
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
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-primary">Review History</Modal.Title>
            </Modal.Header>

            <Modal.Body
              style={{
                maxHeight: '60vh',
                overflowY: 'auto',
                padding: '1rem'
              }}
            >
              {loadingHistory ? (
                <div className="text-center py-4">
                  <span className="spinner-border text-primary" role="status"></span>
                  <p className="mt-2">Loading history...</p>
                </div>
              ) : (
                <>


                  {selectedHistory.length > 0 && selectedHistory.some(h => Array.isArray(h.items) && h.items.length > 0) ? (

                    // Flatten all items from all selectedHistory entries
                    Object.entries(
                      selectedHistory
                        .flatMap(h => h.items || [])
                        .reduce((acc, item) => {
                          const key = item.transfer ?? 'no-transfer'; // use actual transfer number
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(item);
                          return acc;
                        }, {})
                    ).map(([transferNo, histories], idx) => {
                      const firstHistory = histories[0];
                      // Get all transfer numbers and find the last one
                      const transferNumbers = Object.keys(
                        selectedHistory.flatMap(h => h.items || []).reduce((acc, item) => {
                          const key = item.transfer ?? 'no-transfer';
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(item);
                          return acc;
                        }, {})
                      );
                      const lastTransferNo = transferNumbers[transferNumbers.length - 1];

                      return (
                        <div
                          key={idx}
                          className="mb-3 p-2 rounded shadow-sm"
                          style={{
                            backgroundColor: "#f5f5f5", // light grey background
                            minHeight: "auto",          // allows height to shrink based on content
                            maxWidth: "90%",            // optional: limits width for chat look
                            lineHeight: "1.4",          // tighter spacing
                          }}
                        >
                          <h5 className="fw-bold text-primary mb-2 text-center fs-4">
                            {getReviewLabel(transferNo)}
                          </h5>

                          {/* Technical Admin */}
                          {firstHistory?.Technicaladmindate && (
                            <div className="mb-3">
                              <h6 className="fw-bold text-dark mb-1">
                                {formatDT(firstHistory.Technicaladmindate)} case Referred by Technical Admin
                              </h6>
                            </div>
                          )}

                          {/* Committee Referrals */}
                          {histories.some(h => h.committee_created_at) && (
                            <>
                              <div className="mb-3">
                                {histories.some(h => h.committee_created_at && h.committeetype) ? (
                                  histories.map((history, i) => {
                                    if (!history.committee_created_at || !history.committeetype) return null;

                                    const committeeLabel =
                                      history.committeetype === "Scientific"
                                        ? "Scientific Committee Member"
                                        : history.committeetype === "Ethical"
                                          ? "Ethical Committee Member"
                                          : `${history.committeetype} Committee Member`;

                                    return (
                                      <h6 key={i} className="fw-bold text-dark mb-1">
                                        {formatDT(history.committee_created_at)} case Referred by {committeeLabel}: {history.CommitteeMemberName}
                                      </h6>
                                    );
                                  })
                                ) : (
                                  <span className="text-muted">No Committee Referrals</span>
                                )}
                              </div>

                              {/* Committee Member Status */}
                              <div className="mb-3">
                                <h6 className="fw-bold text-dark mb-2">👥 Committee Member Status</h6>
                                {histories.map((history, i) => (
                                  history.committee_created_at ? (
                                    <div key={i} className="list-group-item d-flex flex-column align-items-start mb-2 rounded shadow-sm border">
                                      <div className="fw-bold">
                                        {history.committee_approval_date
                                          ? `${formatDT(history.committee_approval_date)} ${history.committee_status} by ${history.committeetype} - ${history.CommitteeMemberName}`
                                          : `Referred to ${history.committeetype} - ${history.CommitteeMemberName}`}
                                      </div>

                                    </div>
                                  ) : null
                                ))}
                              </div>
                            </>
                          )}

                          {/* Uploaded Documents */}
                          <div className="mb-3">
                            <h6 className="fw-bold text-dark mb-2">📂 Uploaded Documents</h6>
                            {histories.flatMap(h => h.documents || []).length > 0 ? (
                              <div className="table-responsive">
                                <table className="table table-sm table-bordered">
                                  <thead className="table-light">
                                    <tr>
                                      <th>Uploaded Date</th>
                                      <th>Role</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(() => {
                                      const allDocs = histories.flatMap(h => h.documents || []);

                                      const uniqueDocsMap = {};
                                      allDocs.forEach(doc => {
                                        const key = `${doc.uploaded_by_role}-${doc.added_by}`;
                                        if (!uniqueDocsMap[key]) uniqueDocsMap[key] = doc;
                                      });

                                      return Object.values(uniqueDocsMap).map((doc, docIdx) => (
                                        <tr key={docIdx}>
                                          <td>
                                            {doc.created_at
                                              ? formatDT(doc.created_at)
                                              : doc.updated_at
                                                ? formatDT(doc.updated_at)
                                                : "---"}
                                          </td>
                                          <td>{doc.uploaded_by_role || "Unknown"}</td>
                                          <td>
                                            {["study_copy", "irb_file", "nbc_file"].map(
                                              docKey =>
                                                doc[docKey] && (
                                                  <button
                                                    key={docKey}
                                                    className="btn btn-outline-primary btn-sm me-2 mb-1"
                                                    onClick={() => openPdfFromBase64(doc[docKey])}
                                                  >
                                                    Download {docKey.replace("_", " ").toUpperCase()}
                                                  </button>
                                                )
                                            )}
                                          </td>
                                        </tr>
                                      ));
                                    })()}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <span className="text-muted">No Documents Attached</span>
                            )}
                          </div>

                          {/* Technical Admin Approval */}
                          {/* Technical Admin Approval */}
                          {transferNo == lastTransferNo && firstHistory?.TechnicaladminApproval_date && (
                            <div>
                              <h6 className="fw-bold text-dark mb-1">
                                {formatDT(firstHistory.TechnicaladminApproval_date)} Approved by Technical Admin
                              </h6>
                            </div>
                          )}


                        </div>
                      );
                    })
                  ) : (
                    <div className="text-muted">⚠ No history available</div>
                  )}
                </>
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
