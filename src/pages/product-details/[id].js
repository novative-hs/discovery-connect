import { useEffect, useLayoutEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
// internal

import SEO from "@components/seo";
import Header from "@layout/header";
import Wrapper from "@layout/wrapper";
import { useGetProductQuery } from "src/redux/features/productApi";
import ErrorMessage from "@components/error-message/error";
import { initialOrderQuantity } from "src/redux/features/cartSlice";
import PrdDetailsLoader from "@components/loader/details-loader";
// internal

export default function DynamicShopDetails({ query }) {
  const { data: product, isLoading, isError } = useGetProductQuery(query.id);
  const router = useRouter();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(initialOrderQuantity());
  }, [dispatch]);
  // remove backdrop
  useLayoutEffect(() => {
    const removeBackdrop = () => {
      const modalBackdrop = document.querySelector(".modal-backdrop");
      if (modalBackdrop) {
        modalBackdrop.remove();
        document.body.classList.remove("modal-open");
        document.body.removeAttribute("style");
      }
    };
    router.events.on("routeChangeComplete", removeBackdrop);
    return () => {
      router.events.off("routeChangeComplete", removeBackdrop);
    };
  }, [router]);
  // decide what to render
  let content = null;

  if (isLoading) {
    content = <PrdDetailsLoader loading={isLoading} />;
  }

  if (!isLoading && isError) {
    content = <ErrorMessage message="There was an error" />;
  }

  return (
    <Wrapper>
      <SEO pageTitle={"Shop Details"} />
      <Header style_2={true} />
      {content}
      
      {/* <Footer /> */}
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
