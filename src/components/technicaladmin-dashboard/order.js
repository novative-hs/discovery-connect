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
  const [orders, setOrders] = useState([]); // Filtered orders
  const [allOrders, setAllOrders] = useState([]); // Original full orders list
  const [currentPage, setCurrentPage] = useState(1);
  const [showSampleModal, setSampleShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(false);
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
  const [trackinID, setTrackingID] = useState(null);

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


  const handleFileChange = (index, file) => {
    const updatedDocs = [...documents];
    updatedDocs[index].file = file;
    setDocuments(updatedDocs);
  };
  const handleCheckboxChange = (index) => {
    const updatedDocs = [...documents];
    updatedDocs[index].wrong = !updatedDocs[index].wrong;
    setDocuments(updatedDocs);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("cartId", cartId);

    documents.forEach((doc, index) => {
      if (doc.file) {
        formData.append(`documents[${index}][file]`, doc.file);
        formData.append(`documents[${index}][name]`, doc.name);
        formData.append(`documents[${index}][wrong]`, doc.wrong);
      }
    });

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-documents`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Documents uploaded successfully!");
      setShow(false);
    } catch (err) {
      console.error(err);
      alert("Error uploading documents");
    }
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
    setShowModal(false);
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
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrder?page=${page}&pageSize=${pageSize}&status=Pending`;

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
  const handleViewDocuments = (fileBuffer, fileName, sampleId) => {
    if (!fileBuffer) {
      alert("No document available.");
      return;
    }

    // Convert buffer to Blob
    const blob = new Blob([new Uint8Array(fileBuffer.data)], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");

    // Track viewed status
    setDocuments((prev) => ({
      ...prev,
      [sampleId]: { ...(prev[sampleId] || {}), [fileName]: true },
    }));
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


  const handleAdminStatus = async (newStatus) => {
    if (!selectedOrder || !selectedOrder.analytes || selectedOrder.analytes.length === 0) return;

    // Trim and validate comment if rejected
    const trimmedComment = comment.trim();

    if (newStatus === "Rejected" && !trimmedComment) {
      notifyError("Comment is required when rejecting.");
      return;
    }

    setLoading(true);

    try {
      const allOrderIds = selectedOrder.analytes.map(analyte => analyte.order_id);

      // Send one combined request
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/bulk-update-Technicalstatus`,
        {
          order_ids: allOrderIds,
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

    const analyteIdsToTransfer = [
      ...new Set(
        selectedOrder?.analytes
          ?.filter(item => !item.sender_id)
          ?.map(item => item.order_id)
      )
    ];

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeesampleapproval/transfertocommittee`,
        {
          cartId: analyteIdsToTransfer,
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

  const getBase64FromBuffer = (buffer) => {
    if (!buffer) return null;

    let arr = buffer.data ? buffer.data : buffer;
    let blob = new Blob([new Uint8Array(arr)], { type: "application/pdf" });
    return URL.createObjectURL(blob);
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

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeesampleapproval/getHistory`,
        { params: { trackingIds: trackingIds.join(','), status: 'Pending' } }
      );

      // API se nested array aa raha hai → flatten kar do
      const rawHistory = response.data.results.flat();

      // 🔹 Remove duplicate committee records
      const dedupedHistory = uniqueByKey(rawHistory, (h) => `${h.committeetype}_${h.CommitteeMemberName}_${h.committee_status}_${h.committee_approval_date}`);

      // group by transfer
      const groupedHistory = groupHistoryByTransfer(dedupedHistory);

      setSelectedHistory(groupedHistory);
      setShowHistoryModal(true);

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
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })
      : "---";


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

  const handleUpdateDocuments = async () => {
    const formData = new FormData();
    Object.entries(updatedDocs).forEach(([key, doc]) => {
      if (doc?.file) {
        formData.append(key, doc.file); // Append file with its key (e.g., study_copy)
      }
    });

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/updatedocument/${trackinID}`,
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
                    { label: "View Documents", key: "study_copy" },



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
                        <Button
                          variant="primary"
                          size="sm"
                          className="fw-semibold shadow-sm"

                          onClick={() => {
                            setDocuments({
                              study_copy: { file: orderGroup.study_copy },
                              irb_file: { file: orderGroup.irb_file },
                              nbc_file: { file: orderGroup.nbc_file },
                            })
                            setTrackingID(orderGroup.tracking_id)
                            setShowDocument(true);
                          }}
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
                      {selectedOrder.technical_admin_status === 'Pending' && (
                        <>
                          <Button
                            variant={
                              selectedOrder.analytes?.some(
                                item =>
                                  (item.scientific_committee_status === "Approved" || item.scientific_committee_status === "Not Sent" || item.scientific_committee_status === "Refused") &&
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
                                  (item.scientific_committee_status === "Approved" || item.scientific_committee_status === "Not Sent" || item.scientific_committee_status === "Refused") &&
                                  (item.ethical_committee_status === "Approved" || item.ethical_committee_status === "Not Sent" || item.ethical_committee_status === "Refused")
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
                              const sciDone = ["approved", "refused", "not sent"].includes(sciStatus);

                              // Ethical must be approved/refused OR not sent
                              const ethDone = ["approved", "refused", "not sent"].includes(ethStatus);

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
                          {!(selectedOrder?.scientific_committee_status === "Approved" &&
                            selectedOrder?.ethical_committee_status === "Approved") && (
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

          <Modal show={showDocuments} onHide={handleCloseDocument} size="lg" centered>
            <Modal.Header closeButton className="bg-light border-bottom">
              <Modal.Title className="fw-bold text-dark">Sample Documents</Modal.Title>

            </Modal.Header>

            <Modal.Body className="p-4">
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
                <div
                  key={index}
                  className="d-flex justify-content-between align-items-center border rounded p-3 mb-3 shadow-sm"
                  style={{ backgroundColor: "#f9f9f9" }}
                >
                  <span className="fw-semibold text-capitalize">{key.replace("_", " ")}</span>
                  {selectedDocs[key] ? (
                    <Form.Control
                      type="file"
                      size="sm"
                      className="w-50"
                      accept="application/pdf"   // Restrict to PDF
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file && file.type !== "application/pdf") {
                          alert("Only PDF files are allowed!");
                          e.target.value = ""; // Clear invalid file
                          return;
                        }
                        const newDocs = { ...updatedDocs };
                        newDocs[key] = { name: key, file };
                        setUpdatedDocs(newDocs);
                      }}
                    />
                  ) : (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      className="px-3 fw-semibold"
                      onClick={() => openPdfFromBuffer(value.file)}
                      disabled={!value.file}
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
          <Modal show={showHistoryModal}
            onHide={() => setShowHistoryModal(false)}
            centered
            size="lg"
            scrollable
          >
            <Modal.Header closeButton>
              <Modal.Title className="fw-bold text-primary">Review History</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {selectedHistory.map((transferGroup, idx) => {
                const histories = Array.isArray(transferGroup.items[0])
                  ? transferGroup.items[0]
                  : transferGroup.items;

                const firstHistory = histories[0];

                return (
                  <div key={idx} className="mb-4 p-3 rounded shadow-sm bg-white">
                    {/* Transfer to Committee Member Date */}
                    <div className="mb-3">
                      <h6 className="fw-bold text-dark mb-1">📩 Transfer to Committee Member Date</h6>
                      <span className="badge bg-info text-white px-3 py-2">
                        {formatDT(firstHistory?.committee_created_at)}
                      </span>
                    </div>

                    {/* Committee Member Status */}
                    <div className="mb-3">
                      <h6 className="fw-bold text-dark mb-2">👥 Committee Member Status</h6>
                      <div className="list-group">
                        {histories.map((history, i) => (
                          <div
                            key={i}
                            className="list-group-item d-flex flex-column align-items-start mb-2 rounded shadow-sm border"
                          >
                            <div className="fw-bold">
                              {history.committeetype} - {history.CommitteeMemberName}
                            </div>
                            <div>
                              Status:{" "}
                              <span className="text-primary">
                                {history.committee_status || "---"}
                              </span>
                            </div>
                            <small className="text-muted">
                              Approval: {formatDT(history.committee_approval_date)}
                            </small>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    <div className="mb-3">
                      <h6 className="fw-bold text-dark mb-2">📂 Documents</h6>
                      {["study_copy", "irb_file", "nbc_file"].map((docKey) =>
                        firstHistory?.[docKey] ? (
                          <button
                            key={docKey}
                            className="btn btn-outline-primary btn-sm me-2 mb-1"
                            onClick={() => openPdfFromBuffer(firstHistory[docKey])}
                          >
                            Download {docKey.toUpperCase()}
                          </button>
                        ) : (
                          <span
                            key={docKey}
                            className="text-muted me-2 mb-1 d-inline-block"
                          >
                            {docKey.toUpperCase()} Not Attached
                          </span>
                        )
                      )}
                    </div>

                    {/* Technical Admin Approval */}
                    <div>
                      <h6 className="fw-bold text-dark mb-1">✅ Technical Admin Approval Date</h6>
                      <span className="badge bg-success text-white px-3 py-2">
                        {formatDT(firstHistory?.TechnicaladminApproval_date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
                Close
              </Button>
            </Modal.Footer>
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
                onClick={() => handleCommitteeApproval(selectedApprovalType)}
                disabled={!selectedApprovalType || transferLoading}
              >
                {transferLoading ? "Processing..." : "Save"}
              </Button>
            </Modal.Footer>
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
