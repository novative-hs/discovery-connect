import React, { useState } from "react";
const ShopSidebar = ({
  setSelectedPrice,
  setSelectedSmokingStatus,
  setSelectedGender,
  selectedSampleType,
  setSelectedSampleType,
  handleReset,
  selectedGender,
  selectedSmokingStatus,
  selectedPrice
}) => {
  const priceRanges = [
    { label: "Up to 50", min: 0, max: 50 },
    { label: "50 - 100", min: 50, max: 100 },
    { label: "100 - 200", min: 100, max: 200 },
    { label: "200 - 500", min: 200, max: 500 },
    { label: "500 - 1000", min: 500, max: 1000 },
    { label: "Above 1000", min: 1000, max: Infinity },
  ];

  const smokingOptions = ["Smoker", "Non-Smoker"];
  const genderOptions = ["Male", "Female"];
  const SampleTypeMatrix = [
    "Whole Blood", "Serum", "Plasma", "Urine", "Sputum", "Cerebrospinal Fluid",
    "Synovial Fluid", "Pleural Fluid", "Amniotic Fluid", "Stool", "Semen",
    "Tissue", "Saliva", "Sweat", "Breast Milk", "Cervical",
  ];
  const handleSampleTypeChange = (type) => {
    setSelectedSampleType((prev) => {
      if (!Array.isArray(prev)) prev = [];
      return prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
    });
  };
  return (
    <div className={`shop__sidebar on-left`}>
      {/* Price Filter */}
      <div className="shop__widget tp-accordion">
        <div className="accordion" id="shop_price">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button className="accordion-button" type="button" data-bs-toggle="collapse"
                data-bs-target="#price_widget_collapse">
                Price
              </button>
            </h2>
            <div id="price_widget_collapse" className="accordion-collapse collapse show">
              <div className="accordion-body">
              {priceRanges.map((range, index) => (
  <div key={index} className="shop__widget-list-item">
    <input
      type="radio"
      name="price"
      id={`price-${index}`}
      checked={selectedPrice && selectedPrice.min === range.min && selectedPrice.max === range.max}

      onChange={() => setSelectedPrice({ min: range.min, max: range.max })}
    />
    <label htmlFor={`price-${index}`}>{range.label}</label>
  </div>
))}


              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shop__widget tp-accordion" >
        <div className="accordion" id="smoking">
          <div className="accordion-item">
            <h2 className="accordion-header" id="smoking__widget">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#smoking_widget_collapse"
                aria-expanded="true"
                aria-controls="smoking_widget_collapse"
              >
                Smoking Status
              </button>
            </h2>
            <div
              id="smoking_widget_collapse"
              className="accordion-collapse collapse show"
              aria-labelledby="smoking__widget"
              data-bs-parent="#smoking"
            >
              <div className="accordion-body">
                <div className="shop__widget-list">
                  {smokingOptions.map((status, index) => (
                    <div key={index} className="shop__widget-list-item">
                  <input
  type="radio"
  name="smoking"
  id={`smoking-${status}`}
  checked={selectedSmokingStatus === status}
  onChange={() => setSelectedSmokingStatus(status)}
/>



                      <label htmlFor={`smoking-${status}`}>{status}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shop__widget tp-accordion show" >
        <div className="accordion" id="gender">
          <div className="accordion-item">
            <h2 className="accordion-header" id="gender__widget">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#gender_widget_collapse"
                aria-expanded="true"
                aria-controls="gender_widget_collapse"
              >
                Gender
              </button>
            </h2>
            <div
              id="gender_widget_collapse"
              className="accordion-collapse collapse show"
              aria-labelledby="gender__widget"
              data-bs-parent="#gender"
            >
              <div className="accordion-body">
                <div className="shop__widget-list">
                  {genderOptions.map((gender, index) => (
                    <div key={index} className="shop__widget-list-item">
                    <input
  type="radio"
  name="gender"
  id={`gender-${gender}`}
  checked={selectedGender === gender}
  onChange={() => setSelectedGender(gender)}
/>



                      <label htmlFor={`gender-${gender}`}>{gender}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shop__widget tp-accordion">
        <div className="accordion" id="sample">
          <div className="accordion-item">
            <h2 className="accordion-header" id="sample__widget">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#sample_widget_collapse"
                aria-expanded="true"
                aria-controls="sample_widget_collapse"
              >
                Sample Type
              </button>
            </h2>
            <div
              id="sample_widget_collapse"
              className="accordion-collapse collapse show"
              aria-labelledby="sample__widget"
              data-bs-parent="#sample"
              style={{ height: "200px", overflowY: "auto" }}
            >
              <div className="accordion-body">
                <div className="shop__widget-list">
                  {SampleTypeMatrix.map((type, index) => (
                    <div key={index} className="shop__widget-list-item">
                      <input
                        type="checkbox"
                        id={`sample-${type}`}
                        checked={Array.isArray(selectedSampleType) && selectedSampleType.includes(type)} // ✅ Ensure it's an array
                        onChange={() => handleSampleTypeChange(type)}
                      />


                      <label htmlFor={`sample-${type}`}>{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="shop__widget tp-accordion mt-3">
        <button onClick={handleReset} className="tp-btn w-100">
          Reset Filters
        </button>
      </div>
    </div>
  );
};
export default ShopSidebar;
