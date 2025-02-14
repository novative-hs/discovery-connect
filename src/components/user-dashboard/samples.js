import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { notifyError, notifySuccess } from "@utils/toast";
import CartSidebar from "@components/common/sidebar/cart-sidebar";
import { Cart } from "@svg/index"; 

const SampleArea = () => {
  const id = localStorage.getItem("userID");
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
     price: "",
     SamplePriceCurrency: "",
     quantity: "",
     QuantityUnit: "",
     SampleTypeMatrix: "",
     SmokingStatus: "",
     AlcoholOrDrugAbuse: "",
     InfectiousDiseaseTesting: "",
     InfectiousDiseaseResult: "",
     status: "In Stock",
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
     user_account_id: "",
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
   const [isCartOpen,setIsCartOpen]=useState(false);
const[quantity,setQuantity]=useState(0);
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(samples.length / itemsPerPage);
  const incrementQuantity = (sample) => {
    const updatedQuantity = quantity + 1;
    setQuantity(updatedQuantity); // Update quantity
  
    // Use a callback to ensure formData is set before making the API call
    setFormData(prevData => {
      const newFormData = {
        ...prevData, // Preserve any existing data in formData
        donorID: sample.donorID,
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
        user_account_id: id
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
  const handleAddClick = async(e) => {
    console.log(e)
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
  }

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
                              style={{ minWidth: "120px"}} 
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
                <button className="btn btn-success btn-sm" onClick={() => handleEditClick(sample)}>
                  <i className="fas fa-edit"></i>
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => {
                  setSelectedSampleId(sample.id);
                  setShowDeleteModal(true);
                }}>
                  <i className="fas fa-trash"></i>
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleTransferClick(sample)}>
                  <i className="fas fa-exchange-alt"></i>
                </button>
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={tableHeaders.length + 1} className="text-center">
            No samples available
          </td>
        </tr>
      )}
    </tbody>
                </table>
              </div>
              {/* Pagination Controls */}
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
            </div>
          </div>
        </div>
      </div>
      <CartSidebar isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen} sample={formData} />

    </section>
    
  );
};

export default SampleArea;
