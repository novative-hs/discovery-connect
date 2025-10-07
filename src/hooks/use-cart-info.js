import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { set_cart_products } from "../../src/redux/features/cartSlice";

const CART_STORAGE_KEY = "cart_products";

const useCartInfo = () => {
    const [sampleCount, setSampleCount] = useState(0);
    const [total, setTotal] = useState(0);
    const { cart_products } = useSelector((state) => state.cart);
    const dispatch = useDispatch();

    // 🕒 Step 1: Check expiry & unreserve expired samples
    useEffect(() => {
        const now = new Date();
        const expiredItems = [];
        const validItems = [];

        cart_products.forEach((item) => {
            const addedTime = new Date(item.addedAt);
            const diffHours = (now - addedTime) / (1000 * 60 * 60);

            if (diffHours > 48) {
                expiredItems.push(item);
            } else {
                validItems.push(item);
            }
        });

        if (expiredItems.length > 0) {
            // Remove expired items from frontend state
            dispatch(set_cart_products(validItems));
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validItems));
            sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validItems));

            // 🔁 Unreserve them on backend
            expiredItems.forEach((item) => {
                unreserveSample(item.id);
            });

            console.warn("Some items expired after 48 hours and were removed.");
        }
    }, [cart_products, dispatch]);

    // 💰 Step 2: Calculate total & count
    useEffect(() => {
        const cart = cart_products.reduce(
            (cartTotal, cartItem) => {
                const { originalPrice, orderQuantity, discount } = cartItem;
                cartTotal.sampleCount += 1;

                if (typeof orderQuantity !== "undefined") {
                    if (discount && discount > 0) {
                        const itemTotal =
                            (originalPrice - (originalPrice * discount) / 100) *
                            orderQuantity;
                        cartTotal.total += itemTotal;
                    } else {
                        const itemTotal = originalPrice * orderQuantity;
                        cartTotal.total += itemTotal;
                    }
                }
                return cartTotal;
            },
            { total: 0, sampleCount: 0 }
        );

        setSampleCount(cart.sampleCount);
        setTotal(cart.total);
    }, [cart_products]);

    return {
        sampleCount,
        total,
        setTotal,
    };
};

// 🔁 Step 3: API call (outside React component)
const unreserveSample = async (id) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/reserve`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sampleId: id,
          status: 0,
        }),
      }
    );

    const data = await res.json(); // optional, to see backend response

    if (!res.ok) {
      console.error("Failed to unreserve sample. Status:", res.status, data);
    } 
  } catch (err) {
    console.error("Failed to unreserve sample:", err);
  }
};

export default useCartInfo;
