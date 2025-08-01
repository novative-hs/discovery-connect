import { useState, useEffect, useMemo } from "react";
// internal
import Wrapper from "@layout/wrapper";
import SEO from "@components/seo";
import Header from "@layout/header";
import DashboardHeader from "@layout/dashboardheader";
import Footer from "@layout/footer";
import ShopBreadcrumb from "@components/common/breadcrumb/shop-breadcrumb";
import ShopArea from "@components/shop/shop-area";
import DashboardArea from "@components/user-dashboard/dashboard-area";
import ErrorMessage from "@components/error-message/error";
import ShopLoader from "@components/loader/shop-loader";
import { useRouter } from "next/router";
// Import API hook
import { useGetAllSamplesQuery } from "src/redux/features/productApi";

export default function Shop({ query }) {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { data: response, isError, isLoading, error } = useGetAllSamplesQuery(router.asPath);
  const samples = response?.data;
  const [shortValue, setShortValue] = useState("");


  const [activeTab, setActiveTab] = useState("order-info");


  // Check sessionStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = sessionStorage.getItem("userID");
      setUserId(id);
      setLoadingUser(false);
    }
  }, []);
  // Select Short Handler
  const selectShortHandler = (e) => {
    setShortValue(e.value);
  };

const getDistinctAnalytes = (samples) => {
  
  const analyteMap = new Map();

  samples.forEach(sample => {
    const name = sample.analyte?.trim();

    // ⚠️ TEMP FIX: Allow empty analyte names (not ideal)
    if (Number(sample.total_stock) <= 0) return;

    const key = name || sample.id; // Use ID to make key unique if no analyte

    if (!analyteMap.has(key)) {
      analyteMap.set(key, { ...sample });
    } else {
      const existing = analyteMap.get(key);
      existing.total_stock = (Number(existing.total_stock) || 0) + (Number(sample.total_stock) || 0);
      existing.total_allocated = (Number(existing.total_allocated) || 0) + (Number(sample.total_allocated) || 0);
      existing.total_remaining = Math.max(0, existing.total_stock - existing.total_allocated);
    }
  });

  return Array.from(analyteMap.values());
};


  // Filtering and Sorting
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

    return getDistinctAnalytes(sortedSamples);


  }, [samples, shortValue, router.query]);


  // Render Logic
  let content = null;

  if (isLoading) {
    content = <ShopLoader loading={isLoading} />;
  } else if (isError) {

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
    <ShopArea
  products={filtered_samples}
  all_products={samples}
  shortHandler={selectShortHandler}
/>

    );
  }
  // Prevent flicker before sessionStorage is read
  if (loadingUser) return <div>Loading...</div>;

  return (
    <Wrapper>
      <SEO pageTitle={"Shop"} />
      {userId ? (
        <>
          {content}
        </>
      ) : (
        // Flex column layout to push footer to bottom
        <div className="min-h-screen flex flex-col">
          <Header style_2={true} />
          <ShopBreadcrumb />
          <main className="flex-grow">
            {content}
          </main>

          <Footer />
        </div>
      )}
    </Wrapper>
  );

}

export const getServerSideProps = async (context) => {
  const { query } = context;
  return { props: { query } };
};
