import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Pagination from "@ui/Pagination";

const QuoteRequestTable = () => {
  const [currencyError, setCurrencyError] = useState("");
  const [samples, setSamples] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [priceInputs, setPriceInputs] = useState({});
  const [groupCurrency, setGroupCurrency] = useState("");
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Filter and pagination states
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'priced', 'pending'
  const [currentPage, setCurrentPage] = useState(0); // ReactPaginate uses zero-based index
  const [itemsPerPage] = useState(10);

  // Fetch currency options
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/samplefields/samplepricecurrency`
        );
        if (!response.ok) throw new Error("Failed to fetch currency options");
        const data = await response.json();
        setCurrencyOptions(data);
      } catch (error) {
        console.error("Error fetching currencies:", error);
      }
    };
    fetchCurrencies();
  }, []);

  // Fetch samples initially and every 5 seconds
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/getPriceCount`
        );
        // Add a unique request_id to each sample if not present
        const dataWithRequestId = response.data.map((sample, index) => ({
          ...sample,
          request_id: sample.request_id || `req_${Date.now()}_${index}` // Unique request ID
        }));
        setSamples(dataWithRequestId);
      } catch (error) {
        console.error("Error fetching quote requests:", error);
      }
    };

    fetchQuotes();
    const intervalId = setInterval(fetchQuotes, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Group samples by unique request (each request is completely separate)
  const requests = samples.reduce((acc, sample) => {
    const existingRequest = acc.find(r => r.request_id === sample.request_id);
    if (existingRequest) {
      existingRequest.samples.push(sample);
    } else {
      acc.push({
        request_id: sample.request_id,
        ResearcherName: sample.ResearcherName,
        OrganizationName: sample.OrganizationName,
        city_name: sample.city_name,
        district_name: sample.district_name,
        country_name: sample.country_name,
        samples: [sample],
        status: sample.status
      });
    }
    return acc;
  }, []);

  // Filter requests by status
  const filteredRequests = requests.filter(request => {
    const allPriced = request.samples.every(s => s.status === "priced");
    if (statusFilter === "all") return true;
    if (statusFilter === "priced") return allPriced;
    if (statusFilter === "pending") return !allPriced;
    return true;
  });

  // Pagination logic
  const pageCount = Math.ceil(filteredRequests.length / itemsPerPage);
  const offset = currentPage * itemsPerPage;
  const currentRequests = filteredRequests.slice(offset, offset + itemsPerPage);

  // Handle page click for ReactPaginate
  const handlePageClick = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  // Submit price for one sample
  const submitSamplePrice = async (sampleId, currency) => {
    const price = priceInputs[sampleId];
    if (!price || !currency) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/postprice/${sampleId}`,
        {
          sampleId,
          price,
          SamplePriceCurrency: currency,
        }
      );
    } catch (error) {
      console.error(`Failed to update sample ${sampleId}`, error);
    }
  };

  // Submit all samples in selected quote
  const handleSubmitAll = async () => {
    if (!selectedQuote || selectedQuote.length === 0 || !groupCurrency) return;
    if (!groupCurrency) {
      setCurrencyError("Please select a currency");
      return;
    }
    for (const sample of selectedQuote) {
      const sampleId = sample.sample_id;
      await submitSamplePrice(sampleId, groupCurrency);
    }

    alert("All prices updated successfully!");
    setShowCartModal(false);
    setSelectedQuote(null);
    setPriceInputs({});
    setGroupCurrency("");
  };

  return (
    <div className="container-fluid">
      <h3 className="mb-3">Quote Requests</h3>

      {/* Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-3">
          <label htmlFor="statusFilter" className="form-label">Filter by Status:</label>
          <select
            id="statusFilter"
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0); // Reset to first page when filter changes
            }}
          >
            <option value="all">All Requests</option>
            <option value="priced">Priced</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-dark text-white">
          <tr>
            <th>Researcher</th>
            <th>Organization</th>
            <th>City</th>
            <th>District</th>
            <th>Country</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {currentRequests.map((request) => {
            const allPriced = request.samples.every(s => s.status === "priced");

            return (
              <tr key={request.request_id}>
                <td>{request.ResearcherName}</td>
                <td>{request.OrganizationName}</td>
                <td>{request.city_name}</td>
                <td>{request.district_name}</td>
                <td>{request.country_name}</td>
                <td>{allPriced ? "Priced" : "Pending"}</td>
                <td>
                  {allPriced ? (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setSelectedQuote(request.samples);
                        setShowCartModal(true);
                        setIsReadOnly(true);
                        setGroupCurrency(request.samples[0]?.SamplePriceCurrency || "");
                      }}
                    >
                      View Details
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedQuote(request.samples);
                        setShowCartModal(true);
                        setIsReadOnly(false);
                        setGroupCurrency("");
                      }}
                    >
                      <FontAwesomeIcon icon={faDollarSign} className="me-1" />
                      Add Price
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Records count */}
      <div className="text-muted mt-2">
        Showing {offset + 1} to {Math.min(offset + itemsPerPage, filteredRequests.length)} of {filteredRequests.length} records
      </div>

      {/* Custom Pagination */}
      <Pagination
        handlePageClick={handlePageClick}
        pageCount={pageCount}
        focusPage={currentPage}
      />

      {/* Modal */}
      {showCartModal && selectedQuote && (
        <Modal show={showCartModal} onHide={() => setShowCartModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {isReadOnly ? "Sample Details" : "Sample Pricing"} - {selectedQuote[0].ResearcherName}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {!isReadOnly && (
              <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <label className="mb-0 fw-bold">Currency:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "160px" }}
                  value={groupCurrency}
                  onChange={(e) => {
                    setGroupCurrency(e.target.value)
                    setCurrencyError("")
                  }}
                >
                  <option value="">Select</option>
                  {currencyOptions.map((currency, index) => (
                    <option key={index} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {currencyError && (
              <div className="invalid-feedback d-block" style={{ fontSize: "0.9rem", marginLeft: "600px" }}>
                {currencyError}
              </div>
            )}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong>Request ID:</strong> {selectedQuote[0].request_id}
              </div>
              <div>
                <strong>Currency:</strong> {groupCurrency || "Not Selected"}
              </div>
            </div>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>Analyte</th>
                  <th>Quantity X Volume</th>
                  <th>Test Result</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedQuote.map((sample) => (
                  <tr key={sample.sample_id}>
                    <td>{sample.masterID}</td>
                    <td>{sample.analyte}</td>
                    <td>{sample.quantity} X {sample.volume}{sample.VolumeUnit}</td>
                    <td>
                      {sample.TestResult} {sample.TestResultUnit}
                    </td>
                    <td>
                      {isReadOnly ? (
                        <input
                          type="text"
                          className="form-control form-control-sm text-end"
                          value={
                            sample.price
                              ? Number(sample.price).toLocaleString()
                              : ""
                          }
                          readOnly
                        />
                      ) : (
                        <input
                          type="number"
                          className="form-control form-control-sm text-end"
                          value={priceInputs[sample.sample_id] || ""}
                          onChange={(e) =>
                            setPriceInputs({
                              ...priceInputs,
                              [sample.sample_id]: e.target.value,
                            })
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isReadOnly && (
              <div className="text-end">
                <button className="btn btn-success" onClick={handleSubmitAll}>
                  Submit
                </button>
              </div>
            )}
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default QuoteRequestTable;