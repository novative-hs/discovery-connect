const mysqlConnection = require("../config/db");
const committememberModel = require("../models/committeememberModel");
const sampledispatchModel = require("../models/sampledispatchModel");
const samplereceiveModel=require("../models/samplereceiveModel")
const sampleModel = require("../models/sampleModel");
const signupModel = require("../models/registrationModel");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const cartModel = require("../models/cartModel");
const cityModel = require("../models/cityModel");
const historyModel = require("../models/historyModel");
const countryModel = require("../models/countryModel");
const districtModel = require("../models/districtModel");

// Function to initialize all tables
function Database() {
  cityModel.createCityTable();
  historyModel.RegistrationAdmin_History();
  countryModel.createCountryTable();
  districtModel.createDistrictTable();
  signupModel.create_collectionsiteTable();
  signupModel.create_organizationTable();
  signupModel.create_researcherTable();
  signupModel.createuser_accountTable();
  committememberModel.createCommitteeMemberTable();
  sampledispatchModel.createSampleDispatchTable();
  samplereceiveModel.createSampleReceiveTable();
  sampleModel.createSampleTable();
  productModel.createProductsTable();
  wishlistModel.createWishlistTable();
  cartModel.createCartTable();
 
}
Database();