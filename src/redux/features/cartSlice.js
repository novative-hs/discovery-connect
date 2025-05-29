import { createSlice } from "@reduxjs/toolkit";
import { getsessionStorage, setsessionStorage } from "@utils/sessionStorage";
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
      const isExist = state.cart_products.some((item) => item.id === payload.id);

      if (!isExist) {
        const newItem = {
          ...payload,
          orderQuantity: 1,
          volumes: payload.volumes || 1, // Ensure volumes is always saved
          addedAt: new Date().toISOString(),
        };
        state.cart_products = [...state.cart_products, newItem];
        notifySuccess(`Sample added to cart`);
      } else {
        state.cart_products = state.cart_products.map((item) => {
          if (item.id === payload.id) {
            if (item.quantity >= item.orderQuantity + 1) {
              item.orderQuantity += 1;
              notifySuccess(`${item.diseasename} quantity updated in cart`);
            } else {
              notifyError("No more quantity available for this product!");
            }
          }
          return item;
        });
      }

      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
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
    },

    decrement: (state, { payload }) => {
      const cartItem = state.cart_products.find(item => item.id === payload.id);
      if (cartItem && cartItem.orderQuantity > 1) {
        cartItem.orderQuantity -= 1;
      }
      state.cart_products = [...state.cart_products];
      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
    },

    quantityDecrement: (state, { payload }) => {
      state.cart_products.map((item) => {
        if (item._id === payload._id && item.orderQuantity > 1) {
          item.orderQuantity = item.orderQuantity - 1;
        }
        return { ...item };
      });
      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
    },

    remove_product: (state, { payload }) => {
      state.cart_products = state.cart_products.filter(
        (item) => item.id !== payload.id
      );
      setsessionStorage(CART_STORAGE_KEY, state.cart_products);
    },

    get_cart_products: (state) => {
      const storedCart = getsessionStorage(CART_STORAGE_KEY) || [];

      if (isCartExpired(storedCart)) {
        state.cart_products = [];
        setsessionStorage(CART_STORAGE_KEY, []);

        notifyError("Your cart has been emptied because the items were not checked out within 2 days.");

      } else {
        state.cart_products = storedCart;
      }
    },

    initialOrderQuantity: (state) => {
      state.orderQuantity = 1;
    },

    clear_cart: (state) => {
      state.cart_products = [];
      setsessionStorage(CART_STORAGE_KEY, []);
    },

    updateQuantity: (state, action) => {
      const item = state.cart_products.find((prod) => prod.id === action.payload.id);
      if (item) {
        item.orderQuantity = action.payload.quantity || 1;
        setsessionStorage(CART_STORAGE_KEY, state.cart_products);
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
  updateQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
