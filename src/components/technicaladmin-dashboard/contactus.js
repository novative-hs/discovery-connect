import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons";
import Pagination from "@ui/Pagination";
import { getsessionStorage } from "@utils/sessionStorage";

const ContactUS = () => {
  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>; // Or redirect to login
  } else {
    console.log("Contact us Id :", id);
  }

  const [filteredContactus, setFilteredContactus] = useState([]); // Store filtered cities
  const tableHeaders = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phone" },
    { label: "Company", key: "company" },
    { label: "Message", key: "message" },
    { label: "Created At", key: "created_at" },
  ];

  const [contact_us, setContact_us] = useState([]); // State to hold fetched samples

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // Calculate total pages
  const [totalPages, setTotalPages] = useState(0);
  // Fetch samples from backend when component loads
  useEffect(() => {
    fetchContactus();
  }, []);

  const fetchContactus = async () => {
    try {
      // Fetch own samples
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contactus/get-all`
      );

      setContact_us(response.data);
      setFilteredContactus(response.data);
    } catch (error) {
      console.error("Error fetching Contact us:", error);
    }
  };

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredContactus.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0); // Reset to page 0 if the current page is out of bounds
    }
  }, [filteredContactus]);

  // Get the current data for the table
  const currentData = filteredContactus.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  // Filter the researchers list
  const handleFilterChange = (field, value) => {
    let filtered = [];

    if (value.trim() === "") {
      filtered = contact_us; // Show all if filter is empty
    } else {
      filtered = contact_us.filter((contact_us) =>
        contact_us[field]
          ?.toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
    }

    setFilteredContactus(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)); // Update total pages
    setCurrentPage(0); // Reset to first page after filtering
  };

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        {/* Table */}
        <div className="w-100" style={{ overflowX: "auto" }}>
          <table class="table table-striped table-hover table-bordered text-center align-middle shadow-sm">

            <thead className="table-primary text-dark">
              <tr className="text-center">
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">
                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        class="form-control form-control-sm bg-light border-0 shadow-sm text-center"
                        placeholder="Search Name"
                      />

                      <span className="fw-bold mt-1 d-block text-wrap align-items-center fs-10">
                        {label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-light">
              {currentData.length > 0 ? (
                currentData.map((contact_us, rowIndex) => (
                  <tr key={rowIndex}>
                    {tableHeaders.map(({ key }, index) => (
                      <td
                        key={index}
                        className="text-center text-truncate"
                        style={{
                          maxWidth: key === "message" ? "300px" : "150px",
                          whiteSpace: "pre-wrap", // Keeps line breaks in messages
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {key === "created_at"
                          ? new Date(contact_us[key])
                            .toISOString()
                            .split("T")[0] // Extracts only YYYY-MM-DD
                          : contact_us[key] || "----"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={tableHeaders.length} className="text-center">
                    No contact us available
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
      </div>
    </section>
  );
};

export default ContactUS;
