// Corrected and optimized React component
import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Pagination from "@ui/Pagination";
import { Cart } from "@svg/index";
import { add_cart_product } from "src/redux/features/cartSlice";
import { notifyError } from "@utils/toast";
import axios from "axios";
import { useRouter } from "next/router";

const FilterProductArea = ({ selectedProduct, selectedFilters = {} }) => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart?.cart_products || []);

  const [userID, setUserID] = useState(null);
  const [products, setProduct] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({});
  const filterTimeoutRef = useRef(null);
  const [image_url, setImageURL] = useState();
  const [selectedAnalyte, setSelectedAnalyte] = useState(null);
  const tableHeaders = [
    { label: "Analyte", key: "Analyte" },
    { label: "Qty × Volume", key: "volume" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "Test Result", key: "TestResult" },
    { label: "Price", key: "price" },
  ];

  const fieldsToShowInOrder = [
    { label: "Container Type", key: "ContainerType" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
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
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
  ];

  useEffect(() => {
    setUserID(sessionStorage.getItem("userID"));
  }, []);



  useEffect(() => {
    if (selectedProduct?.Analyte) {
      setImageURL(selectedProduct.imageUrl);
      setSelectedAnalyte(selectedProduct.Analyte);
      setCurrentPage(1);
    }
  }, [selectedProduct]);


  useEffect(() => {
    if (selectedAnalyte !== null) {
      getSample(selectedAnalyte, currentPage, itemsPerPage);
    }
  }, [selectedAnalyte, currentPage]);

  const getSample = async (name, page = 1, pageSize = 10, additionalFilters = {}) => {
    setLoading(true);
    console.log("🚀 additionalFilters", additionalFilters);

    try {
      const encodedName = encodeURIComponent(name);
      let queryParams = [`page=${page}`, `limit=${pageSize}`];

      const allFilters = { ...selectedFilters, ...additionalFilters };

      if (allFilters.gender) {
        queryParams.push(`gender=${allFilters.gender}`);
        console.log("✅ Gender Filter:", allFilters.gender);
      }

      if (allFilters.TestResult) { queryParams.push(`TestResult=${allFilters.TestResult}`) }

      if (allFilters.sampleType) queryParams.push(`SampleTypeMatrix=${allFilters.sampleType}`);
      if (allFilters.smokingStatus) queryParams.push(`SmokingStatus=${allFilters.smokingStatus}`);

      if (allFilters.age) {
        // Case 1: Age is a string with range, e.g., "20-30"
        if (typeof allFilters.age === "string" && allFilters.age.includes("-")) {
          const [min, max] = allFilters.age.split("-").map(Number);
          if (!isNaN(min)) queryParams.push(`ageMin=${min}`);
          if (!isNaN(max)) queryParams.push(`ageMax=${max}`);
        }
        // Case 2: Age is an object with min/max values, e.g., {min: 20, max: 30}
        else if (typeof allFilters.age === "object" && allFilters.age !== null) {
          if (allFilters.age.min !== undefined) queryParams.push(`ageMin=${allFilters.age.min}`);
          if (allFilters.age.max !== undefined) queryParams.push(`ageMax=${allFilters.age.max}`);
        }
        // ✅ Case 3: Age is a single exact number, e.g., "20" or 20
        else if (!isNaN(allFilters.age)) {
          queryParams.push(`age=${allFilters.age}`);
        }
      }


      if (allFilters.searchQuery) queryParams.push(`analytes=${encodeURIComponent(allFilters.searchQuery)}`);
      if (allFilters.sampleNames?.length > 0) {
        queryParams.push(`analytes=${encodeURIComponent(allFilters.sampleNames.join(','))}`);
      }

      const query = queryParams.join("&");
      console.log("🌐 Final Query URL:", query);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getAllSampleinindex/${encodedName}?${query}`
      );

      const sampleData = response.data.data;
      const totalCount = response.data.total;
      const totalPages = Math.ceil(totalCount / pageSize);

      setFilteredSamples(sampleData);
      setProduct(sampleData);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
    } catch (error) {
      console.error("❌ Error fetching samples:", error);
    } finally {
      setLoading(false);
    }
  };





  const handlePageChange = (event) => {
    const selectedPage = event.selected + 1; // Because react-paginate is 0-indexed
    setCurrentPage(selectedPage); // Correct ✅
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev, [field]: value };

      clearTimeout(filterTimeoutRef.current);
      filterTimeoutRef.current = setTimeout(() => {
        const refinedFilters = { ...updatedFilters };

        // Clean up empty strings
        Object.keys(refinedFilters).forEach((key) => {
          if (refinedFilters[key] === "") {
            delete refinedFilters[key];
          }
        });

        getSample(selectedAnalyte, 1, itemsPerPage, refinedFilters);
      }, 300);

      return updatedFilters;
    });
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

  const handleAddToCart = async (sample) => {
    dispatch(
      add_cart_product({
        id: sample.id,
        masterid: sample.masterID,
        age: sample.age || "",
        gender: sample.gender || "",
        Analyte: sample.Analyte,
        Volume: sample.volume,
        SamplePriceCurrency: sample.SamplePriceCurrency || "",
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
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/${sample.id}/reserve/1`
      );
      if (response.data.error) notifyError(response.data.error);
    } catch (error) {
      notifyError("Error reserving sample");
    }
  };

  return (
    <section className="policy__area pb-4 overflow-hidden p-3">
      <div className="container">
        <p className="text-danger fw-bold mt-3 mb-3">Click on Analyte to get detail about sample.</p>
        <div className="table-responsive w-100">
          {loading ? (
            <div className="text-center p-5">Loading samples...</div>
          ) : (
            <table className="table table-bordered table-hover table-sm text-center align-middle">
              <thead className="table-primary text-dark">
                <tr>
                  {tableHeaders.map(({ label, key }, index) => (
                    <th key={index}>
                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control form-control-sm text-center shadow-none"
                          placeholder={`Search ${label}`}
                          value={filters[key] || ""} // ✅ controlled input
                          onChange={(e) => handleFilterChange(key, e.target.value)}
                        />

                        <span className="fw-bold mt-1 fs-6">{label}</span>
                      </div>
                    </th>
                  ))}
                  <th>Action</th>
                </tr>

              </thead>
              <tbody>
                {filteredSamples.length ? (
                  filteredSamples.map((sample) => (
                    <tr key={sample.id}>
                      {tableHeaders.map(({ key }, idx) => {
                        let content;
                        switch (key) {
                          case "price":
                            if (sample.reserved) {
                              content = "----"; // or you can use "----" or empty string
                            } else {
                              content = sample.price
                                ? `${Number(sample.price).toLocaleString("en-PK", {
                                  minimumFractionDigits: 2,
                                })} ${sample.SamplePriceCurrency || ""}`
                                : "Request the Quote";
                            }
                            break;

                          case "Analyte":
                            content = (
                              <span
                                className="text-primary fw-semibold text-decoration-underline"
                                role="button"
                                onClick={() => openModal(sample)}
                              >
                                {sample.Analyte || "----"}
                              </span>
                            );
                            break;
                          case "volume":
                            content = sample.quantity && sample.volume
                              ? `${sample.quantity} x ${sample.volume}${sample.VolumeUnit || ""}`
                              : "----";
                            break;
                          case "age":
                            content = sample.age ? `${sample.age} years` : "----";
                            break;
                          case "TestResult": {
                            const rawResult = sample.TestResult;
                            const unit = sample.TestResultUnit;

                            if (rawResult === null || rawResult === undefined || rawResult === "") {
                              content = "----";
                            } else if (!isNaN(Number(rawResult))) {
                              // It's numeric
                              const parsed = parseFloat(rawResult);

                              // Format: remove trailing .0 if present, otherwise show decimal
                              const formattedResult =
                                parsed % 1 === 0 ? parsed.toFixed(0) : parsed.toString();

                              // Only add unit if it's not a number
                              if (unit && isNaN(Number(unit))) {
                                content = `${formattedResult} ${unit}`;
                              } else {
                                content = formattedResult;
                              }
                            } else {
                              // It's a non-numeric string like "Positive" or "Negative"
                              content = rawResult;
                            }

                            break;
                          }



                          default:
                            content = sample[key] || "----";
                        }

                        return <td key={idx}>{content}</td>;
                      })}
                      <td>
                        {isInCart(sample.id) ? (
                          <button className="btn btn-secondary btn-sm" disabled>Added</button>
                        ) : sample.reserved ? (
                          <button className="btn btn-warning btn-sm" disabled>Reserved</button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(sample)}>
                            <Cart className="fs-7 text-white" />
                          </button>
                        )}
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={tableHeaders.length + 1}>No samples found.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {totalPages >= 0 && (
          <Pagination
            handlePageClick={handlePageChange}
            pageCount={totalPages}
            focusPage={currentPage - 1} // If using react-paginate, which is 0-based
          />
        )}
      </div>
      <Modal show={showModal} onHide={closeModal} size="lg" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">Sample Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light rounded overflow-auto" style={{ maxHeight: "500px" }}>
          {selectedSample ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ key, label }) => {
                  const value = selectedSample[key];
                  if (!value) return null;
                  return (
                    <div className="col-md-6" key={key}>
                      <div className="p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                        <span className="text-muted small fw-bold mb-1">{label}</span>
                        <span className="fs-6 text-dark">{value.toString()}</span>
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
      </Modal>
    </section>
  );
};

export default FilterProductArea;
