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
  
  const [samples, setSamples] = useState([]);
  const [filteredSamples, setFilteredSamples] = useState(samples);

  const [selectedLogoUrl, setSelectedLogoUrl] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 50;
  const [totalPages, setTotalPages] = useState(0);
 
  const [searchField, setSearchField] = useState(null);
  const [searchValue, setSearchValue] = useState(null);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  const tableHeaders = [
    { label: "Patient Name", key: "PatientName" },
    { label: "Patient Location", key: "PatientLocation" },
    { label: "Age", key: "age" },
    { label: "Gender", key: "gender" },
    { label: "MR Number", key: "MRNumber" },
    { label: "Location", key: "locationids" },
    { label: "Analyte", key: "Analyte" },
    { label: "Test Result", key: "TestResult" },
    { label: "Volume", key: "volume" },
    { label: "Sample Type Matrix", key: "SampleTypeMatrix" },
    { label: "Price", key: "price" },
    { label: "Status", key: "status" },
    { label: "Sample Visibility", key: "sample_visibility" },
    { label: "Sample Mode", key: "samplemode" },
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


  // Fetch samples from the backend
  const fetchSamples = useCallback(async (page = 1, pageSize = 50, filters = {}) => {
    try {
      const { priceFilter, searchField, searchValue } = filters;
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/getsamplesPooled/${id}?page=${page}&pageSize=${pageSize}`;
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

      setSearchField(field);
      setSearchValue(value);
      fetchSamples(1, itemsPerPage, { searchField: field, searchValue: value });
    
  };

 
  if (id === null) {
    return <div>Loading...</div>;
  }

  return (
    <section className="profile__area pt-30 pb-120">
      <div className="container-fluid px-md-4">

        {/* Table */}
        <div className="table-responsive w-100">
          <table className="table table-bordered table-hover text-center align-middle w-auto border">
            <thead className="table-primary text-dark">
              <tr className="text-center">
               

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

              </tr>
            </thead>
            <tbody className="table-light">
              {currentData.length > 0 ? (
                currentData.map((sample) => (
                  <tr key={sample.id}>
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
     
    </section>
  );
};

export default BioBankSampleArea;
