import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faPlus,
  faHistory,
  faEye,
  faEyeSlash,
  faTimeline,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import * as XLSX from "xlsx"
import moment from "moment";
const CommitteeMemberArea = () => {
  const [selectedCommitteMember, setSelectedCommitteMember] = useState(null);
  const [visibleCommentIndex, setVisibleCommentIndex] = useState(null);
  const [expandedRowIndex, setExpandedRowIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [orderhistoryData, setOrderHistoryData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [showCommitteeTypeOptions, setShowCommitteeTypeOptions] = useState({});
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const committeeTypeRefs = useRef({});
  const statusRefs = useRef({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommitteememberId, setSelectedCommitteememberId] = useState(null); // Store ID of Committee Members to delete
  const [editCommitteemember, setEditCommitteemember] = useState(null); // State for selected Committee Members to edit
  const [committeemembers, setCommitteemembers] = useState([]); // State to hold fetched Committee Members
  const [successMessage, setSuccessMessage] = useState("");
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [organization, setOrganization] = useState();
  const [formStep, setFormStep] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filteredCommitteemembers, setFilteredCommitteemembers] = useState([]); // Store filtered cities
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    CommitteeMemberName: "",
    email: "",
    password: "",
    phoneNumber: "",
    cnic: "",
    fullAddress: "",
    city: "",
    district: "",
    country: "",
    organization: "",
    committeetype: "",
    created_at: "",
    status: "",
  });
  const itemsPerPage = 5;
  const columns = [
    //  { label: "ID", placeholder: "Search ID", field: "id" },
    { label: "Name", placeholder: "Search Name", field: "CommitteeMemberName" },
    { label: "Email", placeholder: "Search Email", field: "email" },
    { label: "Password", placeholder: "Search Password", field: "password" },
    { label: "Committee Type", placeholder: "Search Committee Type", field: "committeetype" },
    { label: "Status", placeholder: "Search Status", field: "status" },
  ];
  const fieldsToShowInOrder = [
    { label: "CNIC", placeholder: "Search CNIC", field: "cnic" },
    { label: "Contact", placeholder: "Search Contact", field: "phoneNumber" },
    { label: "Organization", placeholder: "Search Org", field: "organization" },
    { label: "Created at", placeholder: "Search Date", field: "created_at" },
    { label: "City", placeholder: "Search City", field: "city" },
    { label: "District", placeholder: "Search District", field: "district" },
    { label: "Country", placeholder: "Search Country", field: "country" },
    { label: "Address", placeholder: "Search Address", field: "fullAddress" },
  ];
  const openModal = (sample) => {

    setSelectedCommitteMember(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCommitteMember(null);
    setShowModal(false);
  };
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // Fetch Committee Members from backend when component loads
 useEffect(() => {
  const fetchData = async () => {
    try {
      const response1 = await axios.get(`${url}/committeemember/get`);
      setCommitteemembers(response1.data);
      setFilteredCommitteemembers(response1.data);

      const response2 = await axios.get(`${url}/city/get-city`);
      setcityname(response2.data);

      const response3 = await axios.get(`${url}/district/get-district`);
      setdistrictname(response3.data);

      const response4 = await axios.get(`${url}/country/get-country`);
      setCountryname(response4.data);

      const response5 = await axios.get(`${url}/admin/organization/get`);
      const approvedOrganizations = response5.data.filter(
        (org) => org.status === "active"
      );
      setOrganization(approvedOrganizations);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchData();
}, [url]);


  const fetchCommitteemembers = async () => {
    try {
      const response = await axios.get(`${url}/committeemember/get`);
      setCommitteemembers(response.data); // Store fetched Committee Members in state
      setFilteredCommitteemembers(response.data);
    } catch (error) {
      console.error("Error fetching Committee Members:", error);
    }
  };

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredCommitteemembers.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredCommitteemembers,currentPage]);
  const handleInputChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // POST request to your backend API
      const response = await axios.post(
        `${url}/committeemember/post`,
        formData
      );

      // Refresh the committeemember list after successful submission
      fetchCommitteemembers();

      setSuccessMessage("Committee Member updated successfully.");
      resetFormData();
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding Committee Member:", error);
    }
  };
  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-reg-history/${filterType}/${id}`
      );
      const data = await response.json();

      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
  const fetchOrderHistory = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/committeemember/orderhistory/${id}`
      );
      const data = await response.json();
      
      setOrderHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };

  const handleShowOrderHistory = (id) => {
    fetchOrderHistory(id);
    setShowOrderHistoryModal(true);
  };
  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
        `${url}/committeemember/delete/${selectedCommitteememberId}`
      );

      // Set success message
      setSuccessMessage("Committeemember deleted successfully.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Refresh the committeemember list after deletion
      fetchCommitteemembers();

      // Close modal after deletion
      setShowDeleteModal(false);
      setSelectedCommitteememberId(null);
    } catch (error) {
      console.error(
        `Error deleting Committee Member with ID ${selectedCommitteememberId}:`,
        error
      );
    }
  };

  const handleEditClick = (committeemember) => {
    setSelectedCommitteememberId(committeemember.id);
    setEditCommitteemember(committeemember); // Store the Committee Members data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      CommitteeMemberName: committeemember.CommitteeMemberName,
      email: committeemember.email,
      password: committeemember.password,
      phoneNumber: committeemember.phoneNumber,
      cnic: committeemember.cnic,
      fullAddress: committeemember.fullAddress,
      city: committeemember.city,
      district: committeemember.district,
      country: committeemember.country,
      organization: committeemember.organization,
      committetype: committeemember.committetype,
      created_at: committeemember.created_at,
      status: committeemember.status,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${url}/committeemember/edit/${selectedCommitteememberId}`,
        formData
      );


      fetchCommitteemembers();
      setShowEditModal(false);
      setSuccessMessage("Committeemember updated successfully.");

      setFormData({
        CommitteeMemberName: "",
        email: "",
        password: "",
        phoneNumber: "",
        cnic: "",
        fullAddress: "",
        city: "",
        district: "",
        country: "",
        organization: "",
        committeetype: "",
        created_at: "",
        status: "",
      });
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        `Error updating committeemember with ID ${selectedCommitteememberId}:`,
        error
      );
    }
  };
  const formatDate = (date) => {
    const options = { year: "2-digit", month: "short", day: "2-digit" };
    const formattedDate = new Date(date).toLocaleDateString("en-GB", options);
    const [day, month, year] = formattedDate.split(" ");

    // Capitalize the first letter of the month and keep the rest lowercase
    const formattedMonth =
      month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day}-${formattedMonth}-${year}`;
  };
  const handleCommitteeTypeClick = async (committeememberId, option) => {
    try {
      const response = await axios.put(
        `${url}/committeemember/committeetype/edit/${committeememberId}`,
        { committeetype: option }, // Only send the selected `committeetype`
        { headers: { "Content-Type": "application/json" } }
      );

      // Update the committeemembers state to reflect the change
      setCommitteemembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === committeememberId
            ? { ...member, committeetype: option }
            : member
        )
      );
      // Hide the options after the update
      setShowCommitteeTypeOptions((prev) => ({
        ...prev,
        [committeememberId]: false,
      }));
      fetchCommitteemembers();
      setSuccessMessage("Committe Member Type Updated successfully");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Error updating committee member:",
        error.response?.data?.error || error.message
      );
    }
  };

  const handleToggleCommitteeTypeOptions = (committeememberId) => {
    setShowCommitteeTypeOptions((prev) => ({
      ...prev,
      [committeememberId]: !prev[committeememberId],
    }));
  };
  const resetFormData = () => {
    setFormData({
      CommitteeMemberName: "",
      email: "",
      password: "",
      phoneNumber: "",
      cnic: "",
      fullAddress: "",
      city: "",
      district: "",
      country: "",
      organization: "",
      committeetype: "",
      created_at: "",
      status: "",
    });
    setFormStep(1);
  };
  const handleStatusClick = async (committeememberId, option) => {
    try {
      const response = await axios.put(
        `${url}/committeemember/status/edit/${committeememberId}`,
        { status: option }, // Only send the selected `status`
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccessMessage("Committe Member Status Updated successfully");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      // Update the committeemembers state to reflect the change
      setCommitteemembers((prevMembers) =>
        prevMembers.map((member) =>
          member.id === committeememberId
            ? { ...member, status: option }
            : member
        )
      );
      // Hide the options after the update
      setStatusOptionsVisibility((prev) => ({
        ...prev,
        [committeememberId]: false,
      }));

      fetchCommitteemembers();
    } catch (error) {
      console.error(
        "Error updating status:",
        error.response?.data?.error || error.message
      );
    }
  };

  const handleToggleStatusOptions = (committeememberId) => {
    setStatusOptionsVisibility((prev) => ({
      ...prev,
      [committeememberId]: !prev[committeememberId],
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Loop over all committeeType dropdowns
      Object.entries(committeeTypeRefs.current).forEach(([id, ref]) => {
        if (ref && !ref.contains(event.target)) {
          setShowCommitteeTypeOptions((prev) => ({
            ...prev,
            [id]: false,
          }));
        }
      });

      // Loop over all status dropdowns
      Object.entries(statusRefs.current).forEach(([id, ref]) => {
        if (ref && !ref.contains(event.target)) {
          setStatusOptionsVisibility((prev) => ({
            ...prev,
            [id]: false,
          }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const currentData = filteredCommitteemembers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  // Filter the Committe member list
  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = committeemembers; // Show all if filter is empty
    } else {
      filtered = committeemembers.filter((committeemember) =>
        // Use exact matching for 'status' field
        field === "status"
          ? committeemember[field]?.toString().toLowerCase() === value.toLowerCase() // Match exactly
          : committeemember[field]
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase()) // For other fields, use includes
      );
    }
    setFilteredCommitteemembers(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
  };

  useEffect(() => {
    if (showDeleteModal || showAddModal || showEditModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showDeleteModal, showAddModal, showEditModal]);

  const handleExportToExcel = () => {
    const dataToExport = filteredCommitteemembers.map((item) => ({
      email: item.email ?? "",
      password: item.password ?? "",
      name: item.CommitteeMemberName ?? "",
      phoneNumber: item.phoneNumber ?? "",
      city: item.city_name ?? "",
      country: item.country_name ?? "",
      district: item.district_name ?? "",
      fullAddress: item.fullAddress ?? "",
      status: item.status ?? "",
      "Created At": item.created_at ? formatDate(item.created_at) : "",
      // "Updated At": item.updated_at ? formatDate(item.updated_at) : "",
    }));

    const headers = [
      "email",
      "password",
      "name",
      "phoneNumber",
      "city",
      "country",
      "district",
      "fullAddress",
      "status",
      "Created At",
    ];

    if (dataToExport.length === 0) {
      dataToExport.push(Object.fromEntries(headers.map((key) => [key, ""])));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CommitteeMember");
    XLSX.writeFile(workbook, "CommitteeMember_List.xlsx");
  };


  return (
    <section className="policy__area pb-40 overflow-hidden p-4">
      <div className="container">
        <div className="d-flex flex-column justify-content-start align-items-center gap-2 text-center w-100 ">
          <h5 className="m-0 fw-bold">Commitee Member List</h5>
          {/* {Button} */}
          <div className="d-flex flex-column w-100">
            {/* Success Message */}
            {successMessage && (
              <div
                className="alert alert-success w-100 text-start mb-2"
                role="alert"
              >
                {successMessage}
              </div>
            )}

            {/* Button Container */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              {/* Status Filter */}
              <div className="d-flex flex-column flex-sm-row align-items-center gap-2 w-auto">
                <label htmlFor="statusFilter" className="mb-2 mb-sm-0">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  className="form-control mb-2"
                  style={{ width: "auto" }}
                  onChange={(e) => handleFilterChange("status", e.target.value)} // Pass "status" as the field
                >
                  <option value="">All</option>
                  <option value="Active">Active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
              <div className="d-flex flex-wrap gap-3 align-items-center">
                {/* Add Committee Member Button */}
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    backgroundColor: "#4a90e2", // soft blue
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <i className="fas fa-plus"></i> Add Committee Member
                </button>
                <button
                  onClick={handleExportToExcel}
                  style={{
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <i className="fas fa-file-excel"></i> Export to Excel
                </button>
              </div>
            </div>
          </div>
          {/* Table */}
          <div className="table-responsive w-100">
            <table className="table table-hover table-bordered text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {columns.map(({ label, field, placeholder }) => (
                    <th key={label} className="col-md-1 px-2">

                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                          placeholder={`Search ${label}`}
                          onChange={(e) => handleFilterChange(field, e.target.value)}
                          style={{ minWidth: "170px", maxWidth: "200px"}}
                        />
                        <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-6">
                          {label}
                        </span>

                      </div>
                    </th>
                  ))}
                  <th className="p-2 text-center" style={{ minWidth: "50px" }}>Action</th>

                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((committeemember) => (
                    <tr key={committeemember.id}>
                      {/* <td>{committeemember.id}</td> */}
                      <td
                        className="text-end"
                        style={{ maxWidth: "150px" }}
                      >
                        <span
                          className="CommitteeMemberName text-primary fw-semibold fs-6 text-decoration-underline"
                          role="button"
                          title="Collection Site Details"
                          onClick={() => openModal(committeemember)}
                          style={{
                            cursor: "pointer",
                            transition: "color 0.2s",
                          }}
                          onMouseOver={(e) => (e.target.style.color = "#0a58ca")}
                          onMouseOut={(e) => (e.target.style.color = "")}
                        >
                          {committeemember.CommitteeMemberName || "----"}
                        </span>
                      </td>
                      <td>{committeemember.email}</td>
                      <td>{committeemember.password}</td>
                      {/* <td>{committeemember.phoneNumber}</td> */}
                      <td>{committeemember.committeetype}</td>
                      {/* <td>{committeemember.organization_name}</td> */}
                      <td>{committeemember.status}</td>
                      <td>
                        <div className="d-flex justify-content-around gap-2">
                          <button
                            className="btn btn-success btn-sm py-0 px-1"
                            onClick={() => handleEditClick(committeemember)}
                            title="Edit Committee Member"
                          >
                            <FontAwesomeIcon icon={faEdit} size="xs" />
                          </button>

                          <div
                            className="btn-group"
                            ref={(el) => (committeeTypeRefs.current[committeemember.id] = el)}
                          >
                            <button
                              className="btn btn-warning btn-sm py-0 px-1"
                              onClick={() =>
                                handleToggleCommitteeTypeOptions(committeemember.id)
                              }
                              title="Edit Committee Type"
                            >
                              <FontAwesomeIcon icon={faPlus} size="xs" />
                            </button>
                            {showCommitteeTypeOptions[committeemember.id] && (
                              <div className="dropdown-menu show">
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleCommitteeTypeClick(committeemember.id, "Scientific")
                                  }
                                >
                                  Scientific
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleCommitteeTypeClick(committeemember.id, "Ethical")
                                  }
                                >
                                  Ethical
                                </button>
                              </div>
                            )}
                          </div>

                          <div
                            className="btn-group"
                            ref={(el) => (statusRefs.current[committeemember.id] = el)}
                          >
                            <button
                              className="btn btn-primary btn-sm py-0 px-1"
                              onClick={() => handleToggleStatusOptions(committeemember.id)}
                              title="Edit Status"
                            >
                              <FontAwesomeIcon icon={faQuestionCircle} size="xs" />
                            </button>
                            {statusOptionsVisibility[committeemember.id] && (
                              <div className="dropdown-menu show">
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusClick(committeemember.id, "Active")
                                  }
                                >
                                  Active
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusClick(committeemember.id, "Inactive")
                                  }
                                >
                                  Inactive
                                </button>
                              </div>
                            )}
                          </div>


                          <button
                            className="btn btn-danger btn-sm py-0 px-1"
                            onClick={() => {
                              setSelectedCommitteememberId(committeemember.id);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Committee Member"
                          >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                          </button>

                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => {
                              handleShowHistory(
                                "committeemember",
                                committeemember.id
                              );
                            }}
                            title="Committee Member History"
                          >
                            <FontAwesomeIcon icon={faHistory} size="sm" />
                          </button>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleShowOrderHistory(committeemember.id)}
                            title="Committee Member Order History"
                          >
                            <FontAwesomeIcon icon={faShoppingCart} size="sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="15" className="text-center">
                      No Committee Members Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          

         <h6 className="text-danger small">Note: Handle &rsquo;Status&rsquo; and &rsquo;Committee Type&rsquo; through Action Icons</h6>
</div>
{totalPages >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={totalPages}
              focusPage={currentPage}
            />
          )}
          {/* Modal for Adding/Editing Committee members */}
          {(showAddModal || showEditModal) && (
            <>
              {/* Bootstrap Backdrop with Blur */}
              <div
                className="modal-backdrop fade show"
                style={{ backdropFilter: "blur(5px)" }}
              ></div>

              {/* Modal Content */}
              <div
                className="modal show d-block"
                tabIndex="-1"
                role="dialog"
                style={{
                  zIndex: 1050,
                  position: "fixed",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {showAddModal
                          ? "Add Committee Member"
                          : "Edit Committee Member"}
                      </h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => {
                          setShowAddModal(false);
                          setShowEditModal(false);
                          resetFormData();
                        }}
                        style={{
                          fontSize: "1.5rem",
                          position: "absolute",
                          right: "10px",
                          top: "10px",
                          cursor: "pointer",
                        }}
                      >
                        <span>&times;</span>
                      </button>
                    </div>

                    <form onSubmit={showAddModal ? handleSubmit : handleUpdate}>
                      <div
                        className="modal-body"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Name"
                            name="CommitteeMemberName"
                            value={formData.CommitteeMemberName}
                            onChange={handleInputChange}
                            pattern="^[A-Za-z\s]+$"
                            title="Only letters and spaces are allowed."
                            required
                          />
                          {!/^[A-Za-z\s]*$/.test(
                            formData.CommitteeMemberName
                          ) && (
                              <small className="text-danger">
                                Only letters and spaces are allowed.
                              </small>
                            )}
                        </div>

                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter Email"
                            required
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label">Password</label>
                          <div className="input-group input-group-sm">
                            <input
                              type={showPassword ? "text" : "password"}
                              className="form-control"
                              name="password"
                              placeholder="Enter Password"
                              value={formData.password}
                              onChange={handleInputChange}
                              pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$"
                              title="Password must be at least 6 characters long and contain at least one letter, one number, and one special character."
                              required
                            />
                            <span
                              className="input-group-text"
                              style={{ cursor: "pointer" }}
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              <i
                                className={
                                  showPassword
                                    ? "fa-regular fa-eye"
                                    : "fa-regular fa-eye-slash"
                                }
                              ></i>
                            </span>
                          </div>
                        </div>

                        <div className="form-group">
                          <label>Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                            pattern="^\d{4}-\d{7}$"
                            placeholder="XXXX-XXXXXXX"
                            title="Phone number must be in the format e.g. 0332-4567890"
                          />
                        </div>

                        <div className="form-group">
                          <label>CNIC</label>
                          <input
                            type="text"
                            className="form-control"
                            name="cnic"
                            placeholder="XXXXX-XXXXXXX-X"
                            value={formData.cnic}
                            onChange={handleInputChange}
                            pattern="^\d{5}-\d{7}-\d{1}$"
                            title="CNIC must be in the format 34765-5676554-3."
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label>Full Address</label>
                          <input
                            type="text"
                            className="form-control"
                            name="fullAddress"
                            placeholder="Enter Full Address"
                            value={formData.fullAddress}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>City</label>
                          <select
                            className="form-control p-2"
                            name="city"
                            value={formData.city} // Store the selected city ID in formData
                            onChange={handleInputChange} // Handle change to update formData
                            required
                          >
                            <option value="" disabled>
                              Select City
                            </option>
                            {cityname.map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>District</label>
                          <select
                            className="form-control  p-2"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="" disabled>
                              Select District
                            </option>
                            {districtname.map((district) => (
                              <option key={district.id} value={district.id}>
                                {district.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Country</label>
                          <select
                            className="form-control p-2"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="" disabled>
                              Select Country
                            </option>
                            {countryname.map((country) => (
                              <option key={country.id} value={country.id}>
                                {country.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Organization</label>
                          <select
                            className="form-control  p-2"
                            name="organization"
                            value={formData.organization}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="" disabled>
                              Select Organization
                            </option>
                            {organization.map((organization) => (
                              <option
                                key={organization.id}
                                value={organization.id}
                              >
                                {organization.OrganizationName}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">
                          {showAddModal ? "Save" : "Update"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Modal for Deleting Committeemembers */}
          {showDeleteModal && (
            <>
              <div
                className="modal-backdrop fade show"
                style={{ backdropFilter: "blur(5px)" }}
              ></div>

              {/* Modal Content */}
              <div
                className="modal show d-block"
                tabIndex="-1"
                role="dialog"
                style={{
                  zIndex: 1050,
                  position: "fixed",
                  top: "120px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="modal-dialog" role="document">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Delete Committee member</h5>

                      <button
                        type="button"
                        className="close"
                        onClick={() => setShowDeleteModal(false)}
                        style={{
                          // background: 'none',
                          // border: 'none',
                          fontSize: "1.5rem",
                          position: "absolute",
                          right: "10px",
                          top: "10px",
                          cursor: "pointer",
                        }}
                      >
                        <span>&times;</span>
                      </button>
                    </div>
                    <div className="modal-body">
                      <p>
                        Are you sure you want to delete this committee member?
                      </p>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-danger" onClick={handleDelete}>
                        Delete
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setShowDeleteModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {showHistoryModal && (
            <>
              {/* Backdrop */}
              <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

              {/* Modal */}
              <div className="modal show d-block" role="dialog" style={{ zIndex: 1050, left: "50%", transform: "translateX(-50%)" }}>
                <div className="modal-dialog modal-md">
                  <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header">
                      <h5 className="modal-title">History</h5>
                      <button type="button" className="close" onClick={() => setShowHistoryModal(false)} style={{ fontSize: "1.5rem", position: "absolute", right: "10px", cursor: "pointer" }}>
                        &times;
                      </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body" style={{ maxHeight: "500px", overflowY: "auto", backgroundColor: "#e5ddd5", padding: "15px", borderRadius: "10px" }}>
                      {historyData?.length ? historyData.map(({ CommitteeMemberName, phoneNumber, cnic, fullAddress, city_name, district_name, country_name, organization_name, created_at, updated_at, status }, index) => (
                        <div key={index} style={{ marginBottom: "10px" }}>
                          {/* History Message */}
                          <div style={{
                            padding: "10px 15px",
                            borderRadius: "15px",
                            backgroundColor: status === "added" ? "#ffffff" : "#dcf8c6",
                            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                            maxWidth: "75%",
                            fontSize: "14px",
                          }}>
                            <b>Committee Member:</b> {CommitteeMemberName} was <b>{status}</b> by Registration Admin at {moment(status === "added" ? created_at : updated_at).format("DD MMM YYYY, h:mm A")}
                            <br />
                            {cnic && <><b>CNIC:</b> {cnic} <br /></>}
                            {phoneNumber && <><b>Phone:</b> {phoneNumber} <br /></>}
                            {organization_name && <><b>Organization:</b> {organization_name} <br /></>}
                            {fullAddress && <><b>Address:</b> {fullAddress}, {city_name}, {district_name}, {country_name} <br /></>}
                          </div>
                        </div>
                      )) : <p className="text-left">No history available.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {showOrderHistoryModal && (
            <div className="modal show d-block" style={{ zIndex: 1050, left: "50%", transform: "translateX(-50%)" }} role="dialog">
              <div className="modal-dialog modal-xl" role="document">
                <div className="modal-content shadow-lg">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title">Order History</h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setShowOrderHistoryModal(false)}
                    ></button>
                  </div>

                  <div className="modal-body">
                    {orderhistoryData.length === 0 ? (
                      <div className="alert alert-info text-center">No order history found.</div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover table-striped align-middle">
                          <thead className="table-dark">
                            <tr>
                              <th>Researcher Name</th>
                              <th>Analyte</th>
                              <th>Quantity</th>
                              <th>Comments</th>
                              <th>Documents</th>
                              <th>Additional Mechanism</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderhistoryData.map((order, index) => (
                              <React.Fragment key={index}>
                                <tr>
                                  <td>{order.researcher_name}</td>
                                  <td>{order.Analyte}</td>
                                  <td>{order.quantity}</td>

                                  <td>
                                    <button
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() =>
                                        setVisibleCommentIndex(visibleCommentIndex === index ? null : index)
                                      }
                                    >
                                      {visibleCommentIndex === index ? "Hide" : "View"}
                                    </button>
                                  </td>
                                  <td>
                                    {/* IRB File Download Button */}
                                    {order.irb_file && order.irb_file.data && (
                                      <button
                                        className="btn btn-sm btn-outline-success me-1 mb-1"
                                        onClick={() => {
                                          const byteArray = new Uint8Array(order.irb_file.data);
                                          const blob = new Blob([byteArray], { type: 'application/pdf' }); // adjust MIME if needed
                                          const url = URL.createObjectURL(blob);

                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.download = 'IRB_File.pdf'; // or dynamically name it
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          URL.revokeObjectURL(url);
                                        }}
                                      >
                                        Download IRB
                                      </button>
                                    )}

                                    {/* NBC File (null in your data, so just check if exists) */}
                                    {order.nbc_file && order.nbc_file.data && (
                                      <button
                                        className="btn btn-sm btn-outline-warning me-1 mb-1"
                                        onClick={() => {
                                          const byteArray = new Uint8Array(order.nbc_file.data);
                                          const blob = new Blob([byteArray], { type: 'application/pdf' }); // change if needed
                                          const url = URL.createObjectURL(blob);

                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.download = 'NBC_File.pdf';
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                          URL.revokeObjectURL(url);
                                        }}
                                      >
                                        Download NBC
                                      </button>
                                    )}
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-outline-primary mb-2"
                                      onClick={() =>
                                        setExpandedRowIndex(expandedRowIndex === index ? null : index)
                                      }
                                    >
                                      {expandedRowIndex === index ? "Hide Reporting" : "View Reporting"}
                                    </button>

                                    {expandedRowIndex === index && (
                                      <div
                                        className="border rounded p-2 bg-light text-dark shadow-sm"
                                        style={{ whiteSpace: "pre-wrap", maxWidth: "300px", marginTop: "5px" }}
                                      >
                                        <strong>Additional Info:</strong>
                                        <div>{order.reporting_mechanism}</div>
                                      </div>
                                    )}
                                  </td>



                                </tr>

                                {visibleCommentIndex === index && (
                                  <tr>
                                    <td colSpan="6">
                                      <div className="alert alert-secondary mb-0">
                                        <strong>Comment:</strong> {order.committee_comments || "No comments available."}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            ))}

                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>
          )}
        </div>
      
      <Modal show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger"> Organization Details</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }} className="bg-light rounded">
          {selectedCommitteMember ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ field, label }) => {
                  const value = selectedCommitteMember[field];
                  if (value === undefined) return null;

                  return (
                    <div className="col-md-6" key={field}>
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
      </Modal>
    </section>
  );
};

export default CommitteeMemberArea;