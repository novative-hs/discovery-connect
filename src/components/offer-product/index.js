import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ErrorMessage from "@components/error-message/error";
import ProductLoader from "@components/loader/product-loader";
import {
  useGetAllSamplesQuery,
  useGetSampleFieldsQuery,
} from "src/redux/features/productApi";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDispatch } from "react-redux";
import { setProduct } from "src/redux/features/productSlice";
import { useRouter } from "next/router";   // ✅ useRouter instead of useNavigate
import { skipToken } from "@reduxjs/toolkit/query";

const OfferPopularProduct = () => {
  const [page, setPage] = useState(1);

  const { data: categories, isLoading, isError } = useGetAllSamplesQuery({
    limit: 20,
    offset: (page - 1) * 20,
  });

  const sampleType = "sampletypematrix";
  const {
    data: sampleFieldsData,
    isLoading: sampleFieldsLoading,
    isError: sampleFieldsError,
  } = useGetSampleFieldsQuery(sampleType || skipToken);

  const router = useRouter();   // ✅ useRouter hook
  const [visible, setVisible] = useState({});
  const productRefs = useRef([]);
  const dispatch = useDispatch();

  const sampleList = categories?.data || [];
  const displayedCategories = sampleList.slice(0, 6);

  useEffect(() => {
    AOS.init({ duration: 500 });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = entry.target.dataset.index;
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
  }, [displayedCategories]);

  if (isLoading || sampleFieldsLoading)
    return <ProductLoader loading={isLoading || sampleFieldsLoading} />;
  if (isError)
    return <ErrorMessage message="There was an error loading samples!" />;
  if (sampleFieldsError)
    return <ErrorMessage message="Error loading sample fields!" />;
  if (displayedCategories.length === 0)
    return <ErrorMessage message="No samples found!" />;

  const handleQuickView = (product) => {
    dispatch(setProduct(product));
    router.push(`/product/${product.id}`);   // ✅ router.push instead of navigate()
  };

  return (
    <section className="product__coupon-area product__offer py-5">
      <div className="container">
        <div className="row text-center mb-4">
          <div className="col">
            <h2 className="fw-bold text-primary">High-Quality Lab Samples</h2>
          </div>
        </div>

        <div className="row gy-4 py-4">
          {displayedCategories.map((category, index) => (
            <div
              key={category.id}
              ref={(el) => (productRefs.current[index] = el)}
              data-index={index}
              className="col-lg-4 col-md-6 col-sm-12"
              style={{
                opacity: visible[index] ? 1 : 0,
                transform: visible[index]
                  ? "translateX(0)"
                  : "translateX(-150px)",
                transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
              }}
            >
              <div
                className="card border-0 shadow-lg p-3 h-100 text-center rounded-3"
                onClick={() => handleQuickView(category)}
                style={{ cursor: "pointer" }}
              >
                <div className="product-image mb-2 m-2">
                  <img
                    src={category.imageUrl || ""}
                    alt={category.Analyte}
                    className="img-fluid rounded-2"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <h5 className="fw-bold text-primary mb-2">{category.Analyte}</h5>
              </div>
            </div>
          ))}
        </div>

        <div className="row text-center mt-4">
          <div className="col">
            <Link
              href="/shop"   // ✅ Next.js Link uses `href` not `to`
              className="fw-bold px-4 py-2 text-white text-decoration-none"
              style={{ backgroundColor: "#003366" }}
            >
              Show More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferPopularProduct;
