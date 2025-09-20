import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Pagination from "@ui/Pagination";

// 🔹 Debounce hook
function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

const CollectionsiteList = () => {
    const [allSites, setAllSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        CollectionSiteName: "",
        CollectionSiteType: "",
        phoneNumber: "",
        fullAddress: "",
    });

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const itemsPerPage = 10;

    // 🔹 Apply debounce on filters
    const debouncedFilters = useDebounce(filters, 500);

    useEffect(() => {
        fetchAllSites();
    }, []);

    const fetchAllSites = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/collectionsite/get`
            );
            setAllSites(response.data);
        } catch (error) {
            console.error("Error fetching collection sites:", error);
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Filtering + Pagination with useMemo
    const filteredSites = useMemo(() => {
        const active = allSites.filter(
            (site) => site.status && site.status.toLowerCase() === "active"
        );

        return active.filter((site) => {
            return (
                (!debouncedFilters.CollectionSiteName ||
                    site.CollectionSiteName?.toLowerCase().includes(
                        debouncedFilters.CollectionSiteName.toLowerCase()
                    )) &&
                (!debouncedFilters.CollectionSiteType ||
                    site.CollectionSiteType?.toLowerCase().includes(
                        debouncedFilters.CollectionSiteType.toLowerCase()
                    )) &&
                (!debouncedFilters.phoneNumber ||
                    site.phoneNumber?.toString().includes(debouncedFilters.phoneNumber)) &&
                (!debouncedFilters.fullAddress ||
                    site.fullAddress
                        ?.toLowerCase()
                        .includes(debouncedFilters.fullAddress.toLowerCase()))
            );
        });
    }, [allSites, debouncedFilters]);

    const currentData = useMemo(() => {
        const pages = Math.max(1, Math.ceil(filteredSites.length / itemsPerPage));
        setTotalPages(pages);

        if (currentPage >= pages) {
            setCurrentPage(0);
        }

        return filteredSites.slice(
            currentPage * itemsPerPage,
            (currentPage + 1) * itemsPerPage
        );
    }, [filteredSites, currentPage]);

    const handlePageChange = (event) => {
        setCurrentPage(event.selected);
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "200px" }}
            >
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading active collection sites...</p>
                </div>
            </div>
        );
    }

    const tableHeaders = [
        { label: "Collection Site Name", key: "CollectionSiteName" },
        { label: "Type", key: "CollectionSiteType" },
        { label: "Contact", key: "phoneNumber" },
        { label: "Full Address", key: "fullAddress" },
    ];

    return (
        <section className="policy__area pb-40 overflow-hidden p-3">
            <div className="container">
                <h4 className="text-center text-dark fw-bold mb-4">
                    Active Collection Sites
                </h4>

                {/* Table */}
                <div className="table-responsive w-100">
                    <table className="table table-bordered table-hover text-center align-middle table-sm shadow-sm rounded">
                        <thead className="table-primary text-white">
                            <tr>
                                {tableHeaders.map(({ label, key }, index) => (
                                    <th key={index} className="col-md-2 px-2">
                                        <div className="d-flex flex-column align-items-center">
                                            <input
                                                type="text"
                                                className="form-control bg-light border form-control-sm text-center shadow-none rounded"
                                                placeholder={`Search ${label}`}
                                                value={filters[key] || ""}
                                                onChange={(e) =>
                                                    setFilters({ ...filters, [key]: e.target.value })
                                                }
                                                style={{ minWidth: "150px" }}
                                            />
                                            <span className="fw-bold mt-1 d-block text-wrap fs-6">
                                                {label}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="table-light">
                            {currentData.length > 0 ? (
                                currentData.map((site, index) => (
                                    <tr key={site.id || index}>
                                        <td>{site.CollectionSiteName || "----"}</td>
                                        <td>{site.CollectionSiteType || "----"}</td>
                                        <td>{site.phoneNumber || "----"}</td>
                                        <td>
                                            {site.fullAddress || ""}, {site.city || ""},{" "}
                                            {site.district || ""}, {site.country || ""}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length} className="text-center py-4">
                                        No active collection sites found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
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

export default CollectionsiteList;
