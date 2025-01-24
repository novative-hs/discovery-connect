import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useCartInfo = () => {
  const cart_product = useSelector((state) => state.cart.cart_product);
  const [total, setTotal] = useState(0); // Initialize total as zero

  useEffect(() => {
    let calculatedTotal = 0;
    cart_product.forEach(cartItem => {
      const { price, orderQuantity, discount } = cartItem;
      const discountAmount = discount || 0; 
      calculatedTotal += (price - (price * discountAmount) / 100) * orderQuantity;
    });
    setTotal(calculatedTotal); // Update total whenever cart changes
  }, [cart_product]);

  return { total };
};

export default useCartInfo;
