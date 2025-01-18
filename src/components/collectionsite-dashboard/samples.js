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
  }
  else{
    console.log("Collection site Id on sample page is:", id);
  }
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete

  const [formData, setFormData] = useState({
    masterID: "",
    donorID: "",
    samplename: "",
    age: "",
    gender: "",
    ethnicity: "",
    samplecondition: "",
    storagetemp: "",
    storagetempUnit: "",
    ContainerType: "",
    CountryOfCollection: "",
    price: "",
    SamplePriceCurrency: "",
    quantity: "",
    QuantityUnit: "",
    labname: "",
    SampleTypeMatrix: "",
    TypeMatrixSubtype: "",
    ProcurementType: "",
    SmokingStatus: "",
    TestMethod: "",
    TestResult: "",
    TestResultUnit: "",
    InfectiousDiseaseTesting: "",
    InfectiousDiseaseResult: "",
    status: "In Stock",
    CutOffRange: "",
    CutOffRangeUnit: "",
    FreezeThawCycles: "",
    DateOfCollection: "",
    ConcurrentMedicalConditions: "",
    ConcurrentMedications: "",
    AlcoholOrDrugAbuse: "",
    DiagnosisTestParameter: "",
    ResultRemarks: "",
    TestKit: "",
    TestKitManufacturer: "",
    TestSystem: "",
    TestSystemManufacturer: "",
    endTime: "",
    user_account_id: id,
  });

  const [editSample, setEditSample] = useState(null); // State for selected sample to edit
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState("");
  const [collectionSiteNames, setCollectionSiteNames] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(samples.length / itemsPerPage);

  // Stock Transfer modal fields names
  const [transferDetails, setTransferDetails] = useState({
    TransferTo: id,
    dispatchVia: "",
    dispatcherName: "",
    dispatchReceiptNumber: "",
  });

  const handleTransferClick = (sample) => {
    console.log("Transfer action for:", sample);
    setSelectedSampleId(sample.id);
    setShowTransferModal(true); // Show the modal
  };

  // Fetch samples from backend when component loads
  useEffect(() => {
    const storedUser = getLocalStorage("user");
    console.log("Logged-in user:", storedUser);
    fetchSamples(); // Call the function when the component mounts
  }, []);

  const fetchSamples = async () => {
    try {
      console.log('Fetching samples...'); // Log before sending request
      const response = await axios.get(`http://localhost:5000/api/sample/get/${id}`);
      console.log('Response received:', response.data); // Log response
      setSamples(response.data); // Store fetched samples in state
    } catch (error) {
      console.error('Error fetching samples:', error); // Log any error
    }
  };

  useEffect(() => {
    const fetchCollectionSiteNames = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/collectionsite/collectionsitenames');
        if (!response.ok) {
          throw new Error('Failed to fetch collection site names');
        }
        const data = await response.json();
        console.log('Fetched Site Names:', data); // Debugging
        // Assuming 'data' contains a key 'data' with the site names
        setCollectionSiteNames(data.data); // Use data.data to get the collection site names
      } catch (error) {
        console.error('Error fetching site names:', error);
      }
    };
 
    fetchCollectionSiteNames();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST request to your backend API
      const response = await axios.post(
        "http://localhost:5000/api/samples/post",
        formData
      );
      console.log("Sample added successfully:", response.data);

      // Refresh the sample list after successful submission
      const newResponse = await axios.get(
        `http://localhost:5000/api/sample/get/${id}`
      );
      setSamples(newResponse.data); // Update state with the new list

      setSuccessMessage("Sample added successfully.");

      // Clear the success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Clear form after submission
      setFormData({
        masterID: "",
        donorID: "",
        samplename: "",
        age: "",
        gender: "",
        ethnicity: "",
        samplecondition: "",
        storagetemp: "",
        storagetempUnit: "",
        ContainerType: "",
        CountryOfCollection: "",
        price: "",
        SamplePriceCurrency: "",
        quantity: "",
        QuantityUnit: "",
        labname: "",
        SampleTypeMatrix: "",
        TypeMatrixSubtype: "",
        ProcurementType: "",
        SmokingStatus: "",
        TestMethod: "",
        TestResult: "",
        TestResultUnit: "",
        InfectiousDiseaseTesting: "",
        InfectiousDiseaseResult: "",
        CutOffRange: "",
        CutOffRangeUnit: "",
        FreezeThawCycles: "",
        DateOfCollection: "",
        ConcurrentMedicalConditions: "",
        ConcurrentMedications: "",
        AlcoholOrDrugAbuse: "",
        DiagnosisTestParameter: "",
        ResultRemarks: "",
        TestKit: "",
        TestKitManufacturer: "",
        TestSystem: "",
        TestSystemManufacturer: "",
        endTime: "",
        user_account_id: id,
        status: "",
      });

      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding sample:", error);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    const { TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber } =
      transferDetails;

    // Validate input before making the API call
    if (!TransferTo || !dispatchVia || !dispatcherName || !dispatchReceiptNumber) {
      alert("All fields are required.");
      return;
    }

    try {
      // POST request to your backend API
      const response = await axios.post(
        `http://localhost:5000/api/sampledispatch/post/${selectedSampleId}`,
        {
          TransferTo,
          dispatchVia,
          dispatcherName,
          dispatchReceiptNumber,
        }
      );
      console.log("Sample dispatched successfully:", response.data);

      alert("Sample dispatched successfully!");
      const newResponse = await axios.get(
        `http://localhost:5000/api/sample/get/${id}`
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
        `http://localhost:5000/api/samples/delete/${selectedSampleId}`
      );
      console.log(`Sample with ID ${selectedSampleId} deleted successfully.`);

      // Set success message
      setSuccessMessage("Sample deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the sample list after deletion
      const newResponse = await axios.get(
        `http://localhost:5000/api/sample/get/${id}`
      );
      setSamples(newResponse.data);

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
      masterID: sample.masterID,
      donorID: sample.donorID,
      samplename: sample.samplename,
      age: sample.age,
      gender: sample.gender,
      ethnicity: sample.ethnicity,
      samplecondition: sample.samplecondition,
      storagetemp: sample.storagetemp,
      storagetempUnit: sample.storagetempUnit,
      ContainerType: sample.ContainerType,
      CountryOfCollection: sample.CountryOfCollection,
      price: sample.price,
      SamplePriceCurrency: sample.SamplePriceCurrency,
      quantity: sample.quantity,
      QuantityUnit: sample.QuantityUnit,
      labname: sample.labname,
      SampleTypeMatrix: sample.SampleTypeMatrix,
      TypeMatrixSubtype: sample.TypeMatrixSubtype,
      ProcurementType: sample.ProcurementType,
      SmokingStatus: sample.SmokingStatus,
      TestMethod: sample.TestMethod,
      TestResult: sample.TestResult,
      TestResultUnit: sample.TestResultUnit,
      InfectiousDiseaseTesting: sample.InfectiousDiseaseTesting,
      InfectiousDiseaseResult: sample.InfectiousDiseaseResult,
      status: sample.status,
      CutOffRange: sample.CutOffRange,
      CutOffRangeUnit: sample.CutOffRangeUnit,
      FreezeThawCycles: sample.FreezeThawCycles,
      DateOfCollection: sample.DateOfCollection,
      ConcurrentMedicalConditions: sample.ConcurrentMedicalConditions,
      ConcurrentMedications: sample.ConcurrentMedications,
      AlcoholOrDrugAbuse: sample.AlcoholOrDrugAbuse,
      DiagnosisTestParameter: sample.DiagnosisTestParameter,
      ResultRemarks: sample.ResultRemarks,
      TestKit: sample.TestKit,
      TestKitManufacturer: sample.TestKitManufacturer,
      TestSystem: sample.TestSystem,
      TestSystemManufacturer: sample.TestSystemManufacturer,
      endTime: sample.endTime,
      user_account_id: sample.user_account_id
    });


  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `http://localhost:5000/api/samples/edit/${selectedSampleId}`,
        formData
      );
      console.log("Sample updated successfully:", response.data);

      const newResponse = await axios.get(
        `http://localhost:5000/api/sample/get/${id}`
      );
      setSamples(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Sample updated successfully.");

      // Reset formData after update
    setFormData({
      masterID: "",
      donorID: "",
      samplename: "",
      age: "",
      gender: "",
      ethnicity: "",
      samplecondition: "",
      storagetemp: "",
      storagetempUnit: "",
      ContainerType: "",
      CountryOfCollection: "",
      price: "",
      SamplePriceCurrency: "",
      quantity: "",
      QuantityUnit: "",
      labname: "",
      SampleTypeMatrix: "",
      TypeMatrixSubtype: "",
      ProcurementType: "",
      SmokingStatus: "",
      TestMethod: "",
      TestResult: "",
      TestResultUnit: "",
      InfectiousDiseaseTesting: "",
      InfectiousDiseaseResult: "",
      status: "In Stock",
      CutOffRange: "",
      CutOffRangeUnit: "",
      FreezeThawCycles: "",
      DateOfCollection: "",
      ConcurrentMedicalConditions: "",
      ConcurrentMedications: "",
      AlcoholOrDrugAbuse: "",
      DiagnosisTestParameter: "",
      ResultRemarks: "",
      TestKit: "",
      TestKitManufacturer: "",
      TestSystem: "",
      TestSystemManufacturer: "",
      endTime: "",
      user_account_id: id,
    });

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

  return (
    <section className="policy__area pb-120">
      <div
        className="container"
        style={{ marginTop: "-20px", width: "auto",}}
      >
        <div
          className="row justify-content-center"
          style={{ marginTop: "290px" }}
        >
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              {/* Add Samples Button */}
              <div
                className="d-flex justify-content-end mb-3"
                style={{
                  marginBottom: "20px", // Adjust spacing between button and table
                  
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Samples
                </button>
              </div>

              {/* Table */}
              <div
                className="table-responsive"
                style={{
                  margin: "0 auto", // Center-align the table horizontally
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                  <tr style={{ textAlign: "center" }}>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Search ID"
                            onChange={(e) =>
                              handleFilterChange("id", e.target.value)
                            }
                            style={{
                              width: "80%", // Adjusted width for better responsiveness
                              padding: "8px",
                              boxSizing: "border-box",
                              minWidth: "120px", // Minimum width to prevent shrinking too much
                              maxWidth: "180px", // Maximum width for better control
                            }}
                          />
                          ID
                        </div>
                      </th>

                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                         <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Master ID"
                          onChange={(e) =>
                            handleFilterChange("masterID", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Master ID
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Donor ID"
                          onChange={(e) =>
                            handleFilterChange("donorID", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Donor ID
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Sample Name"
                          onChange={(e) =>
                            handleFilterChange("samplename", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Sample Name
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Age"
                          onChange={(e) =>
                            handleFilterChange("age", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Age
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Gender"
                          onChange={(e) =>
                            handleFilterChange("gender", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Gender
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Ethnicity"
                          onChange={(e) =>
                            handleFilterChange("ethnicity", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Ethnicity
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Sample Condition"
                          onChange={(e) =>
                            handleFilterChange(
                              "samplecondition",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Sample Condition
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Storage Temperature"
                          onChange={(e) =>
                            handleFilterChange("storagetemp", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Storage Temperature
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Storage Temp Unit"
                          onChange={(e) =>
                            handleFilterChange(
                              "storagetempUnit",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Storage Temperature Unit
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Container Type"
                          onChange={(e) =>
                            handleFilterChange("ContainerType", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Container Type
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Country"
                          onChange={(e) =>
                            handleFilterChange(
                              "CountryOfCollection",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Country Of Collection
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Price"
                          onChange={(e) =>
                            handleFilterChange("price", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Price
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Sample Price Currency"
                          onChange={(e) =>
                            handleFilterChange(
                              "SamplePriceCurrency",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Sample Price Currency
                        </div>
                      </th>
                      <th className="px-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Quantity"
                          onChange={(e) =>
                            handleFilterChange("quantity", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Quantity
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Quantity Unit"
                          onChange={(e) =>
                            handleFilterChange("QuantityUnit", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Quantity Unit
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Lab Name"
                          onChange={(e) =>
                            handleFilterChange("labname", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Lab Name
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Sample Type Matrix"
                          onChange={(e) =>
                            handleFilterChange(
                              "SampleTypeMatrix",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Sample Type Matrix
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Type Matrix Subtype"
                          onChange={(e) =>
                            handleFilterChange(
                              "TypeMatrixSubtype",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Type Matrix Subtype
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Procurement Type"
                          onChange={(e) =>
                            handleFilterChange(
                              "ProcurementType",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Procurement Type
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search End Time"
                          onChange={(e) =>
                            handleFilterChange("endTime", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        End Time
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Smoking Status"
                          onChange={(e) =>
                            handleFilterChange("SmokingStatus", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Smoking Status
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Method"
                          onChange={(e) =>
                            handleFilterChange("TestMethod", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Test Method
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Result"
                          onChange={(e) =>
                            handleFilterChange("TestResult", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Test Result
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Result Unit"
                          onChange={(e) =>
                            handleFilterChange("TestResultUnit", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Test Result Unit
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Infectious Disease Testing"
                          onChange={(e) =>
                            handleFilterChange(
                              "InfectiousDiseaseTesting",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Infectious Disease Testing
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Infectious Disease Result"
                          onChange={(e) =>
                            handleFilterChange(
                              "InfectiousDiseaseResult",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Infectious Disease Result
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Cut Off Range"
                          onChange={(e) =>
                            handleFilterChange("CutOffRange", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Cut Off Range
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Cut Off Range Unit"
                          onChange={(e) =>
                            handleFilterChange(
                              "CutOffRangeUnit",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Cut Off Range Unit
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Freeze Thaw Cycles"
                          onChange={(e) =>
                            handleFilterChange(
                              "FreezeThawCycles",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Freeze Thaw Cycles
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Date Of Collection"
                          onChange={(e) =>
                            handleFilterChange(
                              "DateOfCollection",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Date Of Collection
                      </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Concurrent Medical Conditions"
                          onChange={(e) =>
                            handleFilterChange(
                              "ConcurrentMedicalConditions",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Concurrent Medical Conditions
                      </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Concurrent Medications"
                          onChange={(e) =>
                            handleFilterChange(
                              "ConcurrentMedications",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Concurrent Medications
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Alcohol Or Drug Abuse"
                          onChange={(e) =>
                            handleFilterChange(
                              "AlcoholOrDrugAbuse",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Alcohol Or Drug Abuse
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Diagnosis Test Parameter"
                          onChange={(e) =>
                            handleFilterChange(
                              "DiagnosisTestParameter",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Diagnosis Test Parameter
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Result Remarks"
                          onChange={(e) =>
                            handleFilterChange("ResultRemarks", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Result Remarks
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Kit"
                          onChange={(e) =>
                            handleFilterChange("TestKit", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Test Kit
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}

                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Kit Manufacturer"
                          onChange={(e) =>
                            handleFilterChange(
                              "TestKitManufacturer",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Test Kit Manufacturer
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test System"
                          onChange={(e) =>
                            handleFilterChange("TestSystem", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Test System
                        </div>
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                        
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test System Manufacturer"
                          onChange={(e) =>
                            handleFilterChange(
                              "TestSystemManufacturer",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Test System Manufacturer
                        </div>
                      </th>
                      {/*<th>User ID</th>*/}
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <div className="d-flex flex-column align-items-center w-100">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Status"
                          onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Status
                        </div>
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((sample) => (
                        <tr key={sample.id}>
                          <td>{sample.id}</td>
                          <td>{sample.masterID}</td>
                          <td>{sample.donorID}</td>
                          <td>{sample.samplename}</td>
                          <td>{sample.age}</td>
                          <td>{sample.gender}</td>
                          <td>{sample.ethnicity}</td>
                          <td>{sample.samplecondition}</td>
                          <td>{sample.storagetemp}</td>
                          <td>{sample.storagetempUnit}</td>
                          <td>{sample.ContainerType}</td>
                          <td>{sample.CountryOfCollection}</td>
                          <td>{sample.price}</td>
                          <td>{sample.SamplePriceCurrency}</td>
                          <td>{sample.quantity}</td>
                          <td>{sample.QuantityUnit}</td>
                          <td>{sample.labname}</td>
                          <td>{sample.SampleTypeMatrix}</td>
                          <td>{sample.TypeMatrixSubtype}</td>
                          <td>{sample.ProcurementType}</td>
                          <td>{sample.SmokingStatus}</td>
                          <td>{sample.TestMethod}</td>
                          <td>{sample.TestResult}</td>
                          <td>{sample.TestResultUnit}</td>
                          <td>{sample.InfectiousDiseaseTesting}</td>
                          <td>{sample.InfectiousDiseaseResult}</td>
                          <td>{sample.CutOffRange}</td>
                          <td>{sample.CutOffRangeUnit}</td>
                          <td>{sample.FreezeThawCycles}</td>
                          <td>{sample.DateOfCollection}</td>
                          <td>{sample.ConcurrentMedicalConditions}</td>
                          <td>{sample.ConcurrentMedications}</td>
                          <td>{sample.AlcoholOrDrugAbuse}</td>
                          <td>{sample.DiagnosisTestParameter}</td>
                          <td>{sample.ResultRemarks}</td>
                          <td>{sample.TestKit}</td>
                          <td>{sample.TestKitManufacturer}</td>
                          <td>{sample.TestSystem}</td>
                          <td>{sample.TestSystemManufacturer}</td>
                          <td>{sample.endTime}</td>
                          {/*<td>{sample.user_account_id}</td>*/}
                          <td>{sample.status}</td>

                          <td>
                          <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                                gap: "5px",
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
              <div
                className="pagination d-flex justify-content-center align-items-center mt-3"
                style={{
                  gap: "10px",
                }}
              >
                {/* Previous Button */}
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {/* Page Numbers with Ellipsis */}
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  // Show page number if it's the first, last, current, or adjacent to current
                  if (
                    pageNumber === 1 || // Always show the first page
                    pageNumber === totalPages || // Always show the last page
                    pageNumber === currentPage || // Show current page
                    pageNumber === currentPage - 1 || // Show previous page
                    pageNumber === currentPage + 1 // Show next page
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className={`btn btn-sm ${
                          currentPage === pageNumber
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                        style={{
                          minWidth: "40px",
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  }

                  // Add ellipsis if previous number wasn't shown
                  if (
                    (pageNumber === 2 && currentPage > 3) || // Ellipsis after the first page
                    (pageNumber === totalPages - 1 &&
                      currentPage < totalPages - 2) // Ellipsis before the last page
                  ) {
                    return (
                      <span
                        key={`ellipsis-${pageNumber}`}
                        style={{
                          minWidth: "40px",
                          textAlign: "center",
                        }}
                      >
                        ...
                      </span>
                    );
                  }

                  return null; // Skip the page number
                })}

                {/* Next Button */}
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              {/* Modal for Adding Samples */}
              {showAddModal && (
                  <>
                  {/* Bootstrap Backdrop with Blur */}
                  <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>
              
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
                    style={{ maxWidth: "100%", width: "90vw" }}
                  >
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Sample</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowAddModal(false)}
                          style={{
                            fontSize: '1.5rem',
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                          {/* Parallel Columns - 4 columns */}
                          <div className="row">
                            {/* Column 1 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Master ID</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="masterID"
                                  value={formData.masterID}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
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
                            <div className="col-md-2">
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
                                <label>Storage Temperature Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="storagetempUnit"
                                  value={formData.storagetempUnit}
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
                                <label>Price</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="price"
                                  value={formData.price}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Price Currency</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SamplePriceCurrency"
                                  value={formData.SamplePriceCurrency}
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
                            <div className="col-md-2">
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
                                <label>Lab Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="labname"
                                  value={formData.labname}
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
                                <label>Type Matrix Subtype</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TypeMatrixSubtype"
                                  value={formData.TypeMatrixSubtype}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Procurement Type</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ProcurementType"
                                  value={formData.ProcurementType}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Smoking Status</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SmokingStatus"
                                  value={formData.SmokingStatus}
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
                            </div>
                            {/* Column 4 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Test Result</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestResult"
                                  value={formData.TestResult}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
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
                                <label>Infectious Disease Result</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="InfectiousDiseaseResult"
                                  value={formData.InfectiousDiseaseResult}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Cut Off Range</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CutOffRange"
                                  value={formData.CutOffRange}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Cut Off Range Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CutOffRangeUnit"
                                  value={formData.CutOffRangeUnit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Freeze Thaw Cycles</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="FreezeThawCycles"
                                  value={formData.FreezeThawCycles}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                            {/* {Column 5} */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Date Of Collection</label>
                                <input
                                  type="date"
                                  className="form-control"
                                  name="DateOfCollection"
                                  value={formData.DateOfCollection}
                                  onChange={handleInputChange}
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
                                <label>Alcohol Or Drug Abuse</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="AlcoholOrDrugAbuse"
                                  value={formData.AlcoholOrDrugAbuse}
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
                                <label>Result Remarks</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ResultRemarks"
                                  value={formData.ResultRemarks}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Test Kit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestKit"
                                  value={formData.TestKit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                            {/* Column 6 */}
                            <div className="col-md-2">
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
                              <div className="form-group">
                                <label>End Time</label>
                                <input
                                  type="datetime-local"
                                  className="form-control"
                                  name="endTime"
                                  value={formData.endTime}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                </>
              )}

              {/* Edit Sample Modal */}
              {showEditModal && (
                   <>
                   {/* Bootstrap Backdrop with Blur */}
                   <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>
               
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
                    style={{ maxWidth: "100%", width: "70vw" }}
                  >
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Edit Sample</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowEditModal(false)}
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
                      <form onSubmit={handleUpdate}>
                        <div className="modal-body">
                          {/* Parallel Columns - 4 columns */}
                          <div className="row">
                            {/* Column 1 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Master ID</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="masterID"
                                  value={formData.masterID}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
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
                            <div className="col-md-2">
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
                                <label>Storage Temperature Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="storagetempUnit"
                                  value={formData.storagetempUnit}
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
                                <label>Price</label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="price"
                                  value={formData.price}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Sample Price Currency</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SamplePriceCurrency"
                                  value={formData.SamplePriceCurrency}
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
                            <div className="col-md-2">
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
                                <label>Lab Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="labname"
                                  value={formData.labname}
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
                                <label>Type Matrix Subtype</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TypeMatrixSubtype"
                                  value={formData.TypeMatrixSubtype}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Procurement Type</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ProcurementType"
                                  value={formData.ProcurementType}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Smoking Status</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="SmokingStatus"
                                  value={formData.SmokingStatus}
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
                            </div>
                            {/* Column 4 */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Test Result</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestResult"
                                  value={formData.TestResult}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
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
                                <label>Infectious Disease Result</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="InfectiousDiseaseResult"
                                  value={formData.InfectiousDiseaseResult}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Cut Off Range</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CutOffRange"
                                  value={formData.CutOffRange}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Cut Off Range Unit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CutOffRangeUnit"
                                  value={formData.CutOffRangeUnit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Freeze Thaw Cycles</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="FreezeThawCycles"
                                  value={formData.FreezeThawCycles}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>

                            {/* {Column 5} */}
                            <div className="col-md-2">
                              <div className="form-group">
                                <label>Date of Collection</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="DateOfCollection"
                                  value={formData.DateOfCollection}
                                  onChange={handleInputChange}
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
                                <label>Alcohol Or Drug Abuse</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="AlcoholOrDrugAbuse"
                                  value={formData.AlcoholOrDrugAbuse}
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
                                <label>Result Remarks</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="ResultRemarks"
                                  value={formData.ResultRemarks}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Test Kit</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="TestKit"
                                  value={formData.TestKit}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                            {/* Column 6 */}
                            <div className="col-md-2">
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
                              <div className="form-group">
                                <label>End Time</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="endTime"
                                  value={formData.endTime}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Update Sample
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
                        <label style={{ display: "block", marginBottom: "5px" }}>Transfer to Collection Site</label>
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
                            <option key={index} value={site}>
                              {site}
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

              {/* Modal for Deleting Samples */}
              {showDeleteModal && (
                     <>
                     {/* Bootstrap Backdrop with Blur */}
                     <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>
                 
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
                            fontSize: '1.5rem',
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            cursor: 'pointer'
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