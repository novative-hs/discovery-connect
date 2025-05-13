import { apiSlice } from "src/redux/api/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  overrideExisting:true,
  endpoints: (builder) => ({
    // get all samples
    getAllSamples: builder.query({
      query: () => "api/sample/getAllSamples",
    }),
    // get discount products
    getDiscountProducts: builder.query({
      query: () => `api/products/discount`,
      providesTags: ["Discount"],
      keepUnusedDataFor: 600,
    }),
    // get single product
    getProduct: builder.query({
      query: (id) => `api/sample/${id}`,
      providesTags: (result, error, arg) => [{ type: "sample", id: arg }],
      invalidatesTags: (result, error, arg) => [
        { type: "RelatedSamples", id },
      ],
    }),
    // getRelatedProducts
    getRelatedProducts: builder.query({
      query: ({ id, tags }) => {
        const queryString = 
        `api/products/relatedProduct?tags=${tags.join(",")}`;
        return queryString;
      },
      providesTags: (result, error, arg) => [
        { type: "RelatedProducts", id: arg.id },
      ],
      invalidatesTags: (result, error, arg) => [
        { type: "Product", id: arg.id },
      ],
    }),
    getSampleFields: builder.query({
      query: (tableName) => `api/samplefields/get-samplefields/${tableName}`,
      keepUnusedDataFor: 600,
    }),
    
  }),
});

export const {
  useGetShowingProductsQuery,
  useGetDiscountProductsQuery,
  useGetProductQuery,
  useGetAllSamplesQuery,
  useGetRelatedProductsQuery,
  useGetSampleFieldsQuery
} = authApi;
