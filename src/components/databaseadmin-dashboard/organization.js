import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faHistory,faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import {
  useRegisterUserMutation,
  useUpdateProfileMutation,
} from "src/redux/features/auth/authApi";
import Pagination from "@ui/Pagination";
import moment from "moment";
import { notifyError, notifySuccess } from "@utils/toast";
const OrganizationArea = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editOrganization, setEditOrganization] = useState(null); // State for selected organization to edit
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null); // Store ID of organization to delete
  const [allorganizations, setAllOrganizations] = useState([]); // State to hold fetched organizations
  const [organizations, setOrganizations] = useState([]); // State to hold fetched organizations
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    user_account_id: "",
    OrganizationName: "",
    email: "",
    password: "",
    phoneNumber: "",
    city: "",
    district: "",
    country: "",
    fullAddress: "",
    type: "",
    HECPMDCRegistrationNo: "",
    ntnNumber: "",
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
  const [registerUser, {}] = useRegisterUserMutation();
  const [updateUser, {}] = useUpdateProfileMutation();
  const columns = [
    //  { label: "ID", placeholder: "Search ID", field: "id" },
    { label: "Name", placeholder: "Search Name", field: "OrganizationName" },
    { label: "Email", placeholder: "Search Email", field: "useraccount_email" },
    {
      label: "Password",
      placeholder: "Search Password",
      field: "useraccount_password",
    },
    { label: "Contact", placeholder: "Search Contact", field: "phoneNumber" },

    { label: "Address", placeholder: "Search Address", field: "fullAddress" },
    { label: "City", placeholder: "Search City", field: "city" },
    { label: "District", placeholder: "Search District", field: "district" },
    { label: "Country", placeholder: "Search Country", field: "country" },
    {
      label: "HECPMDCRegistrationNo",
      placeholder: "Search HECPMDCRegistrationNo",
      field: "HECPMDCRegistrationNo",
    },
    {
      label: "NTN Number",
      placeholder: "Search NTN Number",
      field: "ntnNumber",
    },
    {
      label: "Type",
      placeholder: "Search Type",
      field: "type",
    },
    { label: "Created at", placeholder: "Search Date", field: "created_at" },
    { label: "Status", placeholder: "Search Status", field: "status" },
  ];


  const onSubmit = (event) => {
    console.log("formData before appending logo:", formData);
    event.preventDefault();

    const newformData = new FormData();

    // Append form fields
    newformData.append("email", formData.email);
    newformData.append("password", formData.password);
    newformData.append("accountType", "Organization");
    newformData.append("OrganizationName", formData.OrganizationName);
    newformData.append("phoneNumber", formData.phoneNumber);
    newformData.append("HECPMDCRegistrationNo", formData.HECPMDCRegistrationNo);
    newformData.append("ntnNumber", formData.ntnNumber);
    newformData.append("fullAddress", formData.fullAddress);
    newformData.append("city", formData.city);
    newformData.append("district", formData.district);
    newformData.append("country", formData.country);
    newformData.append("status", "inactive");
    newformData.append("type", formData.type);
    // Ensure logo is a file before appending
    if (formData.logo) {
      console.log("Appending logo:", formData.logo);
      newformData.append("logo", formData.logo);
    } else {
      console.log("No logo found in formData at submission.");
    }

    // Debug log to inspect FormData entries
    for (let pair of newformData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Call the mutation (assuming the function is available)
    registerUser(newformData)
      .then((result) => {
        if (result?.error) {
          const errorMessage = result?.error?.data?.error || "Register Failed";
          notifyError(errorMessage);
        } else {
          fetchOrganizations()
          notifySuccess("Organization Registered Successfully");
          setShowAddModal(false);
        }
      })
      .catch((error) => {
        notifyError(error?.message || "An unexpected error occurred");
      });

    // Reset state and form (if necessary)
    setShowAddModal(false);
    resetFormData();
  };

  const fetchHistory = async (filterType, id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/get-reg-history/${filterType}/${id}`
      );
      const data = await response.json();
      console.log("histor",data)
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
    fetchOrganizations(); // Call the function when the component mounts
    fetchcityname();
    fetchdistrictname();
    fetchcountryname();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get`
      );
      console.log(response.data)
      setAllOrganizations(response.data);
      setOrganizations(response.data); // Store fetched organizations in state
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  };
  const fetchcityname = async () => {
    try {
      const response = await axios.get(`${url}/city/get-city`);
      setcityname(response.data); // Store fetched City in state
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  const fetchdistrictname = async () => {
    try {
      const response = await axios.get(`${url}/district/get-district`);
      setdistrictname(response.data); // Store fetched District in state
    } catch (error) {
      console.error("Error fetching District:", error);
    }
  };
  const fetchcountryname = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`
      );
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setSearchTerm(value);

    if (!value) {
      setOrganizations(allorganizations);
    } else {
      const filtered = allorganizations.filter((organization) => {
        return organization[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase());
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
      email: organization.useraccount_email,
      password: organization.useraccount_password,
      city: organization.cityid,
      district: organization.districtid,
      country: organization.countryid,
      phoneNumber: organization.phoneNumber,
      fullAddress: organization.fullAddress,
      type: organization.type,
      HECPMDCRegistrationNo: organization.HECPMDCRegistrationNo,
      ntnNumber: organization.ntnNumber,
      logo: logodata,
      logoPreview: logoPreview, // ✅ use the correctly computed value
      status:organization.status
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const newformData = new FormData();
    newformData.append("useraccount_email", formData.email);
    newformData.append("useraccount_password", formData.password);
    newformData.append("accountType", "Organization");
    newformData.append("OrganizationName", formData.OrganizationName);
    newformData.append("phoneNumber", formData.phoneNumber);
    newformData.append("HECPMDCRegistrationNo", formData.HECPMDCRegistrationNo);
    newformData.append("ntnNumber", formData.ntnNumber);
    newformData.append("fullAddress", formData.fullAddress);
    newformData.append("city", formData.city);
    newformData.append("district", formData.district);
    newformData.append("country", formData.country);
    newformData.append("status", "inactive");
    newformData.append("type", formData.type);
    if (formData.logo) {
      newformData.append("logo", formData.logo);
    }

    // Debug
    for (let pair of newformData.entries()) {
      console.log(pair[0], pair[1]);
    }

    const id = formData.user_account_id;

    updateUser({ id, formData: newformData })
      .then((result) => {
        if (result?.error) {
          const errorMessage = result?.error?.data?.error || "Update Failed";
          notifyError(errorMessage);
        } else {
          notifySuccess("Update Organization Successfully");
          setShowEditModal(false);
        }
      })
      .catch((error) => {
        notifyError(error?.message || "An unexpected error occurred");
      });

    setShowEditModal(false);
    resetFormData();
  };
  const handleToggleStatusOptions = (id) => {
    setStatusOptionsVisibility((prev) => ({
      ...prev,
      [id]: !prev[id], // Toggle the visibility of the dropdown for the given id
    }));
  };


  // Handle status update
  const handleStatusClick = async (id, option) => {
    console.log(id,option)
    try {
      // Send status update request to backend
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/edit/${id}`,
         { status: option } , 
        { headers: { "Content-Type": "application/json" } }
      );
  
      // Assuming the response is successful, set success message and hide the dropdown
      setSuccessMessage(response.data.message);
  
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
  
      // Refresh the organization list
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
      OrganizationName: "",
      email: "",
      password: "",
      phoneNumber: "",
      city: "",
      district: "",
      country: "",
      fullAddress: "",
      type: "",
      HECPMDCRegistrationNo: "",
      ntnNumber: "",
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
                  <option value="pending">Pending</option>
                  <option value="inactive">InActive</option>
                  <option value="active">Active</option>
                </select>
              </div>

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
                <i className="fas fa-plus"></i> Add Organization
              </button>
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
        currentData.map((organization) => (
          <tr key={organization.id}>
            {columns.map(({ field }) => (
              <td key={field}>
                {field === "created_at"
                  ? moment(organization[field]).format("YYYY-MM-DD")
                  : organization[field]}
              </td>
            ))}
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
        onClick={() => handleToggleStatusOptions(organization.id)}
        title="Edit Status"
      >
        <FontAwesomeIcon icon={faQuestionCircle} size="xs" />
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
            onClick={() => handleStatusClick(organization.id, "active")}
          >
            Active
          </button>
          <button
            className="dropdown-item"
            onClick={() => handleStatusClick(organization.id, "inactive")}
          >
            InActive
          </button>
        </div>
      )}
    </div>

    <button
      className="btn btn-info btn-sm"
      onClick={() => handleShowHistory("organization", organization.id)}
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
            No organizations available
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
                              <img
                                src={formData.logoPreview}
                                alt="Logo Preview"
                                style={{
                                  maxHeight: "120px",
                                  objectFit: "contain",
                                  border: "2px solid black",
                                  borderRadius: "50%",
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
                          <label>ntnNumber</label>
                          <input
                            type="text"
                            className="form-control"
                            name="ntnNumber"
                            placeholder="Enter ntn Number"
                            value={formData.ntnNumber}
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
                            created_name,
                            updated_name,
                            OrganizationName,
                            added_by,
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
                              {(status === 'added' || status === 'active') && (
                              <div
                                style={{
                                  padding: "10px 15px",
                                  borderRadius: "15px",
                                  backgroundColor: "#ffffff",
                                  boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                  maxWidth: "75%",
                                  fontSize: "14px",
                                  textAlign: "left",
                                }}
                              >
                                <b>Organization:</b> {OrganizationName} was{" "}
                                <b>{status}</b> by Database Admin at{" "}
                                {moment(created_at).format(
                                  "DD MMM YYYY, h:mm A"
                                )}
                              </div>
                              )}
                              

                              {/* Message for City Update (Only if it exists) */}
                              {(status === 'updated' || status === 'inactive') && (
                                <div
                                  style={{
                                    padding: "10px 15px",
                                    borderRadius: "15px",
                                    backgroundColor: "#dcf8c6", // Light green for updates
                                    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
                                    maxWidth: "75%",
                                    fontSize: "14px",
                                    textAlign: "left",
                                    marginTop: "5px", // Spacing between messages
                                  }}
                                >
                                  <b>Organization:</b> {OrganizationName} was{" "}
                                  <b>{status}</b> by Database Admin at{" "}
                                  {moment(updated_at).format(
                                    "DD MMM YYYY, h:mm A"
                                  )}
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

export default OrganizationArea;
