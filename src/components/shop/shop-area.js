import React, { useState } from "react";
// internal
import { ShopShortSelect, ShopShortTab, ShowingResult } from "./shop-top-bar";
import ShopSidebar from "@components/common/sidebar/shop-sidebar/index";
import ProductGridItems from "./prd-grid-items";
import ProductListItems from "./prd-list-items";

const ShopArea = ({ products, all_products, shortHandler }) => {
  const [showingGridItems, setShowingGridItems] = useState(0);
  const [showingListItems, setShowingListItems] = useState(0);
  const [tabActive, setActiveTab] = useState("grid");

  // New filter states
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedSmokingStatus, setSelectedSmokingStatus] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSampleType, setSelectedSampleType] = useState([]);
  const [selectedSampleName, setSelectedSampleName] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const handleTab = (value) => {
    setActiveTab(value);
  };

  const handleReset = () => {
    setSelectedPrice(null);
    setSelectedSmokingStatus(null);
    setSelectedGender(null);
    setSelectedSampleType([]);
    setSelectedSampleName([]);
    setSearchQuery(""); // Reset search query
  };

  const filteredProducts = products.filter((product) => {
    let matchesPrice =
      !selectedPrice ||
      (product.price >= selectedPrice.min &&
        product.price <= selectedPrice.max);

    let matchesSmoking =
      !selectedSmokingStatus || product.SmokingStatus === selectedSmokingStatus;

    let matchesGender = !selectedGender || product.gender === selectedGender;

    let matchesSampleType =
      selectedSampleType.length === 0 ||
      selectedSampleType.some((type) =>
        product.SampleTypeMatrix.includes(type)
      );

    let matchesSampleName =
      selectedSampleName.length === 0 ||
      selectedSampleName.some((name) => product.samplename.includes(name));

    let matchesSearch =
      searchQuery === "" ||
      product.samplename.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesPrice &&
      matchesSmoking &&
      matchesGender &&
      matchesSampleType &&
      matchesSampleName &&
      matchesSearch
    );
  });

  return (
    <section className="shop__area pb-40">
      <div className="container">
        <div className="shop__top mb-50">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-5">
              <ShowingResult
                show={
                  tabActive === "grid" ? showingGridItems : showingListItems
                }
                total={filteredProducts.length}
              />
            </div>

            {/* Search Input Field */}
            <div className="col-lg-6 col-md-7">
  <div className="shop__sort d-flex align-items-center justify-content-between">
    {/* Search Input Field */}
    <div className="input-group search-input-group me-3" style={{ maxWidth: "250px" }}>
      <span className="input-group-text bg-white border-0">
        <i className="bi bi-search text-muted"></i>
      </span>
      <input
        type="text"
        className="form-control border-0 shadow-sm"
        placeholder="Search Sample Name..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* Sorting Options */}
    <ShopShortTab handleTab={handleTab} />
    <ShopShortSelect shortHandler={shortHandler} />
  </div>
</div>

          </div>
        </div>

        <div className="shop__main">
          <div className="row">
            {/* Sidebar */}
            <div className="col-lg-3">
              <ShopSidebar
                setSelectedPrice={setSelectedPrice}
                setSelectedSmokingStatus={setSelectedSmokingStatus}
                setSelectedGender={setSelectedGender}
                selectedSampleType={selectedSampleType}
                setSelectedSampleType={setSelectedSampleType}
                handleReset={handleReset}
              />
            </div>

            {/* Product Listing */}
            <div className={`col-lg-9 order-first order-lg-last`}>
              <div className="shop__tab-content mb-40">
                <div className="tab-content" id="shop_tab_content">
                  <ProductGridItems
                    itemsPerPage={9}
                    items={filteredProducts}
                    setShowingGridItems={setShowingGridItems}
                  />
                  <ProductListItems
                    itemsPerPage={5}
                    items={filteredProducts}
                    setShowingListItems={setShowingListItems}
                  />
                </div>
                {/* pagination */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopArea;
