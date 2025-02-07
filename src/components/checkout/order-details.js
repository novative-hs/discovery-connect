import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// internal
import useCartInfo from "@hooks/use-cart-info";
import ErrorMessage from "@components/error-message/error";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import axios from "axios";
const OrderDetails = ({cart}) => {
  const schema = Yup.object().shape({
    email: Yup.string().required().email().label("Email"),
    city: Yup.string().required().label("City"),
    country: Yup.string().required().label("Country"),
    district: Yup.string().required().label("District"),
  });
const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });
  return (
    <React.Fragment>
      <tr className="cart-subtotal">
  <th>Cart Subtotal</th>
  <td></td>
  <td></td>
 
  <td className="text-end">
    <span className="amount text-end">
      <strong className="product-quantity">
        ${cart.reduce((acc, item) => acc + (item.samplequantity * item.price), 0).toFixed(2)}
      </strong>
    </span>
  </td>
</tr>

      {/* <tr className="shipping">
        <th>Shipping</th>
        <td className="text-end">
          <ul>
            <li>
              <input
                {...register(`shippingOption`, {
                  required: `Shipping Option is required!`,
                })}
                id="flat_shipping"
                type="radio"
                name="shippingOption"
              />
              <label
              onClick={() => console.log("done")}
                // onClick={() => handleShippingCost(60)}
                htmlFor="flat_shipping"
              >
                <span className="amount">Delivery: Today Cost : $60.00</span>
              </label>
              <ErrorMessage message={errors?.shippingOption?.message} />
            </li>

            <li>
              <input
                {...register(`shippingOption`, {
                  required: `Shipping Option is required!`,
                })}
                id="free_shipping"
                type="radio"
                name="shippingOption"
              />
              <label
                onClick={() => console.log("done")}
                htmlFor="free_shipping"
              >
                Delivery: 7 Days Cost : $20.00
              </label>
              <ErrorMessage message={errors?.shippingOption?.message} />
            </li>
          </ul>
        </td>
      </tr> */}

      {/* <tr className="shipping">
        <th>Shipping Cost</th>
        <td className="text-end">
          <strong>
            <span className="amount">$12</span>
          </strong>
        </td>
      </tr> */}

<tr className="shipping">
  <th>Discount</th>
  
  <td></td>
  <td></td>
  <td className="text-end">
    <strong>
      <span className="amount">
        {cart.reduce((acc, item) => acc + item.discount, 0).toFixed(2)}%
      </span>
    </strong>
  </td>
</tr>


<tr className="order-total">
  <th>Total Order</th>
  
  <td></td>
  <td></td>
  <td className="text-end">
    <strong>
      <span className="amount">
        ${cart.reduce((acc, item) => acc + parseFloat(item.totalpayment), 0).toFixed(2)}
      </span>
    </strong>
  </td>
</tr>

    </React.Fragment>
  );
};

export default OrderDetails;
