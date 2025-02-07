import { createSlice } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@utils/localstorage";
import { notifyError, notifySuccess } from "@utils/toast";

// Initial state
const initialState = {
  cart_product: [], // Default to an empty array
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    add_cart_product: (state, { payload }) => {
      const isExist = state.cart_product.some((i) => i.id === payload.id);
      if (!isExist) {
        state.cart_product.push({ ...payload, orderQuantity: 1 });
        console.log(`${payload.samplename} added to cart`);
      } else {
        console.log("Item already exists in cart!");
      }
    },

    quantityIncrement: (state, { payload }) => {
      const item = state.cart_product.find(item => item.id === payload);
      if (item) {
        item.orderQuantity += 1;
      }
      setLocalStorage("cart_products", state.cart_product);
    },

    quantityDecrement: (state, { payload }) => {
      const item = state.cart_product.find(item => item.id === payload);
      if (item && item.orderQuantity > 1) {
        item.orderQuantity -= 1;
      }
      setLocalStorage("cart_products", state.cart_product);
    },

    remove_product: (state, action) => {
      state.cart_product = state.cart_product.filter((item) => item.id !== action.payload);
      setLocalStorage("cart_products", state.cart_product);
    },

    get_cart_products: (state) => {
      const cartProductsFromStorage = getLocalStorage("cart_products");
      if (cartProductsFromStorage) {
        state.cart_product = cartProductsFromStorage;
      } else {
        state.cart_product = [];
      }
    },

    clear_cart: (state) => {
      state.cart_product = [];
      setLocalStorage("cart_products", []);
    }
  },
});

export const { 
  add_cart_product, 
  quantityIncrement, 
  quantityDecrement, 
  remove_product, 
  get_cart_products,
  clear_cart 
} = cartSlice.actions;

export default cartSlice.reducer;
