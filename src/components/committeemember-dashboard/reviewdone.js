// Review Done (client-side filtering, concise)
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { notifyError } from "@utils/toast";
import Pagination from "@ui/Pagination";

const ITEMS_PER_PAGE = 10;
const COLS = [
  { label: "Order ID", key: "tracking_id" },
  { label: "Order Date", key: "created_at" },
  { label: "Researcher Name", key: "researcher_name" },
  { label: "Organization Name", key: "organization_name" },
  { label: "Review Status", key: "committee_status" },
];
const DOC_KEYS = [
  { key: "study_copy", label: "Study Copy" },
  { key: "irb_file", label: "IRB File" },
  { key: "nbc_file", label: "NBC File" },
];

const SampleArea = () => {
  const id = typeof window !== "undefined" ? sessionStorage.getItem("userID") : null;
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ tracking_id: "", created_at: "", researcher_name: "", organization_name: "", committee_status: "" });
  const [showGroupedModal, setShowGroupedModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL;
        const page = 1, pageSize = 500;
        const [oRes, dRes] = await Promise.all([
          axios.get(`${base}/api/committeesampleapproval/getOrderbyCommittee/${id}?page=${page}&pageSize=${pageSize}`),
          axios.get(`${base}/api/committeesampleapproval/getAllDocuments/${id}?page=${page}&pageSize=${pageSize}`),
        ]);
        const orders = (oRes.data?.results || []).filter((o) => o.committee_status !== "Pending");
        const docMap = (dRes.data?.results || []).reduce((m, d) => (d?.order_id ? ((m[d.order_id] = d), m) : m), {});
        const seen = new Set();
        const merged = orders.reduce((arr, o) => {
          const m = { ...o, ...(docMap[o.order_id] || {}) };
          const k = `${m.order_id}__${m.Analyte}`;
          if (!seen.has(k)) seen.add(k), arr.push(m);
          return arr;
        }, []);
        setRows(merged);
      } catch {
        notifyError("Failed to load data");
      }
    })();
  }, [id]);

  const filtered = useMemo(() => {
    const match = (v, q) => (!q ? true : String(v ?? "").toLowerCase().includes(q.toLowerCase()));
    return rows.filter((r) =>
      match(r.tracking_id, filters.tracking_id) &&
      match(r.created_at, filters.created_at) &&
      match(r.researcher_name, filters.researcher_name) &&
      match(r.organization_name, filters.organization_name) &&
      match(r.committee_status, filters.committee_status)
    );
  }, [rows, filters]);

  const grouped = useMemo(() => {
    const g = filtered.reduce((m, s) => ((m[s.tracking_id || "Unknown"] ??= []).push(s), m), {});
    return Object.entries(g).map(([tracking_id, group]) => {
      const h = group[0] || {};
      return { tracking_id, created_at: h.created_at, researcher_name: h.researcher_name, organization_name: h.organization_name, committee_status: h.committee_status, group };
    });
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(grouped.length / ITEMS_PER_PAGE));
  const paged = useMemo(() => grouped.slice((currentPage - 1) * ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE), [grouped, currentPage]);

  const handleViewDocument = (buf) => {
    if (!buf) return notifyError("No document available.");
    const url = URL.createObjectURL(new Blob([new Uint8Array(buf.data)], { type: "application/pdf" }));
    window.open(url, "_blank");
  };

  if (!id) return <div>Loading...</div>;

  return (
    <div className="container py-3">
      <h4 className="text-center text-success">Review Done</h4>

      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center align-middle">
          <thead className="table-primary text-dark">
            <tr>
              {COLS.map(({ label, key }) => (
                <th key={key} className="px-2">
                  <div className="d-flex flex-column align-items-center">
                    <input
                      type="text"
                      className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                      placeholder={`Search ${label}`}
                      onChange={(e) => {
                        setFilters((f) => ({ ...f, [key]: e.target.value }));
                        setCurrentPage(1);
                      }}
                      style={{ minWidth: 100 }}
                    />
                    <span className="fw-bold mt-1 d-block text-wrap fs-10">{label}</span>
                  </div>
                </th>
              ))}
              <th style={{ minWidth: 60 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paged.length ? (
              paged.map((g, i) => (
                <tr key={g.tracking_id ?? i}>
                  <td>{g.tracking_id}</td>
                  <td>{g.created_at ? new Date(g.created_at).toLocaleDateString() : "—"}</td>
                  <td>{g.researcher_name || "—"}</td>
                  <td>{g.organization_name || "—"}</td>
                  <td>{g.committee_status || "—"}</td>
                  <td>
                    <button className="btn btn-outline-info btn-sm" onClick={() => (setSelectedGroup(g), setShowGroupedModal(true))}>View Details</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center text-muted">No results</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination handlePageClick={(e) => setCurrentPage((e?.selected ?? 0) + 1)} pageCount={pageCount} focusPage={currentPage - 1} />

      <Modal show={showGroupedModal && !!selectedGroup} onHide={() => setShowGroupedModal(false)} size="xl" dialogClassName="custom-modal-width">
        <Modal.Header closeButton>
          <Modal.Title>Order {selectedGroup?.tracking_id} — {selectedGroup?.researcher_name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="card mb-3" style={{ backgroundColor: "#f9f9f9", borderLeft: "4px solid #007bff" }}>
            <div className="card-body py-2 px-3">
              <strong>Additional Mechanism: </strong>
              <span className="text-muted">{selectedGroup?.group?.[0]?.reporting_mechanism || "N/A"}</span>
            </div>
          </div>

          <div className="mb-3 d-flex flex-wrap gap-2">
            {DOC_KEYS.map((d) => (
              <button key={d.key} className="btn btn-outline-primary btn-sm" onClick={() => handleViewDocument(selectedGroup?.group?.[0]?.[d.key])}>
                Open {d.label}
              </button>
            ))}
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-primary text-dark">
                <tr>
                  <th>Analyte</th><th>Quantity × Volume</th><th>Age</th><th>Gender</th><th>Test Result & Unit</th>
                </tr>
              </thead>
              <tbody className="table-light">
                {selectedGroup?.group?.length ? (
                  selectedGroup.group.map((s) => (
                    <tr key={`${s.cart_id}_${s.id || s.Analyte}`}>
                      <td style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} onClick={() => (setSelectedSample(s), setShowSampleModal(true))}>{s.Analyte || "N/A"}</td>
                      <td>{`${s.quantity || 0} × ${s.volume || 0}${s.VolumeUnit || ""}`}</td>
                      <td>{s.age != null ? `${s.age} year` : "—"}</td>
                      <td>{s.gender || "—"}</td>
                      <td>{s.TestResult || s.TestResultUnit ? `${s.TestResult ?? ""} ${s.TestResultUnit ?? ""}` : "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center text-muted">No samples</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showSampleModal && !!selectedSample} onHide={() => setShowSampleModal(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">{selectedSample?.Analyte || "Sample Details"}</Modal.Title></Modal.Header>
        <Modal.Body>
          <p>
            {selectedSample?.price != null && <>Price: <strong>{selectedSample.price} {selectedSample.SamplePriceCurrency}</strong>. </>}
            {selectedSample?.volume != null && <>Volume: <strong>{selectedSample.volume}{selectedSample.VolumeUnit}</strong>. </>}
            {selectedSample?.CountryofCollection && <>Country of Collection: <strong>{selectedSample.CountryofCollection}</strong>. </>}
            {selectedSample?.age != null && <>Age: <strong>{selectedSample.age} years</strong>. </>}
            {selectedSample?.gender && <>Gender: <strong>{selectedSample.gender}</strong>. </>}
            {selectedSample?.ethnicity && <>Ethnicity: <strong>{selectedSample.ethnicity}</strong>. </>}
            {selectedSample?.storagetemp && <>Storage Temperature: <strong>{selectedSample.storagetemp}</strong>. </>}
            {selectedSample?.SampleTypeMatrix && <>Sample Type: <strong>{selectedSample.SampleTypeMatrix}</strong>. </>}
            {(selectedSample?.TestResult || selectedSample?.TestResultUnit) && <>Test Result: <strong>{selectedSample.TestResult ?? ""} {selectedSample.TestResultUnit ?? ""}</strong>. </>}
            {selectedSample?.TestMethod && <>Test Method: <strong>{selectedSample.TestMethod}</strong>. </>}
            {selectedSample?.TestKitManufacturer && <>Test Kit Manufacturer: <strong>{selectedSample.TestKitManufacturer}</strong>. </>}
            {selectedSample?.ConcurrentMedicalConditions && <>Concurrent Medical Conditions: <strong>{selectedSample.ConcurrentMedicalConditions}</strong>. </>}
            {(selectedSample?.InfectiousDiseaseTesting || selectedSample?.InfectiousDiseaseResult) && <>Infectious Disease Testing: <strong>{selectedSample.InfectiousDiseaseTesting} {selectedSample?.InfectiousDiseaseResult ? `(${selectedSample.InfectiousDiseaseResult})` : ""}</strong>. </>}
          </p>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SampleArea;