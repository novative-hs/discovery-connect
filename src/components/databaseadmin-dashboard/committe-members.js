import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faPlus,
  faHistory,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import moment from "moment";
const CommitteeMemberArea = () => {
  const [historyData, setHistoryData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // const [showCommitteTypeOptions, setshowCommitteeTypeOptions] = useState(false);
  const [showCommitteeTypeOptions, setShowCommitteeTypeOptions] = useState({});
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommitteememberId, setSelectedCommitteememberId] =
    useState(null); // Store ID of Committee Members to delete
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
  const itemsPerPage = 5;
  // Calculate total pages
  const columns = [
    //  { label: "ID", placeholder: "Search ID", field: "id" },
    { label: "Name", placeholder: "Search Name", field: "CommitteeMemberName" },
    { label: "Email", placeholder: "Search Email", field: "email" },
    { label: "Password", placeholder: "Search Password", field: "password" },
    { label: "Contact", placeholder: "Search Contact", field: "phoneNumber" },
    { label: "CNIC", placeholder: "Search CNIC", field: "cnic" },
    { label: "Address", placeholder: "Search Address", field: "fullAddress" },
    { label: "City", placeholder: "Search City", field: "city" },
    { label: "District", placeholder: "Search District", field: "district" },
    { label: "Country", placeholder: "Search Country", field: "country" },
    { label: "Org", placeholder: "Search Org", field: "organization" },
    {
      label: "Committee",
      placeholder: "Search Committee",
      field: "committeetype",
    },
    { label: "Registered", placeholder: "Search Date", field: "created_at" },
    { label: "Status", placeholder: "Search Status", field: "status" },
  ];

  const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`;

  // Fetch Committee Members from backend when component loads
  useEffect(() => {
    fetchCommitteemembers(); // Call the function when the component mounts
    fetchcityname();
    fetchdistrictname();
    fetchcountryname();
    fetchOrganization();
  }, []);

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
  }, [filteredCommitteemembers]);

  const fetchOrganization = async () => {
    try {
      const response = await axios.get(`${url}/admin/organization/get`);

      // ✅ Filter only approved organizations
      const approvedOrganizations = response.data.filter(
        (org) => org.status === "approved"
      );

      setOrganization(approvedOrganizations); // Store only approved organizations in state
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
    fetchOrganization();
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`
      );
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };

  const handleInputChange = (e) => {
    console.log(organization);
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
      console.log("Committee Member added successfully:", response.data);
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
  const handleShowHistory = (filterType, id) => {
    fetchHistory(filterType, id);
    setShowHistoryModal(true);
  };
  const handleDelete = async () => {
    try {
      // Send delete request to backend
      await axios.delete(
        `${url}/committeemember/delete/${selectedCommitteememberId}`
      );
      console.log(
        `Committeemember with ID ${selectedCommitteememberId} deleted successfully.`
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
      console.log("Committeemember updated successfully:", response.data);

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
      console.log("Update successful:", response.data.message);
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
      console.log("Update successful:", response.data.message);
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
        committeemember[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase())
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

  return (
    <section className="policy__area pb-40 overflow-hidden p-4">
      <div className="container">
        <div className="row justify-content-center">
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
            <div className="d-flex justify-content-end align-items-center gap-2 w-100">
              <button
                className="btn btn-primary mb-2"
                onClick={() => setShowAddModal(true)}
              >
                Add Committee Member
              </button>
            </div>
          </div>
          {/* Table */}
          <div className="table-responsive w-100">
            <table className="table table-hover table-bordered text-center align-middle w-auto border">
              <thead className="table-primary text-dark">
                <tr className="text-center">
                  {columns.map(({ label, field, placeholder }) => (
                    <th key={label} className="px-4 py-2">
                      <input
                        type="text"
                        className="form-control  w-100"
                        placeholder={placeholder}
                        style={{ minWidth: "160px" }} // Ensures visibility and alignment
                        onChange={(e) =>
                          handleFilterChange(field, e.target.value)
                        }
                      />
                      <div className="fw-bold mt-1">{label}</div>{" "}
                      {/* Keeps label below input */}
                    </th>
                  ))}
                  <th className="col-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((committeemember) => (
                    <tr key={committeemember.id}>
                      {/* <td>{committeemember.id}</td> */}
                      <td>{committeemember.CommitteeMemberName}</td>
                      <td>{committeemember.email}</td>
                      <td>{committeemember.password}</td>
                      <td>{committeemember.phoneNumber}</td>
                      <td>{committeemember.cnic}</td>
                      <td>{committeemember.fullAddress}</td>
                      <td>{committeemember.city_name}</td>
                      <td>{committeemember.district_name}</td>
                      <td>{committeemember.country_name}</td>
                      <td>{committeemember.organization_name}</td>
                      <td>{committeemember.committeetype}</td>
                      <td>{formatDate(committeemember.created_at)}</td>
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

                          <div className="btn-group">
                            <button
                              className="btn btn-warning btn-sm py-0 px-1"
                              onClick={() =>
                                handleToggleCommitteeTypeOptions(
                                  committeemember.id
                                )
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
                                    handleCommitteeTypeClick(
                                      committeemember.id,
                                      "Scientific"
                                    )
                                  }
                                >
                                  Scientific
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleCommitteeTypeClick(
                                      committeemember.id,
                                      "Ethical"
                                    )
                                  }
                                >
                                  Ethical
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="btn-group">
                            <button
                              className="btn btn-primary btn-sm py-0 px-1"
                              onClick={() =>
                                handleToggleStatusOptions(committeemember.id)
                              }
                              title="Edit Status"
                            >
                              <FontAwesomeIcon
                                icon={faQuestionCircle}
                                size="xs"
                              />
                            </button>
                            {statusOptionsVisibility[committeemember.id] && (
                              <div className="dropdown-menu show">
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusClick(
                                      committeemember.id,
                                      "Active"
                                    )
                                  }
                                >
                                  Active
                                </button>
                                <button
                                  className="dropdown-item"
                                  onClick={() =>
                                    handleStatusClick(
                                      committeemember.id,
                                      "Inactive"
                                    )
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
                            placeholder="0123-4567890"
                            title="Phone number must be in the format 0123-4567890 and numeric"
                          />
                        </div>

                        <div className="form-group">
                          <label>CNIC</label>
                          <input
                            type="text"
                            className="form-control"
                            name="cnic"
                            placeholder="Enter CNIC"
                            value={formData.cnic}
                            onChange={handleInputChange}
                            pattern="^\d{5}-\d{7}-\d{1}$"
                            title="CNIC must be in the format XXXXX-XXXXXXX-X ."
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
                            CommitteeMemberName,
                            phoneNumber,
                            cnic,
                            fullAddress,
                            city,
                            district,
                            country,
                            created_at,
                            updated_at,
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
                              {/* Message for Committee Member Addition */}
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
                                <b>Committee Member:</b> {CommitteeMemberName}{" "}
                                was <b>added</b> by Registration Admin at{" "}
                                {moment(created_at).format(
                                  "DD MMM YYYY, h:mm A"
                                )}
                                <br />
                                {cnic && (
                                  <span>
                                    <b>CNIC:</b> {cnic} <br />
                                  </span>
                                )}
                                {phoneNumber && (
                                  <span>
                                    <b>Phone:</b> {phoneNumber} <br />
                                  </span>
                                )}
                                {fullAddress && (
                                  <span>
                                    <b>Address:</b> {fullAddress} <br />
                                  </span>
                                )}
                              </div>

                              {/* Message for Committee Member Update */}
                              {updated_at && (
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
                                  <b>Committee Member:</b> {CommitteeMemberName}{" "}
                                  was <b>updated</b> by Registration Admin at{" "}
                                  {moment(updated_at).format(
                                    "DD MMM YYYY, h:mm A"
                                  )}
                                  <br />
                                  {cnic && (
                                    <span>
                                      <b>CNIC:</b> {cnic} <br />
                                    </span>
                                  )}
                                  {phoneNumber && (
                                    <span>
                                      <b>Phone:</b> {phoneNumber} <br />
                                    </span>
                                  )}
                                  {fullAddress && (
                                    <span>
                                      <b>Address:</b> {fullAddress}, {city},{" "}
                                      {district}, {country} <br />
                                    </span>
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

export default CommitteeMemberArea;
