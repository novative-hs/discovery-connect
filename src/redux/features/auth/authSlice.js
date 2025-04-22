import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: undefined,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    userLoggedIn: (state, { payload }) => {
      state.accessToken = payload.accessToken;
      state.user = payload.user;
    },
    userLoggedOut: (state) => {
      state.accessToken = undefined;
      state.user = undefined;
      sessionStorage.removeItem("auth")
    },
  },
});

export const { userLoggedIn, userLoggedOut } = authSlice.actions;
export default authSlice.reducer;




// import { createSlice } from '@reduxjs/toolkit';

// const initialState = {
//   user: null, // Ensure this starts as null or an empty object
//   loading: false,
//   error: null,
// };

// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     userLoggedIn(state, action) {
//       state.user = action.payload; // Update user state with payload
//       state.loading = false; // Update loading state
//     },
//     userLoggedOut(state) {
//       state.user = null; // Clear user data on logout
//     },
//     setLoading(state, action) {
//       state.loading = action.payload; // Handle loading state
//     },
//     setError(state, action) {
//       state.error = action.payload; // Handle error state
//     },
//   },
// });

// export const { userLoggedIn, userLoggedOut, setLoading, setError } = authSlice.actions;
// export default authSlice.reducer;
