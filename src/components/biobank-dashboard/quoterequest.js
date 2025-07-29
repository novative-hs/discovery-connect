import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const QuoteRequestTable = () => {
  const [samples, setSamples] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [priceInputs, setPriceInputs] = useState({});
  const [groupCurrency, setGroupCurrency] = useState("");
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

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
        setSamples(response.data);
      } catch (error) {
        console.error("Error fetching quote requests:", error);
      }
    };

    fetchQuotes();
    const intervalId = setInterval(fetchQuotes, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Group samples by researcher
  const groupedByResearcher = samples.reduce((acc, sample) => {
    const key = `${sample.ResearcherName}-${sample.OrganizationName}-${sample.city_name}-${sample.district_name}-${sample.country_name}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(sample);
    return acc;
  }, {});

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
      <h3 className="mb-3">Quote Requests by Researcher</h3>
      <table className="table table-bordered table-hover">
        <thead className="table-dark text-white">
          <tr>
            <th>Researcher</th>
            <th>Organization</th>
            <th>City</th>
            <th>District</th>
            <th>Country</th>
            <th>Quote Request</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByResearcher).map(([key, samples]) => {
            const { ResearcherName, OrganizationName, city_name, district_name, country_name } = samples[0];
            const allPriced = samples.every(sample => sample.status === "priced");

            return (
              <tr key={key}>
                <td>{ResearcherName}</td>
                <td>{OrganizationName}</td>
                <td>{city_name}</td>
                <td>{district_name}</td>
                <td>{country_name}</td>
                <td>
                  {allPriced ? (
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setSelectedQuote(samples);
                        setShowCartModal(true);
                        setIsReadOnly(true);
                        setGroupCurrency(samples[0]?.SamplePriceCurrency || "");
                      }}
                    >
                      View Details
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        setSelectedQuote(samples);
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

      {/* Modal */}
      {showCartModal && selectedQuote && (
        <Modal show={showCartModal} onHide={() => setShowCartModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              {isReadOnly ? "Sample Details" : "Sample Pricing"} - {selectedQuote[0].ResearcherName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Sample ID</th>
                  <th>Analyte</th>
                  <th>Quantity</th>
                  <th>Test Result</th>
                  <th>Price</th>
                  <th>Currency</th>
                </tr>
              </thead>
              <tbody>
                {selectedQuote.map((sample) => (
                  <tr key={sample.sample_id}>
                    <td>{sample.masterID}</td>
                    <td>{sample.analyte}</td>
                    <td>{sample.quantity}</td>
                    <td>
                      {sample.TestResult} {sample.TestResultUnit}
                    </td>
                    <td>
                      {isReadOnly ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={sample.price || ""}
                          readOnly
                        />
                      ) : (
                        <input
                          type="number"
                          className="form-control form-control-sm"
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
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={isReadOnly ? sample.SamplePriceCurrency || groupCurrency : groupCurrency}
                        readOnly
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Global Currency Selector */}
            {!isReadOnly && (
              <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <label className="mb-0 fw-bold">Currency:</label>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "160px" }}
                  value={groupCurrency}
                  onChange={(e) => setGroupCurrency(e.target.value)}
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

            {/* Submit Button */}
            {!isReadOnly && (
              <div className="text-end">
                <button className="btn btn-success" onClick={handleSubmitAll}>
                  Submit All
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
