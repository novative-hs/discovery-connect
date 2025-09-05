// SampleArea.jsx
import React, { useState, useCallback } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { notifyError, notifySuccess } from "@utils/toast";
import Pagination from "@ui/Pagination";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useQuery } from "@tanstack/react-query";

// Data fetcher
const fetchSamples = async ({ queryKey: [, id, page, pageSize, field, value] }) => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  const filter = field && value ? `&searchField=${field}&searchValue=${value}` : "";
  const isDocField = ["study_copy", "reporting_mechanism", "irb_file", "nbc_file"].includes(field);

  const ordersUrl = `${base}/api/committeesampleapproval/getOrderbyCommittee/${id}?page=${page}&pageSize=${pageSize}${isDocField ? "" : filter}`;
  const docsUrl = `${base}/api/committeesampleapproval/getAllDocuments/${id}?page=${page}&pageSize=${pageSize}${isDocField ? filter : ""}`;

  const [ordersRes, docsRes] = await Promise.all([axios.get(ordersUrl), axios.get(docsUrl)]);

  const orders = (ordersRes.data.results || []).filter((o) => (o.committee_status || "").toLowerCase() === "pending");
  const docs = docsRes.data.results || [];
  const docMap = docs.reduce((m, d) => (d.order_id ? ((m[d.order_id] = d), m) : m), {});
  const samples = orders.map((o) => ({ ...o, ...(docMap[o.order_id] || {}) }));
  return { samples, totalCount: orders.length };
};

const headers = [
  { label: "Analyte", key: "Analyte" },
  { label: "Quantity X Volume", key: "quantity" },
  { label: "Age", key: "age" },
  { label: "Gender", key: "gender" },
  { label: "Test Result & Unit", key: "TestResult" },
];
const docKeys = ["study_copy", "irb_file", "nbc_file"];

const SampleArea = () => {
  const id = sessionStorage.getItem("userID");
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [comment, setComment] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState("");
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchField, setSearchField] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [showGroupedModal, setShowGroupedModal] = useState(false);
  const [selectedResearcherSamples, setSelectedResearcherSamples] = useState(null);
  const [viewedDocuments, setViewedDocuments] = useState({ study_copy: false, irb_file: false, nbc_file: false });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["orders", id, currentPage, itemsPerPage, searchField, searchValue],
    queryFn: fetchSamples,
    keepPreviousData: true,
    staleTime: 60_000,
    enabled: !!id,
  });

  const samples = data?.samples || [];
  const totalPages = Math.ceil((data?.totalCount || 0) / itemsPerPage);
  const grouped = samples.reduce((acc, s) => ((acc[s.tracking_id || "Unknown"] ??= []).push(s), acc), {});

  const handleViewDocument = useCallback((buf, name) => {
    if (!buf) return alert("No document available.");
    const url = URL.createObjectURL(new Blob([new Uint8Array(buf.data)], { type: "application/pdf" }));
    window.open(url, "_blank");
    setViewedDocuments((v) => ({ ...v, [name]: true }));
  }, []);

  const allDocsViewed = () => {
    const first = selectedResearcherSamples?.[0];
    const reqOK = viewedDocuments.study_copy;
    const optOK = !first?.nbc_file || viewedDocuments.nbc_file;
    return reqOK && optOK;
  };

  const handleOpenModal = (type, group) => {
    if (!group?.length) return alert("Sample data missing.");
    if (!allDocsViewed()) return alert("Please view all required documents first.");
    setSelectedResearcherSamples(group);
    setActionType(type);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const text = comment.trim();
    if (!id || !selectedResearcherSamples?.length || !text) return alert("Please enter a comment.");
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeesampleapproval/bulk-committee-approval`, {
        committee_member_id: id,
        committee_status: actionType,
        comments: text,
        order_id: selectedResearcherSamples[0].order_id,
      });
      notifySuccess(`${actionType} successful for all samples.`);
      setShowModal(false);
      setShowGroupedModal(false);
      setComment("");
      refetch();
    } catch {
      notifyError("Bulk approval/refusal failed.");
    }
  };

  const renderLongText = (text) =>
    text?.length > 50 ? (
      <span
        className="text-primary"
        style={{ cursor: "pointer", textDecoration: "underline" }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComment(text);
          setShowCommentModal(true);
        }}
        title={text}
      >
        Click to View
      </span>
    ) : (
      <span title={text}>{text}</span>
    );

  const renderCell = (k, s) => {
    if (k === "Analyte") return <span style={{ textDecoration: "underline" }}>{s.Analyte || "N/A"}</span>;
    if (k === "quantity") return `${s.quantity || 0} × ${s.volume || 0}${s.VolumeUnit || ""}`;
    if (k === "TestResult") return s.TestResult || s.TestResultUnit ? `${s.TestResult ?? ""} ${s.TestResultUnit ?? ""}` : "----";
    if (k === "age") return s.age ? `${s.age} year` : "---";
    if (k === "reporting_mechanism" || k === "comments") return s[k] ? renderLongText(s[k]) : "----";
    if (k === "locationids") return <span title="Location ID's = Room Number, Freezer ID and Box ID">{s[k] || "----"}</span>;
    if (docKeys.includes(k)) return "----";
    return s[k] || "----";
  };

  const onScroll = (e) => {
    const el = e.target;
    const bottom = el.scrollHeight === el.scrollTop + el.clientHeight;
    if (bottom && currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  if (!id) return <div>Loading...</div>;
  if (isLoading) return <div>Fetching data...</div>;

  return (
    <div className="container py-3">
      <h4 className="text-center text-success">Review Pending</h4>

      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center align-middle">
          <thead className="table-primary text-dark">
            <tr>
              {["Order ID", "Order Date", "Researcher Name", "Organization Name", "Review Status"].map((label, i) => (
                <th key={i}>
                  <div className="d-flex flex-column align-items-center">
                    <input
                      type="text"
                      className="form-control form-control-sm text-center"
                      placeholder={`Search ${label}`}
                      onChange={(e) =>
                        (setSearchField(label.toLowerCase().replace(" ", "_")), setSearchValue(e.target.value), setCurrentPage(1))
                      }
                    />
                    <span className="fw-bold mt-1">{label}</span>
                  </div>
                </th>
              ))}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(grouped).map((group, idx) => (
              <tr key={idx}>
                <td>{group[0].tracking_id}</td>
                <td>{new Date(group[0].created_at).toLocaleDateString()}</td>
                <td>{group[0].researcher_name}</td>
                <td>{group[0].organization_name}</td>
                <td>{group[0].committee_status}</td>
                <td>
                  <button
                    className="btn btn-outline-info btn-sm"
                    onClick={() => {
                      setSelectedResearcherSamples(group);
                      setShowGroupedModal(true);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination handlePageClick={(e) => setCurrentPage(e.selected + 1)} pageCount={totalPages} focusPage={currentPage - 1} />

      {showGroupedModal && selectedResearcherSamples && (
        <Modal show={showGroupedModal} onHide={() => setShowGroupedModal(false)} size="xl" dialogClassName="custom-modal-width">
          <Modal.Header closeButton>
            <Modal.Title>Samples for {selectedResearcherSamples[0]?.researcher_name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="card mb-3" style={{ backgroundColor: "#f9f9f9", borderLeft: "4px solid #007bff" }}>
              <div className="card-body py-2 px-3 d-flex flex-wrap gap-4">
                <div>
                  <strong>Additional Mechanism:</strong>{" "}
                  <span className="text-muted">{selectedResearcherSamples[0]?.reporting_mechanism || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="mb-3 d-flex flex-wrap gap-2">
              {docKeys.map((k) => (
                <button key={k} className="btn btn-outline-primary btn-sm" onClick={() => handleViewDocument(selectedResearcherSamples[0][k], k)}>
                  Download {k.replace("_", " ").toUpperCase()} <FontAwesomeIcon icon={faDownload} size="sm" className="ms-1" />
                </button>
              ))}
            </div>

            {selectedResearcherSamples.some((s) => s.committee_status !== "Approved" && s.committee_status !== "Refused") && (
              <div className="mb-3 d-flex gap-2">
                <button className="btn btn-success btn-sm" onClick={() => handleOpenModal("Approved", selectedResearcherSamples)}>
                  <FontAwesomeIcon icon={faCheck} className="me-1" /> Approve
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleOpenModal("Refused", selectedResearcherSamples)}>
                  <FontAwesomeIcon icon={faTimes} className="me-1" /> Refuse
                </button>
              </div>
            )}

            <div onScroll={onScroll} className="table-responsive" style={{ minWidth: "100%", overflowX: "visible" }}>
              <table className="table table-bordered table-hover text-center align-middle">
                <thead className="table-primary text-dark">
                  <tr>{headers.map(({ label }, i) => <th key={i} className="px-2"><span className="fw-bold mt-1 d-block text-wrap fs-10">{label}</span></th>)}</tr>
                </thead>
                <tbody className="table-light">
                  {selectedResearcherSamples.length ? (
                    selectedResearcherSamples.map((s) => (
                      <tr key={s.cart_id}>
                        {headers.map(({ key }) => (
                          <td
                            key={key}
                            className="text-center"
                            style={{
                              maxWidth: 150,
                              wordWrap: "break-word",
                              cursor: key === "Analyte" ? "pointer" : "default",
                              color: key === "Analyte" ? "blue" : "inherit",
                              textDecoration: key === "Analyte" ? "underline" : "none",
                              whiteSpace: "normal",
                            }}
                            onClick={(e) => {
                              if (key === "Analyte") {
                                e.stopPropagation();
                                setSelectedSample(s);
                                setShowSampleModal(true);
                              }
                            }}
                          >
                            {renderCell(key, s)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="30" className="text-center">No samples available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Modal.Body>
        </Modal>
      )}

      <Modal show={showSampleModal && !!selectedSample} onHide={() => setShowSampleModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">{selectedSample?.Analyte}</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-5 text-start">
              <div className="mt-3 p-2 bg-light rounded">
                {selectedSample?.price != null && <p><strong>Price:</strong> {selectedSample.price} {selectedSample.SamplePriceCurrency}</p>}
                {selectedSample?.volume != null && <p><strong>Volume:</strong> {selectedSample.volume} {selectedSample.VolumeUnit}</p>}
                {selectedSample?.CountryofCollection && <p><strong>Country of Collection:</strong> {selectedSample.CountryofCollection}</p>}
              </div>
            </div>
            <div className="col-md-7">
              {(selectedSample?.age != null || selectedSample?.gender) && (
                <p>
                  {selectedSample?.age != null && (<><strong>Age:</strong> {selectedSample.age} years {selectedSample?.gender && "| "}</>)}
                  {selectedSample?.gender && <strong>Gender:</strong>} {selectedSample?.gender}
                </p>
              )}
              {selectedSample?.ethnicity && <p><strong>Ethnicity:</strong> {selectedSample.ethnicity}</p>}
              {selectedSample?.storagetemp && <p><strong>Storage Temperature:</strong> {selectedSample.storagetemp}</p>}
              {selectedSample?.SampleTypeMatrix && <p><strong>Sample Type:</strong> {selectedSample.SampleTypeMatrix}</p>}
              {(selectedSample?.TestResult || selectedSample?.TestResultUnit) && <p><strong>Test Result:</strong> {selectedSample.TestResult} {selectedSample.TestResultUnit}</p>}
              {selectedSample?.TestMethod && <p><strong>Test Method:</strong> {selectedSample.TestMethod}</p>}
              {selectedSample?.TestKitManufacturer && <p><strong>Test Kit Manufacturer:</strong> {selectedSample.TestKitManufacturer}</p>}
              {selectedSample?.ConcurrentMedicalConditions && <p><strong>Concurrent Medical Conditions:</strong> {selectedSample.ConcurrentMedicalConditions}</p>}
              {(selectedSample?.InfectiousDiseaseTesting || selectedSample?.InfectiousDiseaseResult) && (
                <p><strong>Infectious Disease Testing:</strong> {selectedSample.InfectiousDiseaseTesting} ({selectedSample.InfectiousDiseaseResult})</p>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>{actionType} Sample</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Enter your comments</Form.Label>
            <Form.Control as="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Enter comments here..." />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant={actionType === "Approved" ? "success" : "danger"} onClick={handleSubmit}>Send</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCommentModal} onHide={() => setShowCommentModal(false)}>
        <Modal.Header closeButton><Modal.Title className="h6">Comments</Modal.Title></Modal.Header>
        <Modal.Body className="overflow-auto" style={{ maxHeight: 600 }}>
          <p>{selectedComment}</p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SampleArea;
