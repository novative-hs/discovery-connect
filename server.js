// server.js
require("dotenv").config(); //load the env variable
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import CORS
const app = express();
const port = process.env.PORT || 5000;
// const helmet = require("helmet");
// const compression = require("compression");

// app.use(helmet());         // 🔐 Security headers
// app.use(compression()); 


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
// Middleware to parse JSON

app.use(express.urlencoded({ extended: true }));
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
const CSRRoutes = require("./routes/CSRRoutes")
const {
  fetchProducts,
  getProductById,
} = require("./controller/productController");
const biobankRoutes = require("./routes/biobankRoutes");
const samplefieldsRoutes = require("./routes/samplefieldsRoutes");
const historyRoutes = require("./routes/historyRoutes");
const contactusRoutes = require("./routes/contactusRoutes");
const committeesampleapproval = require("./routes/committeesampleapprovalRoutes")
const collectionsiteStaffRoutes = require("./routes/collectionsitestaffRoutes")
const samplereturnRoutes = require("./routes/samplereturnRoutes")


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
app.use("/api/committeesampleapproval", committeesampleapproval);
app.use("/api/payment", paymentRoutes);
app.use("/api/sampledispatch", sampleDispatchRoutes);
app.use("/api/samplereceive", sampleReceiveRoutes);
app.use("/api/admin/collectionsitestaff", collectionsiteStaffRoutes)
app.use("/api/admin/collectionsite", collectionSiteRoutes);
app.use("/api/admin/organization", organizationRoutes);
app.use('/api', cartRoutes);
app.use("/api", cartRoutes);
app.use("/api", biobankRoutes);
app.use("/api/samplereturn", samplereturnRoutes)
app.use("/api/samplefields", samplefieldsRoutes);
app.use("/api", contactusRoutes);
app.use("/api/admin/csr", CSRRoutes);

// Start the server
app.listen(5000, () => {
  console.log("Server running on port 5000");
})