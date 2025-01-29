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
    Quantity: "",
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
      if ( showReceiveModal) {
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
    <section className="policy__area pb-120">
       <div
        className="container"
        style={{ marginTop: "-20px", width: "180%", marginLeft: "-40px"}}
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
                            handleFilterChange("Quantity", e.target.value)
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
                          <td className="text-end">{sample.price}</td>
                          <td>{sample.SamplePriceCurrency}</td>
                          <td>{sample.Quantity}</td>
                          <td>{sample.QuantityUnit}</td>
                          <td>{sample.labname}</td>
                          <td>{sample.SampleTypeMatrix}</td>
                          <td>{sample.TypeMatrixSubtype}</td>
                          <td>{sample.ProcurementType}</td>
                          <td>{sample.endTime}</td>
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
                          <td>{sample.status}</td>
                          <td>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleTransferClick(sample)}
                            >
                              <FontAwesomeIcon icon={faExchangeAlt} size="sm" />
                            </button>
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default BioBankSampleDispatchArea;