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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/order/getOrderByResearcher/${id}`
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
      }
    } catch (error) {
      setError("An error occurred while fetching the samples.");
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
          totalpayment: sample.totalpayment,
          subtotal: sample.subtotal,
          tax_value: sample.tax_value,
          tax_type: sample.tax_type,
          platform_value: sample.platform_value,
          platform_type: sample.platform_type,
          freight_value: sample.freight_value,
          freight_type: sample.freight_type,

        };
      }
      grouped[key].samples.push(sample);


    });

    // ✅ Sort by created_at ASC (oldest order first)
    return Object.values(grouped).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };


  const formatCharge = (label, subtotal, type, value) => {
    if (!type || value == null) return `${label}: Not Applied`;

    let total;
    let display;

    if (type === "amount") {
      total = subtotal + value;
      display = `${label} (${value}) = ${total}`;
    } else if (type === "percent") {
      total = subtotal + (subtotal * value / 100);
      display = `${label} (${value}%) = ${total}`;
    } else {
      display = `${label}: Unknown Type`;
    }

    return display;
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
            <table className="table table-bordered table-hover table-sm text-center align-middle">
              <thead className="table-primary text-dark">
                <tr>
                  {tableHeaders.map(({ label, key }, index) => (
                    <th key={index} className="px-3 py-2" style={{ minWidth: "120px" }}>
                      <div className="d-flex flex-column">
                        <input
                          type="text"
                          className="form-control form-control-sm mb-1 text-center shadow-none"
                          placeholder={`Search ${label}`}
                          onChange={(e) => handleFilterChange(key, e.target.value)}
                        />
                        <span className="fw-semibold small">{label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => (
                    <tr key={index}>
                      <td>{order.tracking_id}</td>
                      <td>
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        }).replace(/ /g, "-")}
                      </td>
                      <td className="text-end">
                        {{
                          PKR: "Rs",
                          USD: "$",
                          INR: "₹",
                        }[order.samples[0].SamplePriceCurrency] || order.samples.SamplePriceCurrency}{" "}
                        {Number(order.totalpayment).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}

                      </td>

                      <td>{order.BankName || "---"}</td>
                      <td>{order.payment_type || "----"}</td>
                      <td>
                        <span
                          className={`badge px-3 py-2 ${order.payment_status === "Paid"
                            ? "bg-success"
                            : "bg-warning text-dark"
                            }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>
                      <td>{order.samples.length}</td>
                      <td>
                        <span
                          className={`badge px-3 py-2 ${order.samples[0].order_status === "Pending"
                            ? "bg-warning text-dark"
                            : order.samples[0].order_status === "Rejected"
                              ? "bg-danger"
                              : "bg-success"
                            }`}
                        >
                          {order.samples[0].order_status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal(order)}
                        >
                          View Order
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center">
                      No orders found
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
                  <th>Quantity</th>
                  <th>Price ({selectedSample.samples[0].SamplePriceCurrency})</th>

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
                    <td>{s.quantity || "----"}</td>
                    <td className="text-end">{s.price ? s.price.toLocaleString() : "----"}</td>

                  </tr>
                ))}
              </tbody>
              <thead>
                <tr>
                  <th colSpan="5"></th>
                  <th>Subtotal</th>
                  <td className="text-end">
                   {Number(selectedSample.samples[0].subtotal).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </td>

                </tr>
                <tr>
                  <th colSpan="5"></th>
                  <th>
                    Tax (
                    {Number(selectedSample.samples[0].tax_value).toString().replace(/\.00$/, "")}
                    {selectedSample.samples[0].tax_type === "percent" ? "%" : ""}
                    )
                  </th>

                  <td className="text-end">
                    {selectedSample.samples[0].tax_type === "percent"
                      ? (selectedSample.samples[0].subtotal *
                        selectedSample.samples[0].tax_value) /
                      100
                      : Number(selectedSample.samples[0].tax_value).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </td>
                </tr>

                <tr>
                  <th colSpan="5"></th>
                  <th>
                    Platform Charges (
                    {Number(selectedSample.samples[0].platform_value).toString().replace(/\.00$/, "")}
                    {selectedSample.samples[0].platform_type === "percent" ? "%" : ""}
                    )
                  </th>
                  <td className="text-end">
                    {selectedSample.samples[0].platform_type === "percent"
                      ? (selectedSample.samples[0].subtotal *
                        selectedSample.samples[0].platform_value) /
                      100
                      : Number(selectedSample.samples[0].platform_value).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </td>
                </tr>
                <tr>
                  <th colSpan="5"></th>
                  <th>
                    Freight Charges (
                    {Number(selectedSample.samples[0].freight_value).toString().replace(/\.00$/, "")}
                    {selectedSample.samples[0].freight_type === "percent" ? "%" : ""}
                    )
                  </th>
                  <td className="text-end">
                    {selectedSample.samples[0].freight_type === "percent"
                      ? (selectedSample.samples[0].subtotal *
                        selectedSample.samples[0].freight_value) /
                      100
                      : Number(selectedSample.samples[0].freight_value).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </td>
                </tr>
                <tr>
                  <th colSpan="5"></th>
                  <th>Total ({selectedSample.samples[0].SamplePriceCurrency})</th>
                  <td className="text-end">
                     {Number(selectedSample.samples[0].totalpayment).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                  </td>
                </tr>
              </thead>
            </table>
          ) : (
            <p>No samples available for this order.</p>
          )}
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-end">
          <Button
            variant="primary"
            onClick={() =>
              router.push({
                pathname: "/order-confirmation",
                query: {
                  id: selectedSample.tracking_id,
                  created_at: selectedSample.created_at,
                  orderStatus: selectedSample.samples[0]?.order_status || "Placed",
                  technical_admin_status: selectedSample.samples[0]?.technical_admin_status,
                  committee_status: selectedSample.samples[0]?.committee_status,
                },
              })
            }
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
