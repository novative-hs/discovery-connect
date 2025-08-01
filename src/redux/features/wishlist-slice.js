import { createSlice } from "@reduxjs/toolkit";
import { getsessionStorage, setsessionStorage } from "@utils/sessionStorage";
import { notifyError, notifySuccess } from "@utils/toast";

const initialState = {
  wishlist: [],
};

export const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    add_to_wishlist: (state, { payload }) => {
      const isExist = state.wishlist.some(item => item._id === payload._id);
      if (!isExist) {
        state.wishlist.push(payload);
       
        notifySuccess(`${payload.title} added to wishlist`); // Access the product title here
      } else {
        state.wishlist = state.wishlist.filter(item => item._id !== payload._id);
        notifyError(`${payload.title} removed from wishlist`); // Access the product title here
      }
      setsessionStorage("wishlist_items", state.wishlist);
    },
    remove_wishlist_product: (state, { payload }) => {

      state.wishlist = state.wishlist.filter((item) => item._id !== payload._id);
      notifyError(`${payload.title} removed from wishlist`);
      setsessionStorage("wishlist_items", state.wishlist);
    },
    get_wishlist_products: (state, { payload }) => {
      state.wishlist = getsessionStorage("wishlist_items");
    },
  },
});

export const {
  add_to_wishlist,
  remove_wishlist_product,
  get_wishlist_products,
} = wishlistSlice.actions;
export default wishlistSlice.reducer;
