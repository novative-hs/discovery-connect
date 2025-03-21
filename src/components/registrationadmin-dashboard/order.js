import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsis,
  faEllipsisV,
  faExchange,
  faExchangeAlt,
  faEye,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

const OrderPage = () => {
  const [orders, setOrders] = useState([]); // Filtered orders
  const [allOrders, setAllOrders] = useState([]); // Original full orders list
  const [currentPage, setCurrentPage] = useState(1);
  const [showSampleModal, setSampleShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const ordersPerPage = 10;
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [transferOptionsVisibility, setTransferOptionsVisibility] = useState(
    {}
  );
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrder`
      );
      console.log(response.data);
      setOrders(response.data);
      setAllOrders(response.data); // Save original data
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    if (value.trim() === "") {
      setOrders(allOrders); // Restore original data
    } else {
      const filtered = allOrders.filter((order) =>
        order[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );

      setOrders(filtered);
    }
    setCurrentPage(1); // Reset pagination to first page
  };

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handleToggleTransferOptions = (orderId) => {
    setTransferOptionsVisibility((prev) => ({
      ...prev,
      [orderId]: !prev[orderId], // Toggle visibility for specific order
    }));
  };

  const handleToggleStatusOptions = (orderId) => {
    setStatusOptionsVisibility((prev) => ({
      ...prev,
      [orderId]: !prev[orderId], // Toggle visibility for specific order
    }));
  };

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <div className="row justify-content-center">
          <h4 className="tp-8 fw-bold text-success text-center pb-2">
            Order Detail
          </h4>

          {/* Table */}
          <div className="table-responsive w-100">
            <table className="table table-bordered table-hover text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {[
                    { label: "Order Id", field: "id" },
                    { label: "Researcher Name", field: "researcher_name" },
                    { label: "Organization Name", field: "organization_name" },
                    { label: "Sample Name", field: "samplename" },
                    { label: "Price", field: "price" },
                    { label: "Quantity", field: "quantity" },
                    { label: "Status", field: "status" },
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
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.researcher_name}</td>
                      <td>{order.organization_name}</td>
                      <td>{order.samplename}</td>
                      <td>
                        {order.SamplePriceCurrency} {order.price}
                      </td>
                      <td>{order.quantity}</td>
                      <td>{order.status}</td>
                      <td>
                        <div>
                          <button
                            className="btn btn-sm"
                            onClick={() => {
                              setSelectedSample(order);
                              setSampleShowModal(true);
                            }}
                            title="View Sample Detail"
                          >
                            <FontAwesomeIcon
                              size="1x"
                              className="text-dark"
                              icon={faEye}
                            />
                          </button>
                          <button
                            className="btn btn-primary btn-sm py-0 px-1"
                            onClick={() => handleToggleStatusOptions(order.id)}
                            title="Edit Status"
                          >
                            <FontAwesomeIcon icon={faEllipsisV} size="xs" />
                          </button>
                          <button
                            className="btn btn-primary btn-sm py-0 px-1"
                            onClick={() =>
                              handleToggleTransferOptions(order.id)
                            }
                            title="Send Approval to Committee member"
                          >
                            <FontAwesomeIcon icon={faExchangeAlt} size="xs" />
                          </button>

                          {transferOptionsVisibility[order.id] && (
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "220px",
                                left: "1100px",
                              }}
                            >
                              <button
                                className="dropdown-item"
                                onClick={() => console.log("Accepted")}
                              >
                                Send for Approval Scientific
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => console.log("Refused")}
                              >
                                Send for Approval Ethical
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => console.log("Refused")}
                              >
                                Send for Approval Ethical and Scientific
                              </button>
                            </div>
                          )}

                          {statusOptionsVisibility[order.id] && (
                            <div
                              className="dropdown-menu show"
                              style={{
                                position: "absolute",
                                top: "220px",
                                left: "1100px",
                              }}
                            >
                              <button
                                className="dropdown-item"
                                onClick={() => console.log("Accepted")}
                              >
                                Accepted
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() => console.log("Refused")}
                              >
                                Refused
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center p-2">
                      No researchers available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {orders.length >= 0 && (
            <Pagination
              handlePageClick={(data) => setCurrentPage(data.selected + 1)}
              pageCount={Math.ceil(orders.length / ordersPerPage)}
              focusPage={currentPage - 1}
            />
          )}
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
                  overflowY: "auto",
                }}
              >
                {/* Modal Header */}
                <div className="modal-header d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold">{selectedSample.samplename}</h5>
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
                <div className="modal-body">
                  <div className="row">
                    {/* Left Side: Image & Basic Details */}
                    <div className="col-md-5 text-center">
                      <div className="mt-3 p-2 bg-light rounded text-start">
                        <p>
                          <strong>Sample Name:</strong>{" "}
                          {selectedSample.samplename}
                        </p>
                        <p>
                          <strong>Price:</strong> {selectedSample.price}{" "}
                          {selectedSample.SamplePriceCurrency}
                        </p>
                        <p>
                          <strong>Quantity unit:</strong>{" "}
                          {selectedSample.QuantityUnit}
                        </p>
                        <p>
                          <strong>Country of Collection:</strong>{" "}
                          {selectedSample.CountryOfCollection}
                        </p>
                        <p>
                          <strong>Status:</strong> {selectedSample.status}
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Detailed Information */}
                    <div className="col-md-7">
                      <p>
                        <strong>Age:</strong> {selectedSample.age} years |{" "}
                        <strong>Gender:</strong> {selectedSample.gender}
                      </p>
                      <p>
                        <strong>Ethnicity:</strong> {selectedSample.ethnicity}
                      </p>
                      <p>
                        <strong>Storage Temp:</strong>{" "}
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
                        {selectedSample.InfectiousDiseaseTesting} (
                        {selectedSample.InfectiousDiseaseResult})
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
