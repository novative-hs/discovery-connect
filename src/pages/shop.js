import { useState, useEffect, useMemo } from "react";
import Wrapper from "@layout/wrapper";
import SEO from "@components/seo";
import Header from "@layout/header";
import Footer from "@layout/footer";
import ShopBreadcrumb from "@components/common/breadcrumb/shop-breadcrumb";
import ShopArea from "@components/shop/shop-area";
import ErrorMessage from "@components/error-message/error";
import ShopLoader from "@components/loader/shop-loader";
import { useRouter } from "next/router";
import { useGetAllSamplesQuery } from "src/redux/features/productApi";

export default function Shop({ query }) {
  const router = useRouter();
  const page = Number(router.query.page) || 1;
  const perPage = 1000;
  const queryParams = {
    ...router.query,
    limit: perPage,
    offset: 0,
  };
  

  const { data, isError, isLoading, error } = useGetAllSamplesQuery(queryParams);
  const samples = data?.data || [];
  const totalCount = data?.totalCount || 0;

  const [shortValue, setShortValue] = useState("");

  const selectShortHandler = (e) => {
    setShortValue(e.value);
  };

  const filtered_samples = useMemo(() => {
    if (!samples) return [];

    let sortedSamples = [...samples];
    const { priceMin, priceMax } = router.query || {};

    if (priceMin || priceMax) {
      sortedSamples = sortedSamples.filter((sample) => {
        const price = Number(sample.price);
        return (
          (priceMin ? price >= Number(priceMin) : true) &&
          (priceMax ? price <= Number(priceMax) : true)
        );
      });
    }

    if (shortValue === "Price low to high") {
      sortedSamples.sort((a, b) => a.price - b.price);
    } else if (shortValue === "Price high to low") {
      sortedSamples.sort((a, b) => b.price - a.price);
    }

    return sortedSamples;
  }, [samples, shortValue, query]);

  let content;

  if (isLoading) {
    content = <ShopLoader loading={isLoading} />;
  } else if (isError) {
    console.error("Error fetching samples:", error);
    content = <ErrorMessage message="There was an error loading samples." />;
  } else if (filtered_samples.length === 0) {
    content = (
      <>
        <style jsx>{`
          @keyframes blink {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
          }
          .blinking-text {
            animation: blink 1s infinite;
          }
        `}</style>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '33vh' }}>
          <div className="text-center fw-bold blinking-text" style={{ color: 'red', fontSize: '2rem', fontWeight: 'bold' }}>
            Sorry, No samples found!
          </div>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <ShopArea
          products={filtered_samples}
          all_products={samples}
          shortHandler={selectShortHandler}
          totalCount={totalCount} // Pass the totalCount here
        />
      </>
    );
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
  return { props: { query } };
};