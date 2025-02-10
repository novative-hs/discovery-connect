import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch } from "react-redux";
// internal
import {Minus,Plus} from "@svg/index";
import { add_cart_product, quantityDecrement, remove_product } from "src/redux/features/cartSlice";

const SingleCartItem = ({item}) => {
  const {_id,samplename,price,quantity=0} = item || {};
  const dispatch = useDispatch()

  // handle add product
  const handleAddProduct = (prd) => {
    dispatch(add_cart_product(prd))
  }

  // handle decrement product
  const handleDecrement = (prd) => {
    dispatch(quantityDecrement(prd))
  }

  // handle remove product
  const handleRemovePrd = (prd) => {
    dispatch(remove_product(prd))
  }

  // handleChange
  const handleChange = (e) => {}
  return (
    <tr>
      {/* <td className="product-thumbnail"> */}
        {/* <Link href={`product-details/${_id}`}>
          <Image src={image} alt="cart img" width={125} height={125} />
        </Link> */}
      {/* </td> */}
      <td className="product-name">
        <Link href={`product-details/${_id}`}>{samplename}</Link>
      </td>
      <td className="product-price">
        <span className="amount">{price}</span>
      </td>
      <td className="product-quantity">
      <span className="quantity">{quantity}</span>
        {/* <div className="tp-product-quantity mt-10 mb-10"> */}
          {/* <span className="tp-cart-minus" onClick={()=> handleDecrement(item)}>
            <Minus/>
          </span>
          <input className="tp-cart-input" type="text" value={quantity} onChange={handleChange} />
          <span className="tp-cart-plus" onClick={()=> handleAddProduct(item)}>
            <Plus/>
          </span> */}
        {/* </div> */}
      </td>
      <td className="product-subtotal">
        <span className="amount">{(price * quantity).toFixed(2)}</span>
      </td>
      <td className="product-remove">
        <button type="submit" onClick={()=> handleRemovePrd(item)}>
          <i className="fa fa-times"></i>
        </button>
      </td>
    </tr>
    
  );
};

export default SingleCartItem;
