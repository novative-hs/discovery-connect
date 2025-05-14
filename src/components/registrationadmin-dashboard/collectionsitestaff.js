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
import * as XLSX  from "xlsx"
import { notifyError, notifySuccess } from "@utils/toast";
const CollectionSiteStaffArea = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

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
    action:"add",
    created_at: "",
    status: "inactive",
  });
  const [historyData, setHistoryData] = useState([]);
  const [filteredCollectionsitesstaff, setFilteredCollectionsitesstaff] = useState([]);
  const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  
  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;
  // const [registerUser, { }] = useRegisterUserMutation();
  const [updateUser, { }] = useUpdateProfileMutation();
  const columns = [
    //  { label: "ID", placeholder: "Search ID", field: "id" },
    { label: "Name", placeholder: "Search Name", field: "staffName" },
    { label: "Collectionsite Name", placeholder: "Search Collection site Name", field: "collectionsite_name" },
    
    { label: "Email", placeholder: "Search Email", field: "useraccount_email" },
    {
      label: "Password",
      placeholder: "Search Password",
      field: "useraccount_password",
    },
    { label: "Action", placeholder: "Search Acton", field: "action" },
    { label: "Status", placeholder: "Search Status", field: "status" },
     { label: "Created at", placeholder: "Search Date", field: "created_at" },
    { label: "Updated at", placeholder: "Search Date", field: "updated_at" },
    
  ];
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
      
        const response = await axios.get(`${url}/admin/csr/getCollectionsiteName`);
      console.log(response.data)
      setCollectionsites(response.data); // Store fetched collectionsites in state
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
      console.log("data",data)
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
      setAllCollectionsitesstaff(allcollectionsitesstaff);
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

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const currentData = filteredCollectionsitesstaff.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

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
      staffName:collectionsitestaff.staffName,
      email: collectionsitestaff.useraccount_email,
      password: collectionsitestaff.useraccount_password,
     action:collectionsitestaff.action,
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
      action:"add"
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
  const dataToExport = filteredCollectionsitesstaff.map((item) => {
    // Convert buffer to base64 string if available
   
    return {
      Email: item.useraccount_email,
      Password: item.useraccount_password,
    CollectionsiteName:item.collectionsite_name,
     StaffName:item.staffName,
     Action:item.action,
      Status: item.status, 
      "Created At": formatDate(item.created_at),
      "Updated At": formatDate(item.updated_at),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Collectionsitestaff");

  XLSX.writeFile(workbook, "Collectionsite Staff_List.xlsx");
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

            <h5 className="m-0 fw-bold">Collection Site Staff List</h5>

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
                <i className="fas fa-plus"></i> Add Collection Site Staff
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
                    <th key={field} style={{ minWidth: "180px" }}>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={placeholder}
                        onChange={(e) => handleFilterChange(field, e.target.value)}
                      />
                      <div className="fw-bold mt-1">{label}</div>
                    </th>
                  ))}
                  <th style={{ minWidth: "120px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((collectionsitestaff) => (
                    <tr key={collectionsitestaff.id}>
                      {columns.map(({ field }) => (
                        <td key={field}>
                            {(field === "created_at" || field === "updated_at")
                            ? moment(collectionsitestaff[field]).format("YYYY-MM-DD")
                            : collectionsitestaff[field]}
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
                          ? "Add Collection Site"
                          : "Edit Collection Site"}
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
                          <label>Email</label>
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
                                {collectionsites.CollectionSiteName}
                              </option>
                            ))}
                          </select>
                        </div>
                       <div className="form-group">
  <label>Action</label>
  <select
    className="form-control p-2"
    name="action"
    value={formData.action}
    onChange={handleInputChange}
    required
  >
    <option value="">Select Action</option>
    <option value="add">Add Sample Permission</option>
    <option value="edit">Edit Sample Permission</option>
    <option value="dispatch">Dispatch Sample Permission</option>
    <option value="receive">Receive Sample Permission</option>
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
                            action,
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
    <b>Collectionsite staff:</b> {staffName} was <b>added</b> and <b>{action}</b> by Registration Admin at{" "}
    {created_at ? moment(created_at).format("DD MMM YYYY, h:mm A") : "Unknown Date"}
  </div>
)}

{status === 'updated' && (
  <div style={{ ...baseStyle, backgroundColor: "#dcf8c6", marginTop: "5px" }}>
    <b>Collectionsite staff:</b> {staffName} was <b>updated</b> and <b>{action}</b> by Registration Admin at{" "}
    {updated_at ? moment(updated_at).format("DD MMM YYYY, h:mm A") : "Unknown Date"}
  </div>
)}

{status === 'active' && (
  <div style={baseStyle}>
    <b>Collectionsite staff:</b> {staffName} is <b>active</b> with <b>{action}</b> permission as of{" "}
    {created_at ? moment(created_at).format("DD MMM YYYY, h:mm A") : "Unknown Date"}
  </div>
)}

{status === 'inactive' && (
  <div style={baseStyle}>
    <b>Collectionsite staff:</b> {staffName} was marked <b>inactive</b> and <b>{action}</b> by Registration Admin at{" "}
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

        </div>
      </div>
    </section>
  );
};

export default CollectionSiteStaffArea;
