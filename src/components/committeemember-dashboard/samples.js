// Modified SampleArea Component with Grouped Researcher View
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { notifyError, notifySuccess } from "@utils/toast";
import Pagination from "@ui/Pagination";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faCheck,
  faTimes,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

const SampleArea = () => {
  const id = sessionStorage.getItem("userID");
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [comment, setComment] = useState("");
  const [selectedComment, setSelectedComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [samples, setSamples] = useState([]);
  const [showSampleModal, setSampleShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchField, setSearchField] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [showGroupedModal, setShowGroupedModal] = useState(false);
  const [selectedResearcherSamples, setSelectedResearcherSamples] = useState(null);
  const [comments, setComments] = useState({});
  const [viewedDocuments, setViewedDocuments] = useState({});
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [filters, setFilters] = useState({
    tracking_id: "",
    researcher_name: "",
    organization_name: "",
    order_status: "",
    created_at: "",
  });
  const tableHeaders = [
    { label: "Order ID", key: "tracking_id" },
    { label: "Researcher Name", key: "researcher_name" },
    { label: "Organization Name", key: "organization_name" },
    { label: "Order Status", key: "order_status" },
    { label: "Order Date", key: "created_at" }
  ];
  const SampleHeader = [
    { label: "Analyte", key: "Analyte" },
    { label: "Committee Comments", key: "comments" },
    { label: "Additional Mechanism", key: "reporting_mechanism" },
    { label: "Study Copy", key: "study_copy" },
    { label: "IRB file", key: "irb_file" },
    { label: "NBC file", key: "nbc_file" },
    { label: "Status", key: "committee_status" },
  ];

  const fetchSamples = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const { searchField, searchValue } = filters;
      const docFields = ["study_copy", "reporting_mechanism", "irb_file", "nbc_file"];
      const filterForDoc = docFields.includes(searchField);

      let orderUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyCommittee/${id}?page=${page}&pageSize=${pageSize}`;
      let docUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getAllDocuments/${id}?page=${page}&pageSize=${pageSize}`;

      if (searchField && searchValue) {
        const filter = `&searchField=${searchField}&searchValue=${searchValue}`;
        if (filterForDoc) {
          docUrl += filter;
        } else {
          orderUrl += filter;
        }
      }

      const [orderRes, docRes] = await Promise.all([
        axios.get(orderUrl),
        axios.get(docUrl),
      ]);

      const orders = orderRes.data.results || [];
      const totalCount = orderRes.data.totalCount || 0;
      const documents = docRes.data.results || [];

      const docMap = {};
      documents.forEach((doc) => {
        if (doc.cart_id) {
          docMap[doc.cart_id] = doc;
        }
      });

      const merged = orders.map((order) => ({
        ...order,
        ...(docMap[order.cart_id] || {}),
      }));
      console.log(merged)
      setSamples(merged);
      setFilteredSamplename(merged);
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [id]); // Only depend on `id`

  useEffect(() => {
    if (id) {
      fetchSamples(currentPage, itemsPerPage, { searchField, searchValue });
    }
  }, [id, currentPage, itemsPerPage, searchField, searchValue, fetchSamples]);

  const groupedByResearcher = samples.reduce((acc, sample) => {
    const key = sample.tracking_id || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(sample);
    return acc;
  }, {});
  const handleOpenModal = (type, sample) => {
    if (!sample) {
      alert("Sample data is missing.");
      return;
    }
    if (!allDocumentsViewed(sample.cart_id, sample)) {
      alert("Please view all required documents before proceeding.");
      return;
    }
    setSelectedSample(sample); // Ensure the selected sample is set
    setActionType(type);
    setShowModal(true);
  };
  // Close Modal
  const handleCloseModal = () => {
    setSelectedSample(null); // Ensure the selected sample is set
    setActionType(null);
    setShowModal(false);
  };

  const handlePageChange = (event) => {
    const selectedPage = event.selected + 1;
    setCurrentPage(selectedPage);
  };


const handleFilterChange = (field, value) => {
  setSearchField(field);
  setSearchValue(value);
  setCurrentPage(1); // Optionally reset to page 1 when filtering
};

  const handleViewDocument = (fileBuffer, fileName, sampleId) => {
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
    setViewedDocuments((prev) => ({
      ...prev,
      [sampleId]: { ...(prev[sampleId] || {}), [fileName]: true },
    }));
  };

  // Check if all documents are viewed for a sample
  const allDocumentsViewed = (cartId, sample) => {
    if (!sample) return false; // Ensure sample exists before accessing properties

    const requiredDocs = ["study_copy", "irb_file"];
    const optionalDoc = "nbc_file"; // This is optional

    // Ensure required documents are viewed
    const hasViewedRequired = requiredDocs.every(
      (doc) => viewedDocuments[cartId]?.[doc]
    );

    // Check if nbc_file exists in the sample; if it does, ensure it is viewed
    const hasViewedOptional =
      !sample.nbc_file || viewedDocuments[cartId]?.[optionalDoc];

    return hasViewedRequired && hasViewedOptional;
  };

  const handleSubmit = async () => {
    const trimmedComment = comment.trim();

    if (!id || !selectedSample || !trimmedComment) {
      alert("Please enter a comment.");
      return;
    }

    const payload = {
      committee_member_id: id,
      committee_status: actionType, // "Approved" or "Refused"
      comments: trimmedComment,
    };

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeesampleapproval/${selectedSample.cart_id}/committee-approval`,
        payload
      );

      if (response.data.success) {
        notifySuccess(response.data.message);
        setShowModal(false);
        setComment("");

        // ✅ Fetch updated data and replace both samples & selectedResearcherSamples
        const updatedOrderRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyCommittee/${id}?page=${currentPage}&pageSize=${itemsPerPage}`
        );
        const updatedDocRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getAllDocuments/${id}?page=${currentPage}&pageSize=${itemsPerPage}`
        );

        const updatedOrders = updatedOrderRes.data.results || [];
        const updatedDocuments = updatedDocRes.data.results || [];

        const updatedDocMap = {};
        updatedDocuments.forEach((doc) => {
          if (doc.cart_id) {
            updatedDocMap[doc.cart_id] = doc;
          }
        });

        const updatedMerged = updatedOrders.map((order) => ({
          ...order,
          ...(updatedDocMap[order.cart_id] || {}),
        }));

        setSamples(updatedMerged); // Update main sample list

        // ✅ Update the selected group with fresh data
        const updatedGroup = updatedMerged.filter(
          (s) => s.tracking_id === selectedSample.tracking_id
        );
        setSelectedResearcherSamples(updatedGroup);

      } else {
        notifyError("Failed to update committee status. Please try again.");
      }
    } catch (error) {
      console.error("❌ Error updating committee status:", error);
      if (error.response?.data?.error) {
        notifyError(`Error: ${error.response.data.error}`);
      } else {
        notifyError("Unexpected error occurred.");
      }
    }
  };




  const handleScroll = (e) => {
    const isVerticalScroll = e.target.scrollHeight !== e.target.clientHeight;

    if (isVerticalScroll) {
      const bottom =
        e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

      if (bottom && currentPage < totalPages) {
        setCurrentPage((prevPage) => prevPage + 1); // Trigger fetch for next page
        fetchSamples(currentPage + 1); // Fetch more data if bottom is reached
      }
    }
  };

  if (!id) return <div>Loading...</div>;
  return (
    <div className="container py-3">
      <h4 className="text-center text-success">Researcher Orders</h4>
      <div
        onScroll={handleScroll}
        className="table-responsive"
        style={{ overflowX: "auto" }}
      >
        <table className="table table-bordered table-hover text-center align-middle">
          <thead className="table-primary text-dark">
            <tr>
              {tableHeaders.map(({ label, key }, index) => (
                <th key={index} className="px-2">
                  <div className="d-flex flex-column align-items-center">
                    <input
                      type="text"
                      className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                      placeholder={`Search ${label}`}
                      onChange={(e) =>
                        handleFilterChange(key, e.target.value)
                      }
                      style={{ minWidth: "100px" }} // Adjusted minWidth
                    />
                    <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-10">
                      {label}
                    </span>
                  </div>
                </th>
              ))}
              <th className="p-2 text-center" style={{ minWidth: "50px" }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedByResearcher).map(([researcher, group], idx) => (
              <tr key={idx}>
                <td>{group[0].tracking_id}</td>
                <td>{group[0].researcher_name}</td>
                <td>{group[0].organization_name}</td>
                <td>{group[0].order_status}</td>
                <td>{moment(group[0].created_at).format("YYYY-MM-DD HH:mm A")}</td>
                <td>
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => {
                      setSelectedResearcherSamples(group);
                      setShowGroupedModal(true);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        handlePageClick={handlePageChange}
        pageCount={totalPages}
        focusPage={currentPage - 1}
      />

      {showGroupedModal && selectedResearcherSamples && (
        <Modal
          show={showGroupedModal}
          onHide={() => setShowGroupedModal(false)}
          size="xl" // Larger than "lg"
          dialogClassName="custom-modal-width"
        >

          <Modal.Header closeButton>
            <Modal.Title>
              Samples for {selectedResearcherSamples[0]?.researcher_name}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div
              onScroll={handleScroll}
              className="table-responsive"
              style={{ minWidth: "100%", overflowX: "visible" }}
            >

              <table className="table table-bordered table-hover text-center align-middle">
                <thead className="table-primary text-dark">
                  <tr>
                    {SampleHeader?.map(({ label, key }, index) => (
                      <th key={index} className="px-2">
                        <div className="d-flex flex-column align-items-center">
                          {/* <input
                            type="text"
                            className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                            placeholder={`Search ${label}`}
                            onChange={(e) => handleFilterChange(key, e.target.value)}
                            style={{ minWidth: "100px" }}
                          /> */}
                          <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-10">
                            {label}
                          </span>
                        </div>
                      </th>
                    ))}

                    {/* This block must be **outside** of the map */}
                    {selectedResearcherSamples?.some(
                      (sample) =>
                        sample.committee_status !== "Approved" &&
                        sample.committee_status !== "Refused"
                    ) && (
                        <th className="p-2 text-center" style={{ minWidth: "50px" }}>
                          Action
                        </th>
                      )}


                  </tr>

                </thead>

                <tbody className="table-light">
                  {selectedResearcherSamples.length > 0 ? (
                    selectedResearcherSamples.map((sample) => (
                      <tr
                        key={sample.id}>
                        {SampleHeader.map(({ key }, index) => (
                          <td
                            key={index}
                            className="text-center"
                            style={{
                              maxWidth: "150px",
                              wordWrap: "break-word",
                              cursor: key === "Analyte" ? "pointer" : "default",
                              color: key === "Analyte" ? "blue" : "inherit",
                              textDecoration: key === "Analyte" ? "underline" : "none",
                              whiteSpace: "normal",
                            }}
                            onClick={(e) => {
                              if (key === "Analyte") {
                                e.stopPropagation();
                                setSelectedSample(sample);
                                setSampleShowModal(true);
                              }
                            }}
                          >
                            {["study_copy", "irb_file", "nbc_file"].includes(
                              key
                            ) ? (
                              <button
                                className={`btn btn-sm ${viewedDocuments[sample.cart_id]?.[key]
                                  ? "btn-outline-primary"
                                  : "btn-outline-primary"
                                  }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDocument(
                                    sample[key],
                                    key,
                                    sample.cart_id
                                  );
                                }}
                              >
                                Download
                                <FontAwesomeIcon icon={faDownload} size="sm" />
                              </button>
                            ) : key === "reporting_mechanism" && sample[key] ? (
                              sample[key].length > 50 ? (
                                <span
                                  className="text-primary"
                                  style={{
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedComment(sample[key]);
                                    setShowCommentModal(true);
                                  }}
                                  title={sample[key]}
                                >
                                  Click to View
                                </span>
                              ) : (
                                <span title={sample[key]}>{sample[key]}</span>
                              )
                            ) : key === "comments" && sample[key] ? (
                              sample[key].length > 50 ? (
                                <span
                                  className="text-primary"
                                  style={{
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedComment(sample[key]);
                                    setShowCommentModal(true);
                                  }}
                                  title={sample[key]}
                                >
                                  Click to View
                                </span>
                              ) : (
                                <span title={sample[key]}>{sample[key]}</span>
                              )
                            ) : (
                              sample[key] || "----"
                            )}
                          </td>
                        ))}
                        {sample.committee_status !== "Approved" && sample.committee_status !== "Refused" && (

                          <td className="text-center">
                            <div
                              className="d-flex justify-content-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {sample.committee_status !== "Refused" && (
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => handleOpenModal("Approved", sample)}
                                  title="Approve Sample"
                                >
                                  <FontAwesomeIcon icon={faCheck} size="sm" />
                                </button>
                              )}

                              {sample.committee_status !== "Approved" && (
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleOpenModal("Refused", sample)}
                                  title="Refuse Sample"
                                >
                                  <FontAwesomeIcon icon={faTimes} size="sm" />
                                </button>
                              )}
                            </div>
                          </td>
                        )}

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="30" className="text-center">
                        No samples available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>


          </Modal.Body>
        </Modal>
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
              <h5 className="fw-bold">{selectedSample.Analyte}</h5>
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
                      <strong>Price:</strong> {selectedSample.price}{" "}
                      {selectedSample.SamplePriceCurrency}
                    </p>
                    <p>
                      <strong>Volume:</strong>{" "}
                      {selectedSample.volume} {selectedSample.VolumeUnit}
                    </p>
                    <p>
                      <strong>Country of Collection:</strong>{" "}
                      {selectedSample.CountryofCollection}
                    </p>
                    {/* <p>
                        <strong>Status:</strong> {selectedSample.status}
                      </p> */}
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
                    <strong>Storage Temperature:</strong>{" "}
                    {selectedSample.storagetemp}
                  </p>
                  <p>
                    <strong>Sample Type:</strong>{" "}
                    {selectedSample.SampleTypeMatrix}
                  </p>

                  <p>
                    <strong>Test Result:</strong> {selectedSample.TestResult}{" "}
                    {selectedSample.TestResultUnit}
                  </p>
                  <p>
                    <strong>Test Method:</strong> {selectedSample.TestMethod}
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
      {showModal && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{actionType} Sample</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Enter your comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter comments here..."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant={actionType === "Approved" ? "success" : "danger"}
              onClick={handleSubmit}
            >
              Send
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Additional Mechanism Modal */}
      {showCommentModal && (
        <Modal
          show={showCommentModal}
          onHide={() => setShowCommentModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title className="h6" sty>
              Comments
            </Modal.Title>
          </Modal.Header>
          <Modal.Body
            className="overflow-auto"
            style={{ maxHeight: "600px" }}
          >
            <p>{selectedComment}</p>
          </Modal.Body>
        </Modal>
      )}


    </div>
  );
};

export default SampleArea;
