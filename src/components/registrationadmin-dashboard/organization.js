import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faHistory,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "react-bootstrap/Modal";
import Pagination from "@ui/Pagination";
import moment from "moment";
import { notifyError, notifySuccess } from "@utils/toast";
import * as XLSX from "xlsx";
import Image from "next/image"; // at the top
const OrganizationArea = () => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editOrganization, setEditOrganization] = useState(null); // State for selected organization to edit
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null); // Store ID of organization to delete
  const [allorganizations, setAllOrganizations] = useState([]); // State to hold fetched organizations
  const [organizations, setOrganizations] = useState([]); // State to hold fetched organizations
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    user_account_id: "",
    OrganizationName: "",
    phoneNumber: "",
    city: "",
    district: "",
    country: "",
    fullAddress: "",
    type: "",
    HECPMDCRegistrationNo: "",
    website: "",
    logo: "",
    logoPreview: null,
    created_at: "",
    status: "",
  });
  const [historyData, setHistoryData] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Calculate total pages
  const totalPages = Math.ceil(organizations.length / itemsPerPage);
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  const columns = [
    //  { label: "ID", placeholder: "Search ID", field: "id" },
    { label: "Name", placeholder: "Search Name", field: "OrganizationName" },
    { label: "Contact", placeholder: "Search Contact", field: "phoneNumber" },
    {
      label: "HECPMDCRegistrationNo",
      placeholder: "Search HECPMDCRegistrationNo",
      field: "HECPMDCRegistrationNo",
    },
    { label: "Type", placeholder: "Search Type", field: "type" },
    { label: "Created at", placeholder: "Search Date", field: "created_at" },
    { label: "Status", placeholder: "Search Status", field: "status" },
  ];
  const fieldsToShowInOrder = [
    { label: "Website", placeholder: "Search Website", field: "website" },
    { label: "City", placeholder: "Search City", field: "city" },
    { label: "District", placeholder: "Search District", field: "district" },
    { label: "Country", placeholder: "Search Country", field: "country" },
    { label: "Address", placeholder: "Search Address", field: "fullAddress" },
  ];
  const onSubmit = async (event) => {
    event.preventDefault();

    const newformData = new FormData();

    // Append all the form data
    newformData.append("accountType", "Organization");
    newformData.append("OrganizationName", formData.OrganizationName);
    newformData.append("phoneNumber", formData.phoneNumber);
    newformData.append("HECPMDCRegistrationNo", formData.HECPMDCRegistrationNo);
    newformData.append("website", formData.website);
    newformData.append("fullAddress", formData.fullAddress);
    newformData.append("city", formData.city);
    newformData.append("district", formData.district);
    newformData.append("country", formData.country);
    newformData.append("status", "inactive");
    newformData.append("type", formData.type);

    if (formData.logo) {
      newformData.append("logo", formData.logo);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/createorg`,
        newformData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      notifySuccess("Organization Registered Successfully");
      fetchOrganizations(); // refresh list
      setShowAddModal(false);
      resetFormData();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error || "Failed to register organization";
      notifyError(errorMsg);
    }
  };

  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-reg-history/${filterType}/${id}`
      );
      const data = await response.json();

      setHistoryData(data);
      "Data", data;
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Call this function when opening the modal
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };

  // Fetch organizations from backend when component loads
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orgRes, cityRes, districtRes, countryRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get`
          ),
          axios.get(`${url}/city/get-city`),
          axios.get(`${url}/district/get-district`),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`
          ),
        ]);

        setAllOrganizations(orgRes.data);
        setOrganizations(orgRes.data);
        setcityname(cityRes.data);
        setdistrictname(districtRes.data);
        setCountryname(countryRes.data);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    fetchAll();
  }, [url]);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get`
      );

      setAllOrganizations(response.data);
      setOrganizations(response.data); // Store fetched organizations in state
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setSearchTerm(value);

    if (!value) {
      // If no value, reset list
      setOrganizations(allorganizations);
    } else {
      const filtered = allorganizations.filter((organization) => {
        const fieldValue = organization[field]?.toString().toLowerCase();
        const searchValue = value.toLowerCase();

        // Use exact match for status
        if (field === "status") {
          return fieldValue === searchValue;
        }

        // Use partial match for other fields
        return fieldValue?.includes(searchValue);
      });

      setOrganizations(filtered);
    }

    setCurrentPage(0); // Reset to first page when filtering
  };

  useEffect(() => {
    const updatedFilteredOrganization = organizations.filter((organization) => {
      if (!statusFilter) return true;
      return organization.status.toLowerCase() === statusFilter.toLowerCase();
    });

    setFilteredOrganizations(updatedFilteredOrganization);
    setCurrentPage(0); // Reset to first page when filtering
  }, [organizations, statusFilter]);

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const currentData = filteredOrganizations.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "logo") {
      // If the name is "logo", handle the file selection
      const file = files[0];
      if (file) {
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/gif",
        ];
        if (!validTypes.includes(file.type)) {
          alert("Please select a valid image file.");
          return;
        }

        // Update formData with the selected file and preview URL
        setFormData((prev) => ({
          ...prev,
          logo: file,
          logoPreview: URL.createObjectURL(file),
        }));
      }
    } else {
      // For other input fields, update the formData with the input value
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleEditClick = (organization) => {
    let logoPreview = "";
    let logodata = "";
    if (organization.logo?.data) {
      const binary = new Uint8Array(organization.logo.data).reduce(
        (acc, byte) => acc + String.fromCharCode(byte),
        ""
      );
      logoPreview = `data:image/png;base64,${btoa(binary)}`;
    }

    if (organization.logo && organization.logo.data) {
      const blob = new Blob([new Uint8Array(organization.logo.data)], {
        type: "image/jpeg",
      });
      const file = new File([blob], "logo.jpg", { type: "image/jpeg" });
      logodata = file;
    }
    setSelectedOrganizationId(organization.id);
    setEditOrganization(organization);
    setShowEditModal(true);
    setFormData({
      user_account_id: organization.user_account_id,
      OrganizationName: organization.OrganizationName,
      city: organization.cityid,
      district: organization.districtid,
      country: organization.countryid,
      phoneNumber: organization.phoneNumber,
      fullAddress: organization.fullAddress,
      type: organization.type,
      HECPMDCRegistrationNo: organization.HECPMDCRegistrationNo,
      website: organization.website,
      logo: logodata,
      logoPreview: logoPreview, // ✅ use the correctly computed value
      status: organization.status,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const newformData = new FormData();
    newformData.append("OrganizationName", formData.OrganizationName);
    newformData.append("phoneNumber", formData.phoneNumber);
    newformData.append("HECPMDCRegistrationNo", formData.HECPMDCRegistrationNo);
    newformData.append("website", formData.website);
    newformData.append("fullAddress", formData.fullAddress);
    newformData.append("city", formData.city);
    newformData.append("district", formData.district);
    newformData.append("country", formData.country);
    newformData.append("status", "inactive");
    newformData.append("type", formData.type);

    if (formData.logo) {
      newformData.append("logo", formData.logo);
    }


    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/update/${selectedOrganizationId}`,
        newformData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      notifySuccess("Organization Updated Successfully");
      setShowEditModal(false);
      fetchOrganizations();
      resetFormData();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || "An unexpected error occurred";
      notifyError(errorMessage);
      setShowEditModal(false);
    }
  };

  const handleToggleStatusOptions = (id) => {
    setStatusOptionsVisibility((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the visibility of the dropdown for the given id
    }));
  };

  // Handle status update
  const handleStatusClick = async (id, option) => {

    try {
      // Send status update request to backend
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/edit/${id}`,
        { status: option },
        { headers: { "Content-Type": "application/json" } }
      );

      // Assuming the response is successful, set success message and hide the dropdown
      setSuccessMessage(response.data.message);
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchOrganizations();

      // Close the dropdown after status change
      setStatusOptionsVisibility((prev) => ({
        ...prev,
        [id]: false,
      }));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  useEffect(() => {
    const anyModalOpen =
      showAddModal || showEditModal || showHistoryModal;

    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showAddModal, showEditModal, showHistoryModal]); // ✅

  const resetFormData = () => {
    setFormData({
      OrganizationName: "",
      phoneNumber: "",
      city: "",
      district: "",
      country: "",
      fullAddress: "",
      type: "",
      HECPMDCRegistrationNo: "",
      website: "",
      logo: "",
      created_at: "",
      status: "",
    });
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Get all the dropdown elements
      const dropdowns = document.querySelectorAll(".dropdown-menu");

      dropdowns.forEach((dropdown) => {
        // Check if the dropdown and its closest button group are valid
        const buttonGroup = dropdown.closest(".btn-group");

        // If dropdown exists and the clicked target is outside the dropdown and button group
        if (
          dropdown &&
          buttonGroup &&
          !dropdown.contains(event.target) &&
          !buttonGroup.contains(event.target)
        ) {
          const dropdownId = dropdown.dataset.id;
          // Close dropdown if clicked outside
          setStatusOptionsVisibility((prev) => ({
            ...prev,
            [dropdownId]: false,
          }));
        }
      });
    };

    // Add the event listener for click events
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  const formatDate = (date) => {
    const options = {
      year: "2-digit",
      month: "short",
      day: "2-digit",
      // hour: "2-digit",
      // minute: "2-digit",
      // hour12: true,
      // timeZone: "Asia/Karachi", // optional: ensures correct timezone if needed
    };

    const formatted = new Date(date).toLocaleString("en-GB", options);

    const [datePart, timePart] = formatted.split(", ");
    const [day, month, year] = datePart.split(" ");

    const formattedMonth =
      month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

    return `${day}-${formattedMonth}-${year}`;
  };
  const handleExportToExcel = () => {
    const dataToExport = filteredOrganizations.map((item) => {
      // Convert buffer to base64 string if available
      let logoUrl = "";
      if (item.logo && item.logo.data) {
        const buffer = Buffer.from(item.logo.data);
        logoUrl = `data:image/jpeg;base64,${buffer.toString("base64")}`;
      }

      return {
        OrganizationName: item.OrganizationName ?? "",
        type: item.type ?? "",
        phoneNumber: item.phoneNumber ?? "",
        HECPMDCRegistrationNo: item.HECPMDCRegistrationNo ?? "",
        city: item.city ?? "",
        country: item.country ?? "",
        district: item.district ?? "",
        fullAddress: item.fullAddress ?? "",
        website: item.website ?? "",
        status: item.status ?? "",
        //  logo: logoUrl,
        "Created At": item.created_at ? formatDate(item.created_at) : "",
        "Updated At": item.updated_at ? formatDate(item.updated_at) : "",
      };
    });

    const headers = [
      "OrganizationName",
      "type",
      "phoneNumber",
      "HECPMDCRegistrationNo",
      "city",
      "country",
      "district",
      "fullAddress",
      "website",
      "status",
      "Created At",
      "Updated At",
    ];

    if (dataToExport.length === 0) {
      dataToExport.push(Object.fromEntries(headers.map((key) => [key, ""])));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, {
      header: headers,
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Organization");

    XLSX.writeFile(workbook, "Organization_List.xlsx");
  };

  const openModal = (sample) => {
    setSelectedOrganization(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedOrganization(null);
    setShowModal(false);
  };

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <div className="row justify-content-center">
          {/* Button Container */}
          <div className="d-flex flex-column justify-content-start align-items-center gap-2 text-center w-100">
            {/* Success Message */}
            {successMessage && (
              <div
                className="alert alert-success w-100 text-start"
                role="alert"
              >
                {successMessage}
              </div>
            )}

            <h5 className="m-0 fw-bold">Organization List</h5>

            {/* Status Filter and Add Button in Same Row */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center w-100 gap-2">
              <div className="d-flex align-items-center gap-2">
                <label htmlFor="statusFilter" className="mb-0">
                  Status:
                </label>
                <select
                  id="statusFilter"
                  className="form-control"
                  style={{ width: "auto" }}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">All</option>
                  <option value="inactive">InActive</option>
                  <option value="active">Active</option>
                </select>
              </div>

              {/* Add Organization Button */}
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    backgroundColor: "#4a90e2",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    margin: 10,
                  }}
                >
                  <i className="fas fa-plus"></i> Add Organization
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
          <div className="table-responsive" style={{ overflowX: "auto" }}>
            <table className="table table-hover table-bordered text-center align-middle w-100">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {columns.map(({ label, placeholder, field }) => (
                    <th key={field} className="col-md-1 px-2">
                      <div className="d-flex flex-column align-items-center">
                        <input
                          type="text"
                          className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                          placeholder={`Search ${label}`}
                          onChange={(e) =>
                            handleFilterChange(field, e.target.value)
                          }
                          style={{
                            minWidth: "160px",
                            maxWidth: "200px",
                            width: "100px",
                          }}
                        />
                        <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-6">
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
                {currentData.length > 0 ? (
                  currentData.map((organization) => (
                    <tr key={organization.id}>
                      {columns.map(({ field }) => (
                        <td
                          key={field}
                          className={
                            field === "OrganizationName"
                              ? "text-start text-wrap"
                              : "text-center text-truncate"
                          }
                          style={{ maxWidth: "150px" }}
                        >
                          {field === "OrganizationName" ? (
                            <span
                              className="OrganizationName text-primary fw-semibold fs-6 text-decoration-underline"
                              role="button"
                              title="Organization Details"
                              onClick={() => openModal(organization)}
                              style={{
                                cursor: "pointer",
                                transition: "color 0.2s",
                              }}
                              onMouseOver={(e) =>
                                (e.target.style.color = "#0a58ca")
                              }
                              onMouseOut={(e) => (e.target.style.color = "")}
                            >
                              {organization.OrganizationName || "----"}
                            </span>
                          ) : field === "created_at" ? (
                            moment(organization[field]).format("YYYY-MM-DD")
                          ) : (
                            organization[field] || "----"
                          )}
                        </td>
                      ))}

                      {/* Action buttons */}
                      <td className="position-relative">
                        <div className="d-flex justify-content-center gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleEditClick(organization)}
                            title="Edit"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>

                          <div className="btn-group">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() =>
                                handleToggleStatusOptions(organization.id)
                              }
                              title="Edit Status"
                            >
                              <FontAwesomeIcon
                                icon={faQuestionCircle}
                                size="xs"
                              />
                            </button>

                            {statusOptionsVisibility[organization.id] && (
                              <div
                                className="dropdown-menu show"
                                data-id={organization.id}
                                style={{
                                  position: "absolute",
                                  top: "100%",
                                  left: "0",
                                  zIndex: 1000,
                                  minWidth: "100px",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusClick(organization.id, "active")
                                  }
                                >
                                  Active
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusClick(
                                      organization.id,
                                      "inactive"
                                    )
                                  }
                                >
                                  InActive
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            className="btn btn-info btn-sm"
                            onClick={() =>
                              handleShowHistory("organization", organization.id)
                            }
                            title="History"
                          >
                            <FontAwesomeIcon icon={faHistory} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length + 1} className="text-center">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredOrganizations.length >= 0 && (
            <Pagination
              handlePageClick={handlePageChange}
              pageCount={Math.max(
                1,
                Math.ceil(filteredOrganizations.length / itemsPerPage)
              )}
              focusPage={currentPage}
            />
          )}

          {/* Add and Edit Modal */}
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
                          ? "Add Organization"
                          : "Edit Organization"}
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

                    <form onSubmit={showAddModal ? onSubmit : handleUpdate}>
                      <div
                        className="modal-body"
                        style={{ maxHeight: "400px", overflowY: "auto" }}
                      >
                        <div className="form-group">
                          <div
                            className="mt-2"
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center", // To center content vertically
                            }}
                          >
                            {formData.logoPreview ? (
                              <Image
                                src={formData.logoPreview}
                                alt="Logo Preview"
                                width={120}
                                height={120}
                                style={{
                                  objectFit: "contain",
                                  borderRadius: "50%",
                                  border: "2px solid black",
                                  padding: "5px",
                                }}
                              />
                            ) : (
                              <i
                                className="fa fa-user"
                                style={{
                                  fontSize: "60px",
                                  color: "#000",
                                  border: "2px solid black",
                                  borderRadius: "50%",
                                  padding: "20px",
                                }}
                              />
                            )}
                          </div>

                          <label>Logo</label>

                          <input
                            id="logo"
                            type="file"
                            className="form-control"
                            name="logo"
                            accept="image/*"
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Name"
                            name="OrganizationName"
                            value={formData.OrganizationName}
                            onChange={handleInputChange}
                            pattern="^[A-Za-z\s]+$"
                            title="Only letters and spaces are allowed."
                            required
                          />
                          {!/^[A-Za-z\s]*$/.test(formData.OrganizationName) && (
                            <small className="text-danger">
                              Only letters and spaces are allowed.
                            </small>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Type</label>
                          <select
                            name="type"
                            value={formData.type} // Bind the value to formData.type
                            id="type"
                            style={{
                              width: "100%",
                              height: "50px",
                              paddingLeft: "50px",
                              borderColor: "#f0f0f0",
                              color: "#808080",
                            }}
                            onChange={handleInputChange} // Ensure onChange updates formData.type
                          >
                            <option value="">Select Type</option>
                            <option value="Public">Public</option>
                            <option value="Private">Private</option>
                            <option value="NGO">NGO</option>
                          </select>
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
                            placeholder="0123-4567890"
                            title="Phone number must be in the format 0123-4567890 and numeric"
                          />
                        </div>

                        <div className="form-group">
                          <label>HECPMDCRegistrationNo</label>
                          <input
                            type="text"
                            className="form-control"
                            name="HECPMDCRegistrationNo"
                            placeholder="Enter HECPMDCRegistrationNo"
                            value={formData.HECPMDCRegistrationNo}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Website</label>
                          <input
                            type="text"
                            className="form-control"
                            name="website"
                            placeholder="Enter Website"
                            value={formData.website}
                            onChange={handleInputChange}
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

          {/* History Modal */}
          {showHistoryModal && (
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
                  top: "100px",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="modal-dialog modal-md" role="document">
                  <div className="modal-content">
                    {/* Modal Header */}
                    <div className="modal-header">
                      <h5 className="modal-title">History</h5>
                      <button
                        type="button"
                        className="close"
                        onClick={() => setShowHistoryModal(false)}
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

                    {/* Chat-style Modal Body */}
                    <div
                      className="modal-body"
                      style={{
                        maxHeight: "500px",
                        overflowY: "auto",
                        backgroundColor: "#e5ddd5", // WhatsApp-style background
                        padding: "15px",
                        borderRadius: "10px",
                      }}
                    >
                      {historyData && historyData.length > 0 ? (
                        historyData.map((log, index) => {
                          const {
                            type,
                            OrganizationName,
                            website,
                            phoneNumber,
                            city_name,
                            country_name,
                            district_name,
                            fullAddress,
                            status,
                            created_at,
                            updated_at
                          } = log;


                          // Determine timestamp and person depending on status type:
                          const time =
                            status === "added" || status === "active"
                              ? created_at
                              : updated_at;

                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                marginBottom: "10px",
                              }}
                            >
                              {/* Added */}
                              {(status === "added" || status === "updated") && (
                                <div
                                  style={{
                                    padding: "10px 15px",
                                    borderRadius: "15px",
                                    backgroundColor: status === "added" ? "#ffffff" : "#dcf8c6",
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                    maxWidth: "75%",
                                    fontSize: "14px",
                                    textAlign: "left",
                                    marginTop: status === "updated" ? "5px" : "0px",
                                  }}
                                >
                                  <div><b>Organization status:</b> {status}</div>
                                  <div><b>Name:</b> {OrganizationName}</div>
                                  <div><b>Phone:</b> {phoneNumber}</div>
                                  <div><b>Country:</b> {country_name}</div>
                                  <div><b>District:</b> {district_name}</div>
                                  <div><b>City:</b> {city_name}</div>
                                  <div><b>Address:</b> {fullAddress}</div>

                                  {status === "added" && created_at && (
                                    <div>
                                      <b>Created At:</b> {moment(created_at).format("DD MMM YYYY, h:mm A")}
                                    </div>
                                  )}

                                  {status === "updated" && updated_at && (
                                    <div>
                                      <b>Updated At:</b> {moment(updated_at).format("DD MMM YYYY, h:mm A")}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Active */}
                              {(status === "active" ||
                                status === "inactive") && (
                                  <div
                                    style={{
                                      padding: "10px 15px",
                                      borderRadius: "15px",
                                      backgroundColor:
                                        status === "active"
                                          ? "#cce5ff"
                                          : "#f8d7da", // blue or red
                                      boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                      maxWidth: "75%",
                                      fontSize: "14px",
                                      textAlign: "left",
                                      marginTop: "5px",
                                    }}
                                  >
                                    <b>Organization:</b> {OrganizationName}{" "}
                                    was <b>{status}</b> by Registration Admin at{" "}
                                    {moment(
                                      status === "active"
                                        ? created_at
                                        : updated_at
                                    ).format("DD MMM YYYY, h:mm A")}
                                  </div>
                                )}
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-left">No history available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
      <Modal
        show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">
            {" "}
            Organization Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{ maxHeight: "500px", overflowY: "auto" }}
          className="bg-light rounded"
        >
          {selectedOrganization ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ field, label }) => {
                  const value = selectedOrganization[field];
                  if (value === undefined) return null;

                  return (
                    <div className="col-md-6" key={field}>
                      <div className="d-flex flex-column p-3 bg-white rounded shadow-sm h-100 border-start border-4 border-danger">
                        <span className="text-muted small fw-bold mb-1">
                          {label}
                        </span>
                        <span className="fs-6 text-dark">
                          {value?.toString() || "----"}
                        </span>
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

export default OrganizationArea;
