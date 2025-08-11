import React, { useEffect, useState } from "react";
import SingleListProduct from "@components/products/single-list-product";

const ProductListItems = ({ itemsPerPage, items, setShowingListItems, selectedFilters }) => {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [visibleItems, setVisibleItems] = useState([]);
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
    if (currentItems && setShowingListItems) {
      setShowingListItems(currentItems.length);
    }
  }, [currentItems, setShowingListItems]);

  return (
    <div className="tab-pane fade" id="nav-list" role="tabpanel" aria-labelledby="nav-list-tab">
      <div className="product__list-wrapper mb-30">
        <div className="row">
           {currentItems &&
            currentItems.map((product) => (
            <div key={product._id} className="col-lg-12 col-md-6">
              <SingleListProduct product={product} selectedFilters={selectedFilters} />
            </div>
          ))}
        </div>
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
  );
};

export default ProductListItems;
