import Image from "next/image";
import React from "react";
import { useRouter } from "next/router";
// internal
import empty_img from "@assets/img/product/cartmini/empty-cart.png";

const EmptyCart = ({ search_prd = false }) => {
  const router = useRouter();

  const handleRedirect = (e) => {
    e.preventDefault();
    const id = sessionStorage.getItem("userID");
    if (id) {
      router.push("/dashboardheader?tab=Booksamples");
    } else {
      router.push("/shop");
    }
  };

  return (
    <div className="cartmini__empty text-center mt-0">
    
    <p className="mt-3 fs-5 text-muted">
      {search_prd 
        ? `Sorry 😥, we couldn't find any matching results for your search. Please try different keywords.` 
        : `Your cart is currently empty. Start exploring our samples and add items`}
    </p>
  </div>
  
  );
};

export default EmptyCart;
