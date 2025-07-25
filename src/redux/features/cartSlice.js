import { createSlice } from "@reduxjs/toolkit";
import { getsessionStorage, setsessionStorage, getLocalStorage, setLocalStorage } from "@utils/sessionStorage";
import { notifyError, notifySuccess } from "@utils/toast";

const CART_STORAGE_KEY = "cart_products";
const CART_EXPIRY_DAYS = 2;

const initialState = {
  cart_products: [],
  orderQuantity: 1,
};

const isCartExpired = (cartProducts) => {
  if (!Array.isArray(cartProducts) || cartProducts.length === 0) return false;

  const now = new Date();
  const oldestItem = cartProducts.reduce((oldest, current) =>
    new Date(current.addedAt) < new Date(oldest.addedAt) ? current : oldest
  );

  const diffInMs = now - new Date(oldestItem.addedAt);
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24); // convert ms to days

  return diffInDays > CART_EXPIRY_DAYS;
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    add_cart_product: (state, { payload }) => {
      const now = new Date();
      const cartItems = state.cart_products;

      const isExpired = (item) => {
        const addedTime = new Date(item.addedAt);
        const diffHours = (now - addedTime) / (1000 * 60 * 60);
        return diffHours > 48;
      };

      // Remove expired items and unreserve them
      const updatedCart = cartItems.filter(item => {
        if (isExpired(item)) {
          // 👇 Call API to set reserved = 0
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/${item.id}/reserve/0`, {
            method: "PUT"
          }).catch((err) => {
            console.error("Failed to unreserve sample:", err);
          });
          return false; // remove from cart
        }
        return true; // keep in cart
      });

      // Check if the new sample is already in the updated cart
      const isExist = updatedCart.some((item) => item.id === payload.id);

      if (!isExist) {
        const newItem = {
          ...payload,
          isLocked: true,
          orderQuantity: 1,
          volumes: payload.volumes || 1,
          addedAt: now.toISOString(),
          imageUrl: payload.imageUrl,
        };
        state.cart_products = [...updatedCart, newItem];
        notifySuccess(`Sample added to cart`);
      } else {
        state.cart_products = [...updatedCart]; // keep updated cart
        notifyError("This sample is already in your cart.");
      }

      setsessionStorage("cart_products", state.cart_products);
      setLocalStorage("cart_products", state.cart_products)
    },
    increment: (state, { payload }) => {
      const cartItem = state.cart_products.find(item => item.id === payload.id);
      if (cartItem) {
        if (cartItem.orderQuantity < cartItem.quantity) {
          cartItem.orderQuantity += 1;
        } else {
          notifyError("No more quantity available for this product!");
        }
      }
      state.cart_products = [...state.cart_products];
      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
      setLocalStorage(CART_STORAGE_KEY, state.cart_products);
    },

    decrement: (state, { payload }) => {
      const cartItem = state.cart_products.find(item => item.id === payload.id);
      if (cartItem && cartItem.orderQuantity > 1) {
        cartItem.orderQuantity -= 1;
      }
      state.cart_products = [...state.cart_products];
      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
      setLocalStorage(CART_STORAGE_KEY, state.cart_products);
    },

    quantityDecrement: (state, { payload }) => {
      state.cart_products.map((item) => {
        if (item._id === payload._id && item.orderQuantity > 1) {
          item.orderQuantity = item.orderQuantity - 1;
        }
        return { ...item };
      });
      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
      setLocalStorage(CART_STORAGE_KEY, state.cart_products);
    },

    remove_product: (state, { payload }) => {
      const removedItem = state.cart_products.find(item => item.id === payload.id);

      if (removedItem) {
        // Call API to set reserved = 0
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/${removedItem.id}/reserve/0`, {
          method: "PUT"
        }).catch((err) => {
          console.error("Failed to unreserve sample:", err);
        });
      }

      // Remove from cart
      state.cart_products = state.cart_products.filter(item => item.id !== payload.id);

      // Update session storage
      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
      setLocalStorage(CART_STORAGE_KEY, state.cart_products);
    },

    get_cart_products: (state) => {
      const storedCart = getLocalStorage(CART_STORAGE_KEY) || [];
      const now = new Date();

      const updatedCart = storedCart.filter((item) => {
        const addedTime = new Date(item.addedAt);
        const diffHours = (now - addedTime) / (1000 * 60 * 60);

        const isExpired = diffHours > 48;
        if (isExpired) {
          // Call API to unreserve
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sample/${item.id}/reserve/0`, {
            method: "PUT",
          }).catch((err) => {
            console.error("Failed to unreserve sample:", err);
          });
        }
        return !isExpired;
      });

      if (updatedCart.length < storedCart.length) {
        notifyError("Some expired items were removed from your cart.");
      }

      state.cart_products = updatedCart;
      setLocalStorage(CART_STORAGE_KEY, updatedCart);
      setsessionStorage(CART_STORAGE_KEY, updatedCart);
    },

    initialOrderQuantity: (state) => {
      state.orderQuantity = 1;
    },

    clear_cart: (state) => {
      state.cart_products = [];
      setsessionStorage(CART_STORAGE_KEY, []);
      setLocalStorage(CART_STORAGE_KEY, [])
    },

    updateQuantity: (state, action) => {
      const item = state.cart_products.find((prod) => prod.id === action.payload.id);
      if (item) {
        item.orderQuantity = action.payload.quantity || 1;
        setsessionStorage(CART_STORAGE_KEY, state.cart_products);
        setLocalStorage(CART_STORAGE_KEY, state.cart_products);
      }
    },
    set_cart_products: (state, { payload }) => {
      state.cart_products = payload;
      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
      setLocalStorage(CART_STORAGE_KEY, state.cart_products);
    },
  },


});

export const {
  add_cart_product,
  increment,
  decrement,
  get_cart_products,
  remove_product,
  clear_cart,
  quantityDecrement,
  initialOrderQuantity,
  updateQuantity,
  set_cart_products,
} = cartSlice.actions;

export default cartSlice.reducer;
