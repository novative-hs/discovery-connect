import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Pagination from "@ui/Pagination"; // Your custom pagination component
import { Cart } from "@svg/index"; // Your cart icon svg
import { add_cart_product } from "src/redux/features/cartSlice";
import { notifySuccess } from "@utils/toast"; // Your toast notification utility
import Header from "@layout/header";
import DashboardHeader from "@layout/dashboardheader";
import axios from "axios";
import { useRouter } from "next/router";

const FilterProduct = () => {
    
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state) => state.cart?.cart_products || []);
const [userID, setUserID] = useState(null);
  const [products, setProduct] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(false);
const [activeTab, setActiveTab] = useState("Booksamples");

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [image_url,setImageURL]=useState();

  // For debounce timeout
  const filterTimeoutRef = useRef(null);

  const tableHeaders = [
    { label: "Sample Name", key: "diseasename" },
    { label: "Volume", key: "volume" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Test Result", key: "TestResult" },
    { label: "Test Result Unit", key: "TestResultUnit" },
  ];

  const fieldsToShowInOrder = [
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
    { label: "Date Of Collection", key: "DateOfSampling" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Diagnosis Test Parameter", key: "DiagnosisTestParameter" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
  ];

  useEffect(() => {
  const storedUserID = sessionStorage.getItem("userID");
  setUserID(storedUserID);
}, []);

 useEffect(() => {
    
  const item = sessionStorage.getItem("filterProduct");
  if (item) {
    const parsed = JSON.parse(item);
    const diseaseName = parsed?.diseasename;
    const image_url = parsed?.imageUrl;
    

    // Normalize image_url to imageUrl for your state usage
    const normalizedItem = {
      ...parsed,
      imageUrl: image_url || "",
    };

    setProduct([normalizedItem]);
    setFilteredSamples([normalizedItem]);

    if (diseaseName) {
      getSample(diseaseName);
      setImageURL(image_url);
    }
  }
}, []);


  const getSample = async (name) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getAllSampleinindex/${name}`
      );
      console.log(response.data)
      setFilteredSamples(response.data.data);
setProduct(response.data.data);

      setCurrentPage(0);
    } catch (error) {
      console.error("Error fetching samples:", error);
    } finally {
      setLoading(false);
    }
  };

  const validSamples = Array.isArray(filteredSamples) ? filteredSamples : [];
  const currentData = validSamples.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(validSamples.length / itemsPerPage));

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
    clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => {
      if (!value.trim()) {
        setFilteredSamples(products);
        setCurrentPage(0);
        return;
      }
      const filtered = products.filter((sample) =>
        sample[field]?.toString().toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSamples(filtered);
      setCurrentPage(0);
    }, 300);
  };

  const openModal = (sample) => {
    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSample(null);
  };

  const isInCart = (sampleId) => cartItems.some((item) => item.id === sampleId);

  const handleAddToCart = (sample) => {
  const productWithImage = {
    ...sample,
    imageUrl: image_url  // Adjust key here as needed
  };
  dispatch(add_cart_product(productWithImage));
};


  return (
    <>
      {/* Conditional header rendering */}
{userID ? <DashboardHeader setActiveTab={setActiveTab} activeTab={activeTab} />
 : <Header style_2={true} />}

      <section className="policy__area pb-40 overflow-hidden p-3">
        <div className="container">
          <h7 className="text-danger fw-bold mb-3">
            Click on Sample Name to get detail about sample.
          </h7>
          <div className="row justify-content-center">
            <div className="table-responsive w-100">
              {loading ? (
                <div className="text-center p-5">Loading samples...</div>
              ) : (
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
                              onChange={(e) =>
                                handleFilterChange(key, e.target.value)
                              }
                              style={{
                                minWidth: "130px",
                                maxWidth: "200px",
                                width: "100px",
                              }}
                            />
                            <span className="fw-bold mt-1 d-block text-nowrap align-items-center fs-6">
                              {label}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="p-2 text-center" style={{ minWidth: "30px" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((sample) => (
                        <tr key={sample.id}>
                          {tableHeaders.map(({ key }, idx) => {
                            let content;
                            if (key === "price") {
                              content = sample.price
                                ? `${sample.price} ${sample.SamplePriceCurrency || ""}`
                                : "----";
                            } else if (key === "diseasename") {
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
                                  onMouseOver={(e) =>
                                    (e.target.style.color = "#0a58ca")
                                  }
                                  onMouseOut={(e) => (e.target.style.color = "")}
                                >
                                  {sample.diseasename || "----"}
                                </span>
                              );
                            } else if (key === "volume") {
                              content = `${sample.volume || "----"} ${
                                sample.QuantityUnit || ""
                              }`;
                            } else {
                              content = sample[key] || "----";
                            }

                            return (
                              <td
                                key={idx}
                                className={
                                  key === "price"
                                    ? "text-end"
                                    : key === "diseasename"
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
                        <td colSpan={tableHeaders.length + 1} className="text-center">
                          No samples found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 0 && (
              <Pagination
                pageCount={totalPages}
                onPageChange={handlePageChange}
                forcePage={currentPage}
              />
            )}
          </div>
        </div>

        <Modal
          show={showModal}
          onHide={closeModal}
          size="lg"
          centered
          backdrop="static"
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Sample Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedSample && (
              <div className="row">
                <div className="col-md-4 border-end">
                  <h5 className="fw-semibold">Mandatory Fields</h5>
                  <ul className="list-unstyled">
                    <li>
                      <b>Disease Name:</b> {selectedSample.diseasename || "----"}
                    </li>
                    <li>
                      <b>Volume:</b> {selectedSample.volume || "----"}{" "}
                      {selectedSample.QuantityUnit || ""}
                    </li>
                    <li>
                      <b>Age:</b> {selectedSample.age || "----"}
                    </li>
                    <li>
                      <b>Gender:</b> {selectedSample.gender || "----"}
                    </li>
                    <li>
                      <b>Price:</b>{" "}
                      {selectedSample.price
                        ? `${selectedSample.price} ${selectedSample.SamplePriceCurrency || ""}`
                        : "----"}
                    </li>
                    <li>
                      <b>Status:</b> {selectedSample.status || "----"}
                    </li>
                    <li>
                      <b>Sample Visibility:</b>{" "}
                      {selectedSample.sample_visibility || "----"}
                    </li>
                  </ul>
                </div>
                <div className="col-md-8 ps-3">
                  <h5 className="fw-semibold">Optional Fields</h5>
                  <ul className="list-unstyled">
                    {fieldsToShowInOrder.map(({ label, key }) => {
                      const value = selectedSample[key];
                      if (!value) return null;
                      return (
                        <li key={key}>
                          <b>{label}:</b> {value}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </section>
    </>
  );
};

export default FilterProduct;
