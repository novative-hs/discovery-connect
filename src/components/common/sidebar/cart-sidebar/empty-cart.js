import Image from "next/image";
import React from "react";
import Link from "next/link";
import { useRouter } from 'next/router';
// internal
import empty_img from "@assets/img/product/cartmini/empty-cart.png";

const EmptyCart = ({ search_prd = false }) => {
  const router = useRouter();
  return (
    <div className="cartmini__empty text-center">
      <Image src={empty_img} alt="empty img" />
      <p>{search_prd ? `Sorry,😥 we can not find this product` : `Your Cart is empty`}</p>
      {!search_prd && (
          <button
          onClick={() =>
            router.push("/dashboardheader")}
          type="button"
          className="tp-btn mb-10 w-100"
        >
          <span>Go to Shop</span>
        </button>
       
        
      )}
    </div>
  );
};

export default EmptyCart;
