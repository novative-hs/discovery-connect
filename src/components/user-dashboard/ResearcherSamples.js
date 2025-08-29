import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";
import { useRouter } from "next/router";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
const SampleArea = () => {
  const router = useRouter();
  const id = sessionStorage.getItem("userID");
  const tableHeaders = [

    { label: "Order ID", key: "tracking_id" },
    { label: "Order Date", key: "created_at" },
    { label: "Total Payment", key: "price" },
    { label: "Bank Name", key: "name" },
    { label: "Payment Type", key: "payment_method" },
    { label: "Payment Status", key: "payment_status" },
    { label: "Total Items", key: "total" },
    { label: "Order status", key: "order_status" }
  ];

  const fieldsToShowInOrder = [
    // { label: "Price", key: "price" },
    // { label: "Quantity", key: "orderquantity" },
    // { label: "Total Payment", key: "totalpayment" },

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
    { label: "Date Of Sampling", key: "DateOfSampling" },
    { label: "Concurrent Medical Conditions", key: "ConcurrentMedicalConditions" },
    { label: "Concurrent Medications", key: "ConcurrentMedications" },
    { label: "Test Method", key: "TestMethod" },
    { label: "Test Kit Manufacturer", key: "TestKitManufacturer" },
    { label: "Test System", key: "TestSystem" },
    { label: "Test System Manufacturer", key: "TestSystemManufacturer" },
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [loading, setLoading] = useState(false);
  const [samples, setSamples] = useState([]); // State to hold fetched samples
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]); // group by tracking ID
  const [totalOrderPayment, setTotalOrderPayment] = useState(0);

  const fetchSamples = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/getResearcherSamples/${id}`
      );

      if (response.data.error) {
        setError(response.data.error);
        setSamples([]);
        setOrders([]);
        setTotalOrderPayment(0);
      } else {
        const grouped = groupSamplesByOrder(response.data);
        setSamples(response.data);
        setOrders(grouped);

        // ✅ Correct: Sum total payments from all individual samples
        const total = response.data.reduce((sum, sample) => {
          const payment = parseFloat(sample.totalpayment);
          return sum + (payment || 0);
        }, 0);
        setTotalOrderPayment(total);
      }
    } catch (error) {
      setError("An error occurred while fetching the samples.");
      setTotalOrderPayment(0);
    } finally {
      setLoading(false);
    }
  }, [id]);



  const groupSamplesByOrder = (samples) => {
    const grouped = {};
    samples.forEach((sample) => {
      const key = sample.tracking_id;
      if (!grouped[key]) {
        grouped[key] = {
          tracking_id: key,
          created_at: sample.created_at,
          order_status: sample.order_status,
          payment_type: sample.payment_method,
          payment_status: sample.payment_status,
          BankName: sample.BankName,
          samples: [],
          totalpayment: 0,
        };
      }
      grouped[key].samples.push(sample);

      const price = parseFloat(sample.totalpayment);
      if (!isNaN(price)) {
        grouped[key].totalpayment += price;
      }
    });

    // ✅ Sort by created_at ASC (oldest order first)
    return Object.values(grouped).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };



  // Fetch samples from backend when component loads
  useEffect(() => {
    if (id !== null) {
      fetchSamples();
      const intervalId = setInterval(fetchSamples, 30000);
      return () => clearInterval(intervalId);
    }
  }, [id, fetchSamples]);


  useEffect(() => {
    const pages = Math.max(1, Math.ceil(orders.length / itemsPerPage));
    setTotalPages(pages);
    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [samples, currentPage]);
  const currentData = samples.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
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
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    }
  };
  const openModal = (sample) => {

    setSelectedSample(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSample(null);
    setShowModal(false);
  };
  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <h7 className="text-danger fw-bold mb-3">Click on Analyte to get detail about sample.</h7>
        <div className="row justify-content-center">
          <div className="table-responsive w-100">
            <table className="table table-bordered table-hover text-center align-middle w-auto border">

              <thead className="table-primary text-dark">
                <tr>
                  {tableHeaders.map(({ label, key }, index) => {
                    // Check if it's the "Price" column and merge it with "Sample Price Currency"
                    if (key === "price") {
                      return (
                        <th key={index} className="px-4 text-center">
                          <div className="d-flex flex-column align-items-center">
                            <input
                              type="text"
                              className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                              placeholder="Price (Currency)"
                              onChange={(e) =>
                                handleFilterChange("price", e.target.value)
                              }
                              style={{ minWidth: "110px" }}
                            />
                            <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-10">
                              Price (Currency)
                            </span>
                          </div>
                        </th>
                      );
                    }

                    // Render other columns normally
                    return (
                      <th key={index} className="col-md-1 px-2">

                        <div className="d-flex flex-column align-items-center">
                          <input
                            type="text"
                            className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                            placeholder={`Search ${label}`}
                            onChange={(e) => handleFilterChange(key, e.target.value)}
                            style={{ minWidth: "100px", maxWidth: "120px", width: "100px" }}
                          />
                          <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-6">
                            {label}
                          </span>

                        </div>
                      </th>
                    );
                  })}
                  <th className="p-2 text-center" style={{ minWidth: "50px" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.tracking_id}</td>
                      <td>{new Date(order.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit'
                      }).replace(/ /g, '-')}</td>

                      <td className="text-end">
                        {{
                          PKR: "Rs",
                          USD: "$",
                          INR: "₹",
                        }[order.samples[0].SamplePriceCurrency] || order.samples.SamplePriceCurrency} {order.totalpayment.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </td>
                      <td>{order.BankName || "---"}</td>
                      <td>{order.payment_type || "----"}</td>
                      <td>{order.payment_status}</td>
                      <td>{order.samples.length}</td>
                      <td>{order.samples[0].order_status}</td>
                      <td>
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => openModal(order)}
                        >
                          View Order Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">No orders found</td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
          {totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage}
            />
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={closeModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-danger">
            Order Detail - {selectedSample?.tracking_id}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }}>
          {selectedSample?.samples?.length > 0 ? (
            <table className="table table-bordered text-center align-middle">
              <thead className="table-secondary">
                <tr>
                  <th>Analyte</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Volume</th>
                  <th>Test Result</th>
                  <th>Price</th>
                  <th>Quantity</th>

                </tr>
              </thead>
              <tbody>
                {selectedSample.samples.map((s, i) => (
                  <tr key={i}>
                    <td>{s.Analyte || "----"}</td>
                    <td>{s.age ? `${s.age} years` : "----"}</td>
                    <td>{s.gender || "----"}</td>
                    <td>{s.volume ? `${s.volume} ${s.VolumeUnit || ""}` : "----"}</td>
                    <td>{s.TestResult ? `${s.TestResult} ${s.TestResultUnit || ""}` : "----"}</td>
                    <td className="text-end">{s.SamplePriceCurrency}{s.price.toLocaleString()}</td>
                    <td>{s.quantity || "----"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No samples available for this order.</p>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-end">
          <Button
            variant="primary"
            onClick={() => {
              // Store all order details in localStorage
              localStorage.setItem("tracking_id", selectedSample.tracking_id);
              localStorage.setItem("created_at", selectedSample.created_at);
              localStorage.setItem("order_status", selectedSample.samples[0]?.order_status || "Placed");
              localStorage.setItem("technical_admin_status", selectedSample.samples[0]?.technical_admin_status || "Pending");
              localStorage.setItem("committee_status", selectedSample.samples[0]?.committee_status || "Pending");

              router.push("/order-confirmation");
            }}
          >
            Track Order
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for sample details */}
      {/* <Modal show={showModal}
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
      </Modal> */}
    </section>
  );
};

export default SampleArea;
