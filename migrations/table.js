const mysqlConnection = require("../config/db");
const committememberModel = require("../models/committeememberModel");
const sampledispatchModel = require("../models/sampledispatchModel");
const samplereceiveModel = require("../models/samplereceiveModel")
const sampleModel = require("../models/sampleModel");
const signupModel = require("../models/registrationModel");

const wishlistModel = require("../models/wishlistModel");
const cartModel = require("../models/cartModel");
const cityModel = require("../models/cityModel");
const countryModel = require("../models/countryModel");
const districtModel = require("../models/districtModel");
const newtablefieldModel = require("../models/newtablefieldModel")


// const newtablefieldsModel = require("../models/newtablefieldsModel");
const sample_approvalModel = require("../models/sampleapprovalModel")
const paymentModel = require('../models/paymentModals')
const samplefieldsModel = require('../models/samplefieldsModel')
const historyModel = require("../models/historyModel");
const contactusModel = require("../models/contactusModel");
const committeesampleapprovalModel = require("../models/committeesampleapproval")
// Function to initialize all tables
function Database() {


  cityModel.createCityTable();
  historyModel.registrationadmin_history();
  countryModel.createCountryTable();
  districtModel.createDistrictTable();
  signupModel.create_collectionsiteTable();
  signupModel.create_biobankTable();
  signupModel.create_organizationTable();
  signupModel.create_researcherTable();
  signupModel.create_orderpackager();
  signupModel.createuser_accountTable();
  committememberModel.createCommitteeMemberTable();
  sampledispatchModel.createSampleDispatchTable();
  samplereceiveModel.createSampleReceiveTable();
  sampleModel.createSampleTable();
  //wishlistModel.createWishlistTable();
  cartModel.createCartTable();
  paymentModel.createPaymentTable();
  sample_approvalModel.createSampleApprovalTable();
  sample_approvalModel.createSampleDocumentTable();
  committeesampleapprovalModel.createcommitteesampleapprovalTable();
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
  historyModel.registrationadmin_history();
  historyModel.create_historyTable();
  historyModel.create_samplehistoryTable();
  contactusModel.createContactUsTable();
  newtablefieldModel.createOrUpdateTables();
}
Database();