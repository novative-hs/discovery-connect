import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faExchangeAlt } from '@fortawesome/free-solid-svg-icons';

const BioBankSampleDispatchArea = () => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  }
  else {
    console.log("Collection site Id on sample page is:", id);
  }
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [samples, setSamples] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete

  const tableHeaders = [
    { label: "Sample Name", key: "samplename" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temp", key: "storagetemp" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Quantity", key: "Quantity" },
    { label: "Quantity Unit", key: "QuantityUnit" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Collection", key: "DateOfCollection" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Diagnosis Test Parameter", key: "DiagnosisTestParameter" },
    { label: "Test Result", key: "TestResult" },
    { label: "Test Result Unit", key: "TestResultUnit" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    { label: "Status", key: "status" },
  ];

  const [formData, setFormData] = useState({
    samplename: "",
    age: "",
    gender: "",
    ethnicity: "",
    samplecondition: "",
    storagetemp: "",
    ContainerType: "",
    CountryOfCollection: "",
    Quantity: "",
    QuantityUnit: "",
    SampleTypeMatrix: "",
    SmokingStatus: "",
    AlcoholOrDrugAbuse: "",
    InfectiousDiseaseTesting: "",
    InfectiousDiseaseResult: "",
    FreezeThawCycles: "",
    DateOfCollection: "",
    ConcurrentMedicalConditions: "",
    ConcurrentMedications: "",
    DiagnosisTestParameter: "",
    TestResult: "",
    TestResultUnit: "",
    TestMethod: "",
    TestKitManufacturer: "",
    TestSystem: "",
    TestSystemManufacturer: "",
    // logo: ""
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(samples.length / itemsPerPage);

  // Stock Transfer modal fields names
  const [transferDetails, setTransferDetails] = useState({
    receiverName: "",
  });

  const handleTransferClick = (sample) => {
    console.log("Transfer action for sample:", sample);
    setSelectedSampleId(sample.id); // Assuming `id` is the key for sample ID
    setShowReceiveModal(true); // Show the modal
  };

  const fetchSamples = async () => {
    try {
      // will fetch sample to correct dedicated collectionsite with correct ID
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sampledispatch/get/${id}`);
      const apiData = response.data;

      // Directly set the data array from the response
      if (apiData.data && Array.isArray(apiData.data)) {
        setSamples(apiData.data);
      } else {
        console.warn("Invalid response structure:", apiData);
        setSamples([]); // Default to an empty array
      }
    } catch (error) {
      console.error("Error fetching samples:", error);
      setSamples([]); // Default to an empty array on error
    }
  };

  // Fetch samples from backend when component loads
  useEffect(() => {

    fetchSamples(); // Call the function when the component mounts
  }, []);

  const currentData = samples.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (field, value) => {
    if (value === "") {
      fetchSamples(); // Reset to fetch original data
    } else {
      // Filter the sample array based on the field and value
      const filtered = samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
      setSamples(filtered); // Update the state with filtered results
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Update both formData and transferDetails state if applicable
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));

    setTransferDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    const { receiverName } = transferDetails;
    const userID = localStorage.getItem("userID"); // Retrieve user ID from localStorage

    // Log transfer details and selected sample ID
    console.log("Transfer Details:", transferDetails);
    console.log("Receiver Name:", receiverName);
    console.log("Selected Sample ID:", selectedSampleId);

    // Validate input before making the API call
    if (!receiverName) {
      alert("All fields are required.");
      return;
    }
    if (!userID) {
      alert("User ID is missing.");
      return;
    }

    try {
      console.log("Sending POST request to API...");
      // POST request to your backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereceive/post/${selectedSampleId}`,
        {
          receiverName,
          ReceivedByCollectionSite: userID // Pass user ID along with receiverName
        }
      );
      console.log("Sample received successfully:", response.data);

      alert("Sample received successfully!");
      console.log(`Fetching updated samples for ID: ${id}`);
      const newResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/get/${id}`
      );
      setSamples(newResponse.data); // Update state with the new list

      setShowReceiveModal(false); // Close the modal after submission
    } catch (error) {
      if (error.response) {
        // Server responded with a status other than 200
        console.error("Error response:", error.response.data);
        alert(`Error: ${error.response.data.error}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        alert("No response received from server.");
      } else {
        // Something else happened
        console.error("Error receiving sample:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleModalClose = () => {
    setShowReceiveModal(false); // Close the modal
  };

  useEffect(() => {
    if (showReceiveModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showReceiveModal]);

  return (
      <section className="profile__area pt-180 pb-120">
      <div
        className="container"
        style={{ marginTop: "-180px", width: "170%", marginLeft: "-135px" }}>
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              {/* Table */}
              <div
                className="table-responsive"
                style={{ margin: "40px auto 0 auto", width: "80%", textAlign: "center" }}>
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      {tableHeaders.map(({ label, key }, index) => (
                        <th key={index} className="px-4 text-center"
                          style={{ backgroundColor: "#F4C2C2", color: "#000" }}>
                          <div className="d-flex flex-column align-items-center">
                            <input
                              type="text"
                              className="form-control form-control-sm w-100 text-center"
                              placeholder={`Search ${label}`}
                              onChange={(e) => handleFilterChange(key, e.target.value)}
                              style={{ minWidth: "70px", maxWidth: "120px", height: "30px", padding: "2px 5px", fontSize: "14px", lineHeight: "normal" }}
                            />
                            <span className="fw-bold mt-1 d-block text-nowrap">{label}</span>
                          </div>
                        </th>
                      ))}
                      <th className="px-3 align-middle text-center"
                        style={{ backgroundColor: "#F4C2C2", color: "#000" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((sample) => (
                        <tr key={sample.id}>
                          {tableHeaders.map(({ key }, index) => (
                            <td key={index}>{sample[key] || "N/A"}</td>
                          ))}
                          <td>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                                gap: "3px",
                              }}
                            >
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleEditClick(sample)}
                              >
                                <FontAwesomeIcon icon={faEdit} size="sm" />
                              </button>{" "}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedSampleId(sample.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <FontAwesomeIcon icon={faTrash} size="sm" />
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleTransferClick(sample)}
                              >
                                <FontAwesomeIcon icon={faExchangeAlt} size="sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No samples available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination d-flex justify-content-end align-items-center mt-4 me-5 pe-5">
                <nav aria-label="Page navigation example">
                  <ul className="pagination justify-content-end">
                    <li
                      className={`page-item ${currentPage === 1 ? "disabled" : ""
                        }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Previous"
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                      >
                        <span aria-hidden="true">&laquo;</span>
                        <span className="sr-only">Previous</span>
                      </a>
                    </li>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${currentPage === pageNumber ? "active" : ""
                            }`}
                        >
                          <a
                            className="page-link"
                            href="#"
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </a>
                        </li>
                      );
                    })}
                    <li
                      className={`page-item ${currentPage === totalPages ? "disabled" : ""
                        }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Next"
                        onClick={() =>
                          currentPage < totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                      >
                        <span aria-hidden="true">&raquo;</span>
                        <span className="sr-only">Next</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Modal for receiving Samples */}
              {showReceiveModal && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1050,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#fff",
                      padding: "20px",
                      borderRadius: "8px",
                      width: "90%",
                      maxWidth: "400px",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                      zIndex: 1100,
                    }}
                  >
                    <h5 style={{ marginBottom: "20px", textAlign: "center" }}>Receive Stock</h5>
                    <form>
                      <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Receiver Name</label>
                        <input
                          type="text"
                          name="receiverName"
                          value={transferDetails.receiverName}
                          onChange={handleInputChange}
                          placeholder="Enter Receiver Name"
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                        <button
                          type="button"
                          onClick={handleModalClose}
                          style={{
                            padding: "10px 15px",
                            backgroundColor: "#ccc",
                            color: "#000",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleTransferSubmit}
                          style={{
                            padding: "10px 15px", backgroundColor: "#007bff", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer",
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
    </section>
  );
};

export default BioBankSampleDispatchArea;