import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import InputMask from "react-input-mask";
import { getsessionStorage } from "@utils/sessionStorage";

const SampleArea = () => {

  const [staffAction, setStaffAction] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete
  const [showModal, setShowModal] = useState(false);
  const [countryname, setCountryname] = useState([]);
  const [searchCountry, setSearchCountry] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  const id = sessionStorage.getItem("userID");

  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Collection site Id on sample page is:", id);
  }
  const openModal = (sample) => {

    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };

  const tableHeaders = [
    { label: "Disease Name", key: "diseasename" },
    { label: "Location", key: "locationids" },
    { label: "Pack Size", key: "packsize" },
    { label: "Gender", key: "gender" },
    { label: "Age", key: "age" },
    { label: "Phone Number", key: "phoneNumber" },
    // { label: "Diagnosis Test Parameter", key: "DiagnosisTestParameter" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
  ];

  const fieldsToShowInOrder = [
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Test Result", key: "TestResult" },
    { label: "Test Result Unit", key: "TestResultUnit" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    { label: "Date Of Collection", key: "DateOfCollection" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Collection", key: "DateOfCollection" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
  ];

  const [formData, setFormData] = useState({
    locationids: "",
    diseasename: "",
    age: "",
    phoneNumber: "",
    gender: "",
    ethnicity: "",
    samplecondition: "",
    storagetemp: "",
    ContainerType: "",
    CountryOfCollection: "",
    quantity: 1,
    packsize: "",
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
    TestSign: "",
    TestValue: "",
    TestResult: "",
    TestResultUnit: "",
    TestMethod: "",
    TestKitManufacturer: "",
    TestSystem: "",
    TestSystemManufacturer: "",
    status: "In Stock",
    user_account_id: id,
    logo: "",
  });
  const [logo, setLogo] = useState("");

  const [editSample, setEditSample] = useState(null); // State for selected sample to edit
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [filteredSamplename, setFilteredSamplename] = useState([]); // Store filtered cities
  const [filtertotal, setfiltertotal] = useState(null);
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
  const [diagnosistestparameterNames, setDiagnosisTestParameterNames] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  // Stock Transfer modal fields names
  const [transferDetails, setTransferDetails] = useState({
    TransferTo: id,
    dispatchVia: "",
    dispatcherName: "",
    dispatchReceiptNumber: "",
    Quantity: 1,
  });
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const [showTooltip, setShowTooltip] = useState(false);
  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setFormData((prev) => ({
      ...prev,
      CountryOfCollection: country.name, // or country.id if you store ID
    }));
    setSearchCountry(country.name);
    setShowCountryDropdown(false);
  };

  // Fetch countries from backend
  useEffect(() => {
    const action = sessionStorage.getItem("staffAction");
    setStaffAction(action);
    const fetchData = async (url, setState, label) => {
      try {
        const response = await axios.get(url);
        setState(response.data);
      } catch (error) {
        console.error(`Error fetching ${label}:`, error);
      }
    };

    fetchData(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`,
      setCountryname,
      "Country"
    );
  }, []);

  const tableNames = [
    { name: "ethnicity", setter: setEthnicityNames },
    { name: "samplecondition", setter: setSampleConditionNames },
    { name: "storagetemperature", setter: setStorageTemperatureNames },
    { name: "containertype", setter: setContainerTypeNames },
    { name: "quantityunit", setter: setQuantityUnitNames },
    { name: "sampletypematrix", setter: setSampleTypeMatrixNames },
    { name: "testmethod", setter: setTestMethodNames },
    { name: "testresultunit", setter: setTestResultUnitNames },
    { name: "concurrentmedicalconditions", setter: setConcurrentMedicalConditionsNames },
    { name: "testkitmanufacturer", setter: setTestKitManufacturerNames },
    { name: "testsystem", setter: setTestSystemNames },
    { name: "testsystemmanufacturer", setter: setTestSystemManufacturerNames },
    { name: "diagnosistestparameter", setter: setDiagnosisTestParameterNames },
  ];
  const handleTransferClick = (sample) => {

    setSelectedSampleId(sample.id);
    setShowTransferModal(true);
  };

  const logoHandler = (file) => {
    const imageUrl = URL.createObjectURL(file);
    setLogoPreview(imageUrl);
    setLogo(imageUrl);  // Update the preview with the new image URL
    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));
  };

  // Fetch samples from backend when component loads

  useEffect(() => {
    const storedUser = getsessionStorage("user");
    fetchSamples(currentPage, itemsPerPage, {

      searchField,
      searchValue,
    });
    fetchCollectionSiteNames();
  }, [currentPage, searchField, searchValue]);


  const fetchSamples = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const { searchField, searchValue } = filters;

      if (!id) {
        console.error("ID is missing.");
        return;
      }

      // Construct URLs
      let ownResponseurl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/get/${id}?page=${page}&pageSize=${pageSize}`;
      if (searchField && searchValue) {
        ownResponseurl += `&searchField=${searchField}&searchValue=${searchValue}`;
      }

      let receivedResponseurl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereceive/get/${id}?page=${page}&pageSize=${pageSize}`;
      if (searchField && searchValue) {
        receivedResponseurl += `&searchField=${searchField}&searchValue=${searchValue}`;
      }

      // Fetch own samples
      const ownResponse = await axios.get(ownResponseurl);
      const { samples: ownSampleData, totalCount: ownTotalCount } = ownResponse.data;

      const ownSamples = ownSampleData.map((sample) => {
        let base64Logo = "";
        if (sample.logo && sample.logo.data) {
          const binary = sample.logo.data.map((byte) => String.fromCharCode(byte)).join("");
          base64Logo = `data:image/jpeg;base64,${btoa(binary)}`;
        }

        const quantity = Number(sample.quantity ?? sample.Quantity ?? 0);

        return {
          ...sample,
          quantity,
          logo: base64Logo,
          isReturn: false,
        };
      });

      // Fetch received samples
      const receivedResponse = await axios.get(receivedResponseurl);
      const { samples: receivedSampleData, totalCount: receivedTotalCount } = receivedResponse.data;

      const receivedSamples = receivedSampleData.map((sample) => {
        const quantity = Number(sample.quantity ?? sample.Quantity ?? 0);
        return {
          ...sample,
          quantity,
          isReturn: true,
        };
      });

      // Merge and sum duplicate quantities
      const sampleMap = new Map();

      [...ownSamples, ...receivedSamples].forEach((sample) => {
        const sampleId = sample.id;
        if (sampleMap.has(sampleId)) {
          const existingSample = sampleMap.get(sampleId);
          existingSample.quantity += sample.quantity;

          // If any source is from received, mark isReturn false
          if (sample.isReturn === false) {
            existingSample.isReturn = false;
          }

          sampleMap.set(sampleId, existingSample);
        } else {
          sampleMap.set(sampleId, { ...sample });
        }
      });

      const combinedSamples = Array.from(sampleMap.values());
      console.log("Combined sample count:", combinedSamples.length); // Should show 16
      const totalPages = Math.ceil(combinedSamples.length / pageSize);
      console.log(combinedSamples)
      setTotalPages(totalPages);
      setfiltertotal(totalPages); // Only if you actually need this
      setSamples(combinedSamples);
      setFilteredSamplename(combinedSamples);

    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  const fetchCollectionSiteNames = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsite/getAll/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch collection site names");
      }
      const data = await response.json();
      setCollectionSiteNames(data);
    } catch (error) {
      console.error("Error fetching site names:", error);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Adjust down if needed
    }
  }, [totalPages]);

  const handleFilterChange = (field, value) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchField(field);
    setSearchValue(trimmedValue);
    setCurrentPage(1); // Reset to page 1 — this triggers fetch in useEffect
  };

  const handlePageChange = (event) => {
    const selectedPage = event.selected + 1; // React Paginate is 0-indexed, so we adjust
    setCurrentPage(selectedPage); // This will trigger the data change based on selected page
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
  const currentData = filteredSamplename;


  // Sample fields Dropdown
  useEffect(() => {
    const fetchTableData = async (tableName, setter) => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplefields/${tableName}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch ${tableName}`);
        }
        const data = await response.json();
        setter(data);
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
      }
    };

    tableNames.forEach(({ name, setter }) => fetchTableData(name, setter));
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Ensure both states update correctly
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setTransferDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log(formData)
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/postsample`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchSamples(); // Refresh only current page
      setCurrentPage(1);

      setSuccessMessage("Sample added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      resetFormData()
      setLogoPreview(false);
      setShowAdditionalFields(false)
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding sample:", error);
    }
  };

  function bufferToBase64(bufferObj, mimeType = "jpeg") {
    if (!bufferObj || !Array.isArray(bufferObj.data)) return "";

    const binary = bufferObj.data
      .map((byte) => String.fromCharCode(byte))
      .join("");

    const base64String = btoa(binary);
    return `data:image/${mimeType};base64,${base64String}`;
  }

  const handleTransferSubmit = async (e) => {
    const sampleToSend = samples.find(s => s.id === selectedSampleId);
    const isReturnFlag = sampleToSend?.isReturn === true;

    e.preventDefault();

    const {
      TransferTo,
      dispatchVia,
      dispatcherName,
      dispatchReceiptNumber,
      Quantity,
    } = transferDetails;

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
      // Determine if it's a return (sample being sent back to original receiver)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sampledispatch/post/${selectedSampleId}`,
        {
          TransferFrom: id,
          TransferTo,
          dispatchVia,
          dispatcherName,
          dispatchReceiptNumber,
          Quantity,
          isReturn: isReturnFlag,
        }
      );

      fetchSamples(); // Refresh the current page
      setCurrentPage(1);
      alert("Sample dispatched successfully!");

      setTransferDetails({
        TransferTo: "",
        dispatchVia: "",
        dispatcherName: "",
        dispatchReceiptNumber: "",
        Quantity: "",
      });

      setShowTransferModal(false);
    } catch (error) {
      if (error.response) {
        alert(`Error: ${error.response.data.error}`);
      } else if (error.request) {
        alert("No response received from server.");
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleModalClose = () => {
    setTransferDetails({
      TransferTo: "",
      dispatchVia: "",
      dispatcherName: "",
      dispatchReceiptNumber: "",
      Quantity: 1,
    });
    setShowTransferModal(false); // Close the modal
  };

  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-sample-history/${id}`
      );
      const data = await response.json();
      console.log(data)
      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Call this function when opening the modal
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };

  const handleEditClick = (sample) => {
    setSelectedSampleId(sample.id);
    setEditSample(sample);
    setShowEditModal(true);

    // Combine the location parts into "room-box-freezer" format
    const formattedLocationId = `${String(sample.room_number).padStart(3, "0")}-${String(sample.freezer_id).padStart(3, "0")}-${String(sample.box_id).padStart(3, "0")}`;

    setFormData({
      locationids: formattedLocationId,
      diseasename: sample.diseasename,
      packsize: sample.packsize,
      age: sample.age,
      phoneNumber: sample.phoneNumber,
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
      logo: sample.logo,
    });
    const logoPreviewUrl =
      typeof sample.logo === "string"
        ? sample.logo
        : sample.logo?.data
          ? URL.createObjectURL(
            new Blob([new Uint8Array(sample.logo.data)], { type: "image/png" })
          )
          : null;
    setLogoPreview(logoPreviewUrl);
    // ✅ Add this block to properly show the country in the input field
    const matchedCountry = countryname.find(
      (c) =>
        c.name?.toLowerCase() === sample.CountryOfCollection?.toLowerCase()
    );
    setSelectedCountry(matchedCountry || null);
    setSearchCountry(matchedCountry ? matchedCountry.name : "");
  };

  const resetFormData = () => {
    setFormData({
      locationids: "",
      diseasename: "",
      age: "",
      packsize: "",
      gender: "",
      phoneNumber: "",
      ethnicity: "",
      samplecondition: "",
      storagetemp: "",
      ContainerType: "",
      CountryOfCollection: "",
      quantity: 1,
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
      logo: "",
    });
    setShowAdditionalFields(false);
    setLogoPreview(null)
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/edit/${selectedSampleId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Make sure it's set to multipart/form-data
          },
        }
      );

      fetchSamples(); // Refresh only current page
      setCurrentPage(1);

      setShowEditModal(false);
      setSuccessMessage("Sample updated successfully.");

      // Reset formData after update
      resetFormData()
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
    if (
      showAddModal ||
      showEditModal ||
      showTransferModal ||
      showHistoryModal
    ) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [
    showAddModal,
    showEditModal,
    showTransferModal,
    showHistoryModal,
  ]);

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          logo: reader.result, // Store the image preview URL
        }));
      };
      reader.readAsDataURL(file); // Convert the image file to a data URL
    }
  };

  const handleTestResultChange = (field, value) => {
    setFormData((prev) => {
      const newForm = {
        ...prev,
        [field]: value,
        TestResult: `${field === "TestSign" ? value : prev.TestSign}${field === "TestValue" ? value : prev.TestValue}`
      };
      return newForm;
    });
  };


  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success w-100 text-start mb-2 small">
            {successMessage}
          </div>
        )}

        {/* Button */}
        <div className="d-flex justify-content-end align-items-end flex-wrap gap-2 mb-4">

          {["add_full", "add_basic", "all"].includes(staffAction) && (
            <div className="d-flex flex-wrap gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  backgroundColor: "#4a90e2",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <i className="fas fa-vial"></i> Add Sample
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div
          onScroll={handleScroll}
          className="table-responsive"
          style={{ overflowX: "auto" }}
        >
          <table
            className="table table-bordered table-hover text-center align-middle"
            style={{ minWidth: "1000px" }}
          >
            <thead className="table-primary text-dark">
              <tr className="text-center">
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">

                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                        placeholder={`Search ${label}`}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        style={{ minWidth: "100px", maxWidth: "120px", width: "100px" }}
                      />
                      <span className="fw-bold mt-1 d-block text-nowrap align-items-center fs-6">
                        {label}
                      </span>

                    </div>
                  </th>
                ))}
                {["edit", "dispatch", "history", "all"].some(action => staffAction === action) && (
                  <th className="p-2 text-center" style={{ minWidth: "50px" }}>
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="table-light">
              {currentData.length > 0 ? (
                currentData.map((sample) => (
                  <tr>
                    {tableHeaders.map(({ key }, index) => (
                      <td
                        key={index}
                        className={
                          key === "price"
                            ? "text-end"
                            : key === "diseasename"
                              ? ""
                              : "text-center text-truncate"
                        }
                        style={{ maxWidth: "150px" }}
                      >
                        {key === "diseasename" ? (
                          <span
                            className="sample-name text-primary fw-semibold fs-6 text-decoration-underline"
                            role="button"
                            title="Sample Details"
                            onClick={() => openModal(sample)}
                            style={{
                              cursor: "pointer",
                              transition: "color 0.2s",
                            }}
                            onMouseOver={(e) => (e.target.style.color = "#0a58ca")}
                            onMouseOut={(e) => (e.target.style.color = "")}
                          >
                            {sample.diseasename || "----"}
                          </span>
                        ) : (
                          (() => {
                            if (key === "locationids") {
                              const tooltip = `${sample.room_number || "N/A"} = Room Number
${sample.freezer_id || "N/A"} = Freezer ID
${sample.box_id || "N/A"} = Box ID`;
                              return (
                                <span title={tooltip} style={{ cursor: "help" }}>
                                  {sample.locationids || "----"}
                                </span>
                              );
                            } else if (key === "packsize") {
                              return `${sample.packsize} ${sample.QuantityUnit || ""}`;
                            } else if (key === "age") {
                              return `${sample.age} years`;
                            } else {
                              return sample[key] || "----";
                            }
                          })()
                        )}
                      </td>
                    ))}
                    {["edit", "dispatch", "history", "all"].some(action => staffAction === action) && (
                      <td className="text-center">
                        <div className="d-flex justify-content-around gap-1">
                          {["edit", "all"].includes(staffAction) && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditClick(sample)}
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>
                          )}

                          {["dispatch", "all"].includes(staffAction) && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleTransferClick(sample)}
                              title="Transfer"
                            >
                              <FontAwesomeIcon icon={faExchangeAlt} size="sm" />
                            </button>
                          )}

                          {["history", "all"].includes(staffAction) && (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => handleShowHistory("sample", sample.id)}
                              title="History"
                            >
                              <i className="fa fa-history"></i>
                            </button>
                          )}

                        </div>
                      </td>
                    )}
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
        {totalPages >= 0 && (
          <Pagination
            handlePageClick={handlePageChange}
            pageCount={totalPages}
            focusPage={currentPage - 1} // If using react-paginate, which is 0-based
          />
        )}

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
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
              }}
            >
              <div
                className="modal-dialog"
                role="document"
                style={{
                  maxWidth: showAdditionalFields ? "70vw" : "40vw",
                  width: "100%",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <div className="modal-content">
                  <div
                    className="modal-header"
                    style={{ backgroundColor: "#cfe2ff" }}
                  >
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
                  <form onSubmit={showAddModal ? handleSubmit : handleUpdate}>
                    <div className="modal-body">
                      {/* Parallel Columns - 5 columns */}
                      <div className="row">
                        {/* Column 1 */}
                        {!showAdditionalFields && (
                          <div className="col-md-12">
                            <div className="row">
                              {showAddModal && (
                                <div className="form-group col-md-6">
                                  <label>Donor ID <span className="text-danger">*</span></label>
                                 <input
                                    type="text"
                                    className="form-control"
                                    name="donorID"
                                    value={formData.donorID}
                                    onChange={handleInputChange}
                                    required
                                    title="This is the ID of patient generated by hospital"
                                    style={{
                                      height: "45px",
                                      fontSize: "14px",
                                      borderColor: !formData.donorID
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                    }}
                                  />
                                </div>
                              )}
                              <div className="form-group col-md-6">
                                <label>Disease Name <span className="text-danger">*</span></label>
                                <select
                                  className="form-control"
                                  name="diseasename"
                                  value={formData.diseasename}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.diseasename
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                       borderColor: !formData.diseasename
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                    color: "black",
                                    borderWidth:2
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Disease Name
                                  </option>
                                  {diagnosistestparameterNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-group col-md-6">
                                <label>Location (IDs) <span className="text-danger">*</span></label>
                                <InputMask
                                  mask="999-999-999"
                                  maskChar={null}
                                  value={formData.locationids}
                                  onChange={handleInputChange}
                                >
                                  {(inputProps) => (
                                    <input
                                      {...inputProps}
                                      type="text"
                                      className="form-control"
                                      name="locationids"
                                      placeholder="000-000-000"
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: "#f0f0f0",
                                        color: "black",
                                         borderColor: !formData.locationids
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                      }}
                                      required
                                      title="Location ID's = Room Number, Freezer ID and Box ID"
                                    />
                                  )}
                                </InputMask>
                              </div>
                              <div className="form-group col-md-6">
                                <label>Pack size <span className="text-danger">*</span></label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="packsize"
                                  value={formData.packsize}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    height: "45px",
                                    fontSize: "14px",
                                    backgroundColor: formData.packsize
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                       borderColor: !formData.packsize
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                    color: "black",
                                  }}
                                />
                              </div>
                              <div className="form-group col-md-6">
                                <label>Phone Number <span className="text-danger">*</span></label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="phoneNumber"
                                  value={formData.phoneNumber}
                                  onChange={handleInputChange}
                                  style={{
                                     borderColor: !formData.phoneNumber
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                  }}
                                  required
                                />
                              </div>
                              <div className="form-group col-md-6">
                                <label className="form-label">Test Result <span className="text-danger">*</span></label>
                                <div className="d-flex align-items-center">
                                  <div className="btn-group me-2" role="group" aria-label="Sign selector">
                                    <button
                                      type="button"
                                      className={`btn btn-outline-primary ${formData.TestSign === '+' ? 'active' : ''}`}
                                      onClick={() => handleTestResultChange("TestSign", "+")}
                                    >
                                      +
                                    </button>
                                    <button
                                      type="button"
                                      className={`btn btn-outline-primary ${formData.TestSign === '-' ? 'active' : ''}`}
                                      onClick={() => handleTestResultChange("TestSign", "-")}
                                    >
                                      -
                                    </button>
                                  </div>
                                  <input
                                    type="number"
                                    className="form-control"
                                    name="TestValue"
                                    value={formData.TestValue}
                                    
                                    onChange={(e) => handleTestResultChange("TestValue", e.target.value)}
                                    placeholder="Enter value"
                                    style={{ maxWidth: "200px", borderColor: !formData.TestValue
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                         }}
                                  />
                                </div>
                              </div>

                              <div className="form-group col-md-6">
                                <label>Gender <span className="text-danger">*</span></label>
                                <select
                                  className="form-control"
                                  name="gender"
                                  value={formData.gender}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.gender ? "#f0f0f0" : "#f0f0f0",
                                    color: "black",
                                     borderColor: !formData.gender
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                  }}
                                >
                                  <option value="" hidden>
                                  </option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              </div>
                              <div className="form-group col-md-6">
                                <label>Test Result Unit <span className="text-danger">*</span></label>
                                <select
                                  className="form-control"
                                  name="TestResultUnit"
                                  value={formData.TestResultUnit}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    borderWidth:2,
                                    backgroundColor: formData.TestResultUnit
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                     borderColor: !formData.TestResultUnit
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Test Result Unit
                                  </option>
                                  {testresultunitNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="row">
                              <div className="form-group col-md-6">
                                <label>Age (Years) <span className="text-danger">*</span></label>
                                <input
                                  type="number"
                                  className="form-control"
                                  name="age"
                                  value={formData.age}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    height: "45px",
                                    fontSize: "14px",
                                     borderColor: !formData.age
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                    backgroundColor: formData.age ? "#f0f0f0" : "#f0f0f0",
                                    color: "black",
                                  }}
                                />
                              </div>
                              <div className="form-group col-md-6">
                                <label>Quantity <span className="text-danger">*</span></label>
                                <select
                                  className="form-control"
                                  name="QuantityUnit"
                                  
                                  value={formData.QuantityUnit}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    borderWidth:2,
                                     borderColor: !formData.QuantityUnit
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                    backgroundColor: formData.QuantityUnit
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                  </option>
                                  {quantityunitNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="row">
                              <div className="form-group col-md-6">
                                <label>Sample Picture <span className="text-danger">*</span></label>
                                <div className="d-flex align-items-center">
                                  <input
                                    name="logo"
                                    type="file"
                                    id="logo"
                                    accept="image/*"
                                    onChange={(e) => logoHandler(e.target.files[0])}
                                    className="form-control"
                                    style={{
                                      fontSize: "14px",
                                      height: "45px",
                                      backgroundColor: "#f0f0f0",
                                      color: "black",
                                      borderWidth:2,
                                       borderColor: !formData.logo
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                    }}
                                  />
                                  {logoPreview && (
                                    <img
                                      src={logoPreview}
                                      alt="Logo Preview"
                                      width="80"
                                      style={{
                                        marginLeft: "20px",
                                        borderRadius: "5px",
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="form-group col-md-6">
                                <label>Sample Type Matrix <span className="text-danger">*</span></label>
                                <select
                                  className="form-control"
                                  name="SampleTypeMatrix"
                                  value={formData.SampleTypeMatrix}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.SampleTypeMatrix
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                    borderWidth:2,
                                     borderColor: !formData.SampleTypeMatrix
                                        ? "#dc3545"
                                        : "#ced4da", // Red border if empty
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Sample Type Matrix
                                  </option>
                                  {sampletypematrixNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Column 2 */}
                        {showAdditionalFields && (
                          <>
                            <div className="col-md-3">
                              <div className="form-group">
                                <label>Ethnicity</label>
                                <select
                                  className="form-control"
                                  name="ethnicity"
                                  value={formData.ethnicity}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.ethnicity
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Ethnicity
                                  </option>
                                  {ethnicityNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
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
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.samplecondition
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Sample Condition
                                  </option>
                                  {sampleconditionNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
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
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.storagetemp
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Storage Temperature
                                  </option>
                                  {storagetemperatureNames.map(
                                    (name, index) => (
                                      <option key={index} value={name}>
                                        {name}
                                      </option>
                                    )
                                  )}
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
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.ContainerType
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Container type
                                  </option>
                                  {containertypeNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="form-group position-relative">
                                <label>Country Of Collection</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CountryOfCollection"
                                  placeholder="Type to search country"
                                  value={searchCountry}
                                  onChange={(e) => {
                                    setSearchCountry(e.target.value);
                                    setShowCountryDropdown(true);
                                    setSelectedCountry(null);
                                  }}
                                  onFocus={() => setShowCountryDropdown(true)}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: "#f0f0f0",
                                    color: "black",
                                  }}
                                />

                                {showCountryDropdown && (
                                  <ul
                                    className="w-100 position-absolute"
                                    style={{
                                      zIndex: 999,
                                      maxHeight: "200px",
                                      overflowY: "auto",
                                      top: "100%",
                                      left: 0,
                                      right: 0,
                                      backgroundColor: "#f0f0f0",
                                      border: "1px solid #ced4da",
                                      borderTop: "none",
                                      borderRadius: "0 0 4px 4px",
                                      fontSize: "14px",
                                      padding: 0,
                                      margin: 0,
                                      listStyle: "none",
                                    }}
                                  >
                                    {countryname
                                      .filter((country) =>
                                        searchCountry
                                          ? country.name
                                            .toLowerCase()
                                            .includes(
                                              searchCountry.toLowerCase()
                                            )
                                          : true
                                      )
                                      .map((country) => (
                                        <li
                                          key={country.id}
                                          style={{
                                            padding: "10px",
                                            cursor: "pointer",
                                            backgroundColor: "#f0f0f0",
                                          }}
                                          // ✅ Changed from onMouseDown to onClick
                                          onClick={() =>
                                            handleSelectCountry(country)
                                          }
                                          onMouseEnter={(e) =>
                                          (e.currentTarget.style.backgroundColor =
                                            "#e2e2e2")
                                          }
                                          onMouseLeave={(e) =>
                                          (e.currentTarget.style.backgroundColor =
                                            "#f0f0f0")
                                          }
                                        >
                                          {country.name}
                                        </li>
                                      ))}
                                  </ul>
                                )}
                              </div>

                            </div>
                            {/* {Column 3} */}
                            <div className="col-md-3">
                              <div className="form-group">
                                <label className="form-label">
                                  Smoking Status
                                </label>
                                <div className="d-flex">
                                  <div
                                    className="form-check form-check-inline"
                                    style={{ marginRight: "10px" }}
                                  >
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
                                      style={{ transform: "scale(0.9)" }} // Reduce radio button size
                                    />
                                    <label
                                      className="form-check-label"
                                      style={{ fontSize: "14px" }}
                                    >
                                      Smoker
                                    </label>
                                  </div>
                                  <div className="form-check form-check-inline">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="SmokingStatus"
                                      value="Non-Smoker"
                                      checked={
                                        formData.SmokingStatus === "Non-Smoker"
                                      }
                                      onChange={handleInputChange}
                                      required
                                      style={{ transform: "scale(0.9)" }} // Reduce radio button size
                                    />
                                    <label
                                      className="form-check-label"
                                      style={{ fontSize: "14px" }}
                                    >
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
                                      style={{ transform: "scale(0.9)" }}
                                    />
                                    <label
                                      className="form-check-label"
                                      style={{ fontSize: "14px" }}
                                    >
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
                                      style={{ transform: "scale(0.9)" }}
                                    />
                                    <label
                                      className="form-check-label"
                                      style={{ fontSize: "14px" }}
                                    >
                                      No
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="form-group">
                                <label>
                                  Infectious Disease Testing (HIV, HBV, HCV)
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="InfectiousDiseaseTesting"
                                  value={formData.InfectiousDiseaseTesting}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    height: "45px",
                                    fontSize: "14px",
                                    backgroundColor:
                                      formData.InfectiousDiseaseTesting
                                        ? "#f0f0f0"
                                        : "#f0f0f0",
                                    color: "black",
                                  }}
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">
                                  Infectious Disease Result
                                </label>
                                <div>
                                  <div
                                    className="form-check form-check-inline"
                                    style={{ marginRight: "10px" }}
                                  >
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
                                      style={{ transform: "scale(0.9)" }}
                                    />
                                    <label
                                      className="form-check-label"
                                      style={{ fontSize: "14px" }}
                                    >
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
                                      style={{ transform: "scale(0.9)" }}
                                    />
                                    <label
                                      className="form-check-label"
                                      style={{ fontSize: "14px" }}
                                    >
                                      Negative
                                    </label>
                                  </div>
                                </div>
                              </div>
                              <div className="form-group">
                                <label>Freeze Thaw Cycles</label>
                                <select
                                  type="text"
                                  className="form-control"
                                  name="FreezeThawCycles"
                                  value={formData.FreezeThawCycles}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    height: "45px",
                                    fontSize: "14px",
                                    backgroundColor: formData.FreezeThawCycles
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
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
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.DateOfCollection
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
                                />
                              </div>
                            </div>
                            {/* Column 4 */}
                            <div className="col-md-3">
                              <div className="form-group">
                                <label>Concurrent Medical Conditions</label>
                                <select
                                  className="form-control"
                                  name="ConcurrentMedicalConditions"
                                  value={formData.ConcurrentMedicalConditions}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor:
                                      formData.ConcurrentMedicalConditions
                                        ? "#f0f0f0"
                                        : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Concurrent Medical Conditions
                                  </option>
                                  {concurrentmedicalconditionsNames.map(
                                    (name, index) => (
                                      <option key={index} value={name}>
                                        {name}
                                      </option>
                                    )
                                  )}
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
                                  style={{
                                    height: "45px",
                                    fontSize: "14px",
                                    backgroundColor:
                                      formData.ConcurrentMedications
                                        ? "#f0f0f0"
                                        : "#f0f0f0",
                                    color: "black",
                                  }}
                                />
                              </div>



                              <div className="form-group">
                                <label>Test Method</label>
                                <select
                                  className="form-control"
                                  name="TestMethod"
                                  value={formData.TestMethod}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.TestMethod
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Test Method
                                  </option>
                                  {testmethodNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
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
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor:
                                      formData.TestKitManufacturer
                                        ? "#f0f0f0"
                                        : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Test Kit Manufacturer
                                  </option>
                                  {testkitmanufacturerNames.map(
                                    (name, index) => (
                                      <option key={index} value={name}>
                                        {name}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            </div>
                            {/* {Column 5} */}
                            <div className="col-md-3">
                              <div className="form-group">
                                <label>Test System</label>
                                <select
                                  className="form-control"
                                  name="TestSystem"
                                  value={formData.TestSystem}
                                  onChange={handleInputChange}
                                  required
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor: formData.TestSystem
                                      ? "#f0f0f0"
                                      : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Test System
                                  </option>
                                  {testsystemNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
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
                                  style={{
                                    fontSize: "14px",
                                    height: "45px",
                                    backgroundColor:
                                      formData.TestSystemManufacturer
                                        ? "#f0f0f0"
                                        : "#f0f0f0",
                                    color: "black",
                                  }}
                                >
                                  <option value="" hidden>
                                    Select Test System Manufacturer
                                  </option>
                                  {testsystemmanufacturerNames.map(
                                    (name, index) => (
                                      <option key={index} value={name}>
                                        {name}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-between align-items-center">
                      {(staffAction === 'add_full' || staffAction === 'all') && (
                        <div className="form-check my-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="toggleDetails"
                            checked={showAdditionalFields}
                            onChange={() => setShowAdditionalFields(!showAdditionalFields)}
                          />
                          <label className="form-check-label" htmlFor="toggleDetails">
                            Add Additional Details
                          </label>
                        </div>
                      )}

                      <button type="submit" className="btn btn-primary">
                        {showAddModal ? "Save" : "Update"}
                      </button>
                    </div>
                    <div className="text-start text-muted fs-6 mb-3 ms-3">
                      <code>
                        {" "}
                        Please move cursor to field to get help
                      </code>
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
              <form onSubmit={handleTransferSubmit}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
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
                    {collectionSiteNames.map((site, index) => {
                      return (
                        <option key={site.id} value={site.id}>
                          {site.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px" }}>
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
                  <label style={{ display: "block", marginBottom: "5px" }}>
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
                  <label style={{ display: "block", marginBottom: "5px" }}>
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
                    type="submit"
                    onClick={(e) => { handleTransferSubmit(e) }}
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

        {/* Modal for History of Samples */}
        {showHistoryModal && (
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
                top: "60px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div className="modal-dialog modal-md" role="document">
                <div className="modal-content">
                  {/* Modal Header */}
                  <div className="modal-header">
                    <h5 className="modal-title">History</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowHistoryModal(false)}
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

                  {/* Chat-style Modal Body */}
                  <div
                    className="modal-body"
                    style={{
                      maxHeight: "500px",
                      overflowY: "auto",
                      backgroundColor: "#e5ddd5", // WhatsApp-style background
                      padding: "15px",
                      borderRadius: "10px",
                    }}
                  >
                    {historyData && historyData.length > 0 ? (
                      historyData.map((log, index) => {
                        const hiddenFields = [
                          "logo",
                          "ntnNumber",
                          "type",
                          "city",
                          "country",
                          "district",
                          "OrganizationName",
                          "nameofOrganization",
                          "CollectionSiteName",
                          "HECPMDCRegistrationNo",
                          "organization_id",
                          "collectionsite_id",
                        ]; // Add fields you want to hide

                        return (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              marginBottom: "10px",
                            }}
                          >
                            <div
                              style={{
                                padding: "10px 15px",
                                borderRadius: "15px",
                                backgroundColor: "#ffffff",
                                boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                maxWidth: "75%",
                                fontSize: "14px",
                                textAlign: "left",
                              }}
                            >
                              {Object.entries(log).map(([key, value]) =>
                                !hiddenFields.includes(key) ? ( // Only show fields that are NOT in hiddenFields array
                                  <div key={key}>
                                    <b>{key.replace(/_/g, " ")}:</b> {value}
                                  </div>
                                ) : null
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-left">No history available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Modal show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger"> Sample Details</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }} className="bg-light rounded">
          {selectedSample ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ key, label }) => {
                  const value = selectedSample[key];
                  if (value === undefined) return null;

                  return (
                    <div className="col-md-6" key={key}>
                      <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                        <span className="text-muted small fw-bold mb-1">{label}</span>
                        <span className="fs-6 text-dark">{value?.toString() || "----"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted p-3">No details to show</div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0"></Modal.Footer>
      </Modal>
    </section>
  );
};

export default SampleArea;