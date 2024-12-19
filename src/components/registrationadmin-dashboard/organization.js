import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const OrganizationArea = () => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    // const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrganizationId, setSelectedOrganizationId] = useState(null); // Store ID of organization to delete
    const [formData, setFormData] = useState({
        OrganizationName: "",
        email: "",
        phoneNumber: "",
        // created_at: "",
        status: "",
        // logo: ""
    });
    const [editOrganization, setEditOrganization] = useState(null); // State for selected organization to edit
    const [organizations, setOrganizations] = useState([]); // State to hold fetched organizations
    const [successMessage, setSuccessMessage] = useState('');
    const [statusFilter, setStatusFilter] = useState(""); // State for the selected status filter


    // Fetch organizations from backend when component loads
    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/admin/organization/get');
                setOrganizations(response.data); // Store fetched organizations in state
            } catch (error) {
                console.error("Error fetching organizations:", error);
            }
        };

        fetchOrganizations(); // Call the function when the component mounts
    }, []);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // const formatDateTime = (dateTime) => {
    //   const date = new Date(dateTime);
    //   const formattedDate = date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format
    //   return formattedDate;
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // POST request to your backend API
            const response = await axios.post('http://localhost:5000/api/organizations/post', formData);
            console.log("Organization added successfully:", response.data);

            // Refresh the organization list after successful submission
            const newResponse = await axios.get('http://localhost:5000/api/admin/organization/get');
            setOrganizations(newResponse.data); // Update state with the new list

            // Clear form after submission
            setFormData({
                OrganizationName: "",
                email: "",
                phoneNumber: "",
                // created_at: "",
                status: "",

            });
            setShowAddModal(false); // Close modal after submission
        } catch (error) {
            console.error("Error adding organization:", error);
        }
    };


    // const handleDelete = async () => {
    //     try {
    //         // Send delete request to backend
    //         await axios.delete(`http://localhost:5000/api/organizations/delete/${selectedOrganizationId}`);
    //         console.log(`Organization with ID ${selectedOrganizationId} deleted successfully.`);

    //         // Set success message
    //         setSuccessMessage('Organization deleted successfully.');

    //         // Clear success message after 3 seconds
    //         setTimeout(() => {
    //             setSuccessMessage('');
    //         }, 3000);

    //         // Refresh the organization list after deletion
    //         const newResponse = await axios.get('http://localhost:5000/api/admin/organization/get');
    //         setOrganizations(newResponse.data);

    //         // Close modal after deletion
    //         setShowDeleteModal(false);
    //         setSelectedOrganizationId(null);
    //     } catch (error) {
    //         console.error(`Error deleting organization with ID ${selectedOrganizationId}:`, error);
    //     }
    // };


    const handleEditClick = (organization) => {
        setSelectedOrganizationId(organization.id);
        setEditOrganization(organization); // Store the organization data to edit
        setShowEditModal(true); // Show the edit modal
        setFormData({
            OrganizationName: organization.OrganizationName,
            email: organization.email,
            phoneNumber: organization.phoneNumber,
            // created_at: organization.created_at,
            status: organization.status,
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(
                `http://localhost:5000/api/admin/organization/edit/${selectedOrganizationId}`,
                formData
            );
            console.log("Organization updated successfully:", response.data);

            const newResponse = await axios.get(
                "http://localhost:5000/api/admin/organization/get"
            );
            setOrganizations(newResponse.data);

            setShowEditModal(false);
            setSuccessMessage("Organization updated successfully.");

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);
        } catch (error) {
            console.error(`Error updating organization with ID ${selectedOrganizationId}:`, error);
        }
    };


    // Handle filter change
    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    // Filter samples based on the selected status
    const filteredOrganizations = organizations.filter(organization => {
        if (!statusFilter) return true; // If no filter is selected, show all
        return organization.status === statusFilter;
    });

    return (
        <section className="policy__area pb-120">
            <div className="container" style={{ marginTop: '-20px', width: '120%', marginLeft: '-80px' }}>

                <div className="row justify-content-center" style={{ marginTop: '290px' }}>
                    <div className="col-xl-10">
                        <div className="policy__wrapper policy__translate p-relative z-index-1">
                            {/* Success Message */}
                            {successMessage && (
                                <div className="alert alert-success" role="alert">
                                    {successMessage}
                                </div>
                            )}
                            <div className="d-flex justify-content-between align-items-center mb-3" style={{ marginTop: "-20px", width: "120%", marginLeft: "-80px" }}>
                                <div className="d-flex align-items-center">
                                    <label htmlFor="statusFilter" className="mr-2" style={{ marginLeft: "60px", marginRight: "10px", fontSize: "16px", fontWeight: "bold" }}>Status:</label>
                                    <select
                                        id="statusFilter"
                                        className="form-control"
                                        style={{ width: "100px" }}
                                        onChange={handleFilterChange}
                                    >
                                        <option value="">All</option>
                                        <option value="pending">pending</option>
                                        <option value="approved">approved</option>
                                        <option value="unapproved">unapproved</option>
                                    </select>
                                </div>

                            </div>

                            {/* Table */}
                            <div className="table-responsive" style={{ marginLeft: '-20px', width: '110%' }}>
                                <table className="table table-bordered table-hover">
                                    <thead className="thead-dark">
                                        <tr>
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Contact</th>
                                            {/* <th>Registered_at</th> */}
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrganizations.length > 0 ? (
                                            filteredOrganizations.map((organization) => (
                                                <tr key={organization.id}>
                                                    <td>{organization.id}</td>
                                                    <td>{organization.OrganizationName}</td>
                                                    <td>{organization.email}</td>
                                                    <td>{organization.phoneNumber}</td>
                                                    {/* <td>{organization.created_at}</td> */}
                                                    <td>{organization.status}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => handleEditClick(organization)}>
                                                            <FontAwesomeIcon icon={faEdit} size="sm" />
                                                        </button>{" "}
                                                        {/* <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => {
                                                                setSelectedOrganizationId(organization.id);
                                                                setShowDeleteModal(true);
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} size="sm" />
                                                        </button> */}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">
                                                    No organizations available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Modal for Adding Organizations */}
                            {/* {showAddModal && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                  <div className="modal-dialog" role="document">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Add Organization</h5>
                        <button
                          type="button"
                          className="close"
                          onClick={() => setShowAddModal(false)}
                          style={{
                            fontSize: '1.5rem',
                            position: 'absolute',
                            right: '10px',
                            top: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <span>&times;</span>
                        </button>
                      </div>
                      <form onSubmit={handleSubmit}>
                        <div className="modal-body"> */}
                            {/* Form Fields */}
                            {/* <div className="form-group">
                            <label>Organization Name</label>
                            <input
                              type="text"
                              className="form-control"
                              name="OrganizationName"
                              value={formData.OrganizationName}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>Email</label>
                            <input
                              type="text"
                              className="form-control"
                              name="email"
                              value={formData.email}
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
                        </div>
                        <div className="modal-footer">
                          <button type="submit" className="btn btn-primary">
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              )} */}

                            {/* Edit Organization Modal */}
                            {showEditModal && (
                                <div className="modal show d-block" tabIndex="-1" role="dialog">
                                    <div className="modal-dialog" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Edit Organization</h5>
                                                <button
                                                    type="button"
                                                    className="close"
                                                    onClick={() => setShowEditModal(false)}
                                                    style={{
                                                        // background: 'none',
                                                        // border: 'none',
                                                        fontSize: '1.5rem',
                                                        position: 'absolute',
                                                        right: '10px',
                                                        top: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <span>&times;</span>
                                                </button>
                                            </div>
                                            <form onSubmit={handleUpdate}>
                                                <div className="modal-body">
                                                    {/* Form Fields */}
                                                    <div className="form-group">
                                                        <label>Organization name</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="OrganizationName"
                                                            value={formData.OrganizationName}
                                                            onChange={handleInputChange}
                                                            disabled
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Email</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                            disabled
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
                                                            disabled
                                                        />
                                                    </div>
                                                    <div className="form-group">
                                                        <label>Status</label>
                                                        <select
                                                            className="form-control"
                                                            name="status"
                                                            value={formData.status}
                                                            onChange={handleInputChange}
                                                            required
                                                        >
                                                            <option value="pending">pending</option>
                                                            <option value="approved">approved</option>
                                                            <option value="unapproved">unapproved</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="modal-footer">
                                                    <button type="submit" className="btn btn-primary">
                                                        Update Organization
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Modal for Deleting Organizations */}
                            {/* {showDeleteModal && (
                                <div className="modal show d-block" tabIndex="-1" role="dialog">
                                    <div className="modal-dialog" role="document">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Delete Organization</h5>
                                                <button
                                                    type="button"
                                                    className="close"
                                                    onClick={() => setShowDeleteModal(false)}
                                                >
                                                    <span>&times;</span>
                                                </button>
                                            </div>
                                            <div className="modal-body">
                                                <p>Are you sure you want to delete this organization?</p>
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
                            )} */}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OrganizationArea;
