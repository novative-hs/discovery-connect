import { notifySuccess } from "@utils/toast";
import { apiSlice } from "src/redux/api/apiSlice";
import { userLoggedIn } from "./authSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (data) => ({
        url: "api/user/signup",
        method: "POST",
        body: data,
      }),
    }),

    // login
    loginUser: builder.mutation({
      query: (data) => ({
        url: "api/user/login",
        method: "POST",
        body: data,
      }),

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          sessionStorage.setItem(
            "auth",
            JSON.stringify({
              accessToken: result.data.data.token,
              user: result.data.data.user,
            })
          );

          dispatch(
            userLoggedIn({
              accessToken: result.data.data.token,
              user: result.data.data.user,
            })
          );
        } catch (err) {
          // do nothing
        }
      },
    }),

    // get me
    getUser: builder.query({
      query: () => "api/user/me",

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          dispatch(
            userLoggedIn({
              user: result.data,
            })
          );
        } catch (err) {
          // do nothing
        }
      },
    }),
    // confirmEmail
    confirmEmail: builder.query({
      query: (token) => `api/user/confirmEmail/${token}`,

      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;

          sessionStorage.setItem(
            "auth",
            JSON.stringify({
              accessToken: result.data.data.token,
              user: result.data.data.user,
            })
          );

          dispatch(
            userLoggedIn({
              accessToken: result.data.data.token,
              user: result.data.data.user,
            })
          );
        } catch (err) {
          // do nothing
        }
      },
    }),

    checkEmail: builder.mutation({
      query: (email) => ({
        url: "/api/user/check-email",
        method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ email }), 
      }),
    }),
    sendOTP: builder.mutation({
      query: (email) => ({
        url: "/api/user/send-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/api/user/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),
    
    // reset password
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/api/user/changepassword", 
        method: "PUT",
        body: data,
      }),
    }),
    
    // confirmForgotPassword
    confirmForgotPassword: builder.mutation({
      query: (data) => ({
        url: "api/user/confirm-forget-password",
        method: "PATCH",
        body: data,
      }),
    }),
    // change password
    changePassword: builder.mutation({
      query: (data) => ({
        url: "/api/user/change-password",
        method: "PUT",
        body: data,
      }),
    }),
    // Update Profile
    updateProfile: builder.mutation({
      query: ({ id, formData }) => ({
        url: `api/user/updateProfile/${id}`,
        method: "PUT",
        body: formData, // ✅ correct
        // Do NOT set Content-Type (browser will set it)
      }),
    }),
    
    
    
  }),
});

export const {
  useLoginUserMutation,
  useRegisterUserMutation,
  useConfirmEmailQuery,
  useResetPasswordMutation,
  useConfirmForgotPasswordMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useCheckEmailMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
} = authApi;
