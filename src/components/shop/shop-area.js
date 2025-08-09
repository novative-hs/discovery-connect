import React, { useState, useMemo } from "react";
import { ShopShortSelect, ShopShortTab, ShowingResult } from "./shop-top-bar";
import ShopSidebar from "@components/common/sidebar/shop-sidebar/index";
import ProductGridItems from "./prd-grid-items";
import ProductListItems from "./prd-list-items";

const ShopArea = ({ products, all_products, shortHandler }) => {
  const [showingGridItems, setShowingGridItems] = useState(0);
  const [showingListItems, setShowingListItems] = useState(0);
  const [tabActive, setActiveTab] = useState("grid");
  const id = sessionStorage.getItem("userID");

  // Filter states
  const [selectedSampleType, setSelectedSampleType] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedSmokingStatus, setSelectedSmokingStatus] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedSampleName, setSelectedSampleName] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTab = (value) => setActiveTab(value);

  const handleReset = () => {
    setSelectedSampleType(null);
    setSelectedGender(null);
    setSelectedSmokingStatus(null);
    setSelectedAge(null);
    setSelectedSampleName([]);
    setSearchQuery("");
  };

  // Step 1: Filter data
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      let matchesSampleType =
        !selectedSampleType || product.SampleTypeMatrix?.includes(selectedSampleType);

      let matchesGender = !selectedGender || product.gender === selectedGender;
      let matchesSmoking =
        !selectedSmokingStatus || product.SmokingStatus === selectedSmokingStatus;

      let matchesAge = true;
      if (selectedAge && typeof selectedAge === "object") {
        const productAge = Number(product.age);
        matchesAge =
          !isNaN(productAge) &&
          productAge >= selectedAge.min &&
          productAge <= selectedAge.max;
      }

      let matchesSampleName =
        selectedSampleName.length === 0 ||
        selectedSampleName.some((name) => product.Analyte?.includes(name));

      let matchesSearch =
        searchQuery === "" ||
        product.Analyte?.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchesSampleType &&
        matchesGender &&
        matchesSmoking &&
        matchesAge &&
        matchesSampleName &&
        matchesSearch
      );
    });
  }, [
    products,
    selectedSampleType,
    selectedGender,
    selectedSmokingStatus,
    selectedAge,
    selectedSampleName,
    searchQuery,
  ]);

  // Step 2: Aggregate quantities per analyte from filteredProducts
const aggregatedProducts = useMemo(() => {
  const analyteMap = new Map();

  filteredProducts.forEach((sample) => {
    const analyteNameKey = sample.Analyte?.trim().toLowerCase();
    if (!analyteNameKey) return;

    const quantity = Number(sample.quantity) || 0;
    const allocated = Number(sample.quantity_allocated) || 0;

    if (!analyteMap.has(analyteNameKey)) {
      analyteMap.set(analyteNameKey, {
        Analyte: sample.Analyte.trim(),
        analyteImage: sample.image || sample.analyteImage || "",
        total_stock: quantity,
        total_allocated: allocated,
      });
    } else {
      const existing = analyteMap.get(analyteNameKey);
      existing.total_stock += quantity;
      existing.total_allocated += allocated;
    }
  });

  return Array.from(analyteMap.values()).map((item) => ({
    ...item,
    total_remaining: item.total_stock - item.total_allocated,
  }));
}, [filteredProducts]);


  console.log(
  "Zinc samples in all products:",
  products.filter(p => p.Analyte?.trim().toLowerCase() === "zinc")
);
console.log(
  "Zinc samples in filtered products:",
  filteredProducts.filter(p => p.Analyte?.trim().toLowerCase() === "zinc")
);


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
                show={tabActive === "grid" ? showingGridItems : showingListItems}
                total={aggregatedProducts.length}
              />
              
            </div>

            {/* Search */}
            <div className="col-lg-6 col-md-7">
              <div className="shop__sort d-flex align-items-center justify-content-between">
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
                    items={aggregatedProducts}
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
                    items={aggregatedProducts}
                    setShowingListItems={setShowingListItems}
                    selectedFilters={{
                      sampleType: selectedSampleType,
                      gender: selectedGender,
                      smokingStatus: selectedSmokingStatus,
                      age: selectedAge,
                      sampleNames: selectedSampleName,
                      searchQuery,
                    }}
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
