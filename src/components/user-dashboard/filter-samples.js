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

const FilterProductArea = ({ selectedProduct, closeModals }) => {


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
  const [image_url, setImageURL] = useState();

  // For debounce timeout
  const filterTimeoutRef = useRef(null);

  const tableHeaders = [
    { label: "Analyte", key: "Analyte" },
    { label: "Volume", key: "volume" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Quantity", key: "quantity" },
    { label: "Test Result", key: "TestResult" },
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Price", key: "price" },
  ];

  const fieldsToShowInOrder = [
    { label: "Ethnicity", key: "ethnicity" },
    { label: "Sample Condition", key: "samplecondition" },
    { label: "Storage Temperature", key: "storagetemp" },
    { label: "Country of Collection", key: "CountryOfCollection" },
    { label: "Smoking Status", key: "SmokingStatus" },
    { label: "Alcohol Or Drug Abuse", key: "AlcoholOrDrugAbuse" },
    { label: "Infectious Disease Testing", key: "InfectiousDiseaseTesting" },
    { label: "Infectious Disease Result", key: "InfectiousDiseaseResult" },
    { label: "Freeze Thaw Cycles", key: "FreezeThawCycles" },
    { label: "Date Of Collection", key: "DateOfSampling" },
    {
      label: "Concurrent Medical Conditions",
      key: "ConcurrentMedicalConditions",
    },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
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
  if (selectedProduct) {
    const Analyte = selectedProduct.Analyte;
    const image_url = selectedProduct.imageUrl;

    setProduct([selectedProduct]);
    setFilteredSamples([selectedProduct]);

    if (Analyte) {
      getSample(Analyte);
      setImageURL(image_url);
    }
  }
}, [selectedProduct]);


  const getSample = async (name) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getAllSampleinindex/${name}`
      );

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

      const search = value.toLowerCase();

      const filtered = products.filter((sample) => {
        // Custom logic for composite fields
        if (field === "volume") {
          const volumeWithUnit = `${sample.volume || ""} ${
            sample.VolumeUnit || ""
          }`.toLowerCase();
          return volumeWithUnit.includes(search);
        }

        // Default single field logic
        return sample[field]?.toString().toLowerCase().includes(search);
      });

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

  const defaultAge = sample.age || "";
  const defaultGender = sample.gender || "";

  dispatch(
    add_cart_product({
      id: sample.id,
      masterid:sample.masterID,
      age: defaultAge,
      gender: defaultGender,
      Analyte: sample.Analyte,
      Volume: sample.volume,
      ContainerType: sample.ContainerType,
      SampleTypeMatrix: sample.SampleTypeMatrix,
      VolumeUnit: sample.VolumeUnit,
      TestResult: sample.TestResult,
      TestResultUnit: sample.TestResultUnit,
      quantity: sample.quantity ?? 1,
      price: sample.price,
      imageUrl: sample.image_url || "",
    })
  );

  // closeModals();
};



  return (
    <>
      <section className="policy__area pb-40 overflow-hidden p-3">
        <div className="container">
          <p className="text-danger fw-bold mt-3 mb-3">
            Click on Analyte to get detail about sample.
          </p>

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
                      <th
                        className="p-2 text-center"
                        style={{ minWidth: "30px" }}
                      >
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
    : "Request the Quote";
}
else if (key === "Analyte") {
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
                                  onMouseOut={(e) =>
                                    (e.target.style.color = "")
                                  }
                                >
                                  {sample.Analyte || "----"}
                                </span>
                              );
                            } else if (key === "volume") {
                              content = `${sample.volume || "----"} ${
                                sample.VolumeUnit || ""
                              }`;
                            } else if (key === "age") {
                              content = `${
                                sample.age ? sample.age + " years" : "----"
                              }`;
                            } else if (key === "TestResult") {
                              content = `${sample.TestResult || "----"} ${
                                sample.TestResultUnit || ""
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
                                    : key === "Analyte"
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
                                <button
                                  className="btn btn-secondary btn-sm"
                                  disabled
                                >
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
                          No samples found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {totalPages > 0 && (
              <>
                <Pagination
                  pageCount={totalPages}
                  onPageChange={handlePageChange}
                  forcePage={currentPage}
                />
                {/* <div className="text-center mt-4">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                      router.push({
                        pathname: "/dashboardheader",
                        query: { tab: "Booksamples" },
                      })
                    }
                  >
                    ← Back to Samples
                  </button>
                </div> */}
              </>
            )}
          </div>
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
                    if (value === undefined || value === null || value === "")
                      return null;

                    return (
                      <div className="col-md-6" key={key}>
                        <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                          <span className="text-muted small fw-bold mb-1">
                            {label}
                          </span>
                          <span className="fs-6 text-dark">
                            {value.toString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted p-3">
                No details to show
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0"></Modal.Footer>
        </Modal>
      </section>
    </>
  );
};

export default FilterProductArea;
