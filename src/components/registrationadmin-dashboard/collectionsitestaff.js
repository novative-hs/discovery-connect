import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faHistory, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import {
  useRegisterUserMutation,
  useUpdateProfileMutation,
} from "src/redux/features/auth/authApi";
import Pagination from "@ui/Pagination";
import moment from "moment";
import Modal from "react-bootstrap/Modal";
import * as XLSX from "xlsx"
import { notifyError, notifySuccess } from "@utils/toast";
const CollectionSiteStaffArea = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCollectionSite, setSelectedCollectionSite] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [filteredCollectionsitesstaff, setFilteredCollectionsitesstaff] = useState([]);
  const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editCollectionsitestaff, setEditCollectionsiteStaff] = useState(null); // State for selected Collectionsite to edit
  const [selectedCollectionsiteStaffId, setSelectedCollectionSiteStaffId] = useState(null); // Store ID of Collectionsite to delete
  const [collectionsites, setCollectionsites] = useState([]); // State to hold fetched collectionsites
  const [allcollectionsitesstaff, setAllCollectionsitesstaff] = useState([]); // State to hold fetched collectionsites
  const [collectionsitesstaff, setCollectionsitesstaff] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    collectionsitesid: "",
    staffName: "",
    email: "",
    password: "",
    permission: "all",
    created_at: "",
    status: "inactive",
  });

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
  // const [registerUser, { }] = useRegisterUserMutation();
  const [updateUser, { }] = useUpdateProfileMutation();
  const columns = [
    //  { label: "ID", placeholder: "Search ID", field: "id" },
    { label: "Name", placeholder: "Search Name", field: "staffName" },

    { label: "Email", placeholder: "Search Email", field: "useraccount_email" },
    {
      label: "Password",
      placeholder: "Search Password",
      field: "useraccount_password",
    },
    { label: "Permission", placeholder: "Search permission", field: "permission" },
    { label: "Status", placeholder: "Search Status", field: "status" },
    { label: "Created at", placeholder: "Search Date", field: "created_at" },


  ];
  const fieldsToShowInOrder = [

    { label: "Collectionsite Name", placeholder: "Search Collection site Name", field: "collectionsite_name" },
    { label: "Updated at", placeholder: "Search Date", field: "updated_at" },
  ];
  const openModal = (sample) => {

    setSelectedCollectionSite(sample);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCollectionSite(null);
    setShowModal(false);
  };
  const baseStyle = {
    padding: "10px 15px",
    borderRadius: "15px",
    backgroundColor: "#ffffff",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
    maxWidth: "75%",
    fontSize: "14px",
    textAlign: "left",
  };

  useEffect(() => {
    fetchCollectionsites(); // Call the function when the component mounts
    fetchCollectionsiteStaff();

  }, []);

  const fetchCollectionsiteStaff = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsitestaff/get`
      );
      console.log(response.data)
      setAllCollectionsitesstaff(response.data);
      setCollectionsitesstaff(response.data); // Store fetched collectionsites in state
    } catch (error) {
      console.error("Error fetching collectionsites:", error);
    }
  };

  const fetchCollectionsites = async () => {
    try {

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsite/getCSinRA`);
      console.log("collection", response.data)
      setCollectionsites(response.data);
    } catch (error) {
      console.error("Error fetching collectionsites:", error);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    // Log form data to ensure it's structured correctly
    console.log("Form Data to Submit:", formData);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsitestaff/createcollectionsitestaff`,
        formData,
      );

      notifySuccess("Collection Site Staff Registered Successfully");
      fetchCollectionsiteStaff(); // Refresh list
      setShowAddModal(false);
      resetFormData();
    } catch (error) {
      console.error("Registration Error:", error);
      const errMsg =
        error.response?.data?.error || error.message || "An error occurred";
      notifyError(errMsg);
    }
  };


  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-reg-history/${filterType}/${id}`
      );
      const data = await response.json();
      console.log("data", data)
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

  const handleFilterChange = (field, value) => {
    setSearchTerm(value);

    if (!value) {
      setCollectionsitesstaff(allcollectionsitesstaff); // ✅ restore full list
    } else {
      const filtered = allcollectionsitesstaff.filter((collectionsite) => {
        return collectionsite[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
      });
      setCollectionsitesstaff(filtered);
    }

    setCurrentPage(0); // Reset to first page when filtering
  };

  useEffect(() => {
    const updatedFilteredCollectionsitestaff = collectionsitesstaff.filter((collectionsite) => {
      if (!statusFilter) return true;
      return collectionsite.status.toLowerCase() === statusFilter.toLowerCase();
    });

    setFilteredCollectionsitesstaff(updatedFilteredCollectionsitestaff);
    setCurrentPage(0); // Reset to first page when filtering
  }, [collectionsitesstaff, statusFilter]);



  const currentData = filteredCollectionsitesstaff.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleEditClick = (collectionsitestaff) => {

    setSelectedCollectionSiteStaffId(collectionsitestaff.id);
    setEditCollectionsiteStaff(collectionsitestaff);
    setShowEditModal(true);

    setFormData({
      user_account_id: collectionsitestaff.user_account_id,
      collectionsitesid: collectionsitestaff.collectionsite_id,
      staffName: collectionsitestaff.staffName,
      email: collectionsitestaff.useraccount_email,
      password: collectionsitestaff.useraccount_password,
      permission: collectionsitestaff.permission,
      status: collectionsitestaff.status
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsitestaff/updatedetail/${selectedCollectionsiteStaffId}`,
        formData,
      );

      notifySuccess("Collection Site Staff Updated Successfully");
      fetchCollectionsiteStaff();
      setSelectedCollectionSiteStaffId("");
      setEditCollectionsiteStaff("");
      setShowEditModal(false);
      resetFormData();
    } catch (error) {
      console.error("Updation Error:", error);
      const errMsg =
        error.response?.data?.error || error.message || "An error occurred";
      notifyError(errMsg);
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
    console.log(id, option)
    try {
      // Send status update request to backend
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsitestaff/edit/${id}`,
        { data: { status: option } },
        { headers: { "Content-Type": "application/json" } }
      );

      // Assuming the response is successful, set success message and hide the dropdown
      setSuccessMessage(response.data.message);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh the collectionsite list
      fetchCollectionsiteStaff();

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
    if (showAddModal || showDeleteModal || showEditModal || showHistoryModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showAddModal || showDeleteModal, showEditModal, showHistoryModal]);

  const resetFormData = () => {
    setFormData({

      collectionsitesid: "",
      staffName: "",
      email: "",
      password: "",
      status: "inactive",
      permission: "add"
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
        if (dropdown && buttonGroup && !dropdown.contains(event.target) && !buttonGroup.contains(event.target)) {
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
    const dataToExport = filteredCollectionsitesstaff.map((item) => ({
      Email: item.useraccount_email ?? "",
      Password: item.useraccount_password ?? "",
      CollectionsiteName: item.collectionsite_name ?? "",
      StaffName: item.staffName ?? "",
      Permission: item.permission ?? "",
      Status: item.status ?? "",
      "Created At": item.created_at ? formatDate(item.created_at) : "",
      "Updated At": item.updated_at ? formatDate(item.updated_at) : "",
    }));

    const headers = [
      "Email",
      "Password",
      "CollectionsiteName",
      "StaffName",
      "Permission",
      "Status",
      "Created At",
      "Updated At",
    ];

    if (dataToExport.length === 0) {
      dataToExport.push(Object.fromEntries(headers.map((key) => [key, ""])));
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CollectionsiteStaff");
    XLSX.writeFile(workbook, "Collectionsite_Staff_List.xlsx");
  };



  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
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

        <h5 className="m-0 fw-bold">Collection Site's Staff List</h5>

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
          <div className="d-flex flex-wrap gap-3 align-items-center">
            {/* Add collection site Button */}
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
              <i className="fas fa-plus"></i> Add Staff
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
                      onChange={(e) => handleFilterChange(field, e.target.value)}
                      style={{ minWidth: "150px", maxWidth: "200px", width: "100px" }}
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
              currentData.map((collectionsitestaff) => (
                <tr key={collectionsitestaff.id}>
                  {columns.map(({ field }) => (

                    <td
                      key={field}
                      className={
                        field === "staffName"
                          ? "text-start text-wrap"
                          : "text-center text-truncate"
                      }
                      style={{ maxWidth: "150px" }}
                    >
                      {field === "staffName" ? (
                        <span
                          className="staffName text-primary fw-semibold fs-6 text-decoration-underline"
                          role="button"
                          title="Collection Site Details"
                          onClick={() => openModal(collectionsitestaff)}
                          style={{
                            cursor: "pointer",
                            transition: "color 0.2s",
                          }}
                          onMouseOver={(e) => (e.target.style.color = "#0a58ca")}
                          onMouseOut={(e) => (e.target.style.color = "")}
                        >
                          {collectionsitestaff[field] || "----"}
                        </span>
                      ) : field === "created_at" || field === "updated_at" ? (
                        moment(collectionsitestaff[field]).format("YYYY-MM-DD")
                      ) : (
                        collectionsitestaff[field] || "----"
                      )}
                    </td>

                  ))}
                  <td className="position-relative">
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleEditClick(collectionsitestaff)}
                        title="Edit"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <div className="btn-group">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleToggleStatusOptions(collectionsitestaff.id)}
                          title="Edit Status"
                        >
                          <FontAwesomeIcon icon={faQuestionCircle} size="xs" />
                        </button>

                        {statusOptionsVisibility[collectionsitestaff.id] && (
                          <div
                            className="dropdown-menu show"
                            data-id={collectionsitestaff.id}
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
                              onClick={() => handleStatusClick(collectionsitestaff.id, "active")}
                            >
                              Active
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => handleStatusClick(collectionsitestaff.id, "inactive")}
                            >
                              InActive
                            </button>
                          </div>
                        )}
                      </div>

                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleShowHistory("collectionsitestaff", collectionsitestaff.id)}
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
                  No collectionsites staff available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {filteredCollectionsitesstaff.length >= 0 && (
        <Pagination
          handlePageClick={handlePageChange}
          pageCount={Math.max(
            1,
            Math.ceil(filteredCollectionsitesstaff.length / itemsPerPage)
          )}
          focusPage={currentPage}
        />
      )}
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
                      ? "Add Staff "
                      : "Edit Staff"}
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
                      <label>Unique Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter Email"
                        autocomplete="email"
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
                          autocomplete="new-password" // ✅ Add this line
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
                      <label>Staff Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Name"
                        name="staffName"
                        value={formData.staffName}
                        onChange={handleInputChange}
                        pattern="^[A-Za-z\s]+$"
                        title="Only letters and spaces are allowed."
                        required
                      />
                      {!/^[A-Za-z\s]*$/.test(formData.staffName) && (
                        <small className="text-danger">
                          Only letters and spaces are allowed.
                        </small>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Collectionsite</label>
                      <select
                        className="form-control p-2"
                        name="collectionsitesid"
                        value={formData.collectionsitesid} // Store the selected city ID in formData
                        onChange={handleInputChange} // Handle change to update formData
                        required
                      >
                        <option value="" disabled>
                          Select Collectionsites
                        </option>
                        {collectionsites.map((collectionsites) => (
                          <option key={collectionsites.id} value={collectionsites.id}>
                            {collectionsites.name}
                          </option>
                        ))}
                      </select>
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
                        <option value="all">All Pages Access</option>
                        <option value="add_full">Permission to Add Sample with Full Detail</option>
                        <option value="add_basic">Permission to Add Sample with Basic Detail</option>
                        <option value="edit">Permission to Edit Sample</option>
                        <option value="dispatch">Permission to Dispatch Sample</option>
                        <option value="receive">Permission to Receive Sample</option>
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
                        staffName,
                        permission,
                        created_at,
                        updated_at,
                        status
                      } = log;

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
                          {/* Message for City Addition */}
                          {status === 'added' && (
                            <div style={baseStyle}>
                              <b>Collectionsite staff:</b> {staffName} was <b>added</b> and <b>{permission}</b> by Registration Admin at{" "}
                              {created_at ? moment(created_at).format("DD MMM YYYY, h:mm A") : "Unknown Date"}
                            </div>
                          )}

                          {status === 'updated' && (
                            <div style={{ ...baseStyle, backgroundColor: "#dcf8c6", marginTop: "5px" }}>
                              <b>Collectionsite staff:</b> {staffName} was <b>updated</b> and <b>{permission}</b> by Registration Admin at{" "}
                              {updated_at ? moment(updated_at).format("DD MMM YYYY, h:mm A") : "Unknown Date"}
                            </div>
                          )}

                          {status === 'active' && (
                            <div style={baseStyle}>
                              <b>Collectionsite staff:</b> {staffName} is <b>{status}</b> with <b>{permission}</b> permission as of{" "}
                              {created_at ? moment(created_at).format("DD MMM YYYY, h:mm A") : "Unknown Date"}
                            </div>
                          )}

                          {status === 'inactive' && (
                            <div style={baseStyle}>
                              <b>Collectionsite staff:</b> {staffName} was marked <b>{status}</b> and <b>{permission}</b> by Registration Admin at{" "}
                              {created_at ? moment(created_at).format("DD MMM YYYY, h:mm A") : "Unknown Date"}
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



      <Modal show={showModal}
        onHide={closeModal}
        size="lg"
        centered
        backdrop="static"
        keyboard={false}>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger"> CollectionSite Staff Details</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "500px", overflowY: "auto" }} className="bg-light rounded">
          {selectedCollectionSite ? (
            <div className="p-3">
              <div className="row g-3">
                {fieldsToShowInOrder.map(({ field, label }) => {
                  const value = selectedCollectionSite[field];
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

export default CollectionSiteStaffArea;