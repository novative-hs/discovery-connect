import React, { useState } from "react";
// internal
import { ShopShortSelect, ShopShortTab, ShowingResult } from "./shop-top-bar";
import ShopSidebar from "@components/common/sidebar/shop-sidebar/index";
import ProductGridItems from "./prd-grid-items";
import ProductListItems from "./prd-list-items";

const ShopArea = ({ products, all_products, shortHandler, totalCount }) => {
  
  const [tabActive, setActiveTab] = useState("grid");
  const id = sessionStorage.getItem("userID");

  // New filter states
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedSmokingStatus, setSelectedSmokingStatus] = useState(null); // Ensure this is initialized to null
  const [selectedGender, setSelectedGender] = useState(null); // Ensure this is initialized to null
  const [selectedSampleType, setSelectedSampleType] = useState([]); // Initialize as an empty array
  const [selectedSampleName, setSelectedSampleName] = useState([]); // Initialize as an empty array
  const [showingGridItems, setShowingGridItems] = useState({
    start: 0,
    end: 0,
    total: 0,
  });
  
  const [showingListItems, setShowingListItems] = useState({
    start: 0,
    end: 0,
    total: 0,
  });
  
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
    setSearchQuery("");
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
        {!id && (
          <p
            style={{
              color: "red",
              fontWeight: "bold",
              fontSize: "16px",
              marginBottom: "20px",
            }}
          >
            Please Sign up or Log in before submitting request for Sample.
            </p>
        )}
        <div className="shop__top mb-50">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-5">
            <ShowingResult
  start={tabActive === "grid" ? showingGridItems.start : showingListItems.start}
  end={tabActive === "grid" ? showingGridItems.end : showingListItems.end}
  total={totalCount}  // This will display the total count of the samples
/>


            </div>

            {/* Search Input Field */}
            <div className="col-lg-6 col-md-7">
              <div className="shop__sort d-flex align-items-center justify-content-between">
                {/* Search Input Field */}
                <div
                  className="input-group search-input-group me-3"
                  style={{ maxWidth: "250px" }}
                >
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
                selectedGender={selectedGender}
                selectedSmokingStatus={selectedSmokingStatus}
                selectedPrice={selectedPrice}
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
  totalCount={totalCount}  // Pass the totalCount here
/>

                  <ProductListItems
                    itemsPerPage={5}
                    items={filteredProducts}
                    setShowingListItems={setShowingListItems}
                    totalCount={totalCount}  // Pass the totalCount here
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
