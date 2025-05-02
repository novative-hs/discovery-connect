import React, { useEffect, useState } from "react";
// internal
import SingleListProduct from "@components/products/single-list-product";
import Pagination from "@ui/Pagination";

const ProductListItems = ({ itemsPerPage, items, setShowingListItems }) => {
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  // side effect
  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    const current = items?.slice(itemOffset, endOffset);
    setCurrentItems(current);
    setPageCount(Math.ceil(items.length / itemsPerPage));
    if (setShowingListItems) {
      setShowingListItems({
        start: itemOffset + 1,
        end: Math.min(endOffset, items.length),
        total: items.length,
      });
    }
  }, [itemOffset, itemsPerPage, items, setShowingListItems]);

  // handlePageClick
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    setItemOffset(newOffset);
  };
  return (
    <>
      <div
        className="tab-pane fade"
        id="nav-list"
        role="tabpanel"
        aria-labelledby="nav-list-tab"
      >
        <div className="product__list-wrapper mb-30">
          <div className="row">
            
            {currentItems &&
              currentItems.map((product) => (
                <div key={product._id} className="col-lg-12 col-md-6">
                  <SingleListProduct product={product} />
                </div>
              ))}
          </div>
        </div>

      {/* pagination start */}
      <div className="row">
        <div className="col-xxl-12">
          
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
            />
          
        </div>
      </div>
      {/* pagination end */}
      </div>
    </>
  );
};

export default ProductListItems;
