import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";

const OrderRejectedPage = () => {
  const [orders, setOrders] = useState([]); // Filtered orders
  const [allOrders, setAllOrders] = useState([]); // Original full orders list
  const [currentPage, setCurrentPage] = useState(1);
  const [showSampleModal, setSampleShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  const [loading, setLoading] = useState(false);
  // const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  // const [successMessage, setSuccessMessage] = useState("");
  // const [actionType, setActionType] = useState("");
  const [user_id, setUserID] = useState(null);
  // const [selectedApprovalType, setSelectedApprovalType] = useState("");
  // const [showCommentsModal, setShowCommentsModal] = useState(false);
  // const [selectedComments, setSelectedComments] = useState("");
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

  const fetchOrders = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const { searchField, searchValue } = filters;
      setLoading(true);
      let responseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrder?page=${page}&pageSize=${pageSize}&status=Rejected`;

      if (searchField && searchValue) {
        responseUrl += `&searchField=${searchField}&searchValue=${searchValue}`;
      }

      const response = await axios.get(responseUrl);
      const { data, totalCount } = response.data;

      setOrders(data);
      setAllOrders(data);
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage, ordersPerPage, {
      searchField,
      searchValue,
    });
  }, [fetchOrders, currentPage, searchField, searchValue]);


  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentOrders = orders || [];

  const handleFilterChange = (field, value) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchField(field);
    setSearchValue(trimmedValue);
    setCurrentPage(1);
  };

  const handlePageChange = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };

  const handleScroll = (e) => {
    const isVerticalScroll = e.target.scrollHeight !== e.target.clientHeight;

    if (isVerticalScroll) {
      const bottom =
        e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

      if (bottom && currentPage < totalPages) {
        setCurrentPage((prevPage) => prevPage + 1);
        fetchOrders(currentPage + 1);
      }
    }
  };

  useEffect(() => {
    if (showSampleModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showSampleModal]);
  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
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
                    { label: "Sample Name", field: "diseasename" },
                    { label: "Order Status", field: "order_status" },
                    {
                      label: "Technical Admin Status",
                      field: "technical_admin_status",
                    },
                    // {
                    //   label: "Scientific Committee Member Status",
                    //   field: "scientific_committee_status",
                    // },
                    // {
                    //   label: "Ethical Committee Member Status",
                    //   field: "ethical_committee_status",
                    // },
                  ].map(({ label, field }, index) => (
                    <th key={index} className="col-md-1 px-2">

                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                          placeholder={`Search ${label}`}
                          onChange={(e) => handleFilterChange(key, e.target.value)}
                          style={{ minWidth: "170px", maxWidth: "200px", width: "100px" }}
                        />
                        <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-6">
                          {label}
                        </span>

                      </div>
                    </th>
                  ))}
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
                        {order.diseasename}
                      </td>
                      <td>{order.order_status}</td>
                      <td>{order.technical_admin_status}</td>
                      {/* <td>
  {order.technical_admin_status === "Rejected" ? "No further processing" : "No further processing"}
</td>

                      <td>
                        {order.technical_admin_status === "Rejected"
                          ? "No further processing":"No further processing"
                        }
                      </td> */}
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
                    {selectedSample.diseasename} Details:
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

export default OrderRejectedPage;
