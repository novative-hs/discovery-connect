import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { notifyError, notifySuccess } from "@utils/toast";
import Pagination from "@ui/Pagination";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDownload,
    faCheck,
    faTimes,
    faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

const SampleArea1 = () => {
    const id = sessionStorage.getItem("userID");
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState("");
    const [comment, setComment] = useState("");
    const [selectedComment, setSelectedComment] = useState("");
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [samples, setSamples] = useState([]);
    const [showSampleModal, setSampleShowModal] = useState(false);
    const [selectedSample, setSelectedSample] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [searchField, setSearchField] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [showGroupedModal, setShowGroupedModal] = useState(false);
    const [selectedResearcherSamples, setSelectedResearcherSamples] = useState(null);
    const [comments, setComments] = useState({});
    const [viewedDocuments, setViewedDocuments] = useState({
        study_copy: false,
        irb_file: false,
        nbc_file: false,
    });
    const [filteredSamplename, setFilteredSamplename] = useState([]);
    const [filters, setFilters] = useState({
        tracking_id: "",
        researcher_name: "",
        organization_name: "",
        order_status: "",
        created_at: "",
    });
    const tableHeaders = [
        { label: "Order ID", key: "tracking_id" },
        { label: "Order Date", key: "created_at" },
        { label: "Researcher Name", key: "researcher_name" },
        { label: "Organization Name", key: "organization_name" },
        { label: "Review Status", key: "committee_status" },
    ];
    const SampleHeader = [
        { label: "Analyte", key: "Analyte" },
        { label: "Quantity X Volume", key: "quantity" },
        { label: "Age", key: "age" },
        { label: "Gender", key: "gender" },
        { label: "Test Result & Unit", key: "TestResult" },
    ];

    const fetchSamples = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
        try {
            const { searchField, searchValue } = filters;
            const docFields = ["study_copy", "reporting_mechanism", "irb_file", "nbc_file"];
            const filterForDoc = docFields.includes(searchField);

            let orderUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getOrderbyCommittee/${id}?page=${page}&pageSize=${pageSize}`;
            let docUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/cart/getAllDocuments/${id}?page=${page}&pageSize=${pageSize}`;

            if (searchField && searchValue) {
                const filter = `&searchField=${searchField}&searchValue=${searchValue}`;
                if (filterForDoc) {
                    docUrl += filter;
                } else {
                    orderUrl += filter;
                }
            }

            const [orderRes, docRes] = await Promise.all([
                axios.get(orderUrl),
                axios.get(docUrl),
            ]);
            const orders = (orderRes.data.results || []).filter(order =>
                order.committee_status !== "Pending" // Filter for Pending status
            );

            const totalCount = orders.length; // Adjusted count
            const documents = docRes.data.results || [];

            const docMap = {};
            documents.forEach((doc) => {
                if (doc.cart_id) {
                    docMap[doc.cart_id] = doc;
                }
            });

            const merged = orders.map((order) => ({
                ...order,
                ...(docMap[order.cart_id] || {}),
            }));

            setSamples(merged);
            setFilteredSamplename(merged);
            setTotalPages(Math.ceil(totalCount / pageSize));
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchSamples(currentPage, itemsPerPage, { searchField, searchValue });
        }
    }, [id, currentPage, itemsPerPage, searchField, searchValue, fetchSamples]);

    const groupedByResearcher = samples.reduce((acc, sample) => {
        const key = sample.tracking_id || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(sample);
        return acc;
    }, {});

    const handlePageChange = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };


    const handleFilterChange = (field, value) => {
        setSearchField(field);
        setSearchValue(value);
        setCurrentPage(1); // Optionally reset to page 1 when filtering
    };

    // HANDLER TO OPEN DOCUMENT AND TRACK VIEWED STATUS GLOBALLY
    const handleViewDocument = (fileBuffer, fileName, sampleId) => {
        if (!fileBuffer) {
            alert("No document available.");
            return;
        }

        const blob = new Blob([new Uint8Array(fileBuffer.data)], {
            type: "application/pdf",
        });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");

        // ✅ Mark globally viewed
        setViewedDocuments((prev) => ({
            ...prev,
            [fileName]: true,
        }));
    };

    // ✅ GLOBAL CHECK FOR DOCUMENTS VIEWED (not per sample)
    const allDocumentsViewed = () => {
        const requiredDocs = ["study_copy", "irb_file"];
        const optionalDoc = "nbc_file";

        const hasViewedRequired = requiredDocs.every((doc) => viewedDocuments[doc]);
        const hasViewedOptional =
            !selectedResearcherSamples[0][optionalDoc] || viewedDocuments[optionalDoc];

        return hasViewedRequired && hasViewedOptional;
    };

    const handleScroll = (e) => {
        const isVerticalScroll = e.target.scrollHeight !== e.target.clientHeight;

        if (isVerticalScroll) {
            const bottom =
                e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;

            if (bottom && currentPage < totalPages) {
                setCurrentPage((prevPage) => prevPage + 1); // Trigger fetch for next page
                fetchSamples(currentPage + 1); // Fetch more data if bottom is reached
            }
        }
    };

    if (!id) return <div>Loading...</div>;
    return (
        <div className="container py-3">
            <h4 className="text-center text-success">Review Pending</h4>
            <div
                onScroll={handleScroll}
                className="table-responsive"
                style={{ overflowX: "auto" }}
            >
                <table className="table table-bordered table-hover text-center align-middle">
                    <thead className="table-primary text-dark">
                        <tr>
                            {tableHeaders.map(({ label, key }, index) => (
                                <th key={index} className="px-2">
                                    <div className="d-flex flex-column align-items-center">
                                        <input
                                            type="text"
                                            className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                                            placeholder={`Search ${label}`}
                                            onChange={(e) =>
                                                handleFilterChange(key, e.target.value)
                                            }
                                            style={{ minWidth: "100px" }} // Adjusted minWidth
                                        />
                                        <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-10">
                                            {label}
                                        </span>
                                    </div>
                                </th>
                            ))}
                            <th className="p-2 text-center" style={{ minWidth: "50px" }}>
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedByResearcher).map(([researcher, group], idx) => (
                            <tr key={idx}>
                                <td>{group[0].tracking_id}</td>
                                <td>{new Date(group[0].created_at).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: '2-digit'
                                }).replace(/ /g, '-')}
                                </td>
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

            <Pagination
                handlePageClick={handlePageChange}
                pageCount={totalPages}
                focusPage={currentPage - 1}
            />

            {showGroupedModal && selectedResearcherSamples && (
                <Modal
                    show={showGroupedModal}
                    onHide={() => setShowGroupedModal(false)}
                    size="xl"
                    dialogClassName="custom-modal-width"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>
                            Samples for {selectedResearcherSamples[0]?.researcher_name}
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <div
                            className="card mb-3"
                            style={{ backgroundColor: "#f9f9f9", borderLeft: "4px solid #007bff" }}
                        >
                            <div className="card-body py-2 px-3 d-flex flex-wrap gap-4">
                                <div>
                                    <strong>Additional Mechanism:</strong>{" "}
                                    <span className="text-muted">
                                        {selectedResearcherSamples[0]?.reporting_mechanism || "N/A"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Documents Buttons - shown once */}
                        <div className="mb-3 d-flex flex-wrap gap-2">
                            {["study_copy", "irb_file", "nbc_file"].map((docKey) => (
                                <button
                                    key={docKey}
                                    className="btn btn-outline-primary btn-sm"
                                    onClick={() =>
                                        handleViewDocument(
                                            selectedResearcherSamples[0][docKey],
                                            docKey,
                                            selectedResearcherSamples[0].cart_id
                                        )
                                    }
                                >
                                    Download {docKey.replace("_", " ").toUpperCase()}
                                    <FontAwesomeIcon icon={faDownload} size="sm" className="ms-1" />
                                </button>
                            ))}
                        </div>



                        {/* Sample Table */}
                        <div
                            onScroll={handleScroll}
                            className="table-responsive"
                            style={{ minWidth: "100%", overflowX: "visible" }}
                        >
                            <table className="table table-bordered table-hover text-center align-middle">
                                <thead className="table-primary text-dark">
                                    <tr>
                                        {SampleHeader?.map(({ label, key }, index) => (
                                            <th key={index} className="px-2">
                                                <span className="fw-bold mt-1 d-block text-wrap fs-10">
                                                    {label}
                                                </span>
                                            </th>
                                        ))}
                                    </tr>

                                </thead>

                                <tbody className="table-light">
                                    {selectedResearcherSamples.length > 0 ? (
                                        selectedResearcherSamples.map((sample) => (
                                            <tr key={sample.id}>
                                                {SampleHeader.map(({ key }, index) => (
                                                    <td
                                                        key={index}
                                                        className="text-center"
                                                        style={{
                                                            maxWidth: "150px",
                                                            wordWrap: "break-word",
                                                            cursor: key === "Analyte" ? "pointer" : "default",
                                                            color: key === "Analyte" ? "blue" : "inherit",
                                                            textDecoration: key === "Analyte" ? "underline" : "none",
                                                            whiteSpace: "normal",
                                                        }}
                                                        onClick={(e) => {
                                                            if (key === "Analyte") {
                                                                e.stopPropagation();
                                                                setSelectedSample(sample);
                                                                setSampleShowModal(true);
                                                            }
                                                        }}
                                                    >
                                                        {key === "Analyte" ? (
                                                            <>
                                                                <span style={{ textDecoration: "underline" }}>{sample.Analyte || "N/A"}</span>

                                                            </>
                                                        ) : ["study_copy", "irb_file", "nbc_file"].includes(key) ? (
                                                            "----"
                                                        ) : key === "reporting_mechanism" && sample[key] ? (
                                                            sample[key].length > 50 ? (
                                                                <span
                                                                    className="text-primary"
                                                                    style={{ cursor: "pointer", textDecoration: "underline" }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedComment(sample[key]);
                                                                        setShowCommentModal(true);
                                                                    }}
                                                                    title={sample[key]}
                                                                >
                                                                    Click to View
                                                                </span>
                                                            ) : (
                                                                <span title={sample[key]}>{sample[key]}</span>
                                                            )
                                                        ) : key === "comments" && sample[key] ? (
                                                            sample[key].length > 50 ? (
                                                                <span
                                                                    className="text-primary"
                                                                    style={{ cursor: "pointer", textDecoration: "underline" }}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedComment(sample[key]);
                                                                        setShowCommentModal(true);
                                                                    }}
                                                                    title={sample[key]}
                                                                >
                                                                    Click to View
                                                                </span>
                                                            ) : (
                                                                <span title={sample[key]}>{sample[key]}</span>
                                                            )
                                                        ) : key === "quantity" ? (
                                                            `${sample.quantity || 0} × ${sample.volume || 0}${sample.VolumeUnit || ''}`
                                                        )
                                                            : key === "TestResult" ? (
                                                                (sample.TestResult || sample.TestResultUnit) ? (
                                                                    <span>{`${sample.TestResult ?? ''} ${sample.TestResultUnit ?? ''}`}</span>
                                                                ) : null
                                                            )
                                                                : key === "age" ? (
                                                                    <td>
                                                                        {sample.age ? `${sample.age} year` : "---"}
                                                                    </td>


                                                                )
                                                                    : key === "locationids" ? (
                                                                        <span
                                                                            style={{ cursor: "pointer" }}
                                                                            title="Location ID's = Room Number, Freezer ID and Box ID"
                                                                        >
                                                                            {sample[key] || "----"}
                                                                        </span>
                                                                    ) : (
                                                                        sample[key] || "----"
                                                                    )}

                                                    </td>
                                                ))}

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="30" className="text-center">
                                                No samples available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Modal.Body>
                </Modal>
            )}
            {showSampleModal && selectedSample && (
                <>
                    {/* Backdrop */}
                    <div
                        className="modal-backdrop fade show"
                        style={{
                            backdropFilter: "blur(5px)",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            zIndex: 1040,
                        }}
                    ></div>

                    {/* Modal Container */}
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
                            padding: "20px",
                            borderRadius: "10px",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                            width: "90vw",
                            maxWidth: "700px",
                            maxHeight: "80vh",
                            overflow: "auto", // scroll if content too tall
                        }}
                    >
                        {/* Modal Header */}
                        <div
                            className="modal-header d-flex justify-content-between align-items-center"
                            style={{ backgroundColor: "#cfe2ff", color: "#000" }}
                        >
                            <h5 className="fw-bold">{selectedSample.Analyte}</h5>
                            <button
                                type="button"
                                className="close"
                                onClick={() => setSampleShowModal(false)}
                                style={{
                                    fontSize: "1.5rem",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body">
                            <div className="row">
                                {/* Left Side: Image & Basic Details */}
                                <div className="col-md-5 text-center">
                                    <div className="mt-3 p-2 bg-light rounded text-start">
                                        {selectedSample.price != null && (
                                            <p>
                                                <strong>Price:</strong> {selectedSample.price}{" "}
                                                {selectedSample.SamplePriceCurrency}
                                            </p>
                                        )}
                                        {selectedSample.volume != null && (
                                            <p>
                                                <strong>Volume:</strong> {selectedSample.volume}{" "}
                                                {selectedSample.VolumeUnit}
                                            </p>
                                        )}
                                        {selectedSample.CountryofCollection && (
                                            <p>
                                                <strong>Country of Collection:</strong>{" "}
                                                {selectedSample.CountryofCollection}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Detailed Information */}
                                <div className="col-md-7">
                                    {(selectedSample.age != null || selectedSample.gender) && (
                                        <p>
                                            {selectedSample.age != null && (
                                                <>
                                                    <strong>Age:</strong> {selectedSample.age} years{" "}
                                                    {selectedSample.gender && "| "}
                                                </>
                                            )}
                                            {selectedSample.gender && <strong>Gender:</strong>}{" "}
                                            {selectedSample.gender}
                                        </p>
                                    )}

                                    {selectedSample.ethnicity && (
                                        <p>
                                            <strong>Ethnicity:</strong> {selectedSample.ethnicity}
                                        </p>
                                    )}
                                    {selectedSample.storagetemp && (
                                        <p>
                                            <strong>Storage Temperature:</strong> {selectedSample.storagetemp}
                                        </p>
                                    )}
                                    {selectedSample.SampleTypeMatrix && (
                                        <p>
                                            <strong>Sample Type:</strong> {selectedSample.SampleTypeMatrix}
                                        </p>
                                    )}
                                    {(selectedSample.TestResult || selectedSample.TestResultUnit) && (
                                        <p>
                                            <strong>Test Result:</strong> {selectedSample.TestResult}{" "}
                                            {selectedSample.TestResultUnit}
                                        </p>
                                    )}
                                    {selectedSample.TestMethod && (
                                        <p>
                                            <strong>Test Method:</strong> {selectedSample.TestMethod}
                                        </p>
                                    )}
                                    {selectedSample.TestKitManufacturer && (
                                        <p>
                                            <strong>Test Kit Manufacturer:</strong>{" "}
                                            {selectedSample.TestKitManufacturer}
                                        </p>
                                    )}
                                    {selectedSample.ConcurrentMedicalConditions && (
                                        <p>
                                            <strong>Concurrent Medical Conditions:</strong>{" "}
                                            {selectedSample.ConcurrentMedicalConditions}
                                        </p>
                                    )}
                                    {(selectedSample.InfectiousDiseaseTesting ||
                                        selectedSample.InfectiousDiseaseResult) && (
                                            <p>
                                                <strong>Infectious Disease Testing:</strong>{" "}
                                                {selectedSample.InfectiousDiseaseTesting} (
                                                {selectedSample.InfectiousDiseaseResult})
                                            </p>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}


            {/* Additional Mechanism Modal */}
            {showCommentModal && (
                <Modal
                    show={showCommentModal}
                    onHide={() => setShowCommentModal(false)}
                >
                    <Modal.Header closeButton>
                        <Modal.Title className="h6" sty>
                            Comments
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body
                        className="overflow-auto"
                        style={{ maxHeight: "600px" }}
                    >
                        <p>{selectedComment}</p>
                    </Modal.Body>
                </Modal>
            )}


        </div>
    );
};

export default SampleArea1;