import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { notifyError, notifySuccess } from "@utils/toast";
import CartSidebar from "@components/common/sidebar/cart-sidebar";
import { Cart } from "@svg/index";
import Pagination from "@ui/Pagination";
const SampleArea = () => {
  const id = localStorage.getItem("userID");
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete

  const tableHeaders = [
    { label: "Sample Name", key: "samplename" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Price", key: "price" },
    { label: "Sample Price Currency", key: "SamplePriceCurrency" },
    { label: "Quantity", key: "quantity" },
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
    price: "",
    SamplePriceCurrency: "",
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

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const [filteredSamples, setFilteredSamples] = useState(samples); // State for filtered samples
  const incrementQuantity = (sample) => {
    const updatedQuantity = quantity + 1;
    setQuantity(updatedQuantity); // Update quantity

    // Use a callback to ensure formData is set before making the API call
    setFormData((prevData) => {
      const newFormData = {
        ...prevData, // Preserve any existing data in formData
        samplename: sample.samplename,
        age: sample.age,
        gender: sample.gender,
        ethnicity: sample.ethnicity,
        samplecondition: sample.samplecondition,
        storagetemp: sample.storagetemp,
        ContainerType: sample.ContainerType,
        CountryOfCollection: sample.CountryOfCollection,
        price: sample.price,
        SamplePriceCurrency: sample.SamplePriceCurrency,
        quantity: updatedQuantity, // Incremented quantity
        QuantityUnit: sample.QuantityUnit,
        SampleTypeMatrix: sample.SampleTypeMatrix,
        SmokingStatus: sample.SmokingStatus,
        AlcoholOrDrugAbuse: sample.AlcoholOrDrugAbuse,
        InfectiousDiseaseTesting: sample.InfectiousDiseaseTesting,
        InfectiousDiseaseResult: sample.InfectiousDiseaseResult,
        status: sample.status,
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
        user_account_id: id,
      };

      // Make API call directly after updating the form data
      handleAddClick(newFormData); // Pass updated formData to the API call
    });
  };

  const fetchSamples = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getAll`
      );
      setFilteredSamples(response.data)
      setSamples(response.data); // Store fetched samples in state
    } catch (error) {
      console.error("Error fetching samples:", error);
    }
  };

  // Fetch samples from backend when component loads
  useEffect(() => {
    if (id === null) {
      return <div>Loading...</div>;
    } else {
      fetchSamples();
    }
  }, []);

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredSamples.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredSamples]);

  // Get the current data for the table
  const currentData = filteredSamples.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };



  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = samples; // Show all if filter is empty
    } else {
      filtered = samples.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
    }

    setFilteredSamples(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
  };
  const handleAddClick = async (e) => {
    console.log(e);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/post`,
        e
      );
      notifySuccess("Sample added to cart successfully");
      console.log("Sample added to cart successfully:", response.data);

      const newResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/get`
      );
      setSamples(newResponse.data);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      notifyError("Error adding Sample to cart successfully");
      console.error(
        `Error to add sample cart with ID ${selectedSampleId}:`,
        error
      );
    }
  };

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <div className="row justify-content-center">
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
                          className="form-control form-control-sm w-100"
                          placeholder={label}
                          onChange={(e) =>
                            handleFilterChange(key, e.target.value)
                          }
                          style={{ minWidth: "120px" }}
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
                        <td
                          key={index}
                          className={key === "price" ? "text-end" : "text-center text-truncate"}
                          style={{ maxWidth: "150px" }}
                        >
                          {sample[key] || "N/A"}</td>
                      ))}
                      <td>
                        <div className="d-flex justify-content-around gap-2">
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
          {/* Pagination Controls */}
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage}
            />
          )}
        </div>
      </div>

      <CartSidebar
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        sample={formData}
      />
    </section>
  );
};

export default SampleArea;
