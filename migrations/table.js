const mysqlConnection = require("../config/db");
const committememberModel = require("../models/committeememberModel");
const sampledispatchModel = require("../models/sampledispatchModel");
const samplereceiveModel = require("../models/samplereceiveModel")
const sampleModel = require("../models/sampleModel");
const signupModel = require("../models/registrationModel");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const cartModel = require("../models/cartModel");
const cityModel = require("../models/cityModel");
const countryModel = require("../models/countryModel");
const districtModel = require("../models/districtModel");
// const newtablefieldsModel = require("../models/newtablefieldsModel");

const sample_approvalModel = require("../models/sampleapprovalModel")
const paymentModel = require('../models/paymentModals')


const samplefieldsModel = require('../models/samplefieldsModel')
const historyModel = require("../models/historyModel");
// Function to initialize all tables
function Database() {

  cityModel.createCityTable();
  historyModel.RegistrationAdmin_History();
  countryModel.createCountryTable();
  districtModel.createDistrictTable();
  signupModel.create_collectionsiteTable();
  signupModel.create_biobankTable();
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
  sample_approvalModel.createSampleApprovalTable();
  paymentModel.createPaymentTable();
  samplefieldsModel.createEthnicityTable();
  samplefieldsModel.createSampleConditionTable();
  samplefieldsModel.createStorageTemperatureTable();
  samplefieldsModel.createContainerTypeTable()
  samplefieldsModel.createQuantityUnitTable();
  samplefieldsModel.createSampleTypeMatrixTable();
  samplefieldsModel.createTestMethodTable()
  samplefieldsModel.createTestResultUnitTable();
  samplefieldsModel.createTestSystemTable();
  samplefieldsModel.createTestSystemManufacturerTable();
  samplefieldsModel.createTestKitManufacturerTable();
  samplefieldsModel.createConcurrentMedicalConditionsTable();
 historyModel.RegistrationAdmin_History();
  historyModel.create_historyTable();
 historyModel.create_samplehistoryTable();

  // newtablefieldModel.createOrUpdateTables();

}
Database();