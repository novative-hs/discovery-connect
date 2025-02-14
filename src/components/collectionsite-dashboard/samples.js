import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import { getLocalStorage } from "@utils/localstorage";

const SampleArea = () => {
  const id = localStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Collection site Id on sample page is:", id);
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete

  const [formData, setFormData] = useState({
    donorID: "",
    samplename: "",
    age: "",
    gender: "",
    ethnicity: "",
    samplecondition: "",
    storagetemp: "",
    ContainerType: "",
    CountryOfCollection: "",
    quantity: "",
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
    status: "In Stock",
    user_account_id: id,
  });
  const tableHeaders = [
    { label: "ID", key: "id" },
    { label: "Master ID", key: "masterID" },
    { label: "Donor ID", key: "donorID" },
    { label: "Sample Name", key: "samplename" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temp", key: "storagetemp" },
    { label: "Storage Temp Unit", key: "storagetempUnit" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Price", key: "price" },
    { label: "Sample Price Currency", key: "SamplePriceCurrency" },
    { label: "Quantity", key: "quantity" },
    { label: "Quantity Unit", key: "QuantityUnit" },
    { label: "Lab Name", key: "labname" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Type Matrix Subtype", key: "TypeMatrixSubtype" },
    { label: "Procurement Type", key: "ProcurementType" },
    { label: "End Time", key: "endTime" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Result", key: "TestResult" },
    { label: "Test Result Unit", key: "TestResultUnit" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Cut Off Range", key: "CutOffRange" },
    { label: "Cut Off Range Unit", key: "CutOffRangeUnit" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Collection", key: "DateOfCollection" },
    {
      label: "Concurrent Medical Conditions",
      key: "ConcurrentMedicalConditions",
    },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Diagnosis Test Parameter", key: "DiagnosisTestParameter" },
    { label: "Result Remarks", key: "ResultRemarks" },
    { label: "Test Kit", key: "TestKit" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    { label: "Discount", key: "discount" },
    { label: "Status", key: "status" },
  ];
  const [editSample, setEditSample] = useState(null); // State for selected sample to edit
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState("");
  const [collectionSiteNames, setCollectionSiteNames] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(samples.length / itemsPerPage);

  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     // You can add logic here to upload the file or store it in formData
  //     setFormData({
  //       ...formData,
  //       logo: file,
  //     });
  //   }
  // };

  // Stock Transfer modal fields names
  const [transferDetails, setTransferDetails] = useState({
    TransferTo: id,
    dispatchVia: "",
    dispatcherName: "",
    dispatchReceiptNumber: "",
    Quantity: "",
  });

  const handleTransferClick = (sample) => {
    console.log("Transfer action for:", sample);
    setSelectedSampleId(sample.id);
    setShowTransferModal(true);
  };

  // Fetch samples from backend when component loads
  useEffect(() => {
    const storedUser = getLocalStorage("user");
    console.log("Logged-in user:", storedUser);
    fetchSamples(); // Call the function when the component mounts
  }, []);

  const fetchSamples = async () => {
    try {
      console.log("Fetching samples...");

      // Fetch samples added by this collection site
      const ownSamplesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/get/${id}`
      );
      console.log("Own samples:", ownSamplesResponse.data);
      const ownSamples = ownSamplesResponse.data.map((sample) => ({
        ...sample,
        quantity: sample.quantity, // Use 'quantity' as is
      }));

      // //Fetch samples received by this collection site
      // const receivedSamplesResponse = await axios.get(
      //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereceive/get/${id}`
      // );
      // console.log("Received samples:", receivedSamplesResponse.data);
      // const receivedSamples = receivedSamplesResponse.data.map((sample) => ({
      //   ...sample,
      //   quantity: sample.Quantity, // Map 'Quantity' to 'quantity'
      // }));

     // Combine both responses
      const combinedSamples = [...ownSamples];

      // Update state with the combined list
      setSamples(combinedSamples);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  useEffect(() => {
    const fetchCollectionSiteNames = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/collectionsite/collectionsitenames/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch collection site names");
        }
        const data = await response.json();
        console.log("Fetched Site Names:", data);
        setCollectionSiteNames(data.data);
      } catch (error) {
        console.error("Error fetching site names:", error);
      }
    };

    fetchCollectionSiteNames();
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST request to your backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/postsample`,
        formData
      );
      console.log("Sample added successfully:", response.data);

      fetchSamples(); // This will refresh the samples list

      setSuccessMessage("Sample added successfully.");

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Clear form after submission
      resetFormData();

      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding sample:", error);
    }
  };

  const resetFormData = () => {
    setFormData({
      donorID: "",
      samplename: "",
      age: "",
      gender: "",
      ethnicity: "",
      samplecondition: "",
      storagetemp: "",
      ContainerType: "",
      CountryOfCollection: "",
      quantity: "",
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
      status: "",
      user_account_id: id,
    });
  };
  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    const {
      TransferTo,
      dispatchVia,
      dispatcherName,
      dispatchReceiptNumber,
      Quantity,
    } = transferDetails;

    // Validate input before making the API call
    if (
      !TransferTo ||
      !dispatchVia ||
      !dispatcherName ||
      !dispatchReceiptNumber ||
      !Quantity
    ) {
      alert("All fields are required.");
      return;
    }

    try {
      // POST request to your backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sampledispatch/post/${selectedSampleId}`,
        {
          TransferTo,
          dispatchVia,
          dispatcherName,
          dispatchReceiptNumber,
          Quantity,
        }
      );
      console.log("Sample dispatched successfully:", response.data);

      alert("Sample dispatched successfully!");
      const newResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/get/${id}`
      );
      setSamples(newResponse.data); // Update state with the new list

      setShowTransferModal(false); // Close the modal after submission
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
        console.error("Error dispatching sample:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleModalClose = () => {
    setShowTransferModal(false); // Close the modal
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
  const handleEditClick = (sample) => {
    setSelectedSampleId(sample.id);
    setEditSample(sample);
    setShowEditModal(true);
    setFormData({
      donorID: sample.donorID,
      samplename: sample.samplename,
      age: sample.age,
      gender: sample.gender,
      ethnicity: sample.ethnicity,
      samplecondition: sample.samplecondition,
      storagetemp: sample.storagetemp,
      ContainerType: sample.ContainerType,
      CountryOfCollection: sample.CountryOfCollection,
      quantity: sample.quantity,
      QuantityUnit: sample.QuantityUnit,
      SampleTypeMatrix: sample.SampleTypeMatrix,
      SmokingStatus: sample.SmokingStatus,
      AlcoholOrDrugAbuse: sample.AlcoholOrDrugAbuse,
      InfectiousDiseaseTesting: sample.InfectiousDiseaseTesting,
      InfectiousDiseaseResult: sample.InfectiousDiseaseResult,
      FreezeThawCycles: sample.FreezeThawCycles,
      DateOfCollection: sample.DateOfCollection,
      ConcurrentMedicalConditions: sample.ConcurrentMedicalConditions,
      ConcurrentMedications: sample.ConcurrentMedications,
      DiagnosisTestParameter: sample.DiagnosisTestParameter,
      TestResult: sample.TestResult,
      TestResultUnit: sample.TestResultUnit,
      TestMethod: sample.TestMethod,
      TestKitManufacturer: sample.TestKitManufacturer,
      TestSystem: sample.TestSystem,
      TestSystemManufacturer: sample.TestSystemManufacturer,
      status: sample.status,
      user_account_id: sample.user_account_id,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/edit/${selectedSampleId}`,
        formData
      );
      console.log("Sample updated successfully:", response.data);

      fetchSamples(); // This will refresh the samples list

      setShowEditModal(false);
      setSuccessMessage("Sample updated successfully.");

      // Reset formData after update
      resetFormData();
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating sample with ID ${selectedSampleId}:`,
        error
      );
    }
  };
  useEffect(() => {
    if (showDeleteModal || showAddModal || showEditModal || showTransferModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showDeleteModal, showAddModal, showEditModal, showTransferModal]);

  return (
    <section className="policy__area pb-120 overflow-hidden">
      <div className="container-fluid mt-n5">
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-md-10">
            <div className="policy__wrapper policy__translate position-relative mt-5">
              {/* {Button} */}
              <div className="d-flex flex-column w-100">
                {/* Success Message */}
                {successMessage && (
                  <div
                    className="alert alert-success w-100 text-start mb-2"
                    role="alert"
                  >
                    {successMessage}
                  </div>
                )}
              </div>
              {/* Add Samples Button */}
              <div className="d-flex justify-content-end align-items-center gap-2 w-100">
                {/* Add Country Button */}
                <button
                  className="btn btn-primary mb-2"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Sample
                </button>
              </div>

              {/* Table */}
              <div className="table-responsive w-100">
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      {tableHeaders.map(({ label, key }, index) => (
                        <th key={index} className="px-4 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <input
                              type="text"
                              className="form-control form-control-sm w-100 text-center"
                              placeholder={`Search ${label}`} 
                              onChange={(e) =>
                                handleFilterChange(key, e.target.value)
                              }
                              style={{ minWidth: "140px" }}
                            />

                            <span className="fw-bold mt-1 d-block text-nowrap">
                              {label}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="px-3 align-middle text-center">Action</th>
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
                            <div className="d-flex justify-content-around gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleEditClick(sample)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedSampleId(sample.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleTransferClick(sample)}
                              >
                                <i className="fas fa-exchange-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={tableHeaders.length + 1}
                          className="text-center"
                        >
                          No samples available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination d-flex justify-content-end align-items-center mt-3">
                <nav aria-label="Page navigation example">
                  <ul className="pagination justify-content-end">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
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
                          className={`page-item ${
                            currentPage === pageNumber ? "active" : ""
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
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
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
              {/* Modal for Adding and Editing Samples */}
              {(showAddModal || showEditModal) && (
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
                    <div
                      className="modal-dialog"
                      role="document"
                      style={{ maxWidth: "100%", width: "80vw" }}
                    >
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">
                            {showAddModal ? "Add Sample" : "Edit Sample"}
                          </h5>
                          <button
                            type="button"
                            className="close"
                            onClick={() => {
                              setShowAddModal(false);
                              setShowEditModal(false);
                              resetFormData();
                            }}
                            style={{
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
                        <form
                          onSubmit={showAddModal ? handleSubmit : handleUpdate}
                        >
                          <div className="modal-body">
                            {/* Parallel Columns - 5 columns */}
                            <div className="d-flex flex-wrap gap-3">
                              {/* Column 1 */}
                              <div className="flex-fill">
                                <div className="form-group">
                                  <label>Donor ID</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="donorID"
                                    value={formData.donorID}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Sample Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="samplename"
                                    value={formData.samplename}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Age</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Gender</label>
                                  <select
                                    className="form-control"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                  >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                  </select>
                                </div>
                                <div className="form-group">
                                  <label>Ethnicity</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="ethnicity"
                                    value={formData.ethnicity}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Sample Condition</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="samplecondition"
                                    value={formData.samplecondition}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                              </div>
                              {/* Column 2 */}
                              <div className="flex-fill">
                                <div className="form-group">
                                  <label>Storage Temperature</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="storagetemp"
                                    value={formData.storagetemp}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Container Type</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="ContainerType"
                                    value={formData.ContainerType}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Country Of Collection</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="CountryOfCollection"
                                    value={formData.CountryOfCollection}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Quantity</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                              </div>
                              {/* {Column 3} */}
                              <div className="flex-fill">
                                <div className="form-group">
                                  <label>Quantity Unit</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="QuantityUnit"
                                    value={formData.QuantityUnit}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Sample Type Matrix</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="SampleTypeMatrix"
                                    value={formData.SampleTypeMatrix}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label className="form-label">
                                    Smoking Status
                                  </label>
                                  <div>
                                    <div className="form-check form-check-inline">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="SmokingStatus"
                                        value="Smoker"
                                        checked={
                                          formData.SmokingStatus === "Smoker"
                                        }
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                        }} // Reduced size
                                      />
                                      <label className="form-check-label fs-6">
                                        Smoker
                                      </label>
                                    </div>

                                    <div className="form-check form-check-inline ms-3">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="SmokingStatus"
                                        value="Non-Smoker"
                                        checked={
                                          formData.SmokingStatus ===
                                          "Non-Smoker"
                                        }
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                        }} // Reduced size
                                      />
                                      <label className="form-check-label fs-6">
                                        Non-Smoker
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                <div className="form-group">
                                  <label className="form-label">
                                    Alcohol Or Drug Abuse
                                  </label>
                                  <div>
                                    <div className="form-check form-check-inline">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="AlcoholOrDrugAbuse"
                                        value="Yes"
                                        checked={
                                          formData.AlcoholOrDrugAbuse === "Yes"
                                        }
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                        }} // Reduced size
                                      />
                                      <label className="form-check-label fs-6">
                                        Yes
                                      </label>
                                    </div>

                                    <div className="form-check form-check-inline ms-3">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="AlcoholOrDrugAbuse"
                                        value="No"
                                        checked={
                                          formData.AlcoholOrDrugAbuse === "No"
                                        }
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                        }} // Reduced size
                                      />
                                      <label className="form-check-label fs-6">
                                        No
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                <div className="form-group">
                                  <label>Infectious Disease Testing</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="InfectiousDiseaseTesting"
                                    value={formData.InfectiousDiseaseTesting}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label className="form-label">
                                    Infectious Disease Result
                                  </label>
                                  <div>
                                    <div className="form-check form-check-inline">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="InfectiousDiseaseResult"
                                        value="Positive"
                                        checked={
                                          formData.InfectiousDiseaseResult ===
                                          "Positive"
                                        }
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                        }} // Reduced size
                                      />
                                      <label className="form-check-label fs-6">
                                        Positive
                                      </label>
                                    </div>

                                    <div className="form-check form-check-inline ms-3">
                                      <input
                                        className="form-check-input"
                                        type="radio"
                                        name="InfectiousDiseaseResult"
                                        value="Negative"
                                        checked={
                                          formData.InfectiousDiseaseResult ===
                                          "Negative"
                                        }
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                          width: "14px",
                                          height: "14px",
                                        }} // Reduced size
                                      />
                                      <label className="form-check-label fs-6">
                                        Negative
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              {/* Column 4 */}
                              <div className="flex-fill">
                                <div className="form-group">
                                  <label>Freeze Thaw Cycles</label>
                                  <select
                                    className="form-control"
                                    name="FreezeThawCycles"
                                    value={formData.FreezeThawCycles || ""}
                                    onChange={handleInputChange}
                                    required
                                  >
                                    <option value="">Select an option</option>
                                    <option value="None">None</option>
                                    <option value="One">One</option>
                                    <option value="Two">Two</option>
                                    <option value="Three">Three</option>
                                    <option value="Four">Four</option>
                                  </select>
                                </div>

                                <div className="form-group">
                                  <label>Date Of Collection</label>
                                  <input
                                    type="date"
                                    className="form-control"
                                    name="DateOfCollection"
                                    value={formData.DateOfCollection}
                                    onChange={handleInputChange}
                                    max={new Date().toISOString().split("T")[0]} // Set max to today’s date
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Concurrent Medical Conditions</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="ConcurrentMedicalConditions"
                                    value={formData.ConcurrentMedicalConditions}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Concurrent Medications</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="ConcurrentMedications"
                                    value={formData.ConcurrentMedications}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Diagnosis Test Parameter</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="DiagnosisTestParameter"
                                    value={formData.DiagnosisTestParameter}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Test Result</label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    name="TestResult"
                                    value={formData.TestResult}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                              </div>
                              {/* {Column 5} */}
                              <div className="flex-fill">
                                <div className="form-group">
                                  <label>Test Result Unit</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="TestResultUnit"
                                    value={formData.TestResultUnit}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Test Method</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="TestMethod"
                                    value={formData.TestMethod}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Test Kit Manufacturer</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="TestKitManufacturer"
                                    value={formData.TestKitManufacturer}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Test System</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="TestSystem"
                                    value={formData.TestSystem}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Test System Manufacturer</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="TestSystemManufacturer"
                                    value={formData.TestSystemManufacturer}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div>
                                {/* <div className="form-group">
                                  <label>Image</label>
                                  <input
                                    type="file"
                                    className="form-control"
                                    name="logo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                  />
                                </div> */}
                              </div>
                            </div>
                          </div>
                          <div className="modal-footer">
                            <button type="submit" className="btn btn-primary">
                              {showAddModal ? "Save" : "Update Sample"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal for transfreing Samples */}
              {showTransferModal && (
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
                    <h5 style={{ marginBottom: "20px", textAlign: "center" }}>
                      Stock Transfer
                    </h5>
                    <form>
                      {/* <div style={{ marginBottom: "15px" }}>
                        <label style={{ display: "block", marginBottom: "5px" }}>Transfer From</label>
                        <select
                          name="TransferFrom"
                          value={transferDetails.TransferFrom}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        >
                          <option value="">Select</option>
                          {collectionSiteNames.map((site, index) => (
                             <option key={site.user_account_id} value={site.user_account_id}>
                             {site.CollectionSiteName}
                           </option>
                          ))}
                        </select>
                      </div> */}
                      <div style={{ marginBottom: "15px" }}>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
                          Transfer to Collection Site
                        </label>
                        <select
                          name="TransferTo"
                          value={transferDetails.TransferTo}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        >
                          <option value="">Select</option>
                          {collectionSiteNames.map((site, index) => (
                            <option
                              key={site.user_account_id}
                              value={site.user_account_id}
                            >
                              {site.CollectionSiteName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={{ marginBottom: "15px" }}>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
                          Dispatch Via
                        </label>
                        <select
                          name="dispatchVia"
                          value={transferDetails.dispatchVia}
                          onChange={handleInputChange}
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        >
                          <option value="">Select</option>
                          <option value="Courier">Courier</option>
                          <option value="By Hand">By Hand</option>
                        </select>
                      </div>
                      <div style={{ marginBottom: "15px" }}>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
                          Dispatcher Name
                        </label>
                        <input
                          type="text"
                          name="dispatcherName"
                          value={transferDetails.dispatcherName}
                          onChange={handleInputChange}
                          placeholder="Enter Dispatcher Name"
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: "15px" }}>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
                          Dispatch Receipt Number
                        </label>
                        <input
                          type="text"
                          name="dispatchReceiptNumber"
                          value={transferDetails.dispatchReceiptNumber}
                          onChange={handleInputChange}
                          placeholder="Enter Receipt Number"
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: "15px" }}>
                        <label
                          style={{ display: "block", marginBottom: "5px" }}
                        >
                          Quantity
                        </label>
                        <input
                          type="number"
                          name="Quantity"
                          value={transferDetails.Quantity}
                          onChange={handleInputChange}
                          placeholder="Enter Quantity"
                          style={{
                            width: "100%",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #ccc",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "20px",
                        }}
                      >
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
                            padding: "10px 15px",
                            backgroundColor: "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Modal for Deleting Samples */}
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
                          <p>Are you sure you want to delete this sample?</p>
                        </div>
                        <div className="modal-footer">
                          <button
                            className="btn btn-danger"
                            onClick={handleDelete}
                          >
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleArea;
