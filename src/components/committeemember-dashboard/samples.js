import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  
  faFilePdf,
  
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import { getLocalStorage } from "@utils/localstorage";

const SampleArea = () => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Committee Member Id on sample page is:", id);
  }
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(""); // "Approved" or "Refused"
  const [comment, setComment] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const[showCommentModal,setShowCommentModal]=useState(false)
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete
  const [filteredSamplename, setFilteredSamplename] = useState([]); // Store filtered cities
  const tableHeaders = [
    { label: "Order ID", key: "cart_id" },
    { label: "User Name", key: "researcher_name" },
    { label: "Sample Name", key: "samplename" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Status", key: "committee_status" },
    {label:"Comments",key:"comments"}
  ];

  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState("");

  // Sample Dropdown Fields

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const [showSampleModal, setSampleShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  // Fetch samples from backend when component loads
  useEffect(() => {
    fetchSamples(); // Call the function when the component mounts
  }, []);

  const fetchSamples = async () => {
    try {
      console.log("Fetching samples...");

      if (!id) {
        console.error("ID is missing.");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyCommittee/${id}`
      );

      // Update state
      setSamples(response.data);
      console.log(response.data);
      setFilteredSamplename(response.data);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredSamplename.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredSamplename]);

  // Get the current data for the table
  const currentData = filteredSamplename.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = samples; // Show all if filter is empty
    } else {
      filtered = samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredSamplename(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
  };
  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/delete/${selectedSampleId}`
      );
      console.log(`Sample with ID ${selectedSampleId} deleted successfully.`);

      // Set success message
      setSuccessMessage("Sample deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      fetchSamples(); // This will refresh the samples list

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedSampleId(null);
    } catch (error) {
      console.error(
        `Error deleting sample with ID ${selectedSampleId}:`,
        error
      );
    }
  };
  const handleOpenModal = (type, sample) => {
    if (!sample) {
      alert("Sample data is missing.");
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
    setComment(""); // Clear comment
  };
  const handleSubmit = async () => {
    const trimmedComment = comment.trim(); // Trim spaces and new lines
  
    if (!id|| !selectedSample || !trimmedComment) {
      alert("Please enter a comment.");
      return;
    }
  
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeesampleapproval/${selectedSample.cart_id}/committee-approval`, 
        {
          committee_member_id:id,
          committee_status: actionType, // "Approved" or "Refused"
          comments: trimmedComment, // Send trimmed comment
        }
      );
  
      if (response.status === 200) {
        alert(`Sample ${actionType} successfully!`);
        setShowModal(false);
        setComment(""); // Clear the comment field
        fetchSamples(); // Refresh the data
      }
    } catch (error) {
      console.error("Error updating committee status:", error);
      alert("Failed to update sample status.");
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
          Samples for Approval
        </h4>
        {/* <div className="profile__main-content">
                <h4 className="profile__main-title text-capitalize">Welcome Committee Member</h4>
              </div>
              <div className="profile__main-content">
                <h4 className="profile__main-title text-capitalize">Order Sample verify list</h4>
              </div> */}
        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle w-auto border">
            <thead className="table-primary text-dark">
              <tr className="text-center">
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">
                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                        placeholder={`Search ${label}`}
                        onChange={(e) =>
                          handleFilterChange(key, e.target.value)
                        }
                        style={{ minWidth: "150px" }}
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
                    key={sample.id} // Ensure unique key
                    onClick={() => {
                      setSelectedSample(sample);
                      setSampleShowModal(true);
                    }}
                    style={{ cursor: "pointer" }} // Pointer cursor to indicate clickable row
                  >
                {tableHeaders.map(({ key }, index) => (
  <td
    key={index}
    className="text-center text-truncate"
    style={{ maxWidth: "150px" }}
  >
    {/* Format Date of Collection */}
    {key === "DateofCollection" && sample[key]
      ? new Date(sample[key]).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : key === "price" && sample[key]
      ? `${sample["SamplePriceCurrency"] || "$"} ${sample[key]}`
      : key === "comments" && sample[key]
      ? sample[key].length > 50 ? (
          <>
            <span
              className="text-primary"
              style={{ cursor: "pointer", textDecoration: "underline" }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedComment(sample[key]);
                setShowCommentModal(true);
              }}
            >
              Click to View
            </span>
          </>
        ) : (
          sample[key]
        )
      : sample[key] || "N/A"}
  </td>
))}

{/* Comment Modal */}
{showCommentModal && (
  <div className="modal fade show d-block" tabIndex="-1">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Committee Comments</h5>
          <button type="button" className="btn-close" onClick={() => setShowCommentModal(false)}></button>
        </div>
        <div className="modal-body">
          <p>{selectedComment}</p>
        </div>
      </div>
    </div>
  </div>
)}


                    <td className="text-center">
                      <div
                        className="d-flex justify-content-center gap-2"
                        onClick={(e) => e.stopPropagation()} // ✅ Prevent row click event from triggering when clicking buttons
                      >
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() =>
                            window.open(
                              "https://example.com/sample.pdf",
                              "_blank"
                            )
                          }
                          title="View PDF Documents"
                        >
                          <FontAwesomeIcon
                           size="sm"
                            icon={faFilePdf}
                          />
                        </button>

                        <button
  className="btn btn-outline-success btn-sm"
  onClick={() => handleOpenModal("Approved", sample)} // Pass sample
  title="Approve Sample"
>
  <FontAwesomeIcon icon={faCheck} size="sm" />
</button>

<button
  className="btn btn-outline-danger btn-sm"
  onClick={() => handleOpenModal("Refused", sample)} // Pass sample
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
      <Button variant={actionType === "Approved" ? "success" : "danger"} onClick={handleSubmit}>
        Send
      </Button>
    </Modal.Footer>
  </Modal>
)}


        {/* Pagination */}
        {totalPages >= 0 && (
          <Pagination
            handlePageClick={handlePageChange}
            pageCount={totalPages}
            focusPage={currentPage}
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
        {showDeleteModal && (
          <>
            {/* Bootstrap Backdrop with Blur */}
            <div
              className="modal-backdrop fade show"
              style={{ backdropFilter: "blur(5px)" }}
            ></div>

            {/* Modal Content */}
            <div
              className="modal show d-block"
              tabIndex="-1"
              role="dialog"
              style={{
                zIndex: 1050,
                position: "fixed",
                top: "120px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Delete Sample</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowDeleteModal(false)}
                      style={{
                        // background: 'none',
                        // border: 'none',
                        fontSize: "1.5rem",
                        position: "absolute",
                        right: "10px",
                        top: "10px",
                        cursor: "pointer",
                      }}
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                    <p>Are you sure you want to unapproved this sample?</p>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-danger" onClick={handleDelete}>
                      Delete
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowDeleteModal(false)}
                    >
                      Cancel
                    </button>
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
