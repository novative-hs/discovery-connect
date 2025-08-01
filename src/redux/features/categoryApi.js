import { apiSlice } from "src/redux/api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    // getCategories
    getCategories: builder.query({
      query: () => `/api/sample/filterdata`,
      providesTags: ["Category"],
      keepUnusedDataFor: 600,
    }),
  }),
});

export const {
  useGetCategoriesQuery,
} = authApi;
