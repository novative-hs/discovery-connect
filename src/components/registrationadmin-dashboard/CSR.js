import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Modal from "react-bootstrap/Modal";
import {
  faEdit,
  faTrash,
  faHistory,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import * as XLSX from "xlsx";
import {
  useRegisterUserMutation,
  useUpdateProfileMutation,
} from "src/redux/features/auth/authApi";
import moment from "moment";
import { notifyError, notifySuccess } from "@utils/toast";
const CSRArea = () => {
  const [selectedCSR, setSelectedCSR] = useState(null);
  const [registerUser, {}] = useRegisterUserMutation();
  const [updateUser, {}] = useUpdateProfileMutation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [editCSR, setEditCSR] = useState(null);
  const [selectedCSRId, setSelectedCSRId] = useState(null);
  const [allCSR, setAllCSR] = useState([]);
  const [CSR, setCSR] = useState([]);
  const [cityname, setcityname] = useState([]);
  const [collectionsitename, setcollectionsitename] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [filteredCSR, setFilteredCSR] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
  const [formData, setFormData] = useState({
    CSRName: "",
    email: "",
    password: "",
    phoneNumber: "",
    city: "",
    district: "",
    country: "",
    permission: "",
    collectionsitename: "",
    fullAddress: "",
    created_at: "",
    status: "",
  });
  const fieldsToShowInOrder = [
    { label: "Contact", placeholder: "Search Contact", field: "phoneNumber" },
    { label: "City", placeholder: "Search City", field: "city" },
    { label: "District", placeholder: "Search District", field: "district" },
    { label: "Country", placeholder: "Search Country", field: "country" },
    { label: "Address", placeholder: "Search Address", field: "fullAddress" },
  ];
  const openModal = (csrName) => {
    setSelectedCSR(csrName);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCSR(null);
    setShowModal(false);
  };
 useEffect(() => {
  const fetchAll = async () => {
    try {
      const [csrRes, collectionsiteRes, cityRes, districtRes, countryRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/csr/get`),
        axios.get(`${url}/admin/csr/getCollectionsiteName`),
        axios.get(`${url}/city/get-city`),
        axios.get(`${url}/district/get-district`),
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`)
      ]);

      setCSR(csrRes.data);
      setAllCSR(csrRes.data);
      setcollectionsitename(collectionsiteRes.data);
      setcityname(cityRes.data);
      setdistrictname(districtRes.data);
      setCountryname(countryRes.data);
    } catch (error) {
      console.error("Error fetching initial CSR data:", error);
    }
  };

  fetchAll();
}, [url]);


  const fetchCSR = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/csr/get`
      );
      setCSR(response.data);
      setAllCSR(response.data);
    } catch (error) {
      console.error("Error fetching CSR:", error);
    }
  };
 

  const handleFilterChange = (field, value) => {
    setSearchTerm(value);

    if (!value) {
      setCSR(allCSR);
    } else {
      const filtered = allCSR.filter((CSR) => {
        return CSR[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      });
      setCSR(filtered);
    }

    setCurrentPage(0); // Reset to first page when filtering
  };

  useEffect(() => {
    const updatedFilteredCSR = CSR.filter((CSR) => {
      if (!statusFilter) return true;
      return CSR.status.toLowerCase() === statusFilter.toLowerCase();
    });

    setFilteredCSR(updatedFilteredCSR);
    setCurrentPage(0); // Reset to first page when filtering
  }, [CSR, statusFilter]);

  const currentData = filteredCSR.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected); // React Paginate uses 0-based index
  };
  const handleToggleStatusOptions = (id) => {
    setStatusOptionsVisibility((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the visibility of the dropdown for the given id
    }));
  };

  const handleStatusClick = async (id, option) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/csr/edit/${id}`,
        { status: option },
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccessMessage("CSR status updated successfully.");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchCSR(); // Refresh data after delete
      setStatusOptionsVisibility((prev) => ({
        ...prev,
        [id]: false,
      }));
    } catch (error) {
      console.error(
        `Error changing CSR status with ID ${selectedCSRId}:`,
        error
      );
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const data = {
      email: formData.email,
      password: formData.password,
      accountType: "CSR",
      CSRName: formData.CSRName,
      collectionsitename: formData.collectionsitename,
      phoneNumber: formData.phoneNumber,
      fullAddress: formData.fullAddress,
      city: formData.city,
      district: formData.district,
      country: formData.country,
      status: "inactive",
      permission: formData.permission,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/csr/createcsr`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      notifySuccess("CSR created successfully");
      fetchCSR();
      setShowAddModal(false);
      resetFormData();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.error || "CSR creation failed";
      notifyError(errorMessage);
    }
  };

  const handleEditClick = (CSR) => {
    setSelectedCSRId(CSR.id);
    setEditCSR(CSR); // Store the researcher data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      user_account_id: CSR.user_account_id,
      CSRName: CSR.CSRName,
      email: CSR.useraccount_email,
      password: CSR.useraccount_password,
      phoneNumber: CSR.phoneNumber,
      city: CSR.cityid,
      country: CSR.countryid,
      district: CSR.districtid,
      collectionsitename: CSR.collection_id,
      fullAddress: CSR.fullAddress,
      status: CSR.status,
      permission: formData.permission,
    });
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    const newformData = new FormData();
    newformData.append("useraccount_email", formData.email);
    newformData.append("useraccount_password", formData.password);
    newformData.append("accountType", "CSR");
    newformData.append("CSRName", formData.CSRName);
    newformData.append("phoneNumber", formData.phoneNumber);
    newformData.append("fullAddress", formData.fullAddress);
    newformData.append("city", formData.city);
    newformData.append("district", formData.district);
    newformData.append("country", formData.country);
    newformData.append("collectionsitename", formData.collectionsitename);
    newformData.append("permission", formData.permission);
    
    const id = formData.user_account_id;

    updateUser({ id, formData: newformData })
      .then((result) => {
        if (result?.error) {
          const errorMessage = result?.error?.data?.error || "Update Failed";
          notifyError(errorMessage);
        } else {
          notifySuccess("CSR Updated Successfully");
          fetchCSR();
          setShowEditModal(false);
        }
      })
      .catch((error) => {
        notifyError(error?.message || "An unexpected error occurred");
      });

    setShowEditModal(false);
    resetFormData();
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
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const resetFormData = () => {
    setFormData({
      CSRName: "",
      email: "",
      password: "",
      phoneNumber: "",
      city: "",
      district: "",
      country: "",
      fullAddress: "",
      created_at: "",
      status: "",
      collectionsitename: "",
      permission: "",
    });
  };
  useEffect(() => {
    if (showAddModal || showDeleteModal || showEditModal || showHistoryModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showAddModal, showDeleteModal, showEditModal, showHistoryModal]);
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
    const dataToExport = filteredCSR.map((item) => ({
      email: item.useraccount_email ?? "",
      password: item.useraccount_password ?? "",
      name: item.CSRName ?? "",
      collectionsitename: item.name ?? "",
      phoneNumber: item.phoneNumber ?? "",
      city: item.city ?? "",
      country: item.country ?? "",
      district: item.district ?? "",
      fullAddress: item.fullAddress ?? "",
      permission: item.permission ?? "",
      status: item.status ?? "",
      "Created At": item.created_at ? formatDate(item.created_at) : "",
      "Updated At": item.updated_at ? formatDate(item.updated_at) : "",
    }));

    const headers = [
      "email",
      "password",
      "name",
      "collectionsitename",
      "phoneNumber",
      "city",
      "country",
      "district",
      "fullAddress",
      "permission",
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
    XLSX.utils.book_append_sheet(workbook, worksheet, "CSR");
    XLSX.writeFile(workbook, "CSR_List.xlsx");
  };

  return (
    <section className="policy__area pb-40 overflow-hidden p-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="d-flex flex-column w-100">
            {/* Button Container */}
            <div className="d-flex flex-column justify-content-start justify-content-sm-start align-items-center gap-2 text-center w-100">
              {/* Success Message */}
              {successMessage && (
                <div
                  className="alert alert-success w-100 text-start"
                  role="alert"
                >
                  {successMessage}
                </div>
              )}
              <h5 className="m-0 fw-bold ">CSR List</h5>
              {/* Status Filter */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center w-100 gap-2">
                <div className="d-flex align-items-center gap-2">
                  <label htmlFor="statusFilter" className="mb-0">
                    Status:
                  </label>
                  <select
                    id="statusFilter"
                    className="form-control"
                    style={{ width: "auto" }}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="">All</option>
                    <option value="inactive">InActive</option>
                    <option value="active">Active</option>
                  </select>
                </div>
                <div className="d-flex flex-wrap gap-3 align-items-center">
                  {/* Add Organization Button */}
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
                    <i className="fas fa-plus"></i> Add CSR
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
                  <tr>
                    {[
                      {
                        label: "Name",
                        placeholder: "Search Name",
                        field: "CSRName",
                      },
                      {
                        label: "Email",
                        placeholder: "Search Email",
                        field: "useraccount_email",
                      },
                      {
                        label: "Password",
                        placeholder: "Search Password",
                        field: "useraccount_password",
                      },
                      {
                        label: "Collectionsite Name",
                        placeholder: "Search Collectionsite Name",
                        field: "name",
                      },
                      {
                        label: "Permssion",
                        placeholder: "Search Permisssion",
                        field: "permission",
                      },
                      {
                        label: "Status",
                        placeholder: "Search Status",
                        field: "status",
                      },
                    ].map(({ label, placeholder, field }) => (
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
                              minWidth: "170px",
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
                    <th
                      className="p-2 text-center"
                      style={{ minWidth: "50px" }}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length > 0 ? (
                    currentData.map((CSR) => (
                      <tr key={CSR.id}>
                        <td className="text-end" style={{ maxWidth: "150px" }}>
                          <span
                            className="CommitteeMemberName text-primary fw-semibold fs-6 text-decoration-underline"
                            role="button"
                            title="Collection Site Details"
                            onClick={() => openModal(CSR)}
                            style={{
                              cursor: "pointer",
                              transition: "color 0.2s",
                            }}
                            onMouseOver={(e) =>
                              (e.target.style.color = "#0a58ca")
                            }
                            onMouseOut={(e) => (e.target.style.color = "")}
                          >
                            {CSR.CSRName || "----"}
                          </span>
                        </td>

                        <td>{CSR.useraccount_email}</td>
                        <td>{CSR.useraccount_password}</td>
                        <td>{CSR.name}</td>
                        <td>
                           {CSR.permission === "all_order"
                          ? "All Order Access"
                          : CSR.permission === "own_order"
                          ? "Assigned Collection Site Orders"
                          : "----"}
                        </td>
                       

                        {/* <td>{CSR.phoneNumber}</td> */}

                        <td>{CSR.status}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleEditClick(CSR)}
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <div className="btn-group position-relative">
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() =>
                                  handleToggleStatusOptions(CSR.id)
                                }
                                title="Edit Status"
                              >
                                <FontAwesomeIcon
                                  icon={faQuestionCircle}
                                  size="xs"
                                />
                              </button>

                              {statusOptionsVisibility[CSR.id] && (
                                <div
                                  className="dropdown-menu show position-absolute"
                                  data-id={CSR.id}
                                  style={{ zIndex: 1000 }}
                                >
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      handleStatusClick(CSR.id, "active")
                                    }
                                  >
                                    Active
                                  </button>
                                  <button
                                    className="dropdown-item"
                                    onClick={() =>
                                      handleStatusClick(CSR.id, "inactive")
                                    }
                                  >
                                    InActive
                                  </button>
                                </div>
                              )}
                            </div>
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => handleShowHistory("CSR", CSR.id)}
                              title="History"
                            >
                              <FontAwesomeIcon icon={faHistory} size="sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        No CSR available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredCSR.length >= 0 && (
              <Pagination
                handlePageClick={handlePageChange}
                pageCount={Math.max(
                  1,
                  Math.ceil(filteredCSR.length / itemsPerPage)
                )}
                focusPage={currentPage}
              />
            )}
          </div>
          {/* Edit CSR Modal */}
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
                        {showAddModal ? "Add CSR" : "Edit CSR"}
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
                          <label>Name</label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Name"
                            name="CSRName"
                            value={formData.CSRName}
                            onChange={handleInputChange}
                            pattern="^[A-Za-z\s]+$"
                            title="Only letters and spaces are allowed."
                            required
                          />
                          {!/^[A-Za-z\s]*$/.test(formData.CSRName) && (
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
                            placeholder="0123-4567890"
                            title="Phone number must be in the format 0123-4567890 and numeric"
                          />
                        </div>
                        <div className="form-group">
                          <label>Collection site Name</label>
                          <select
                            className="form-control p-2"
                            name="collectionsitename"
                            value={formData.collectionsitename} // Store the selected city ID in formData
                            onChange={handleInputChange} // Handle change to update formData
                            required
                          >
                            <option value="" disabled>
                              Select Collectionsite Name
                            </option>
                            {collectionsitename.map((collectionsite) => (
                              <option
                                key={collectionsite.id}
                                value={collectionsite.id}
                              >
                                {collectionsite.name}
                              </option>
                            ))}
                          </select>
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
                          <label>Permission</label>
                          <select
                            className="form-control p-2"
                            name="permission"
                            value={formData.permission}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Select Permission</option>
                            <option value="all_order">All Orders Access</option>
                            <option value="own_order">
                              Assigned CollectionSites Orders Access
                            </option>
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
                            CSRName,
                            phoneNumber,
                            fullAddress,
                            city_name,
                            country_name,
                            district_name,
                            permission,
                            status,
                            created_at,
                            updated_at,
                          } = log;

                          const formattedDate = moment(
                            status === "updated" ? updated_at : created_at
                          ).format("DD MMM YYYY, h:mm A");

                          return (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-start",
                                marginBottom: "15px",
                              }}
                            >
                              <div
                                style={{
                                  padding: "10px 15px",
                                  borderRadius: "15px",
                                  backgroundColor:
                                    status === "updated" ||
                                    status === "inactive"
                                      ? "#dcf8c6"
                                      : "#ffffff",
                                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                  maxWidth: "100%",
                                  fontSize: "14px",
                                  textAlign: "left",
                                }}
                              >
                                {CSRName && (
                                  <p>
                                    <b>CSR Name:</b> {CSRName}
                                  </p>
                                )}
                                {status && (
                                  <p>
                                    <b>Status:</b> {status}
                                  </p>
                                )}
                                {permission && (
                                  <p>
                                    <b>Permission:</b>{" "}
                                    {permission === "all_order"
                                      ? "All Order Access"
                                      : "My Collection Site Orders"}
                                  </p>
                                )}
                                {phoneNumber && (
                                  <p>
                                    <b>Phone:</b> {phoneNumber}
                                  </p>
                                )}
                                {fullAddress && (
                                  <p>
                                    <b>Address:</b> {fullAddress}
                                  </p>
                                )}
                                {city_name && (
                                  <p>
                                    <b>City:</b> {city_name}
                                  </p>
                                )}
                                {district_name && (
                                  <p>
                                    <b>District:</b> {district_name}
                                  </p>
                                )}
                                {country_name && (
                                  <p>
                                    <b>Country:</b> {country_name}
                                  </p>
                                )}
                                <p>
                                  <b>
                                    {status === "updated"
                                      ? "Updated"
                                      : status === "active"
                                      ? "Updated"
                                      : status === "inactive"
                                      ? "Updated"
                                      : "Created"}{" "}
                                    At:
                                  </b>{" "}
                                  {formattedDate}
                                </p>
                              </div>
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
          {/* Modal for Deleting Researchers */}
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
            CSR Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body
          style={{ maxHeight: "500px", overflowY: "auto" }}
          className="bg-light rounded"
        >
          {selectedCSR ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ field, label }) => {
                  const value = selectedCSR[field];
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

export default CSRArea;
