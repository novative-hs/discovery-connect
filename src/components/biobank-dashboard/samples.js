import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faQuestionCircle,
  faExchangeAlt,
  faDollarSign,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { getsessionStorage } from "@utils/sessionStorage";
import Barcode from "react-barcode";
import Pagination from "@ui/Pagination";
import NiceSelect from "@ui/NiceSelect";
import InputMask from "react-input-mask";

const BioBankSampleArea = () => {

  const id = sessionStorage.getItem("userID");

  const [mode, setMode] = useState("Individual");
  const [showActionModal, setShowActionModal] = useState(false);
  const [statusmode, setstatusMode] = useState("");
  const [selectedSample, setSelectedSample] = useState(null);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedSampleForPricing, setSelectedSampleForPricing] = useState(null);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("");
  const [selectedSampleName, setSelectedSampleName] = useState("");
  const [selectedSampleVolume, setSelectedSampleVolume] = useState("");
  const [selectedSampleUnit, setSelectedSampleUnit] = useState("");
  const [filter, setFilter] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [quarantineComment, setQuarantineComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showQuarantineModal, setShowQuarantineModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [countryname, setCountryname] = useState([]);
  const [searchCountry, setSearchCountry] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [visibilitystatus, setVisibilityStatus] = useState("");
  const [logo, setLogo] = useState();
  const [editSample, setEditSample] = useState(null);
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState(samples);
  const [successMessage, setSuccessMessage] = useState("");
  const [collectionSiteNames, setCollectionSiteNames] = useState([]);
  const [ethnicityNames, setEthnicityNames] = useState([]);
  const [sampleconditionNames, setSampleConditionNames] = useState([]);
  const [samplepricecurrencyNames, setSamplePriceCurrencyNames] = useState([]);
  const [storagetemperatureNames, setStorageTemperatureNames] = useState([]);
  const [containertypeNames, setContainerTypeNames] = useState([]);
  const [volumeunitNames, setVolumeUnitNames] = useState([]);
  const [sampletypematrixNames, setSampleTypeMatrixNames] = useState([]);
  const [testmethodNames, setTestMethodNames] = useState([]);
  const [testresultunitNames, setTestResultUnitNames] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [concurrentmedicalconditionsNames, setConcurrentMedicalConditionsNames] = useState([]);
  const [testkitmanufacturerNames, setTestKitManufacturerNames] = useState([]);
  const [testsystemNames, setTestSystemNames] = useState([]);
  const [testsystemmanufacturerNames, setTestSystemManufacturerNames] = useState([]);
  const [AnalyteNames, setAnalyteNames] = useState([]);
  const [infectiousdiseasetestingName, setInfectiousdiseasetestingNames] = useState([]);
  const [showTestResultNumericInput, setShowTestResultNumericInput] = useState(false);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [selectedBarcodeId, setSelectedBarcodeId] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [filteredSamplename, setFilteredSamplename] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 50;
  const [totalPages, setTotalPages] = useState(0);
  const [logoPreview, setLogoPreview] = useState(null);
  const [samplePrice, setSamplePrice] = useState([]);
  const [selectedSampleVisibilityId, setSelectedSampleVisibilityId] = useState(null);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [priceFilter, setPriceFilter] = useState("");
  const [poolMode, setPoolMode] = useState(false);
  const [visibilitystatuschange, setVisibilityStatusChange] = useState(false);
  const [analyteOptions, setAnalyteOptions] = useState([]);
  const [showAddPoolModal, setshowAddPoolModal] = useState(false);
  const [showEditPoolModal, setShowEditPoolModal] = useState(false);
  const [poolhistoryData, setPoolHistoryData] = useState([]);
  const [PoolSampleHistoryModal, setPoolSampleHistoryModal] = useState(false);

  const tableHeaders = [
    { label: "Specimen ID", key: "masterID" },
    { label: "Patient Name", key: "PatientName" },
    { label: "Patient Location", key: "PatientLocation" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "MR Number", key: "MRNumber" },
    // { label: "Location", key: "locationids" },
    { label: "Analyte", key: "Analyte" },
    { label: "Test Result", key: "TestResult" },
    { label: "Volume", key: "volume" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Price", key: "price" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
    { label: "Sample Mode", key: "samplemode" },
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
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Sampling", key: "DateOfSampling" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
  ];

  const [formData, setFormData] = useState({
    patientname: "",
    patientlocation: "",
    finalConcentration: "",
    locationids: "",
    Analyte: "",
    age: "",
    volume: "",
    phoneNumber: "",
    gender: "",
    ethnicity: "",
    samplecondition: "",
    storagetemp: "",
    ContainerType: "",
    CountryOfCollection: "",
    price: 0,
    SamplePriceCurrency: "",
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

  const filterOptions = [
    { value: "", text: "All" },
    { value: "Analyte", text: "Analyte" },
    { value: "gender", text: "Gender" },
    { value: "CollectionSiteName", text: "Collectionsite Name" },
    { value: "sample_visibility", text: "Visibility Status" },
    { value: "price", text: "Price" }, // special case
  ];

  const priceOptions = [
    { value: "", text: "All" },
    { value: "priceAdded", text: "Price Added" },
    { value: "priceNotAdded", text: "Price Not Added" },
  ];

  // Stock Transfer modal fields names
  const [transferDetails, setTransferDetails] = useState({
    TransferTo: id,
    dispatchVia: "",
    dispatcherName: "",
    dispatchReceiptNumber: "",
    Quantity: 1,
  });

  const handleQuarantineClick = () => {
    if (!quarantineComment.trim()) {
      setCommentError("Comment is required to quarantine the sample.");
      return;
    }
    setCommentError("");
    handleQuarantine(quarantineComment); // Pass the comment
  };

  const openModal = (sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };

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
    { name: "analyte", setter: setAnalyteNames },
    { name: "samplepricecurrency", setter: setSamplePriceCurrencyNames },
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
    { name: "infectiousdiseasetesting", setter: setInfectiousdiseasetestingNames },
  ];

  const handleTransferClick = (sample) => {
    setSelectedSampleId(sample.id);
    setShowTransferModal(true); // Show the modal
  };

  // Fetch samples from the backend
  const fetchSamples = useCallback(async (page = 1, pageSize = 50, filters = {}) => {
    try {
      const { priceFilter, searchField, searchValue } = filters;
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/getsamples/${id}?page=${page}&pageSize=${pageSize}`;
      if (priceFilter) url += `&priceFilter=${priceFilter}`;
      if (searchField && searchValue)
        url += `&searchField=${searchField}&searchValue=${searchValue}`;

      const response = await axios.get(url);
      const { samples, totalCount, pageSize: serverPageSize, currentPage: serverPage } = response.data;

      setSamples(samples);
      setFilteredSamples(samples);
      setTotalPages(Math.ceil(totalCount / pageSize));
      setTotalCount(totalCount);
      setPageSize(serverPageSize);
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  }, [id]);

  // Fetch samples from backend when component loads
  useEffect(() => {
    let isMounted = true;
    const storedUser = getsessionStorage("user");

    fetchSamples(currentPage + 1, itemsPerPage, {
      searchField,
      searchValue,
    });

    return () => {
      isMounted = false;
    };
  }, [currentPage, searchField, searchValue, fetchSamples]);

  const currentData = filteredSamples;

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

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Adjust down if needed
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (event) => {
    const selectedPage = event.selected; // React Paginate is 0-indexed, so we adjust
    setCurrentPage(selectedPage); // This will trigger the data change based on selected page
  };


  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    setCurrentPage(0);

    if (field === "price") {
      setPriceFilter(value);
      setSearchField("");  // optional, to clear old field
      setSearchValue("");  // optional
      fetchSamples(1, itemsPerPage, { priceFilter: value }); // 🟢 priceFilter passed
    } else {
      setSearchField(field);
      setSearchValue(value);
      setPriceFilter(""); // clear priceFilter
      fetchSamples(1, itemsPerPage, { searchField: field, searchValue: value });
    }
  };

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

  const handlePoolButtonClick = () => {
    if (poolMode) {
      const selected = [...selectedSamples];
      if (selected.length < 1) {
        alert("Please select at least one samples to create a pool.");
        return;
      }

      const selectedAnalytes = samples
        .filter((sample) => selected.includes(sample.id))
        .map((sample) => sample.Analyte)
        .filter(Boolean);

      const uniqueAnalytes = [...new Set(selectedAnalytes)];


      setAnalyteOptions(uniqueAnalytes);

      if (uniqueAnalytes.length === 1) {
        setSelectedSampleName(uniqueAnalytes[0]);
        setFormData((prev) => ({
          ...prev,
          Analyte: uniqueAnalytes[0],
        }));
      } else {
        setSelectedSampleName("");
        setFormData((prev) => ({
          ...prev,
          Analyte: "",
        }));
      }

      setMode("Pooled");
      setshowAddPoolModal(true);
    } else {
      setPoolMode(true);
    }
  };



  const getSamplePrice = async (selectedSampleName) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getprice/${selectedSampleName}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch price");
      }

      const result = await response.json();
      // Filter out null prices
      const validPrices = result.data.filter(
        (item) => item.price !== null && item.price !== 0
      );

      setSamplePrice(validPrices); // Only non-null prices will be set
    } catch (error) {
      console.error("Error fetching site names:", error);
    }
  };

  useEffect(() => {
    const fetchCollectionSiteNames = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsite/collectionsitenamesinbiobank/${selectedSampleId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch collection site names");
        }
        const data = await response.json();

        setCollectionSiteNames(data.data);
      } catch (error) {
        console.error("Error fetching site names:", error);
      }
    };

    fetchCollectionSiteNames();
  }, [selectedSampleId]);

  useEffect(() => {
    if (selectedSampleName) {

      getSamplePrice(selectedSampleName);
    }
  }, [selectedSampleName]);

  const handleSubmit = async (e) => {
    let isMounted = true;
    e.preventDefault();

    let effectiveMode = mode;
    if (
      mode !== "Individual" &&
      formData.TestResult?.trim() &&
      formData.TestResultUnit?.trim()
    ) {
      effectiveMode = "Pooled";
      setMode("Pooled"); // optional: update state for consistency
    }

    // ✅ 2. Construct form data
    const formDataToSend = new FormData();
    for (let key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    formDataToSend.append("mode", effectiveMode);

    // ✅ 3. Append selected samples if it's truly a pooled sample
    if (
      (effectiveMode === "Pooled" || effectiveMode === "AddtoPool") &&
      Array.isArray(selectedSamples) &&
      selectedSamples.length > 0
    ) {
      formDataToSend.append("poolSamples", JSON.stringify(selectedSamples));
    }



    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/postsample`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchSamples(1, itemsPerPage, { searchField, searchValue });
      setSelectedSamples([]);
      setSelectedSampleName("");
      setshowAddPoolModal(false);
      setPoolMode(false);
      setShowAddModal(false);
      setSuccessMessage("Sample added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset form
      resetFormData();
      setLogoPreview(false);
      setShowAdditionalFields(false);
    } catch (error) {
      console.error("Error adding sample:", error);
    }
  };

  const handleTransferSubmit = async (e) => {
    let isMounted = true;
    const sampleToSend = samples.find((s) => s.id === selectedSampleId);
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

      fetchSamples(currentPage + 1, itemsPerPage, { searchField, searchValue });


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

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    let isMounted = true;
    if (!price || !currency) {
      alert("Both price and currency are required.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/postprice/${selectedSampleId}`,
        {
          sampleId: selectedSampleForPricing.id,
          price,
          SamplePriceCurrency: currency,
        }
      );

      alert("Price and currency added successfully!");
      setShowPriceModal(false);
      setSelectedSampleForPricing(null);
      setPrice("");
      setCurrency("");
      fetchSamples(currentPage + 1, itemsPerPage, { searchField, searchValue });


    } catch (error) {
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(`Error: ${error.response.data.message}`);
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response received from server.");
      } else {
        console.error("Error submitting price/currency:", error.message);
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleModalClose = () => {
    setShowTransferModal(false); // Close the modal
  };

  const handleQuarantine = async (comment) => {
    let isMounted = true;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/QuarantineSamples/${selectedSampleId}`,
        {
          status: "Quarantine",
          comment: comment, // Include the comment here
        }
      );

      setSuccessMessage("Sample quarantined successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      fetchSamples(currentPage + 1, itemsPerPage, { searchField, searchValue });


      setShowQuarantineModal(false);
      setSelectedSampleId(null);
      setQuarantineComment("");
    } catch (error) {
      console.error(
        `Error quarantining sample with ID ${selectedSampleId}:`,
        error
      );
    }
  };

  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-sample-history/${id}`
      );
      const data = await response.json();

      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const fetchPoolSampleHistory = async (id) => {

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getpoolsamplehistory/${id}`
      );
      const data = await response.json();

      setPoolHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Call this function when opening the modal
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };
  const handlePoolSampleHistory = (id, Analyte) => {
    fetchPoolSampleHistory(id)
    setSelectedSampleName(Analyte)
    setPoolSampleHistoryModal(true)
  }

  const handleEditClick = (sample) => {
    setSelectedSampleName(sample.Analyte)
    setSelectedSampleUnit(sample.VolumeUnit)
    setSelectedSampleVolume(sample.volume)
    setSelectedSampleId(sample.id);
    setSelectedSampleName(sample.Analyte);
    setSelectedSampleVolume(sample.volume);
    setMode(sample.samplemode);
    setEditSample(sample);

    // Combine the location parts into "room-freezer-box" format
    const formattedLocationId = `${String(sample.room_number).padStart(
      3,
      "0"
    )}-${String(sample.freezer_id).padStart(3, "0")}-${String(
      sample.box_id
    ).padStart(3, "0")}`;

    // Extract TestSign and TestValue from TestResult
    const testResult = sample.TestResult || "";
    const testResultMatch = testResult.match(/^([<>]=?|=|\+|-)?\s*(.*)$/);
    const TestSign = testResultMatch ? (testResultMatch[1] || "=") : "=";
    const TestValue = testResultMatch ? testResultMatch[2] || "" : "";
    const isNumeric = !isNaN(parseFloat(TestValue)) && isFinite(TestValue);
    setShowTestResultNumericInput(isNumeric); // 👈 Add this line
    if (sample.samplemode === 'Individual') {
      setShowEditModal(true);

    } else {
      setShowEditPoolModal(true)
      setPoolMode(true)
      setSelectedSampleName(sample.Analyte)
    }


    setFormData({
      patientname: sample.PatientName,
      patientlocation: sample.PatientLocation,
      finalConcentration: sample.finalConcentration,
      MRNumber: sample.MRNumber,
      locationids: formattedLocationId,
      Analyte: sample.Analyte,
      age: sample.age,
      phoneNumber: sample.phoneNumber,
      gender: sample.gender,
      volume: sample.volume,
      ethnicity: sample.ethnicity,
      samplecondition: sample.samplecondition,
      storagetemp: sample.storagetemp,
      ContainerType: sample.ContainerType,
      CountryOfCollection: sample.CountryOfCollection,
      price: sample.price,
      SamplePriceCurrency: sample.SamplePriceCurrency,
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
      TestResult: sample.TestResult,
      TestResultUnit: sample.TestResultUnit,
      TestMethod: sample.TestMethod,
      TestKitManufacturer: sample.TestKitManufacturer,
      TestSystem: sample.TestSystem,
      TestSystemManufacturer: sample.TestSystemManufacturer,
      status: sample.status,
      user_account_id: id,
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
    // Add this block to properly show the country in the input field
    const matchedCountry = countryname.find(
      (c) => c.name?.toLowerCase() === sample.CountryOfCollection?.toLowerCase()
    );
    setSelectedCountry(matchedCountry || null);
    setSearchCountry(matchedCountry ? matchedCountry.name : "");
  };

  const handlePriceCurrencyClick = (sample) => {
    getSamplePrice(sample.Analyte);
    setSelectedSampleForPricing(sample);
    setSelectedSampleName(sample.Analyte);
    setSelectedSampleVolume(sample.volume);
    setSelectedSampleUnit(sample.VolumeUnit);
    setPrice(sample.price || ""); // <-- Clear price, so user selects or types manually
    setCurrency(sample.currency || "");
    setShowPriceModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();

    // ✅ If mode is AddtoPool and result fields are filled, change to Pooled
    let updatedMode = mode;
    if (
      mode !== "Individual" &&
      formData.TestResult?.trim() &&
      formData.TestResultUnit?.trim()
    ) {
      updatedMode = "Pooled";
      setMode("Pooled");
    }

    // Append all fields except logo
    for (const key in formData) {
      if (key !== "logo") {
        formDataToSend.append(key, formData[key]);
      }
    }

    formDataToSend.append("mode", updatedMode);

    // Only append logo if it's a File
    if (formData.logo instanceof File) {
      formDataToSend.append("logo", formData.logo);
    }

    try {
      // 👇 Conditional API endpoint
      const apiUrl = formData.TestResultUnit?.trim()
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/updatetestresultandunit/${selectedSampleId}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/edit/${selectedSampleId}`;

      await axios.put(apiUrl, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // ✅ Refresh updated data
      fetchSamples(currentPage + 1, itemsPerPage, { searchField, searchValue });

      setShowEditModal(false);
      setShowEditPoolModal(false);
      setSuccessMessage("Sample updated successfully.");
      resetFormData();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(`Error updating sample with ID ${selectedSampleId}:`, error);
    }
  };


  const handleVisibilityButtonClick = () => {
    if (visibilitystatuschange) {
      const selected = [...selectedSamples];
      if (selected.length < 1) {
        alert("Please select at least one samples to make as public/non-public.");
        return;
      }
      setShowVisibilityModal(true);
    } else {
      setVisibilityStatusChange(true);
    }
  };
  const handleVisibilityStatusClick = async (e) => {
    e.preventDefault();

    if (!visibilitystatus || selectedSamples.length === 0) {
      alert("Please select visibility and at least one sample.");
      return;
    }

    try {
      // Update each selected sample one by one
      for (const sampleId of selectedSamples) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/UpdateSampleStatus/${sampleId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sample_visibility: visibilitystatus,
              added_by: id,
            }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed for sample ${sampleId}:`, errorText);
          throw new Error(`Failed to update sample ${sampleId}`);
        }
      }

      // All updates succeeded
      setSuccessMessage("Successfully changed sample visibility status");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset UI
      setShowVisibilityModal(false);
      setVisibilityStatus("");
      setVisibilityStatusChange(false);
      setSelectedSamples([]);

      // Refresh sample list
      fetchSamples(currentPage + 1, itemsPerPage, { searchField, searchValue });



    } catch (error) {
      console.error("Update error:", error);
    }
  };


  const openVisibilitystatusModal = (sample) => {
    setSelectedSampleName(sample.Analyte);
    setSelectedSampleVolume(sample.volume);
    setSelectedSampleUnit(sample.VolumeUnit);
    setSelectedSampleVisibilityId(sample.id);
    setShowVisibilityModal(true);
  };

  useEffect(() => {
    if (
      showQuarantineModal ||
      showAddModal ||
      showEditModal ||
      showTransferModal ||
      showHistoryModal ||
      showPriceModal ||
      showVisibilityModal
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
    showQuarantineModal,
    showAddModal,
    showEditModal,
    showTransferModal,
    showHistoryModal,
    showPriceModal,
    showVisibilityModal
  ]);

  const resetFormData = () => {
    setFormData({
      patientname: "",
      patientlocation: "",
      finalConcentration: "",
      locationids: "",
      volume: "",
      Analyte: "",
      age: "",
      phoneNumber: "",
      gender: "",
      ethnicity: "",
      samplecondition: "",
      storagetemp: "",
      ContainerType: "",
      CountryOfCollection: "",
      price: 0,
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
    setMode("Individual");
    setShowAdditionalFields(false);
    setLogoPreview(null);
  };

  const logoHandler = (file) => {
    if (!file) return; // ✅ Don't proceed if no file selected

    const imageUrl = URL.createObjectURL(file);

    setLogoPreview(imageUrl);
    setLogo(imageUrl);
    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));
  };


  const areMandatoryFieldsFilled = () => {
    if (mode === "Individual") {
      return (
        formData.patientname?.toString().trim() &&
        formData.patientlocation?.toString().trim() &&
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
    } else if (mode === "Pooled") {
      return (
        formData.MRNumber?.toString().trim() &&
        formData.Analyte?.toString().trim() &&
        formData.finalConcentration?.toString().trim() &&
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

  const handlePrint = (barcodeId) => {
    const barcodeString = barcodeId?.toString() || "";

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
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        <svg id="barcode"></svg>
        <script>
          window.onload = function() {
            JsBarcode("#barcode", "${barcodeString}", {
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
    <section className="profile__area pt-30 pb-120">
      <div className="container-fluid px-md-4">

        {/* Success Message */}
        {successMessage && (
          <div className="alert alert-success text-center" role="alert">
            {successMessage}
          </div>
        )}
        <div className="text-danger fw-bold" style={{ marginTop: "-20px" }}>
          <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", marginBottom: 0 }}>
            <li>
              <h6>
                Click on Price Icon to Add Price and Price Currency for Sample.
              </h6>
            </li>
            <li>
              <h6>
                Click on Location Id's to see Sample Picture.
              </h6>
            </li>
            <li>
              <h6>
                Once the Sample status is public, it is displayed on the discover page.
              </h6>
            </li>
          </ul>
        </div>

        {/* Header Section with Filter and Button */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-3 p-3 rounded shadow-sm bg-white border">

          <div className="d-flex align-items-center flex-wrap gap-3 mb-3">
            <label className="fw-semibold text-secondary mb-0">Filter by:</label>

            {/* Main Filter Dropdown */}
            <NiceSelect
              options={filterOptions}
              defaultCurrent={0}
              name="filter-by"
              onChange={(item) => {
                setFilter(item.value);
                setFilterValue("");
                setPriceFilter(""); // reset priceFilter

                if (item.value === "") {
                  handleFilterChange("", "");
                } else if (item.value === "price") {
                  // Auto-select "priceAdded" when price filter is selected
                  const defaultPrice = "priceAdded";
                  setPriceFilter(defaultPrice);
                  handleFilterChange("price", defaultPrice);
                } else {
                  fetchSamples(); // optional if you want to reload
                }
              }}
            />
            {/* If "Price" is selected, show Price filter dropdown */}
            {filter === "price" && (
              <NiceSelect
                options={priceOptions}
                defaultCurrent={0}
                name="price-options"
                onChange={(item) => {
                  setPriceFilter(item.value);
                  handleFilterChange("price", item.value);
                }}
              />
            )}

            {/* Text input for other filters */}
            {filter && filter !== "" && filter !== "price" && (
              <input
                type="text"
                className="form-control rounded px-3 py-1"
                placeholder={`Enter ${filter}`}
                value={filterValue}
                style={{ minWidth: "200px" }}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setFilterValue(newValue);
                  handleFilterChange(filter, newValue.trim() === "" ? "" : newValue);
                }}
              />
            )}

            {/* Clear button */}
            {(filter && filterValue) || priceFilter ? (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => {
                  setFilter("");
                  setFilterValue("");
                  setPriceFilter("");
                  fetchSamples(1, itemsPerPage, {}); // reset all
                }}
              >
                Clear
              </button>
            ) : null}
          </div>

          <div className="d-flex justify-content-end align-items-center flex-wrap gap-2 mb-4">

            {/* Visibility Button */}
            {!visibilitystatuschange ? (
              <button
                onClick={() => {
                  setVisibilityStatusChange(true);
                  setPoolMode(false); // disable pool if it was active
                }}
                className="btn btn-success"
              >
                Make Public / Non-Public
              </button>
            ) : (
              <button
                onClick={handleVisibilityButtonClick}
                className="btn btn-success"
              >
                Make Public / Non-Public
              </button>
            )}

            {/* Cancel Visibility */}
            {visibilitystatuschange && (
              <button
                className="btn btn-outline-danger"
                onClick={() => {
                  setVisibilityStatusChange(false);
                  setSelectedSamples([]);
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}

            {/* Pool Button */}
            {!poolMode ? (
              <button
                onClick={() => {
                  setPoolMode(true);
                  setVisibilityStatusChange(false); // disable visibility mode
                }}
                className="btn btn-primary"
              >
                Mark Sample as Pooled
              </button>
            ) : (
              <button
                onClick={handlePoolButtonClick}
                className="btn btn-primary"
              >
                Mark Pooled
              </button>
            )}

            {/* Cancel Pool */}
            {poolMode && (
              <button
                onClick={() => {
                  setPoolMode(false);
                  setSelectedSamples([]);
                }}
                className="btn btn-outline-danger"
              >
                <i className="fas fa-times"></i>
              </button>
            )}





            {/* Add Sample Button - Success Theme */}
            <div className="d-flex justify-content-end align-items-center">
              <button
                onClick={() => setShowAddModal(true)}
                className="btn d-flex align-items-center gap-2 px-3 py-2"
                style={{
                  backgroundColor: "#198754", // Bootstrap Success Green
                  color: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  fontWeight: "500",
                }}
              >
                <i className="fas fa-vial"></i> Add Sample
              </button>
            </div>
          </div>

        </div>
        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle w-auto border">
            <thead className="table-primary text-dark">
              <tr className="text-center">
             {(poolMode || visibilitystatuschange) && (
  <th className="text-center" style={{ minWidth: "120px" }}>
    <div className="d-flex align-items-center justify-content-center gap-2">
      <span className="fw-bold fs-6">Select All</span>
    <input
  type="checkbox"
  checked={
    samples.length > 0 &&
    samples.every((sample) => selectedSamples.includes(sample.id))
  }
  onChange={(e) => {
    const currentPageIds = samples.map((sample) => sample.id);
    if (e.target.checked) {
      // Add current page sample IDs to selectedSamples, without duplication
      setSelectedSamples((prevSelected) => [
        ...new Set([...prevSelected, ...currentPageIds]),
      ]);
    } else {
      // Remove current page sample IDs from selectedSamples
      setSelectedSamples((prevSelected) =>
        prevSelected.filter((id) => !currentPageIds.includes(id))
      );
    }
  }}
/>

    </div>
  </th>
)}

                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="px-2" style={{ minWidth: "120px", whiteSpace: "nowrap" }}>
                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        className="form-control bg-light border form-control-sm text-center shadow-none rounded w-100"
                        placeholder={`Search ${label}`}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        style={{ minWidth: "110px" }}
                      />
                      <span className="fw-bold mt-1 text-center fs-6" style={{ whiteSpace: "nowrap" }}>
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
            <tbody className="table-light">
              {currentData.length > 0 ? (
                currentData.map((sample) => (
                  <tr key={sample.id}>
                    {(poolMode || visibilitystatuschange) && (
                      <td className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedSamples.includes(sample.id)}
                          onChange={() => {
                            setSelectedSamples((prev) =>
                              prev.includes(sample.id)
                                ? prev.filter((id) => id !== sample.id)
                                : [...prev, sample.id]
                            );
                          }}
                        />
                      </td>
                    )}



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
                        style={{
                          maxWidth: "150px",
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                        }}
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
                            onMouseOver={(e) =>
                              (e.target.style.color = "#0a58ca")
                            }
                            onMouseOut={(e) => (e.target.style.color = "")}
                          >
                            {sample.Analyte || "----"}
                          </span>
                        ) : (
                          (() => {
                            if (key === "locationids") {
                              const tooltip = `Room Number=${sample.room_number || "----"
                                } 
Freezer ID=${sample.freezer_id || "----"} 
Box ID=${sample.box_id || "----"} `;

                              // To show logo while clicking on location IDs
                              const handleLogoClick = () => {
                                const logo =
                                  typeof sample.logo === "string"
                                    ? sample.logo
                                    : sample.logo?.data
                                      ? URL.createObjectURL(
                                        new Blob(
                                          [new Uint8Array(sample.logo.data)],
                                          { type: "image/png" }
                                        )
                                      )
                                      : null;
                                if (logo) {
                                  setSelectedLogoUrl(logo);
                                  setShowLogoModal(true);
                                }
                              };
                              return (
                                <span
                                  title={tooltip}
                                  style={{
                                    cursor: "help",
                                    textDecoration: "underline",
                                    color: "#007bff",
                                  }}
                                  onClick={handleLogoClick}
                                >
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
                                  handlePrint(sample.masterID); // Pass the ID directly
                                }}
                              >
                                Print Barcode
                              </button>
                            }
                            else if (key === "age") {
                              if (!sample.age || sample.age === 0) {
                                return "-----";
                              }
                              return `${sample.age} years`;
                            } else if (key === "TestResult") {
                              return `${sample.TestResult} ${sample.TestResultUnit || ""
                                }`;
                            } else if (key === "price") {
                              return sample.price && sample.SamplePriceCurrency
                                ? `${sample.price} ${sample.SamplePriceCurrency}`
                                : "----";
                            } else {
                              return sample[key] || "----";
                            }
                          })()
                        )}
                      </td>
                    ))}
                    <td className="text-center">
                      <div className="d-flex justify-content-around gap-1">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleEditClick(sample)}
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} size="sm" />
                        </button>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handlePriceCurrencyClick(sample)}
                          title="Set Price & Currency"
                        >
                          <FontAwesomeIcon icon={faDollarSign} size="sm" />
                        </button>
                        {/* <div className="d-flex justify-content-center gap-3">
                          <button
                            className="btn btn-dark btn-sm"
                            onClick={() => openVisibilitystatusModal(sample)}
                            title="Edit Sample Visibility Status"
                          >
                            <FontAwesomeIcon icon={faEye} size="xs" />
                          </button>
                        </div> */}
                        <button
                          className="btn btn-danger btn-sm py-0 px-1"
                          onClick={() => {
                            setSelectedSampleId(sample.id);
                            setShowQuarantineModal(true);
                          }}
                          title="Quarantine Sample"
                        >
                          <FontAwesomeIcon icon={faQuestionCircle} size="xs" />
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleTransferClick(sample)}
                          title="Transfer"
                        >
                          <FontAwesomeIcon icon={faExchangeAlt} size="sm" />
                        </button>
                        <button
                          className="btn btn-outline-success btn-sm"
                          onClick={() => handleShowHistory("sample", sample.id)}
                          title="History"
                        >
                          <i className="fa fa-history"></i>
                        </button>
                        {(sample.samplemode === 'Pooled') && (
                          <button
                            className="btn btn-outline-success btn-sm"
                            onClick={() => handlePoolSampleHistory(sample.id, sample.Analyte)}
                            title="Track Sample"
                          >
                            <i class="fas fa-vial"></i>
                          </button>
                        )}
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

        {totalPages >= 0 && (
          <Pagination
            handlePageClick={handlePageChange}
            pageCount={totalPages}
            focusPage={currentPage} // If using react-paginate, which is 0-based
          />
        )}
        <div>
          {totalCount > 0 && (
            <p>
              Showing {currentPage * pageSize + 1} to{" "}
              {Math.min((currentPage + 1) * pageSize, totalCount)} of {totalCount} records
            </p>
          )}



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

                      {/* Parallel Columns - 5 columns */}
                      <div className="row">
                        <>
                          {/* Column 1 */}
                          {!showAdditionalFields && (
                            <div className="col-md-12">
                              <div className="row">
                                <div className="form-group col-md-4">
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
                                <div className="form-group col-md-4">
                                  <label>
                                    Patient Location <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className="form-control"
                                    name="patientlocation"
                                    value={formData.patientlocation}
                                    onChange={handleInputChange}
                                    style={{
                                      height: "45px",
                                      fontSize: "14px",
                                      backgroundColor: !formData.patientlocation ? "#fdecea" : "#fff",
                                    }}
                                    required
                                  >
                                    <option value="" hidden></option>
                                    <option value="Indoor">Indoor</option>
                                    <option value="Outdoor">Outdoor</option>
                                  </select>
                                </div>
                                <div className="form-group col-md-4">
                                  <label>
                                    Age (Years){" "}
                                    <span className="text-danger"></span>
                                  </label>
                                  <input
                                    type="number"
                                    className="form-control"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    // required
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
                                <div className="form-group col-md-4">
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
                                <div className="form-group col-md-4">
                                  <label>
                                    Medical Record Number{" "}
                                    <span className="text-danger"></span>
                                  </label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="MRNumber"
                                    value={formData.MRNumber}
                                    onChange={handleInputChange}
                                    // required
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
                                <div className="form-group col-md-4">
                                  <label>
                                    Phone Number{" "}
                                    <span className="text-danger"></span>
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
                                  // required
                                  />
                                </div>
                                <div className="form-group col-md-4">
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
                                <div className="form-group col-md-4">
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
                                <div className="form-group col-md-4">
                                  <label>
                                    Test Result & Unit <span className="text-danger">*</span>
                                  </label>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "10px",
                                      alignItems: "center",
                                      position: "relative", // Ensure dropdown stays within container
                                      zIndex: 1, // Helps if there are overlapping elements
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
                                            setShowTestResultNumericInput(false); // Ensure reset
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
                                          backgroundColor: !formData.TestResult ? "#fdecea" : "#fff",
                                          minWidth: "140px",
                                          zIndex: 1051,
                                          position: "relative",
                                        }}
                                      >
                                        <option value="" disabled hidden></option>
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
                                          backgroundColor: !formData.TestResult ? "#fdecea" : "#fff",
                                          paddingRight: "10px",
                                          zIndex: 1051,
                                          position: "relative",
                                        }}
                                        autoFocus
                                        onBlur={() => {
                                          if (!formData.TestResult) {
                                            setShowTestResultNumericInput(false);
                                            setFormData((prev) => ({
                                              ...prev,
                                              TestResultUnit: "",
                                            }));
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
                                          backgroundColor: !formData.TestResultUnit ? "#fdecea" : "#fff",
                                          minWidth: "100px",
                                          zIndex: 1051,
                                          position: "relative",
                                        }}
                                      >
                                        <option value="" hidden>
                                          Unit
                                        </option>
                                        {testresultunitNames.map((name, index) => (
                                          <option key={index} value={name}>
                                            {name}
                                          </option>
                                        ))}
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
                                      <option value="" hidden></option>
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
                                    <span className="text-danger"></span>
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
                                      // required={!formData.logo} // only required if no logo is set
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
                                    name="InfectiousDiseaseTesting"
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
                      </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-between align-items-center">
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
                      <button type="submit" className="btn btn-primary">
                        {showAddModal ? "Save" : "Update"}
                      </button>
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
        {(showAddPoolModal || showEditPoolModal) && (
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
                      {showAddPoolModal ? "Add Sample" : "Edit Sample"}
                    </h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => {
                        setshowAddPoolModal(false);
                        setShowEditPoolModal(false);
                        setSelectedSample([]);
                        setSelectedSampleName("")
                        setPoolMode(false);
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
                    onSubmit={showAddPoolModal ? handleSubmit : handleUpdate}
                  >
                    <div className="modal-body">
                      {/* Parallel Columns - 5 columns */}
                      <div className="row">
                        {poolMode && (
                          <>
                            {/* Only show selected fields in pool mode */}
                            <div className="col-md-12">
                              <div className="row">
                                <div className="form-group col-md-6">
                                  <label>
                                    Analyte <span className="text-danger">*</span>
                                  </label>

                                  {analyteOptions.length > 0 ? (
                                    <select
                                      className="form-control"
                                      name="Analyte"
                                      value={formData.Analyte}
                                      onChange={(e) => {
                                        const selected = e.target.value;
                                        setSelectedSampleName(selected);
                                        setFormData((prev) => ({
                                          ...prev,
                                          Analyte: selected,
                                        }));
                                      }}
                                      required
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.Analyte
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                    >
                                      <option value="" disabled hidden>
                                        Select Analyte
                                      </option>
                                      {analyteOptions.map((analyte, index) => (
                                        <option key={index} value={analyte}>
                                          {analyte}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <input
                                      type="text"
                                      className="form-control"
                                      name="Analyte"
                                      value={selectedSampleName}
                                      disabled
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: "#f5f5f5",
                                      }}
                                    />
                                  )}
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
                                  <label className="mb-2">
                                    Final Concentration <span className="text-danger">*</span>
                                  </label>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "10px",
                                      alignItems: "center",
                                    }}
                                  >
                                    {["Low", "Medium", "High"].map((level) => (
                                      <div key={level} className="form-check">
                                        <input
                                          className="form-check-input"
                                          type="radio"
                                          name="finalConcentration" // name is fine
                                          id={`finalConcentration-${level}`}
                                          value={level}
                                          checked={mode === level}
                                          onChange={(e) => {
                                            setFormData((prev) => ({
                                              ...prev,
                                              finalConcentration: e.target.value,
                                            }))
                                            setMode(level)
                                          }}
                                          required
                                        />
                                        <label
                                          className="form-check-label"
                                          htmlFor={`finalConcentration-${level}`}
                                        >
                                          {level}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="form-group col-md-6">
                                  <label>
                                    Test Result & Unit{" "}
                                    <span className="text-danger"></span>
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

                                        style={{
                                          height: "40px",
                                          fontSize: "14px",
                                          border: !formData.TestResult ? "1px solid #ced4da" : "1px solid #ced4da",
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
                                        style={{
                                          width: "110px",
                                          height: "40px",
                                          fontSize: "14px",
                                          border: !formData.TestResult ? "1px solid #dc3545" : "1px solid #ced4da",
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
                                      <option value="" hidden></option>
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
                                <div className="form-group col-md-6">
                                  <label>
                                    Sample Picture{" "}
                                    <span className="text-danger"></span>
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
                                      // required={!formData.logo} // only required if no logo is set
                                      className="form-control"
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        border: !formData.TestResult ? "1px solid #ced4da" : "1px solid #ced4da",
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
                      <button type="submit" className="btn btn-primary">
                        {showAddPoolModal ? "Save" : "Update"}
                      </button>
                    </div>
                    <div
                      className="text-start text-muted fs-6 mb-3 ms-3"
                      style={{ marginTop: "-8px" }}
                    >
                      <code> Please move cursor to field to get help</code>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {PoolSampleHistoryModal && (
          <>
            {/* Backdrop */}
            <div
              className="modal-backdrop fade show"
              style={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.2)" }}
            ></div>

            {/* Modal */}
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
                width: "90%",
                maxWidth: "850px",
              }}
            >
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content" style={{ backgroundColor: "#f2f2f2", borderRadius: "10px" }}>

                  {/* Header */}
                  <div
                    className="modal-header"
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor: "#eaeaea",
                      borderTopLeftRadius: "10px",
                      borderTopRightRadius: "10px",
                    }}
                  >
                    <h5
                      className="modal-title"
                      style={{ fontWeight: "600", color: "#333", fontSize: "18px" }}
                    >
                      {selectedSampleName || "Sample History"}
                    </h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => {
                        setSelectedSampleName("");
                        setPoolSampleHistoryModal(false);
                      }}
                      style={{
                        fontSize: "1.5rem",
                        position: "absolute",
                        right: "10px",
                        top: "10px",
                        background: "none",
                        border: "none",
                        color: "#555",
                        cursor: "pointer",
                      }}
                      title="Close"
                    >
                      &times;
                    </button>
                  </div>

                  {/* Body */}
                  <div
                    className="modal-body"
                    style={{
                      maxHeight: "500px",
                      overflowY: "auto",
                      padding: "20px",
                      backgroundColor: "#fff",
                      borderBottomLeftRadius: "10px",
                      borderBottomRightRadius: "10px",
                    }}
                  >
                    {poolhistoryData && poolhistoryData.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead
                            style={{
                              backgroundColor: "#444",
                              color: "#fff",
                              fontSize: "14px",
                            }}
                          >
                            <tr>
                              <th>Analyte</th>
                              <th>Patient Name</th>
                              <th>Test Result</th>
                              <th>MR Number</th>
                              <th>Age</th>
                              <th>Gender</th>
                              <th>Phone</th>
                              <th>Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {poolhistoryData.map((sample, index) => (
                              <tr
                                key={index}
                                style={{
                                  backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                                  fontSize: "13px",
                                }}
                              >
                                <td>{sample.Analyte || "—"}</td>
                                <td>{sample.PatientName || "—"}</td>
                                <td>
                                  {sample.TestResult || "—"} {sample.TestResultUnit || ""}
                                </td>
                                <td>{sample.MRNumber || "—"}</td>
                                <td>{sample.age ? `${sample.age} yrs` : "—"}</td>
                                <td>{sample.gender || "—"}</td>
                                <td>{sample.phoneNumber || "—"}</td>
                                <td>{sample.PatientLocation || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p
                        style={{
                          textAlign: "center",
                          fontStyle: "italic",
                          color: "#777",
                        }}
                      >
                        No patient records found for this pooled sample.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {showVisibilityModal && (
          <>
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
                    <h5 className="modal-title">
                      {visibilitystatuschange
                        ? 'Public / NonPublic'
                        : `${selectedSampleName} - ${selectedSampleVolume}${selectedSampleUnit}`}
                    </h5>

                    <button
                      type="button"
                      className="close"
                      onClick={() => {
                        setShowVisibilityModal(false);
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
                    onSubmit={handleVisibilityStatusClick}
                  >
                    <div className="modal-body">
                      {/* Form Fields */}
                      <div className="form-group">
                        <label>Sample Status</label>
                        <select
                          className="form-control"
                          name="sample_visibility"
                          value={visibilitystatus}
                          onChange={(e) => setVisibilityStatus(e.target.value)}
                          required
                        >
                          <option value="">Select Sample Status</option>
                          <option value="Public">Public</option>
                          <option value="Non-Public">Non-Public</option>
                        </select>
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

        {/* Modal for Adding Samples Prices and Currency */}
        {showPriceModal && (
          <>
            <div
              className="modal-backdrop fade show"
              style={{ backdropFilter: "blur(5px)" }}
            ></div>
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
                  <form onSubmit={handlePriceSubmit}>
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {selectedSampleName} -{selectedSampleVolume}
                        {selectedSampleUnit}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => setShowPriceModal(false)}
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
                    <div className="modal-body">
                      <div className="form-group">
                        <label>Price</label>
                        <select
                          className="form-control"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          style={{
                            height: "45px",
                            fontSize: "14px",
                            backgroundColor: "#f0f0f0",
                            color: "black",
                            marginBottom: "10px",
                          }}
                        >
                          <option value="" hidden>
                            Select Price (or type below)
                          </option>
                          {samplePrice && samplePrice.length > 0 ? (
                            samplePrice.map((p, idx) => (
                              <option key={idx} value={p.price}>
                                {p.price}
                              </option>
                            ))
                          ) : (
                            <option disabled>No prices found</option>
                          )}
                        </select>

                        <input
                          type="number"
                          className="form-control"
                          placeholder="Or enter new price"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          style={{
                            height: "45px",
                            fontSize: "14px",
                            backgroundColor: "#f0f0f0",
                            color: "black",
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label>Sample Price Currency</label>
                        <select
                          className="form-control"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          required
                          style={{
                            fontSize: "14px",
                            height: "45px",
                            backgroundColor: "#f0f0f0",
                            color: "black",
                          }}
                        >
                          <option value="" hidden>
                            Select Sample Price Currency
                          </option>
                          {samplepricecurrencyNames.map((name, index) => (
                            <option key={index} value={name}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowPriceModal(false)}
                      >
                        Cancel
                      </button>
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
                    {collectionSiteNames.map((site, index) => (
                      <option
                        key={site.user_account_id}
                        value={site.user_account_id}
                      >
                        {site.CollectionSiteName || site.Name}
                      </option>
                    ))}
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

        {showQuarantineModal && (
          <>
            <div
              className="modal-backdrop fade show"
              style={{ backdropFilter: "blur(5px)" }}
            ></div>
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
                    <h5 className="modal-title">Quarantine Sample</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => setShowQuarantineModal(false)}
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
                  <div className="modal-body">
                    <p>Are you sure you want to Quarantine this sample?</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-danger"
                      onClick={handleQuarantine}
                    >
                      Quarantine Sample
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowQuarantineModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
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
                                <span style={{ color: "#c2185b" }}>{staffName || "Biobank"}</span> at{" "}
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

        {showQuarantineModal && (
          <>
            <div
              className="modal-backdrop fade show"
              style={{ backdropFilter: "blur(5px)" }}
            ></div>
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
                    <h5 className="modal-title">Quarantine Sample</h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => {
                        setShowQuarantineModal(false);
                        setCommentError("");
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
                  <div className="modal-body">
                    <p>Are you sure you want to Quarantine this sample?</p>
                    <label
                      htmlFor="quarantine-comment"
                      className="form-label mt-3"
                    >
                      Add Comment <span className="text-danger">*</span>
                    </label>
                    <textarea
                      id="quarantine-comment"
                      className="form-control"
                      rows="4"
                      placeholder="Write your reason for quarantine..."
                      value={quarantineComment}
                      onChange={(e) => setQuarantineComment(e.target.value)}
                    ></textarea>
                    {commentError && (
                      <p
                        className="text-danger mt-2"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {commentError}
                      </p>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-danger"
                      onClick={handleQuarantineClick}
                    >
                      Quarantine Sample
                    </button>
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
            <div
              className="modal-dialog"
              style={{ marginTop: "80px" }}
              role="document"
            >
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
      <Modal
        show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">
            {" "}
            Sample Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{ maxHeight: "500px", overflowY: "auto" }}
          className="bg-light rounded"
        >
          {selectedSample ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ key, label }) => {
                  const value = selectedSample[key];
                  if (value === undefined) return null;

                  return (
                    <div className="col-md-6" key={key}>
                      <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                        <span className="text-muted small fw-bold mb-1">
                          {label}
                        </span>
                        <span className="fs-6 text-dark">
                          {value?.toString() || "----"}
                        </span>
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

export default BioBankSampleArea;
