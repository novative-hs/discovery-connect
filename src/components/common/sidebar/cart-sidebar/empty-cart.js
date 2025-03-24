import Image from "next/image";
import React from "react";
import { useRouter } from "next/router"; // Import Next.js router
// internal
import empty_img from "@assets/img/product/cartmini/empty-cart.png";

const EmptyCart = ({ search_prd = false }) => {
  const router = useRouter();

  const handleRedirect = (e) => {
    e.preventDefault();
    router.push("/shop");
  };

  return (
    <div className="cartmini__empty text-center">
      <Image src={empty_img} alt="empty img" />
      <p>{search_prd ? `Sorry,😥 we can not find this product` : `Your Cart is empty`}</p>
      {!search_prd && (
        <button onClick={handleRedirect} className="tp-btn">
          Go to Shop
        </button>
      )}
    </div>
  );
};

export default EmptyCart;
