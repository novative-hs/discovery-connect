import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faCheck, faTimes, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import { notifyError, notifySuccess } from "@utils/toast";

const SampleArea = () => {
  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Committee Member Id on sample page is:", id);
  }
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); 
  const [comment, setComment] = useState("");
const[selectedComment,setSelectedComment]=useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [filteredSamplename, setFilteredSamplename] = useState([]); // Store filtered sample name

  const [viewedDocuments, setViewedDocuments] = useState({});
  const tableHeaders = [
    { label: "Order ID", key: "cart_id" },
    { label: "User Name", key: "researcher_name" },
    { label: "Sample Name", key: "samplename" },
    // { label: "Age", key: "age" },
    // { label: "Gender", key: "gender" },
    { label: "Comments", key: "comments" },
    { label: "Additional Mechanism", key: "reporting_mechanism" },
    { label: "Study Copy", key: "study_copy" },
    { label: "IRB file", key: "irb_file" },
    { label: "NBC file", key: "nbc_file" },
    { label: "Status", key: "committee_status" },
  ];

  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState("");

  // Sample Dropdown Fields

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const [showSampleModal, setSampleShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [searchField, setSearchField] = useState("");
  const [searchValue, setSearchValue] = useState("");
  
  // Fetch samples from backend when component loads
  useEffect(() => {
    fetchSamples(currentPage, itemsPerPage, {
      
      searchField,
      searchValue,
    });
  }, [currentPage, searchField, searchValue]);

   const fetchSamples = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const { searchField, searchValue } = filters;
      if (!id) {
        console.error("ID is missing.");
        return;
      }

      let responseurl =`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyCommittee/${id}?page=${page}&pageSize=${pageSize}`

      if (searchField && searchValue) {
        responseurl += `&searchField=${searchField}&searchValue=${searchValue}`;
      }
  
      const response = await axios.get(responseurl);
      const { results: sampledata, totalCount: totalCount } = response.data;
      console.log(sampledata)
      // Update state
      setSamples(sampledata);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setFilteredSamplename(sampledata);

    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

 useEffect(() => {
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages); // Adjust down if needed
      }
    }, [totalPages]);

  // Get the current data for the table
  const currentData = filteredSamplename;

 
  const handlePageChange = (event) => {
    const selectedPage = event.selected + 1; // React Paginate is 0-indexed, so we adjust
    setCurrentPage(selectedPage); // This will trigger the data change based on selected page
  };

  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchField(field);
    setSearchValue(trimmedValue);
    setCurrentPage(1); // Reset to page 1 — this triggers fetch in useEffect
  };
  const handleViewComment = (comment) => {
    setSelectedComment(comment); // Set the comment to be viewed
    setShowCommentModal(true); // Open the modal to display the comment
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
        notifySuccess(response.data.message)
        setShowModal(false);
        setComment("");
        fetchSamples(); 
        setCurrentPage(1)
      } else {
        notifyError("Failed to update committee status. Please try again.")
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
      const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
  
      if (bottom && currentPage < totalPages) {
        setCurrentPage((prevPage) => prevPage + 1); // Trigger fetch for next page
        fetchSamples(currentPage + 1); // Fetch more data if bottom is reached
      }
    }
  };

  useEffect(() => {
    if (showModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success w-100 text-start mb-2 small">
            {successMessage}
          </div>
        )}
        <h4 className="tp-8 fw-bold text-success text-center pb-2">
        Sample Orders & Documents
        </h4>
        {/* <div className="profile__main-content">
                <h4 className="profile__main-title text-capitalize">Welcome Committee Member</h4>
              </div>
              <div className="profile__main-content">
                <h4 className="profile__main-title text-capitalize">Order Sample verify list</h4>
              </div> */}
        {/* Table */}
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
                    onChange={(e) => handleFilterChange(key, e.target.value)}
                    style={{ minWidth: "100px" }}  // Adjusted minWidth
                  />
                  <span className="fw-bold mt-1 d-block text-nowrap align-items-center fs-10">
                    {label}
                  </span>
                </div>
              </th>
            ))}
            <th className="p-2 text-center" style={{ minWidth: "120px" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody className="table-light">
          {currentData.length > 0 ? (
            currentData.map((sample) => (
              <tr
                key={sample.id}
                onClick={() => {
                  setSelectedSample(sample);
                  setSampleShowModal(true);
                }}
                style={{ cursor: "pointer" }}
              >
                {tableHeaders.map(({ key }, index) => (
                  <td
                    key={index}
                    className="text-center"
                    style={{
                      maxWidth: "150px", // Limit max width for each cell
                      wordWrap: "break-word",
                      whiteSpace: "normal", // Allow wrapping of long content
                    }}
                  >
                    {["study_copy", "irb_file", "nbc_file"].includes(key) ? (
                      <button
                        className={`btn btn-sm ${
                          viewedDocuments[sample.cart_id]?.[key]
                            ? "btn-outline-primary"
                            : "btn-outline-primary"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDocument(sample[key], key, sample.cart_id);
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
                    ) :  key === "comments" && sample[key] ? (
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
                    ):
                    (
                      sample[key] || "N/A"
                    )}
                  </td>
                ))}
                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleOpenModal("Approved", sample)}
                      title="Approve Sample"
                    >
                      <FontAwesomeIcon icon={faCheck} size="sm" />
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleOpenModal("Refused", sample)}
                      title="Refuse Sample"
                    >
                      <FontAwesomeIcon icon={faTimes} size="sm" />
                    </button>
                  </div>
                </td>
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
{showCommentModal && (
  <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Comment</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>{selectedComment}</p>
    </Modal.Body>
  </Modal>
)}

        {/* Pagination */}
        {totalPages >= 0 && (
          <Pagination
            handlePageClick={handlePageChange}
            pageCount={totalPages}
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
                overflow: "hidden", // Prevent scrolling
              }}
            >
              {/* Modal Header */}
              <div className="modal-header d-flex justify-content-between align-items-center" style={{ backgroundColor: "#cfe2ff", color: "#000" }}>
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
                        <strong>Price:</strong> {selectedSample.price}{" "}
                        {selectedSample.SamplePriceCurrency}
                      </p>
                      <p>
                        <strong>Quantity unit:</strong>{" "}
                        {selectedSample.QuantityUnit}
                      </p>
                      <p>
                        <strong>Country of Collection:</strong>{" "}
                        {selectedSample.CountryofCollection
                        }
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
                      <strong>Diagnosis Test Parameter:</strong>{" "}
                      {selectedSample.DiagnosisTestParameter}
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
      </div>
    </section>
  );
};

export default SampleArea;
