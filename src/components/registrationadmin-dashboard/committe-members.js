import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faQuestionCircle,
  faPlus,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";

const CommitteeMemberArea = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  // const [showCommitteTypeOptions, setshowCommitteeTypeOptions] = useState(false);
  const [showCommitteeTypeOptions, setShowCommitteeTypeOptions] = useState({});
  const [statusOptionsVisibility, setStatusOptionsVisibility] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCommitteememberId, setSelectedCommitteememberId] =
    useState(null); // Store ID of Committee Members to delete
    const [formData, setFormData] = useState({
      CommitteeMemberName: "",
      email: "",
      password:"",
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
  const [formStep, setFormStep] = useState(1);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // Calculate total pages
  const totalPages = Math.ceil(committeemembers.length / itemsPerPage);

const url= `${process.env.NEXT_PUBLIC_API_BASE_URL}/api`


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
      const response = await axios.get(
        `${url}/committeemember/get`
      );
      setCommitteemembers(response.data); // Store fetched Committee Members in state
    } catch (error) {
      console.error("Error fetching Committee Members:", error);
    }
  };
  const fetchOrganization = async () => {
    try {
      const response = await axios.get(
        `${url}/admin/organization/get`
      );
      setOrganization(response.data); // Store fetched researchers in state
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };
  const fetchcityname = async () => {
    try {
      const response = await axios.get(
        `${url}/city/get-city`
      );
      setcityname(response.data); // Store fetched City in state
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  const fetchdistrictname = async () => {
    try {
      const response = await axios.get(
        `${url}/district/get-district`
      );
      setdistrictname(response.data); // Store fetched District in state
    } catch (error) {
      console.error("Error fetching District:", error);
    }
  };
  const fetchcountryname = async () => {
    fetchOrganization();
    try {
      const response = await axios.get(
        "http://localhost:5000/api/country/get-country"
      );
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };

  const handleInputChange = (e) => {
    console.log(organization)
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
      const newResponse = await axios.get(
        `${url}/committeemember/get`
      );
      setCommitteemembers(newResponse.data); // Update state with the new list

      // Clear form after submission
      setFormData({
        CommitteeMemberName: "",
        email: "",
        password:"",
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
      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error("Error adding Committee Member:", error);
    }
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
      const newResponse = await axios.get(
        `${url}/committeemember/get`
      );
      setCommitteemembers(newResponse.data);

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
      password:committeemember.password,    
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

      const newResponse = await axios.get(
        `${url}/committeemember/get`
      );
      setCommitteemembers(newResponse.data);

      setShowEditModal(false);
      setSuccessMessage("Committeemember updated successfully.");
      setFormData({
        CommitteeMemberName: "",
        email: "",
        password:"",
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

  const handleStatusClick = async (committeememberId, option) => {
    try {
      const response = await axios.put(
        `${url}/committeemember/status/edit/${committeememberId}`,
        { status: option }, // Only send the selected `status`
        { headers: { "Content-Type": "application/json" } }
      );
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
  const handleNextStep = () => {
    console.log("Current formData:", formData); // Debugging

    if (
      !formData.CommitteeMemberName || formData.CommitteeMemberName.trim() === '' ||
      !formData.email || formData.email.trim() === '' ||
      !formData.password || formData.password.trim() === '' ||
      !formData.phoneNumber || formData.phoneNumber.trim() === ''
    ) {
      console.log("Validation failed."); // Debugging
      alert("Please fill out all fields");
      return;
    }

    console.log("Validation passed. Moving to Step 2."); // Debugging
    setFormStep(2);
  };

  const currentData = committeemembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    if (value === "") {
      fetchCommitteemembers();
    } else {
      // Filter the researchers array based on the field and value
      const filtered = committeemembers.filter((committeemember) =>
        committeemember[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setCommitteemembers(filtered);
    }
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
    <section className="policy__area pb-120">
       <div
        className="container"
        style={{ marginTop: "-20px", width: "auto",}}
      >
        <div
          className="row justify-content-center"
          style={{ marginTop: "290px" }}
        >
          <div className="col-xl-10">
            <div className="policy__wrapper policy__translate p-relative z-index-1">
              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  {successMessage}
                </div>
              )}
              {/* Add Committee Members Button */}
              <div
                className="d-flex justify-content-end mb-3"
                style={{
                  marginBottom: "20px", // Adjust spacing between button and table
                 
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  Add committee members
                </button>
              </div>

              {/* Table */}
              <div
                className="table-responsive"
                style={{
                  margin: "0 auto", // Center-align the table horizontally
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search ID"
                          onChange={(e) =>
                            handleFilterChange("id", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        ID
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Name"
                          onChange={(e) =>
                            handleFilterChange(
                              "CommitteeMemberName",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Name
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Email"
                          onChange={(e) =>
                            handleFilterChange("email", e.target.value)
                          }
                        />
                        Email
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search password"
                          onChange={(e) =>
                            handleFilterChange(
                              "password",
                              e.target.value
                            )
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Password
                      </th>
                     
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Contact"
                          onChange={(e) =>
                            handleFilterChange("phoneNumber", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Contact
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search CNIC"
                          onChange={(e) =>
                            handleFilterChange("cnic", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        CNIC
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Full Address"
                          onChange={(e) =>
                            handleFilterChange("fullAddress", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Full Address
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search City"
                          onChange={(e) =>
                            handleFilterChange("city", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        City
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search District"
                          onChange={(e) =>
                            handleFilterChange("district", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        District
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Country"
                          onChange={(e) =>
                            handleFilterChange("country", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Country
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Organization"
                          onChange={(e) =>
                            handleFilterChange("organization", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Organization
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Committee Type"
                          onChange={(e) =>
                            handleFilterChange("committeetype", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Committee Type
                      </th>
                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Created At"
                          onChange={(e) =>
                            handleFilterChange("created_at", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Registered_at
                      </th>

                      <th
                        className="px-3"
                        style={{
                          verticalAlign: "middle",
                          textAlign: "center",
                          width: "200px",
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search status"
                          onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                          }
                          style={{
                            width: "80%", // Adjusted width for better responsiveness
                            padding: "8px",
                            boxSizing: "border-box",
                            minWidth: "120px", // Minimum width to prevent shrinking too much
                            maxWidth: "180px", // Maximum width for better control
                          }}
                        />
                        Status
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((committeemember) => (
                        <tr key={committeemember.id}>
                          <td>{committeemember.id}</td>
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
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-around",
                                gap: "5px",
                              }}
                            >
                              <button
                                className="btn btn-success btn-sm py-0 px-1"
                                onClick={() => handleEditClick(committeemember)}
                                title="Edit Committee Member" // This is the text that will appear on hover
                              >
                                <FontAwesomeIcon icon={faEdit} size="xs" />
                              </button>{" "}
                              <div className="btn-group">
                                <button
                                  className="btn btn-warning btn-sm py-0 px-1"
                                  onClick={() =>
                                    handleToggleCommitteeTypeOptions(
                                      committeemember.id
                                    )
                                  }
                                  title="Edit Committee Member Action (Scientific/Ethical)" // This is the text that will appear on hover
                                >
                                  <FontAwesomeIcon icon={faPlus} size="xs" />
                                </button>
                                {showCommitteeTypeOptions[
                                  committeemember.id
                                ] && (
                                  <div className="dropdown-menu show">
                                    <button
                                      className="dropdown-item"
                                      onClick={() => {
                                        handleCommitteeTypeClick(
                                          committeemember.id,
                                          "Scientific"
                                        );
                                      }}
                                    >
                                      Scientific
                                    </button>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => {
                                        handleCommitteeTypeClick(
                                          committeemember.id,
                                          "Ethical"
                                        );
                                      }}
                                    >
                                      Ethical
                                    </button>
                                  </div>
                                )}
                              </div>
                              {""}
                              <div className="btn-group">
                                <button
                                  className="btn btn-primary btn-sm py-0 px-1"
                                  onClick={() =>
                                    handleToggleStatusOptions(
                                      committeemember.id
                                    )
                                  }
                                  title="Edit Committee Member Action (Active/inActive)" // This is the text that will appear on hover
                                >
                                  <FontAwesomeIcon
                                    icon={faQuestionCircle}
                                    size="xs"
                                  />
                                </button>
                                {statusOptionsVisibility[
                                  committeemember.id
                                ] && (
                                  <div className="dropdown-menu show">
                                    <button
                                      className="dropdown-item"
                                      onClick={() => {
                                        handleStatusClick(
                                          committeemember.id,
                                          "Active"
                                        );
                                      }}
                                    >
                                      Active
                                    </button>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => {
                                        handleStatusClick(
                                          committeemember.id,
                                          "Inactive"
                                        );
                                      }}
                                    >
                                      Inactive
                                    </button>
                                  </div>
                                )}
                              </div>
                              {""}
                              <button
                                className="btn btn-danger btn-sm py-0 px-1"
                                onClick={() => {
                                  setSelectedCommitteememberId(
                                    committeemember.id
                                  );
                                  setShowDeleteModal(true);
                                }}
                                title="Delete Committee Member" // This is the text that will appear on hover
                              >
                                <FontAwesomeIcon icon={faTrash} size="sm" />
                              </button>
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => {
                                  setShowHistoryModal(true);
                                  console.log("Done");
                                }}
                                title="Committee Member History" // This is the text that will appear on hover
                              >
                                <FontAwesomeIcon icon={faHistory} size="sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">
                          No Committee Members Available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div
                className="pagination d-flex justify-content-center align-items-center mt-3"
                style={{
                  gap: "10px",
                }}
              >
                {/* Previous Button */}
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {/* Page Numbers with Ellipsis */}
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  // Show page number if it's the first, last, current, or adjacent to current
                  if (
                    pageNumber === 1 || // Always show the first page
                    pageNumber === totalPages || // Always show the last page
                    pageNumber === currentPage || // Show current page
                    pageNumber === currentPage - 1 || // Show previous page
                    pageNumber === currentPage + 1 // Show next page
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className={`btn btn-sm ${
                          currentPage === pageNumber
                            ? "btn-primary"
                            : "btn-outline-secondary"
                        }`}
                        onClick={() => handlePageChange(pageNumber)}
                        style={{
                          minWidth: "40px",
                        }}
                      >
                        {pageNumber}
                      </button>
                    );
                  }

                  // Add ellipsis if previous number wasn't shown
                  if (
                    (pageNumber === 2 && currentPage > 3) || // Ellipsis after the first page
                    (pageNumber === totalPages - 1 &&
                      currentPage < totalPages - 2) // Ellipsis before the last page
                  ) {
                    return (
                      <span
                        key={`ellipsis-${pageNumber}`}
                        style={{
                          minWidth: "40px",
                          textAlign: "center",
                        }}
                      >
                        ...
                      </span>
                    );
                  }

                  return null; // Skip the page number
                })}

                {/* Next Button */}
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>


              {/* Modal for Adding Committee members */}
              {showAddModal && (
          <>
              <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

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
                        <h5 className="modal-title">Add Committee Member</h5>
                        <button
                          type="button"
                          // className="close"
                          onClick={() => setShowAddModal(false)}
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
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                          {/* Form Step Logic */}
                          {formStep === 1 ? (
                            <>
                              {/* Step 1: Basic Information */}
                              <div className="form-group">
                                <label>Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CommitteeMemberName"
                                  value={formData.CommitteeMemberName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Email</label>
                                <input
                                  type="email"
                                  className="form-control"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Password</label>
                                <input
                                  type="password"
                                  className="form-control"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleInputChange}
                                  required
                                />
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
                                />
                              </div>
                              <div className="modal-footer">
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={handleNextStep}
                                >
                                  Next
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Step 2: Additional Information */}
                              <div className="form-group">
                                <label>CNIC</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="cnic"
                                  value={formData.cnic}
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
                                  value={formData.fullAddress}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                            <label>City</label>
                            <select
                              className="form-control"
                              name="city"
                              value={formData.city} // Store the selected city ID in formData
                              onChange={handleInputChange} // Handle change to update formData
                              required
                            >
                              <option value="" disabled>
                                Select City
                              </option>{" "}
                              {/* Default option */}
                              {cityname.map((city) => (
                                <option key={city.id} value={city.id}>
                                  {city.name} {/* Display the city name */}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>District</label>
                            <select
                              className="form-control"
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
                              className="form-control"
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
                              className="form-control"
                              name="organization"
                              value={formData.organization}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="" disabled>
                                Select Organization
                              </option>
                              {organization.map((organization) => (
                                <option key={organization.id} value={organization.id}>
                                  {organization.OrganizationName}
                                </option>
                              ))}
                            </select>
                          </div>
                            </>
                          )}
                        </div>
                        <div className="modal-footer">
                          {formStep === 2 && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setFormStep(1)}
                            >
                              Back
                            </button>
                          )}
                          {formStep === 2 ? (
                            <button type="submit" className="btn btn-primary">
                              Save
                            </button>
                          ) : null}
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                </>
              )}

              {/* Edit Committemember Modal */}
              {showEditModal && (
                <>
         <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

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
                        <h5 className="modal-title">Edit Committee Member</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowEditModal(false)}
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
                      <form onSubmit={handleUpdate}>
                        <div className="modal-body">
                          {formStep === 1 ? (
                            <>
                              {/* Step 1: Basic Information */}
                              <div className="form-group">
                                <label>Committee Member Name</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="CommitteeMemberName"
                                  value={formData.CommitteeMemberName}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Email</label>
                                <input
                                  type="email"
                                  className="form-control"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                                <label>Password</label>
                                <input
                                  type="password"
                                  className="form-control"
                                  name="password"
                                  value={formData.password}
                                  onChange={handleInputChange}
                                  required
                                />
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
                                />
                              </div>
                              <div className="modal-footer">
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={handleNextStep}
                                >
                                  Next
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Step 2: Additional Information */}
                             
                              <div className="form-group">
                                <label>CNIC</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="cnic"
                                  value={formData.cnic}
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
                                  value={formData.fullAddress}
                                  onChange={handleInputChange}
                                  required
                                />
                              </div>
                              <div className="form-group">
                            <label>City</label>
                            <select
                              className="form-control"
                              name="city"
                              value={formData.city} // Store the selected city ID in formData
                              onChange={handleInputChange} // Handle change to update formData
                              required
                            >
                              <option value="" disabled>
                                Select City
                              </option>{" "}
                              {/* Default option */}
                              {cityname.map((city) => (
                                <option key={city.id} value={city.id}>
                                  {city.name} {/* Display the city name */}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>District</label>
                            <select
                              className="form-control"
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
                              className="form-control"
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
                              className="form-control"
                              name="organization"
                              value={formData.organization}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="" disabled>
                                Select Organization
                              </option>
                              {organization.map((organization) => (
                                <option key={organization.id} value={organization.id}>
                                  {organization.OrganizationName}
                                </option>
                              ))}
                            </select>
                          </div>
                            </>
                          )}
                        </div>
                        <div className="modal-footer">
                          {formStep === 2 && (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setFormStep(1)}
                            >
                              Back
                            </button>
                          )}
                          {formStep === 2 ? (
                            <button type="submit" className="btn btn-primary">
                              Update Committee Member
                            </button>
                          ) : null}
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
              <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

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
                        <button
                          className="btn btn-danger"
                          onClick={handleDelete}
                        >
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
                <div
                  className="modal show d-block"
                  tabIndex="-1"
                  role="dialog"
                  style={{
                    zIndex: 1050, // Ensure it's above the header
                    position: "fixed",
                    top: "120px",
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">
                          History Committee Member
                        </h5>
                      </div>
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
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommitteeMemberArea;