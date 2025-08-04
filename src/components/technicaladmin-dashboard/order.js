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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionType, setActionType] = useState("");
  const [user_id, setUserID] = useState(null);
  const [selectedApprovalType, setSelectedApprovalType] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedComments, setSelectedComments] = useState("");
  const ordersPerPage = 10;
  const [transferLoading, setTransferLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(1);
  const [filtertotal, setfiltertotal] = useState(null);
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [allOrdersRaw, setAllOrdersRaw] = useState([]);

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
      setAllOrders(groupedOrders);
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


  const handleAdminStatus = async (newStatus) => {
    if (!selectedOrder || !selectedOrder.analytes || selectedOrder.analytes.length === 0) return;

    setLoading(true);

    try {
      // Send request for all analytes in parallel
      const updatePromises = selectedOrder.analytes.map((analyte) =>
        axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/${analyte.order_id}/technical-status`,
          { technical_admin_status: newStatus }
        )
      );

      // Wait for all requests to finish
      await Promise.all(updatePromises);

      notifySuccess(`All items updated to ${newStatus}`);

      // Fetch fresh orders
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
    } catch (err) {
      console.error("Bulk status update error:", err);
      notifyError("Failed to update all items.");
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

  const openModal = (sample) => {

    setSelectedOrder(sample);
    setShowOrderModal(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setShowOrderModal(false);
  };
  const toggleComments = (orderId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
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


    console.log("Transfering with:", {
      cartId: analyteIdsToTransfer,
      senderId: user_id,
      committeeType,
      analyteIds: analyteIdsToTransfer
    });

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
            Order Detail
          </h4>

          {/* Table */}
          <div className="table-responsive" style={{ overflowX: "auto", maxWidth: "100%" }}>
            <table className="table table-bordered table-hover text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    { label: "Order Id", field: "tracking_id" },
                    {
                      label: "Order Date",
                      field: "created_at"
                    },
                    { label: "Client Name", field: "researcher_name" },
                    { label: "Client Email", field: "user_email" },
                    { label: "Client Contact", field: "phoneNumber" },
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
                      <td>{new Date(orderGroup.created_at).toLocaleDateString('en-GB')}</td>
                      <td>{orderGroup.researcher_name}</td>
                      <td>{orderGroup.user_email}</td>
                      <td>{orderGroup.phoneNumber}</td>
                      <td>{orderGroup.organization_name}</td>
                      <td>
                        <span className={`badge text-uppercase fw-semibold text-dark fs-6
                          ${orderGroup.order_status === 'Pending' ? 'bg-warning text-dark' : ''}
                          ${orderGroup.order_status === 'Under Review' ? 'bg-info text-dark' : ''}
                          ${orderGroup.order_status === 'Accepted' ? 'bg-success' : ''}
                          ${orderGroup.order_status === 'Shipped' ? 'bg-primary' : ''}
                          ${orderGroup.order_status === 'Dispatch' ? 'bg-secondary' : ''}
                          ${orderGroup.order_status === 'Completed' ? 'bg-success' : ''}
                        `}>
                          {orderGroup.order_status}
                        </span>
                      </td>



                      <td>
                        <span
                          className="text-primary"
                          style={{ cursor: "pointer" }}
                          onClick={() => {

                            setSelectedOrder(orderGroup); // save full group
                            setShowOrderModal(true);

                          }}
                        >
                          View Details
                        </span>
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
                {/* Status Section */}
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 border p-3 rounded bg-light">
                  <div>
                    <span className="fw-bold">Customer Support Admin Status:</span>{" "}
                    <span className={`badge ${selectedOrder.analytes?.every(item => item.technical_admin_status === "Accepted") ? "bg-success" : "bg-warning text-dark"}`}>
                      {selectedOrder.analytes?.every(item => item.technical_admin_status === "Accepted") ? "All Accepted" : "Pending"}
                    </span>
                  </div>

                  <div>
                    <span className="fw-bold">Order Status:</span>{" "}
                    <span className={`badge ${selectedOrder.order_status ? "bg-info text-dark" : "bg-secondary"}`}>
                      {selectedOrder.order_status || "Not Set"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    {/** Define condition for Accept button **/}
                    {(() => {
                      const isAcceptEnabled = selectedOrder.analytes?.some(item =>
                        item.scientific_committee_status === "Approved" &&
                        (item.ethical_committee_status === "Approved" || item.ethical_committee_status === "Not Sent")
                      );

                      return (
                        <>
                          {/* ✅ Accept Button */}
                          <button
                            className={`btn btn-sm ${isAcceptEnabled ? "btn-outline-success" : "btn-secondary"}`}
                            disabled={!isAcceptEnabled}
                            onClick={() => {
                              setActionType("Accepted");
                              setShowModal(true);
                            }}
                          >
                            Accept
                          </button>

                          {/* ❌ Reject Button */}
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => {
                              setActionType("Rejected");
                              setSelectedOrderId(selectedOrder.order_id || selectedOrder.analytes?.[0]?.order_id);
                              setShowModal(true);
                            }}
                          >
                            Reject
                          </button>

                          {/* 🔁 Transfer Button */}
                          <button
                            className={`btn btn-sm ${selectedOrder.order_status === "Pending" ? "btn-outline-primary" : "btn-secondary"}`}
                            disabled={selectedOrder.order_status !== "Pending"}
                            onClick={() => handleToggleTransferOptions(selectedOrder.order_id)}
                          >
                            Transfer
                          </button>
                        </>
                      );
                    })()}
                  </div>


                </div>

                {/* Analytes Table */}
                <div className="table-responsive">
                  <table className="table table-bordered table-hover align-middle text-center">
                    <thead className="table-light">
                      <tr>
                        <th>Analyte</th>
                        {/* <th>Quantity X Volume</th> */}
                        <th>Sample Collection Site</th>
                        <th>Scientific Committee</th>
                        <th>Ethical Committee</th>
                        <th>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.analytes?.map((order, index) => (
                        <tr key={order.order_id || index}>
                          <td
                            className="text-primary fw-semibold"
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                            onClick={() => {
                              setSelectedSample(order);
                              setSampleShowModal(true);
                            }}
                          >
                            {order.Analyte || "N/A"}
                          </td>
                          {/* <td>{order.quantity} X {order.volume}{order.VolumeUnit}</td> */}
                          <td>{order.source_name}</td>

                          <td>
                            {order.technical_admin_status === "Rejected" ? (
                              <span className="badge bg-danger">No further processing</span>
                            ) : order.scientific_committee_status === "Refused" ? (
                              <span className="badge bg-danger">Refused</span>
                            ) : !order.scientific_committee_status ? (
                              <span className="badge bg-secondary">Awaiting Admin Action</span>
                            ) : (
                              <span className="badge bg-success">{order.scientific_committee_status}</span>
                            )}
                          </td>

                          <td>
                            {order.ethical_committee_status === "Refused" ? (
                              <span className="badge bg-danger">Refused</span>
                            ) : order.technical_admin_status === "Rejected" ? (
                              <span className="badge bg-danger">No further processing</span>
                            ) : !order.ethical_committee_status && order.sender_id === null ? (
                              <span className="badge bg-warning text-dark">Not Sent</span>
                            ) : !order.ethical_committee_status ? (
                              <span className="badge bg-secondary">Awaiting Admin Action</span>
                            ) : (
                              <span className="badge bg-success">{order.ethical_committee_status}</span>
                            )}
                          </td>

                          <td
                            className="text-primary fw-bold"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedComments(order.committee_comments);
                              setShowCommentsModal(true);
                            }}
                          >
                            View Comments
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

          {showModal && (
            <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>Confirm Action</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>
                  Are you sure you want to <strong>{actionType}</strong> all items?
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


          {/* Approval  */}
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
                  zIndex: 1060, // Increased z-index to be above Bootstrap modals
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
                  overflow: "hidden",
                }}
              >

                {/* Modal Header */}
                <div
                  className="modal-header d-flex justify-content-between align-items-center"
                  style={{ backgroundColor: "#cfe2ff", color: "#000" }}
                >
                  <h5 className="fw-bold">
                    {selectedSample.Analyte} Details:
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
                          <strong>Order Quantity:</strong> {selectedSample.quantity}
                        </p>
                        <p>
                          <strong>Volume:</strong>{" "}
                          {selectedSample.volume} {selectedSample.Volumeunit}
                        </p>
                        <p>
                          <strong>Age:</strong> {selectedSample.age} years |{" "}
                          <strong>Gender:</strong> {selectedSample.gender} |{" "}
                        </p>
                        <p>
                          <strong>Ethnicity:</strong> {selectedSample.ethnicity}

                        </p>
                        <p>
                          <strong>Country of Collection:</strong>{" "}
                          {selectedSample.CountryofCollection}
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
