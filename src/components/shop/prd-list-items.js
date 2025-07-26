import React, { useEffect, useState } from "react";
import SingleListProduct from "@components/products/single-list-product";

const ProductListItems = ({ itemsPerPage, items, setShowingListItems, selectedFilters }) => {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const [visibleItems, setVisibleItems] = useState([]);

  // 🔁 Reset visibleCount when items change (like filter applied/removed)
useEffect(() => {
  // Reset visibleCount when items change (e.g., filter apply/remove)
  setVisibleCount(itemsPerPage);
}, [items]);

useEffect(() => {
  setVisibleItems(items.slice(0, visibleCount));
}, [items, visibleCount]);

useEffect(() => {
  if (setShowingListItems) {
    setShowingListItems(visibleItems.length);
  }
}, [visibleItems, setShowingListItems]);


  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + itemsPerPage);
  };

  return (
    <div className="tab-pane fade" id="nav-list" role="tabpanel" aria-labelledby="nav-list-tab">
      <div className="product__list-wrapper mb-30">
        <div className="row">
          {visibleItems.map((product) => (
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
            >
              Load More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductListItems;
