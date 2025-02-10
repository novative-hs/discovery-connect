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
      console.log("Product added to cart:", payload);
      const isExist = state.cart_products.some((item) => item.id === payload.id);
      if (!isExist) {
        const newItem = {
          ...payload,
          orderQuantity: 1,
        };
        state.cart_products = [...state.cart_products, newItem];
        notifySuccess(`Sampel added to cart`);
      } else {
        state.cart_products = state.cart_products.map((item) => {
          if (item.id === payload.id) {
            if (item.quantity >= item.orderQuantity + state.orderQuantity) {
              item.orderQuantity =
                state.orderQuantity !== 1
                  ? state.orderQuantity + item.orderQuantity
                  : item.orderQuantity + 1;
              notifySuccess(`${state.orderQuantity} ${item.samplename} added to cart`);
            } else {
              notifyError("No more quantity available for this product!");
              state.orderQuantity = 1;
            }
          }
          return item;
        });
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
    remove_product: (state, { payload }) => {
      console.log("Removing product with id:", payload.id);
      state.cart_products = state.cart_products.filter(
        (item) => item.id !== payload.id
      );
      console.log("Updated cart_products:", state.cart_products);
    
      setLocalStorage("cart_products", state.cart_products);
    },
    get_cart_products: (state, action) => {
      state.cart_products = getLocalStorage("cart_products");
    },
    initialOrderQuantity: (state, { payload }) => {
      state.orderQuantity = 1;
    },
    clear_cart: (state) => {
      state.cart_products = []; // Clear all items
      setLocalStorage("cart_products", state.cart_products); // Update local storage
      notifySuccess("Cart has been cleared successfully!"); // Optional notification
    },
  },
});


export const { 
  add_cart_product, 
  quantityIncrement, 
  quantityDecrement, 
  remove_product, 
  get_cart_products,
  remove_product,
  clear_cart,
  quantityDecrement,
  initialOrderQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
