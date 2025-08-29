// SampleArea (clean + fast, client-side filtering)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { notifyError } from "@utils/toast";
import Pagination from "@ui/Pagination";

const ITEMS_PER_PAGE = 10;

const SampleArea = () => {
  const id = typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;

  const [orders, setOrders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // client-side filters (table headers)
  const [filters, setFilters] = useState({
    tracking_id: "",
    created_at: "",
    researcher_name: "",
    organization_name: "",
    committee_status: "",
  });

  // modal state
  const [showGroupedModal, setShowGroupedModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // sample detail modal (paragraph view)
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  // ---------- Fetch + Merge ----------
  const fetchAll = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setErr("");

    try {
      // Paginated endpoints kept; we fetch more pages as user navigates UI pagination.
      // For client-side filter, we can fetch first N pages or just current page; here we fetch page 1 of both
      // and rely on API's count if available. To stay close to your original, we'll fetch page 1 large enough.
      const page = 1;
      const pageSize = 500; // grab a big chunk to enable client-side filtering; tweak as needed

      const orderUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyCommittee/${id}?page=${page}&pageSize=${pageSize}`;
      const docUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getAllDocuments/${id}?page=${page}&pageSize=${pageSize}`;

      const [orderRes, docRes] = await Promise.all([axios.get(orderUrl), axios.get(docUrl)]);

      // Filter out Pending like your original
      const ordersRaw = (orderRes.data?.results || []).filter(o => o.committee_status !== "Pending");
      const docsRaw = (docRes.data?.results || []);

      setOrders(ordersRaw);
      setDocuments(docsRaw);
    } catch (e) {
      console.error(e);
      setErr("Failed to load data");
      notifyError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // map documents by cart_id
  const docMap = useMemo(() => {
    const m = new Map();
    documents.forEach(d => {
      if (d?.cart_id) m.set(d.cart_id, d);
    });
    return m;
  }, [documents]);

  // merge orders with docs & ensure unique analyte per cart_id (like your original)
  const merged = useMemo(() => {
    const list = orders.map(o => ({ ...o, ...(docMap.get(o.cart_id) || {}) }));
    // unique by cart_id + Analyte
    const seen = new Set();
    return list.filter(item => {
      const key = `${item.cart_id}__${item.Analyte}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [orders, docMap]);

  // client-side filter
  const filtered = useMemo(() => {
    const f = merged.filter(row => {
      const matches = (field, val) => {
        if (!val) return true;
        const raw = (row[field] ?? "").toString().toLowerCase();
        return raw.includes(val.toLowerCase());
      };
      return (
        matches("tracking_id", filters.tracking_id) &&
        matches("created_at", filters.created_at) &&
        matches("researcher_name", filters.researcher_name) &&
        matches("organization_name", filters.organization_name) &&
        matches("committee_status", filters.committee_status)
      );
    });
    return f;
  }, [merged, filters]);

  // group by tracking_id
  const grouped = useMemo(() => {
    const g = new Map();
    filtered.forEach(s => {
      const key = s.tracking_id || "Unknown";
      if (!g.has(key)) g.set(key, []);
      g.get(key).push(s);
    });
    // flatten to an array of group summaries for render
    return Array.from(g.entries()).map(([tracking_id, group]) => {
      const head = group[0] || {};
      return {
        tracking_id,
        created_at: head.created_at,
        researcher_name: head.researcher_name,
        organization_name: head.organization_name,
        committee_status: head.committee_status,
        group,
      };
    });
  }, [filtered]);

  // pagination (client-side)
  const pageCount = Math.max(1, Math.ceil(grouped.length / ITEMS_PER_PAGE));
  const pagedGroups = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return grouped.slice(start, start + ITEMS_PER_PAGE);
  }, [grouped, currentPage]);

  const onHeaderFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageChange = (e) => {
    const next = (e?.selected ?? 0) + 1;
    setCurrentPage(next);
  };

  const openGroupModal = (g) => {
    setSelectedGroup(g);
    setShowGroupedModal(true);
  };

  const openSampleModal = (sample) => {
    setSelectedSample(sample);
    setShowSampleModal(true);
  };

  const handleViewDocument = (fileBuffer) => {
    if (!fileBuffer) {
      notifyError("No document available.");
      return;
    }
    const blob = new Blob([new Uint8Array(fileBuffer.data)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  if (!id) return <div>Loading...</div>;

  return (
    <div className="container py-3">
      <h4 className="text-center text-success">Review Pending List</h4>

      {/* Table */}
      <div className="table-responsive" style={{ overflowX: "auto" }}>
        <table className="table table-bordered table-hover text-center align-middle">
          <thead className="table-primary text-dark">
            <tr>
              {[
                { label: "Order ID", key: "tracking_id" },
                { label: "Order Date", key: "created_at" },
                { label: "Researcher Name", key: "researcher_name" },
                { label: "Organization Name", key: "organization_name" },
                { label: "Review Status", key: "committee_status" },
              ].map(({ label, key }) => (
                <th key={key} className="px-2">
                  <div className="d-flex flex-column align-items-center">
                    <input
                      type="text"
                      className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                      placeholder={`Search ${label}`}
                      onChange={(e) => onHeaderFilter(key, e.target.value)}
                      style={{ minWidth: 100 }}
                    />
                    <span className="fw-bold mt-1 d-block text-wrap fs-10">{label}</span>
                  </div>
                </th>
              ))}
              <th className="p-2 text-center" style={{ minWidth: 60 }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {pagedGroups.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-muted">
                  No results
                </td>
              </tr>
            ) : (
              pagedGroups.map((g, i) => (
                <tr key={g.tracking_id ?? i}>
                  <td>{g.tracking_id}</td>
                  <td>
                    {g.created_at
                      ? new Date(g.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      }).replace(/ /g, "-")
                      : "----"}
                  </td>
                  <td>{g.researcher_name || "----"}</td>
                  <td>{g.organization_name || "----"}</td>
                  <td>{g.committee_status || "----"}</td>
                  <td>
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={() => openGroupModal(g)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        handlePageClick={handlePageChange}
        pageCount={pageCount}
        focusPage={currentPage - 1}
      />

      {showGroupedModal && selectedGroup && (
        <Modal
          show={showGroupedModal}
          onHide={() => setShowGroupedModal(false)}
          size="xl"
          dialogClassName="custom-modal-width"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Order {selectedGroup.tracking_id} — {selectedGroup.researcher_name}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* Additional Mechanism (one per order) */}
            <div className="card mb-3" style={{ backgroundColor: "#f9f9f9", borderLeft: "4px solid #007bff" }}>
              <div className="card-body py-2 px-3">
                <strong>Additional Mechanism: </strong>
                <span className="text-muted">
                  {selectedGroup.group?.[0]?.reporting_mechanism || "N/A"}
                </span>
              </div>
            </div>

            {/* Documents (open in new tab) */}
            <div className="mb-3 d-flex flex-wrap gap-2">
              {[
                { key: "study_copy", label: "Study Copy" },
                { key: "irb_file", label: "IRB File" },
                { key: "nbc_file", label: "NBC File" },
              ].map(doc => (
                <button
                  key={doc.key}
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => handleViewDocument(selectedGroup.group?.[0]?.[doc.key])}
                >
                  Open {doc.label}
                </button>
              ))}
            </div>

            {/* Samples table */}
            <div className="table-responsive" style={{ minWidth: "100%", overflowX: "visible" }}>
              <table className="table table-bordered table-hover text-center align-middle">
                <thead className="table-primary text-dark">
                  <tr>
                    <th>Analyte</th>
                    <th>Quantity × Volume</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Test Result & Unit</th>
                  </tr>
                </thead>
                <tbody className="table-light">
                  {selectedGroup.group?.map((s) => (
                    <tr key={`${s.cart_id}_${s.id || s.Analyte}`}>
                      <td
                        style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                        onClick={() => openSampleModal(s)}
                        title="Click to view details"
                      >
                        {s.Analyte || "N/A"}
                      </td>
                      <td>{`${s.quantity || 0} × ${s.volume || 0}${s.VolumeUnit || ""}`}</td>
                      <td>{s.age != null ? `${s.age} year` : "—"}</td>
                      <td>{s.gender || "—"}</td>
                      <td>
                        {(s.TestResult || s.TestResultUnit) ? `${s.TestResult ?? ""} ${s.TestResultUnit ?? ""}` : "—"}
                      </td>
                    </tr>
                  ))}
                  {(!selectedGroup.group || selectedGroup.group.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">No samples</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* Sample Detail (Paragraph) Modal */}
      {showSampleModal && selectedSample && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{
              backdropFilter: "blur(5px)",
              backgroundColor: "rgba(0,0,0,0.5)",
              position: "fixed",
              inset: 0,
              zIndex: 1040,
            }}
          />
          <div
            className="modal show d-block"
            role="dialog"
            style={{
              zIndex: 1060,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              width: "90vw",
              maxWidth: 700,
              maxHeight: "80vh",
              overflow: "auto",
            }}
          >
            <div className="modal-header d-flex justify-content-between align-items-center" style={{ backgroundColor: "#cfe2ff", color: "#000" }}>
              <h5 className="fw-bold m-0">{selectedSample.Analyte || "Sample Details"}</h5>
              <button
                type="button"
                className="close"
                onClick={() => setShowSampleModal(false)}
                style={{ fontSize: "1.5rem", border: "none", background: "none", cursor: "pointer" }}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="modal-body">
              {/* Paragraph style details */}
              <p>
                {selectedSample.price != null && (
                  <>Price: <strong>{selectedSample.price} {selectedSample.SamplePriceCurrency}</strong>. </>
                )}
                {selectedSample.volume != null && (
                  <>Volume: <strong>{selectedSample.volume}{selectedSample.VolumeUnit}</strong>. </>
                )}
                {selectedSample.CountryofCollection && (
                  <>Country of Collection: <strong>{selectedSample.CountryofCollection}</strong>. </>
                )}
                {selectedSample.age != null && (
                  <>Age: <strong>{selectedSample.age} years</strong>. </>
                )}
                {selectedSample.gender && (
                  <>Gender: <strong>{selectedSample.gender}</strong>. </>
                )}
                {selectedSample.ethnicity && (
                  <>Ethnicity: <strong>{selectedSample.ethnicity}</strong>. </>
                )}
                {selectedSample.storagetemp && (
                  <>Storage Temperature: <strong>{selectedSample.storagetemp}</strong>. </>
                )}
                {selectedSample.SampleTypeMatrix && (
                  <>Sample Type: <strong>{selectedSample.SampleTypeMatrix}</strong>. </>
                )}
                {(selectedSample.TestResult || selectedSample.TestResultUnit) && (
                  <>Test Result: <strong>{selectedSample.TestResult ?? ""} {selectedSample.TestResultUnit ?? ""}</strong>. </>
                )}
                {selectedSample.TestMethod && (
                  <>Test Method: <strong>{selectedSample.TestMethod}</strong>. </>
                )}
                {selectedSample.TestKitManufacturer && (
                  <>Test Kit Manufacturer: <strong>{selectedSample.TestKitManufacturer}</strong>. </>
                )}
                {selectedSample.ConcurrentMedicalConditions && (
                  <>Concurrent Medical Conditions: <strong>{selectedSample.ConcurrentMedicalConditions}</strong>. </>
                )}
                {(selectedSample.InfectiousDiseaseTesting || selectedSample.InfectiousDiseaseResult) && (
                  <>Infectious Disease Testing: <strong>{selectedSample.InfectiousDiseaseTesting} {selectedSample.InfectiousDiseaseResult ? `(${selectedSample.InfectiousDiseaseResult})` : ""}</strong>. </>
                )}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SampleArea;