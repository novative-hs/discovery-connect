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
  else {
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

  const [editSample, setEditSample] = useState(null); // State for selected sample to edit
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState("");
  const [collectionSiteNames, setCollectionSiteNames] = useState([]);
  // Sample Dropdown Fields
  const [ethnicityNames, setEthnicityNames] = useState([]);
  const [sampleconditionNames, setSampleConditionNames] = useState([]);
  const [storagetemperatureNames, setStorageTemperatureNames] = useState([]);
  const [containertypeNames, setContainerTypeNames] = useState([]);
  const [quantityunitNames, setQuantityUnitNames] = useState([]);
  const [sampletypematrixNames, setSampleTypeMatrixNames] = useState([]);
  const [testmethodNames, setTestMethodNames] = useState([]);
  const [testresultunitNames, setTestResultUnitNames] = useState([]);
  const [concurrentmedicalconditionsNames, setConcurrentMedicalConditionsNames] = useState([]);
  const [testkitmanufacturerNames, setTestKitManufacturerNames] = useState([]);
  const [testsystemNames, setTestSystemNames] = useState([]);
  const [testsystemmanufacturerNames, setTestSystemManufacturerNames] = useState([]);


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
      const ownSamples = ownSamplesResponse.data.map(sample => ({
        ...sample,
        quantity: sample.quantity, // Use 'quantity' as is
      }));

      // Fetch samples received by this collection site
      const receivedSamplesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereceive/get/${id}`
      );
      console.log("Received samples:", receivedSamplesResponse.data);
      const receivedSamples = receivedSamplesResponse.data.map(sample => ({
        ...sample,
        quantity: sample.Quantity, // Map 'Quantity' to 'quantity'
      }));

      // Combine both responses
      const combinedSamples = [...ownSamples, ...receivedSamples];

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
          throw new Error('Failed to fetch collection site names');
        }
        const data = await response.json();
        console.log('Fetched Site Names:', data);
        setCollectionSiteNames(data.data);
      } catch (error) {
        console.error('Error fetching site names:', error);
      }
    };

    fetchCollectionSiteNames();
  }, [id]);

  // Sample fields Dropdown
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ethnicity/ethnicitynames`)
      .then(response => response.json())
      .then(data => setEthnicityNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplecondition/sampleconditionnames`)
      .then(response => response.json())
      .then(data => setSampleConditionNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/storagetemperature/storagetemperaturenames`)
      .then(response => response.json())
      .then(data => setStorageTemperatureNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/containertype/containertypenames`)
      .then(response => response.json())
      .then(data => setContainerTypeNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/quantityunit/quantityunitnames`)
      .then(response => response.json())
      .then(data => setQuantityUnitNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sampletypematrix/sampletypematrixnames`)
      .then(response => response.json())
      .then(data => setSampleTypeMatrixNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/testmethod/testmethodnames`)
      .then(response => response.json())
      .then(data => setTestMethodNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/testresultunit/testresultunitnames`)
      .then(response => response.json())
      .then(data => setTestResultUnitNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/concurrentmedicalconditions/concurrentmedicalconditionsnames`)
      .then(response => response.json())
      .then(data => setConcurrentMedicalConditionsNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/testkitmanufacturer/testkitmanufacturernames`)
      .then(response => response.json())
      .then(data => setTestKitManufacturerNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/testsystem/testsystemnames`)
      .then(response => response.json())
      .then(data => setTestSystemNames(data));

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/testsystemmanufacturer/testsystemmanufacturernames`)
      .then(response => response.json())
      .then(data => setTestSystemManufacturerNames(data));

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

      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding sample:", error);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();

    const { TransferTo, dispatchVia, dispatcherName, dispatchReceiptNumber, Quantity } =
      transferDetails;

    // Validate input before making the API call
    if (!TransferTo || !dispatchVia || !dispatcherName || !dispatchReceiptNumber || !Quantity) {
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
        status: "In Stock",
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
    <section className="profile__area pt-180 pb-20">       {/* Inner Container Color can be visible through this */}
      <div
        className="container"
        style={{ marginTop: "-180px", width: "170%", marginLeft: "-135px" }}>
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}
        {/* Add Samples Button */}
        <div
          className="d-flex justify-content-end mb-3 position-relative"
          style={{ top: "-2px", marginRight: "130px" }}>
          <button
            className="btn"
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: "#FFEE99", // Soft pastel yellow
              borderColor: "#FFD700", // Gold border
              color: "#000000", // Black text for contrast
              marginLeft: "-10px",
            }}
          >
            Add Samples
          </button>
        </div>
        {/* Table */}
        <div
          className="table-responsive"
          style={{ margin: "0 auto", width: "80%", textAlign: "center" }}>
          <table className="table table-bordered table-hover">
            <thead className="table-primary">        {/*Table Head Color*/}
              <tr>
                <th
                  className="px-3"
                  style={{
                    verticalAlign: "middle",
                    textAlign: "center",
                    width: "80px",
                  }}>
                  <div className="d-flex flex-column align-items-center w-100">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search ID"
                      onChange={(e) =>
                        handleFilterChange("id", e.target.value)
                      }
                      style={{
                        width: "70%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "70px",
                        maxWidth: "120px",
                      }} />
                    ID
                  </div>
                </th>
                <th
                  className="px-3"
                  style={{
                    verticalAlign: "middle",
                    textAlign: "center",
                    width: "110px",
                  }}>
                  <div className="d-flex flex-column align-items-center w-100">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Sample Name"
                      onChange={(e) =>
                        handleFilterChange("samplename", e.target.value)
                      }
                      style={{
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
                      }} />
                    Sample Name
                  </div>
                </th>
                <th
                  className="px-3"
                  style={{
                    verticalAlign: "middle",
                    textAlign: "center",
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "100px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
                  }}
                >
                  <div className="d-flex flex-column align-items-center w-100">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search Quantity"
                      onChange={(e) =>
                        handleFilterChange("quantity", e.target.value)
                      }
                      style={{
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
                      }}
                    />
                    Quantity
                  </div>
                </th>
                <th
                  className="px-3"
                  style={{
                    verticalAlign: "middle",
                    textAlign: "center",
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
                  }}>
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    width: "110px",
                  }}>
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
                      }}
                    />
                    Test System Manufacturer
                  </div>
                </th>
                <th
                  className="px-3"
                  style={{
                    verticalAlign: "middle",
                    textAlign: "center",
                    width: "110px",
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
                        width: "80%",
                        padding: "4px",
                        height: "35px",
                        boxSizing: "border-box",
                        minWidth: "90px",
                        maxWidth: "120px",
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
                    <td>{sample.samplename}</td>
                    <td>{sample.age}</td>
                    <td>{sample.gender}</td>
                    <td>{sample.ethnicity}</td>
                    <td>{sample.samplecondition}</td>
                    <td>{sample.storagetemp}</td>
                    <td>{sample.ContainerType}</td>
                    <td>{sample.CountryOfCollection}</td>
                    <td>{sample.quantity}</td>
                    <td>{sample.QuantityUnit}</td>
                    <td>{sample.SampleTypeMatrix}</td>
                    <td>{sample.SmokingStatus}</td>
                    <td>{sample.AlcoholOrDrugAbuse}</td>
                    <td>{sample.InfectiousDiseaseTesting}</td>
                    <td>{sample.InfectiousDiseaseResult}</td>
                    <td>{sample.FreezeThawCycles}</td>
                    <td>{sample.DateOfCollection}</td>
                    <td>{sample.ConcurrentMedicalConditions}</td>
                    <td>{sample.ConcurrentMedications}</td>
                    <td>{sample.DiagnosisTestParameter}</td>
                    <td>{sample.TestResult}</td>
                    <td>{sample.TestResultUnit}</td>
                    <td>{sample.TestMethod}</td>
                    <td>{sample.TestKitManufacturer}</td>
                    <td>{sample.TestSystem}</td>
                    <td>{sample.TestSystemManufacturer}</td>
                    <td>{sample.status}</td>
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
                  className={`btn btn-sm ${currentPage === pageNumber
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
                top: "40px",
                left: "50%",
                transform: "translateX(-50%)",
              }}>
              <div
                className="modal-dialog"
                role="document"
                style={{ maxWidth: "90vw", width: "95vw" }}>
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
                      }}>
                      <span>&times;</span>
                    </button>
                  </div>
                  <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                      {/* Parallel Columns - 5 columns */}
                      <div className="row">
                        {/* Column 1 */}
                        <div className="col-md-2">
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
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Ethnicity</label>
                            <select
                              className="form-control"
                              name="ethnicity"
                              value={formData.ethnicity}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Ethnicity</option>
                              {ethnicityNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {/* Column 2 */}
                        <div className="col-md-2">
                        <div className="form-group">
                            <label>Sample Condition</label>
                            <select
                              className="form-control"
                              name="samplecondition"
                              value={formData.samplecondition}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Sample Condition</option>
                              {sampleconditionNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Storage Temperature</label>
                            <select
                              className="form-control"
                              name="storagetemp"
                              value={formData.storagetemp}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Storage Temperature</option>
                              {storagetemperatureNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Container Type</label>
                            <select
                              className="form-control"
                              name="ContainerType"
                              value={formData.ContainerType}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Container type</option>
                              {containertypeNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
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
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Quantity Unit</label>
                            <select
                              className="form-control"
                              name="QuantityUnit"
                              value={formData.QuantityUnit}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Quantity Unit</option>
                              {quantityunitNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Sample Type Matrix</label>
                            <select
                              className="form-control"
                              name="SampleTypeMatrix"
                              value={formData.SampleTypeMatrix}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Sample Type Matrix</option>
                              {sampletypematrixNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Smoking Status</label>
                            <div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="SmokingStatus"
                                  value="Smoker"
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "16px", height: "16px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Smoker</label>
                              </div>

                              <div className="form-check form-check-inline ms-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="SmokingStatus"
                                  value="Non-Smoker"
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Non-Smoker</label>
                              </div>
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Alcohol Or Drug Abuse</label>
                            <div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="AlcoholOrDrugAbuse"
                                  value="Yes"
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Yes</label>
                              </div>

                              <div className="form-check form-check-inline ms-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="AlcoholOrDrugAbuse"
                                  value="No"
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">No</label>
                              </div>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Infectious Disease Testing (HIV, HBV, HCV)</label>
                            <input
                              type="text"
                              className="form-control"
                              name="InfectiousDiseaseTesting"
                              value={formData.InfectiousDiseaseTesting}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        {/* Column 4 */}
                        <div className="col-md-2">
                        <div className="form-group">
                            <label className="form-label">Infectious Disease Result</label>
                            <div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="InfectiousDiseaseResult"
                                  value="Positive"
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Positive</label>
                              </div>
                              <div className="form-check form-check-inline ms-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="InfectiousDiseaseResult"
                                  value="Negative"
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Negative</label>
                              </div>
                            </div>
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
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            />
                          </div>
                          <div className="form-group">
                            <label>Concurrent Medical Conditions</label>
                            <select
                              className="form-control"
                              name="ConcurrentMedicalConditions"
                              value={formData.ConcurrentMedicalConditions}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Concurrent Medical Conditions</option>
                              {concurrentmedicalconditionsNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
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
                        </div>
                        {/* {Column 5} */}
                        <div className="col-md-2">
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
                          <div className="form-group">
                            <label>Test Result Unit</label>
                            <select
                              className="form-control"
                              name="TestResultUnit"
                              value={formData.TestResultUnit}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Test Result Unit</option>
                              {testresultunitNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Test Method</label>
                            <select
                              className="form-control"
                              name="TestMethod"
                              value={formData.TestMethod}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Test Method</option>
                              {testmethodNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Test Kit Manufacturer</label>
                            <select
                              className="form-control"
                              name="TestKitManufacturer"
                              value={formData.TestKitManufacturer}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Test Kit Manufacturer</option>
                              {testkitmanufacturerNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
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
                         {/* {Column 6} */}
                         <div className="col-md-2">
                         <div className="form-group">
                            <label>Test System</label>
                            <select
                              className="form-control"
                              name="TestSystem"
                              value={formData.TestSystem}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Test System</option>
                              {testsystemNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Test System Manufacturer</label>
                            <select
                              className="form-control"
                              name="TestSystemManufacturer"
                              value={formData.TestSystemManufacturer}
                              onChange={handleInputChange}
                              required
                              style={{ backgroundColor: formData.gender ? "white" : "#f0f0f0" }}
                            >
                              <option value="">Select Test System Manufacturer</option>
                              {testsystemmanufacturerNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
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
                top: "40px",
                left: "50%",
                transform: "translateX(-50%)",
              }}>
              <div
                className="modal-dialog"
                role="document"
                style={{ maxWidth: "90%", width: "95vw" }}>
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
                      {/* Parallel Columns - 5 columns */}
                      <div className="row">
                        {/* Column 1 */}
                        <div className="col-md-2">
                          {/* <div className="form-group">
                                  <label>Donor ID</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="donorID"
                                    value={formData.donorID}
                                    onChange={handleInputChange}
                                    required
                                  />
                                </div> */}
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
                            <select
                              className="form-control"
                              name="ethnicity"
                              value={formData.ethnicity}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Ethnicity</option>
                              {ethnicityNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Sample Condition</label>
                            <select
                              className="form-control"
                              name="samplecondition"
                              value={formData.samplecondition}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Sample Condition</option>
                              {sampleconditionNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {/* Column 2 */}
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Storage Temperature</label>
                            <select
                              className="form-control"
                              name="storagetemp"
                              value={formData.storagetemp}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Storage Temperature</option>
                              {storagetemperatureNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Container Type</label>
                            <select
                              className="form-control"
                              name="ContainerType"
                              value={formData.ContainerType}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Container type</option>
                              {containertypeNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
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
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Quantity Unit</label>
                            <select
                              className="form-control"
                              name="QuantityUnit"
                              value={formData.QuantityUnit}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Quantity Unit</option>
                              {quantityunitNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Sample Type Matrix</label>
                            <select
                              className="form-control"
                              name="SampleTypeMatrix"
                              value={formData.SampleTypeMatrix}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Sample Type Matrix</option>
                              {sampletypematrixNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Smoking Status</label>
                            <div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="SmokingStatus"
                                  value="Smoker"
                                  checked={formData.SmokingStatus === "Smoker"}
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Smoker</label>
                              </div>

                              <div className="form-check form-check-inline ms-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="SmokingStatus"
                                  value="Non-Smoker"
                                  checked={formData.SmokingStatus === "Non-Smoker"}
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Non-Smoker</label>
                              </div>
                            </div>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Alcohol Or Drug Abuse</label>
                            <div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="AlcoholOrDrugAbuse"
                                  value="Yes"
                                  checked={formData.AlcoholOrDrugAbuse === "Yes"}
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Yes</label>
                              </div>

                              <div className="form-check form-check-inline ms-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="AlcoholOrDrugAbuse"
                                  value="No"
                                  checked={formData.AlcoholOrDrugAbuse === "No"}
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">No</label>
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
                            <label className="form-label">Infectious Disease Result</label>
                            <div>
                              <div className="form-check form-check-inline">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="InfectiousDiseaseResult"
                                  value="Positive"
                                  checked={formData.InfectiousDiseaseResult === "Positive"}
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Positive</label>
                              </div>

                              <div className="form-check form-check-inline ms-3">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="InfectiousDiseaseResult"
                                  value="Negative"
                                  checked={formData.InfectiousDiseaseResult === "Negative"}
                                  onChange={handleInputChange}
                                  required
                                  style={{ width: "14px", height: "14px" }} // Reduced size
                                />
                                <label className="form-check-label fs-6">Negative</label>
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Column 4 */}
                        <div className="col-md-2">
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
                          <div className="form-group">
                            <label>Date of Collection</label>
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
                            <select
                              className="form-control"
                              name="ConcurrentMedicalConditions"
                              value={formData.ConcurrentMedicalConditions}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Concurrent Medical Conditions</option>
                              {concurrentmedicalconditionsNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
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
                        <div className="col-md-2">
                          <div className="form-group">
                            <label>Test Result Unit</label>
                            <select
                              className="form-control"
                              name="TestResultUnit"
                              value={formData.TestResultUnit}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Test Result Unit</option>
                              {testresultunitNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Test Method</label>
                            <select
                              className="form-control"
                              name="TestMethod"
                              value={formData.TestMethod}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Test Method</option>
                              {testmethodNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Test Kit Manufacturer</label>
                            <select
                              className="form-control"
                              name="TestKitManufacturer"
                              value={formData.TestKitManufacturer}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Test Kit Manufacturer</option>
                              {testkitmanufacturerNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Test System</label>
                            <select
                              className="form-control"
                              name="TestSystem"
                              value={formData.TestSystem}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Test System</option>
                              {testsystemNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Test System Manufacturer</label>
                            <select
                              className="form-control"
                              name="TestSystemManufacturer"
                              value={formData.TestSystemManufacturer}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Select Test System Manufacturer</option>
                              {testsystemmanufacturerNames.map((name, index) => (
                                <option key={index} value={name}>{name}</option>
                              ))}
                            </select>
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
                      <option key={site.user_account_id} value={site.user_account_id}>
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
      {/* </div> */}
      {/* //     </div> */}
      {/* //   </div> */}
    // </section>
  );
};

export default SampleArea;