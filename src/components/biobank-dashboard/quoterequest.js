import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDollarSign } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import ErrorMessage from "@components/error-message/error";
const QuoteRequestTable = () => {
  const [samples, setSamples] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showCartModal, setShowCartModal] = useState(false);
  const [priceInputs, setPriceInputs] = useState({});
  const [groupCurrency, setGroupCurrency] = useState("");
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [currencyError, setCurrencyError] = useState("");
  const [charges, setCharges] = useState({
    tax: { value: "", type: "amount" },
    platform: { value: "", type: "amount" },
    freight: { value: "", type: "amount" }
  });

  // Calculate subtotal (sum of all entered prices)
  // Safe subtotal calculation
  // Subtotal calculation
  const subtotal = Array.isArray(selectedQuote)
    ? selectedQuote.reduce((sum, sample) => {
      const price = parseFloat(priceInputs[sample.sample_id] || sample.price || 0);
      return sum + price;
    }, 0)
    : 0;

  // Helper function
  const calculateCharge = (charge, baseAmount) => {
    if (!charge?.value) return 0;
    return charge.type === "percent"
      ? (baseAmount * parseFloat(charge.value)) / 100
      : parseFloat(charge.value);
  };

  // Individual charges
  const taxAmount = calculateCharge(charges.tax, subtotal);
  const platformAmount = calculateCharge(charges.platform, subtotal);
  const freightAmount = calculateCharge(charges.freight, subtotal);

  // Final total
  const grandTotal = subtotal + taxAmount + platformAmount + freightAmount;


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
  const groupedByResearcherStatus = {};

  // Separate researcher requests into 2 types: priced and unpriced
  samples.forEach((sample) => {
    const researcher = sample.ResearcherName;
    const statusKey = sample.status === 'priced' ? 'priced' : 'pending';
    const key = `${researcher}_${statusKey}`;

    if (!groupedByResearcherStatus[key]) {
      groupedByResearcherStatus[key] = [];
    }

    groupedByResearcherStatus[key].push(sample);
  });



  // Submit price for one sample
  const submitSamplePrice = async (sampleId, currency, charges) => {
    const price = priceInputs[sampleId];
    if (!price || !currency) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/biobank/postprice`,
        {
          sampleId,
          price,
          SamplePriceCurrency: currency,
          charges: {
            tax: charges.tax,
            platform: charges.platform,
            freight: charges.freight,
          },
        }
      );
    } catch (error) {
      console.error(`Failed to update sample ${sampleId}`, error);
    }
  };

  // Submit all samples in selected quote
  const handleSubmitAll = async () => {
    if (!selectedQuote || selectedQuote.length === 0) return;

    // Validate currency selection
    if (!groupCurrency) {
      setCurrencyError("Please select a currency");
      return;
    }

    try {
      for (const sample of selectedQuote) {
        const sampleId = sample.sample_id;
        const price = priceInputs[sampleId];

        if (!price) continue;

        await submitSamplePrice(sampleId, groupCurrency, charges);
      }

      alert("All prices and charges updated successfully!");
      setShowCartModal(false);
      setSelectedQuote(null);
      setPriceInputs({});
      setGroupCurrency("");
      setCharges({   // clear charges
        tax: { value: "", type: "percent" },
        platform: { value: "", type: "percent" },
        freight: { value: "", type: "percent" },
      });
      setCurrencyError("");
    } catch (error) {
      console.error("Error submitting prices:", error);
      alert("Failed to update prices. Please try again.");
    }
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
          {Object.entries(groupedByResearcherStatus).map(([key, samples]) => {
            const {
              ResearcherName,
              OrganizationName,
              city_name,
              district_name,
              country_name,
            } = samples[0];

            const allPriced = samples.every((s) => s.status === "priced");

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
                        setIsReadOnly(true); // or false depending

                        setGroupCurrency(samples[0]?.SamplePriceCurrency || "");

                        // ✅ Pre-fill charges if available in API response
                        setCharges({
                          tax: {
                            value: samples[0]?.tax_percent || samples[0]?.tax_amount || "",
                            type: samples[0]?.tax_percent ? "percent" : (samples[0]?.tax_amount ? "amount" : "amount"),
                          },
                          platform: {
                            value: samples[0]?.platform_percent || samples[0]?.platform_amount || "",
                            type: samples[0]?.platform_percent ? "percent" : (samples[0]?.platform_amount ? "amount" : "amount"),
                          },
                          freight: {
                            value: samples[0]?.freight_percent || samples[0]?.freight_amount || "",
                            type: samples[0]?.freight_percent ? "percent" : (samples[0]?.freight_amount ? "amount" : "amount"),
                          }
                        });
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
            {currencyError && <ErrorMessage message={currencyError} />}

            <div className="d-flex justify-content-end align-items-center gap-2">
              <label className="mb-0 fs-5 fw-bold">Currency:</label>
              <span className="mb-0 fs-5 fw-bold">{groupCurrency || "Not Selected"}</span>
            </div>
            <table className="table table-bordered">
              {/* Items Header */}
              <thead className="table-light">
                <tr>
                  <th>Sample ID</th>
                  <th>Analyte</th>
                  <th>Quantity X Volume</th>
                  <th>Test Result</th>
                  <th className="text-end">Price</th>
                </tr>
              </thead>

              {/* Items */}
              <tbody>
                {selectedQuote.map((sample) => (
                  <tr key={sample.sample_id}>
                    <td>{sample.masterID}</td>
                    <td>{sample.analyte}</td>
                    <td>
                      {sample.quantity} X {sample.volume}
                      {sample.VolumeUnit}
                    </td>
                    <td>
                      {sample.TestResult} {sample.TestResultUnit}
                    </td>
                    <td className="text-end">
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
              <thead className="table-light">
                <tr>
                  <th colSpan="2"></th>
                  <th></th>
                  <th className="text-center">Subtotal</th>
                  <th className="text-end">{subtotal.toLocaleString()}</th>
                </tr>
              </thead>
              {/* Charges Section */}
              <thead className="table-light">
                <tr>
                  <th colSpan=""></th>
                  <th>Charges</th>
                  <th colSpan="3" className="text-center">Values</th>
                  
                </tr>
              </thead>
              <tbody>
                {/* Tax */}
                <tr>
                  <td></td>
                  <th>Tax</th>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter value"
                      value={charges.tax.value}
                      onChange={(e) =>
                        setCharges({
                          ...charges,
                          tax: { ...charges.tax, value: e.target.value }
                        })
                      }
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={charges.tax.type}
                      onChange={(e) =>
                        setCharges({
                          ...charges,
                          tax: { ...charges.tax, type: e.target.value }
                        })
                      }
                      disabled={isReadOnly}
                    >
                      <option value="percent">% of Quoted Price</option>
                      <option value="amount">Amount</option>
                    </select>
                  </td>
                  <td className="text-end">
                    {taxAmount.toLocaleString()}
                  </td>
                </tr>


                {/* Platform */}
                <tr>
                  <td></td>
                  <th>Platform Charges</th>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter value"
                      value={charges.platform.value}
                      onChange={(e) =>
                        setCharges({
                          ...charges,
                          platform: { ...charges.platform, value: e.target.value }
                        })
                      }
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={charges.platform.type}
                      onChange={(e) =>
                        setCharges({
                          ...charges,
                          platform: { ...charges.platform, type: e.target.value }
                        })
                      }
                      disabled={isReadOnly}
                    >
                      <option value="percent">% of Quoted Price</option>
                      <option value="amount">Amount</option>
                    </select>
                  </td>
                  <td className="text-end">
                    {platformAmount.toLocaleString()}
                  </td>
                </tr>


                {/* Freight */}
                <tr>
                  <td></td>
                  <th>Freight Charges</th>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter value"
                      value={charges.freight.value}
                      onChange={(e) =>
                        setCharges({
                          ...charges,
                          freight: { ...charges.freight, value: e.target.value }
                        })
                      }
                      readOnly={isReadOnly}
                    />
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={charges.freight.type}
                      onChange={(e) =>
                        setCharges({
                          ...charges,
                          freight: { ...charges.freight, type: e.target.value }
                        })
                      }
                      disabled={isReadOnly}
                    >
                      <option value="percent">% of Quoted Price</option>
                      <option value="amount">Amount</option>
                    </select>
                  </td>
                  <td className="text-end">{freightAmount.toLocaleString()}</td>
                </tr>



                {/* Total */}
                <tr className="table-light fw-bold">
                  <td colSpan="3"></td>
                  <td>Total</td>
                  <td className="text-end">{grandTotal.toLocaleString()}</td>
                </tr>

              </tbody>
            </table>

            {/* Global Currency Selector */}


            {/* Submit Button */}
            {!isReadOnly && (
              <div className="text-end">
                <button className="btn btn-success" onClick={handleSubmitAll}>
                  Submit
                </button>
              </div>
            )}
          </Modal.Body>
        </Modal>
      )
      }
    </div >
  );
};

export default QuoteRequestTable;
