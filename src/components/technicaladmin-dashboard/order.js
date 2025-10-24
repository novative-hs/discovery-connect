import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload
} from "@fortawesome/free-solid-svg-icons";
import {
  FaUserTie,
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";
import { notifyError, notifySuccess } from "@utils/toast";
import DetailModal from "src/pages/DetailModal";
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
  const [filters, setFilters] = useState({});


  const ordersPerPage = 10;
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferredOrders, setTransferredOrders] = useState(() => {
    const saved = localStorage.getItem("transferredOrders");
    return saved ? JSON.parse(saved) : [];
  });
  const isScientificApproved = selectedOrder?.scientific_committee_status === "Approved";
  const isEthicalApproved = selectedOrder?.ethical_committee_status === "Approved";

  const shouldShowTransferButton = !(
    (isScientificApproved || selectedOrder?.scientific_committee_status === null) &&
    (isEthicalApproved || selectedOrder?.ethical_committee_status === null)
  );
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


  const resetFilters = () => {
    setFilters({});
    setSearchField(null);
    setSearchValue(null);
    setCurrentPage(1);
    fetchOrders(1, ordersPerPage);
  };

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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/technicalapproval/getDocuments/${tracking_id}`
      );

      if (response.data.success) {
        const rows = response.data.documents || [];

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
    if (!filters || Object.keys(filters).length === 0) {
      setOrders(allOrdersRaw);
      return;
    }

    const filteredGroups = allOrdersRaw.filter((group) => {
      return Object.entries(filters).every(([field, value]) => {
        if (!value.trim()) return true; // ✅ 
        const fieldValue = (group[field] || "").toString().toLowerCase();
        return fieldValue.includes(value.toLowerCase());
      });
    });

    setOrders(filteredGroups);
  }, [allOrdersRaw, filters]);


  const fetchOrders = async (page, pageSize, filters = {}) => {
    setLoading(true);
    try {
      const { searchField, searchValue } = filters;
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/technicalapproval/getOrderbyTechnical?page=${page}&pageSize=${pageSize}&status=Pending`;

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
    setFilters((prev) => ({
      ...prev,
      [field]: value // ✅ Original value maintain karein
    }));
    setCurrentPage(1);
  };
  const handlePageChange = (event) => {
    const selectedPage = event.selected + 1; // React Paginate is 0-indexed, so we adjust
    setCurrentPage(selectedPage); // This will trigger the data change based on selected page
  };


  const handleAdminStatus = async (newStatus) => {
    if (!selectedOrder) return;
    // Trim and validate comment if rejected
    const trimmedComment = comment.trim();

    if (newStatus === "Rejected" && !trimmedComment) {
      notifyError("Comment is required when rejecting.");
      return;
    }

    setLoading(true);

    try {
      // Send one combined request
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/technicalapproval/update-Technicalstatus`,
        {
          order_id: selectedOrder.order_id,
          technical_admin_status: newStatus,
          comment: newStatus === "Rejected" ? trimmedComment : null,
        }
      );

      notifySuccess(`All items updated to ${newStatus}`);

      // Refetch orders
      const freshOrders = await fetchOrders(currentPage, ordersPerPage, {
        searchField,
        searchValue,
      });

      const updatedGroup = freshOrders.find(
        (grp) => grp.tracking_id === selectedOrder.tracking_id
      );
      if (updatedGroup) setSelectedOrder(updatedGroup);
    } catch (err) {
      console.error("Bulk status update error:", err);
      notifyError("Failed to update items.");
    } finally {
      setLoading(false);
      setShowModal(false);
      setShowOrderModal(false);
      setComment(""); // Reset comment
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleToggleTransferOptions = (orderId) => {
    setSelectedOrderId(orderId);
    setShowTransferModal(true);
    const updatedOrders = [...transferredOrders, orderId];
    setTransferredOrders(updatedOrders);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };


  const handleCommitteeApproval = async (committeeType) => {
    setTransferLoading(true);


    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeesampleapproval/transfertocommittee`,
        {
          cartId: selectedOrderId,
          senderId: user_id,
          committeeType,
        }
      );

      notifySuccess(response.data.message || "Approval request sent successfully!");
      setShowModal(false);
      setSelectedOrderId(null);
      setSelectedApprovalType("");

      const freshOrders = await fetchOrders(currentPage, ordersPerPage, {
        searchField,
        searchValue,
      });

      if (selectedOrder) {
        const updatedGroup = freshOrders.find(
          (grp) => grp.tracking_id === selectedOrder.tracking_id
        );
        if (updatedGroup) {
          setSelectedOrder(updatedGroup);
        }
      }

      setShowTransferModal(false);
    } catch (error) {
      notifyError("An error occurred while sending the approval request.");
      setShowModal(false);
    } finally {
      setTransferLoading(false);
    }
  };

  const handleHistory = useCallback(async (orderGroup) => {
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


  const openPdfFromBuffer = (buf) => {
    if (!buf?.data) {
      notifyError("No document available.");
      return;
    }
    const byteArray = new Uint8Array(buf.data);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };
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

  const handleUpdateDocuments = async () => {
    const formData = new FormData();
    formData.append("added_by", id);
    Object.entries(updatedDocs).forEach(([key, doc]) => {
      if (doc?.file) {
        formData.append(key, doc.file); // Append file with its key (e.g., study_copy)
      }
    });

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/updatedocument/${trackingID}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      notifySuccess("Documents updated successfully!");
      setShowDocument(false);
      setChangeMode(false);
      setUpdatedDocs({});
      setSelectedDocs({
        study_copy: false,
        irb_file: false,
        nbc_file: false,
      });
    } catch (error) {
      console.error("Error updating documents:", error);
      notifyError("Failed to update documents.");
    }
  };

  const handleCloseDocument = () => {
    setShowDocument(false);
    setSelectedDocs({
      study_copy: false,
      irb_file: false,
      nbc_file: false,
    });
    setUpdatedDocs({});
    setDocuments({});
  };

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Convert transferNo to review label
  const getReviewLabel = (transferNo) => {
    const number = Number(transferNo);
    return isNaN(number) ? "Review" : `${getOrdinal(number)} Review`;
  };

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
          <div className="d-flex justify-content-between align-items-center mb-3 w-100">
            {/* Left Side empty spacer */}
            <div style={{ width: "100px" }}></div>

            {/* Center Heading */}
            <h4 className="tp-8 fw-bold text-success text-center pb-2 flex-grow-1">
              Review Pending
            </h4>

            <div className="row justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-3 w-100">
                {Object.values(filters).some(value => value && value.trim() !== '') && (
                  <Button
                    onClick={resetFilters}
                    className="reset-btn fw-semibold ms-2"
                  >
                    🔄 Reset Filters
                  </Button>
                )}
              </div>
            </div>

          </div>



          {/* Table */}
          <div className="table-responsive" style={{ overflowX: "auto", maxWidth: "100%" }}>
            <table className="table table-bordered table-hover text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    { label: "Order ID", field: "tracking_id" },
                    { label: "Order Date", field: "created_at" },
                    { label: "Client Name", field: "researcher_name" },
                    { label: "Client Email", field: "user_email" },
                    { label: "Organization Name", field: "organization_name" },
                    { label: "Scientific", field: "scientific_committee_status" }, // ✅ Alag field
                    { label: "Ethical", field: "ethical_committee_status" }, // ✅ Alag field
                    { label: "View Documents", key: "study_copy" },
                  ].map(({ label, field, key }, index) => (
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
                        {label !== "View Documents" && (
                          <input
                            type="text"
                            className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                            placeholder={`Search ${label}`}
                            value={filters[field] || ''} // ✅ Controlled input
                            onChange={(e) => handleFilterChange(field, e.target.value)}
                            style={{ width: "100%" }}
                          />
                        )}
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
                        <Button
                          variant="primary"
                          size="sm"
                          className="fw-semibold shadow-sm"

                          onClick={() => fetchDocuments(orderGroup.tracking_id)}
                        >
                          View Documents
                        </Button>

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
                      {selectedOrder.technical_admin_status === 'Pending' && (
                        <>
                          <Button
                            variant={
                              selectedOrder.analytes?.some(
                                item =>
                                  (item.scientific_committee_status === "Approved" || item.scientific_committee_status === "Not Sent") &&
                                  (item.ethical_committee_status === "Approved" || item.ethical_committee_status === "Not Sent")
                              )
                                ? "outline-success"
                                : "secondary"
                            }
                            size="sm"
                            onClick={() => {
                              setActionType("Accepted");
                              setShowModal(true);
                            }}
                            disabled={
                              !selectedOrder.analytes?.some(
                                item =>
                                  (item.scientific_committee_status === "Approved" || item.scientific_committee_status === "Not Sent") &&
                                  (item.ethical_committee_status === "Approved" || item.ethical_committee_status === "Not Sent")
                              )
                            }
                          >
                            ✅ Accept
                          </Button>

                          {selectedOrder.analytes?.length > 0 &&
                            selectedOrder.analytes.every(item => {
                              const sciStatus = (item.scientific_committee_status || "").trim().toLowerCase();
                              const ethStatus = (item.ethical_committee_status || "").trim().toLowerCase();

                              // Scientific must be approved or refused
                              const sciDone = ["approved", "not sent"].includes(sciStatus);

                              // Ethical must be approved/refused OR not sent
                              const ethDone = ["approved", "not sent"].includes(ethStatus);

                              return sciDone && ethDone;
                            }) && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                  setActionType("Rejected");
                                  setSelectedOrderId(selectedOrder.order_id || selectedOrder.analytes?.[0]?.order_id);
                                  setShowModal(true);
                                }}
                              >
                                ❌ Reject
                              </Button>
                            )}



                          {/* Transfer */}
                          {!(
                            (selectedOrder?.scientific_committee_status?.toLowerCase() === "approved" && selectedOrder?.ethical_committee_status?.toLowerCase() === "not sent") ||
                            (selectedOrder?.ethical_committee_status?.toLowerCase() === "approved" && selectedOrder?.scientific_committee_status?.toLowerCase() === "not sent") ||
                            (selectedOrder?.scientific_committee_status?.toLowerCase() === "approved" && selectedOrder?.ethical_committee_status?.toLowerCase() === "approved")
                          ) && (
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleToggleTransferOptions(selectedOrder.order_id)}
                              >
                                Transfer
                              </button>
                            )}



                        </>
                      )}
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

          {/* Change Document */}
          <Modal show={showDocuments} onHide={handleCloseDocument} size="lg" centered>
            <Modal.Header closeButton className="bg-light border-bottom">
              <Modal.Title className="fw-bold text-dark">Sample Documents</Modal.Title>

            </Modal.Header>

            <Modal.Body className="p-4">
              <p className="text-danger fw-semibold mb-2">
                In case, you want to change the wrong document, update it by clicking on these checkboxes:
              </p>
              <div className="d-flex gap-3 mb-3">
                {Object.keys(selectedDocs).map((docKey) => (
                  <Form.Check
                    key={docKey}
                    type="checkbox"
                    label={<span className="fw-semibold text-primary">{docKey.replace("_", " ")}</span>}
                    checked={selectedDocs[docKey]}
                    onChange={() =>
                      setSelectedDocs((prev) => ({
                        ...prev,
                        [docKey]: !prev[docKey],
                      }))
                    }
                  />
                ))}
              </div>

              {Object.entries(documents).map(([key, value], index) => (
                <div key={index} className="d-flex justify-content-between align-items-center border rounded p-3 mb-3 shadow-sm">
                  <span className="fw-semibold text-capitalize">{key.replace("_", " ")}</span>
                  {selectedDocs[key] ? (
                    <Form.Control
                      type="file"
                      size="sm"
                      className="w-50"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.type !== "application/pdf") {
                          alert("Only PDF files are allowed!");
                          e.target.value = "";
                          return;
                        }
                        setUpdatedDocs((prev) => ({ ...prev, [key]: { name: key, file } }));
                      }}
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="px-3 fw-semibold"
                      onClick={() => openPdfFromBuffer(value)}
                      disabled={!value}
                    >
                      View
                    </Button>
                  )}
                </div>
              ))}

            </Modal.Body>

            <Modal.Footer className="bg-light border-top">

              {Object.values(selectedDocs).some((val) => val) && (
                <Button variant="success" onClick={handleUpdateDocuments} className="px-4 fw-semibold">
                  Submit
                </Button>
              )}

            </Modal.Footer>
          </Modal>



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
                      Review
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
                                    fontSize: "1rem",
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
                                  <strong>The Order referred to Technical Admin</strong>
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
                                  fontSize: "1rem",
                                  color: "#6b7280",
                                  marginBottom: "0.35rem",
                                  fontWeight: "500",
                                }}
                              >
                                {/* Referred date */}
                                {approval.committee_created_at && (
                                  <div style={{ marginBottom: "0.6rem" }}>
                                    {formatDT(approval.committee_created_at)}
                                    <div style={{ fontSize: "1rem", color: "#1f2937" }}>
                                      {/* <FaClock
                                        style={{ marginRight: "5px", color: "#6c757d" }}
                                      /> */}
                                      <strong>  The Order Referred to {approval.committeetype} Committee –{" "}
                                        {approval.CommitteeMemberName}
                                      </strong>
                                    </div>
                                  </div>
                                )}

                                {/* Approval/Refusal date */}
                                {approval.committee_approval_date && (
                                  <div>
                                    {formatDT(approval.committee_approval_date)}
                                    <div style={{ fontSize: "1rem", color: "#1f2937" }}>
                                      {approval.committee_status === "Refused" ? (
                                        <>
                                          {/* <FaTimesCircle
                                            style={{ marginRight: "5px", color: "#dc3545" }}
                                          /> */}
                                          <strong>The Order Refused by {approval.committeetype} Committee –{" "}
                                            {approval.CommitteeMemberName}
                                          </strong>
                                        </>
                                      ) : (
                                        <>
                                          {/* <FaCheckCircle
                                            style={{ marginRight: "5px", color: "#198754" }}
                                          /> */}
                                          <strong>The Order Approved by {approval.committeetype} Committee –{" "}
                                            {approval.CommitteeMemberName}</strong>
                                        </>
                                      )}
                                    </div>
                                  </div>
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
                                  fontSize: "1rem",
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
                                    fontSize: "1rem",
                                    color: "#6b7280",
                                    marginBottom: "0.35rem",
                                    fontWeight: "500",
                                  }}
                                >
                                  {formatDT(ta.TechnicaladminApproval_date)}
                                </div>
                                <div style={{ fontSize: "1rem", color: "#1f2937" }}>
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

          {/* Admin Approval Modal */}
          {showModal && (
            <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Action</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <p>
                  Are you sure you want to <strong>{actionType}</strong> items?
                </p>

                {actionType === "Rejected" && (
                  <Form.Group controlId="rejectionComment">
                    <Form.Label>Reason for Rejection</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter your comment here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </Form.Group>
                )}
              </Modal.Body>

              <Modal.Footer>

                <Button
                  variant={actionType === "Accepted" ? "success" : "danger"}
                  onClick={() => handleAdminStatus(actionType)}
                  disabled={loading}
                >
                  {loading ? "Processing..." : `Confirm ${actionType}`}
                </Button>
              </Modal.Footer>
            </Modal>
          )}

          {/* Transfer  */}
          <Modal
            show={showTransferModal}
            onHide={() => setShowTransferModal(false)}
            centered
            backdrop="static"
          >
            <Modal.Header closeButton>
              <Modal.Title>Send Approval</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Select approval type:</p>
              <Form.Select
                value={selectedApprovalType}
                onChange={(e) => setSelectedApprovalType(e.target.value)}
              >
                <option value="">Select an option</option>
                <option value="scientific">Scientific Approval</option>
                <option value="ethical">Ethical Approval</option>
                <option value="both">Both Approvals</option>
              </Form.Select>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"

                onClick={(e) => {
                  e.preventDefault();
                  handleCommitteeApproval(selectedApprovalType)
                }}
                disabled={!selectedApprovalType || transferLoading}
              >
                {transferLoading ? "Processing..." : "Save"}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Sample details Modal */}
          <DetailModal
            show={showSampleModal}
            onHide={() => setSampleShowModal(false)}
            title={`${selectedSample?.Analyte || "Sample"} Details`}
            data={selectedSample}
            fieldsToShow={[
              { key: "quantity", label: "Order Quantity" },
              { key: "volume", label: "Volume" },
              { key: "Volumeunit", label: "Volume Unit" },
              { key: "age", label: "Age" },
              { key: "gender", label: "Gender" },
              { key: "ethnicity", label: "Ethnicity" },
              { key: "CountryofCollection", label: "Country of Collection" },
              { key: "storagetemp", label: "Storage Temperature" },
              { key: "SampleTypeMatrix", label: "Sample Type" },
              { key: "TestResult", label: "Test Result" },
              { key: "TestResultUnit", label: "Test Result Unit" },
              { key: "TestMethod", label: "Test Method" },
              { key: "TestKitManufacturer", label: "Test Kit Manufacturer" },
              { key: "ConcurrentMedicalConditions", label: "Concurrent Medical Conditions" },
              { key: "InfectiousDiseaseTesting", label: "Infectious Disease Testing" },
              { key: "InfectiousDiseaseResult", label: "Infectious Disease Result" },
            ]}
          />


        </div>
      </div>
    </section >
  );
};

export default OrderPage;
