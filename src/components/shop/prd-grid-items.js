import React, { useEffect, useState } from "react";
// internal
import SingleProduct from "@components/products/single-product";

const ProductGridItems = ({ itemsPerPage, items, setShowingGridItems, selectedFilters }) => {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [loading, setLoading] = useState(false);
  const [dots, setDots] = useState("");

  // Dot animation effect
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setDots((prev) => {
          if (prev === "...") return ".";
          return prev + ".";
        });
      }, 500); // Update every 0.5s
    } else {
      setDots("");
    }

    return () => clearInterval(interval);
  }, [loading]);

  const handleLoadMore = () => {
    setLoading(true);

    // Simulate delay (e.g., API call)
    setTimeout(() => {
      setVisibleCount((prevCount) => prevCount + itemsPerPage);
      setLoading(false);
    }, 1500); // Simulated delay
  };

  const currentItems = items?.slice(0, visibleCount);

  useEffect(() => {
    if (currentItems && setShowingGridItems) {
      setShowingGridItems(currentItems.length);
    }
  }, [currentItems, setShowingGridItems]);

  return (
    <>
      <div
        className="tab-pane fade show active"
        id="nav-grid"
        role="tabpanel"
        aria-labelledby="nav-grid-tab"
      >
        {/* shop grid */}
        <div className="row">
          {currentItems &&
            currentItems.map((product) => (
              <div
                key={product._id}
                className="col-xl-3 col-lg-3 col-md-4 col-sm-6 mb-4"
              >
                <SingleProduct product={product} selectedFilters={selectedFilters} />
              </div>
            ))}
        </div>

        {/* Load More Button */}
        {visibleCount < items.length && (
          <div className="row">
            <div className="col-12 text-center mt-4">
              <button
                className="fw-bold px-4 py-2 text-white text-decoration-none"
                style={{ backgroundColor: "#003366" }}
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? `Loading${dots}` : "Load More"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductGridItems;
