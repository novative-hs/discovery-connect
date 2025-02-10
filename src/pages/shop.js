import { useState, useEffect } from "react";
// internal
import Wrapper from "@layout/wrapper";
import SEO from "@components/seo";
import Header from "@layout/header";
import Footer from "@layout/footer";
import ShopBreadcrumb from "@components/common/breadcrumb/shop-breadcrumb";
import ShopArea from "@components/shop/shop-area";
import ErrorMessage from "@components/error-message/error";
import ShopLoader from "@components/loader/shop-loader";
// Import API hook
import { useGetAllSamplesQuery } from "src/redux/features/productApi";

export default function Shop({ query }) {
  const { data: samples, isError, isLoading, error } = useGetAllSamplesQuery();
  const [shortValue, setShortValue] = useState("");

  useEffect(() => {
    console.log("Sample Data:", samples);
    console.log("Is Loading:", isLoading);
    console.log("Is Error:", isError);
    console.log("Error:", error); // Log any errors
  }, [samples, isLoading, isError, error]);

  // Select Short Handler
  const selectShortHandler = (e) => {
    setShortValue(e.value);
  };

  // Render Logic
  let content = null;

  if (isLoading) {
    content = <ShopLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    console.error("Error fetching samples:", error);
    content = <ErrorMessage message="There was an error loading samples." />;
  }

  if (!isLoading && !isError && samples?.length === 0) {
    content = <ErrorMessage message="No samples found!" />;
  }

  if (!isLoading && !isError && samples?.length > 0) {
    let all_samples = samples;

    let filtered_samples = all_samples;

    // Example filtering logic (customize as needed)
    const { priceMin, priceMax } = query;
    if (priceMin || priceMax) {
      filtered_samples = filtered_samples.filter((sample) => {
        const price = Number(sample.price);
        return (
          (priceMin ? price >= Number(priceMin) : true) &&
          (priceMax ? price <= Number(priceMax) : true)
        );
      });
    }

    // Sorting logic
    if (shortValue === "Price low to high") {
      filtered_samples = filtered_samples.sort((a, b) => a.price - b.price);
    } else if (shortValue === "Price high to low") {
      filtered_samples = filtered_samples.sort((a, b) => b.price - a.price);
    }

    content = (
      <ShopArea
        products={filtered_samples}
        all_products={all_samples}
        shortHandler={selectShortHandler}
      />
    );
    console.log("sampledata on shop page is:", content)
  }

  return (
    <Wrapper>
      <SEO pageTitle={"Shop"} />
      <Header style_2={true} />
      <ShopBreadcrumb />
      {content}
      <Footer />
    </Wrapper>
  );
}

export const getServerSideProps = async (context) => {
  const { query } = context;

  return {
    props: {
      query,
    },
  };
};
