import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartPlus } from "@fortawesome/free-solid-svg-icons";
import { notifyError, notifySuccess } from "@utils/toast";
import CartSidebar from "@components/common/sidebar/cart-sidebar";
import { Cart } from "@svg/index";
import Pagination from "@ui/Pagination";
import Link from "next/link";
import { useSelector } from 'react-redux';
import Modal from "react-bootstrap/Modal";
import {
  add_cart_product,
  initialOrderQuantity,
} from "../../redux/features/cartSlice";
import { useDispatch } from "react-redux";
const SampleArea = () => {
  const id = sessionStorage.getItem("userID");
  const [showModal, setShowModal] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState(null); // Store ID of sample to delete
  const cartItems = useSelector((state) => state.cart?.cart_products || []);
  const isInCart = (sampleId) => {
    return cartItems.some((item) => item.id === sampleId);
  };
  const [selectedSample, setSelectedSample] = useState(null);
  const tableHeaders = [
    { label: "Sample Name", key: "samplename" },
    { label: "Pack size", key: "packsize" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Price", key: "price" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },


  ];
  const openModal = (sample) => {

    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };
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
  const fieldsToShowInOrder = [
    { label: "Sample Name", key: "samplename" },
    // { label: "Price", key: "price" },
    // { label: "Quantity", key: "orderquantity" },
    // { label: "Total Payment", key: "totalpayment" },

    { label: "Ethnicity", key: "ethnicity" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Country of Collection", key: "CountryOfCollection" },
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
  ];

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const dispatch = useDispatch();
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
  const handleAddToCart = (product) => {
    dispatch(add_cart_product(product));
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

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/post`,
        e
      );
      notifySuccess("Sample added to cart successfully");


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
            <table className="table table-bordered table-hover text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr>
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
                  <th className="p-2 text-center" style={{ minWidth: "50px" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((sample) => (
                    <tr key={sample.id}>
                   {tableHeaders.map(({ key }, index) => {
  let content;

  if (key === "price") {
    content = sample.price
      ? `${sample.price} ${sample.SamplePriceCurrency || ""}`
      : "----";
  } else if (key === "samplename") {
    content = (
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
        {sample.samplename || "----"}
      </span>
    );
  } else if (key === "packsize") {
    content = `${sample.packsize || "----"} ${sample.QuantityUnit || ""}`;
  } else {
    content = sample[key] || "----";
  }

  return (
    <td
      key={index}
      className={
        key === "price"
          ? "text-end"
          : key === "samplename"
          ? ""
          : "text-center text-truncate"
      }
      style={{ maxWidth: "150px" }}
    >
      {content}
    </td>
  );
})}

                      <td className="w-auto" style={{ minWidth: "40px" }}>

                        <div className="d-flex justify-content-around gap-3">
                          {isInCart(sample.id) ? (
                            <button className="btn btn-secondary btn-sm" disabled>
                              Added
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary btn-sm position-relative"
                              onClick={() => handleAddToCart(sample)}
                            >
                              <Cart className="fs-7 text-white" />
                            </button>
                          )}
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
      <CartSidebar
        isCartOpen={isCartOpen}
        setIsCartOpen={setIsCartOpen}
        sample={formData}
      />
    </section>
  );
};

export default SampleArea;
