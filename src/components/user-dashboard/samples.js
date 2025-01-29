import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  
  faCartPlus,

} from "@fortawesome/free-solid-svg-icons";
import { notifyError, notifySuccess } from "@utils/toast";
const SampleArea = () => {
  const id = localStorage.getItem("userID");
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
     user_account_id: "",
   });
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
        quantity: updatedQuantity, // Incremented quantity
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
    <section className="policy__area pb-120">
      <div className="container" style={{ marginTop: "-20px", width: "auto" }}>
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
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ID"
                          onChange={(e) =>
                            handleFilterChange("id", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        ID
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Master ID"
                          onChange={(e) =>
                            handleFilterChange("masterID", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Master ID
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Donor ID"
                          onChange={(e) =>
                            handleFilterChange("donorID", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Donor ID
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Sample Name"
                          onChange={(e) =>
                            handleFilterChange("samplename", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Sample Name
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Age"
                          onChange={(e) =>
                            handleFilterChange("age", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Age
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Gender"
                          onChange={(e) =>
                            handleFilterChange("gender", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Gender
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Ethnicity"
                          onChange={(e) =>
                            handleFilterChange("ethnicity", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Ethnicity
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Sample Condition
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Storage Temperature"
                          onChange={(e) =>
                            handleFilterChange("storagetemp", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Storage Temperature
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Storage Temperature Unit
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Container Type"
                          onChange={(e) =>
                            handleFilterChange("ContainerType", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Container Type
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Country Of Collection
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Price"
                          onChange={(e) =>
                            handleFilterChange("price", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Price
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Sample Price Currency
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Quantity"
                          onChange={(e) =>
                            handleFilterChange("quantity", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
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
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Quantity Unit"
                          onChange={(e) =>
                            handleFilterChange("QuantityUnit", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Quantity Unit
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Lab Name"
                          onChange={(e) =>
                            handleFilterChange("labname", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Lab Name
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Sample Type Matrix
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Type Matrix Subtype
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Procurement Type
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search End Time"
                          onChange={(e) =>
                            handleFilterChange("endTime", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        End Time
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Smoking Status"
                          onChange={(e) =>
                            handleFilterChange("SmokingStatus", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Smoking Status
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Method"
                          onChange={(e) =>
                            handleFilterChange("TestMethod", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Test Method
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Result"
                          onChange={(e) =>
                            handleFilterChange("TestResult", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Test Result
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Result Unit"
                          onChange={(e) =>
                            handleFilterChange("TestResultUnit", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Test Result Unit
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Infectious Disease Testing
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Infectious Disease Result
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Cut Off Range"
                          onChange={(e) =>
                            handleFilterChange("CutOffRange", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Cut Off Range
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Cut Off Range Unit
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Freeze Thaw Cycles
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Date Of Collection
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Concurrent Medical Conditions
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Concurrent Medications
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Alcohol Or Drug Abuse
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Diagnosis Test Parameter
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Result Remarks"
                          onChange={(e) =>
                            handleFilterChange("ResultRemarks", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Result Remarks
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test Kit"
                          onChange={(e) =>
                            handleFilterChange("TestKit", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Test Kit
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Test Kit Manufacturer
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Test System"
                          onChange={(e) =>
                            handleFilterChange("TestSystem", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Test System
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
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
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Test System Manufacturer
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
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Status"
                          onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                          }
                          style={{
                            width: "80%",
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px",
                            maxWidth: "180px",
                          }}
                        />
                        Status
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        Action
                      </th>
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
                          {/*<td>{sample.user_id}</td>*/}
                          <td>{sample.status}</td>
                          <td>
                          <button
  className="btn btn-danger btn-sm"
  onClick={() => incrementQuantity(sample)} // Wrap the function in an arrow function
  title="Edit Researcher" // This is the text that will appear on hover
>


                            <FontAwesomeIcon icon={faCartPlus} size="sm" />
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
              {/* Pagination Controls */}
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SampleArea;
