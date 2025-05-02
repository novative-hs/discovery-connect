import React, { useEffect, useState } from "react";
import SingleProduct from "@components/products/single-product";
import Pagination from "@ui/Pagination";

const ProductGridItems = ({ itemsPerPage, items, setShowingGridItems }) => {
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    const current = items?.slice(itemOffset, endOffset);
    setCurrentItems(current);
    setPageCount(Math.ceil(items.length / itemsPerPage));

    // Update showing range
    if (setShowingGridItems) {
      setShowingGridItems({
        start: itemOffset + 1,
        end: Math.min(endOffset, items.length),
        total: items.length,
      });
    }
  }, [itemOffset, itemsPerPage, items, setShowingGridItems]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };

  return (
    <div
      className="tab-pane fade show active"
      id="nav-grid"
      role="tabpanel"
      aria-labelledby="nav-grid-tab"
    >
      <div className="row">
        {currentItems &&
          currentItems.map((product) => (
            <div
              key={product._id}
              className="col-xl-4 col-lg-4 col-md-4 col-sm-6"
            >
              <SingleProduct product={product} />
            </div>
          ))}
      </div>

      <div className="row">
        <div className="col-xxl-12">
          <Pagination handlePageClick={handlePageClick} pageCount={pageCount} />
        </div>
      </div>
    </div>
  );
};

export default ProductGridItems;
