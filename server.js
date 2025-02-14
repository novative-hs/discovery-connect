// server.js
require("dotenv").config(); //load the env variable
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import CORS
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const researcherRoutes = require("./routes/researcherRoutes");
const committeememberRoutes = require("./routes/committeememberRoutes");
const sampleRoutes = require("./routes/sampleRoutes");
const sampleDispatchRoutes = require("./routes/sampledispatchRoutes");
const sampleReceiveRoutes = require("./routes/samplereceiveRoutes");
const collectionSiteRoutes = require("./routes/collectionsiteRoutes");
const organizationRoutes = require("./routes/organizationRoutes");
const cartRoutes = require("./routes/cartRoutes");
const cityRoutes = require("./routes/cityRoutes");
const DistrictRoutes = require("./routes/districtRoutes");
const CountryRoutes = require("./routes/countryRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const {
  fetchProducts,
  getProductById,
} = require("./controller/productController");
const biobankRoutes = require("./routes/biobankRoutes");
const biobanksampledispacthRoutes = require("./routes/biobanksampledispatchRoutes");
const ethnictiyRoutes = require("./routes/ethnicityRoutes");
const sampleconditionRoutes = require("./routes/sampleconditionRoutes");
const storagetemperatureRoutes = require("./routes/storagetemperatureRoutes");
const containertypeRoutes = require("./routes/containertypeRoutes");
const quantityunitRoutes = require("./routes/quantityunitRoutes");
const sampletypematrixRoutes = require("./routes/sampletypematrixRoutes");
const testmethodRoutes = require("./routes/testmethodRoutes");
const testresultunitRoutes = require("./routes/testresultunitRoutes");
const testsystemRoutes = require("./routes/testsystemRoutes");
const testsystemmanufecturerRoutes = require("./routes/testsystemmanufecturerRoutes");
const testkitmanufacturerRoutes = require("./routes/testkitmanufacturerRoutes");
const concurrentmedicalconditionsRoutes = require("./routes/concurrentmedicalconditionsRoutes");
const historyRoutes = require("./routes/historyRoutes");

// Routes
app.use('/api', historyRoutes); 
app.use("/api/user", registrationRoutes);
app.use("/api/district", DistrictRoutes);
app.use("/api/city", cityRoutes);
app.use("/api/country", CountryRoutes);
app.use("/api", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.get("/api/products/show", fetchProducts);
app.get("/api/products/:id", getProductById);
app.use("/api", researcherRoutes);
app.use("/api/committeemember", committeememberRoutes);
app.use("/api", sampleRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/sampledispatch", sampleDispatchRoutes);
app.use("/api/samplereceive", sampleReceiveRoutes);
app.use("/api/collectionsite", collectionSiteRoutes);
app.use("/api/admin/organization", organizationRoutes);
app.use("/api", cartRoutes);
app.use("/api", biobankRoutes);
app.use("/api/biobanksampledispatch", biobanksampledispacthRoutes);

app.use("/api/ethnicity", ethnictiyRoutes);
app.use("/api/samplecondition", sampleconditionRoutes);
app.use("/api/storagetemperature", storagetemperatureRoutes);
app.use("/api/quantityunit", quantityunitRoutes);
app.use("/api/sampletypematrix", sampletypematrixRoutes);
app.use("/api/testkitmanufacturer", testkitmanufacturerRoutes);
app.use("/api/testmethod", testmethodRoutes);
app.use("/api/testresultunit", testresultunitRoutes);
app.use("/api/testsystem", testsystemRoutes);
app.use("/api/testsystemmanufacturer", testsystemmanufecturerRoutes);
app.use("/api/concurrentmedicalconditions", concurrentmedicalconditionsRoutes);
app.use("/api/containertype",containertypeRoutes)

// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
});
