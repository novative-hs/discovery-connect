import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import DetailModal from "../../pages/DetailModal";


import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faExchangeAlt,
  faPrint,
  faRuler,
} from "@fortawesome/free-solid-svg-icons";
import NiceSelect from "@ui/NiceSelect";
import Pagination from "@ui/Pagination";
import InputMask from "react-input-mask";
import { getsessionStorage } from "@utils/sessionStorage";
import Barcode from "react-barcode";
import { notifyError } from "@utils/toast";
import Select from "react-select";
const SampleArea = () => {
  const id = sessionStorage.getItem("userID");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationError, setLocationError] = useState("")
  const [showAddtestResultandUnitModal, setShowAddTestResultandUnitModal] = useState("");
  const [selectedSampleTypeMatrixes, setSelectedSampleTypeMatrixes] = useState([]);
  const [selectedSamplesData, setSelectedSamplesData] = useState([]);


  const [showEdittestResultandUnitModal, setShowEditTestResultandUnitModal] = useState("")
  const [mode, setMode] = useState("");
  const [staffAction, setStaffAction] = useState("");
  const [actions, setActions] = useState([]);
  const [poolMode, setPoolMode] = useState(false);
  const [selectedSamples, setSelectedSamples] = useState([]);
  const [selectedSampleName, setSelectedSampleName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPoolModal, setshowAddPoolModal] = useState(false);
  const [showEditPoolModal, setShowEditPoolModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [poolhistoryData, setPoolHistoryData] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [PoolSampleHistoryModal, setPoolSampleHistoryModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
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
  const [samplePdfPreview, setSamplePdfPreview] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const today = new Date().toISOString().split("T")[0]; // e.g. "2025-08-18"
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState(today);
  const [filters, setFilters] = useState({ date_to: today });
  const [analyte, setAnalyte] = useState("");
  const [gender, setGender] = useState("");
  const [filtersamplemode, setFilterSampleMode] = useState("")
  const [collectionSite, setCollectionSite] = useState("");
  const [visibility, setVisibility] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [showoptionModal, setshowOptionModal] = useState("")
  const [alreadypooled, setAlreadyPooled] = useState([]);
  const [selectedPoolSample, setSelectedPoolSample] = useState();
  const [transferDetails, setTransferDetails] = useState({
    TransferTo: id,
    dispatchVia: "",
    dispatcherName: "",
    dispatchReceiptNumber: "",
    Quantity: 1,
  });
  const filterOptions = [
    { value: "", text: "All" },
    { value: "individual", text: "Individual" },
    { value: "High", text: "High" },
    { value: "Low", text: "Low" },
    { value: "Medium", text: "Medium" },
    { value: "Pooled", text: "Pooled" },

  ];
  const [analyteOptions, setAnalyteOptions] = useState([]);

  useEffect(() => {
    if (AnalyteNames && Array.isArray(AnalyteNames)) {
      const options = AnalyteNames.map((item) => ({
        value: item.name,
        label: item.name,
      }));
      setAnalyteOptions(options);
    }
  }, [AnalyteNames]);

  const openModal = (sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };
  const openPatientModal = (sample) => {
    setSelectedSample(sample);
    setShowPatientModal(true);
  };


  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
    setShowPatientModal(false)
  };

  const tableHeaders = [
    { label: "Patient Name", key: "PatientName" },
    { label: "Gender & Age", key: "gender" },
    { label: "Location", key: "locationids" },
    { label: "Analyte", key: "Analyte" },
    { label: "Test Result & Unit", key: "TestResult" },
    { label: "Volume", key: "volume" },
    { label: "Status", key: "status" },
    // { label: "Sample Visibility", key: "sample_visibility" },
    { label: "Sample Mode", key: "samplemode" },

  ];

  const fieldsToShowInOrder = [
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Container Type", key: "ContainerType" },
    // { label: "Final Concentration", key: "finalConcentration" },
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
    finalConcentration: "",
    patientlocation: "",
    locationids: "",
    Analyte: "",
    AnalyteUniqueKey: "",
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
    samplepdf: "",
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

    setStaffAction(action);

    const splitActions = action.split(",").map(a => a.trim());

    setActions(splitActions);
  }, []);

  useEffect(() => {
    if (ageFilter) {
      const filtered = samples.filter(sample =>
        sample.age && sample.age.toString().includes(ageFilter)
      );
      setFilteredSamplename(filtered);
    } else {
      setFilteredSamplename(samples);
    }
  }, [ageFilter, samples]);

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
    { name: "/get/analyte", setter: setAnalyteNames },
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
    fetchSamples(currentPage, itemsPerPage, filters);
    fetchCollectionSiteNames();
    fetchPooledSample();
  }, [currentPage, filters]);


  const fetchSamples = async (page = 1, pageSize = 10, filters = {}) => {
    if (!id) {
      console.error("ID is missing.");
      return;
    }
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value?.trim()) {
          queryParams.append(key, value.trim());
        }
      });

      let ownResponseurl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/get/${id}?page=${page}&pageSize=${pageSize}`;
      let receivedResponseurl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplereceive/get/${id}?page=${page}&pageSize=${pageSize}`;

      const filterString = queryParams.toString();
      if (filterString) {
        ownResponseurl += `&${filterString}`;
        receivedResponseurl += `&${filterString}`;
      }

      const [ownResponse, receivedResponse] = await Promise.all([
        axios.get(ownResponseurl),
        axios.get(receivedResponseurl),
      ]);
      // Collect received sample IDs first


      const receivedSamples = receivedResponse.data.samples.map((s) => ({
        ...s,
        quantity: Number(s.quantity ?? s.Quantity ?? 0),
        sourceType: "received", // instead of isReturn: true
      }));
      const receivedSampleIds = new Set(receivedSamples.map((s) => s.id));

      const ownSamples = ownResponse.data.samples.map((s) => ({
        ...s,
        quantity: Number(s.quantity ?? s.Quantity ?? 0),
        logo: s.logo?.data
          ? `data:image/jpeg;base64,${Buffer.from(s.logo.data).toString("base64")}`
          : "",
        sourceType: receivedSampleIds.has(s.id) ? "received" : "own", // Correct logic
      }));
      const sampleMap = new Map();

      [...ownSamples, ...receivedSamples].forEach((sample) => {
        const sampleId = sample.id;
        if (sampleMap.has(sampleId)) {
          const existing = sampleMap.get(sampleId);
          existing.quantity += sample.quantity;
          if (sample.sourceType === "own") {
            existing.sourceType = "own"; // overwrite only if it's own
          }
          sampleMap.set(sampleId, existing);
        } else {
          sampleMap.set(sampleId, { ...sample });
        }
      });

      const merged = Array.from(sampleMap.values());


      const totalCount = ownResponse.data.totalCount + receivedResponse.data.totalCount;
      const totalPages = Math.ceil(totalCount / pageSize);

      const ownPageSize = ownResponse.data.pageSize || pageSize;
      const receivedPageSize = receivedResponse.data.pageSize || pageSize;
      const serverPageSize = Math.max(ownPageSize, receivedPageSize);

      setPageSize(serverPageSize);
      setSamples(merged);
      setFilteredSamplename(merged);
      setTotalPages(totalPages);
      setfiltertotal(totalCount);
      setTotalCount(totalCount);
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

  const fetchPooledSample = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getAllPooledSample/${id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch pooled sample names");
      }
      const data = await response.json();
      setAlreadyPooled(data.results)
    } catch (error) {
      console.error("Failed to fetch pooled sample names", error);
    }
  };
  const filteredAnalytes = formData.samplemode
    ? alreadypooled.filter(
      (sample) => sample.samplemode === formData.samplemode
    )
    : alreadypooled;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Adjust down if needed
    }
  }, [totalPages]);

  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...filters }
    if (value !== undefined && value !== null && value !== "") {
      updatedFilters[field] = value;
    } else {
      delete updatedFilters[field];
    }

    setFilters(updatedFilters);

    let finalFilters = { ...updatedFilters };

    if (updatedFilters.date_to && !updatedFilters.date_from) {
      finalFilters = { date_to: updatedFilters.date_to, ...updatedFilters };
    }

    fetchSamples(currentPage, itemsPerPage, finalFilters);
  };

  const handlePageChange = (event) => {
    const selectedPage = event.selected + 1; // Because react-paginate is 0-indexed
    setCurrentPage(selectedPage); // Correct ✅
  };

  // const handleScroll = (e) => {
  //   const isVerticalScroll = e.target.scrollHeight !== e.target.clientHeight;

  //   if (isVerticalScroll) {
  //     const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

  //     if (bottom && currentPage < totalPages) {
  //       setCurrentPage((prevPage) => prevPage + 1); // Trigger fetch for next page
  //       fetchSamples(currentPage + 1); // Fetch more data if bottom is reached
  //     }
  //   }
  // };

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

    if (name === "Analyte") {
      const selectedAnalyte = AnalyteNames.find((item) => item.name === value);
      const unit = selectedAnalyte?.testresultunit || "";

      // ✅ Conditionally show/hide numeric input based on whether unit exists
      if (unit === "") {
        setShowTestResultNumericInput(false);
      } else {
        setShowTestResultNumericInput(true);
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
        TestResultUnit: unit,
      }));

      setTransferDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
        TestResultUnit: unit,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      setTransferDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    }
  };




  // const validateLocationID = () => {
  //   const value = formData.locationids?.trim();

  //   // Remove all non-digits (like dashes)
  //   const numericOnly = value.replace(/-/g, "");

  //   // If less than 9 digits, don't validate yet
  //   if (numericOnly.length < 9) {
  //     setLocationError("");
  //     return;
  //   }

  //   // Now validate full format and values
  //   const parts = value.split("-");
  //   const isThreeParts = parts.length === 3;
  //   const isValid =
  //     isThreeParts &&
  //     parts.every((part) => /^\d{3}$/.test(part) && part !== "000");

  //   if (!isValid) {
  //     setLocationError("❌ Invalid Location ID! Use format 101-202-303");
  //   } else {
  //     setLocationError("");
  //   }
  // };
  const handleSelect = (e) => {
    if (poolMode) {
      const selected = [...selectedSamples];

      if (selected.length < 1) {
        alert("Please select at least one sample to create a pool.");
        return;
      }

      const selectedAnalytes = samples
        .filter((sample) => selected.includes(sample.id))
        .map((sample) => sample.Analyte)
        .filter(Boolean);

     const uniqueAnalytes = [...new Set(selectedAnalytes)];
      setAnalyteOptions(
        uniqueAnalytes.map((name) => ({
          value: name,
          label: name,
        }))
      );

      const selectedSampleData = samples.filter((s) => selected.includes(s.id));

      // 🔥 Total Volume Calculate
      const totalVolume = selectedSampleData.reduce(
        (acc, sample) => acc + (parseFloat(sample.volume) || 0),
        0
      );

      // 🔥 Check Units
      const units = [
        ...new Set(selectedSampleData.map((s) => s.VolumeUnit).filter(Boolean)),
      ];


      // ✅ Corrected this line by using 'selected' instead of 'updated'
      const selectedMatrixes = samples
        .filter((s) => selected.includes(s.id))
        .map((s) => s.SampleTypeMatrix?.trim())
        .filter(Boolean);

      const uniqueMatrixes = [...new Set(selectedMatrixes)];



      setSelectedSampleTypeMatrixes(uniqueMatrixes);


      if (uniqueAnalytes.length === 1) {
        setSelectedSampleName(uniqueAnalytes[0]);
        setFormData((prev) => ({
          ...prev,
          Analyte: uniqueAnalytes[0],
          volume: totalVolume,
          VolumeUnit: units.length === 1 ? units[0] : "",
        }));
      } 
      // else if (uniqueAnalytes.length > 1) {
      //   // Multiple analytes selected — ask user or clear
      //   alert("⚠️ You have selected samples with different analytes. Please select only one analyte type for pooling.");

      //   // Reset form to prevent mixing
      //   setSelectedSampleName("");
      //   setFormData((prev) => ({
      //     ...prev,
      //     Analyte: "",
      //   }));

      //   return; // stop pooling
      // }

      setMode("Pooled");
      setSelectedOption(e.target.value);
      setshowOptionModal(true);
    } else {
      setPoolMode(true);
    }


  };
const handlePoolButtonClick = () => {
  if (poolMode) {
    const selected = [...selectedSamples];

    if (selected.length < 1) {
      alert("Please select at least one sample to create a pool.");
      return;
    }

    const selectedAnalytes = samples
      .filter((sample) => selected.includes(sample.id))
      .map((sample) => sample.Analyte)
      .filter(Boolean);

    const uniqueAnalytes = [...new Set(selectedAnalytes)];
    setAnalyteOptions(uniqueAnalytes);
    const selectedSampleData = samples.filter((s) => selected.includes(s.id));

    // ✅ Calculate total volume for NEW pool samples
    const totalVolume = selectedSampleData.reduce(
      (acc, sample) => acc + (parseFloat(sample.volume) || 0),
      0
    );

    // ✅ Check Units
    const units = [
      ...new Set(selectedSampleData.map((s) => s.VolumeUnit).filter(Boolean)),
    ];

    const selectedMatrixes = samples
      .filter((s) => selected.includes(s.id))
      .map((s) => s.SampleTypeMatrix?.trim())
      .filter(Boolean);

    const uniqueMatrixes = [...new Set(selectedMatrixes)];
    setSelectedSampleTypeMatrixes(uniqueMatrixes);

    if (uniqueAnalytes.length === 1) {
      setSelectedSampleName(uniqueAnalytes[0]);
      setFormData((prev) => ({
        ...prev,
        Analyte: uniqueAnalytes[0],
        volume: totalVolume, // ✅ Set calculated volume
        VolumeUnit: units.length === 1 ? units[0] : "", // ✅ Set unit
      }));
    } else {
      setSelectedSampleName("");
      setFormData((prev) => ({
        ...prev,
        Analyte: "",
        volume: totalVolume, // ✅ Still set volume even if multiple analytes
        VolumeUnit: units.length === 1 ? units[0] : "",
      }));
    }
    
    setshowOptionModal(false)
    setMode("Pooled");
    setshowAddPoolModal(true);
  } else {
    setPoolMode(true);
  }
};
  
useEffect(() => {
  console.log("AnalyteNames:", AnalyteNames);
  console.log("analyteOptions:", analyteOptions);
}, [AnalyteNames, analyteOptions]);

const calculateTotalVolume = (analyteName, poolSample) => {
  let totalVolume = 0;
  let units = new Set();

  // 1️⃣ Add volume from selected checkbox samples (ALWAYS add these)
  const selectedSampleData = samples.filter(s => selectedSamples.includes(s.id));
  console.log("Selected sample data:", selectedSampleData);
  
  selectedSampleData.forEach(s => {
    const sampleVolume = parseFloat(s.volume) || 0;
    totalVolume += sampleVolume;
    if (s.VolumeUnit) units.add(s.VolumeUnit);
    console.log(`Added ${sampleVolume} ${s.VolumeUnit} from sample ${s.id}`);
  });

  // 2️⃣ Add volume from already pooled sample (if "already" option selected)
  if (selectedOption === "already" && poolSample) {
    const poolVolume = parseFloat(poolSample.volume) || 0;
    totalVolume += poolVolume;
    if (poolSample.VolumeUnit) units.add(poolSample.VolumeUnit);
    console.log(`Added ${poolVolume} ${poolSample.VolumeUnit} from pooled sample`);
  }

  // 3️⃣ Add volume from dropdown analyte (only for "already" option when different analyte)
  if (selectedOption === "already" && analyteName && (!poolSample || poolSample.Analyte !== analyteName)) {
    const analyteSample = alreadypooled.find(s => s.Analyte === analyteName);
    if (analyteSample) {
      const analyteVolume = parseFloat(analyteSample.volume) || 0;
      totalVolume += analyteVolume;
      if (analyteSample.VolumeUnit) units.add(analyteSample.VolumeUnit);
      console.log(`Added ${analyteVolume} ${analyteSample.VolumeUnit} from analyte ${analyteName}`);
    }
  }
  return {
    volume: totalVolume,
    VolumeUnit: units.size === 1 ? [...units][0] : "",
  };
};




  const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return;
  setIsSubmitting(true);
  
  const isResultFilled = !!formData.TestResult && !!formData.TestResultUnit;
  let effectiveMode = mode;

  if (mode === "Pooled") { 
    effectiveMode = isResultFilled ? "Pooled" : "AddtoPool"; 
  }

  const formDataToSend = new FormData();
  for (let key in formData) {
    formDataToSend.append(key, formData[key]);
  }
  formDataToSend.append("mode", effectiveMode);

  if (selectedOption === "already" && selectedPoolSample) {
    selectedSamples.push(selectedPoolSample.id);
  }

  if ((effectiveMode !== "Individual") && Array.isArray(selectedSamples) && selectedSamples.length > 0) {
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

    // ✅ POOLED SAMPLES KO REMOVE KARNA
    if (selectedSamples.length > 0) {
      // Current samples se pooled samples ko filter out karein
      const updatedSamples = samples.filter(
        sample => !selectedSamples.includes(sample.id)
      );
      
      // State update karein
      setSamples(updatedSamples);
      setFilteredSamplename(updatedSamples);
    }

    // ✅ RESET ALL STATES
    setSelectedSamples([]);
    setSelectedSamplesData([]);
    setSelectedSampleName("");
    setshowAddPoolModal(false);
    setPoolMode(false);
    setShowAddModal(false);
    setSuccessMessage("Sample pool successfully created.");
    
    // ✅ SERVER SE LATEST DATA FETCH KAREIN
    setTimeout(() => {
      fetchSamples(currentPage, itemsPerPage, filters);
    }, 500);
    
    resetFormData();
    setLogoPreview(false);
    setShowAdditionalFields(false);
    
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (error) {
    if (error.response?.status === 409) {
      notifyError(error.response.data?.error || "Duplicate entry found.");
    } else {
      notifyError("Something went wrong while adding the sample.");
    }
  } finally {
    setIsSubmitting(false);
  }
};

  const handleAddTestResult = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/updatetestresultandunit/${selectedSampleId}`,
        {
          mode: "Pooled",
          TestResult: formData.TestResult,
          TestResultUnit: formData.TestResultUnit,
          samplepdf: formData.samplepdf,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchSamples(currentPage, itemsPerPage, { searchField, searchValue });

      setSelectedSampleId("")
      setSelectedSampleName("");
      setShowAddTestResultandUnitModal(false);
      setSuccessMessage("Test result unit added successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);

      resetFormData();
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
          sampleID: selectedSampleId,
          TransferFrom: id,
          TransferTo,
          dispatchVia,
          dispatcherName,
          dispatchReceiptNumber,
          Quantity,
          isReturn: isReturnFlag,
        }
      );

      fetchSamples(currentPage, itemsPerPage, { searchField, searchValue });

      alert("Sample dispatched successfully!");

      setTransferDetails({
        TransferTo: "",
        dispatchVia: "",
        dispatcherName: "",
        dispatchReceiptNumber: "",
        Quantity: 1,
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
  const handleTestRsultsandUnit = (sample) => {
    setSelectedSampleId(sample.id)
    const testResult = sample.TestResult || "";
    const testResultMatch = testResult.match(/^([<>]=?|=|\+|-)?\s*(.*)$/);
    const TestSign = testResultMatch ? (testResultMatch[1] || "=") : "=";
    const TestValue = testResultMatch ? testResultMatch[2] || "" : "";
    const isNumeric = !isNaN(parseFloat(TestValue)) && isFinite(TestValue);
    setShowTestResultNumericInput(isNumeric); // 👈 Add this line
    setFormData({
      // TestResult: sample.TestResult,
      TestSign,
      TestValue,
      TestResult: testResult,
      TestResultUnit: sample.TestResultUnit,

    });
    setSelectedSampleName(sample.Analyte)
    setShowAddTestResultandUnitModal(true)
  }

 const handleCheckboxChange = (sample) => {
  // Add CSS to prevent flash
  document.body.style.setProperty('will-change', 'scroll-position', 'important');
  document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
  
  const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
  
  setSelectedSamples((prev) => {
    let newSelectedSamples;
    let newSelectedSamplesData;
    
    if (prev.includes(sample.id)) {
      newSelectedSamples = prev.filter((id) => id !== sample.id);
      newSelectedSamplesData = selectedSamplesData.filter(s => s.id !== sample.id);
    } else {
      newSelectedSamples = [...prev, sample.id];
      newSelectedSamplesData = [...selectedSamplesData, sample];
    }
    
    setSelectedSamplesData(newSelectedSamplesData);
    return newSelectedSamples;
  });

  // Use microtask for immediate scroll restoration
  Promise.resolve().then(() => {
    window.scrollTo({ top: currentScroll, left: 0, behavior: 'auto' });
  });

  setTimeout(() => {
    window.scrollTo({ top: currentScroll, left: 0, behavior: 'auto' });
    // Remove styles after restoration
    setTimeout(() => {
      document.body.style.removeProperty('will-change');
      document.documentElement.style.removeProperty('scroll-behavior');
    }, 100);
  }, 0);
};


// Function to get combined data - Different logic for page 1 vs other pages
const getCombinedTableData = () => {
  if (!poolMode) {
    return currentData; // Normal mode: show only current page data
  }

  const currentPageIds = new Set(currentData.map(s => s.id));
  
  if (currentPage === 1) {
    // Page 1: Show ALL selected samples from ALL pages
    const allSelectedSamples = selectedSamplesData;
    
    // Separate: samples in current page vs other pages
    const selectedInCurrentPage = allSelectedSamples.filter(s => currentPageIds.has(s.id));
    const selectedFromOtherPages = allSelectedSamples.filter(s => !currentPageIds.has(s.id));
    
    const nonSelectedCurrentData = currentData.filter(s => !selectedSamples.includes(s.id));
    
    return [...selectedFromOtherPages, ...selectedInCurrentPage, ...nonSelectedCurrentData];
  } else {
    // Page 2, 3, etc.: Show only current page's selected samples
    const selectedSamplesInCurrentPage = selectedSamplesData.filter(
      selectedSample => currentPageIds.has(selectedSample.id)
    );

    const nonSelectedCurrentData = currentData.filter(
      sample => !selectedSamples.includes(sample.id)
    );

    return [...selectedSamplesInCurrentPage, ...nonSelectedCurrentData];
  }
};
  // Reset the display flag when pool mode changes or page changes
 
  const combinedData = getCombinedTableData();

  const handleEditClick = (sample) => {

    setSelectedSampleId(sample.id);
    setEditSample(sample);

    setMode(sample.samplemode)
    // Combine the location parts into "room-box-freezer" format
    const formattedLocationId = `${String(sample.room_number).padStart(3, "0")}-${String(sample.freezer_id).padStart(3, "0")}-${String(sample.box_id).padStart(3, "0")}`;

    // Extract TestSign and TestValue from TestResult
    const testResult = sample.TestResult || "";
    const testResultMatch = testResult.match(/^([<>]=?|=|\+|-)?\s*(.*)$/);
    const TestSign = testResultMatch ? (testResultMatch[1] || "=") : "=";
    const TestValue = testResultMatch ? testResultMatch[2] || "" : "";
    const isNumeric = !isNaN(parseFloat(TestValue)) && isFinite(TestValue);
    setShowTestResultNumericInput(isNumeric); // 👈 Add this line
    if (sample.samplemode === "Individual") {
      // Normal sample
      setSelectedOption("new");
      setShowEditModal(true);
    }
    else if (sample.samplemode === "Pooled") {
      // Already pooled sample
      setSelectedOption("new");
      setShowEditPoolModal(true);
      setPoolMode(false);
      setSelectedSampleName(sample.Analyte);
    }
    else {
      // Other cases -> treat as new pool
      setSelectedOption("new");
      setShowEditPoolModal(true);
      setPoolMode(false);
      setSelectedSampleName(sample.Analyte);
    }

    const sampleValue = (sample.SampleTypeMatrix || "").trim().toLowerCase();

    // Find the original string in options (preserves case and spacing)
    const selectedMatrix = sampletypematrixNames.find(
      m => m.trim().toLowerCase() === sampleValue
    );

    setFormData({
      patientname: sample.PatientName,
      finalConcentration: sample.finalConcentration,
      patientlocation: sample.PatientLocation,
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
      SampleTypeMatrix: selectedMatrix,
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
      user_account_id: id,
      logo: sample.logo,
      samplepdf: sample.samplepdf,
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

    // ✅ Generate sample PDF preview (if available)
    const pdfPreviewUrl =
      typeof sample.samplepdf === "string"
        ? sample.samplepdf
        : sample.samplepdf?.data
          ? URL.createObjectURL(
            new Blob([new Uint8Array(sample.samplepdf.data)], {
              type: "application/pdf",
            })
          )
          : null;

    setSamplePdfPreview(pdfPreviewUrl);

    // ✅ Add this block to properly show the country in the input field
    if (sample.CountryOfCollection) {
      const matchedCountry = countryname.find(
        (c) =>
          c.name?.toLowerCase() === sample.CountryOfCollection?.toLowerCase()
      );
      setSelectedCountry(matchedCountry || null);
      setSearchCountry(matchedCountry ? matchedCountry.name : "");
    }
  };


  const resetFormData = () => {
    setFormData({
      patientname: "",
      finalConcentration: "",
      patientlocation: "",
      locationids: "",
      Analyte: "",
      AnalyteUniqueKey: "",
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
      samplepdf: "",
    });
    setMode("");
    setShowAdditionalFields(false);
    setLogoPreview(null)
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formDataToSend = new FormData();

    // ✅ If mode is AddtoPool and result fields are filled, change to Pooled
    let updatedMode = mode;
    if (
      mode !== "Individual" &&
      formData.TestResult?.trim() &&
      formData.TestResultUnit?.trim()
    ) {
      updatedMode = "Pooled";
      setMode("Pooled"); // optional: update state for consistency
    }

    // Append all form fields except logo
    for (const key in formData) {
      if (key !== "logo" && key !== "samplepdf") {
        formDataToSend.append(key, formData[key]);
      }
    }

    formDataToSend.append("mode", updatedMode); // 👈 append computed mode

    // Only append logo if it's a new file
    if (formData.logo instanceof File) {
      formDataToSend.append("logo", formData.logo);
    } else if (logoPreview && formData.logo?.data) {
      const mimeType = logoPreview.includes(".jpg") || logoPreview.includes(".jpeg")
        ? "image/jpeg"
        : "image/png";

      const logoBlob = new Blob([new Uint8Array(formData.logo.data)], {
        type: mimeType,
      });
      formDataToSend.append("logo", logoBlob, "existing-logo.png");
    }

    if (formData.samplepdf instanceof File) {
      formDataToSend.append("samplepdf", formData.samplepdf);
    } else if (samplePdfPreview && typeof formData.samplepdf === "object") {
      // Convert existing Uint8Array or Buffer to Blob and append
      const pdfBlob = new Blob([new Uint8Array(formData.samplepdf.data)], {
        type: "application/pdf",
      });
      formDataToSend.append("samplepdf", pdfBlob, "existing-sample.pdf");
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samples/edit/${selectedSampleId}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchSamples(currentPage, itemsPerPage, filters);

      setShowEditModal(false);
      setShowEditPoolModal(false);
      setSuccessMessage("Sample updated successfully.");
      resetFormData();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(`Error updating sample with ID ${selectedSampleId}:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    if (
      showAddModal ||
      showAddtestResultandUnitModal ||
      showAddPoolModal ||
      showEditPoolModal ||
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
    showAddtestResultandUnitModal,
    showAddPoolModal,
    showEditPoolModal,
    showEditModal,
    showTransferModal,
    showHistoryModal,
  ]);

  const areMandatoryFieldsFilled = () => {
    if (mode === "Individual") {
      return (
        formData.patientname?.toString().trim() &&

        formData.patientlocation?.toString().trim() &&
        // formData.MRNumber?.toString().trim() &&
        formData.Analyte?.toString().trim() &&
        // formData.locationids?.toString().trim() &&
        formData.volume !== "" &&
        // formData.phoneNumber?.toString().trim() &&
        formData.TestResult?.toString().trim() &&
        formData.gender?.toString().trim() &&
        formData.SampleTypeMatrix?.toString().trim() &&
        // formData.age !== "" &&
        formData.ContainerType?.toString().trim()
        // formData.logo instanceof File
      );
    } else if (mode === "Pooled") {
      return (
        formData.MRNumber?.toString().trim() &&
        formData.finalConcentration?.toString().trim() &&
        formData.Analyte?.toString().trim() &&
        // formData.locationids?.toString().trim() &&
        formData.volume !== "" &&
        formData.TestResult?.toString().trim() &&
        formData.TestResultUnit?.toString().trim() &&
        formData.SampleTypeMatrix?.toString().trim() &&
        formData.ContainerType?.toString().trim() &&
        formData.logo instanceof File &&
        formData.samplepdf instanceof File
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

    const printWindow = window.open("", "", "width=300,height=200");
    if (!printWindow) return;

    printWindow.document.write(`
    <html>
      <head>
        <style>
          @page {
            size: 50mm 25mm;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 25mm;
            width: 50mm;
          }
          svg {
            width: 90%;
            height: 100%;     /* Allow full vertical space */
            max-height: 100%; /* Remove 90% cap */
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
              height: 100,         // 🔼 Increased height
              width: 1,
              displayValue: false,
              margin: 0
            });

            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  // useEffect(() => {
  //   const wrapper = document.querySelector(".table-wrapper");
  //   const onWheel = (e) => {
  //     if (e.deltaY !== 0) {
  //       wrapper.scrollLeft += e.deltaY;
  //     }
  //   };
  //   wrapper.addEventListener("wheel", onWheel);
  //   return () => wrapper.removeEventListener("wheel", onWheel);
  // }, []);


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
            Note: Click on Location Id to see Sample Picture.
          </h6>
          <h6>
            Note: Click on Sample Icon to see Pooled Sample History.
          </h6>
          <h6>
            Note: Click on Scale Icon to Add <b>Test Result and Unit of Pooled Sample</b>
          </h6>
        </div>


        {/* Button */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">

          {/* FILTERS SECTION */}
          <div className="d-flex flex-wrap gap-4 align-items-end">
            {/* Date From */}
            <div className="form-group">
              <label className="form-label fw-semibold mb-1">Date From</label>
              <input
                type="date"
                className="form-control border rounded-3"
                style={{ width: "200px", height: "42px" }}
                value={dateFrom}
                min="2025-05-01"
                max={today}
                onChange={(e) => {
                  const value = e.target.value;
                  setDateFrom(value);
                  handleFilterChange("date_from", value);
                }}
              />
            </div>

            {/* Date To */}
            <div className="form-group">
              <label className="form-label fw-semibold mb-1">Date To</label>
              <input
                type="date"
                className="form-control border rounded-3"
                style={{ width: "200px", height: "42px" }}
                value={dateTo}
                min="2025-05-01"
                max={today}
                onChange={(e) => {
                  const value = e.target.value;
                  setDateTo(value);
                  handleFilterChange("date_to", value);
                }}
              />
            </div>

            {/* Analyte */}
            <div className="form-group">
              <label className="form-label fw-semibold mb-1">Analyte</label>
              <input
                type="text"
                className="form-control border rounded-3"
                placeholder="Enter Analyte"
                style={{ width: "200px", height: "42px" }}
                value={analyte}
                onChange={(e) => {
                  setAnalyte(e.target.value);
                  handleFilterChange("Analyte", e.target.value);
                }}
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label fw-semibold mb-1">Gender</label>
              <select
                className="form-select border rounded-3"
                style={{ width: "200px", height: "42px" }}
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  handleFilterChange("gender", e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label fw-semibold mb-1">Sample Mode</label>
              <select
                className="form-select border rounded-3"
                style={{ width: "200px", height: "42px" }}
                value={filtersamplemode}
                onChange={(e) => {
                  console.log(e.target.value)
                  setFilterSampleMode(e.target.value);
                  handleFilterChange("samplemode", e.target.value);
                }}
              >
                <option value="">All</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
                <option value="Pooled">Pooled</option>
              </select>
            </div>

            {/* Age Filter - NEW */}
            {/* <div className="form-group">
              <label className="form-label fw-semibold mb-1">Age</label>
              <input
                type="number"
                className="form-control border rounded-3"
                placeholder="Enter age"
                style={{ width: "200px", height: "42px" }}
                value={ageFilter}
                onChange={(e) => {
                  setAgeFilter(e.target.value);
                  // handleFilterChange("age", e.target.value);
                }}
                min="0"
              />
            </div> */}

            {/* Clear Button */}
            {(analyte || gender || ageFilter || dateFrom || dateTo || filtersamplemode) && (
              <div className="form-group">
                <label className="d-block mb-1">&nbsp;</label>
                <button
                  className="btn btn-outline-danger rounded-pill px-3 shadow-sm"
                  onClick={() => {
                    setAnalyte("");
                    setGender("");
                    setAgeFilter("");
                    setFilterSampleMode("")
                    setCollectionSite("");
                    setVisibility("");
                    setDateFrom("");
                    setDateTo(today);
                    fetchSamples(1, itemsPerPage, {});
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="d-flex flex-wrap gap-2">
            {actions.some(a => ['add_full', 'add_basic', 'edit', 'dispatch', 'receive', 'all'].includes(a)) && (
              <>
                <button
                  onClick={handleSelect}
                  className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                >
                  {poolMode ? "Make Pool" : "Mark Sample as Pool"}
                </button>

                {(actions.includes('add_full') ||
                  actions.includes('add_basic') ||
                  actions.includes('all')) && (
                    <button
                      onClick={() => {
                        setMode("Individual");
                        setShowAddModal(true);
                      }}
                      className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
                    >
                      <i className="fas fa-vial"></i> Add Sample
                    </button>
                  )}
              </>
            )}
          </div>
        </div>



        {/* Table */}
        <div className="table-responsive" style={{ overflowX: "auto" }}>
          <table
            className="table table-bordered table-hover text-center align-middle border"
            style={{ width: "100%" }} // Removed tableLayout: "fixed"
          >
            <thead className="table-primary text-dark">
              <tr>
                {poolMode && (
                  <th>
                    <div className="d-flex flex-column align-items-center">
                      <span className="fw-bold fs-6 text-wrap">Pool</span>
                      <span className="small text-muted">
                        Selected: {selectedSamples.length}
                      </span>
                    </div>
                  </th>
                )}
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="text-center align-middle px-2" style={{
                    maxWidth: key === "volume" ? "80px" : "150px",
                    minWidth: key === "volume" ? "60px" : "auto",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                  >
                    <div className="d-flex flex-column justify-content-between align-items-center" style={{ gap: "4px" }}>
                      <input
                        type="text"
                        className="form-control form-control-sm text-center"
                        placeholder={`Search ${label}`}
                        onChange={(e) => handleFilterChange(key, e.target.value)}
                        style={{
                          fontSize: "13px",
                          padding: "2px 6px",
                          width: "100%",
                          maxWidth: "120px",
                        }}
                      />
                      <span className="fw-bold fs-6 text-wrap text-center" style={{ fontSize: "13px" }}>
                        {label}
                      </span>
                    </div>
                  </th>
                ))}

                {actions.some(action => ['edit', 'dispatch', 'receive', 'all'].includes(action)) && (
                  <th>
                    <span className="fw-bold fs-6">Action</span>
                  </th>
                )}
              </tr>
            </thead>


            <tbody className="table-light">
               {combinedData.length > 0 ? (
                combinedData.map((sample) => {
                  const isSelected = selectedSamples.includes(sample.id);
                  
                  return (
                    <tr 
                      key={sample.id} 
                      className={isSelected ? "table-warning" : ""}
                    >
                      {poolMode && (
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCheckboxChange(sample)}
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
                              : "text-center"
                        }
                        style={{
                          maxWidth: key === "volume" ? "80px" : "150px",
                          minWidth: key === "volume" ? "60px" : "auto",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        }}

                      >
                        {(() => {
                          if (key === "PatientName") {
                            return (
                              <span
                                className="text-primary fw-semibold fs-6 text-decoration-underline"
                                role="button"
                                title="Sample Details"
                                onClick={() => openPatientModal(sample)}
                                style={{ cursor: "pointer", transition: "color 0.2s" }}
                                onMouseOver={(e) => (e.target.style.color = "#0a58ca")}
                                onMouseOut={(e) => (e.target.style.color = "")}
                              >
                                {sample.PatientName || "----"}
                              </span>
                            );
                          } else if (key === "Analyte") {
                            return (
                              <span
                                className="text-primary fw-semibold fs-6 text-decoration-underline"
                                role="button"
                                title="Sample Details"
                                onClick={() => openModal(sample)}
                                style={{ cursor: "pointer", transition: "color 0.2s" }}
                                onMouseOver={(e) => (e.target.style.color = "#0a58ca")}
                                onMouseOut={(e) => (e.target.style.color = "")}
                              >
                                {sample.Analyte || "----"}
                              </span>
                            );
                          } else if (key === "samplemode" && ["Low", "Medium", "High"].includes(sample.samplemode)) {
                            return (
                              <span className="text-danger fw-semibold">
                                Add to Pool - {sample.samplemode}
                              </span>
                            );
                          } else if (key === "locationids") {
                            const tooltip = `${sample.room_number || "N/A"} = Room Number\n${sample.freezer_id || "N/A"} = Freezer ID\n${sample.box_id || "N/A"} = Box ID`;

                            const handleLogoClick = () => {
                              const logo =
                                typeof sample.logo === "string"
                                  ? sample.logo
                                  : sample.logo?.data
                                    ? URL.createObjectURL(
                                      new Blob([new Uint8Array(sample.logo.data)], {
                                        type: "image/png",
                                      })
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
                          } else if (key === "gender") {
                            const gender = sample.gender || "";
                            const age =
                              sample.age !== null &&
                                sample.age !== undefined &&
                                sample.age !== "" &&
                                sample.age !== 0
                                ? `${sample.age} years`
                                : "";
                            return [gender, age].filter(Boolean).join(" | ") || "----";
                          } else if (key === "age") {
                            return !sample.age || sample.age === 0
                              ? "-----"
                              : `${sample.age} years`;
                          } else if (key === "TestResult") {
                            const result = sample.TestResult;
                            const unit = sample.TestResultUnit;
                            return result || unit
                              ? `${result || ""} ${unit || ""}`.trim()
                              : "----";
                          } else {
                            return sample[key] || "----";
                          }
                        })()}
                      </td>
                    ))}


                    {actions.some(action =>
                      ["edit", "dispatch", "history", "all"].includes(action)
                    ) && (
                        <td className="text-center align-middle">
                          <div className="dropdown">
                            <button
                              className="btn btn-light btn-sm"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              <i className="fas fa-ellipsis-v text-dark"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end p-1 shadow-sm">
                              {(actions.includes("edit") || actions.includes("add") || actions.includes("all")) && (
                                <li>
                                  <button
                                    className="dropdown-item  fw-semibold"
                                    style={{ color: "#FF5733" }}
                                    onClick={() => {
                                      setSelectedBarcodeId(sample.masterID);
                                      handlePrint(sample.masterID);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPrint} className="me-2" />
                                    Print Barcode
                                  </button>
                                </li>
                              )}
                              {(actions.includes("edit") || actions.includes("add") || actions.includes("all")) &&
                                sample.samplemode !== "Individual" &&
                                sample.samplemode !== "Pooled" && (
                                  <li>
                                    <button
                                      className="dropdown-item text-success fw-semibold"
                                      onClick={() => handleTestRsultsandUnit(sample)}
                                    >
                                      <FontAwesomeIcon icon={faRuler} className="me-2" />
                                      Test Result & Unit
                                    </button>
                                  </li>
                                )}
                              {(actions.includes("edit") || actions.includes("all")) && sample.sourceType === "own" && (
                                <li>
                                  <button
                                    className="dropdown-item text-success fw-semibold"
                                    onClick={() => handleEditClick(sample)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} className="me-2" />
                                    Edit
                                  </button>
                                </li>
                              )}
                              {(actions.includes("dispatch") || actions.includes("all")) && (
                                <li>
                                  <button
                                    className="dropdown-item text-primary fw-semibold"
                                    onClick={() => handleTransferClick(sample)}
                                  >
                                    <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                                    Transfer
                                  </button>
                                </li>
                              )}
                              {(actions.includes("history") || actions.includes("all")) && sample.sourceType === "own" && (
                                <li>
                                  <button
                                    className="dropdown-item text-warning fw-semibold"
                                    onClick={() => handleShowHistory("sample", sample.id)}
                                  >
                                    <i className="fa fa-history me-2"></i>
                                    History
                                  </button>
                                </li>
                              )}
                              {(actions.includes("history") || actions.includes("all")) && sample.sourceType === "own" &&
                                sample.samplemode !== "Individual" && (
                                  <li>
                                    <button
                                      className="dropdown-item text-warning fw-semibold"
                                      onClick={() => handlePoolSampleHistory(sample.id, sample.Analyte)}
                                    >
                                      <i className="fas fa-vial me-2"></i>
                                      Pool Sample History
                                    </button>
                                  </li>
                                )}
                            </ul>
                          </div>
                        </td>


                      )}
                  </tr>
                  );
})
              ) : (
                <tr>
                  <td
                    colSpan={tableHeaders.length + (poolMode ? 2 : 1)}
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
        {totalPages >= 0 && (
          <Pagination
            handlePageClick={handlePageChange}
            pageCount={totalPages}
            focusPage={currentPage - 1} // If using react-paginate, which is 0-based
          />
        )}
        <div>
          {totalCount > 0 && (
            <p>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
            </p>

          )}
        </div>
        {showoptionModal && (
          <Modal
            show={showoptionModal}
            onHide={() => setshowOptionModal(false)}
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title>Would you like the pool sample in?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Check
                  type="radio"
                  label="New pool sample"
                  name="poolSample"
                  value="new"
                  checked={selectedOption === "new"}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    setshowOptionModal(false);   // option modal band hoga
                    setshowAddPoolModal(true);   // new pool modal khul jaye
                  }}
                />
                <Form.Check
                  type="radio"
                  label="Already pooled sample"
                  name="poolSample"
                  value="already"
                  checked={selectedOption === "already"}
                  onChange={(e) => {
                    setSelectedOption(e.target.value);
                    setshowOptionModal(false);   // option modal band hoga
                    setshowAddPoolModal(true);   // new pool modal khul jaye
                  }}
                />
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setshowOptionModal(false)}
              >
                Close
              </Button>
              {/* <Button
                variant="primary"
                onClick={() => {
                  if (!selectedOption) {
                    alert("Please select an option first!");
                    return;
                  }
                  setshowOptionModal(false);
                  setshowAddPoolModal(true);
                }}
              >
                Proceed
              </Button> */}
            </Modal.Footer>
          </Modal>
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
                                        ? "#fff"
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
                                        ? "#fff"
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
                                        ? "#fff"
                                        : "#fff",
                                    }}
                                    pattern="03[0-9]{2}-[0-9]{7}"
                                    title="Format should be XXXX-XXXXXXX"
                                  // required
                                  />
                                </div>
                                <div className="form-group col-md-6">
                                  <label>
                                    Location (IDs){" "}
                                    <span className="text-danger"></span>
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
                                            ? "#fff"
                                            : "#fff",
                                        }}
                                        // required
                                        title="Location ID's = Room Number, Freezer ID and Box ID"
                                      />
                                    )}
                                  </InputMask>
                                </div>
                                <div className="form-group col-md-6 react-select-container">
                                  <label>
                                    Analyte <span className="text-danger">*</span>
                                  </label>
                                  <Select
                                    options={analyteOptions}
                                    value={analyteOptions.find(option => option.value === formData.Analyte)}
                                    onChange={(selectedOption) =>
                                      handleInputChange({
                                        target: { name: "Analyte", value: selectedOption?.value || "" },
                                      })
                                    }
                                    required
                                    isClearable
                                    classNamePrefix="react-select"
                                    menuPortalTarget={document.body}
                                    styles={{
                                      control: (base, state) => ({
                                        ...base,
                                        minHeight: 40,
                                        height: 40,
                                        fontSize: 14,
                                        backgroundColor: !formData.Analyte ? "#fdecea" : "#fff",
                                        borderColor: state.isFocused ? "#80bdff" : base.borderColor,
                                        boxShadow: state.isFocused ? "0 0 0 0.2rem rgba(0,123,255,.25)" : "none",
                                        display: "flex",
                                        alignItems: "center", // ensures vertical centering
                                      }),
                                      singleValue: (base) => ({
                                        ...base,
                                        display: "flex",
                                        alignItems: "center",
                                        height: "40px",
                                        lineHeight: "40px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        maxWidth: "calc(100% - 30px)", // leaves space for clear/dropdown icons
                                      }),
                                      valueContainer: (base) => ({
                                        ...base,
                                        padding: "0 8px",
                                        display: "flex",
                                        alignItems: "center",
                                        height: 40,
                                        overflow: "hidden",
                                      }),

                                      indicatorsContainer: (base) => ({
                                        ...base,
                                        height: 40,
                                        display: "flex",
                                        alignItems: "center", // centers icons
                                      }),
                                      dropdownIndicator: (base) => ({
                                        ...base,
                                        padding: 4,
                                        display: "flex",
                                        alignItems: "center",
                                      }),
                                      clearIndicator: (base) => ({
                                        ...base,
                                        padding: 4,
                                        display: "flex",
                                        alignItems: "center",
                                      }),
                                      option: (base, state) => ({
                                        ...base,
                                        fontSize: 13,
                                        padding: "6px 10px",
                                        backgroundColor: state.isSelected
                                          ? "#007bff"
                                          : state.isFocused
                                            ? "#e9f5ff"
                                            : "#fff",
                                        color: state.isSelected ? "#fff" : "#000",
                                      }),
                                      menu: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                      }),
                                      menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                      }),
                                    }}

                                  />

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
                                        disabled={!!formData.TestResultUnit} // ✅ Disable if unit is auto-set
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
                                          ? "#fff"
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
                      {(actions.includes("all") || actions.includes("add_full") || actions.includes("edit")) && (
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
                            Add Additional Details <span className="text-danger">(can be added if above mandatory fields are enter)</span>
                          </label>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting} // prevent multiple clicks
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            {showAddModal ? "Saving..." : "Updating..."}
                          </>
                        ) : (
                          showAddModal ? "Save" : "Update"
                        )}
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
            {/* Backdrop */}
            <div
              className="modal-backdrop fade show"
              style={{ backdropFilter: "blur(5px)" }}
            ></div>

            {/* Modal */}
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
              <div className="modal-dialog" role="document" style={{ width: "100%" }}>
                <div className="modal-content">
                  <div className="modal-header" style={{ backgroundColor: "#cfe2ff" }}>
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
                        setSelectedSampleName("");
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

                  <form onSubmit={showAddPoolModal ? handleSubmit : handleUpdate}>
                    <div className="modal-body">
                      <div className="row">
                        {selectedOption !== "already" ? (
                          <>
                            {/* ✅ Show ALL fields if selectionOption is "new" */}

                            {/* Analyte */}
                            <div className="form-group col-md-6">
                              <label>
                                Analyte <span className="text-danger">*</span>
                              </label>
                              {showEditPoolModal ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  name="Analyte"
                                  value={formData.Analyte || ""}
                                  disabled
                                  style={{
                                    height: "45px",
                                    fontSize: "14px",
                                    backgroundColor: "#f5f5f5",
                                  }}
                                />
                              ) : (
                                <select
                                  className="form-control"
                                  name="Analyte"
                                  value={formData.Analyte}
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      Analyte: e.target.value,
                                    }))
                                  }
                                  required
                                  style={{
                                    height: "45px",
                                    fontSize: "14px",
                                    backgroundColor: !formData.Analyte ? "#fdecea" : "#fff",
                                  }}
                                >
                                  <option value="" disabled hidden>
                                    Select Analyte
                                  </option>
                                  {Array.isArray(analyteOptions) &&
                                    analyteOptions.map((analyte, index) => (
                                      <option key={index} value={analyte.value}>
                                        {analyte.label || analyte.value}
                                      </option>
                                    ))
                                  }

                                </select>
                              )}
                           
                            </div>

                            {/* Location IDs */}
                            <div className="form-group col-md-6">
                              <label>Location (IDs)</label>
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
                                    style={{ height: "45px", fontSize: "14px", backgroundColor: !formData.locationids ? "#fff" : "#fff", }}
                                    title="Location ID's = Room Number, Freezer ID and Box ID"
                                  />
                                )}
                              </InputMask>
                            </div>

                            {/* Final Concentration */}
                            <div className="form-group col-md-6">
                              <label className="mb-2">
                                Final Concentration <span className="text-danger">*</span>
                              </label>
                              <div className="d-flex gap-3">
                                {["Low", "Medium", "High"].map((level) => (
                                  <div key={level} className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="finalConcentration"
                                      id={`finalConcentration-${level}`}
                                      value={level}
                                      checked={formData.finalConcentration === level}
                                      onChange={(e) => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          finalConcentration: e.target.value,
                                        }))
                                        setMode(e.target.value);
                                      }
                                      }
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

                            {/* Volume */}
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
                                  max={unitMaxValues[formData.VolumeUnit] || undefined}
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
                                  style={{
                                    backgroundColor: !formData.VolumeUnit
                                      ? "#fdecea"
                                      : "#fff",
                                  }}
                                  required
                                >
                                  <option value="" hidden></option>
                                  {volumeunitNames.map((name, index) => (
                                    <option key={index} value={name}>
                                      {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Sample Type Matrix */}
                            <div className="form-group col-md-6">
                              <label>
                                Sample Type Matrix <span className="text-danger">*</span>
                              </label>
                              <select
                                className="form-control"
                                name="SampleTypeMatrix"
                                value={formData.SampleTypeMatrix || ""}
                                onChange={handleInputChange}
                                required
                                style={{
                                  height: "45px",
                                  fontSize: "14px",
                                  backgroundColor: !formData.SampleTypeMatrix ? "#fdecea" : "#fff",
                                }}
                              >
                                <option value="" hidden> Select Option</option>
                                {selectedSampleTypeMatrixes.includes(formData.SampleTypeMatrix) ? null : (
                                  <option value={formData.SampleTypeMatrix}>{formData.SampleTypeMatrix}</option>
                                )}
                                {selectedSampleTypeMatrixes.map((matrix, index) => (
                                  <option key={index} value={matrix}>
                                    {matrix}
                                  </option>
                                ))}
                              </select>


                            </div>

                            {/* Container Type */}
                            <div className="form-group col-md-6">
                              <label>
                                Container Type <span className="text-danger">*</span>
                              </label>
                              <select
                                className="form-control"
                                name="ContainerType"
                                style={{
                                  backgroundColor: !formData.ContainerType
                                    ? "#fdecea"
                                    : "#fff",
                                }}
                                value={formData.ContainerType}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="" hidden></option>
                                {containertypeNames.map((name, index) => (
                                  <option key={index} value={name}>
                                    {name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Sample Picture */}
                            <div className="form-group col-md-6">
                              <label>Sample Picture</label>
                              <div className="d-flex align-items-center">
                                <input
                                  name="logo"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => logoHandler(e.target.files[0])}
                                  className="form-control"
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
                          </>
                        ) : (
                          <>
                            {/* ✅ Only Volume if selectionOption is "already" */}

                            <div className="form-group col-md-8">
                              <label className="mb-2">
                                Final Concentration <span className="text-danger">*</span>
                              </label>
                              <div className="d-flex gap-3">
                                {["Low", "Medium", "High"].map((level) => (
                                  <div key={level} className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="radio"
                                      name="samplemode"
                                      id={`samplemode-${level}`}
                                      value={level}
                                      checked={formData.samplemode === level}
                                      onChange={(e) => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          samplemode: e.target.value,
                                        }));
                                        setMode(e.target.value);
                                      }
                                      }
                                      required
                                    />
                                    <label
                                      className="form-check-label"
                                      htmlFor={`samplemode-${level}`}
                                    >
                                      {level}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Show Analyte & Volume ONLY if Final Concentration is selected */}
                            {formData.samplemode && (
                              <>
                                <div className="form-group col-md-6">
                                  <label>
                                    Analyte <span className="text-danger">*</span>
                                  </label>
                                  <select
                                    className="form-control"
                                    name="Analyte"
                                    value={formData.AnalyteUniqueKey || ""}
                                    onChange={(e) => {
                                     const selectedAnalyte = filteredAnalytes.find(
                                    (sample) =>
                                    `${sample.Analyte}_${sample.volume}_${sample.VolumeUnit}` === e.target.value
                                     );

                                  if (!selectedAnalyte) return;

                                 // ✅ Calculate volume including selected samples + this analyte
                                 const { volume, VolumeUnit } = calculateTotalVolume(
                                    selectedAnalyte?.Analyte,
                                    selectedAnalyte
                                  );

                                  setSelectedPoolSample(selectedAnalyte);

                                  const formattedLocationId = `${String(
                                    selectedAnalyte?.room_number || 0
                                  ).padStart(3, "0")}-${String(
                                    selectedAnalyte?.freezer_id || 0
                                  ).padStart(3, "0")}-${String(
                                    selectedAnalyte?.box_id || 0
                                  ).padStart(3, "0")}`;

                                  setFormData((prev) => ({
                                    ...prev,
                                    Analyte: selectedAnalyte.Analyte,
                                    AnalyteUniqueKey: `${selectedAnalyte.Analyte}_${selectedAnalyte.volume}_${selectedAnalyte.VolumeUnit}`,
                                    volume: volume, // ✅ Use calculated volume
                                    VolumeUnit: VolumeUnit, // ✅ Use calculated unit
                                    SampleTypeMatrix: selectedAnalyte?.SampleTypeMatrix || prev.SampleTypeMatrix,
                                    ContainerType: selectedAnalyte?.ContainerType || prev.ContainerType,
                                    finalConcentration: selectedAnalyte?.finalConcentration || prev.finalConcentration,
                                    locationids: formattedLocationId,
                                  }));

                                    }}
                                    
                                    required
                                    disabled={filteredAnalytes.length === 0} // 👈 disable when no analytes
                                  >
                                    {filteredAnalytes.length === 0 ? (
                                      <option value="">No Analytes Available</option>
                                    ) : (
                                      <>
                                        <option value="" disabled hidden>
                                          Select Analyte
                                        </option>
                                        {filteredAnalytes.map((sample, index) => (
                                          <option
                                            key={index}
                                            value={`${sample.Analyte}_${sample.volume}_${sample.VolumeUnit}`}
                                          >
                                            {sample.Analyte}
                                            {sample.volume
                                              ? ` (${sample.volume}${sample.VolumeUnit ? " " + sample.VolumeUnit : ""
                                              })`
                                              : ""}
                                          </option>
                                        ))}
                                      </>
                                    )}
                                  </select>
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
                                      max={unitMaxValues[formData.VolumeUnit] || undefined}
                                      required
                                      style={{
                                        height: "45px",
                                        fontSize: "14px",
                                        backgroundColor: !formData.volume ? "#fdecea" : "#fff",
                                      }}
                                    />
                                    <select
                                      className="form-control"
                                      name="VolumeUnit"
                                      value={formData.VolumeUnit}
                                      onChange={handleInputChange}
                                      style={{
                                        backgroundColor: !formData.VolumeUnit
                                          ? "#fdecea"
                                          : "#fff",
                                      }}
                                      required
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
                                </div>
                              </>
                            )}

                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer d-flex justify-content-between align-items-center">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          setshowOptionModal(true);
                          setshowAddPoolModal(false);
                          resetFormData()
                        }}
                      >
                        Back
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {showAddPoolModal ? "Save" : "Update"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </>
        )}

        {(showAddtestResultandUnitModal || showEdittestResultandUnitModal) && (
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
                      {selectedSampleName}
                    </h5>
                    <button
                      type="button"
                      className="close"
                      onClick={() => {
                        setShowAddTestResultandUnitModal(false);
                        setSelectedSampleName("")
                        setSelectedSampleId("")
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
                    onSubmit={handleAddTestResult}
                  >
                    <div className="modal-body">
                      {/* Parallel Columns - 5 columns */}
                      <div className="row">
                        {/* Only show selected fields in pool mode */}
                        <div className="col-md-12">
                          <div className="row">

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
                                Test Result Report <span className="text-danger">*</span>
                              </label>
                              <div className="d-flex align-items-center">
                                <input
                                  name="samplepdf"
                                  type="file"
                                  accept="application/pdf"
                                  onChange={(e) =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      samplepdf: e.target.files[0],
                                    }))
                                  }
                                  className="form-control"
                                  required={!formData.samplepdf}
                                  style={{
                                    height: "45px",
                                    fontSize: "14px",
                                    backgroundColor: !formData.samplepdf
                                      ? "#fdecea"
                                      : "#fff",
                                    border: "1px solid #ced4da",
                                  }}
                                />
                                {(formData.samplepdf instanceof File || samplePdfPreview) && (
                                  <a
                                    href={
                                      formData.samplepdf instanceof File
                                        ? URL.createObjectURL(formData.samplepdf)
                                        : samplePdfPreview
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ms-3"
                                    style={{ fontSize: "13px" }}
                                  >
                                    View PDF
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-between align-items-center">
                      <button type="submit" className="btn btn-primary">
                        {showAddtestResultandUnitModal ? "Save" : "Update"}
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

       <DetailModal
          show={PoolSampleHistoryModal}
          onHide={() => {
            setSelectedSampleName("");
            setPoolSampleHistoryModal(false);
          }}
          title={selectedSampleName || "Sample History"}
          tableData={poolhistoryData}
          tableColumns={[
            { label: "Analyte", key: "Analyte" },
            { label: "Patient Name", key: "PatientName" },
            { label: "Test Result & Unit", key: "TestResult" },
            { label: "MR Number", key: "MRNumber" },
            { label: "Age", key: "age" },
            { label: "Gender", key: "gender" },
          ]}
        />
       
      <DetailModal
          show={showLogoModal}
          onHide={() => setShowLogoModal(false)}
          title="Sample Picture"
          imageUrl={selectedLogoUrl}
          fallbackText="No logo available."
        />
      </div>
      <DetailModal
        show={showModal}
        onHide={closeModal}
        title="Sample Details"
        data={selectedSample}
        fieldsToShow={fieldsToShowInOrder}
      />

      <DetailModal
        show={showPatientModal}
        onHide={closeModal}
        title="Patient Details"
        data={selectedSample}
        fieldsToShow={[
          { label: "MRNumber", key: "MRNumber" },
          { label: "Patient Location", key: "PatientLocation" },
        ]}
      />

    </section>
  );
};

export default SampleArea;