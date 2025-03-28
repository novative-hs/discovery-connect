import { createSlice } from "@reduxjs/toolkit";
import { getLocalStorage, setLocalStorage } from "@utils/localstorage";
import { notifyError, notifySuccess } from "@utils/toast";

const initialState = {
  cart_products: [],
  orderQuantity: 1, 
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
          orderQuantity: 1, // ✅ Always set initial quantity to 1
        };
        state.cart_products = [...state.cart_products, newItem];
        notifySuccess(`Sample added to cart`);
      } else {
        state.cart_products = state.cart_products.map((item) => {
          if (item.id === payload.id) {
            if (item.quantity >= item.orderQuantity + 1) {
              item.orderQuantity += 1; // ✅ Increase by 1, not `state.orderQuantity`
              notifySuccess(`${item.samplename} quantity updated in cart`);
            } else {
              notifyError("No more quantity available for this product!");
            }
          }
          return item;
        });
      }
    
      setLocalStorage("cart_products", state.cart_products);
    },
    
    // increment: (state, { payload }) => {
    //   state.quantity = state.quantity + 1;
    // },
    // decrement: (state, { payload }) => {
    //   state.quantity =
    //     state.quantity > 1
    //       ? state.quantity - 1
    //       : (state.quantity = 1);
    // },

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
      setLocalStorage("cart_products", state.cart_products);
    },
    
    decrement: (state, { payload }) => {
      const cartItem = state.cart_products.find(item => item.id === payload.id);
      if (cartItem) {
        if (cartItem.orderQuantity > 1) {
          cartItem.orderQuantity -= 1;
        }
      }
      state.cart_products = [...state.cart_products]; // Force Redux to recognize the change
      setLocalStorage("cart_products", state.cart_products);
    },
    quantityDecrement: (state, { payload }) => {
      state.cart_products.map((item) => {
        if (item._id === payload._id) {
          if (item.orderQuantity > 1) {
            item.orderQuantity = item.orderQuantity - 1;
          }
        }
        return { ...item };
      });
      setLocalStorage("cart_products", state.cart_products);
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
     // notifySuccess("Cart has been cleared successfully!"); // Optional notification
    },
    updateQuantity: (state, action) => {
      const item = state.cart_products.find((prod) => prod.id === action.payload.id);
      if (item) {
        item.orderQuantity = action.payload.quantity || 1;
        setLocalStorage("cart_products", state.cart_products);
      }
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
  updateQuantity
} = cartSlice.actions;
export default cartSlice.reducer;