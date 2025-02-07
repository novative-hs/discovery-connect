import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faHistory } from "@fortawesome/free-solid-svg-icons";
import { notifyError } from "@utils/toast";

const ResearcherArea = () => {
  const id = localStorage.getItem("userID");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedResearcherStatus, setSelectedResearcherStatus] =
    useState(null);
  const [selectedResearcherId, setSelectedResearcherId] = useState(null); // Store ID of researcher to delete
  const [formData, setFormData] = useState({
    user_account_id: "",
    useraccount_email: "",
    userID: "",
    ResearcherName: "",
    phoneNumber: "",
    nameofOrganization: "",
    fullAddress: "",
    city: "",
    district: "",
    country: "",
    email: "",
    password: "",
    accountType: "Researcher",
    logo: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [editResearcher, setEditResearcher] = useState(null); // State for selected researcher to edit
  const [researchers, setResearchers] = useState([]); // State to hold fetched researchers
  const [successMessage, setSuccessMessage] = useState("");
  const [cityname, setcityname] = useState([]);
  const [districtname, setdistrictname] = useState([]);
  const [countryname, setCountryname] = useState([]);
  const [organization, setOrganization] = useState();
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [orgid, setorgId] = useState();
  // Calculate total pages
  const totalPages = Math.ceil(researchers.length / itemsPerPage);
  const [logoFile, setLogoFile] = useState(null);

  // Fetch researchers from backend when component loads
  useEffect(() => {
    if (id === null) {
      return <div>Loading...</div>; // Or redirect to login
    } else {
      fetchcityname();
      fetchdistrictname();
      fetchcountryname();
      fetchOrganization();
      console.log("account_id on city page is:", id);
    }
  }, []);
  const fetchResearcher = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/researcher/get/${orgid}`
      );
      setResearchers(response.data); // Store fetched researchers in state
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };
  const fetchOrganization = async () => {
    try {
      const response = await axios.get(
       `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/organization/get/${id}`
      );
      setOrganization(response.data[0]);
      setorgId(response.data[0].id); // Store fetched researchers in state
    } catch (error) {
      console.error("Error fetching researchers:", error);
    }
  };
  const fetchcityname = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/city/get-city`
      );
      setcityname(response.data); // Store fetched City in state
    } catch (error) {
      console.error("Error fetching City:", error);
    }
  };
  const fetchdistrictname = async () => {
    try {
      const response = await axios.get(
         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/district/get-district`
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/country/get-country`
      );
      setCountryname(response.data); // Store fetched Country in state
    } catch (error) {
      console.error("Error fetching Country:", error);
    }
  };
  useEffect(() => {
    if (orgid !== null) {
      fetchResearcher(); // Fetch researchers only after `orgId` is set
    }
  }, [orgid]); // Runs when `orgId` changes
  const resetFormData = () => {
    setFormData({
      userID: "",
      useraccount_email: "",
      ResearcherName: "",
      phoneNumber: "",
      nameofOrganization: "",
      fullAddress: "",
      city: "",
      district: "",
      country: "",
      email: "",
      password: "",
      accountType: "Researcher",
      logo: "",
      user_account_id: "",
    });
    setCurrentStep(1);
    setPreview(null);
  };
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setLogoFile(file);
      setPreview(URL.createObjectURL(file)); // Generate preview URL
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create a new FormData instance
    const formDataToSubmit = new FormData();

    // Append all fields to the FormData instance
    formDataToSubmit.append("userID", formData.userID);
    formDataToSubmit.append("ResearcherName", formData.ResearcherName);
    formDataToSubmit.append("phoneNumber", formData.phoneNumber);
    formDataToSubmit.append("nameofOrganization", organization.id); // Use organization ID
    formDataToSubmit.append("fullAddress", formData.fullAddress);
    formDataToSubmit.append("city", formData.city);
    formDataToSubmit.append("district", formData.district);
    formDataToSubmit.append("country", formData.country);
    formDataToSubmit.append("email", formData.email);
    formDataToSubmit.append("password", formData.password);
    formDataToSubmit.append("accountType", "Researcher");

    // Append the logo file
    if (logoFile) {
      formDataToSubmit.append("logo", logoFile);
    }

    console.log("FormData to submit:", formDataToSubmit);

    try {
      // POST request to your backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/user/signup`,
        formDataToSubmit,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Researcher added successfully:", response.data);
      setCurrentStep(1);
      // Refresh the researcher list after successful submission
      fetchResearcher();

      // Clear form after submission
      resetFormData();
      setSuccessMessage("Researcher added successfully.");
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setShowAddModal(false); // Close modal after submission
    } catch (error) {
      console.error(
        "Error adding researcher:",
        error.response?.data || error.message
      );
    }
  };

  // const handleHistory = async () => {
  //   setSelectedResearcherStatus('pending')
  //   try {
  //     // Send delete request to backend
  //     await axios.get(
  //       `http://localhost:5000/api/researchers/edit/${selectedSampleId}/${selectedResearcherStatus}`
  //     );
  //     console.log(
  //       `Researcher with ID ${selectedSampleId} edit successfully.`
  //     );

  //     // Set success message
  //     setSuccessMessage("Researcher deleted successfully.");

  //     // Clear success message after 3 seconds
  //     setTimeout(() => {
  //       setSuccessMessage("");
  //     }, 3000);

  //     // Refresh the researcher list after deletion
  //     const newResponse = await axios.get(
  //       "http://localhost:5000/api/researcher/get"
  //     );
  //     setResearchers(newResponse.data);

  //     // Close modal after deletion
  //     setShowHistoryModal(false);
  //     setSelectedResearcherId(null);
  //   } catch (error) {
  //     console.error(
  //       `Error deleting researcher with ID ${selectedResearcherId}:`,
  //       error
  //     );
  //   }
  // };
  const handleEditClick = (researcher) => {
    setSelectedResearcherId(researcher.user_account_id);
    setEditResearcher(researcher); // Store the researcher data to edit
    setShowEditModal(true); // Show the edit modal
    setFormData({
      user_account_id: researcher.user_account_id,
      useraccount_email: researcher.email,
      userID: id,
      ResearcherName: researcher.ResearcherName,
      phoneNumber: researcher.phoneNumber,
      nameofOrganization: researcher.nameofOrganization,
      fullAddress: researcher.fullAddress,
      logo: researcher.logo,
      city: researcher.city,
      district: researcher.district,
      country: researcher.country,
      email: researcher.email,
      password: researcher.password,
      accountType: "Researcher",
    });
    setCurrentStep(1);
    console.log("Logo", researcher.logo);
    setPreview(
      researcher.logo && researcher.logo.data
        ? `data:image/jpeg;base64,${Buffer.from(researcher.logo.data).toString(
            "base64"
          )}`
        : null
    );
  };

  const handleUpdate = async (e) => {
    console.log("account id", selectedResearcherId);
    e.preventDefault();
    const newformData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      newformData.append(key, value);
    });

    if (logoFile || !preview) {
      newformData.append("logo", logoFile);
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/api/researchers/edit/${selectedResearcherId}`,
        formData
      );
      console.log("Researcher updated successfully:", response.data);

      fetchResearcher();
      setShowEditModal(false);
      setSuccessMessage("Researcher updated successfully.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      console.log("Researcher updated successfully:", response.data);
    } catch (error) {
      console.error(
        `Error updating researcher with ID ${selectedResearcherId}:`,
        error
      );
    }
  };

  // Get the current data for the table
  const currentData = researchers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    if (value === "") {
      fetchResearcher();
    } else {
      // Filter the researchers array based on the field and value
      const filtered = researchers.filter((researcher) =>
        researcher[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setResearchers(filtered);
    }
  };
  useEffect(() => {
    if (showAddModal || showEditModal) {
      // Prevent background scroll when modal is open
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      // Allow scrolling again when modal is closed
      document.body.style.overflow = "auto";
      document.body.classList.remove("modal-open");
    }
  }, [showAddModal, showEditModal]);
  return (
    <section className="policy__area pb-120 overflow-hidden">
      <div className="container-fluid mt-n5">
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-md-10">
            <div className="policy__wrapper policy__translate position-relative mt-5">
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
                  {/* Add Committee Member*/}

                  <button
                    className="btn btn-primary mb-2"
                    onClick={() => setShowAddModal(true)}
                  >
                    Add Researcher
                  </button>
                </div>
              </div>
              {/* Table */}
              <div className="table-responsive w-100">
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      {[
                        "ID",
                        "Name",
                        "Email",
                        "Password",
                        "logo",
                        "Phone Number",
                        "Organization",
                        "Full Address",
                        "City",
                        "District",
                        "Country",
                        "Status",
                      ].map((label, index) => (
                        <th key={index} className="px-4">
                          <input
                            type="text"
                            className="form-control w-100 px-4 py-1 mx-auto"
                            placeholder={`Search ${label}`}
                            onChange={(e) =>
                              handleFilterChange(
                                label.toLowerCase().replace(/ /g, ""),
                                e.target.value
                              )
                            }
                          />
                          {label}
                        </th>
                      ))}
                      <th className="px-3 align-middle text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length > 0 ? (
                      currentData.map((researcher) => (
                        <tr key={researcher.id}>
                          <td>{researcher.id}</td>
                          <td>{researcher.ResearcherName}</td>
                          <td>{researcher.email}</td>
                          <td>{researcher.password}</td>
                          <td>
                            { researcher.logo && researcher.logo.data ? (
                              <img
                                src={`data:image/jpeg;base64,${Buffer.from(
                                  researcher.logo.data
                                ).toString("base64")}`}
                                alt="logo"
                                style={{
                                  maxWidth: "100px",
                                  maxHeight: "100px",
                                }}
                              />
                            ) : (
                              <span>No Logo</span>
                            )}
                          </td>
                          <td>{researcher.phoneNumber}</td>
                          <td>{researcher.organization_name}</td>
                          <td>{researcher.fullAddress}</td>
                          <td>{researcher.city_name}</td>
                          <td>{researcher.district_name}</td>
                          <td>{researcher.country_name}</td>
                          <td>{researcher.status}</td>
                          <td>
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleEditClick(researcher)}
                              >
                                <i className="fa fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => {
                                  setSelectedResearcherId(researcher.id);
                                  setShowHistoryModal(true);
                                  setCurrentStep(1);
                                }}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="10" className="text-center">
                          No researchers available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="pagination d-flex justify-content-end align-items-center mt-3">
                <nav aria-label="Page navigation example">
                  <ul className="pagination justify-content-end">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Previous"
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                      >
                        <span aria-hidden="true">&laquo;</span>
                        <span className="sr-only">Previous</span>
                      </a>
                    </li>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${
                            currentPage === pageNumber ? "active" : ""
                          }`}
                        >
                          <a
                            className="page-link"
                            href="#"
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </a>
                        </li>
                      );
                    })}
                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        aria-label="Next"
                        onClick={() =>
                          currentPage < totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                      >
                        <span aria-hidden="true">&raquo;</span>
                        <span className="sr-only">Next</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Modal for Adding Researchers */}
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
                      top: "40px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <div className="modal-dialog" role="document">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title">
                            {showAddModal
                              ? "Add Researcher"
                              : "Edit Researcher"}
                          </h5>
                          <button
                            type="button"
                            className="close"
                            onClick={() => {
                              setShowAddModal(false);
                              setShowEditModal(false);
                              resetFormData(); // Reset form data when closing the modal
                            }}
                            style={{
                              fontSize: "1.5rem",
                              position: "absolute",
                              right: "10px",
                              cursor: "pointer",
                            }}
                          >
                            <span>&times;</span>
                          </button>
                        </div>

                        <form
                          onSubmit={showAddModal ? handleSubmit : handleUpdate} // Conditionally use submit handler
                        >
                          <div className="modal-body">
                            {/* Step 1 Fields */}
                            {currentStep === 1 && (
                              <>
                                <div
                                  className="login__input-item"
                                  style={{ textAlign: "center" }}
                                >
                                  {/* Image Preview Section */}
                                  <div style={{ marginBottom: "10px" }}>
                                    {preview ? (
                                      <img
                                        src={preview}
                                        alt="Preview"
                                        style={{
                                          width: "70px",
                                          height: "70px",
                                          borderRadius: "50%",
                                          objectFit: "cover",
                                          display: "inline-block",
                                        }}
                                      />
                                    ) : (
                                      <span
                                        style={{
                                          width: "70px",
                                          height: "70px",
                                          display: "inline-block",
                                          borderRadius: "50%",
                                          backgroundColor: "#eaeaea",
                                          color: "#aaa",
                                          fontSize: "30px",
                                          lineHeight: "70px",
                                          textAlign: "center",
                                        }}
                                      >
                                        <i className="fa-solid fa-user"></i>
                                      </span>
                                    )}
                                  </div>

                                  {/* File Input Section */}
                                  <div className="login__input">
                                    <input
                                      name="logo"
                                      type="file"
                                      id="logo"
                                      className="form-control form-control-sm"
                                      onChange={handleInputChange}
                                      required
                                      style={{
                                        display: "block",
                                        margin: "0 auto",
                                      }}
                                      accept="image/*"
                                    />
                                    <span>
                                      <i className="fa-solid fa-image"></i>
                                    </span>
                                  </div>
                                </div>

                                <div className="form-group">
                                  <label>Name</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="ResearcherName"
                                    value={formData.ResearcherName}
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
                                <div
                                  className="form-group"
                                  style={{ position: "relative" }}
                                >
                                  <label>Password</label>
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  <span
                                    className="login-input-eye"
                                    style={{
                                      position: "absolute",
                                      top: "65%",
                                      right: "10px", // Position it on the right
                                      transform: "translateY(-50%)",
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    } // Toggle password visibility
                                  >
                                    {showPassword ? (
                                      <i className="fa-regular fa-eye"></i> // Eye icon when password is visible
                                    ) : (
                                      <i className="fa-regular fa-eye-slash"></i> // Eye slash icon when password is hidden
                                    )}
                                  </span>
                                </div>

                                <div className="form-group">
                                  <label>Account Type</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="accountType"
                                    value={formData.accountType}
                                    onChange={handleInputChange}
                                    readOnly
                                  />
                                </div>
                                <div className="form-group">
                                  <label>Organization</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="nameofOrganization"
                                    value={organization.OrganizationName}
                                    readOnly
                                  />
                                </div>
                              </>
                            )}

                            {/* Step 2 Fields */}
                            {currentStep === 2 && (
                              <>
                                <div className="form-group">
                                  <label>Phone Number</label>
                                  <input
                                    type="text"
                                    className="form-control"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    required
                                    pattern="^\d{4}-\d{3}-\d{4}$"
                                    title="Phone number must be in the format 0304-586-1729"
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
                                    value={formData.city}
                                    onChange={handleInputChange}
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
                                      <option
                                        key={district.id}
                                        value={district.id}
                                      >
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
                                      <option
                                        key={country.id}
                                        value={country.id}
                                      >
                                        {country.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Modal Footer */}
                          <div className="modal-footer">
                            {currentStep > 1 && (
                              <button
                                type="button" // Prevents form submission
                                className="btn btn-secondary"
                                onClick={() => {
                                  console.log("Before:", currentStep);
                                  setCurrentStep((prevStep) => prevStep - 1);
                                  console.log("After:", currentStep); // This won't reflect immediately, but helps debug
                                }}
                              >
                                Previous
                              </button>
                            )}
                            {currentStep < 2 ? (
                              <button
                                type="button" // Prevents form submission
                                className="btn btn-primary"
                                onClick={() => {
                                  console.log("Before:", currentStep);
                                  setCurrentStep((prevStep) => prevStep + 1);
                                  console.log("After:", currentStep); // This won't reflect immediately, but helps debug
                                }}
                              >
                                Next
                              </button>
                            ) : (
                              <button type="submit" className="btn btn-primary">
                                {showAddModal ? "Save" : "Update Researcher"}
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Modal for Deleting Researchers */}
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
                        <h5 className="modal-title">Delete Researcher</h5>
                      </div>
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

export default ResearcherArea;
