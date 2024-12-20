const mysqlConnection = require("../config/db");
const collectionsiteModel = require("../models/collectionsiteModel");
const committememberModel = require("../models/committeememberModel");
const organizationModel = require("../models/organizationModel");
const researcherModel = require("../models/researcherModel");
const sampledispatchModel = require("../models/sampledispatchModel");
const sampleModel = require("../models/sampleModel");
const signupModel = require("../models/signupModel");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const cartModel = require("../models/cartModel");


// Function to initialize all tables
function Database() {
  signupModel.createUserAccountTable();
  collectionsiteModel.createCollectionSiteTable();
  committememberModel.createCommitteeMemberTable();
  organizationModel.createOrganizationTable();
  researcherModel.createResearcherTable();
  sampledispatchModel.createSampleDispatchTable();
  sampleModel.createSampleTable();
  productModel.createProductsTable();
  wishlistModel.createWishlistTable();
  cartModel.createCartTable();
 
}
Database();
