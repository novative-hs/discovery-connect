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
  const [filteredContactus, setFilteredContactus] = useState([]);
  const [contact_us, setContact_us] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
    created_at: ""
  });

  const tableHeaders = [
    { label: "Name", key: "name" },
    { label: "Email", key: "email" },
    { label: "Phone Number", key: "phone" },
    { label: "Company", key: "company" },
    { label: "Message", key: "message" },
    { label: "Created At", key: "created_at" },
  ];

  useEffect(() => {
    fetchContactus();
  }, []);

  const fetchContactus = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contactus/get-all`
      );
      setContact_us(response.data);
      setFilteredContactus(response.data);
    } catch (error) {
      console.error("Error fetching Contact us:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...contact_us];

    // Har filter ko apply karein
    Object.entries(filters).forEach(([field, value]) => {
      if (value) {
        filtered = filtered.filter((contact) => {
          const fieldValue = contact[field]?.toString().toLowerCase() || "";
          const searchValue = value.toLowerCase();
          return fieldValue.includes(searchValue);
        });
      }
    });

    setFilteredContactus(filtered);
    setCurrentPage(0);
  };

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredContactus.length / itemsPerPage)
    );
    setTotalPages(pages);

    if (currentPage >= pages) {
      setCurrentPage(0);
    }
  }, [filteredContactus, currentPage, itemsPerPage]);

  const handlePageChange = (event) => {
    setCurrentPage(event.selected);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    applyFilters();
  }, [filters, contact_us]);

  const id = sessionStorage.getItem("userID");
  if (id === null) {
    return <div>Loading...</div>;
  }



  const currentData = filteredContactus.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <section className="policy__area pb-40 overflow-hidden p-3">
      <div className="container">
        <div className="w-100" style={{ overflowX: "auto" }}>
          <table className="table table-striped table-hover table-bordered text-center align-middle shadow-sm">
            <thead className="table-primary text-dark">
              <tr className="text-center">
                {tableHeaders.map(({ label, key }, index) => (
                  <th key={index} className="col-md-1 px-2">
                    <div className="d-flex flex-column align-items-center">
                      <input
                        type="text"
                        className="form-control form-control-sm bg-light border-0 shadow-sm text-center"
                        placeholder={`Search ${label}`}
                        value={filters[key] || ""} // Yeh line change karein
                        onChange={(e) => handleFilterChange(key, e.target.value)} // Yeh line change karein
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
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {key === "created_at"
                          ? new Date(contact_us[key])
                            .toISOString()
                            .split("T")[0]
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
