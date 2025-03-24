import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ErrorMessage from "@components/error-message/error";
import ProductLoader from "@components/loader/product-loader";
import { useGetAllSamplesQuery } from "src/redux/features/productApi";

const OfferPopularProduct = () => {
  const { data: categories, isError, isLoading } = useGetAllSamplesQuery();
  const [visible, setVisible] = useState({});
  const productRefs = useRef([]);

  // ✅ Filter valid categories
  const filteredCategories = categories?.filter((category) => category.price !== null) || [];
  const displayedCategories = filteredCategories.slice(0, 6);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = entry.target.dataset.index; // Get index from dataset
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [index]: true }));
          }
        });
      },
      { threshold: 0.2 }
    );

    productRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      productRefs.current.forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, [displayedCategories]); // ✅ Re-run when categories change

  if (isLoading) return <ProductLoader loading={isLoading} />;
  if (isError) return <ErrorMessage message="There was an error loading samples!" />;
  if (displayedCategories.length === 0) return <ErrorMessage message="No samples found!" />;

  return (
    <section className="product__coupon-area product__offer py-5">
      <div className="container">
        {/* Header Section */}
        <div className="row text-center mb-4">
          <div className="col">
            <h3 className="fw-bold text-primary">High-Quality Lab Samples</h3>
          </div>
        </div>

        {/* Product Cards */}
        <div className="row py-4">
          {displayedCategories.map((category, index) => (
            <div
              key={category.id}
              ref={(el) => (productRefs.current[index] = el)}
              data-index={index} // ✅ Add index to dataset for tracking
              className="col-lg-4 col-md-6 col-sm-12 mb-4"
              style={{
                opacity: visible[index] ? 1 : 0,
                transform: visible[index] ? "translateX(0)" : "translateX(-150px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
              }}
            >
              <div className="card border-0 shadow-lg p-3 h-100 text-center rounded-3">
                <div className="product-image mb-3">
                  <img
                    src={category.imageUrl || "/placeholder.jpg"}
                    alt={category.samplename}
                    className="img-fluid rounded-2"
                    style={{ width: "100%", height: "200px", objectFit: "cover" }}
                  />
                </div>
                <h5 className="fw-bold text-primary">{category.samplename}</h5>
                <p className="fs-5 text-dark fw-semibold">
                  {category.price ? `${category.price} ${category.SamplePriceCurrency || ""}` : "Price not available"}
                </p>
                <button className="btn btn-outline-primary mt-2 w-100 fw-bold">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="row text-center mt-4">
          <div className="col">
            <Link href="/shop" className="btn btn-primary fw-bold px-4 py-2">
              Show More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferPopularProduct;
