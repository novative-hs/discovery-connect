import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import InputMask from "react-input-mask";
import { getsessionStorage } from "@utils/sessionStorage";
import Barcode from "react-barcode";

const SampleArea = () => {
  const id = sessionStorage.getItem("userID");
  const [mode, setMode] = useState("");
  const [staffAction, setStaffAction] = useState("");
  const [actions, setActions] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [countryname, setCountryname] = useState([]);
  const [searchCountry, setSearchCountry] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [infectiousdiseasetestingName, setInfectiousdiseasetestingNames] = useState([]);
  const [showTestResultNumericInput, setShowTestResultNumericInput] = useState(false);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [selectedBarcodeId, setSelectedBarcodeId] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [logo, setLogo] = useState("");
  const [editSample, setEditSample] = useState(null);
  const [samples, setSamples] = useState([]);
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [filtertotal, setfiltertotal] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [collectionSiteNames, setCollectionSiteNames] = useState([]);
  const [ethnicityNames, setEthnicityNames] = useState([]);
  const [sampleconditionNames, setSampleConditionNames] = useState([]);
  const [storagetemperatureNames, setStorageTemperatureNames] = useState([]);
  const [containertypeNames, setContainerTypeNames] = useState([]);
  const [volumeunitNames, setVolumeUnitNames] = useState([]);
  const [sampletypematrixNames, setSampleTypeMatrixNames] = useState([]);
  const [testmethodNames, setTestMethodNames] = useState([]);
  const [testresultunitNames, setTestResultUnitNames] = useState([]);
  const [concurrentmedicalconditionsNames, setConcurrentMedicalConditionsNames] = useState([]);
  const [testkitmanufacturerNames, setTestKitManufacturerNames] = useState([]);
  const [testsystemNames, setTestSystemNames] = useState([]);
  const [testsystemmanufacturerNames, setTestSystemManufacturerNames] = useState([]);
  const [AnalyteNames, setAnalyteNames] = useState([]);
  const [showAdditionalFields, setShowAdditionalFields] = React.useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [transferDetails, setTransferDetails] = useState({
    TransferTo: id,
    dispatchVia: "",
    dispatcherName: "",
    dispatchReceiptNumber: "",
    Quantity: 1,
  });

  const openModal = (sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };

  const tableHeaders = [
    { label: "Patient Name", key: "PatientName" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "MRNumber", key: "MRNumber" },
    { label: "Location", key: "locationids" },
    { label: "Analyte", key: "Analyte" },
    { label: "Test Result & Unit", key: "TestResult" },
    { label: "Volume", key: "volume" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
    { label: "Barcode", key: "barcode" },
  ];

  const fieldsToShowInOrder = [
    { label: "Container Type", key: "ContainerType" },
    { label: "Phone Number", key: "phoneNumber" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
    { label: "Date Of Sampling", key: "DateOfSampling" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
  ];

  const [formData, setFormData] = useState({
    patientname: "",
    locationids: "",
    Analyte: "",
    age: "",
    phoneNumber: "",
    gender: "",
    ethnicity: "",
    samplecondition: "",
    storagetemp: "",
    ContainerType: "",
    CountryOfCollection: "",
    quantity: 1,
    volume: "",
    VolumeUnit: "",
    SampleTypeMatrix: "",
    SmokingStatus: "",
    AlcoholOrDrugAbuse: "",
    InfectiousDiseaseTesting: "",
    InfectiousDiseaseResult: "",
    FreezeThawCycles: "",
    DateOfSampling: "",
    ConcurrentMedicalConditions: "",
    ConcurrentMedications: "",
    Analyte: "",
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

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setFormData((prev) => ({
      ...prev,
      CountryOfCollection: country.name,
    }));
    setSearchCountry(country.name);
    setShowCountryDropdown(false);
  };
  useEffect(() => {
    const action = sessionStorage.getItem("staffAction") || "";
    console.log("staffAction from sessionStorage:", action);
    setStaffAction(action);

    const splitActions = action.split(",").map(a => a.trim());
    console.log("Parsed actions array:", splitActions);
    setActions(splitActions);
  }, []);

  // Fetch countries from backend
  useEffect(() => {

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
    { name: "volumeunit", setter: setVolumeUnitNames },
    { name: "sampletypematrix", setter: setSampleTypeMatrixNames },
    { name: "testmethod", setter: setTestMethodNames },
    { name: "testresultunit", setter: setTestResultUnitNames },
    { name: "concurrentmedicalconditions", setter: setConcurrentMedicalConditionsNames },
    { name: "testkitmanufacturer", setter: setTestKitManufacturerNames },
    { name: "testsystem", setter: setTestSystemNames },
    { name: "testsystemmanufacturer", setter: setTestSystemManufacturerNames },
    { name: "analyte", setter: setAnalyteNames },
    { name: "infectiousdiseasetesting", setter: setInfectiousdiseasetestingNames },
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

    // Build URLs
    let ownResponseurl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/get/${id}`;
    let receivedResponseurl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereceive/get/${id}`;

    if (searchField && searchValue) {
      ownResponseurl += `?searchField=${searchField}&searchValue=${searchValue}`;
      receivedResponseurl += `?searchField=${searchField}&searchValue=${searchValue}`;
    }

    const [ownResponse, receivedResponse] = await Promise.all([
      axios.get(ownResponseurl),
      axios.get(receivedResponseurl),
    ]);

    const ownSamples = ownResponse.data.samples.map((s) => ({
      ...s,
      quantity: Number(s.quantity ?? s.Quantity ?? 0),
      logo: s.logo?.data
        ? `data:image/jpeg;base64,${Buffer.from(s.logo.data).toString("base64")}`
        : "",
      isReturn: false,
    }));

    const receivedSamples = receivedResponse.data.samples.map((s) => ({
      ...s,
      quantity: Number(s.quantity ?? s.Quantity ?? 0),
      isReturn: true,
    }));

    // Merge and deduplicate by ID
    const sampleMap = new Map();
    [...ownSamples, ...receivedSamples].forEach((sample) => {
      const sampleId = sample.id;
      if (sampleMap.has(sampleId)) {
        const existing = sampleMap.get(sampleId);
        existing.quantity += sample.quantity;
        if (!sample.isReturn) existing.isReturn = false;
        sampleMap.set(sampleId, existing);
      } else {
        sampleMap.set(sampleId, { ...sample });
      }
    });

    const merged = Array.from(sampleMap.values());

    // Pagination on merged list
    const totalCount = merged.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginated = merged.slice((page - 1) * pageSize, page * pageSize);

    setSamples(merged);
    setFilteredSamplename(paginated);
    setTotalPages(totalPages);
    setfiltertotal(totalPages);

  } catch (error) {
    console.error("Fetch error:", error);
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
    let filtered = [];

    if (value.trim() === "") {
      filtered = samples;
    } else {
      const lowerValue = value.toLowerCase();

      filtered = samples.filter((sample) => {
        if (field === "volume") {
          const combinedVolume = `${sample.volume ?? ""} ${sample.VolumeUnit ?? ""}`.toLowerCase();
          return combinedVolume.includes(lowerValue);
        }

        if (field === "TestResult") {
          const combinedPrice = `${sample.TestResult ?? ""} ${sample.TestResultUnit ?? ""}`.toLowerCase();
          return combinedPrice.includes(lowerValue);
        }

        if (field === "gender") {
          return sample.gender?.toLowerCase().startsWith(lowerValue); // safe partial match
        }
        if (field === "sample_visibility") {
          return sample.sample_visibility?.toLowerCase().startsWith(lowerValue); // safe partial match
        }

        return sample[field]?.toString().toLowerCase().includes(lowerValue);
      });
    }

    setFilteredSamplename(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  };

 const handlePageChange = (event) => {
  const selectedPage = event.selected + 1; // Because react-paginate is 0-indexed
  setCurrentPage(selectedPage); // Correct ✅
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
    let isMounted = true;
    e.preventDefault();
    const formDataToSend = new FormData();
    for (let key in formData) {
      formDataToSend.append(key, formData[key]);
    }
    formDataToSend.append("mode", mode); // append mode
    try {
      // POST request to your backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/postsample`,
        formDataToSend,
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
      resetFormData();
      setLogoPreview(false);
      setShowAdditionalFields(false);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding sample:", error);
    }
  };

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
    setMode(sample.samplemode || "individual")
    // Combine the location parts into "room-box-freezer" format
    const formattedLocationId = `${String(sample.room_number).padStart(3, "0")}-${String(sample.freezer_id).padStart(3, "0")}-${String(sample.box_id).padStart(3, "0")}`;

    // Extract TestSign and TestValue from TestResult
    const testResult = sample.TestResult || "";
    const testResultMatch = testResult.match(/^([<>]=?|=|\+|-)?\s*(.*)$/);
    const TestSign = testResultMatch ? (testResultMatch[1] || "=") : "=";
    const TestValue = testResultMatch ? testResultMatch[2] || "" : "";


    setFormData({
      patientname: sample.PatientName,
      MRNumber: sample.MRNumber,
      locationids: formattedLocationId,
      Analyte: sample.Analyte,
      volume: sample.volume,
      age: sample.age,
      phoneNumber: sample.phoneNumber,
      gender: sample.gender,
      ethnicity: sample.ethnicity,
      samplecondition: sample.samplecondition,
      storagetemp: sample.storagetemp,
      ContainerType: sample.ContainerType,
      CountryOfCollection: sample.CountryOfCollection,
      quantity: sample.quantity,
      VolumeUnit: sample.VolumeUnit,
      SampleTypeMatrix: sample.SampleTypeMatrix,
      SmokingStatus: sample.SmokingStatus,
      AlcoholOrDrugAbuse: sample.AlcoholOrDrugAbuse,
      InfectiousDiseaseTesting: sample.InfectiousDiseaseTesting,
      InfectiousDiseaseResult: sample.InfectiousDiseaseResult,
      FreezeThawCycles: sample.FreezeThawCycles,
      DateOfSampling: sample.DateOfSampling,
      ConcurrentMedicalConditions: sample.ConcurrentMedicalConditions,
      ConcurrentMedications: sample.ConcurrentMedications,
      Analyte: sample.Analyte,
      // TestResult: sample.TestResult,
      TestSign,
      TestValue,
      TestResult: testResult,
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
      patientname: "",
      locationids: "",
      Analyte: "",
      age: "",
      volume: "",
      gender: "",
      phoneNumber: "",
      ethnicity: "",
      samplecondition: "",
      storagetemp: "",
      ContainerType: "",
      CountryOfCollection: "",
      quantity: 1,
      VolumeUnit: "",
      SampleTypeMatrix: "",
      SmokingStatus: "",
      AlcoholOrDrugAbuse: "",
      InfectiousDiseaseTesting: "",
      InfectiousDiseaseResult: "",
      FreezeThawCycles: "",
      DateOfSampling: "",
      ConcurrentMedicalConditions: "",
      ConcurrentMedications: "",
      Analyte: "",
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
    setMode("");
    setShowAdditionalFields(false);
    setLogoPreview(null)
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Add all fields to FormData
    for (const key in formData) {
      // Skip adding logo here — we handle it separately
      if (key !== "logo") {
        formDataToSend.append(key, formData[key]);
      }
    }

    // Add logo only if it's a File (means it's a new upload)
    if (formData.logo instanceof File) {
      formDataToSend.append("logo", formData.logo);
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/edit/${selectedSampleId}`,
        formDataToSend,
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

  const areMandatoryFieldsFilled = () => {
    if (mode === "individual") {
      return (
        formData.patientname?.toString().trim() &&
        formData.MRNumber?.toString().trim() &&
        formData.Analyte?.toString().trim() &&
        formData.locationids?.toString().trim() &&
        formData.volume !== "" &&
        formData.phoneNumber?.toString().trim() &&
        formData.TestResult?.toString().trim() &&
        formData.gender?.toString().trim() &&
        formData.SampleTypeMatrix?.toString().trim() &&
        formData.age !== "" &&
        formData.ContainerType?.toString().trim() &&
        formData.logo instanceof File
      );
    } else if (mode === "pool") {
      return (
        formData.MRNumber?.toString().trim() &&
        formData.Analyte?.toString().trim() &&
        formData.locationids?.toString().trim() &&
        formData.volume !== "" &&
        formData.TestResult?.toString().trim() &&
        formData.TestResultUnit?.toString().trim() &&
        formData.SampleTypeMatrix?.toString().trim() &&
        formData.ContainerType?.toString().trim() &&
        formData.logo instanceof File
      );
    }
  };


  const unitMaxValues = {
    L: 100,
    mL: 10000,
    mg: 10000,
    g: 5000,
  };

  const handlePrint = () => {
    const barcodeId = selectedBarcodeId?.toString() || "";

    const printWindow = window.open("", "", "width=400,height=600");
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <style>
          @page {
            margin: 5mm;
          }
          body {
            margin: 0;
            padding: 0;
            text-align: center;
            font-family: Arial, sans-serif;
          }
          #barcode {
            width: 130px;
            height: 80px;
            margin: 0 auto;
            page-break-inside: avoid;
            break-inside: avoid;
            /* Remove or keep transform as needed */
            transform: scale(1);
            transform-origin: center;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <svg id="barcode"></svg>
        <script>
          window.onload = function() {
            JsBarcode("#barcode", "${barcodeId}", {
              format: "CODE128",
               height: 80,  
              width: 0.8,
              displayValue: false,
              margin: 0
            });
            setTimeout(() => {
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  if (id === null) {
    return <div>Loading...</div>;
  }


  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success w-100 text-start mb-2 small">
            {successMessage}
          </div>
        )}
        <div className="text-danger fw-bold" style={{ marginTop: "-20px" }}>
          <h6>
            Note: Click on Location Id's to see Sample Picture.
          </h6>
        </div>

        {/* Button */}
        <div className="d-flex justify-content-end align-items-end flex-wrap gap-2 mb-4">
          {/* Button */}
          {actions.some(a => ['add_full', 'add_basic', 'edit', 'dispatch', 'receive', 'all'].includes(a)) && (
            <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">
              {(actions.includes('add_full') || actions.includes('add_basic') || actions.includes('all')) && (
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
              )}
            </div>
          )}
        </div>

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
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        // style={{ minWidth: "100px", maxWidth: "120px", width: "100px" }}  // a bit wide table 
                        style={{ width: "100%" }}
                      />
                      <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-6">
                        {label}
                      </span>

                    </div>
                  </th>
                ))}
                {actions.some(action => ['add_full', 'add_basic', 'edit', 'dispatch', 'receive', 'all'].includes(action)) && (
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
                            : key === "Analyte" || key === "PatientName"
                              ? "text-start"
                              : "text-center text-truncate"
                        }
                        style={{ maxWidth: "150px", wordWrap: "break-word", whiteSpace: "normal" }}
                      >
                        {key === "Analyte" ? (
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
                            {sample.Analyte || "----"}
                          </span>
                        ) : (
                          (() => {
                            if (key === "locationids") {
                              const tooltip = `${sample.room_number || "N/A"} = Room Number
${sample.freezer_id || "N/A"} = Freezer ID
${sample.box_id || "N/A"} = Box ID`;

                              // To show logo while clicking on location IDs
                              const handleLogoClick = () => {
                                const logo =
                                  typeof sample.logo === "string"
                                    ? sample.logo
                                    : sample.logo?.data
                                      ? URL.createObjectURL(
                                        new Blob([new Uint8Array(sample.logo.data)], { type: "image/png" })
                                      )
                                      : null;
                                if (logo) {
                                  setSelectedLogoUrl(logo);
                                  setShowLogoModal(true);
                                }
                              };

                              return (
                                <span title={tooltip} style={{ cursor: "help", textDecoration: "underline", color: "#007bff" }} onClick={handleLogoClick}>
                                  {sample.locationids || "----"}
                                </span>
                              );
                            } else if (key === "volume") {
                              return `${sample.volume} ${sample.VolumeUnit || ""}`;
                            }
                            else if (key === "barcode") {
                              return <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => {
                                  setSelectedBarcodeId(sample.id);
                                  setShowBarcodeModal(true);
                                }}
                              >
                                Show Barcode
                              </button>
                            }
                            else if (key === "age") {
                              if (!sample.age || sample.age === 0) {
                                return "-----";
                              }
                              return `${sample.age} years`;
                            } else if (key === "TestResult") {
                              return `${sample.TestResult} ${sample.TestResultUnit || ""}`;
                            } else {
                              return sample[key] || "----";
                            }
                          })()
                        )}
                      </td>
                    ))}
                    {actions.some(action => ["edit", "dispatch", "history", "all"].includes(action)) && (
                      <td className="text-center align-middle">
                        <div className="d-flex justify-content-center gap-2 px-1">

                          {(actions.includes("edit") || actions.includes("all")) && (
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditClick(sample)}
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faEdit} size="sm" />
                            </button>
                          )}

                          {(actions.includes("dispatch") || actions.includes("all")) && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleTransferClick(sample)}
                              title="Transfer"
                            >
                              <FontAwesomeIcon icon={faExchangeAlt} size="sm" />
                            </button>
                          )}

                          {(actions.includes("history") || actions.includes("all")) && (
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
            focusPage={currentPage-1} // If using react-paginate, which is 0-based
          />
        )}

        {/* Modal for Generating Barcode for Samples */}
        {showBarcodeModal && (
          <div
            className="modal show d-block"
            tabIndex="-1"
            onClick={() => setShowBarcodeModal(false)}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              style={{ maxWidth: "700px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-content p-4 text-center"
                id="barcode-modal"
                style={{
                  margin: 0,
                  padding: "1rem",
                  boxShadow: "none",
                  border: "none",
                  maxHeight: "100vh",
                  overflow: "hidden",
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                  height: "auto",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Barcode
                  value={selectedBarcodeId?.toString() || ""}
                  height={50}         // Shrink height
                  width={0.8}         // Thinner bars
                  displayValue={false}
                  margin={0}          // Remove extra space
                />
                {/* Buttons - hide on print */}
                <div
                  className="d-flex justify-content-center gap-2 mt-4 d-print-none"
                  style={{ width: "100%" }}
                >
                  <button
                    className="btn btn-outline-primary"
                    onClick={handlePrint}
                  >
                    Print Barcode
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowBarcodeModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
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
                top: "-30px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "100%",
                overflow: "hidden",
                transition: "top 0.3s ease-in-out",
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
                      {showAddModal && (
                        <div className="mb-4 px-3">
                          <label className="form-label fw-bold fs-6 mb-3 text-dark">
                            Add sample as:
                          </label>

                          <div className="d-flex gap-4">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="mode"
                                id="individualRadio"
                                value="individual"
                                checked={mode === "individual"}
                                onChange={() => setMode("individual")}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="individualRadio"
                              >
                                Individual Sample
                              </label>
                            </div>

                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="mode"
                                id="poolRadio"
                                value="pool"
                                checked={mode === "pool"}
                                onChange={() => setMode("pool")}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="poolRadio"
                              >
                                Pool Sample
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Parallel Columns - 5 columns */}
                      <div className="row">
                        {mode === "individual" && (
                          <>
                            {/* Column 1 */}
                            {!showAdditionalFields && (
                              <div className="col-md-12">
                                <div className="row">
                                  <div className="form-group col-md-6">
                                    <label>
                                      Patient Name{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="patientname"
                                      value={formData.patientname}
                                      onChange={handleInputChange}
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.patientname
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                      required
                                    />
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label>
                                      Age (Years){" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="number"
                                      className="form-control"
                                      name="age"
                                      value={formData.age}
                                      onChange={handleInputChange}
                                      required
                                      min="1"
                                      max="150"
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.age
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                    />
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label>
                                      Gender <span className="text-danger">*</span>
                                    </label>
                                    <select
                                      className="form-control"
                                      name="gender"
                                      value={formData.gender}
                                      onChange={handleInputChange}
                                      required
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.gender
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                    >
                                      <option value="" hidden></option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                    </select>
                                  </div>
                                  {showAddModal && (
                                    <div className="form-group col-md-6">
                                      <label>
                                        Medical Record Number{" "}
                                        <span className="text-danger">*</span>
                                      </label>
                                      <input
                                        type="text"
                                        className="form-control"
                                        name="MRNumber"
                                        value={formData.MRNumber}
                                        onChange={handleInputChange}
                                        required
                                        title="This is the Number of patient generated by hospital"
                                        style={{
                                          height: "45px",
                                          fontSize: "14px",
                                          backgroundColor: !formData.MRNumber
                                            ? "#fdecea"
                                            : "#fff",
                                        }}
                                      />
                                    </div>
                                  )}
                                  <div className="form-group col-md-6">
                                    <label>
                                      Phone Number{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="phoneNumber"
                                      value={formData.phoneNumber}
                                      onChange={handleInputChange}
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.phoneNumber
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                      pattern="03[0-9]{2}-[0-9]{7}"
                                      title="Format should be XXXX-XXXXXXX"
                                      required
                                    />
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label>
                                      Location (IDs){" "}
                                      <span className="text-danger">*</span>
                                    </label>
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
                                            backgroundColor: !formData.locationids
                                              ? "#fdecea"
                                              : "#fff",
                                          }}
                                          required
                                          title="Location ID's = Room Number, Freezer ID and Box ID"
                                        />
                                      )}
                                    </InputMask>
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label>
                                      Analyte{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <select
                                      className="form-control"
                                      name="Analyte"
                                      value={formData.Analyte}
                                      onChange={handleInputChange}
                                      required
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.Analyte
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                    >
                                      <option value="" hidden></option>
                                      {AnalyteNames.map(
                                        (name, index) => (
                                          <option key={index} value={name}>
                                            {name}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label>
                                      Test Result & Unit{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <div
                                      style={{
                                        display: "flex",
                                        gap: "10px",
                                        alignItems: "center",
                                      }}
                                    >
                                      {/* Test Result Dropdown or Numeric Input */}
                                      {!showTestResultNumericInput ? (
                                        <select
                                          className="form-control"
                                          value={formData.TestResult}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === "Value") {
                                              setShowTestResultNumericInput(true);
                                              setFormData((prev) => ({
                                                ...prev,
                                                TestResult: "",
                                              }));
                                            } else {
                                              setShowTestResultNumericInput(false); // Ensure this is reset
                                              setFormData((prev) => ({
                                                ...prev,
                                                TestResult: val,
                                                TestResultUnit: "",
                                              }));
                                            }
                                          }}
                                          required
                                          style={{
                                            height: "40px",
                                            fontSize: "14px",
                                            backgroundColor: !formData.TestResult
                                              ? "#fdecea"
                                              : "#fff",
                                            minWidth: "140px",
                                          }}
                                        >
                                          <option value="" disabled hidden>
                                            Select result
                                          </option>
                                          <option value="Positive">Positive</option>
                                          <option value="Negative">Negative</option>
                                          <option value="Value">Value</option>
                                        </select>
                                      ) : (
                                        <input
                                          type="number"
                                          className="form-control"
                                          placeholder="Enter numeric value"
                                          value={formData.TestResult}
                                          onChange={(e) =>
                                            setFormData((prev) => ({
                                              ...prev,
                                              TestResult: e.target.value,
                                            }))
                                          }
                                          required
                                          style={{
                                            width: "110px",
                                            height: "40px",
                                            fontSize: "14px",
                                            backgroundColor: !formData.TestResult
                                              ? "#fdecea"
                                              : "#fff",
                                            paddingRight: "10px",
                                          }}
                                          autoFocus
                                          onBlur={() => {
                                            if (!formData.TestResult) {
                                              setShowTestResultNumericInput(false);
                                              setFormData((prev) => ({
                                                ...prev,
                                                TestResultUnit: "",
                                              })); // Clear unit
                                            }
                                          }}
                                        />
                                      )}
                                      {/* Conditionally render Unit Dropdown */}
                                      {showTestResultNumericInput && (
                                        <select
                                          className="form-control"
                                          name="TestResultUnit"
                                          value={formData.TestResultUnit}
                                          onChange={handleInputChange}
                                          required
                                          style={{
                                            height: "40px",
                                            fontSize: "14px",
                                            backgroundColor:
                                              !formData.TestResultUnit
                                                ? "#fdecea"
                                                : "#fff",
                                            minWidth: "100px",
                                          }}
                                        >
                                          <option value="" hidden>
                                            Unit
                                          </option>
                                          {testresultunitNames.map(
                                            (name, index) => (
                                              <option key={index} value={name}>
                                                {name}
                                              </option>
                                            )
                                          )}
                                        </select>
                                      )}
                                    </div>
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label>
                                      Volume <span className="text-danger">*</span>
                                    </label>
                                    <div className="d-flex">
                                      <input
                                        type="number"
                                        className="form-control me-2"
                                        name="volume"
                                        value={formData.volume}
                                        onChange={(e) => {
                                          const value = parseFloat(e.target.value);
                                          if (
                                            e.target.value === "" ||
                                            (value * 10) % 5 === 0
                                          ) {
                                            handleInputChange(e);
                                          }
                                        }}
                                        step="0.5"
                                        min="0.5"
                                        max={
                                          unitMaxValues[formData.VolumeUnit] ||
                                          undefined
                                        }
                                        required
                                        style={{
                                          height: "45px",
                                          fontSize: "14px",
                                          backgroundColor: !formData.volume
                                            ? "#fdecea"
                                            : "#fff",
                                        }}
                                      />
                                      <select
                                        className="form-control"
                                        name="VolumeUnit"
                                        value={formData.VolumeUnit}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                          height: "45px",
                                          fontSize: "14px",
                                          backgroundColor: !formData.VolumeUnit
                                            ? "#fdecea"
                                            : "#fff",
                                        }}
                                      >
                                        <option value="" hidden>
                                          Select Unit
                                        </option>
                                        {volumeunitNames.map((name, index) => (
                                          <option key={index} value={name}>
                                            {name}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    {/* Validation message*/}
                                    {formData.volume &&
                                      formData.VolumeUnit &&
                                      parseFloat(formData.volume) >
                                      (unitMaxValues[formData.VolumeUnit] ||
                                        Infinity) && (
                                        <small className="text-danger mt-1">
                                          Value must be less than or equal to{" "}
                                          {unitMaxValues[
                                            formData.VolumeUnit
                                          ].toLocaleString()}
                                          .
                                        </small>
                                      )}
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label>
                                      Sample Type Matrix{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <select
                                      className="form-control"
                                      name="SampleTypeMatrix"
                                      value={formData.SampleTypeMatrix}
                                      onChange={handleInputChange}
                                      required
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.SampleTypeMatrix
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                    >
                                      <option value="" hidden></option>
                                      {sampletypematrixNames.map((name, index) => (
                                        <option key={index} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                                <div className="row">
                                  <div className="form-group col-md-6">
                                    <label>
                                      Container Type{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <select
                                      className="form-control"
                                      name="ContainerType"
                                      value={formData.ContainerType}
                                      onChange={handleInputChange}
                                      required
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.ContainerType
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                    >
                                      <option value="" hidden></option>
                                      {containertypeNames.map((name, index) => (
                                        <option key={index} value={name}>
                                          {name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="form-group col-md-6">
                                    <label>
                                      Sample Picture{" "}
                                      <span className="text-danger">*</span>
                                    </label>
                                    <div className="d-flex align-items-center">
                                      <input
                                        name="logo"
                                        type="file"
                                        id="logo"
                                        accept="image/*"
                                        onChange={(e) =>
                                          logoHandler(e.target.files[0])
                                        }
                                        required={!formData.logo} // only required if no logo is set
                                        className="form-control"
                                        style={{
                                          height: "45px",
                                          fontSize: "14px",
                                          backgroundColor: !formData.logo
                                            ? "#fdecea"
                                            : "#fff",
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
                                      style={{
                                        fontSize: "14px",
                                        height: "45px",
                                        backgroundColor: formData.ethnicity
                                          ? "#f0f0f0"
                                          : "#f0f0f0",
                                        color: "black",
                                      }}
                                    >
                                      <option value="" hidden></option>
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
                                      style={{
                                        fontSize: "14px",
                                        height: "45px",
                                        backgroundColor: formData.samplecondition
                                          ? "#f0f0f0"
                                          : "#f0f0f0",
                                        color: "black",
                                      }}
                                    >
                                      <option value="" hidden></option>
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
                                      style={{
                                        fontSize: "14px",
                                        height: "45px",
                                        backgroundColor: formData.storagetemp
                                          ? "#f0f0f0"
                                          : "#f0f0f0",
                                        color: "black",
                                      }}
                                    >
                                      <option value="" hidden></option>
                                      {storagetemperatureNames.map(
                                        (name, index) => (
                                          <option key={index} value={name}>
                                            {name}
                                          </option>
                                        )
                                      )}
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
                                    <select
                                      className="form-control"
                                      name="TestResultUnit"
                                      value={formData.InfectiousDiseaseTesting}
                                      onChange={handleInputChange}
                                      style={{
                                        fontSize: "14px",
                                        height: "45px",
                                        backgroundColor:
                                          formData.InfectiousDiseaseTesting
                                            ? "#f0f0f0"
                                            : "#f0f0f0",
                                        color: "black",
                                      }}
                                    >
                                      <option value="" hidden></option>
                                      {infectiousdiseasetestingName.map(
                                        (name, index) => (
                                          <option key={index} value={name}>
                                            {name}
                                          </option>
                                        )
                                      )}
                                    </select>
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
                                </div>
                                {/* Column 4 */}
                                <div className="col-md-3">
                                  <div className="form-group">
                                    <label>Freeze Thaw Cycles</label>
                                    <select
                                      type="text"
                                      className="form-control"
                                      name="FreezeThawCycles"
                                      value={formData.FreezeThawCycles}
                                      onChange={handleInputChange}
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
                                    <label>Date Of Sampling</label>
                                    <input
                                      type="date"
                                      className="form-control"
                                      name="DateOfSampling"
                                      value={formData.DateOfSampling}
                                      onChange={handleInputChange}
                                      max={new Date().toISOString().split("T")[0]} // Set max to today’s date
                                      style={{
                                        fontSize: "14px",
                                        height: "45px",
                                        backgroundColor: formData.DateOfSampling
                                          ? "#f0f0f0"
                                          : "#f0f0f0",
                                        color: "black",
                                      }}
                                    />
                                  </div>
                                  <div className="form-group">
                                    <label>Concurrent Medical Conditions</label>
                                    <select
                                      className="form-control"
                                      name="ConcurrentMedicalConditions"
                                      value={formData.ConcurrentMedicalConditions}
                                      onChange={handleInputChange}
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
                                      <option value="" hidden></option>
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
                                </div>
                                {/* {Column 5} */}
                                <div className="col-md-3">
                                  <div className="form-group">
                                    <label>Test Method</label>
                                    <select
                                      className="form-control"
                                      name="TestMethod"
                                      value={formData.TestMethod}
                                      onChange={handleInputChange}
                                      style={{
                                        fontSize: "14px",
                                        height: "45px",
                                        backgroundColor: formData.TestMethod
                                          ? "#f0f0f0"
                                          : "#f0f0f0",
                                        color: "black",
                                      }}
                                    >
                                      <option value="" hidden></option>
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
                                      <option value="" hidden></option>
                                      {testkitmanufacturerNames.map(
                                        (name, index) => (
                                          <option key={index} value={name}>
                                            {name}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label>Test System</label>
                                    <select
                                      className="form-control"
                                      name="TestSystem"
                                      value={formData.TestSystem}
                                      onChange={handleInputChange}
                                      style={{
                                        fontSize: "14px",
                                        height: "45px",
                                        backgroundColor: formData.TestSystem
                                          ? "#f0f0f0"
                                          : "#f0f0f0",
                                        color: "black",
                                      }}
                                    >
                                      <option value="" hidden></option>
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
                                      <option value="" hidden></option>
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
                          </>
                        )}
                        {mode === "pool" && (
                          <>
                            {/* Only show selected fields in pool mode */}
                            <div className="col-md-12">
                              <div className="row">
                                <div className="form-group col-md-6">
                                  <label>
                                    Location (IDs){" "}
                                    <span className="text-danger">*</span>
                                  </label>
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
                                          backgroundColor:
                                            !formData.locationids
                                              ? "#fdecea"
                                              : "#fff",
                                        }}
                                        required
                                        title="Location ID's = Room Number, Freezer ID and Box ID"
                                      />
                                    )}
                                  </InputMask>
                                </div>
                                <div className="form-group col-md-6">
                                  <label>
                                    Analyte{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className="form-control"
                                    name="Analyte"
                                    value={formData.Analyte}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                      height: "45px",
                                      fontSize: "14px",
                                      backgroundColor: !formData.Analyte
                                        ? "#fdecea"
                                        : "#fff",
                                    }}
                                  >
                                    <option value="" hidden></option>
                                    {AnalyteNames.map(
                                      (name, index) => (
                                        <option key={index} value={name}>
                                          {name}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </div>
                                <div className="form-group col-md-6">
                                  <label>
                                    Test Result & Unit{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "10px",
                                      alignItems: "center",
                                    }}
                                  >
                                    {/* Test Result Dropdown or Numeric Input */}
                                    {!showTestResultNumericInput ? (
                                      <select
                                        className="form-control"
                                        value={formData.TestResult}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          if (val === "Value") {
                                            setShowTestResultNumericInput(
                                              true
                                            );
                                            setFormData((prev) => ({
                                              ...prev,
                                              TestResult: "",
                                            }));
                                          } else {
                                            setShowTestResultNumericInput(
                                              false
                                            ); // Ensure this is reset
                                            setFormData((prev) => ({
                                              ...prev,
                                              TestResult: val,
                                              TestResultUnit: "",
                                            })); // Clear unit
                                          }
                                        }}
                                        required
                                        style={{
                                          height: "40px",
                                          fontSize: "14px",
                                          backgroundColor:
                                            !formData.TestResult
                                              ? "#fdecea"
                                              : "#fff",
                                          minWidth: "140px",
                                        }}
                                      >
                                        <option value="" disabled hidden>
                                          Select result
                                        </option>
                                        <option value="Positive">
                                          Positive
                                        </option>
                                        <option value="Negative">
                                          Negative
                                        </option>
                                        <option value="Value">Value</option>
                                      </select>
                                    ) : (
                                      <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Enter numeric value"
                                        value={formData.TestResult}
                                        onChange={(e) =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            TestResult: e.target.value,
                                          }))
                                        }
                                        required
                                        style={{
                                          width: "110px",
                                          height: "40px",
                                          fontSize: "14px",
                                          backgroundColor:
                                            !formData.TestResult
                                              ? "#fdecea"
                                              : "#fff",
                                          paddingRight: "10px",
                                        }}
                                        autoFocus
                                        onBlur={() => {
                                          if (!formData.TestResult) {
                                            setShowTestResultNumericInput(
                                              false
                                            );
                                            setFormData((prev) => ({
                                              ...prev,
                                              TestResultUnit: "",
                                            })); // Clear unit
                                          }
                                        }}
                                      />
                                    )}
                                    {/* Conditionally render Unit Dropdown */}
                                    {showTestResultNumericInput && (
                                      <select
                                        className="form-control"
                                        name="TestResultUnit"
                                        value={formData.TestResultUnit}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                          height: "40px",
                                          fontSize: "14px",
                                          backgroundColor:
                                            !formData.TestResultUnit
                                              ? "#fdecea"
                                              : "#fff",
                                          minWidth: "100px",
                                        }}
                                      >
                                        <option value="" hidden>
                                          Unit
                                        </option>
                                        {testresultunitNames.map(
                                          (name, index) => (
                                            <option key={index} value={name}>
                                              {name}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    )}
                                  </div>
                                </div>
                                <div className="form-group col-md-6">
                                  <label>
                                    Volume{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="d-flex">
                                    <input
                                      type="number"
                                      className="form-control me-2"
                                      name="volume"
                                      value={formData.volume}
                                      onChange={(e) => {
                                        const value = parseFloat(
                                          e.target.value
                                        );
                                        const max =
                                          unitMaxValues[
                                          formData.VolumeUnit
                                          ] || Infinity;

                                        if (
                                          e.target.value === "" ||
                                          ((value * 10) % 5 === 0 &&
                                            value <= max)
                                        ) {
                                          handleInputChange(e);
                                        }
                                      }}
                                      step="0.5"
                                      min="0.5"
                                      max={
                                        unitMaxValues[
                                        formData.VolumeUnit
                                        ] || undefined
                                      }
                                      required
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.volume
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                    />
                                    <select
                                      className="form-control"
                                      name="VolumeUnit"
                                      value={formData.VolumeUnit}
                                      onChange={handleInputChange}
                                      required
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor:
                                          !formData.VolumeUnit
                                            ? "#fdecea"
                                            : "#fff",
                                      }}
                                    >
                                      <option value="" hidden>
                                        Select Unit
                                      </option>
                                      {volumeunitNames.map(
                                        (name, index) => (
                                          <option key={index} value={name}>
                                            {name}
                                          </option>
                                        )
                                      )}
                                    </select>
                                  </div>
                                  {/* Validation message*/}
                                  {formData.volume &&
                                    formData.VolumeUnit &&
                                    parseFloat(formData.volume) >
                                    (unitMaxValues[formData.VolumeUnit] ||
                                      Infinity) && (
                                      <small className="text-danger mt-1">
                                        Value must be less than or equal to{" "}
                                        {unitMaxValues[
                                          formData.VolumeUnit
                                        ].toLocaleString()}
                                        .
                                      </small>
                                    )}
                                </div>
                                <div className="form-group col-md-6">
                                  <label>
                                    Sample Type Matrix{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className="form-control"
                                    name="SampleTypeMatrix"
                                    value={formData.SampleTypeMatrix}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                      height: "45px",
                                      fontSize: "14px",
                                      backgroundColor:
                                        !formData.SampleTypeMatrix
                                          ? "#fdecea"
                                          : "#fff",
                                    }}
                                  >
                                    <option value="" hidden></option>
                                    {sampletypematrixNames.map(
                                      (name, index) => (
                                        <option key={index} value={name}>
                                          {name}
                                        </option>
                                      )
                                    )}
                                  </select>
                                </div>
                                <div className="form-group col-md-6">
                                  <label>
                                    Container Type{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className="form-control"
                                    name="ContainerType"
                                    value={formData.ContainerType}
                                    onChange={handleInputChange}
                                    required
                                    style={{
                                      height: "45px",
                                      fontSize: "14px",
                                      backgroundColor: !formData.ContainerType
                                        ? "#fdecea"
                                        : "#fff",
                                    }}
                                  >
                                    <option value="" hidden></option>
                                    {containertypeNames.map((name, index) => (
                                      <option key={index} value={name}>
                                        {name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="row">
                                <div className="form-group col-md-6">
                                  <label>
                                    Sample Picture{" "}
                                    <span className="text-danger">*</span>
                                  </label>
                                  <div className="d-flex align-items-center">
                                    <input
                                      name="logo"
                                      type="file"
                                      id="logo"
                                      accept="image/*"
                                      onChange={(e) =>
                                        logoHandler(e.target.files[0])
                                      }
                                      required={!formData.logo} // only required if no logo is set
                                      className="form-control"
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.logo
                                          ? "#fdecea"
                                          : "#fff",
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
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-between align-items-center">
                      {mode === "individual" && (
                        <div className="form-check my-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="toggleDetails"
                            checked={showAdditionalFields}
                            onChange={() =>
                              setShowAdditionalFields(!showAdditionalFields)
                            }
                            disabled={!areMandatoryFieldsFilled()}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="toggleDetails"
                          >
                            Add Additional Details
                          </label>
                        </div>
                      )}
                      {(mode === "individual" || mode === "pool") && (
                        <>
                          <button type="submit" className="btn btn-primary">
                            {showAddModal ? "Save" : "Update"}
                          </button>
                        </>)}
                    </div>
                    <div className="text-start text-muted fs-6 mb-3 ms-3" style={{ marginTop: '-8px' }}>
                      <code> Please move cursor to field to get help</code>
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
                top: "100px",
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
                        const {
                          Analyte,
                          updated_name,
                          added_by,
                          action_type,
                          created_at,
                          updated_at,
                          staffName,
                        } = log;

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
                            {/* Addition */}
                            {action_type === "add" && (
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
                                Analyte: <b>{Analyte}</b> was{" "}
                                <b style={{ color: "#388e3c" }}>added</b> by{" "}
                                <span style={{ color: "#c2185b" }}>{staffName || "Biobank"}</span> at{" "}
                                {moment(created_at).format("DD MMM YYYY, h:mm A")}
                              </div>
                            )}
                            {/* Update */}
                            {action_type === "update" && updated_name && (
                              <div
                                style={{
                                  padding: "10px 15px",
                                  borderRadius: "15px",
                                  backgroundColor: "#dcf8c6", // Light green
                                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                  maxWidth: "75%",
                                  fontSize: "14px",
                                  textAlign: "left",
                                  marginTop: "5px",
                                }}
                              >
                                Analyte: <b>{updated_name}</b> was{" "}
                                <b style={{ color: "#388e3c" }}>updated</b> by{" "}
                                <span style={{ color: "#c2185b" }}>{staffName || "Unknown"}</span> at{" "}
                                {moment(updated_at).format("DD MMM YYYY, h:mm A")}
                              </div>
                            )}
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

        {/* Modal to show Sample Picture */}
        {showLogoModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog" style={{ marginTop: "80px" }} role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Sample Picture</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowLogoModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body text-center">
                  {selectedLogoUrl ? (
                    <img
                      src={selectedLogoUrl}
                      alt="Sample Logo"
                      style={{ maxWidth: "100%", maxHeight: "300px" }}
                    />
                  ) : (
                    <p>No logo available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
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