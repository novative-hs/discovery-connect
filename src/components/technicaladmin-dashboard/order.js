import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faEllipsisV,
  faExchangeAlt,
  faEye,
  faTimes,
  faTruck,
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
  const [successMessage, setSuccessMessage] = useState("");
  const [actionType, setActionType] = useState("");
  const [user_id, setUserID] = useState(null);
  const [selectedApprovalType, setSelectedApprovalType] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedComments, setSelectedComments] = useState("");
  const ordersPerPage = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [filtertotal, setfiltertotal] = useState(null);
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const handleCloseModal = () => {
    setSelectedOrderId(null);
    setShowModal(false);
  };

  useEffect(() => {
    const storedUserID = sessionStorage.getItem("userID");
    if (storedUserID) {
      setUserID(storedUserID);
      console.log("technical Admin site  ID:", storedUserID); // Verify storedUserID
    }
  }, []);
  useEffect(() => {
    fetchOrders(currentPage, ordersPerPage, {
      searchField,
      searchValue,
    });
  }, [currentPage, searchField, searchValue]);

  const fetchOrders = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const { searchField, searchValue } = filters;
      setLoading(true);
  
      let responseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrder?page=${page}&pageSize=${pageSize}&status=Accepted`;
  
      if (searchField && searchValue) {
        responseUrl += `&searchField=${searchField}&searchValue=${searchValue}`;
      }
  
      const response = await axios.get(responseUrl);
      const { data, totalCount } = response.data;
  
      setTotalPages(Math.ceil(totalCount / pageSize)); // <-- Fixed here
      setOrders(data);
      setAllOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Adjust down if needed
    }
  }, [totalPages]);
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
  const handleScroll = (e) => {
    const isVerticalScroll = e.target.scrollHeight !== e.target.clientHeight;

    if (isVerticalScroll) {
      const bottom =
        e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

      if (bottom && currentPage < totalPages) {
        setCurrentPage((prevPage) => prevPage + 1); // Trigger fetch for next page
        fetchOrders(currentPage + 1); // Fetch more data if bottom is reached
      }
    }
  };
  const handleAdminStatus = async (newStatus) => {
    if (!selectedOrderId) return;

    setLoading(true);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/${selectedOrderId}/technical-status`,
        { technical_admin_status: newStatus }
      );

      if (response.status === 200) {
        setSuccessMessage(`Order status updated to ${newStatus} successfully!`);
        fetchOrders(); // Refresh the orders
        setCurrentPage(1)
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setSuccessMessage("Failed to update order status.");
    } finally {
      setLoading(false);
      setShowModal(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  const handleToggleTransferOptions = (orderId) => {
    setSelectedOrderId(orderId);
    setShowTransferModal(true);
  };
  const [expandedComments, setExpandedComments] = useState({});

  const toggleComments = (orderId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleCommitteeApproval = (committeeType) => {
    axios
      .post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeesampleapproval/transfertocommittee`,
        {
          cartId: selectedOrderId,
          senderId: user_id,
          committeeType: committeeType,
        }
      )
      .then((response) => {
        notifySuccess(
          response.data.message || "Approval request sent successfully!"
        );
        setShowModal(false);
        setSelectedOrderId(null);
        setSelectedApprovalType("");
        fetchOrders(); // Optimize fetchOrders if necessary
        setCurrentPage(1)
        setShowTransferModal(false);
      })
      .catch((error) => {
        notifyError("An error occurred while sending the approval request.");
        setShowModal(false);
      });
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
          <h7 className="text-danger mb-1">Click on Sample Name to get detail about sample.</h7>
        <div className="row justify-content-center">
          <h4 className="tp-8 fw-bold text-success text-center pb-2">
            Order Detail
          </h4>

          {/* Table */}
          <div
            onScroll={handleScroll}
            className="table-responsive w-100"
            style={{ overflowX: "auto" }}
          >
            <table className="table table-bordered table-hover text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    { label: "Order Id", field: "order_id" },
                    { label: "Researcher Name", field: "researcher_name" },
                    { label: "Organization Name", field: "organization_name" },
                    { label: "Sample Name", field: "samplename" },
                    { label: "Order Status", field: "order_status" },
                    {
                      label: "Technical Admin Status",
                      field: "technical_admin_status",
                    },
                    {
                      label: "Scientific Committee Member Status",
                      field: "scientific_committee_status",
                    },
                    {
                      label: "Ethical Committee Member Status",
                      field: "ethical_committee_status",
                    },
                    {
                      label: "Committee Members Comments",
                      field: "committee_comments",
                    },
                  ].map(({ label, field }, index) => (
                    <th key={index} className="p-2">
                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                          placeholder={label}
                          onChange={(e) =>
                            handleFilterChange(field, e.target.value)
                          }
                          style={{ minWidth: "200px" }}
                        />
                        <span className="fw-bold mt-1">{label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="p-2 text-center" style={{ minWidth: "120px" }}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="table-light">
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>{order.order_id}</td>
                      <td>{order.researcher_name}</td>
                      <td>{order.organization_name}</td>
                      <td
                        style={{
                          cursor: "pointer",
                          color: "inherit",
                          transition:
                            "color 0.2s ease-in-out, text-decoration 0.2s ease-in-out",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.color = "blue";
                          e.target.style.textDecoration = "underline";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = "inherit";
                          e.target.style.textDecoration = "none";
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent triggering row click
                          setSelectedSample(order);
                          setSampleShowModal(true);
                        }}
                      >
                        {order.samplename}
                      </td>
                      <td>{order.order_status}</td>
                      <td>{order.technical_admin_status}</td>
                      <td>
  {order.technical_admin_status === "Rejected" ? (
    order.technical_admin_status === "Rejected" ? (
      "No further processing"
    ) : order.technical_admin_status === "Pending" ? (
      "Pending Admin Approval"
    ) : order.scientific_committee_status === "Refused" ? (
      "Refused"
    ) : !order.scientific_committee_status ? (
      "Awaiting Admin Action"
    ) : (
      order.scientific_committee_status
    )
  ) : order.scientific_committee_status === "Refused" ? (
    "Refused"
  ) : !order.scientific_committee_status ? (
    "Awaiting Admin Action"
  ) : (
    order.scientific_committee_status
  )}
</td>




                      <td>
                        {order.ethical_committee_status === "Refused"
                          ? "Refused"
                          : order.technical_admin_status === "Rejected"
                          ? "No further processing"
                          : order.ethical_committee_status === "" ||
                          order.ethical_committee_status === null &&
                          order.sender_id=== null
                         ? "Not Send"
                          : order.ethical_committee_status === "" ||
                           order.ethical_committee_status === null
                          ? "Awaiting Admin Action"
                          : order.ethical_committee_status || "Awaiting Review"}
                      </td>

                      <td
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedComments(order.committee_comments);
                          setShowCommentsModal(true);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="text-primary fw-bold">
                          View Comments
                        </span>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-2 position-relative">
                          {/* Edit Status Button */}
                          
                          <div className="d-flex align-items-center gap-2 position-relative">
                            {/* ✅ Accept Button (Tick Icon) */}
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click event from firing
                                setSelectedOrderId(order.order_id);
                                setShowModal(true);
                                setActionType("Accepted"); // Track the action type
                              }}
                              title="Accept Order"
                            >
                              <FontAwesomeIcon icon={faCheck} size="sm" />
                            </button>

                            {order.technical_admin_status !== "Accepted" && (
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderId(order.order_id);
                                setShowModal(true);
                                setActionType("Rejected"); // Track the action type
                              }}
                              title="Reject Order"
                            >
                              <FontAwesomeIcon icon={faTimes} size="sm" />
                            </button>
                            )}
                          </div>
                          {/* Send Approval Button */}
                          {order.technical_admin_status === "Accepted" &&
                            order.ethical_committee_status === null &&
                            order.scientific_committee_status === null && (
                              <div className="position-relative">
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click event from firing
                                    handleToggleTransferOptions(order.order_id);
                                  }}
                                  title="Send Approval to Committee Member"
                                >
                                  <FontAwesomeIcon
                                    icon={faExchangeAlt}
                                    size="sm"
                                  />
                                </button>
                              </div>
                            )}
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
          {showModal && (
            <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Action</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>
                  Are you sure you want to <strong>{actionType}</strong> Order
                  ID: {selectedOrderId}?
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant={actionType === "Accepted" ? "success" : "danger"}
                  onClick={() => handleAdminStatus(actionType)}
                  disabled={loading} // Disable button while processing
                >
                  {loading ? "Processing..." : `Confirm ${actionType}`}
                </Button>
              </Modal.Footer>
            </Modal>
          )}
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
                  height: "100%",
                  zIndex: 1040,
                }}
              ></div>

              {/* Modal Content */}
              <div
                className="modal show d-block"
                role="dialog"
                style={{
                  zIndex: 1050,
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "#fff",
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  width: "90vw",
                  maxWidth: "500px",
                  maxHeight: "70vh",
                  overflowY: "auto",
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

                <div className="modal-body">
                  {selectedComments ? (
                    selectedComments.split(" | ").map((comment, idx) => {
                      const [name, text] = comment.split(" : ");
                      return (
                        <div
                          key={idx}
                          className="p-3 mb-3 rounded"
                          style={{
                            backgroundColor: "#f8f9fa", // light background
                            border: "1px solid #dee2e6", // subtle border
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
                    <p className="text-muted fst-italic">
                      No comments available
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Approval  */}

          {showTransferModal && (
            <div className="modal show d-block mt-5" tabIndex="-1">
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Send Approval</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowTransferModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>Select approval type:</p>
                    <select
                      className="form-select"
                      value={selectedApprovalType}
                      onChange={(e) => setSelectedApprovalType(e.target.value)}
                    >
                      <option value="">Select an option</option>
                      <option value="scientific">Scientific Approval</option>
                      <option value="ethical">Ethical Approval</option>
                      <option value="both">Both Approvals</option>
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        handleCommitteeApproval(selectedApprovalType)
                      }
                      disabled={!selectedApprovalType} // Disables if no option is selected
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage - 1}
            />
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
                  zIndex: 1050,
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
                  overflow: "hidden", // Prevent scrolling
                }}
              >
                {/* Modal Header */}
                <div
                  className="modal-header d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "#cfe2ff", color: "#000" }}
                >
                  <h5 className="fw-bold">
                    {selectedSample.samplename} Details:
                  </h5>
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
                        <p>
                          <strong>Quantity:</strong> {selectedSample.quantity}
                        </p>
                        <p>
                          <strong>Quantity unit:</strong>{" "}
                          {selectedSample.QuantityUnit}
                        </p>
                        <p>
                          <strong>Country of Collection:</strong>{" "}
                          {selectedSample.CountryofCollection}
                        </p>
                        <p>
                          <strong>Age:</strong> {selectedSample.age} years |{" "}
                          <strong>Gender:</strong> {selectedSample.gender} |{" "}
                          <strong>Ethnicity:</strong> {selectedSample.ethnicity}
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Detailed Information */}
                    <div className="col-md-7">
                      <p>
                        <strong>Storage Temperature:</strong>{" "}
                        {selectedSample.storagetemp}
                      </p>
                      <p>
                        <strong>Sample Type:</strong>{" "}
                        {selectedSample.SampleTypeMatrix}
                      </p>
                      <p>
                        <strong>Diagnosis Test Parameter:</strong>{" "}
                        {selectedSample.DiagnosisTestParameter}
                      </p>
                      <p>
                        <strong>Test Result:</strong>{" "}
                        {selectedSample.TestResult}{" "}
                        {selectedSample.TestResultUnit}
                      </p>
                      <p>
                        <strong>Test Method:</strong>{" "}
                        {selectedSample.TestMethod}
                      </p>
                      <p>
                        <strong>Test Kit Manufacturer:</strong>{" "}
                        {selectedSample.TestKitManufacturer}
                      </p>
                      <p>
                        <strong>Concurrent Medical Conditions:</strong>{" "}
                        {selectedSample.ConcurrentMedicalConditions}
                      </p>
                      <p>
                        <strong>Infectious Disease Testing:</strong>{" "}
                        {selectedSample.InfectiousDiseaseTesting}
                      </p>
                      <p>
                        <strong>Infectious Disease Result:</strong>{" "}
                        {selectedSample.InfectiousDiseaseResult}
                      </p>
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

export default OrderPage;
