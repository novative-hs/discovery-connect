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
  const id = sessionStorage.getItem("userID");

  // New filter states

  const [selectedSampleType, setSelectedSampleType] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null); // Ensure this is initialized to null
  const [selectedSmokingStatus, setSelectedSmokingStatus] = useState(null); // Ensure this is initialized to null
  // const [selectedPrice, setSelectedPrice] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedSampleName, setSelectedSampleName] = useState([]); // Initialize as an empty array

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const handleTab = (value) => {
    setActiveTab(value);
  };

  const handleReset = () => {
    setSelectedSampleType(null);
    setSelectedGender(null);
    setSelectedSmokingStatus(null);
    // setSelectedPrice(null);
    setSelectedAge(null);
    setSelectedSampleName([]);
    setSearchQuery("");
  };
console.log("product",products)
  const filteredProducts = products.filter((product) => {

    let matchesSampleType =
      !selectedSampleType || product.SampleTypeMatrix.includes(selectedSampleType);

    let matchesGender = !selectedGender || product.gender === selectedGender;
    let matchesSmoking =
      !selectedSmokingStatus || product.SmokingStatus === selectedSmokingStatus;
    // let matchesPrice =
    //   !selectedPrice ||
    //   (product.price >= selectedPrice.min &&
    //     product.price <= selectedPrice.max);
    
let matchesAge = true;
if (selectedAge && typeof selectedAge === "object") {
  const productAge = Number(product.age);
  if (!isNaN(productAge)) {
    matchesAge = productAge >= selectedAge.min && productAge <= selectedAge.max;
    console.log("age",matchesAge)
  } else {
    matchesAge = false;
  }
}


    let matchesSampleName =
      selectedSampleName.length === 0 ||
      selectedSampleName.some((name) => product.Analyte.includes(name));

    let matchesSearch =
      searchQuery === "" ||
      product.Analyte.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesSampleType &&
      matchesGender &&
      matchesSmoking &&
      // matchesPrice &&
      matchesAge &&
      matchesSampleName &&
      matchesSearch
    );
  });
console.log("filter",filteredProducts)
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
                    placeholder="Search Analyte..."
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
                selectedSampleType={selectedSampleType}
                setSelectedSampleType={setSelectedSampleType}
                selectedGender={selectedGender}
                setSelectedGender={setSelectedGender}
                selectedSmokingStatus={selectedSmokingStatus}
                setSelectedSmokingStatus={setSelectedSmokingStatus}
                // selectedPrice={selectedPrice}
                // setSelectedPrice={setSelectedPrice}
                selectedAge={selectedAge}
                setSelectedAge={setSelectedAge}
                handleReset={handleReset}
              />
            </div>

            {/* Product Listing */}
            <div className={`col-lg-9 order-first order-lg-last`}>
              <div className="shop__tab-content mb-40">
                <div className="tab-content" id="shop_tab_content">
                  <ProductGridItems
                    itemsPerPage={12}
                    items={filteredProducts}
                    setShowingGridItems={setShowingGridItems}
                    selectedFilters={{
                      sampleType: selectedSampleType,
                      gender: selectedGender,
                      smokingStatus: selectedSmokingStatus,
                      age: selectedAge,
                      sampleNames: selectedSampleName,
                      searchQuery,
                    }}
                  />

                  <ProductListItems
                    itemsPerPage={5}
                    items={filteredProducts}
                    selectedFilters={{
                      sampleType: selectedSampleType,
                      gender: selectedGender,
                      smokingStatus: selectedSmokingStatus,
                      age: selectedAge,
                      sampleNames: selectedSampleName,
                      searchQuery,
                    }}
                    setShowingListItems={setShowingListItems}
                  />
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopArea;
